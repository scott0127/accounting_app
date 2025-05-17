import { useTransactionStore } from '~/stores/transaction'

export interface LLMClassifierResult {
  categoryId: string;
  confidence: number;
  description: string;
  explanation: string;
  errorMessage?: string;
}

/**
 * A composable function that provides LLM-powered expense classification
 * using an actual language model API.
 */
export function useLLMClassifier() {
  const store = useTransactionStore()
  const config = useRuntimeConfig()
  
  /**
   * Structure the prompt to get consistent responses
   */
  const buildClassificationPrompt = (inputText: string, categories: any[]): string => {
    const categoryList = categories.map(c => `${c.id}: ${c.name}`).join('\n');
    return `你是一個財務記帳AI，請根據下方消費描述，嚴格從「可用類別」中選出最適合的 categoryId，並產生一則「備註」：

消費描述: "${inputText}"

可用類別(僅限以下選項):
${categoryList}

請只回傳下列JSON格式（不要有多餘文字）：
{
  "categoryId": "必須是以上類別清單中的ID",
  "confidence": 數字(0-100表示確信度),
  "description": "備註，必須同時包含消費行為相關詞（如：午餐、交通、購物、飲料、娛樂等）和本身主體關鍵字（如品牌、地點、商品名）+金額，不要動詞、形容詞、無關詞語，並自動修正常見品牌或詞彙錯字（如三猩→三星、蘋果→Apple、星巴克→Starbucks、麥當勞→McDonald、吉伊卡哇→吉伊卡哇）",
  "explanation": "選擇該類別的理由"
}

備註規則：
1. description 必須簡短明確，且同時包含消費行為相關詞（如午餐、交通、飲料、娛樂等）與主體關鍵字（如品牌、地點、商品名）+金額，例如："午餐 麥當勞 100元"、"交通 計程車 200元"、"飲料 星巴克 120元"
2. 若描述有多個消費重點，只取最主要的
3. 禁止出現動詞、形容詞、無關詞語
4. 若描述中有品牌、地點、商品名稱，優先用這些，並自動修正為最有可能的正確詞彙（如三猩→三星、蘋果→Apple、星巴克→Starbucks、麥當勞→McDonald、吉伊卡哇→吉伊卡哇）
5. 金額必須與描述一致
6. categoryId 僅能選擇可用類別中的ID
7. 嚴格只回傳JSON，不要有多餘說明

範例：
描述："今天午餐吃三猩100元"
→ description: "午餐 三星 100元"
描述："蘋果手機配件2990元"
→ description: "購物 Apple 2990元"
描述："星巴克買飲料120元"
→ description: "飲料 Starbucks 120元"
描述："吉伊卡哇盲盒400元"
→ description: "購物 吉伊卡哇 400元"
`;
  }

  /**
   * Use OpenAI API to classify an expense description
   * @param description - The user input description
   * @returns Classification result with category, confidence and enhanced description
   */
  const classifyWithLLM = async (description: string): Promise<LLMClassifierResult> => {
    if (!description || !description.trim()) {
      return { 
        categoryId: 'food',
        confidence: 0,
        description: '',
        explanation: '未提供描述'
      };
    }
    
    const expenseCategories = store.categories.filter(c => c.type === 'expense');
    const config = useRuntimeConfig()
    
    try {
      const prompt = buildClassificationPrompt(description, expenseCategories);
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.openaiApiKey}`
        },          body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "你是一個協助分類消費的智能助手。" },
            { role: "user", content: prompt }
          ],
          temperature: 0.3, // Low temperature for more consistent results
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = `API請求失敗: ${response.status} - ${errorData.error?.message || response.statusText}`;
        console.error('OpenAI API Error:', msg);
        return {
          ...createFallbackResult(description, expenseCategories),
          errorMessage: msg
        };
      }
      
      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        const msg = 'API回應格式錯誤';
        console.error(msg, data);
        return {
          ...createFallbackResult(description, expenseCategories),
          errorMessage: msg
        };
      }
      
      const content = data.choices[0].message.content;
      
      try {
        // 只取出第一個 { 到最後一個 } 之間的內容
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        const result = JSON.parse(jsonString);
        
        // Validate the result has all required fields
        if (!result.categoryId || !expenseCategories.some(c => c.id === result.categoryId)) {
          throw new Error('Invalid category ID');
        }
        
        return {
          categoryId: result.categoryId,
          confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
          description: result.description || description,
          explanation: result.explanation || '由AI智能分析'
        };
      } catch (parseError) {
        const msg = 'AI回傳內容解析失敗';
        console.error(msg, parseError);
        return {
          ...createFallbackResult(description, expenseCategories),
          errorMessage: msg
        };
      }
    } catch (error: any) {
      const msg = error?.message || 'LLM classification error';
      console.error('LLM classification error:', error);
      return {
        ...createFallbackResult(description, expenseCategories),
        errorMessage: msg
      };
    }
  };
  
  /**
   * Create a fallback classification when API fails
   */
  const createFallbackResult = (description: string, categories: any[]): LLMClassifierResult => {
    // Very simple fallback - just use the first category
    // In a real app, you might want to use the keyword-based classifier as fallback
    return {
      categoryId: categories[0]?.id || 'food',
      confidence: 30,
      description: description,
      explanation: 'API調用失敗，使用預設分類'
    };
  };
  
  return {
    classifyWithLLM
  };
}