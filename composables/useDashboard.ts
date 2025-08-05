// composables/useDashboard.ts
import { ref, computed, watch } from 'vue'
import { useSupabaseTransactions } from './useSupabaseTransactions'
import { useBudget } from './useBudget'
import { useHealthStatus } from './useHealthStatus'
import { useErrorHandler } from './useErrorHandler'
import type { Transaction } from '~/types'

export const useDashboard = () => {
  const { 
    error,
    clearError,
    setError,
    withErrorHandling
  } = useErrorHandler()
  const { 
    transactions, 
    loading: transactionsLoading,
    getMonthlyStats 
  } = useSupabaseTransactions()
  const { monthlyBudget } = useBudget()

  // State
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())
  const isLoading = ref(false)
  
  // Computed values
  const monthlyStats = computed(() => {
    try {
      const monthKey = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`
      const stats = getMonthlyStats(monthKey)
      
      return {
        totalIncome: stats.totalIncome || 0,
        totalExpense: stats.totalExpense || 0,
        balance: (stats.totalIncome || 0) - (stats.totalExpense || 0),
        remainingBudget: monthlyBudget.value - (stats.totalExpense || 0)
      }
    } catch (error) {
      setError(error, 'monthlyStats')
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        remainingBudget: 0
      }
    }
  })

  const { financialHealthStatus, financialAdvice } = useHealthStatus({
    monthlyBudget,
    monthlyStats
  })

  // Simplified stats for UI display
  const displayStats = computed(() => ({
    income: monthlyStats.value.totalIncome,
    expense: monthlyStats.value.totalExpense,
    balance: monthlyStats.value.balance,
    remainingBudget: monthlyStats.value.remainingBudget
  }))

  const incomeChangeText = computed(() => {
    try {
      const prevMonth = currentMonth.value === 1 ? 12 : currentMonth.value - 1
      const prevYear = currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value
      const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
      
      const prevStats = getMonthlyStats(prevMonthKey)
      const change = displayStats.value.income - (prevStats.totalIncome || 0)
      return change >= 0 ? `增加 ${formatCurrency(change)}` : `減少 ${formatCurrency(Math.abs(change))}`
    } catch {
      return '無法計算'
    }
  })

  const expenseChangeText = computed(() => {
    try {
      const prevMonth = currentMonth.value === 1 ? 12 : currentMonth.value - 1
      const prevYear = currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value
      const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
      
      const prevStats = getMonthlyStats(prevMonthKey)
      const change = displayStats.value.expense - (prevStats.totalExpense || 0)
      return change >= 0 ? `增加 ${formatCurrency(change)}` : `減少 ${formatCurrency(Math.abs(change))}`
    } catch {
      return '無法計算'
    }
  })

  const balanceSubtitle = computed(() => {
    return displayStats.value.balance >= 0 ? '盈餘狀態' : '虧損狀態'
  })

  const budgetSubtitle = computed(() => {
    const usagePercentage = monthlyBudget.value ? 
      Math.round((displayStats.value.expense / monthlyBudget.value) * 100) : 0
    return `${usagePercentage}% 已使用`
  })

  // Methods
  const handleMonthChange = (month: number) => {
    currentMonth.value = month
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth.value === 1) {
        currentMonth.value = 12
        currentYear.value -= 1
      } else {
        currentMonth.value -= 1
      }
    } else {
      if (currentMonth.value === 12) {
        currentMonth.value = 1
        currentYear.value += 1
      } else {
        currentMonth.value += 1
      }
    }
  }

  const goToCurrentMonth = () => {
    currentMonth.value = new Date().getMonth() + 1
    currentYear.value = new Date().getFullYear()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date)
  }

  return {
    // State
    currentMonth,
    currentYear,
    isLoading: computed(() => isLoading.value || transactionsLoading.value),
    error,
    
    // Computed
    monthlyStats: displayStats,
    incomeChangeText,
    expenseChangeText,
    balanceSubtitle,
    budgetSubtitle,
    financialHealthStatus,
    financialAdvice,
    
    // Methods
    handleMonthChange,
    changeMonth,
    goToCurrentMonth,
    formatCurrency,
    formatDate,
    clearError
  }
}
