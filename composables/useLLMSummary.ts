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

// 分析狀態管理
export interface AnalysisState {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  estimatedTime: number;
  error: string | null;
}

// 快速洞察（立即顯示）
export interface QuickInsight {
  monthlyBalance: number;
  topSpendingCategory: string;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  savingsRate: number;
  urgentAlerts: string[];
}

// 詳細分析結果
export interface DetailedAnalysis {
  financialHealthScore: number;
  spendingPatterns: {
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
      recommendation: string;
    }>;
    topExpenses?: Array<{
      description: string;
      amount: number;
      category: string;
      date: string;
      insight: string;
    }>;
    expensiveItems?: {
      mostExpensive: {
        item: string;
        amount: number;
        reason: string;
      };
      luxurySpending: {
        total: number;
        items: string[];
        advice: string;
      };
    };
    seasonality: string;
    weekdayVsWeekend: {
      weekday: number;
      weekend: number;
      insight: string;
    };
  };
  budgetOptimization: {
    essentials: number;
    discretionary: number;
    savings: number;
    explanation: string;
    quickWins: string[];
  };
  personalizedAdvice: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
}

// 智能問答結果
export interface SmartQAResult {
  answer: string;
  relevantData: any;
  followUpQuestions: string[];
  actionItems: string[];
}

/**
 * 新一代智能財務分析 Composable
 * 基於 Context Engineering 和優秀 UX 設計
 * 特點：
 * 1. 分層分析：快速洞察 + 詳細分析
 * 2. 漸進式載入：避免等待感
 * 3. 智能快取：減少重複計算
 * 4. 預測性分析：主動提供建議
 */
