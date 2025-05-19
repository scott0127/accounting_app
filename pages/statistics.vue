<!-- pages/statistics.vue -->
<template>
  <div class="min-h-screen p-4 transition-all duration-300 space-y-6" :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`">
    <!-- 頁面標題 -->
    <div class="mb-2">
      <h1 class="text-2xl font-bold drop-shadow-sm" :class="`text-[${currentTheme.colors.text}]`">數據統計</h1>
      <p class="text-sm mt-1 font-medium" :class="`text-[${currentTheme.colors.textLight}]`">檢視您的財務概況</p>
    </div>

    <!-- 月份選擇器 - 增加陰影和邊框 -->
    <div class="flex items-center justify-between p-4 rounded-2xl shadow-lg border border-opacity-10" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <button class="p-3 rounded-full transition-transform hover:scale-110" 
              @click="previousMonth"
              :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.primary}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <div class="text-center">
        <h2 class="text-lg font-semibold" :class="`text-[${currentTheme.colors.text}]`">{{ currentMonthDisplay }}</h2>
      </div>
      
      <button class="p-3 rounded-full transition-transform hover:scale-110" 
              @click="nextMonth"
              :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.primary}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 收支概況 - 增強卡片視覺效果 -->
    <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <!-- 背景裝飾 -->
      <div class="absolute inset-0 opacity-5 bg-gradient-to-br"
           :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}20, transparent)`">
      </div>
      
      <h3 class="text-lg font-bold mb-4 relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
        <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.primary}`"></span>
        收支概況
      </h3>
      
      <div class="h-64 relative z-10 bg-opacity-60 rounded-lg p-2 border border-opacity-5"
           :class="`bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}]`">
        <template v-if="lineChartData">
          <Line
            :data="lineChartData"
            :options="getLineChartOptions()"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center" :class="`text-[${currentTheme.colors.textLight}]`">
          載入中...
        </div>
      </div>
    </div>

    <!-- 支出分類 -->
    <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <h3 class="text-lg font-bold mb-4 relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
        <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.error}`"></span>
        支出分類
      </h3>
      
      <div class="h-64 relative z-10 bg-opacity-60 rounded-lg p-2 border border-opacity-5"
           :class="`bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}]`">
        <template v-if="doughnutChartData">
          <DoughnutChart
            :data="doughnutChartData"
            :options="getDoughnutChartOptions()"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center" :class="`text-[${currentTheme.colors.textLight}]`">
          載入中...
        </div>
      </div>
      
      <!-- 分類列表 -->
      <div class="mt-6 space-y-2 relative z-10">
        <div
          v-for="category in sortedExpenseCategories"
          :key="category.id"
          class="flex items-center justify-between p-4 rounded-xl border border-opacity-5 transition-all duration-200"
          :class="`hover:bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}] bg-[${currentTheme.colors.background}] bg-opacity-40`"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                 :style="`background: linear-gradient(135deg, ${currentTheme.colors.error}20, ${currentTheme.colors.background})`">
              <span class="text-xl">{{ category.icon }}</span>
            </div>
            <span :class="`text-[${currentTheme.colors.text}]`">{{ category.name }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold" :class="`text-[${currentTheme.colors.error}]`">
              {{ formatAmount(category.amount) }}
            </p>
            <p class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">
              {{ category.percentage.toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 收入分類 -->
    <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <div class="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-10"
           :style="`background: radial-gradient(circle, ${currentTheme.colors.success}, ${currentTheme.colors.primary})`">
      </div>
      
      <h3 class="text-lg font-bold mb-4 relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
        <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.success}`"></span>
        收入分類
      </h3>
      
      <div class="h-64 relative z-10 bg-opacity-60 rounded-lg p-2 border border-opacity-5"
           :class="`bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}]`">
        <template v-if="incomeChartData">
          <DoughnutChart
            :data="incomeChartData"
            :options="getDoughnutChartOptions()"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center" :class="`text-[${currentTheme.colors.textLight}]`">
          載入中...
        </div>
      </div>
      
      <!-- 分類列表 -->
      <div class="mt-6 space-y-2 relative z-10">
        <div
          v-for="category in sortedIncomeCategories"
          :key="category.id"
          class="flex items-center justify-between p-4 rounded-xl border border-opacity-5 transition-all duration-200"
          :class="`hover:bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}] bg-[${currentTheme.colors.background}] bg-opacity-40`"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                 :style="`background: linear-gradient(135deg, ${currentTheme.colors.success}20, ${currentTheme.colors.background})`">
              <span class="text-xl">{{ category.icon }}</span>
            </div>
            <span :class="`text-[${currentTheme.colors.text}]`">{{ category.name }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold" :class="`text-[${currentTheme.colors.success}]`">
              {{ formatAmount(category.amount) }}
            </p>
            <p class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">
              {{ category.percentage.toFixed(1) }}%
            </p>
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
import { useTheme } from '~/composables/useTheme'
const { currentTheme } = useTheme();
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
        borderColor: currentTheme.value.colors.success,
        backgroundColor: `${currentTheme.value.colors.success}20`,
        tension: 0.4
      },
      {
        label: '支出',
        data: expenseData,
        borderColor: currentTheme.value.colors.error,
        backgroundColor: `${currentTheme.value.colors.error}20`,
        tension: 0.4
      },
      {
        label: '結餘',
        data: balanceData,
        borderColor: currentTheme.value.colors.primary,
        backgroundColor: `${currentTheme.value.colors.primary}20`,
        tension: 0.4
      }
    ]
  }
})

const getLineChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: currentTheme.value.colors.text,
          usePointStyle: true,
          padding: 20,
          font: {
            weight: 'bold',
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${currentTheme.value.colors.text}15`,
          drawBorder: true,
          borderWidth: 1,
          borderColor: `${currentTheme.value.colors.text}30`
        },
        ticks: {
          color: currentTheme.value.colors.text,
          font: {
            weight: '500'
          },
          padding: 8
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: currentTheme.value.colors.text,
          font: {
            weight: '500'
          },
          padding: 8
        }
      }
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        radius: 4,
        borderWidth: 2,
        backgroundColor: currentTheme.value.colors.surface
      }
    }
  }
}

const getDoughnutChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '65%',
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: currentTheme.value.colors.surface
      }
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

<style scoped>
/* 添加全局陰影效果 */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* 確保圖表容器有更好的可見度 */
.chart-container {
  position: relative;
  backdrop-filter: blur(8px);
}

/* 優化觸控體驗 */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  .space-y-6 > * + * {
    margin-top: 1.75rem;
  }
}

/* 添加滑動效果 */
.chart-fade-enter-active,
.chart-fade-leave-active {
  transition: all 0.3s ease;
}

.chart-fade-enter-from,
.chart-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>