import { ref, readonly } from 'vue'
import type { Transaction, Category } from '~/types'
import { useSupabase } from './useSupabase'
import { parseGeminiResponse } from '~/utils/geminiParser'

// Internal types
export interface TransactionWithCategory extends Transaction {
  category?: { id: string; name: string; type: 'income' | 'expense' } | null
}

export interface QuickInsight {
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
  savingsRate: number
  topSpendingCategory: string
  urgentAlerts: string[]
}

export interface DetailedAnalysis {
  financialHealthScore: number
  spendingPatterns: {
    categories: Array<{ name: string; amount: number; percentage: number; trend: 'up' | 'down' | 'stable'; recommendation: string }>
    topExpenses?: Array<{ description: string; amount: number; category: string; date: string; insight?: string }>
    expensiveItems?: {
      mostExpensive?: { item: string; amount: number; reason?: string }
      luxurySpending?: { total: number; items: string[]; advice?: string }
    }
    seasonality?: string
    weekdayVsWeekend?: { weekday: number; weekend: number; insight?: string }
  }
  budgetOptimization: {
    essentials: number
    discretionary: number
    savings: number
    explanation?: string
    quickWins?: string[]
  }
  personalizedAdvice: { immediate: string[]; shortTerm: string[]; longTerm: string[] }
  riskAssessment: { level: 'low' | 'medium' | 'high'; factors: string[]; mitigation: string[] }
}

export interface SmartQAResult {
  answer: string
  relevantData: any
  followUpQuestions: string[]
  actionItems: string[]
}

