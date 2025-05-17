import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { useTransactionStore } from '~/stores/transaction'
import dayjs from 'dayjs'

export function useBudget() {
  const store = useTransactionStore()
  const monthlyBudget = ref(0)
  const budgetInput = ref('')
  const showBudgetModal = ref(false)
  const smartBudgetRecommendation = ref(0)

  // 初始化預算
  const initBudget = async () => {
    const { value } = await Preferences.get({ key: 'monthlyBudget' })
    if (value) {
      monthlyBudget.value = Number(value)
    }
  }

  // 保存預算時觸發動畫
  const saveBudget = async () => {
    const budget = Number(budgetInput.value)
    if (budget >= 0) {
      monthlyBudget.value = budget
      await Preferences.set({ key: 'monthlyBudget', value: String(budget) })
      showBudgetModal.value = false
      budgetInput.value = ''
      return true // 返回成功標誌
    }
    return false
  }

  // 計算智能預算建議
  const calculateSmartBudgetRecommendation = () => {
    // 獲取過去3個月的支出平均值
    const today = dayjs()
    let sum = 0
    let count = 0
    
    for (let i = 1; i <= 3; i++) {
      const monthDate = today.subtract(i, 'month').format('YYYY-MM')
      const stats = store.getMonthlyStats(monthDate)
      
      sum += stats.totalExpense
      count++
    }
    
    if (count > 0) {
      const average = sum / count
      smartBudgetRecommendation.value = Math.round(average)
    }
  }

  // 使用建議的預算
  const useSuggestedBudget = () => {
    budgetInput.value = String(smartBudgetRecommendation.value)
    saveBudget()
  }

  // 獲取預算百分比
  const getBudgetPercentage = (totalExpense: number): string => {
    if (monthlyBudget.value === 0) return '尚未設定'
    const percentage = ((monthlyBudget.value - totalExpense) / monthlyBudget.value * 100)
    return `剩餘 ${percentage.toFixed(1)}%`
  }

  // 獲取預算使用寬度
  const getBudgetPercentageWidth = (totalExpense: number): string => {
    if (monthlyBudget.value === 0) return '0%'
    const percentage = (totalExpense / monthlyBudget.value) * 100
    return `${Math.min(percentage, 100)}%`
  }

  // 獲取預算高度百分比
  const getBudgetPercentageHeight = (totalExpense: number): string => {
    if (monthlyBudget.value === 0) return '0%'
    const percentage = ((monthlyBudget.value - totalExpense) / monthlyBudget.value) * 100
    return `${Math.max(Math.min(percentage, 100), 0)}%`
  }

  // 獲取環形進度條的值
  const getBudgetCircleValue = (totalExpense: number): string => {
    if (monthlyBudget.value === 0) return '0 440'
    
    // 計算百分比
    const percentage = (monthlyBudget.value - totalExpense) / monthlyBudget.value
    const validPercentage = Math.max(0, Math.min(percentage, 1))
    
    // 計算圓周長 (2 * PI * r，r = 70)
    const circumference = 2 * Math.PI * 70
    
    // 計算最終值
    return `${validPercentage * circumference} ${circumference}`
  }

  // 更新預算狀態文字
  const getBudgetStatus = (totalExpense: number): string => {
    if (monthlyBudget.value === 0) return '點擊下方按鈕設定預算'
    const percentage = totalExpense / monthlyBudget.value
    if (percentage >= 1) return '預算已用完'
    if (percentage >= 0.8) return '預算即將用完'
    return '預算充足'
  }

  return {
    monthlyBudget,
    budgetInput,
    showBudgetModal,
    smartBudgetRecommendation,
    initBudget,
    saveBudget,
    calculateSmartBudgetRecommendation,
    useSuggestedBudget,
    getBudgetPercentage,
    getBudgetPercentageWidth,
    getBudgetPercentageHeight,
    getBudgetCircleValue,
    getBudgetStatus
  }
} 