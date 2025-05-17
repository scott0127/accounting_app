import { computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'

interface CategoryData {
  id: string;
  name: string;
  amount: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

export function useCharts(monthlyStats: any) {
  const store = useTransactionStore()
  
  // 圖表顏色
  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  const incomeChartColors = ['#10B981', '#3B82F6', '#8B5CF6']
  
  // 支出圖表數據
  const expenseChartData = computed<ChartData>(() => {
    const categories = store.categories
      .filter(c => c.type === 'expense')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    if (categories.length === 0) {
      return {
        labels: ['無支出'],
        datasets: [{
          data: [100],
          backgroundColor: ['#E5E7EB']
        }]
      }
    }

    return {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.amount),
        backgroundColor: chartColors
      }]
    }
  })

  // 收入圖表數據
  const incomeChartData = computed<ChartData>(() => {
    const categories = store.categories
      .filter(c => c.type === 'income')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    if (categories.length === 0) {
      return {
        labels: ['無收入'],
        datasets: [{
          data: [100],
          backgroundColor: ['#E5E7EB']
        }]
      }
    }

    return {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.amount),
        backgroundColor: incomeChartColors
      }]
    }
  })

  // 前三大支出類別
  const topExpenseCategories = computed<CategoryData[]>(() => {
    const categories = store.categories
      .filter(c => c.type === 'expense')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
    
    return categories.length === 0 ? [] : categories.slice(0, 3)
  })

  // 前三大收入類別
  const topIncomeCategories = computed<CategoryData[]>(() => {
    const categories = store.categories
      .filter(c => c.type === 'income')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
    
    return categories.length === 0 ? [] : categories.slice(0, 3)
  })

  // 所有支出類別
  const expenseCategories = computed<CategoryData[]>(() => {
    return store.categories
      .filter(c => c.type === 'expense')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  })

  // 所有收入類別
  const incomeCategories = computed<CategoryData[]>(() => {
    return store.categories
      .filter(c => c.type === 'income')
      .map(category => ({
        id: category.id,
        name: category.name,
        amount: monthlyStats.value.categories[category.id] || 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  })

  // 圖表選項
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw
            return `${context.label}: ${formatAmount(value)}`
          }
        }
      }
    }
  }

  // 詳細圖表選項
  const detailedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw
            return `${context.label}: ${formatAmount(value)}`
          }
        }
      }
    }
  }

  // 計算百分比
  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0'
    return ((amount / total) * 100).toFixed(1)
  }
  
  // 格式化金額
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    })
  }

  return {
    chartColors,
    incomeChartColors,
    expenseChartData,
    incomeChartData,
    topExpenseCategories,
    topIncomeCategories,
    expenseCategories,
    incomeCategories,
    doughnutOptions,
    detailedChartOptions,
    calculatePercentage,
    formatAmount
  }
} 