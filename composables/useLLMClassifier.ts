import { useTransactionStore } from '~/stores/transaction'

export interface LLMClassifierResult {
  type: 'income' | 'expense';
  categoryId: string;
  confidence: number;
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
    
    return `你是交易分類專家，專精於判斷交易是「支出」還是「收入」，並精確匹配到正確類別。

## 分類任務
輸入: "${inputText}"

## 支出類別清單
${expenseCategories}

## 收入類別清單  
${incomeCategories}

## 分類方法
1. 先判斷是支出還是收入
2. 再從對應類別中選擇最匹配的ID
3. 評估分類確信度

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
只回傳JSON，無其他文字:
{
  "type": "expense" 或 "income",
  "categoryId": "必須是上述ID之一", 
  "confidence": 0-100整數,
  "description": "簡潔描述，格式: 主體 金額元",
  "explanation": "分類理由"
}

## 分類範例
"星巴克咖啡85元" → type: "expense", categoryId: "food"
"公司發薪35000" → type: "income", categoryId: "salary"  
"捷運卡儲值500" → type: "expense", categoryId: "transport"
"股票獲利8000" → type: "income", categoryId: "investment"`
  }

  /**
   * Enhanced LLM Classification focused on category accuracy
   */
  const classifyWithLLM = async (description: string): Promise<LLMClassifierResult> => {
    if (!description || !description.trim()) {
      return createFallbackResult('', '未提供交易描述');
    }
    
    // Input preprocessing
    const preprocessedInput = preprocessInput(description);
    
    try {
      const prompt = buildClassificationPrompt(preprocessedInput);
      const config = useRuntimeConfig()
      
      // Optimized API configuration for classification accuracy
      const apiConfig = {
        model: "gpt-4-turbo-preview", 
        messages: [
          { 
            role: "system", 
            content: "你是交易分類AI，專精於判斷中文交易描述的收支類型和類別歸屬。回傳精確的JSON分類結果。" 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Low temperature for consistent classification
        max_tokens: 200,   // Reduced for focused output
        response_format: { type: "json_object" }
      };
      
      // Retry mechanism with exponential backoff
      const maxRetries = 3;
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Advanced API configuration
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.public.openaiApiKey}`
          };
          
          // Add optional organization header
          if (config.public.openaiOrgId && typeof config.public.openaiOrgId === 'string') {
            headers['OpenAI-Organization'] = config.public.openaiOrgId;
          }
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(apiConfig)
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Handle specific error types
            if (response.status === 429) {
              // Rate limit - wait before retry
              if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                continue;
              }
            }
            
            if (response.status === 401) {
              throw new Error('API金鑰無效或已過期');
            }
            
            throw new Error(`API請求失敗: ${response.status} - ${errorData.error?.message || response.statusText}`);
          }
          
          const data = await response.json();
          
          if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('API回應格式異常');
          }
          
          // Enhanced JSON parsing with validation
          const result = parseAndValidateResult(data.choices[0].message.content, preprocessedInput);
          
          // Success - log classification result
          console.log(`✅ Classification Success (attempt ${attempt}):`, {
            input: preprocessedInput,
            type: result.type,
            category: result.categoryId,
            confidence: result.confidence
          });
          
          return result;
          
        } catch (error: any) {
          lastError = error;
          console.warn(`⚠️ Classification attempt ${attempt} failed:`, error.message);
          
          // If not a retryable error, break immediately
          if (!isRetryableError(error)) {
            break;
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
          }
        }
      }
      
      // All retries failed
      console.error('❌ Classification failed after all attempts:', lastError);
      return createFallbackResult(preprocessedInput, `分類失敗: ${lastError?.message || '未知錯誤'}`);
      
    } catch (error: any) {
      console.error('❌ Classification system error:', error);
      return createFallbackResult(preprocessedInput, `系統錯誤: ${error?.message || '未知錯誤'}`);
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
  const parseAndValidateResult = (content: string, originalInput: string): LLMClassifierResult => {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('回應中未找到有效JSON');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Comprehensive validation
      const validationErrors: string[] = [];
      
      if (!parsed.type || !['expense', 'income'].includes(parsed.type)) {
        validationErrors.push('交易類型無效');
      }
      
      const validCategories = store.categories.filter(c => c.type === parsed.type);
      if (!parsed.categoryId || !validCategories.some(c => c.id === parsed.categoryId)) {
        validationErrors.push('類別ID無效');
      }
      
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
        validationErrors.push('信心度數值無效');
      }
      
      if (!parsed.description || typeof parsed.description !== 'string') {
        validationErrors.push('描述格式無效');
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`數據驗證失敗: ${validationErrors.join(', ')}`);
      }
      
      // Return validated result
      return {
        type: parsed.type,
        categoryId: parsed.categoryId,
        confidence: Math.round(parsed.confidence),
        description: parsed.description.trim(),
        explanation: parsed.explanation || '由AI智能分析完成'
      };
      
    } catch (error: any) {
      console.error('JSON解析失敗:', error.message, 'Content:', content);
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
      confidence: bestMatch.confidence,
      description: description || '未知交易',
      explanation: `AI分析失敗，使用關鍵字匹配: ${errorContext || '自動分類'}`,
      errorMessage: errorContext
    };
  };
  
  return {
    classifyWithLLM,
    buildClassificationPrompt, // Export for testing purposes
    
    // Batch classification for multiple transactions
    classifyBatch: async (descriptions: string[], options?: ClassificationOptions): Promise<LLMClassifierResult[]> => {
      const results: LLMClassifierResult[] = [];
      const startTime = Date.now();
      
      for (const desc of descriptions) {
        const result = await classifyWithLLM(desc);
        results.push(result);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Batch classification completed: ${descriptions.length} items in ${Date.now() - startTime}ms`);
      return results;
    },
    
    // Get classification statistics
    getClassificationStats: () => {
      const categories = store.categories;
      return {
        totalCategories: categories.length,
        expenseCategories: categories.filter(c => c.type === 'expense').length,
        incomeCategories: categories.filter(c => c.type === 'income').length,
        availableCategories: categories.map(c => ({ id: c.id, name: c.name, type: c.type }))
      };
    },
    
    // Validate input before classification
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
    }
  };
}