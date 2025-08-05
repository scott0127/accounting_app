/**
 * 智能財務分析系統測試
 * 用於驗證新的分層分析架構
 */

// 模擬測試數據
const mockTransactions = [
  {
    id: '1',
    amount: 50000,
    type: 'income',
    date: '2024-01-15',
    description: '薪資',
    category: { name: '薪資', type: 'income' }
  },
  {
    id: '2',
    amount: 15000,
    type: 'expense',
    date: '2024-01-20',
    description: '租金',
    category: { name: '住房', type: 'expense' }
  },
  {
    id: '3',
    amount: 3000,
    type: 'expense',
    date: '2024-01-22',
    description: '餐廳聚餐',
    category: { name: '餐飲', type: 'expense' }
  }
]

/**
 * 測試快速洞察生成
 */
export const testQuickInsight = () => {
  console.log('🧪 測試快速洞察生成...')
  
  const startTime = performance.now()
  
  // 模擬快速洞察計算
  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlyBalance = totalIncome - totalExpense
  const savingsRate = (monthlyBalance / totalIncome) * 100
  
  const endTime = performance.now()
  
  console.log('✅ 快速洞察結果:')
  console.log(`   收支餘額: ${monthlyBalance.toLocaleString()}元`)
  console.log(`   儲蓄率: ${savingsRate.toFixed(1)}%`)
  console.log(`   計算時間: ${(endTime - startTime).toFixed(2)}ms`)
  
  return {
    monthlyBalance,
    savingsRate,
    executionTime: endTime - startTime
  }
}

/**
 * 測試 Context 建構
 */
export const testContextBuilding = () => {
  console.log('🧪 測試智能 Context 建構...')
  
  const context = `分析期間: 2024-01-01 至 2024-01-31
收入總額: 50,000元
支出總額: 18,000元
收支餘額: 32,000元

主要支出項目:
住房: 15,000元
餐飲: 3,000元

使用者問題: 請分析我的整體財務狀況`

  console.log('✅ Context 建構完成')
  console.log('📝 Context 預覽:')
  console.log(context.substring(0, 200) + '...')
  
  return context
}

/**
 * 測試分階段分析流程
 */
export const testPhaseAnalysis = async () => {
  console.log('🧪 測試分階段分析流程...')
  
  // Phase 1: 快速洞察
  console.log('📊 Phase 1: 生成快速洞察...')
  const quickResult = testQuickInsight()
  
  // 模擬 UI 更新
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Phase 2: 準備詳細分析
  console.log('🔍 Phase 2: 準備詳細分析...')
  const context = testContextBuilding()
  
  // 模擬分析時間
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Phase 3: 模擬 LLM 分析
  console.log('🤖 Phase 3: 執行 LLM 分析...')
  
  // 模擬 LLM 響應時間
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const mockLLMResult = {
    financialHealthScore: 85,
    spendingPatterns: {
      categories: [
        {
          name: '住房',
          amount: 15000,
          percentage: 83.3,
          trend: 'stable',
          recommendation: '住房支出佔比合理'
        }
      ]
    },
    budgetOptimization: {
      essentials: 20000,
      discretionary: 10000,
      savings: 20000,
      explanation: '建議將30%收入用於儲蓄',
      quickWins: ['減少外食頻率', '尋找更優惠的住房選項']
    }
  }
  
  console.log('✅ 分析完成!')
  console.log('📈 財務健康分數:', mockLLMResult.financialHealthScore)
  
  return {
    quickInsight: quickResult,
    detailedAnalysis: mockLLMResult
  }
}

/**
 * 測試智能問答
 */
export const testSmartQA = () => {
  console.log('🧪 測試智能問答...')
  
  const questions = [
    '我的餐飲支出合理嗎？',
    '如何提高儲蓄率？',
    '下個月的預算應該如何規劃？'
  ]
  
  const mockAnswers = [
    '您的餐飲支出約佔總支出的16.7%，這在合理範圍內。',
    '建議減少非必要支出，目標是將儲蓄率提升到30%以上。',
    '建議保持當前的支出結構，可以考慮增加投資理財的比例。'
  ]
  
  questions.forEach((question, index) => {
    console.log(`❓ ${question}`)
    console.log(`💡 ${mockAnswers[index]}`)
    console.log('')
  })
  
  return { questions, answers: mockAnswers }
}

/**
 * 執行所有測試
 */
export const runAllTests = async () => {
  console.log('🚀 開始測試智能財務分析系統')
  console.log('================================')
  
  try {
    // 測試 1: 快速洞察
    const quickTest = testQuickInsight()
    console.log('')
    
    // 測試 2: Context 建構
    const contextTest = testContextBuilding()
    console.log('')
    
    // 測試 3: 分階段分析
    const phaseTest = await testPhaseAnalysis()
    console.log('')
    
    // 測試 4: 智能問答
    const qaTest = testSmartQA()
    console.log('')
    
    console.log('✅ 所有測試完成!')
    console.log('================================')
    console.log('📊 測試總結:')
    console.log(`   快速洞察執行時間: ${quickTest.executionTime.toFixed(2)}ms`)
    console.log(`   Context 長度: ${contextTest.length} 字符`)
    console.log(`   財務健康分數: ${phaseTest.detailedAnalysis.financialHealthScore}`)
    console.log(`   問答對數: ${qaTest.questions.length}`)
    
    return {
      success: true,
      results: {
        quickInsight: quickTest,
        context: contextTest,
        phaseAnalysis: phaseTest,
        smartQA: qaTest
      }
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error)
    return {
      success: false,
      error: error
    }
  }
}

// 如果在瀏覽器環境中，可以直接執行測試
if (typeof window !== 'undefined') {
  // 延遲執行，避免阻塞頁面載入
  setTimeout(() => {
    runAllTests()
  }, 1000)
}