export function useLLMSummary() {
  const supabase = useSupabase()
  const config = useRuntimeConfig()

  // State
  const analysisState = ref({
    isLoading: false,
    progress: 0,
    currentStep: '',
    estimatedTime: 0,
    error: null as string | null,
  })
  const quickInsight = ref<QuickInsight | null>(null)
  const detailedAnalysis = ref<DetailedAnalysis | null>(null)
  const isStreaming = ref(false)
  const streamingRaw = ref('')
  const cache = new Map<string, any>()

  // Helpers
  const formatDate = (d: string | Date) => new Date(d).toISOString().split('T')[0]
  const cacheKey = (start: string, end: string, q?: string) => `summary:${formatDate(start)}:${formatDate(end)}:${q || ''}`

  const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    return (data || []) as Category[]
  }

  // Fetch transactions within a date range and attach primary category
  const fetchTransactions = async (start: string, end: string): Promise<TransactionWithCategory[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, type, date, description, category_id, category_ids')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })

    if (error) throw error
    const rows = (data || []) as any[]

    const cats = await fetchCategories()
    const catMap = new Map(cats.map(c => [c.id, c]))

    return rows.map((t) => {
      const primary = Array.isArray(t.category_ids) && t.category_ids.length > 0
        ? t.category_ids[0]
        : (t.category_id || null)
      const category = primary ? (catMap.get(primary) || null) : null
      const category_ids = Array.isArray(t.category_ids)
        ? t.category_ids.slice(0, 3)
        : (primary ? [primary] : [])
      return {
        id: String(t.id),
        amount: Number(t.amount) || 0,
        type: (t.type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
        date: formatDate(t.date),
        description: t.description || '',
        category_id: primary || undefined,
        category_ids,
        category: category ? { id: category.id, name: category.name, type: category.type } : null
      } as TransactionWithCategory
    })
  }

  // Build smart context for LLM
  const buildSmartContext = (
    transactions: TransactionWithCategory[], start: string, end: string, userQuestion?: string
  ): string => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    const balance = income - expense
    const byCategory: Record<string, number> = {}
    transactions.forEach(t => {
      const name = t.category?.name || '其他'
      byCategory[name] = (byCategory[name] || 0) + (t.amount || 0)
    })
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const facts = {
      period: { start: formatDate(start), end: formatDate(end) },
      totals: { income, expense, balance },
      categories: top.map(([name, amount]) => ({ name, amount }))
    }

    return [
      'You are a professional financial analyst. Return ONLY JSON. No extra text.',
      `FACTS_JSON = ${JSON.stringify(facts)}`,
      userQuestion ? `USER_QUESTION = ${userQuestion}` : '',
      'Output fields: financialHealthScore (0-100), spendingPatterns{categories[], topExpenses[], expensiveItems{}, seasonality, weekdayVsWeekend}, budgetOptimization{essentials, discretionary, savings, explanation, quickWins[]}, personalizedAdvice{immediate[], shortTerm[], longTerm[]}, riskAssessment{level, factors[], mitigation[]}.',
      'All amounts must be numbers. Base estimates on the given income. Ensure valid JSON.'
    ].filter(Boolean).join('\n')
  }

  // Quick insight
  const generateQuickInsight = async (
    transactions: TransactionWithCategory[], start: string, end: string
  ): Promise<QuickInsight> => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense
    const savingsRate = income > 0 ? Math.max(0, Math.min(100, ((income - expense) / income) * 100)) : 0
    const byCategory: Record<string, number> = {}
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const name = t.category?.name || '其他'
        byCategory[name] = (byCategory[name] || 0) + t.amount
      }
    })
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const urgent: string[] = []
    if (balance < 0) urgent.push('本月支出超過收入，請調整預算配置')
    if (savingsRate < 10 && income > 0) urgent.push('儲蓄率偏低，建議提高至 15-20%')

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      monthlyBalance: balance,
      savingsRate,
      topSpendingCategory: top,
      urgentAlerts: urgent
    }
  }

  // Normalize detailed analysis values
  const normalizeDetailedAnalysis = (
    analysis: DetailedAnalysis, transactions: TransactionWithCategory[]
  ): DetailedAnalysis => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
    if (typeof (analysis as any).financialHealthScore !== 'number' || isNaN((analysis as any).financialHealthScore)) {
      ;(analysis as any).financialHealthScore = 60
    }
    analysis.financialHealthScore = Math.round(clamp(analysis.financialHealthScore, 0, 100))
    if (analysis.spendingPatterns?.categories) {
      analysis.spendingPatterns.categories = analysis.spendingPatterns.categories.map(c => ({
        ...c,
        amount: typeof c.amount === 'number' ? c.amount : parseFloat(String((c as any).amount)) || 0,
        percentage: typeof c.percentage === 'number' ? c.percentage : parseFloat(String((c as any).percentage)) || 0,
        trend: (c.trend === 'up' || c.trend === 'down' || c.trend === 'stable') ? c.trend : 'stable',
        recommendation: c.recommendation || ''
      }))
    }
    if (analysis.spendingPatterns?.topExpenses) {
      analysis.spendingPatterns.topExpenses = analysis.spendingPatterns.topExpenses.map(e => ({
        ...e,
        amount: typeof e.amount === 'number' ? e.amount : parseFloat(String((e as any).amount)) || 0,
        date: e.date
      }))
    }
    const b = analysis.budgetOptimization
    const ensure = (v: any) => (typeof v === 'number' && !isNaN(v) ? v : 0)
    let essentials = ensure(b.essentials), discretionary = ensure(b.discretionary), savings = ensure(b.savings)
    if (income > 0 && (essentials + discretionary + savings) === 0) {
      essentials = Math.round(income * 0.6)
      discretionary = Math.round(income * 0.25)
      savings = Math.round(income * 0.15)
    }
    analysis.budgetOptimization.essentials = essentials
    analysis.budgetOptimization.discretionary = discretionary
    analysis.budgetOptimization.savings = savings
    analysis.budgetOptimization.explanation = analysis.budgetOptimization.explanation || (income > 0
      ? '依據您的實際收入推估預算分配建議'
      : '收入資料不足，提供一般性預算建議')
    return analysis
  }

  // Non-streaming LLM call
  const callOptimizedLLM = async (context: string): Promise<DetailedAnalysis> => {
    try {
      const apiKey = config.public.geminiApiKey
      if (!apiKey) throw new Error('缺少 Gemini API Key')

      const response = await $fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            systemInstruction: {
              role: 'system',
              parts: [{ text: 'You are a finance assistant. Return ONLY valid JSON with fields as specified. All amounts must be numbers. Do not wrap in markdown.' }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: context }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048
            }
          }
        }
      ) as any

      // 使用新的解析工具
      console.log('🔍 Raw Summary API response:', response)
      const result = parseGeminiResponse<any>(response)
      console.log('✅ Parsed Summary response:', result)
      return result as DetailedAnalysis
    } catch (e) {
      console.error('❌ Summary analysis failed:', e)
      return generateFallbackAnalysis(true)
      return generateFallbackAnalysis(true)
    }
  }

  // Fallback analysis when no data or API fails
  const generateFallbackAnalysis = (hasData = false): DetailedAnalysis => ({
    financialHealthScore: hasData ? 75 : 50,
    spendingPatterns: {
      categories: [],
      topExpenses: hasData ? [] : undefined,
      expensiveItems: hasData ? undefined : {
        mostExpensive: { item: '尚未有消費記錄', amount: 0, reason: '開始記帳後就能追蹤你的大額消費囉！' },
        luxurySpending: { total: 0, items: [], advice: '記錄消費習慣是理財的第一步' }
      },
      seasonality: hasData ? '資料不足' : '還沒有消費記錄',
      weekdayVsWeekend: { weekday: 0, weekend: 0, insight: hasData ? '需要更多資料' : '開始記帳後就能看到你的消費模式囉！' }
    },
    budgetOptimization: {
      essentials: hasData ? 15000 : 25000,
      discretionary: hasData ? 8000 : 10000,
      savings: hasData ? 5000 : 8000,
      explanation: hasData ? '建議檢視您的收支記錄，這裡是基於平均收入的預算建議' : '建議預算分配：生活必需 58%，娛樂 23%，儲蓄 19%（以月收入43,000元為例）',
      quickWins: hasData ? ['記錄每日支出', '設定預算目標'] : ['開始記錄日常支出', '設定月度預算目標', '建立每日記帳習慣']
    },
    personalizedAdvice: {
      immediate: hasData ? ['持續記錄支出', '分析現有數據找出改善空間'] : ['開始記錄每一筆消費', '設定每月預算目標'],
      shortTerm: hasData ? ['建立預算計劃', '優化大額支出'] : ['設定各類別的月度預算', '觀察自己的消費習慣'],
      longTerm: hasData ? ['培養儲蓄習慣', '檢討投資規劃'] : ['建立緊急備用金', '設定理財目標', '培養長期投資概念']
    },
    riskAssessment: {
      level: hasData ? 'medium' : 'low',
      factors: hasData ? ['需要更詳細的支出分析'] : ['理財意識剛起步'],
      mitigation: hasData ? ['增加記錄頻率', '細化支出類別'] : ['養成記帳習慣', '學習基礎理財知識']
    }
  })

  // Local detailed analysis
  const generateDetailedLocalAnalysis = (transactions: TransactionWithCategory[]): DetailedAnalysis => {
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const balance = totalIncome - totalExpenses
    const expenseTx = transactions.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)
    const mostExpensive = expenseTx[0]

    const topExpenses = expenseTx.slice(0, 5).map(t => ({
      description: t.description || '消費記錄',
      amount: t.amount,
      category: t.category?.name || '其他',
      date: t.date,
      insight: t.amount > totalExpenses * 0.1 ? '這筆消費佔總支出比例較高' : '這筆消費金額適中'
    }))

    const categoryStats = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        const name = t.category?.name || '其他'
        acc[name] = (acc[name] || 0) + t.amount
      }
      return acc
    }, {} as Record<string, number>)

    const categories = Object.entries(categoryStats)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        trend: 'stable' as const,
        recommendation: amount > totalExpenses * 0.3 ? `${name}支出較多，可考慮減少` : `${name}支出合理`
      }))
      .sort((a, b) => b.amount - a.amount)

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const healthScore = Math.max(0, Math.min(100, 50 + (savingsRate * 2)))

    return {
      financialHealthScore: Math.round(healthScore),
      spendingPatterns: {
        categories,
        topExpenses,
        expensiveItems: {
          mostExpensive: { item: mostExpensive?.description || '尚未有消費記錄', amount: mostExpensive?.amount || 0, reason: mostExpensive ? '這是您最大筆的消費支出' : '開始記帳後就能追蹤大額消費' },
          luxurySpending: {
            total: expenseTx.filter(t => t.amount > totalExpenses * 0.15).reduce((s, t) => s + t.amount, 0),
            items: expenseTx.filter(t => t.amount > totalExpenses * 0.15).map(t => t.description || '大額消費').slice(0, 3),
            advice: '建議檢視大額消費的必要性'
          }
        },
        seasonality: '需要更長時間的資料來分析季節性模式',
        weekdayVsWeekend: { weekday: totalExpenses * 0.7, weekend: totalExpenses * 0.3, insight: '平日支出通常較多，假日支出集中在娛樂和餐飲' }
      },
      budgetOptimization: {
        essentials: Math.round(totalIncome * 0.6),
        discretionary: Math.round(totalIncome * 0.25),
        savings: Math.round(totalIncome * 0.15),
        explanation: balance > 0 ? '您的收支平衡良好，建議維持現狀並略微增加儲蓄' : '支出超過收入，需要調整預算分配',
        quickWins: balance > 0 ? ['繼續保持記帳習慣', '考慮增加儲蓄比例'] : ['檢視不必要支出', '尋找增加收入的機會']
      },
      personalizedAdvice: {
        immediate: categories.length > 0 ? [`控制${categories[0].name}支出`, '每週檢視預算執行情況'] : ['開始分類記錄支出', '設定每月預算目標'],
        shortTerm: ['建立緊急備用金', '優化支出結構'],
        longTerm: ['規劃投資組合', '設定長期理財目標']
      },
      riskAssessment: {
        level: balance < 0 ? 'high' : savingsRate < 10 ? 'medium' : 'low',
        factors: balance < 0 ? ['支出超過收入', '缺乏預算控制'] : savingsRate < 10 ? ['儲蓄率偏低', '預算管理需要改善'] : ['財務狀況良好'],
        mitigation: balance < 0 ? ['立即減少非必要支出', '尋找增收機會'] : ['提高儲蓄目標', '建立投資計劃']
      }
    }
  }

  // Execute staged analysis
  const executeAnalysisPhases = async (
    transactions: TransactionWithCategory[], start: string, end: string, userQuestion?: string
  ) => {
    analysisState.value = { isLoading: true, progress: 20, currentStep: '生成快速洞察...', estimatedTime: 1, error: null }
    const insight = await generateQuickInsight(transactions, start, end)
    quickInsight.value = insight

    if (!transactions || transactions.length === 0) {
      analysisState.value = { isLoading: false, progress: 100, currentStep: '分析完成', estimatedTime: 0, error: null }
      const guidance = generateFallbackAnalysis(false)
      detailedAnalysis.value = guidance
      return { quickInsight: insight, detailedAnalysis: guidance }
    }

    analysisState.value = { ...analysisState.value, progress: 60, currentStep: '生成個人化建議...', estimatedTime: 3 }
    const context = buildSmartContext(transactions, start, end, userQuestion)

    let llmResult: DetailedAnalysis
    if (!config.public.geminiApiKey) {
      llmResult = generateDetailedLocalAnalysis(transactions)
    } else {
      try {
        llmResult = await callOptimizedLLM(context)
      } catch {
        llmResult = generateDetailedLocalAnalysis(transactions)
      }
    }

    analysisState.value = { isLoading: false, progress: 100, currentStep: '分析完成', estimatedTime: 0, error: null }
    detailedAnalysis.value = normalizeDetailedAnalysis(llmResult, transactions)
    return { quickInsight: insight, detailedAnalysis: detailedAnalysis.value }
  }

  // Smart Q&A
  const askSmartQuestion = async (
    question: string, transactions: TransactionWithCategory[], dateRange: { start: string; end: string }
  ): Promise<SmartQAResult> => {
    const context = buildSmartContext(transactions, dateRange.start, dateRange.end, question)
    try {
      const apiKey = config.public.geminiApiKey
      if (!apiKey) throw new Error('缺少 Gemini API Key')

      const response = await $fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            systemInstruction: {
              role: 'system',
              parts: [{ text: '請提供簡潔明確的回答，並建議後續問題和行動項目。僅輸出純JSON，不要markdown包裝：{"answer":"...","followUpQuestions":["..."],"actionItems":["..."]}' }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: context }]
              }
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 800
            }
          }
        }
      ) as any

      // 使用新的解析工具
      console.log('🔍 Raw QA API response:', response)
      const result = parseGeminiResponse<any>(response)
      console.log('✅ Parsed QA response:', result)
      return {
        answer: result?.answer || '無法回答此問題',
        relevantData: null,
        followUpQuestions: result?.followUpQuestions || [],
        actionItems: result?.actionItems || []
      }
    } catch (e) {
      return { answer: '抱歉，目前無法回答此問題', relevantData: null, followUpQuestions: ['您想了解什麼樣的財務資訊？'], actionItems: ['檢查網路連線', '稍後再試'] }
    }
  }

  // Optional streaming version (SSE from server proxy)
  const startStreamingAnalysis = async (
    context: string,
    opts?: { model?: string; temperature?: number; max_tokens?: number }
  ) => {
    if (!config.public.geminiApiKey) return
    try {
      isStreaming.value = true
      streamingRaw.value = ''
      analysisState.value = { ...analysisState.value, isLoading: true, currentStep: '串流分析中...', progress: 60, error: null }

      const res = await fetch('/api/llm-summary-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: context,
          model: opts?.model || 'gemini-pro-latest',
          systemPrompt: 'You are a finance assistant. Return ONLY JSON. Continue until JSON complete.',
          generationConfig: {
            temperature: opts?.temperature ?? 0.3,
            maxOutputTokens: opts?.max_tokens ?? 1800
          }
        })
      })
      const reader = res.body?.getReader()
      if (!reader) throw new Error('無串流內容')
      const decoder = new TextDecoder('utf-8')
      let done = false

      const tryParseAndUpdate = () => {
        const m = streamingRaw.value.match(/\{[\s\S]*\}$/)
        if (!m) return
        try {
          const parsed = JSON.parse(m[0])
          detailedAnalysis.value = parsed
        } catch {}
      }

      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true })
        streamingRaw.value += chunk
        tryParseAndUpdate()
      }
      analysisState.value = { ...analysisState.value, isLoading: false, progress: 100, currentStep: '串流完成' }
    } catch (e: any) {
      analysisState.value = { ...analysisState.value, isLoading: false, error: e?.message || '串流失敗' }
    } finally {
      isStreaming.value = false
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
    fetchTransactions,
    fetchCategories,
    summarize: async (dateRange: { start: string; end: string }, userQuestion?: string) => {
      const key = cacheKey(dateRange.start, dateRange.end, userQuestion)
      if (cache.has(key)) return cache.get(key)
      const tx = await fetchTransactions(dateRange.start, dateRange.end)
      const qi = await generateQuickInsight(tx, dateRange.start, dateRange.end)
      quickInsight.value = qi
      const result = await executeAnalysisPhases(tx, dateRange.start, dateRange.end, userQuestion)
      cache.set(key, result)
      return result
    },

    // 串流（可選）
    startStreamingAnalysis,
    isStreaming: readonly(isStreaming),
    streamingRaw: readonly(streamingRaw),

    // 清理
    clearCache: () => cache.clear(),
    resetAnalysis: () => {
      quickInsight.value = null
      detailedAnalysis.value = null
      analysisState.value = { isLoading: false, progress: 0, currentStep: '', estimatedTime: 0, error: null }
    }
  }
}
