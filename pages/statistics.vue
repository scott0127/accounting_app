<!-- pages/statistics.vue -->
<template>
  <div
    class="min-h-screen transition-all duration-300"
    :style="{
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text
    }"
  >
    <main class="max-w-md mx-auto w-full px-3 pb-28 pt-4 space-y-6">
    <!-- 頁面標題 -->
    <div class="mb-2">
      <h1 class="text-2xl font-bold drop-shadow-sm" :class="`text-[${currentTheme.colors.text}]`">數據統計</h1>
      <p class="text-sm mt-1 font-medium" :class="`text-[${currentTheme.colors.textLight}]`">檢視您的財務概況</p>
    </div>

    <!-- 月份選擇器 - 增加陰影和邊框 -->
  <div class="flex items-center justify-between p-4 rounded-2xl shadow-lg border border-opacity-10 hover-glow" 
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

    <!-- 每日支出熱力圖 -->
  <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm fade-in-up" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <h3 class="text-lg font-bold mb-4 relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
        <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.error}`"></span>
        每日支出熱力圖
      </h3>

      <!-- 週標題 -->
      <div class="grid grid-cols-7 text-xs mb-2" :class="`text-[${currentTheme.colors.textLight}]`">
        <div class="text-center">日</div>
        <div class="text-center">一</div>
        <div class="text-center">二</div>
        <div class="text-center">三</div>
        <div class="text-center">四</div>
        <div class="text-center">五</div>
        <div class="text-center">六</div>
      </div>

      <!-- 熱力圖格子 -->
      <div class="grid grid-cols-7 gap-1.5">
        <template v-for="cell in heatmapCells" :key="cell.key">
          <div v-if="cell.isEmpty" class="h-8 rounded-md opacity-30" :style="`background:${currentTheme.colors.background}`"></div>
          <div v-else
               class="h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-transform hover:scale-105"
               :style="getHeatCellStyle(cell.value)"
               :title="`${cell.date}：${formatAmount(cell.value || 0)}`">
            {{ cell.day }}
          </div>
        </template>
      </div>

      <!-- 圖例 -->
      <div class="flex items-center justify-end gap-2 mt-3" :class="`text-[${currentTheme.colors.textLight}]`">
        <span class="text-xs">低</span>
        <div class="flex items-center gap-1.5">
          <div v-for="lvl in 5" :key="lvl" class="w-5 h-3 rounded-sm" :style="getHeatLegendStyle(lvl)"></div>
        </div>
        <span class="text-xs">高</span>
      </div>
    </div>

    <!-- 收支概況 - 增強卡片視覺效果 -->
    <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <!-- 背景裝飾 -->
      <div class="absolute inset-0 opacity-5 bg-gradient-to-br"
           :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}20, transparent)`">
      </div>
      
      <h3 class="text-lg font-bold mb-3 relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
        <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.primary}`"></span>
        收支概況
      </h3>
      <!-- KPI + Sparklines -->
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="rounded-xl p-3 hover-glow" :style="`background:${currentTheme.colors.background}; border:1px solid ${currentTheme.colors.text}15`">
          <div class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">收入</div>
          <div class="text-sm font-bold mt-0.5" :class="`text-[${currentTheme.colors.success}]`">{{ formatAmount(monthlyStats.totalIncome) }}</div>
          <div class="h-10 mt-1">
            <Line :data="sparkIncomeData" :options="sparkOptions(currentTheme.colors.success)" />
          </div>
        </div>
        <div class="rounded-xl p-3 hover-glow" :style="`background:${currentTheme.colors.background}; border:1px solid ${currentTheme.colors.text}15`">
          <div class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">支出</div>
          <div class="text-sm font-bold mt-0.5" :class="`text-[${currentTheme.colors.error}]`">{{ formatAmount(monthlyStats.totalExpense) }}</div>
          <div class="h-10 mt-1">
            <Line :data="sparkExpenseData" :options="sparkOptions(currentTheme.colors.error)" />
          </div>
        </div>
        <div class="rounded-xl p-3 hover-glow" :style="`background:${currentTheme.colors.background}; border:1px solid ${currentTheme.colors.text}15`">
          <div class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">結餘</div>
          <div class="text-sm font-bold mt-0.5" :style="`color:${monthlyStats.balance>=0?currentTheme.colors.success:currentTheme.colors.error}`">{{ formatAmount(monthlyStats.balance) }}</div>
          <div class="h-10 mt-1">
            <Line :data="sparkBalanceData" :options="sparkOptions(currentTheme.colors.primary)" />
          </div>
        </div>
      </div>

      <!-- Segmented control for line view -->
      <div class="flex items-center justify-end mb-2">
        <div class="inline-flex rounded-full p-0.5" :style="`background:${currentTheme.colors.text}12; border:1px solid ${currentTheme.colors.text}15`">
          <button class="px-3 py-1 text-xs rounded-full" :style="lineView==='months'?`background:${currentTheme.colors.primary}; color:#fff`:'color:'+currentTheme.colors.text" @click="lineView='months'">最近6個月</button>
          <button class="px-3 py-1 text-xs rounded-full" :style="lineView==='days'?`background:${currentTheme.colors.primary}; color:#fff`:'color:'+currentTheme.colors.text" @click="lineView='days'">本月每日</button>
        </div>
      </div>
      
      <div class="h-64 relative z-10 bg-opacity-60 rounded-lg p-2 border border-opacity-5"
           :class="`bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}]`">
        <template v-if="lineChartData">
          <Line
            :data="lineChartData"
            :options="getLineChartOptions()"
            :plugins="lineChartPlugins"
          />
        </template>
        <div v-else class="h-full flex items-center justify-center shimmer rounded-lg" :class="`text-[${currentTheme.colors.textLight}]`">
          
        </div>
      </div>
    </div>

    <!-- 類別總覽（分頁：支出/收入/氣泡） -->
  <div class="rounded-2xl shadow-lg border border-opacity-10 p-6 relative overflow-hidden backdrop-blur-sm fade-in-up" 
         :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.text}]`">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold relative z-10 drop-shadow-sm flex items-center gap-2" :class="`text-[${currentTheme.colors.text}]`">
          <span class="inline-block w-1 h-6 rounded-full" :style="`background: ${currentTheme.colors.error}`"></span>
          類別總覽
        </h3>
        <div class="inline-flex rounded-full p-0.5" :style="`background:${currentTheme.colors.text}12; border:1px solid ${currentTheme.colors.text}15`">
          <button class="px-3 py-1 text-xs rounded-full" :style="categoryTab==='expense'?`background:${currentTheme.colors.error}; color:#fff`:'color:'+currentTheme.colors.text" @click="categoryTab='expense'">支出</button>
          <button class="px-3 py-1 text-xs rounded-full" :style="categoryTab==='income'?`background:${currentTheme.colors.success}; color:#fff`:'color:'+currentTheme.colors.text" @click="categoryTab='income'">收入</button>
          <button class="px-3 py-1 text-xs rounded-full" :style="categoryTab==='bubble'?`background:${currentTheme.colors.primary}; color:#fff`:'color:'+currentTheme.colors.text" @click="categoryTab='bubble'">氣泡</button>
        </div>
      </div>
      
      <div v-if="categoryTab!=='bubble'" class="h-64 relative z-10 bg-opacity-60 rounded-lg p-2 border border-opacity-5"
           :class="`bg-[${currentTheme.colors.background}] border-[${currentTheme.colors.text}]`">
        <template v-if="(categoryTab==='expense'?doughnutChartData:incomeChartData)">
          <DoughnutChart
            ref="categoryChartRef"
            :data="categoryTab==='expense'?doughnutChartData:incomeChartData"
            :options="getDoughnutChartOptions()"
            :plugins="[getDoughnutCenterText(categoryTab==='expense'?'expense':'income')]"
          />
          <div class="absolute top-2 right-2 flex gap-2">
            <button class="text-xs px-2 py-1 rounded" :style="`background:${currentTheme.colors.text}15; color:${currentTheme.colors.text}`" @click="downloadCurrentChart">下載PNG</button>
            <button class="text-xs px-2 py-1 rounded" :style="`background:${currentTheme.colors.text}15; color:${currentTheme.colors.text}`" @click="toggleCategoryTable">{{ showCategoryTable? '隱藏表格':'顯示表格' }}</button>
          </div>
        </template>
        <div v-else class="h-full flex items-center justify-center" :class="`text-[${currentTheme.colors.textLight}]`">載入中...</div>
      </div>

      <div v-else class="relative z-10">
        <div v-if="bubbles.length" class="flex flex-wrap gap-3 justify-center items-center py-2">
          <div
            v-for="b in bubbles"
            :key="b.id"
            class="rounded-full flex flex-col items-center justify-center text-center shadow-sm border overflow-hidden"
            :style="{
              width: b.size + 'px',
              height: b.size + 'px',
              background: `radial-gradient( circle at 30% 30%, ${currentTheme.colors.accent}26, transparent 60%), linear-gradient(135deg, ${currentTheme.colors.error}33, ${currentTheme.colors.primary}33)`,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.text + '25'
            }"
          >
            <div class="text-base leading-none">{{ b.icon }}</div>
            <div class="text-[10px] opacity-90 mt-1 px-1 truncate max-w-[90%]">{{ b.name }}</div>
            <div class="text-[10px] font-semibold opacity-80 mt-0.5">{{ formatCompact(b.amount) }}</div>
          </div>
        </div>
        <div v-else class="text-center py-10" :class="`text-[${currentTheme.colors.textLight}]`">本月尚無支出資料</div>
      </div>

      <!-- 分類資料表 -->
      <div v-if="showCategoryTable && categoryTab!=='bubble'" class="mt-4 overflow-hidden rounded-lg border border-opacity-5" :class="`border-[${currentTheme.colors.text}]`">
        <table class="w-full text-sm">
          <thead :class="`bg-[${currentTheme.colors.background}]`">
            <tr>
              <th class="text-left p-2">類別</th>
              <th class="text-right p-2">金額</th>
              <th class="text-right p-2">占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in (categoryTab==='expense'?sortedExpenseCategories:sortedIncomeCategories)" :key="c.id" :class="`border-t border-[${currentTheme.colors.text}] border-opacity-5`">
              <td class="p-2">{{ c.icon }} {{ c.name }}</td>
              <td class="p-2 text-right">{{ formatAmount(c.amount) }}</td>
              <td class="p-2 text-right">{{ c.percentage.toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    
    </main>
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

// 收支趨勢圖：支援 最近6個月 / 本月每日
const lineView = ref<'months' | 'days'>('months')
// 類別區塊分頁：支出/收入/氣泡
const categoryTab = ref<'expense' | 'income' | 'bubble'>('expense')
const showCategoryTable = ref(false)
const categoryChartRef = ref<any>(null)
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
  // scriptable gradient for area fill
  const areaGradient = (hex: string) => (ctx: any) => {
    const chart = ctx.chart
    const { ctx: c, chartArea } = chart
    if (!chartArea) return hex + '20'
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    g.addColorStop(0, hex + '33')
    g.addColorStop(1, hex + '00')
    return g
  }

  if (lineView.value === 'months') {
    // 最近6個月
    const months: string[] = []
    const incomeData: number[] = []
    const expenseData: number[] = []
    const balanceData: number[] = []
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
          backgroundColor: areaGradient(currentTheme.value.colors.success),
          fill: true,
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 12,
          pointBorderWidth: 2,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.success,
        },
        {
          label: '支出',
          data: expenseData,
          borderColor: currentTheme.value.colors.error,
          backgroundColor: areaGradient(currentTheme.value.colors.error),
          fill: true,
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 12,
          pointBorderWidth: 2,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.error,
        },
        {
          label: '結餘',
          data: balanceData,
          borderColor: currentTheme.value.colors.primary,
          backgroundColor: areaGradient(currentTheme.value.colors.primary),
          fill: true,
          borderDash: [4, 4],
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 12,
          pointBorderWidth: 2,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.primary,
        }
      ]
    }
  } else {
    // 本月每日
    const start = dayjs(currentMonth.value + '-01')
    const days = start.daysInMonth()
    const labels: string[] = []
    const incomeData: number[] = []
    const expenseData: number[] = []
    const balanceData: number[] = []
    for (let d = 1; d <= days; d++) {
      const date = start.date(d).format('YYYY-MM-DD')
      labels.push(String(d))
      const inc = dailyIncomeMap.value[date] || 0
      const exp = dailyExpenseMap.value[date] || 0
      incomeData.push(inc)
      expenseData.push(exp)
      balanceData.push(inc - exp)
    }
    return {
      labels,
      datasets: [
        {
          label: '收入',
          data: incomeData,
          borderColor: currentTheme.value.colors.success,
          backgroundColor: areaGradient(currentTheme.value.colors.success),
          fill: true,
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 8,
          pointBorderWidth: 1,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.success,
        },
        {
          label: '支出',
          data: expenseData,
          borderColor: currentTheme.value.colors.error,
          backgroundColor: areaGradient(currentTheme.value.colors.error),
          fill: true,
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 8,
          pointBorderWidth: 1,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.error,
        },
        {
          label: '結餘',
          data: balanceData,
          borderColor: currentTheme.value.colors.primary,
          backgroundColor: areaGradient(currentTheme.value.colors.primary),
          fill: true,
          borderDash: [4, 4],
          tension: 0.45,
          cubicInterpolationMode: 'monotone' as const,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 8,
          pointBorderWidth: 1,
          pointBackgroundColor: currentTheme.value.colors.surface,
          pointBorderColor: currentTheme.value.colors.primary,
        }
      ]
    }
  }
})

const getLineChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: currentTheme.value.colors.text,
          usePointStyle: true,
          padding: 20,
          font: {
            weight: 'bold' as const,
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: currentTheme.value.colors.surface,
        titleColor: currentTheme.value.colors.text,
        bodyColor: currentTheme.value.colors.text,
        borderColor: currentTheme.value.colors.text + '22',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => {
            const v = typeof ctx.raw === 'number' ? ctx.raw : Number(ctx.raw || 0)
            return `${ctx.dataset.label}: ${formatAmount(v)}`
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
            weight: 500
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
            weight: 500
          },
          padding: 8
        }
      }
    },
    elements: {
      line: {
        borderWidth: 3,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const
      },
      point: {
        radius: 3,
        hoverRadius: 6,
        hitRadius: 12,
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

// 視覺插件：線條陰影與垂直輔助線
const lineChartPlugins = computed(() => {
  const lineShadow = {
    id: 'lineShadow',
    beforeDatasetDraw(chart: any, args: any) {
      if (args.meta?.type !== 'line') return
      const { ctx } = chart
      ctx.save()
      ctx.shadowColor = currentTheme.value.colors.text + '22'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 2
    },
    afterDatasetDraw(chart: any, args: any) {
      if (args.meta?.type !== 'line') return
      chart.ctx.restore()
    }
  }
  const hoverLine = {
    id: 'hoverLine',
    afterDatasetsDraw(chart: any) {
      const t = chart.tooltip
      if (!t || typeof t.getActiveElements !== 'function') return
      const active = t.getActiveElements()
      if (!active || !active.length) return
      const { chartArea, ctx } = chart
      const x = active[0].element?.x
      if (typeof x !== 'number') return
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = currentTheme.value.colors.text + '33'
      ctx.stroke()
      ctx.restore()
    }
  }
  return [lineShadow, hoverLine]
})

// ========== 熱力圖資料 ==========
const monthlyExpenseTx = computed(() =>
  transactions.value
    .filter(t => t.date.startsWith(currentMonth.value))
    .filter(t => t.type === 'expense')
)

const dailyExpenseMap = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  for (const t of monthlyExpenseTx.value) {
    map[t.date] = (map[t.date] || 0) + t.amount
  }
  return map
})

