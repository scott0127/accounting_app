<!-- pages/statistics.vue -->
<template>
  <div class="p-4">
    <!-- 月份選擇器 -->
    <div class="flex items-center justify-between mb-6">
      <button class="p-2" @click="previousMonth">
        <span class="text-xl">←</span>
      </button>
      <h2 class="text-lg font-semibold">{{ currentMonthDisplay }}</h2>
      <button class="p-2" @click="nextMonth">
        <span class="text-xl">→</span>
      </button>
    </div>

    <!-- 收支概況 -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 class="text-base font-semibold mb-4">收支概況</h3>
      <div class="h-64">
        <template v-if="lineChartData">
          <Line
            :data="lineChartData"
            :options="lineChartOptions"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center text-gray-400">
          載入中...
        </div>
      </div>
    </div>

    <!-- 支出分類 -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 class="text-base font-semibold mb-4">支出分類</h3>
      <div class="h-64">
        <template v-if="doughnutChartData">
          <DoughnutChart
            :data="doughnutChartData"
            :options="doughnutChartOptions"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center text-gray-400">
          載入中...
        </div>
      </div>
      <!-- 分類列表 -->
      <div class="mt-6 space-y-3">
        <div
          v-for="category in sortedExpenseCategories"
          :key="category.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center">
            <span class="text-xl mr-2">{{ category.icon }}</span>
            <span>{{ category.name }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ formatAmount(category.amount) }}</p>
            <p class="text-xs text-gray-500">{{ category.percentage.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 收入分類 -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <h3 class="text-base font-semibold mb-4">收入分類</h3>
      <div class="h-64">
        <template v-if="incomeChartData">
          <DoughnutChart
            :data="incomeChartData"
            :options="doughnutChartOptions"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center text-gray-400">
          載入中...
        </div>
      </div>
      <!-- 分類列表 -->
      <div class="mt-6 space-y-3">
        <div
          v-for="category in sortedIncomeCategories"
          :key="category.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center">
            <span class="text-xl mr-2">{{ category.icon }}</span>
            <span>{{ category.name }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ formatAmount(category.amount) }}</p>
            <p class="text-xs text-gray-500">{{ category.percentage.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import dayjs from 'dayjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { Line } from 'vue-chartjs'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import { useSupabaseTransactions } from '~/composables/useSupabaseTransactions'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const store = useTransactionStore()
const { user } = useSupabaseAuth()
const { 
  transactions, 
  initialize: initializeSupabase,
  loading: transactionsLoading,
  getMonthlyStats
} = useSupabaseTransactions()

// 當前月份
const currentMonth = ref(dayjs().format('YYYY-MM'))

// 初始化資料
onMounted(async () => {
  if (user.value) {
    await initializeSupabase()
  }
})

// 月份顯示
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format('YYYY年M月')
})

// 月度統計 - 使用 Supabase 數據
const monthlyStats = computed(() => {
  return getMonthlyStats(currentMonth.value)
})

// 收支趨勢圖
const lineChartData = computed(() => {
  if (!monthlyStats.value) {
    return {
      labels: ['無資料'],
      datasets: [{
        data: [0],
        borderColor: '#E5E7EB',
        tension: 0.1
      }]
    }
  }

  const hasData = monthlyStats.value.totalIncome > 0 || monthlyStats.value.totalExpense > 0

  if (!hasData) {
    return {
      labels: ['無資料'],
      datasets: [{
        data: [0],
        borderColor: '#E5E7EB',
        tension: 0.1
      }]
    }
  }
  // 获取最近6个月的数据
  const months = []
  const incomeData = []
  const expenseData = []
  const balanceData = []

  for (let i = 5; i >= 0; i--) {
    const monthDate = dayjs(currentMonth.value).subtract(i, 'month')
    const monthKey = monthDate.format('YYYY-MM')
    const stats = getMonthlyStats(monthKey)
    
    months.push(monthDate.format('M月'))
    incomeData.push(stats.totalIncome)
    expenseData.push(stats.totalExpense)
    balanceData.push(stats.balance)
  }

  return {
    labels: months,
    datasets: [
      {
        label: '收入',
        data: incomeData,
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.1
      },
      {
        label: '支出',
        data: expenseData,
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        tension: 0.1
      },
      {
        label: '結餘',
        data: balanceData,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.1
      }
    ]
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// 支出分類統計
const expenseCategories = computed(() => {
  const total = monthlyStats.value.totalExpense
  return store.categories
    .filter(c => c.type === 'expense')
    .map(category => {
      // 使用 id 或名稱來查找類別金額
      const amount = monthlyStats.value.categories[category.id] || 0
      return {
        ...category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }
    })
})

const sortedExpenseCategories = computed(() => {
  return [...expenseCategories.value].sort((a, b) => b.amount - a.amount)
})

// 收入分類統計
const incomeCategories = computed(() => {
  const total = monthlyStats.value.totalIncome
  return store.categories
    .filter(c => c.type === 'income')
    .map(category => {
      // 使用 id 或名稱來查找類別金額
      const amount = monthlyStats.value.categories[category.id] || 0
      return {
        ...category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }
    })
})

const sortedIncomeCategories = computed(() => {
  return [...incomeCategories.value].sort((a, b) => b.amount - a.amount)
})

// 支出圓餅圖
const doughnutChartData = computed(() => {
  if (!sortedExpenseCategories.value || sortedExpenseCategories.value.length === 0) {
    return {
      labels: ['無支出資料'],
      datasets: [{
        data: [100],
        backgroundColor: ['#E5E7EB']
      }]
    }
  }

  return {
    labels: sortedExpenseCategories.value.map(c => c.name),
    datasets: [{
      data: sortedExpenseCategories.value.map(c => c.amount),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  }
})

// 收入圓餅圖
const incomeChartData = computed(() => {
  if (!sortedIncomeCategories.value || sortedIncomeCategories.value.length === 0) {
    return {
      labels: ['無收入資料'],
      datasets: [{
        data: [100],
        backgroundColor: ['#E5E7EB']
      }]
    }
  }

  return {
    labels: sortedIncomeCategories.value.map(c => c.name),
    datasets: [{
      data: sortedIncomeCategories.value.map(c => c.amount),
      backgroundColor: [
        '#10B981',
        '#3B82F6',
        '#8B5CF6'
      ]
    }]
  }
})

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

// 工具函數
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

// 月份切換
const previousMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).subtract(1, 'month').format('YYYY-MM')
}

const nextMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).add(1, 'month').format('YYYY-MM')
}
</script> 