import { computed } from 'vue'

interface FinancialStatusProps {
  monthlyBudget: any;
  monthlyStats: any;
}

export function useHealthStatus(props: FinancialStatusProps) {
  const { monthlyBudget, monthlyStats } = props
  
  // 儲蓄率
  const savingsRate = computed(() => {
    if (monthlyStats.value.totalIncome === 0) return 0
    return (monthlyStats.value.balance / monthlyStats.value.totalIncome) * 100
  })

  // 財務健康狀態
  const financialHealthClass = computed(() => {
    const savingRate = savingsRate.value
    if (savingRate <= 0) return 'bg-red-100 text-red-700'
    if (savingRate < 10) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  })

  // 財務健康文字
  const financialHealthStatus = computed(() => {
    const savingRate = savingsRate.value
    if (savingRate <= 0) return '超支'
    if (savingRate < 10) return '警戒'
    return '穩健'
  })

  // 財務建議
  const financialAdvice = computed(() => {
    const savingRate = savingsRate.value
    if (savingRate <= 0) return '支出超過收入，建議縮減不必要的開支'
    if (savingRate < 10) return '儲蓄率偏低，可考慮增加收入或減少支出'
    return '您的儲蓄率良好，繼續保持'
  })

  // 財務表情符號
  const financialHealthEmoji = computed(() => {
    const savingRate = savingsRate.value
    if (savingRate <= 0) return '😢'
    if (savingRate < 10) return '😐'
    return '😄'
  })

  // 異常支出檢測
  const detectUnusualExpenses = (categories: any[], currentMonthStats: any): any[] => {
    const result: any[] = []
    
    categories
      .filter(c => c.type === 'expense')
      .forEach(category => {
        const currentAmount = currentMonthStats.categories[category.id] || 0
        if (currentAmount > 0) {
          const averageAmount = calculateCategoryAverage(category.id)
          if (currentAmount > averageAmount * 1.5 && averageAmount > 0) {
            result.push({
              id: category.id,
              name: category.name,
              current: currentAmount,
              average: averageAmount,
              percentage: ((currentAmount - averageAmount) / averageAmount) * 100
            })
          }
        }
      })
    
    return result.sort((a, b) => b.percentage - a.percentage)
  }

  // 計算類別歷史平均
  const calculateCategoryAverage = (categoryId: string): number => {
    return 0 // This would need to be implemented with historical data
  }

  // 統一顏色系統輔助函數
  const getStatusColorClass = (type: string, value: number): string => {
    switch (type) {
      case 'expense':
        return 'text-red-600'
      case 'income':
        return 'text-green-600'
      case 'balance':
        return value >= 0 ? 'text-green-600' : 'text-red-600'
      case 'budget':
        return value >= 80 ? 'text-red-600' : value >= 50 ? 'text-yellow-600' : 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return {
    savingsRate,
    financialHealthClass,
    financialHealthStatus,
    financialAdvice,
    financialHealthEmoji,
    detectUnusualExpenses,
    getStatusColorClass
  }
} 