// 本月每日收入
const monthlyIncomeTx = computed(() =>
  transactions.value
    .filter(t => t.date.startsWith(currentMonth.value))
    .filter(t => t.type === 'income')
)

const dailyIncomeMap = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  for (const t of monthlyIncomeTx.value) {
    map[t.date] = (map[t.date] || 0) + t.amount
  }
  return map
})

const heatmapMax = computed(() => {
  const vals = Object.values(dailyExpenseMap.value)
  return vals.length ? Math.max(...vals) : 0
})

const heatmapCells = computed(() => {
  const start = dayjs(currentMonth.value + '-01')
  const days = start.daysInMonth()
  const offset = start.day() // 0=Sun
  const cells: Array<{ key: string; isEmpty: boolean; day?: number; date?: string; value?: number }> = []
  for (let i = 0; i < offset; i++) cells.push({ key: 'e' + i, isEmpty: true })
  for (let d = 1; d <= days; d++) {
    const date = start.date(d).format('YYYY-MM-DD')
    const value = dailyExpenseMap.value[date] || 0
    cells.push({ key: date, isEmpty: false, day: d, date, value })
  }
  return cells
})

const getHeatLevel = (value: number) => {
  if (!heatmapMax.value) return 0
  const ratio = value / heatmapMax.value
  if (ratio >= 0.8) return 5
  if (ratio >= 0.6) return 4
  if (ratio >= 0.4) return 3
  if (ratio >= 0.2) return 2
  if (ratio > 0) return 1
  return 0
}

