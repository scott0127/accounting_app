import { useTransactionStore } from '~/stores/transaction'
import { parseGeminiResponse } from '~/utils/geminiParser'

export interface LLMClassifierResult {
  type: 'income' | 'expense';
  /** 主類別（與 categoryIds[0] 一致，保留相容性） */
  categoryId: string;
  /** 最多 3 個類別，依優先順序排列（主→次→輔） */
  categoryIds?: string[];
  confidence: number;
  /** 可選：各類別對應的置信度，順序與 categoryIds 對應 */
  confidences?: number[];
  description: string;
  explanation: string;
  errorMessage?: string;
  metadata?: {
    processingTime?: number;
    apiAttempts?: number;
    fallbackUsed?: boolean;
    confidenceFactors?: string[];
  };
}

export interface ClassificationOptions {
  enableFallback?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
  includeMetadata?: boolean;
}

/**
 * 🎯 Focused LLM Transaction Classifier
 * 
 * Core Mission: Precise income/expense detection and accurate category classification
 * 
 * Key Features:
 * 🔍 Smart Income/Expense Detection - Advanced keyword analysis for transaction type
 * 📂 Precise Category Matching - Context-aware mapping to correct categories  
 * ⚡ Optimized Classification - Streamlined prompts for better accuracy
 * 🛡️ Robust Error Handling - Fallback mechanisms and retry logic
 * 
 * @example
 * ```typescript
 * const { classifyWithLLM } = useLLMClassifier()
 * const result = await classifyWithLLM("星巴克咖啡 120元")
 * // Returns: { type: "expense", categoryId: "food", confidence: 95, ... }
 * ```
 */
