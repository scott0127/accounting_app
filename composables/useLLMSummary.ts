// @ts-ignore
import { useSupabase } from './useSupabase'
import type { Database } from '~/types/supabase'

// Get the supabase client instance
const supabase = useSupabase()

type Transaction = Database['public']['Tables']['transactions']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export type TransactionWithCategory = Transaction & {
  category?: Category
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topIncomeCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  periodStart: string;
  periodEnd: string;
}

export interface BudgetSuggestion {
  essentials: number;
  entertainment: number;
  savings: number;
  explanation: string;
}

export interface LLMSummaryResult {
  analysis: string;
  monthlyBudgetSuggestion: BudgetSuggestion;
  suggestions: string[];
  personalizedRecommendations: string[];
  savingsPotential: number;
  riskAreas: string[];
  confidence: number;
}

/**
 * A composable function that provides LLM-powered financial analysis and suggestions
 */
// Helper function that can be used independently
export const analyzeTransactions = async (startDate: string, endDate: string, question: string) => {
  const { fetchTransactions, getFinancialAnalysis } = useLLMSummary()
  try {
    const transactions = await fetchTransactions(startDate, endDate)
    return await getFinancialAnalysis(transactions, startDate, endDate, question)
  } catch (error) {
    console.error('Analysis error:', error)
    throw new Error('分析交易記錄時發生錯誤: ' + (error instanceof Error ? error.message : '未知錯誤'))
  }
}