const getHeatCellStyle = (value = 0) => {
  const lvl = getHeatLevel(value)
  const alpha = ['08','12','24','40','66','80'][lvl]
  const bg = lvl === 0 ? currentTheme.value.colors.background : currentTheme.value.colors.error + alpha
  return {
    background: bg,
    color: currentTheme.value.colors.text,
    border: `1px solid ${currentTheme.value.colors.text}22`
  }
}

const getHeatLegendStyle = (lvl: number) => {
  const alpha = ['08','12','24','40','66'][(lvl - 1) as number] || '08'
  return {
    background: currentTheme.value.colors.error + alpha,
    border: `1px solid ${currentTheme.value.colors.text}22`
  }
}

// ========== 類別氣泡圖資料 ==========
const bubbles = computed(() => {
  const items = sortedExpenseCategories.value.filter(c => c.amount > 0).slice(0, 12)
  if (!items.length) return [] as Array<{ id: string; name: string; icon: string; amount: number; size: number }>
  const max = Math.max(...items.map(i => i.amount)) || 1
  return items.map(i => {
    const base = 44 // 最小直徑
    const extra = 56 * Math.sqrt(i.amount / max) // 以面積感受縮放
    const size = Math.round(base + extra)
    return { id: i.id, name: i.name, icon: i.icon, amount: i.amount, size }
  })
})

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return Math.round(n / 10000) + '萬'
  if (n >= 10_000) return Math.round(n / 1000) + 'k'
  return n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })
}