export function useLLMClassifier() {
  const store = useTransactionStore()
  
  /**
   * Focused Classification Prompt - Optimized for Category Accuracy
   * Core Focus: Precise income/expense detection and category matching
   */
  const buildClassificationPrompt = (inputText: string): string => {
    const expenseCategories = store.categories
      .filter(c => c.type === 'expense')
      .map(c => `${c.id}: ${c.name}`)
      .join('\n')
    const incomeCategories = store.categories
      .filter(c => c.type === 'income')
      .map(c => `${c.id}: ${c.name}`)
      .join('\n')
    
    return `你是交易分類專家，專精於判斷交易是「支出」還是「收入」，並精準匹配到正確類別（支援最多 3 個類別，以主→次→輔順序）。

## 分類任務
輸入: "${inputText}"

## 支出類別清單
${expenseCategories}

## 收入類別清單  
${incomeCategories}

## 分類方法
1. 先判斷是支出還是收入（不可混用）
2. 從對應類別中選出最匹配的 1~3 個 ID（主→次→輔，最多 3 個）
3. 請確保所有選擇的類別皆屬於相同的 type（income 或 expense）
4. 回傳整體信心分數，並（可選）回傳各類別對應的信心分數陣列

## 關鍵分類規則
**支出判斷標準:**
- 購買、消費、花費、付款、支付
- 店家名稱、商品服務
- "買了"、"花了"、"付了"

**收入判斷標準:**  
- 薪水、獎金、收到、入帳、賺到
- 工作、兼職、投資、退款
- "收入"、"領到"、"發放"

**類別匹配邏輯:**
- food: 餐廳、小吃、飲料、食物、用餐
- transport: 捷運、公車、計程車、加油、停車
- shopping: 購物、衣服、日用品、網購、百貨
- entertainment: 電影、遊戲、KTV、旅遊、娛樂、玩具、嗜好
- healthcare: 醫院、藥局、看醫生、健檢、保健
- education: 學費、課程、補習、書籍、學習
- utilities: 水電、瓦斯、網路、電話、房租
- salary: 薪水、月薪、工資、本薪
- bonus: 獎金、年終、紅利、提成
- investment: 股票、基金、理財、投資收益

## 輸出格式
只回傳純JSON，不要markdown格式包裝，不要加任何其他文字:
{
  "type": "expense" | "income",
  "categoryIds": ["主類別ID", "次類別ID", "輔類別ID"], // 1~3 個，主類別排第一
  "categoryId": "主類別ID", // 與 categoryIds[0] 相同，提供相容性
  "confidence": 0-100整數, // 整體信心
  "confidences": [95, 70, 55], // 可選：與 categoryIds 順序對應
  "description": "簡潔描述，格式: 主體 金額元",
  "explanation": "分類理由"
}

## 分類範例
"星巴克咖啡85元" → type: "expense", categoryIds: ["food"], categoryId: "food"
"午餐麥當勞外送+加價購飲料" → type: "expense", categoryIds: ["food", "shopping"], categoryId: "food"
"公司發薪35000" → type: "income", categoryIds: ["salary"], categoryId: "salary"
"股票獲利8000" → type: "income", categoryIds: ["investment"], categoryId: "investment"`
  }

  /**
   * 🚀 Enhanced LLM Classification with Streaming Support
   * Features: Progressive loading, streaming responses, immediate feedback
   */
  const classifyWithLLM = async (
    description: string,
    options?: {
      enableStreaming?: boolean;
      onProgress?: (stage: string, progress: number) => void;
      onIntermediateResult?: (result: Partial<LLMClassifierResult>) => void;
    }
  ): Promise<LLMClassifierResult> => {
    const { enableStreaming = false, onProgress, onIntermediateResult } = options || {}

    if (!description || !description.trim()) {
      return createFallbackResult('', '未提供交易描述')
    }

    const fallbackResult = createFallbackResult(description)
    onIntermediateResult?.(fallbackResult)
    onProgress?.('正在準備分析...', 10)

    const preprocessedInput = preprocessInput(description)
    onProgress?.('正在處理輸入...', 20)

    const runtimeConfig = useRuntimeConfig()
    const apiKey = runtimeConfig.public.geminiApiKey
    if (!apiKey) {
      onProgress?.('缺少 Gemini API Key，使用備援分類', 100)
      const fallback = createFallbackResult(preprocessedInput, '缺少 Gemini API Key')
      fallback.metadata = { fallbackUsed: true }
      return fallback
    }

    try {
      const prompt = buildClassificationPrompt(preprocessedInput)
      onProgress?.('正在連接 AI 服務...', 30)

      const startTime = Date.now()
      const generationConfig = { temperature: 0.1, maxOutputTokens: 1024 }
      const model = 'gemini-flash-latest'
      const resolvedApiKey = apiKey as string

      let result: LLMClassifierResult
      if (enableStreaming) {
        result = await handleStreamingClassification({
          prompt,
          model,
          apiKey: resolvedApiKey,
          input: preprocessedInput,
          generationConfig,
          onProgress,
          onIntermediateResult
        })
      } else {
        result = await handleStandardClassification({
          prompt,
          model,
          apiKey: resolvedApiKey,
          input: preprocessedInput,
          generationConfig,
          onProgress
        })
      }

      const processingTime = Date.now() - startTime
      result.metadata = {
        ...result.metadata,
        processingTime,
        fallbackUsed: false
      }

      onProgress?.('分析完成', 100)
      console.log(`✅ Gemini Classification completed in ${processingTime}ms`)
      return result
    } catch (error: any) {
      console.error('❌ Gemini classification failed:', error)
      console.error('❌ Full error details:', {
        message: error.message,
        stack: error.stack,
        preprocessedInput
      })
      onProgress?.('分析失敗，使用備用分類', 100)

      const errorResult = createFallbackResult(preprocessedInput, `LLM分析失敗: ${error?.message || '未知錯誤'}`)
      errorResult.metadata = { fallbackUsed: true, processingTime: Date.now() }
      return errorResult
    }
  }

  /**
   * 🌊 處理流式分類響應
   */
  const handleStreamingClassification = async ({
    prompt,
    model,
    apiKey,
    input,
    generationConfig,
    onProgress,
    onIntermediateResult
  }: {
    prompt: string
    model: string
    apiKey: string
    input: string
    generationConfig: { temperature: number; maxOutputTokens: number }
    onProgress?: (stage: string, progress: number) => void
    onIntermediateResult?: (result: Partial<LLMClassifierResult>) => void
  }): Promise<LLMClassifierResult> => {
    onProgress?.('開始流式分析...', 40)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: '你是快速交易分類AI。請分析並回傳純JSON格式，不要用markdown包裝，不要加任何額外文字。' }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig
        })
      }
    )

    if (!response.ok) {
      throw new Error(`API請求失敗: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('無法建立串流讀取器')
    }

    const decoder = new TextDecoder()
    let accumulatedContent = ''
    let progress = 50

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line.startsWith('data:')) continue

          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') {
            progress = Math.min(progress + 5, 90)
            onProgress?.('正在完成分析...', progress)
            continue
          }

          try {
            const parsed = JSON.parse(data)
            const parts = parsed.candidates?.[0]?.content?.parts || []
            const textChunk = parts.map((part: any) => part?.text || '').join('')

            if (textChunk) {
              accumulatedContent += textChunk
              progress = Math.min(progress + 5, 85)
              onProgress?.('正在接收分析結果...', progress)

              const partialResult = tryParsePartialResult(accumulatedContent)
              if (partialResult) {
                onIntermediateResult?.(partialResult)
              }
            }
          } catch {
            // 忽略 JSON 解析錯誤，繼續處理
          }
        }
      }

      onProgress?.('正在驗證結果...', 95)
      
      // 使用新的解析工具處理最終結果
      try {
        const mockResponse = {
          candidates: [{ content: { parts: [{ text: accumulatedContent }] } }]
        }
        const finalResult = parseGeminiResponse<any>(mockResponse)
        return parseAndValidateResult(finalResult, input)
      } catch (parseError) {
        console.error('❌ Final stream parse failed, using raw content:', parseError)
        return parseAndValidateResult(accumulatedContent, input)
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 📋 處理標準分類響應（優化版）
   */
  const handleStandardClassification = async ({
    prompt,
    model,
    apiKey,
    input,
    generationConfig,
    onProgress
  }: {
    prompt: string
    model: string
    apiKey: string
    input: string
    generationConfig: { temperature: number; maxOutputTokens: number }
    onProgress?: (stage: string, progress: number) => void
  }): Promise<LLMClassifierResult> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('請求超時')), 8000)
    )

    const requestPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: '你是快速交易分類AI。請分析並回傳純JSON格式，不要用markdown包裝，不要加任何額外文字。' }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig
        })
      }
    )

    onProgress?.('正在等待AI響應...', 50)

    const response = await Promise.race([requestPromise, timeoutPromise])

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API請求失敗: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    onProgress?.('正在處理響應...', 80)
    const data = await response.json()

    // 使用新的解析工具直接解析
    const parsedResult = parseGeminiResponse<any>(data)
    console.log('✅ Parsed Gemini response:', parsedResult)
    
    // 直接驗證解析後的物件，不再進行額外的JSON字符串化
    return parseAndValidateResult(parsedResult, input)
  }

  /**
   * 🔍 嘗試解析部分結果（用於流式響應）
   */
  const tryParsePartialResult = (content: string): Partial<LLMClassifierResult> | null => {
    try {
      // 使用新的解析工具，但允許部分失败
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: content }] } }]
      }
      
      let parsed: any
      try {
        parsed = parseGeminiResponse<any>(mockResponse)
      } catch {
        // 如果新解析器失敗，退回到簡單解析
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return null
        parsed = JSON.parse(jsonMatch[0].trim())
      }
      
      // 只返回已確定的部分
      const partial: Partial<LLMClassifierResult> = {};
      
      if (parsed.type && ['expense', 'income'].includes(parsed.type)) {
        partial.type = parsed.type;
      }
      if (Array.isArray(parsed.categoryIds)) {
        const ids = parsed.categoryIds.filter((x: any) => typeof x === 'string')
        if (ids.length) {
          partial.categoryIds = ids.slice(0, 3)
          partial.categoryId = ids[0]
        }
      } else if (parsed.categoryId && typeof parsed.categoryId === 'string') {
        partial.categoryId = parsed.categoryId;
        partial.categoryIds = [parsed.categoryId]
      }
      
      if (typeof parsed.confidence === 'number') {
        partial.confidence = Math.round(parsed.confidence);
      }
      
      return Object.keys(partial).length > 0 ? partial : null;
    } catch {
      return null;
    }
  };
  
  /**
   * Input preprocessing for better classification
   */
  const preprocessInput = (input: string): string => {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-$￥¥.,]/g, '') // Remove special chars except currency
      .substring(0, 200); // Limit length
  };
  
  /**
   * Enhanced JSON parsing with comprehensive validation
   */
  const parseAndValidateResult = (parsed: any, originalInput: string): LLMClassifierResult => {
    try {
      console.log('🔍 Validating parsed content:', parsed)
      
      // 如果輸入是字符串，則解析它；否則直接使用物件
      const content = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
      
      // Comprehensive validation
      const validationErrors: string[] = [];
      
      if (!content.type || !['expense', 'income'].includes(content.type)) {
        validationErrors.push('交易類型無效');
      }
      
      const validCategories = store.categories.filter(c => c.type === content.type);
      const validIds = new Set(validCategories.map(c => c.id))

      let categoryIds: string[] = []
      if (Array.isArray(content.categoryIds)) {
        categoryIds = content.categoryIds.filter((id: any) => typeof id === 'string' && validIds.has(id))
      }

      // 後相容：若只回傳 categoryId，仍然接受
      if ((!categoryIds || categoryIds.length === 0) && typeof content.categoryId === 'string' && validIds.has(content.categoryId)) {
        categoryIds = [content.categoryId]
      }
      if (!categoryIds || categoryIds.length === 0) {
        validationErrors.push('類別ID無效');
      }
      
      if (typeof content.confidence !== 'number' || content.confidence < 0 || content.confidence > 100) {
        validationErrors.push('信心度數值無效');
      }
      
      if (!content.description || typeof content.description !== 'string') {
        validationErrors.push('描述格式無效');
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`數據驗證失敗: ${validationErrors.join(', ')}`);
      }
      
      // Return validated result
      const result: LLMClassifierResult = {
        type: content.type,
        categoryId: categoryIds[0],
        categoryIds,
        confidence: Math.round(content.confidence),
        description: String(content.description || originalInput).trim(),
        explanation: content.explanation || '由AI智能分析完成'
      }
      if (Array.isArray(content.confidences)) {
        const cs = content.confidences.filter((n: any) => typeof n === 'number').map((n: number) => Math.round(n))
        if (cs.length) result.confidences = cs.slice(0, result.categoryIds?.length || 3)
      }
      return result;
      
    } catch (error: any) {
      console.error('JSON解析失敗:', error.message, 'Content:', parsed);
      throw new Error(`結果解析失敗: ${error.message}`);
    }
  };
  
  /**
   * Determine if an error is retryable
   */
  const isRetryableError = (error: any): boolean => {
    const retryableErrors = [
      'fetch', 'network', 'timeout', '429', '500', '502', '503', '504'
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  };
  
  /**
   * Smart fallback classification with keyword-based category detection
   */
  const createFallbackResult = (description: string, errorContext?: string): LLMClassifierResult => {
    const lowerDesc = description.toLowerCase();
    
    // Smart category detection based on keywords
    let bestMatch = { category: store.categories.find(c => c.type === 'expense'), confidence: 25 };
    
    // Income keywords
    const incomeKeywords = ['薪', '薪水', '薪資', '收入', '入帳', '獎金', '紅利', '股息', '投資', '收到'];
    if (incomeKeywords.some(keyword => lowerDesc.includes(keyword))) {
      bestMatch = {
        category: store.categories.find(c => c.type === 'income') || 
                 store.categories.find(c => c.id === 'salary'),
        confidence: 60
      };
    }
    
    // Expense category keywords
    const categoryKeywords = {
      food: ['吃', '喝', '餐', '食', '咖啡', '茶', '麥當勞', '星巴克', '便當', '小吃'],
      transport: ['交通', '車', '公車', '捷運', '計程車', '油', '停車', 'uber'],
      shopping: ['買', '購', '衣', '鞋', '包', '化妝', '網購', '蝦皮', '淘寶'],
      entertainment: ['電影', '遊戲', 'ktv', '旅遊', '娛樂', '音樂', '書'],
      healthcare: ['醫', '藥', '健康', '看病', '牙醫', '眼科', '診所'],
      utilities: ['水', '電', '瓦斯', '網路', '電話', '房租', '租金']
    };
    
    // Find best matching expense category
    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        const category = store.categories.find(c => c.id === categoryId);
        if (category) {
          bestMatch = { category, confidence: 70 };
          break;
        }
      }
    }
    
    // Final fallback
    const finalCategory = bestMatch.category || 
                         store.categories.find(c => c.type === 'expense') || 
                         store.categories[0] || 
                         { id: 'other', type: 'expense', name: '其他' };
    
  return {
      type: finalCategory.type as 'expense' | 'income',
      categoryId: finalCategory.id,
      categoryIds: [finalCategory.id],
      confidence: bestMatch.confidence,
      description: description || '未知交易',
      explanation: `AI分析失敗，使用關鍵字匹配: ${errorContext || '自動分類'}`,
      errorMessage: errorContext
    };
  };
  
  return {
    // 🚀 主要分類方法
    classifyWithLLM,
    
    // ⚡ 快速分類（無流式響應，最快速度）
    classifyFast: async (description: string): Promise<LLMClassifierResult> => {
      return classifyWithLLM(description, { enableStreaming: false });
    },
    
    // 🌊 流式分類（更好的用戶體驗）
    classifyStreaming: async (
      description: string, 
      callbacks: {
        onProgress: (stage: string, progress: number) => void;
        onIntermediateResult: (result: Partial<LLMClassifierResult>) => void;
      }
    ): Promise<LLMClassifierResult> => {
      return classifyWithLLM(description, {
        enableStreaming: true,
        onProgress: callbacks.onProgress,
        onIntermediateResult: callbacks.onIntermediateResult
      });
    },
    
    // 🎯 智能分類（自動選擇最佳方法）
    classifyIntelligent: async (
      description: string,
      options?: {
        preferSpeed?: boolean; // 優先速度還是體驗
        onProgress?: (stage: string, progress: number) => void;
        onIntermediateResult?: (result: Partial<LLMClassifierResult>) => void;
      }
    ): Promise<LLMClassifierResult> => {
      const { preferSpeed = false } = options || {};
      
      // 短描述使用快速模式，長描述使用流式模式
      const useStreaming = !preferSpeed && description.length > 20;
      
      return classifyWithLLM(description, {
        enableStreaming: useStreaming,
        onProgress: options?.onProgress,
        onIntermediateResult: options?.onIntermediateResult
      });
    },
    
    // Export for testing purposes
    buildClassificationPrompt,
    
    // 批量分類（進階功能）
    classifyBatch: async (descriptions: string[], options?: ClassificationOptions): Promise<LLMClassifierResult[]> => {
      const results: LLMClassifierResult[] = [];
      const startTime = Date.now();
      
      // 並行處理小批量，避免 API 限制
      const batchSize = 3;
      for (let i = 0; i < descriptions.length; i += batchSize) {
        const batch = descriptions.slice(i, i + batchSize);
        
        const batchPromises = batch.map(desc => 
          classifyWithLLM(desc, { enableStreaming: false })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // 批次間延遲
        if (i + batchSize < descriptions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`✅ Batch classification completed: ${descriptions.length} items in ${Date.now() - startTime}ms`);
      return results;
    },
    
    // 並行分類（最快但消耗更多 API 配額）
    classifyParallel: async (descriptions: string[], maxConcurrent = 5): Promise<LLMClassifierResult[]> => {
      const results: LLMClassifierResult[] = [];
      
      for (let i = 0; i < descriptions.length; i += maxConcurrent) {
        const batch = descriptions.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(desc => classifyWithLLM(desc));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return results;
    },
    
    // 獲取分類統計
    getClassificationStats: () => {
      const categories = store.categories;
      return {
        totalCategories: categories.length,
        expenseCategories: categories.filter(c => c.type === 'expense').length,
        incomeCategories: categories.filter(c => c.type === 'income').length,
        availableCategories: categories.map(c => ({ id: c.id, name: c.name, type: c.type }))
      };
    },
    
    // 驗證輸入
    validateInput: (input: string): { isValid: boolean; issues: string[] } => {
      const issues: string[] = [];
      
      if (!input || !input.trim()) {
        issues.push('輸入為空');
      }
      
      if (input.length > 200) {
        issues.push('輸入過長（超過200字符）');
      }
      
      if (!/[\u4e00-\u9fa5]/.test(input) && !/[a-zA-Z]/.test(input)) {
        issues.push('缺少有效的文字內容');
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    },
    
    // 🔧 工具方法
    utils: {
      preprocessInput,
      createFallbackResult,
      tryParsePartialResult
    }
  };
}