export function useLLMSummary() {
  // 取得所有分類
  const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    return data as Category[]
  }

  // Helper to fetch transactions
  const fetchTransactions = async (startDate: string, endDate: string): Promise<TransactionWithCategory[]> => {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      throw new Error('無法載入交易記錄')
    }
    return transactions as unknown as TransactionWithCategory[]
  }

  const getMonthsBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + 
           (end.getMonth() - start.getMonth()) + 1;
  };

  /**
   * Generate a summary of transactions for a given period
   */
  const generateTransactionSummary = (transactions: TransactionWithCategory[], startDate: string, endDate: string, categories: Category[]): TransactionSummary => {
    const summary: TransactionSummary = {
      totalIncome: 0,
      totalExpense: 0,
      topExpenseCategories: [],
      topIncomeCategories: [],
      periodStart: startDate,
      periodEnd: endDate
    };

    // Group transactions by category and type
    const categoryTotals = new Map();
    transactions.forEach(transaction => {
      const categoryId = transaction.category_id || 'uncategorized';
      const key = `${transaction.type}-${categoryId}`;
      const current = categoryTotals.get(key) || 0;
      const amount = transaction.amount || 0;
      categoryTotals.set(key, current + amount);
      if (transaction.type === 'income') {
        summary.totalIncome += amount;
      } else {
        summary.totalExpense += amount;
      }
    });

    // Calculate top categories
    const expenseCategories = Array.from(categoryTotals.entries())
      .filter(([key]) => key.startsWith('expense'))
      .map(([key, amount]) => {
        const categoryId = key.split('-')[1];
        const category = categories.find(c => c.id === categoryId);
        const categoryName = category?.name || '未分類';
        return {
          category: categoryName,
          amount,
          percentage: summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const incomeCategories = Array.from(categoryTotals.entries())
      .filter(([key]) => key.startsWith('income'))
      .map(([key, amount]) => {
        const categoryId = key.split('-')[1];
        const category = categories.find(c => c.id === categoryId);
        const categoryName = category?.name || '未分類';
        return {
          category: categoryName,
          amount,
          percentage: summary.totalIncome > 0 ? (amount / summary.totalIncome) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    summary.topExpenseCategories = expenseCategories;
    summary.topIncomeCategories = incomeCategories;
    return summary;
  };

  /**
   * Build the prompt for financial analysis
   */
  const buildAnalysisPrompt = (summary: TransactionSummary, question: string): string => {
    const monthlyIncome = summary.totalIncome / getMonthsBetween(summary.periodStart, summary.periodEnd);
    const monthlyExpense = summary.totalExpense / getMonthsBetween(summary.periodStart, summary.periodEnd);
    const remainingBudget = monthlyIncome - monthlyExpense;
    
    // 計算消費偏好
    const expensePreferences = summary.topExpenseCategories
      .filter(c => c.category.includes('娛樂') || c.category.includes('購物') || c.category.includes('餐飲'))
      .sort((a, b) => b.amount - a.amount);
    
    return `你是一個親切的個人財務助理，請用友善且具體的方式分析以下財務數據並回答使用者的問題。
請記住：使用者希望得到實用且個人化的建議，特別是關於如何善用剩餘預算。

分析期間: ${summary.periodStart} 至 ${summary.periodEnd}

每月收支概況:
- 平均月收入: ${monthlyIncome.toFixed(0)} 元
- 平均月支出: ${monthlyExpense.toFixed(0)} 元
- 收支比: ${((monthlyExpense / monthlyIncome) * 100).toFixed(1)}%
- 每月可運用金額: ${remainingBudget.toFixed(0)} 元

主要支出類別:
${summary.topExpenseCategories.map(c => 
  `- ${c.category}: ${c.amount} 元 (${c.percentage.toFixed(1)}% | 月平均: ${(c.amount / getMonthsBetween(summary.periodStart, summary.periodEnd)).toFixed(0)}元)`
).join('\n')}

消費喜好分析:
${expensePreferences.map(c => 
  `- ${c.category}: 占支出 ${c.percentage.toFixed(1)}%, 顯示這是你喜歡的消費類別`
).join('\n')}

主要收入來源:
${summary.topIncomeCategories.map(c => 
  `- ${c.category}: ${c.amount} 元 (${c.percentage.toFixed(1)}%)`
).join('\n')}

使用者問題: "${question}"

請提供以下JSON格式的回應（不要有多餘文字）：
{
  "analysis": "請分析使用者的財務狀況，特別說明：1. 整體收支健康度 2. 主要消費傾向 3. 預算使用狀況",
  "monthlyBudgetSuggestion": {
    "essentials": "必要支出建議金額",
    "entertainment": "娛樂支出建議金額",
    "savings": "建議儲蓄金額",
    "explanation": "預算分配建議說明"
  },
  "suggestions": [
    "針對使用者的消費習慣提供具體建議",
    "如何更好地運用剩餘預算",
    "如何在保持生活品質的同時達到理財目標"
  ],
  "personalizedRecommendations": [
    "根據使用者的消費偏好，建議可以如何運用剩餘預算",
    "推薦適合的休閒活動或消費選項"
  ],
  "savingsPotential": 預估每月可能的節省金額,
  "riskAreas": ["需要注意的風險領域"],
  "confidence": 建議的可信度(0-100)
}

回應準則：
1. 分析要具體且個人化，避免籠統的建議
2. 預算建議要切合實際，考慮使用者的消費習慣
3. 提供的建議要平衡儲蓄目標和生活品質
4. 特別關注使用者感興趣的消費類別
5. 推薦要基於使用者的實際消費偏好
6. 建議要考慮季節性和特殊時期的支出變化
7. 保持正面且鼓勵的語氣，協助使用者做出明智的財務決策

需要處理的情境：
1. 詢問特定類別的預算建議（例如：娛樂預算）
2. 剩餘預算的運用建議
3. 消費習慣分析和優化
4. 特殊時期的支出調整建議
5. 基於個人喜好的消費推薦
6. 理財目標和生活品質的平衡建議`;
  };

  /**
   * Get financial analysis and suggestions based on transaction history
   */
  const getFinancialAnalysis = async (
    transactions: TransactionWithCategory[],
    startDate: string,
    endDate: string,
    question: string
  ): Promise<LLMSummaryResult> => {
    try {
      const categories = await fetchCategories();
      const summary = generateTransactionSummary(transactions, startDate, endDate, categories);
      const prompt = buildAnalysisPrompt(summary, question);
      const config = useRuntimeConfig()
      
      // Ensure we have transactions
      if (!transactions || transactions.length === 0) {
        throw new Error('沒有找到任何交易記錄')
      }

      // Call OpenAI API directly
      const response = await $fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.openaiApiKey}`
        },
        body: {
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: '你是一個親切的個人財務助理，專門提供個人化的理財建議。請根據使用者的消費習慣和喜好，提供具體且實用的建議。'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }
      }) as any;

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('回應格式錯誤');
      }

      // 解析 JSON 回應
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!result) {
        throw new Error('無法解析回應');
      }

      return {
        analysis: result.analysis || '無法進行分析',
        monthlyBudgetSuggestion: result.monthlyBudgetSuggestion || {
          essentials: 0,
          entertainment: 0,
          savings: 0,
          explanation: '無法提供預算建議'
        },
        suggestions: result.suggestions || ['無具體建議'],
        personalizedRecommendations: result.personalizedRecommendations || ['無個人化建議'],
        savingsPotential: result.savingsPotential || 0,
        riskAreas: result.riskAreas || ['無法評估風險'],
        confidence: result.confidence || 0
      };

    } catch (error) {
      console.error('Financial analysis failed:', error);
      return {
        analysis: '分析失敗',
        monthlyBudgetSuggestion: {
          essentials: 0,
          entertainment: 0,
          savings: 0,
          explanation: '無法提供預算建議'
        },
        suggestions: ['無法提供建議'],
        personalizedRecommendations: ['無法提供個人化建議'],
        savingsPotential: 0,
        riskAreas: ['無法評估風險'],
        confidence: 0
      };
    }
  };

  return {
    getFinancialAnalysis,
    fetchTransactions
  };
}