export function useLLMSummary() {
  const config = useRuntimeConfig()
  
  // 反應式狀態管理
  const analysisState = ref<AnalysisState>({
    isLoading: false,
    progress: 0,
    currentStep: '',
    estimatedTime: 0,
    error: null
  })

  const quickInsight = ref<QuickInsight | null>(null)
  const detailedAnalysis = ref<DetailedAnalysis | null>(null)
  
  // 快取管理
  const cache = new Map<string, any>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5分鐘

  // 工具函數：快取鍵生成
  const generateCacheKey = (type: string, params: any): string => {
    return `${type}_${JSON.stringify(params)}_${Date.now()}`
  }

  // 工具函數：檢查快取
  const getCachedResult = (key: string) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  // 1. 基礎資料獲取（優化版）
  const fetchCategories = async (): Promise<Category[]> => {
    const cacheKey = 'categories'
    const cached = getCachedResult(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('categories')
      .select('*')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data as Category[]
  }

  const fetchTransactions = async (startDate: string, endDate: string): Promise<TransactionWithCategory[]> => {
    const cacheKey = generateCacheKey('transactions', { startDate, endDate })
    const cached = getCachedResult(cacheKey)
    if (cached) return cached

    try {
      // 首先檢查 Supabase 連接和用戶驗證
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('用戶未登入，使用空交易記錄')
        return []
      }

      // 分別獲取交易記錄和類別
      const [transactionsResult, categoriesResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false }),
        
        supabase
          .from('categories')
          .select('*')
      ])

      if (transactionsResult.error) {
        console.error('交易記錄查詢錯誤:', transactionsResult.error)
        throw new Error(`交易記錄查詢失敗: ${transactionsResult.error.message}`)
      }

      if (categoriesResult.error) {
        console.error('類別查詢錯誤:', categoriesResult.error)
        throw new Error(`類別查詢失敗: ${categoriesResult.error.message}`)
      }

      const transactions = transactionsResult.data || []
      const categories = categoriesResult.data || []

      // 建立類別映射
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

      // 組合交易記錄與類別資訊
      const result: TransactionWithCategory[] = transactions.map(transaction => ({
        ...transaction,
        category: categoryMap.get(transaction.category_id) || {
          id: transaction.category_id,
          name: '未知類別',
          type: transaction.type,
          icon: '❓'
        }
      }))

      cache.set(cacheKey, { data: result, timestamp: Date.now() })
      
      console.log(`成功載入 ${result.length} 筆交易記錄`)
      return result

    } catch (error) {
      console.error('Error fetching transactions:', error)
      // 提供更詳細的錯誤信息
      if (error instanceof Error) {
        throw new Error(`無法載入交易記錄: ${error.message}`)
      } else {
        throw new Error('無法載入交易記錄: 未知錯誤')
      }
    }
  }

  // 2. 快速洞察分析（毫秒級響應）
  const generateQuickInsight = async (
    transactions: TransactionWithCategory[], 
    startDate: string, 
    endDate: string
  ): Promise<QuickInsight> => {
    // 處理空交易記錄的情況
    if (!transactions || transactions.length === 0) {
      return {
        monthlyBalance: 0,
        topSpendingCategory: '暫無資料',
        spendingTrend: 'stable',
        savingsRate: 0,
        urgentAlerts: ['還沒有交易記錄喔！開始記帳來獲得個人化的理財建議吧 📊']
      }
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const monthlyBalance = totalIncome - totalExpense

    // 找出最大支出類別
    const expenseByCategory = new Map<string, number>()
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category?.name || '其他'
        expenseByCategory.set(categoryName, (expenseByCategory.get(categoryName) || 0) + (t.amount || 0))
      })

    const topSpendingCategory = Array.from(expenseByCategory.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '無支出記錄'

    // 支出趨勢分析（簡化版）
    const spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable' // 簡化實作

    const savingsRate = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0

    // 緊急警示
    const urgentAlerts: string[] = []
    if (monthlyBalance < 0) urgentAlerts.push('本月支出超過收入，需要注意一下！ 💸')
    if (savingsRate < 10 && totalIncome > 0) urgentAlerts.push('儲蓄率偏低，建議提升到 20% 以上 💰')

    return {
      monthlyBalance,
      topSpendingCategory,
      spendingTrend,
      savingsRate,
      urgentAlerts
    }
  }

  // 3. 智能 Context 建構
  const buildSmartContext = (
    transactions: TransactionWithCategory[],
    startDate: string,
    endDate: string,
    userQuestion?: string
  ): string => {
    const categories = Array.from(new Set(transactions.map(t => t.category?.name).filter(Boolean)))
    const timeRange = `${startDate} 至 ${endDate}`
    
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0)
    
    // 支出類別分析
    const expenseAnalysis = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || '其他'
        acc[categoryName] = (acc[categoryName] || 0) + (t.amount || 0)
        return acc
      }, {} as Record<string, number>)

    const topExpenses = Object.entries(expenseAnalysis)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => `${category}: ${amount.toLocaleString()}元`)

    // 獲取最貴的消費記錄（用於消費回顧）
    const expenseTransactions = transactions.filter(t => t.type === 'expense').sort((a, b) => (b.amount || 0) - (a.amount || 0))
    const topExpenseDetails = expenseTransactions.slice(0, 10).map(t => 
      `• ${t.description || '消費'} - ${t.amount?.toLocaleString()}元 (${t.category?.name}) [${t.date}]`
    ).join('\n')

    // 計算合理的預算建議基於實際收入
    const incomeMonthly = totalIncome;
    const suggestedEssentials = Math.round(incomeMonthly * 0.6); // 60% 生活必需
    const suggestedDiscretionary = Math.round(incomeMonthly * 0.25); // 25% 娛樂
    const suggestedSavings = Math.round(incomeMonthly * 0.15); // 15% 儲蓄

    return `你是專業的個人財務顧問，請基於以下詳細資料提供精準的財務分析與建議。

時間範圍: ${timeRange}
收入總額: ${totalIncome.toLocaleString()}元
支出總額: ${totalExpense.toLocaleString()}元
收支餘額: ${(totalIncome - totalExpense).toLocaleString()}元

主要支出項目:
${topExpenses.join('\n')}

具體消費明細（前10筆最高支出）:
${topExpenseDetails}

參考預算建議基準:
- 生活必需品建議額度: ${suggestedEssentials.toLocaleString()}元
- 娛樂享受建議額度: ${suggestedDiscretionary.toLocaleString()}元  
- 儲蓄建議額度: ${suggestedSavings.toLocaleString()}元

使用者問題: ${userQuestion || '請提供整體財務分析'}

請分析用戶的具體消費行為，包括：
1. 找出最貴的購買項目並分析是否合理
2. 識別奢侈品消費模式
3. 提供基於實際收入的預算優化建議（請使用上述參考額度，不要返回0）
4. 具體分析每筆大額消費的必要性

請提供結構化的 JSON 回應，確保 budgetOptimization 的數值是基於實際收入計算的具體金額。`
  }

  // 4. 分階段分析執行器
  const executeAnalysisPhases = async (
    transactions: TransactionWithCategory[],
    startDate: string,
    endDate: string,
    userQuestion?: string
  ) => {
    try {
      console.log('開始分析階段:', { 
        transactionCount: transactions.length, 
        dateRange: `${startDate} 到 ${endDate}`,
        userQuestion 
      })

      // Phase 1: 快速洞察（立即顯示）
      analysisState.value = {
        isLoading: true,
        progress: 20,
        currentStep: '生成快速洞察...',
        estimatedTime: 1,
        error: null
      }
      
      console.log('Phase 1: 生成快速洞察...')
      const insight = await generateQuickInsight(transactions, startDate, endDate)
      quickInsight.value = insight
      console.log('快速洞察完成:', insight)

      // 如果沒有交易記錄，直接提供引導分析
      if (!transactions || transactions.length === 0) {
        console.log('沒有交易記錄，使用引導分析')
        analysisState.value.progress = 100
        analysisState.value.currentStep = '分析完成'
        analysisState.value.isLoading = false

        const guidanceAnalysis = generateFallbackAnalysis(false)
        detailedAnalysis.value = guidanceAnalysis

        return {
          quickInsight: insight,
          detailedAnalysis: guidanceAnalysis
        }
      }

      // Phase 2: 準備詳細分析
      console.log('Phase 2: 準備詳細分析...')
      analysisState.value.progress = 40
      analysisState.value.currentStep = '分析支出模式...'
      analysisState.value.estimatedTime = 3

      await new Promise(resolve => setTimeout(resolve, 500)) // 模擬分析時間

      // Phase 3: LLM 分析
      console.log('Phase 3: 開始 LLM 分析...')
      analysisState.value.progress = 70
      analysisState.value.currentStep = '生成個人化建議...'
      
      const context = buildSmartContext(transactions, startDate, endDate, userQuestion)
      console.log('建構分析上下文完成，長度:', context.length)
      
      let llmResult: DetailedAnalysis
      
      // 檢查是否有 API Key
      if (!config.public.openaiApiKey) {
        console.warn('未設置 OpenAI API Key，使用本地分析')
        llmResult = generateDetailedLocalAnalysis(transactions)
      } else {
        try {
          llmResult = await callOptimizedLLM(context)
          console.log('LLM 分析完成:', llmResult)
        } catch (error) {
          console.error('LLM 分析失敗，切換到本地分析:', error)
          llmResult = generateDetailedLocalAnalysis(transactions)
        }
      }

      // Phase 4: 完成
      console.log('Phase 4: 分析完成')
      analysisState.value.progress = 100
      analysisState.value.currentStep = '分析完成'
      analysisState.value.isLoading = false

      detailedAnalysis.value = llmResult

      return {
        quickInsight: insight,
        detailedAnalysis: llmResult
      }

    } catch (error) {
      console.error('分析階段失敗:', error)
      analysisState.value.error = error instanceof Error ? error.message : '分析失敗'
      analysisState.value.isLoading = false
      
      // 即使失敗也提供基本分析
      const fallbackAnalysis = generateFallbackAnalysis(transactions.length > 0)
      detailedAnalysis.value = fallbackAnalysis
      console.log('使用降級分析:', fallbackAnalysis)
      
      throw error
    }
  }

  // 5. 優化的 LLM 呼叫
  const callOptimizedLLM = async (context: string): Promise<DetailedAnalysis> => {
    try {
      console.log('開始 LLM 分析...')
      console.log('API Key 狀態:', config.public.openaiApiKey ? '已設置' : '未設置')
      console.log('分析內容長度:', context.length)

      const response = await $fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.openaiApiKey}`
        },
        body: {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `你是專業財務顧問，請提供結構化的 JSON 分析結果。請特別注意消費回顧分析，包括最貴的購買和品名詳情：
{
  "financialHealthScore": "1-100分數",
  "spendingPatterns": {
    "categories": [{"name": "類別名", "amount": 金額, "percentage": 百分比, "trend": "up/down/stable", "recommendation": "建議"}],
    "topExpenses": [{"description": "商品描述", "amount": 金額, "category": "類別", "date": "日期", "insight": "消費洞察"}],
    "expensiveItems": {
      "mostExpensive": {"item": "最貴商品名稱", "amount": 金額, "reason": "購買原因分析"},
      "luxurySpending": {"total": 總奢侈消費, "items": ["奢侈品列表"], "advice": "建議"}
    },
    "seasonality": "季節性分析",
    "weekdayVsWeekend": {"weekday": 平日支出, "weekend": 假日支出, "insight": "洞察"}
  },
  "budgetOptimization": {
    "essentials": 必要支出建議金額,
    "discretionary": 可自由支配金額,
    "savings": 建議儲蓄金額,
    "explanation": "預算分配說明",
    "quickWins": ["快速改善建議"]
  },
  "personalizedAdvice": {
    "immediate": ["立即建議"],
    "shortTerm": ["短期建議"],
    "longTerm": ["長期建議"]
  },
  "riskAssessment": {
    "level": "low/medium/high",
    "factors": ["風險因子"],
    "mitigation": ["緩解策略"]
  }
}

請確保：
1. budgetOptimization 中的數值是具體的金額（數字），不是 0 或空值
2. topExpenses 包含具體的商品描述和購買洞察
3. expensiveItems 分析最貴的購買並提供理性建議
4. 數值計算要準確反映實際收支情況`
            },
            { role: 'user', content: context }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }
      }) as any

      console.log('LLM 回應狀態:', response ? '成功' : '失敗')
      
      const content = response.choices[0]?.message?.content
      if (!content) {
        console.error('LLM 回應內容為空')
        throw new Error('LLM 回應異常')
      }

      console.log('LLM 回應內容長度:', content.length)
      console.log('LLM 回應內容預覽:', content.substring(0, 200) + '...')

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('JSON 解析成功')
          
          // 修復數據類型問題
          if (parsed.financialHealthScore && typeof parsed.financialHealthScore === 'string') {
            parsed.financialHealthScore = parseInt(parsed.financialHealthScore)
          }
          
          // 確保數值類型正確
          if (parsed.budgetOptimization) {
            const budget = parsed.budgetOptimization
            if (typeof budget.essentials === 'string') budget.essentials = parseInt(budget.essentials) || 0
            if (typeof budget.discretionary === 'string') budget.discretionary = parseInt(budget.discretionary) || 0  
            if (typeof budget.savings === 'string') budget.savings = parseInt(budget.savings) || 0
          }
          
          // 確保消費回顧數據類型正確
          if (parsed.spendingPatterns?.expensiveItems?.mostExpensive) {
            const expensive = parsed.spendingPatterns.expensiveItems.mostExpensive
            if (typeof expensive.amount === 'string') expensive.amount = parseInt(expensive.amount) || 0
          }
          
          if (parsed.spendingPatterns?.expensiveItems?.luxurySpending) {
            const luxury = parsed.spendingPatterns.expensiveItems.luxurySpending
            if (typeof luxury.total === 'string') luxury.total = parseInt(luxury.total) || 0
          }
          
          if (parsed.spendingPatterns?.topExpenses) {
            parsed.spendingPatterns.topExpenses.forEach((expense: any) => {
              if (typeof expense.amount === 'string') expense.amount = parseInt(expense.amount) || 0
            })
          }
          
          console.log('數據類型修復完成:', parsed)
          return parsed
        } else {
          console.warn('未找到 JSON 格式，使用降級分析')
          return generateFallbackAnalysis(true)
        }
      } catch (parseError) {
        console.error('JSON 解析失敗:', parseError)
        return generateFallbackAnalysis(true)
      }
    } catch (error) {
      console.error('LLM 調用失敗:', error)
      
      // 檢查是否是 API Key 問題
      if (error instanceof Error && error.message.includes('401')) {
        console.error('API Key 認證失敗，請檢查 OPENAI_API_KEY 環境變數')
      } else if (error instanceof Error && error.message.includes('403')) {
        console.error('API 權限不足，請檢查 API Key 的權限設置')
      } else if (error instanceof Error && error.message.includes('429')) {
        console.error('API 使用量超限，請稍後再試')
      }
      
      return generateFallbackAnalysis(true)
    }
  }

  // 6. 降級分析（當 LLM 失敗時或無資料時）
  const generateFallbackAnalysis = (hasData: boolean = false): DetailedAnalysis => ({
    financialHealthScore: hasData ? 75 : 50,
    spendingPatterns: {
      categories: [],
      topExpenses: hasData ? [] : undefined,
      expensiveItems: hasData ? undefined : {
        mostExpensive: {
          item: '尚未有消費記錄',
          amount: 0,
          reason: '開始記帳後就能追蹤你的大額消費囉！'
        },
        luxurySpending: {
          total: 0,
          items: [],
          advice: '記錄消費習慣是理財的第一步'
        }
      },
      seasonality: hasData ? '資料不足' : '還沒有消費記錄',
      weekdayVsWeekend: { 
        weekday: 0, 
        weekend: 0, 
        insight: hasData ? '需要更多資料' : '開始記帳後就能看到你的消費模式囉！' 
      }
    },
    budgetOptimization: {
      essentials: hasData ? 15000 : 25000,    // 提供示範金額而非0
      discretionary: hasData ? 8000 : 10000,  // 提供示範金額而非0
      savings: hasData ? 5000 : 8000,         // 提供示範金額而非0
      explanation: hasData 
        ? '建議檢視您的收支記錄，這裡是基於平均收入的預算建議' 
        : '建議預算分配：生活必需 58%，娛樂 23%，儲蓄 19%（以月收入43,000元為例）',
      quickWins: hasData 
        ? ['記錄每日支出', '設定預算目標'] 
        : ['開始記錄日常支出', '設定月度預算目標', '建立每日記帳習慣']
    },
    personalizedAdvice: {
      immediate: hasData 
        ? ['持續記錄支出', '分析現有數據找出改善空間'] 
        : ['開始記錄每一筆消費', '下載記帳APP或準備記帳本'],
      shortTerm: hasData 
        ? ['建立預算計劃', '優化大額支出'] 
        : ['設定各類別的月度預算', '觀察自己的消費習慣'],
      longTerm: hasData 
        ? ['培養儲蓄習慣', '檢討投資規劃'] 
        : ['建立緊急備用金', '設定理財目標', '培養長期投資概念']
    },
    riskAssessment: {
      level: hasData ? 'medium' : 'low',
      factors: hasData ? ['需要更詳細的支出分析'] : ['理財意識剛起步'],
      mitigation: hasData 
        ? ['增加記錄頻率', '細化支出類別'] 
        : ['養成記帳習慣', '學習基礎理財知識']
    }
  })

  // 6.5. 本地詳細分析（當有資料但 LLM 失敗時）
  const generateDetailedLocalAnalysis = (transactions: TransactionWithCategory[]): DetailedAnalysis => {
    // 計算基本統計
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpenses

    // 獲取最貴的消費記錄
    const expenseTransactions = transactions.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)
    const mostExpensive = expenseTransactions[0]
    
    // 生成 topExpenses 數據
    const topExpenses = expenseTransactions.slice(0, 5).map(t => ({
      description: t.description || '消費記錄',
      amount: t.amount,
      category: t.category?.name || '其他',
      date: t.date,
      insight: t.amount > totalExpenses * 0.1 ? '這筆消費佔總支出比例較高' : '這筆消費金額適中'
    }))

    // 按類別分組
    const categoryStats = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        const categoryName = transaction.category?.name || '其他'
        if (!acc[categoryName]) {
          acc[categoryName] = { amount: 0, count: 0 }
        }
        acc[categoryName].amount += transaction.amount
        acc[categoryName].count += 1
      }
      return acc
    }, {} as Record<string, { amount: number; count: number }>)

    const categories = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        amount: stats.amount,
        percentage: totalExpenses > 0 ? (stats.amount / totalExpenses) * 100 : 0,
        trend: 'stable' as const,
        recommendation: stats.amount > totalExpenses * 0.3 ? `${name}支出較多，可考慮減少` : `${name}支出合理`
      }))
      .sort((a, b) => b.amount - a.amount)

    // 計算健康分數
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const healthScore = Math.max(0, Math.min(100, 50 + (savingsRate * 2)))

    return {
      financialHealthScore: Math.round(healthScore),
      spendingPatterns: {
        categories,
        topExpenses,
        expensiveItems: {
          mostExpensive: {
            item: mostExpensive?.description || '尚未有消費記錄',
            amount: mostExpensive?.amount || 0,
            reason: mostExpensive ? '這是您最大筆的消費支出' : '開始記帳後就能追蹤大額消費'
          },
          luxurySpending: {
            total: expenseTransactions.filter(t => t.amount > totalExpenses * 0.15).reduce((sum, t) => sum + t.amount, 0),
            items: expenseTransactions.filter(t => t.amount > totalExpenses * 0.15).map(t => t.description || '大額消費').slice(0, 3),
            advice: '建議檢視大額消費的必要性'
          }
        },
        seasonality: '需要更長時間的資料來分析季節性模式',
        weekdayVsWeekend: {
          weekday: totalExpenses * 0.7,
          weekend: totalExpenses * 0.3,
          insight: '平日支出通常較多，假日支出集中在娛樂和餐飲'
        }
      },
      budgetOptimization: {
        essentials: Math.round(totalIncome * 0.6),
        discretionary: Math.round(totalIncome * 0.25),
        savings: Math.round(totalIncome * 0.15),
        explanation: balance > 0 ? '您的收支平衡良好，建議維持現狀並略微增加儲蓄' : '支出超過收入，需要調整預算分配',
        quickWins: balance > 0 
          ? ['繼續保持記帳習慣', '考慮增加儲蓄比例']
          : ['檢視不必要支出', '尋找增加收入的機會']
      },
      personalizedAdvice: {
        immediate: categories.length > 0 
          ? [`控制${categories[0].name}支出`, '每週檢視預算執行情況']
          : ['開始分類記錄支出', '設定每月預算目標'],
        shortTerm: ['建立緊急備用金', '優化支出結構'],
        longTerm: ['規劃投資組合', '設定長期理財目標']
      },
      riskAssessment: {
        level: balance < 0 ? 'high' : savingsRate < 10 ? 'medium' : 'low',
        factors: balance < 0 
          ? ['支出超過收入', '缺乏預算控制']
          : savingsRate < 10 
            ? ['儲蓄率偏低', '預算管理需要改善']
            : ['財務狀況良好'],
        mitigation: balance < 0
          ? ['立即減少非必要支出', '尋找增收機會']
          : ['提高儲蓄目標', '建立投資計劃']
      }
    }
  }

  // 7. 智能問答
  const askSmartQuestion = async (
    question: string,
    transactions: TransactionWithCategory[],
    dateRange: { start: string; end: string }
  ): Promise<SmartQAResult> => {
    const context = buildSmartContext(transactions, dateRange.start, dateRange.end, question)
    
    try {
      console.log('開始智能問答...', { question, transactionCount: transactions.length })
      
      const response = await $fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.public.openaiApiKey}`
        },
        body: {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system', 
              content: '請提供簡潔明確的回答，並建議後續問題和行動項目。以 JSON 格式回應：{"answer": "回答", "followUpQuestions": ["後續問題"], "actionItems": ["行動項目"]}'
            },
            { role: 'user', content: context }
          ],
          temperature: 0.5,
          max_tokens: 800
        }
      }) as any

      console.log('智能問答回應狀態:', response ? '成功' : '失敗')

      const content = response.choices[0]?.message?.content
      if (content) {
        console.log('智能問答回應內容:', content.substring(0, 200) + '...')
      }
      
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null

      console.log('智能問答解析結果:', result ? '成功' : '失敗')

      return {
        answer: result?.answer || '無法回答此問題',
        relevantData: null,
        followUpQuestions: result?.followUpQuestions || [],
        actionItems: result?.actionItems || []
      }
    } catch (error) {
      console.error('智能問答失敗:', error)
      return {
        answer: '抱歉，目前無法回答此問題',
        relevantData: null,
        followUpQuestions: ['您想了解什麼樣的財務資訊？'],
        actionItems: ['檢查網路連線', '稍後再試']
      }
    }
  }

  return {
    // 狀態
    analysisState: readonly(analysisState),
    quickInsight: readonly(quickInsight),
    detailedAnalysis: readonly(detailedAnalysis),
    
    // 核心方法
    executeAnalysisPhases,
    askSmartQuestion,
    
    // 工具方法
    fetchTransactions,
    fetchCategories,
    
    // 清理方法
    clearCache: () => cache.clear(),
    resetAnalysis: () => {
      quickInsight.value = null
      detailedAnalysis.value = null
      analysisState.value = {
        isLoading: false,
        progress: 0,
        currentStep: '',
        estimatedTime: 0,
        error: null
      }
    }
  }
}
