/**
 * 智能財務助理 - 使用新一代 LLM 分析系統的範例
 * 展示如何打造無等待感的優秀使用者體驗
 */
import { useLLMSummary } from './useLLMSummary'

export interface AssistantState {
  isReady: boolean;
  hasQuickInsight: boolean;
  hasDetailedAnalysis: boolean;
  lastUpdateTime: Date | null;
}

export function useSmartFinancialAssistant() {
  const {
    analysisState,
    quickInsight,
    detailedAnalysis,
    executeAnalysisPhases,
    askSmartQuestion,
    fetchTransactions,
    resetAnalysis
  } = useLLMSummary()

  const assistantState = ref<AssistantState>({
    isReady: false,
    hasQuickInsight: false,
    hasDetailedAnalysis: false,
    lastUpdateTime: null
  })

  // 監聽分析狀態變化
  watch(quickInsight, (newInsight) => {
    if (newInsight) {
      assistantState.value.hasQuickInsight = true
      assistantState.value.lastUpdateTime = new Date()
    }
  })

  watch(detailedAnalysis, (newAnalysis) => {
    if (newAnalysis) {
      assistantState.value.hasDetailedAnalysis = true
      assistantState.value.isReady = true
      assistantState.value.lastUpdateTime = new Date()
    }
  })

  /**
   * 主要入口：啟動智能分析
   * 1. 立即顯示載入狀態
   * 2. 快速生成基本洞察（1-2秒）
   * 3. 背景執行詳細分析（3-5秒）
   */
  const startAnalysis = async (dateRange: { start: string; end: string }, question?: string) => {
    try {
      // 重置狀態
      resetAnalysis()
      assistantState.value = {
        isReady: false,
        hasQuickInsight: false,
        hasDetailedAnalysis: false,
        lastUpdateTime: null
      }

      // 先嘗試獲取交易記錄
      const transactions = await fetchTransactions(dateRange.start, dateRange.end)
      
      // 如果沒有交易記錄，通過 executeAnalysisPhases 提供引導信息
      if (!transactions || transactions.length === 0) {
        console.warn('沒有交易記錄，提供引導信息')
        // 即使沒有資料也執行分析，讓它產生引導信息
        return await executeAnalysisPhases([], dateRange.start, dateRange.end, '我還沒有任何交易記錄，請提供開始記帳的建議')
      }

      // 執行分層分析
      const result = await executeAnalysisPhases(
        transactions,
        dateRange.start,
        dateRange.end,
        question
      )

      return result
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  /**
   * 快速問答 - 基於已有的分析結果
   */
  const quickAsk = async (question: string, dateRange: { start: string; end: string }) => {
    const transactions = await fetchTransactions(dateRange.start, dateRange.end)
    return await askSmartQuestion(question, transactions, dateRange)
  }

  /**
   * 取得分析進度（用於 UI 顯示）
   */
  const getAnalysisProgress = computed(() => {
    const state = analysisState.value
    
    return {
      percentage: state.progress,
      message: state.currentStep,
      isLoading: state.isLoading,
      timeRemaining: state.estimatedTime,
      error: state.error
    }
  })

  /**
   * 取得當前可用的洞察
   */
  const getCurrentInsights = computed(() => {
    const insights = {
      quick: quickInsight.value,
      detailed: detailedAnalysis.value,
      isComplete: assistantState.value.isReady
    }

    return insights
  })

  /**
   * 生成對話式回應（模擬聊天機器人）
   */
  const generateConversationalResponse = (userInput: string) => {
    const insight = quickInsight.value
    if (!insight) return "讓我先分析一下您的財務資料..."

    // 根據用戶輸入和當前洞察生成回應
    if (userInput.includes('預算') || userInput.includes('花費')) {
      return `根據您的資料，您本月在「${insight.topSpendingCategory}」花費最多。您的儲蓄率是 ${insight.savingsRate.toFixed(1)}%。${insight.urgentAlerts.length > 0 ? '需要注意：' + insight.urgentAlerts[0] : '財務狀況看起來不錯！'}`
    }

    if (userInput.includes('建議') || userInput.includes('怎麼辦')) {
      const detailed = detailedAnalysis.value
      if (detailed) {
        return `根據詳細分析，建議您：${detailed.personalizedAdvice.immediate[0] || '保持良好的記帳習慣'}`
      }
      return "詳細分析還在進行中，不過根據快速分析，建議您關注一下支出最大的類別。"
    }

    return `您目前的收支餘額是 ${insight.monthlyBalance.toLocaleString()}元，主要支出在${insight.topSpendingCategory}。還有什麼想了解的嗎？`
  }

  /**
   * 預測性建議 - 主動提供建議
   */
  const getProactiveAdvice = computed(() => {
    const insight = quickInsight.value
    const detailed = detailedAnalysis.value
    
    if (!insight) return null

    const advice = []

    // 基於快速洞察的建議
    if (insight.savingsRate < 10) {
      advice.push({
        type: 'warning',
        title: '儲蓄率偏低',
        message: '建議將儲蓄率提升到收入的 20% 以上',
        action: '查看詳細預算建議'
      })
    }

    if (insight.monthlyBalance < 0) {
      advice.push({
        type: 'urgent',
        title: '支出超過收入',
        message: '需要立即檢視和調整支出項目',
        action: '查看支出分析'
      })
    }

    // 基於詳細分析的建議
    if (detailed) {
      detailed.personalizedAdvice.immediate.forEach(item => {
        advice.push({
          type: 'suggestion',
          title: '個人化建議',
          message: item,
          action: '了解更多'
        })
      })
    }

    return advice
  })

  /**
   * 智能問題建議 - 幫助用戶提出更好的問題
   */
  const getSuggestedQuestions = computed(() => {
    const insight = quickInsight.value
    if (!insight) return ['我的財務狀況如何？', '有什麼需要注意的嗎？']

    const questions = []

    if (insight.topSpendingCategory) {
      questions.push(`我在${insight.topSpendingCategory}的支出合理嗎？`)
    }

    if (insight.savingsRate < 20) {
      questions.push('如何提高我的儲蓄率？')
    }

    if (insight.monthlyBalance > 5000) {
      questions.push('我的剩餘預算應該如何運用？')
    }

    questions.push('下個月的預算應該如何規劃？')
    questions.push('我有哪些潛在的理財風險？')

    return questions
  })

  return {
    // 狀態
    assistantState: readonly(assistantState),
    analysisProgress: getAnalysisProgress,
    currentInsights: getCurrentInsights,
    proactiveAdvice: getProactiveAdvice,
    suggestedQuestions: getSuggestedQuestions,

    // 主要功能
    startAnalysis,
    quickAsk,
    generateConversationalResponse,

    // 原始數據（如需要）
    rawAnalysisState: analysisState,
    rawQuickInsight: quickInsight,
    rawDetailedAnalysis: detailedAnalysis
  }
}
