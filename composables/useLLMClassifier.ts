import { useTransactionStore } from '~/stores/transaction'

export interface LLMClassifierResult {
  type: 'income' | 'expense';
  categoryId: string;
  confidence: number;
  description: string;
  explanation: string;
  errorMessage?: string;
}

/**
 * A composable function that provides LLM-powered transaction classification
 */
export function useLLMClassifier() {
  const store = useTransactionStore()
  
  /**
   * Structure the prompt to get consistent responses
   */
  const buildClassificationPrompt = (inputText: string): string => {
    const expenseCategories = store.categories
      .filter(c => c.type === 'expense')
      .map(c => `支出 - ${c.id}: ${c.name}`)
      .join('\n')
    const incomeCategories = store.categories
      .filter(c => c.type === 'income')
      .map(c => `收入 - ${c.id}: ${c.name}`)
      .join('\n')
    
    return `你是一個財務記帳AI，請分析以下描述是支出還是收入，並從相應的「可用類別」中選出最適合的 categoryId，同時產生一則「備註」：

描述: "${inputText}"

可用類別(僅限以下選項):
${expenseCategories}
${incomeCategories}

請只回傳下列JSON格式（不要有多餘文字）：
{
  "type": "expense"或"income"(支出或收入),
  "categoryId": "必須是以上類別清單中的ID",
  "confidence": 數字(0-100表示確信度),
  "description": "備註，必須同時包含行為相關詞（如：午餐、薪資、購物等）和主體關鍵字（如品牌、公司、商品名）+金額，不要動詞、形容詞、無關詞語",
  "explanation": "選擇該類別與類型的理由"
}

備註規則：
1. description 必須簡短明確，且同時包含行為相關詞與主體關鍵字+金額
2. 若描述有多個重點，只取最主要的
3. 禁止出現動詞、形容詞、無關詞語
4. 若有品牌名稱，請自動修正為正確拼寫（如三猩→三星、蘋果→Apple）
5. 金額必須與描述一致
6. type必須為"expense"或"income"
7. categoryId必須為列表中的ID
8. 嚴格只回傳JSON，不要有多餘說明

範例：
"今天發薪水入帳32000元"
→ type: "income", description: "薪資 公司 32000元"
"三猩手機維修2500元"
→ type: "expense", description: "維修 三星 2500元"`;
  }

  /**
   * Use OpenAI API to classify a transaction description
   */
  const classifyWithLLM = async (description: string): Promise<LLMClassifierResult> => {
    if (!description || !description.trim()) {
      return { 
        type: 'expense',
        categoryId: 'food',
        confidence: 0,
        description: '',
        explanation: '未提供描述'
      };
    }
    
    try {
      const prompt = buildClassificationPrompt(description);
      const config = useRuntimeConfig()
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "你是一個協助分類財務記錄的智能助手。" },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = `API請求失敗: ${response.status} - ${errorData.error?.message || response.statusText}`;
        console.error('OpenAI API Error:', msg);
        return {
          ...createFallbackResult(description),
          errorMessage: msg
        };
      }
      
      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        const msg = 'API回應格式錯誤';
        console.error(msg, data);
        return {
          ...createFallbackResult(description),
          errorMessage: msg
        };
      }
      
      const content = data.choices[0].message.content;
      
      try {
        // 只取出第一個 { 到最後一個 } 之間的內容
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        const result = JSON.parse(jsonString);
        
        // 驗證結果
        if (!result.type || !['expense', 'income'].includes(result.type)) {
          throw new Error('Invalid transaction type');
        }
        
        const validCategories = store.categories.filter(c => c.type === result.type);
        if (!result.categoryId || !validCategories.some(c => c.id === result.categoryId)) {
          throw new Error('Invalid category ID');
        }
        
        return {
          type: result.type,
          categoryId: result.categoryId,
          confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
          description: result.description || description,
          explanation: result.explanation || '由AI智能分析'
        };
      } catch (parseError) {
        const msg = 'AI回傳內容解析失敗';
        console.error(msg, parseError);
        return {
          ...createFallbackResult(description),
          errorMessage: msg
        };
      }
    } catch (error: any) {
      const msg = error?.message || 'LLM classification error';
      console.error('LLM classification error:', error);
      return {
        ...createFallbackResult(description),
        errorMessage: msg
      };
    }
  };
  
  /**
   * Create a fallback classification when API fails
   */
  const createFallbackResult = (description: string): LLMClassifierResult => {
    const defaultCategory = store.categories.find(c => c.type === 'expense' && c.id === 'food') || 
                          store.categories.find(c => c.type === 'expense') ||
                          { id: 'food', type: 'expense' };
    
    return {
      type: defaultCategory.type as 'expense' | 'income',
      categoryId: defaultCategory.id,
      confidence: 30,
      description: description,
      explanation: 'API調用失敗，使用預設分類'
    };
  };
  
  return {
    classifyWithLLM
  };
}