// ========== KPI Sparklines ==========
const makeDateRange = (n: number) => {
  const arr: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    arr.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return arr
}

const sparkLabels = computed(() => makeDateRange(14).map(d => dayjs(d).format('M/D')))

const sparkIncomeData = computed(() => {
  const dates = makeDateRange(14)
  const map: Record<string, number> = {}
  for (const t of transactions.value.filter(t => t.type === 'income')) {
    if (dates[0] <= t.date && t.date <= dates[dates.length - 1]) {
      map[t.date] = (map[t.date] || 0) + t.amount
    }
  }
  const data = dates.map(d => map[d] || 0)
  return {
    labels: sparkLabels.value,
    datasets: [{
      data,
      borderColor: currentTheme.value.colors.success,
      backgroundColor: currentTheme.value.colors.success + '1A',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  }
})

const sparkExpenseData = computed(() => {
  const dates = makeDateRange(14)
  const map: Record<string, number> = {}
  for (const t of transactions.value.filter(t => t.type === 'expense')) {
    if (dates[0] <= t.date && t.date <= dates[dates.length - 1]) {
      map[t.date] = (map[t.date] || 0) + t.amount
    }
  }
  const data = dates.map(d => map[d] || 0)
  return {
    labels: sparkLabels.value,
    datasets: [{
      data,
      borderColor: currentTheme.value.colors.error,
      backgroundColor: currentTheme.value.colors.error + '1A',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  }
})

const sparkBalanceData = computed(() => {
  const dates = makeDateRange(14)
  const incomeMap: Record<string, number> = {}
  const expenseMap: Record<string, number> = {}
  for (const t of transactions.value) {
    if (dates[0] <= t.date && t.date <= dates[dates.length - 1]) {
      if (t.type === 'income') incomeMap[t.date] = (incomeMap[t.date] || 0) + t.amount
      if (t.type === 'expense') expenseMap[t.date] = (expenseMap[t.date] || 0) + t.amount
    }
  }
  const data = dates.map(d => (incomeMap[d] || 0) - (expenseMap[d] || 0))
  return {
    labels: sparkLabels.value,
    datasets: [{
      data,
      borderColor: currentTheme.value.colors.primary,
      backgroundColor: currentTheme.value.colors.primary + '10',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  }
})

const sparkOptions = (color: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: currentTheme.value.colors.surface,
      titleColor: currentTheme.value.colors.text,
      bodyColor: currentTheme.value.colors.text,
      padding: 6,
      displayColors: false
    }
  },
  scales: {
    x: { display: false },
    y: { display: false }
  },
  elements: {
    line: { borderCapStyle: 'round' as const, borderJoinStyle: 'round' as const },
    point: { radius: 0 }
  },
  layout: { padding: 0 }
})

// ========== Doughnut 中央 KPI ==========
const getDoughnutCenterText = (kind: 'expense' | 'income') => ({
  id: 'center-text-' + kind,
  afterDraw(chart: any) {
    const { ctx, chartArea } = chart
    if (!chartArea) return
    const centerX = (chartArea.left + chartArea.right) / 2
    const centerY = (chartArea.top + chartArea.bottom) / 2
    const total = kind === 'expense' ? monthlyStats.value.totalExpense : monthlyStats.value.totalIncome
    ctx.save()
    ctx.fillStyle = currentTheme.value.colors.text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial'
    ctx.fillText(kind === 'expense' ? '本月支出' : '本月收入', centerX, centerY - 12)
    ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial'
    ctx.fillText(formatAmount(total), centerX, centerY + 10)
    ctx.restore()
  }
})

// UI actions
const toggleCategoryTable = () => {
  showCategoryTable.value = !showCategoryTable.value
}

const downloadCurrentChart = () => {
  const inst = (categoryChartRef.value as any)?.chart
  if (!inst) return
  const url = inst.toBase64Image('image/png', 1)
  const a = document.createElement('a')
  a.href = url
  a.download = categoryTab.value === 'expense' ? 'expense-categories.png' : 'income-categories.png'
  a.click()
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