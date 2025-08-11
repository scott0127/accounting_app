<template>
  <div
    :class="`min-h-screen transition-all duration-300 bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`"
  >
  <!-- 頂部欄由全域 layout 提供，首頁不再重複顯示標題與登出按鈕 -->

    <main class="max-w-md mx-auto w-full px-2 pb-24 pt-4">
      <!-- 未登入歡迎區塊 -->
      <div
        v-if="!user"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}22, ${currentTheme.colors.accent}22)`"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12"
            :style="`color: ${currentTheme.colors.primary}`"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h2
          class="text-2xl font-bold mb-2"
          :style="`color: ${currentTheme.colors.primary}`"
        >
          歡迎使用簡單記帳
        </h2>
        <p class="mb-8" :style="`color: ${currentTheme.colors.textLight}`">
          請登入以管理您的財務、追蹤收支和獲取財務洞察
        </p>
        <button
          @click="router.push('/auth')"
          class="px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
          :style="`background: linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent}); color: #fff;`"
        >
          註冊或登入帳號
        </button>
      </div>

      <!-- 已登入主頁內容 -->
      <div v-else>
        <!-- 財務健康卡片 -->
        <div
          class="rounded-2xl shadow-lg p-5 mb-6 relative overflow-hidden border"
          :style="`
            border-color: ${currentTheme.colors.primary}22;
            background: ${currentTheme.colors.surface}CC;
            backdrop-filter: blur(8px);
          `"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <!-- 左側主色圓點 -->
              <span
                class="inline-block w-3 h-3 rounded-full mr-3"
                :style="`background: ${currentTheme.colors.primary}`"
              ></span>
              <div>
                <h2
                  class="text-base font-semibold mb-1"
                  :style="`color: ${currentTheme.colors.primary}`"
                >
                  本月財務健康度
                </h2>
                <div
                  :class="financialHealth.class + ' shadow-sm'"
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium border"
                  :style="`
                    border-color: ${currentTheme.colors.primary}22;
                    background: ${currentTheme.colors.primary}08;
                    color: ${currentTheme.colors.primary};
                  `"
                >
                  {{ financialHealth.status }}
                </div>
                <p
                  class="text-sm mt-2"
                  :style="`color: ${currentTheme.colors.textLight}`"
                >
                  {{ financialHealth.advice }}
                </p>
              </div>
            </div>
            <div class="text-3xl">{{ financialHealth.emoji }}</div>
          </div>
        </div>

        <!-- 月份選擇器 -->
        <div
          class="flex items-center justify-between mb-6 p-3 rounded-xl shadow-md border"
          :style="`
            border-color: ${currentTheme.colors.primary}22;
            background: ${currentTheme.colors.surface}E6;
            backdrop-filter: blur(6px);
          `"
        >
          <button
            class="p-2 rounded-full transition-transform hover:scale-110 border bg-transparent"
            :style="`
              border-color: ${currentTheme.colors.primary}33;
              color: ${currentTheme.colors.primary};
              box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
            `"
            @click="handleMonthChange(-1)"
          >
            <span class="text-xl">←</span>
          </button>
          <div class="flex items-center">
            <h2
              class="text-lg font-semibold"
              :style="`color: ${currentTheme.colors.text}`"
            >
              {{ currentMonthDisplay }}
            </h2>
            <button
              class="ml-2 px-2 py-1 text-xs rounded-md transition-colors border"
              :style="`
                border-color: ${currentTheme.colors.primary}33;
                color: ${currentTheme.colors.primary};
                background: ${currentTheme.colors.primary}08;
              `"
              @click="handleMonthChange(0)"
            >
              今天
            </button>
          </div>
          <button
            class="p-2 rounded-full transition-transform hover:scale-110 border bg-transparent"
            :style="`
              border-color: ${currentTheme.colors.primary}33;
              color: ${currentTheme.colors.primary};
              box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
            `"
            @click="handleMonthChange(1)"
          >
            <span class="text-xl">→</span>
          </button>
        </div>

        <!-- 四大卡片區塊 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- 支出分析卡 -->
          <div
            class="card-interactive border-[${currentTheme.colors.error}22]"
            :style="`background: linear-gradient(135deg, ${currentTheme.colors.error}22 0%, ${currentTheme.colors.surface} 100%)`"
          >
            <div class="flex items-center justify-between mb-2">
              <h3
                class="text-base font-semibold"
                :style="`color: ${currentTheme.colors.error}`"
              >
                支出分析
              </h3>
              <button
                @click="showDetailedExpenseChart = true"
                class="text-xs underline font-medium"
                :style="`color: ${currentTheme.colors.error}`"
              >
                詳情
              </button>
            </div>
            <div class="h-36 flex items-center justify-center">
              <template v-if="expenseChartData">
                <DoughnutChart
                  :data="expenseChartData"
                  :options="doughnutOptions"
                />
              </template>
              <div v-else :style="`color: ${currentTheme.colors.textLight}`">
                無支出資料
              </div>
            </div>
            <p
              class="text-center mt-2 text-sm font-medium"
              :style="`color: ${currentTheme.colors.error}`"
            >
              {{ formatCurrency(monthlyStats.totalExpense) }}
            </p>
          </div>

          <!-- 收入分析卡 -->
          <div
            class="card-interactive border-[${currentTheme.colors.success}22]"
            :style="`background: linear-gradient(135deg, ${currentTheme.colors.success}22 0%, ${currentTheme.colors.surface} 100%)`"
          >
            <div class="flex items-center justify-between mb-2">
              <h3
                class="text-base font-semibold"
                :style="`color: ${currentTheme.colors.success}`"
              >
                收入分析
              </h3>
              <button
                @click="showDetailedIncomeChart = true"
                class="text-xs underline font-medium"
                :style="`color: ${currentTheme.colors.success}`"
              >
                詳情
              </button>
            </div>
            <div class="h-36 flex items-center justify-center">
              <template v-if="incomeChartData">
                <DoughnutChart
                  :data="incomeChartData"
                  :options="doughnutOptions"
                />
              </template>
              <div v-else :style="`color: ${currentTheme.colors.textLight}`">
                無收入資料
              </div>
            </div>
            <p
              class="text-center mt-2 text-sm font-medium"
              :style="`color: ${currentTheme.colors.success}`"
            >
              {{ formatCurrency(monthlyStats.totalIncome) }}
            </p>
          </div>

          <!-- 當月盈虧卡 -->
          <div
            class="card-interactive border-[${currentTheme.colors.accent}22]"
            :style="`background: linear-gradient(135deg, ${currentTheme.colors.accent}22 0%, ${currentTheme.colors.surface} 100%)`"
          >
            <h3
              class="text-base font-semibold mb-2"
              :style="`color: ${currentTheme.colors.accent}`"
            >
              當月盈虧
            </h3>
            <p
              class="text-2xl font-bold"
              :style="`color: ${
                monthlyStats.balance >= 0
                  ? currentTheme.colors.success
                  : currentTheme.colors.error
              }`"
            >
              {{ monthlyStats.balance >= 0 ? "+" : ""
              }}{{ formatCurrency(monthlyStats.balance) }}
            </p>
            <p
              class="text-sm mt-2"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              {{ monthlyStats.balance >= 0 ? "本月有結餘" : "本月超支" }}
            </p>
          </div>

          <!-- 剩餘預算卡（重新設計的水球動畫） -->
          <div
            class="card-interactive border-[${currentTheme.colors.primary}22] flex flex-col items-center justify-center relative"
            :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}22 0%, ${currentTheme.colors.surface} 100%)`"
          >
            <h3
              class="text-base font-semibold mb-3"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              剩餘預算
            </h3>
            
            <!-- 全新設計的百分比視覺效果 -->
            <div class="relative w-32 h-32 flex items-center justify-center mb-3 select-none">
              <svg
                viewBox="0 0 140 140"
                width="140"
                height="140"
                class="water-ball-enhanced"
              >
                <defs>
                  <!-- 增強的水波漸層 -->
                  <linearGradient
                    id="enhanced-water-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      :stop-color="budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.success : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.primary : currentTheme.colors.error"
                      stop-opacity="0.85"
                      offset="0%"
                    />
                    <stop
                      :stop-color="budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.primary : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.accent : currentTheme.colors.error"
                      stop-opacity="0.65"
                      offset="100%"
                    />
                  </linearGradient>
                  
                  <!-- 水面反光效果 -->
                  <linearGradient
                    id="water-shine"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop stop-color="white" stop-opacity="0.4" offset="0%" />
                    <stop stop-color="white" stop-opacity="0.1" offset="50%" />
                    <stop stop-color="white" stop-opacity="0" offset="100%" />
                  </linearGradient>
                  
                  <!-- 進度環漸層 -->
                  <linearGradient
                    id="progress-ring-gradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      :stop-color="budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.success : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.primary : currentTheme.colors.error"
                      offset="0%"
                    />
                    <stop
                      :stop-color="budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.primary : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.accent : currentTheme.colors.error"
                      offset="100%"
                    />
                  </linearGradient>
                  
                  <!-- 裁剪路徑 -->
                  <clipPath id="circle-clip-enhanced">
                    <circle cx="70" cy="70" r="55" />
                  </clipPath>
                  
                  <!-- 濾鏡效果 -->
                  <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  <!-- 水波動畫濾鏡 -->
                  <filter id="ripple-effect">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                  </filter>
                </defs>
                
                <!-- 外環進度指示器 -->
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="3"
                  opacity="0.3"
                />
                
                <!-- 動態進度環 -->
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="url(#progress-ring-gradient)"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="`${2 * Math.PI * 62}`"
                  :stroke-dashoffset="`${2 * Math.PI * 62 * (1 - budgetDisplay.waterPercent)}`"
                  transform="rotate(-90 70 70)"
                  class="progress-ring"
                  filter="url(#glow-effect)"
                />
                
                <!-- 主容器背景 -->
                <circle
                  cx="70"
                  cy="70"
                  r="55"
                  :fill="currentTheme.colors.surface"
                  stroke="#f3f4f6"
                  stroke-width="2"
                />
                
                <!-- 水波容器 -->
                <g clip-path="url(#circle-clip-enhanced)">
                  <!-- 主水波 -->
                  <path
                    :d="waterWavePath"
                    fill="url(#enhanced-water-gradient)"
                    class="main-wave"
                  />
                  
                  <!-- 第二層水波（增強層次感） -->
                  <path
                    :d="secondaryWavePath"
                    fill="url(#enhanced-water-gradient)"
                    opacity="0.6"
                    class="secondary-wave"
                  />
                  
                  <!-- 水面反光 -->
                  <ellipse
                    cx="70"
                    :cy="70 - (budgetDisplay.waterPercent * 55) + 15"
                    rx="35"
                    ry="6"
                    fill="url(#water-shine)"
                    class="water-reflection"
                  />
                  
                  <!-- 水泡效果 -->
                  <circle
                    v-for="(bubble, index) in waterBubbles"
                    :key="index"
                    :cx="bubble.x"
                    :cy="bubble.y"
                    :r="bubble.r"
                    fill="white"
                    :opacity="bubble.opacity"
                    class="water-bubble"
                    :style="`animation-delay: ${bubble.delay}s`"
                  />
                </g>
                
                <!-- 邊框強化 -->
                <circle
                  cx="70"
                  cy="70"
                  r="55"
                  fill="none"
                  :stroke="currentTheme.colors.primary"
                  stroke-width="2"
                  opacity="0.8"
                />
              </svg>
              
              <!-- 中央百分比顯示 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <div class="text-center">
                  <!-- 主要百分比數字 -->
                  <div 
                    class="text-2xl font-bold tabular-nums leading-none mb-1 percentage-display"
                    :style="`color: ${budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.textLight : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.textLight : currentTheme.colors.textLight}`"
                  >
                    {{ budgetDisplay.percentage }}%
                  </div>
                  
                  <!-- 狀態指示器 -->
                  <div class="flex items-center justify-center">
                    <span 
                      class="text-xs font-medium px-2 py-0.5 rounded-full budget-status"
                      :style="`
                        background: ${budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.text + '20' : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.text + '20' : currentTheme.colors.text + '20'};
                        color: ${budgetDisplay.waterPercent > 0.7 ? currentTheme.colors.text : budgetDisplay.waterPercent > 0.3 ? currentTheme.colors.text : currentTheme.colors.text};
                      `"
                    >
                      {{ budgetDisplay.waterPercent > 0.7 ? '充足' : budgetDisplay.waterPercent > 0.3 ? '適中' : '緊張' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p
              class="text-xl font-bold mb-1"
              :style="`color: ${
                remainingBudget >= 0
                  ? currentTheme.colors.success
                  : currentTheme.colors.error
              }`"
            >
              {{ formatCurrency(remainingBudget) }}
            </p>
            <p
              class="text-sm mb-2 text-center"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              {{ budgetDisplay.status }}
            </p>
            <button
              @click="handleSetBudget"
              class="mt-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-all border hover:scale-105"
              :style="`
                border-color: ${currentTheme.colors.primary}33; 
                background: ${currentTheme.colors.surface};
                color: ${currentTheme.colors.primary};
                box-shadow: 0 2px 8px ${currentTheme.colors.primary}11;
              `"
            >
              設定預算
            </button>
          </div>
        </div>

        <!-- 最近交易記錄區塊 -->
        <div
          class="rounded-2xl shadow-lg p-4 mb-6 relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
          :style="`
            background: linear-gradient(120deg, ${currentTheme.colors.primary}11 0%, ${currentTheme.colors.accent}11 100%), ${currentTheme.colors.surface};
            border: 1.5px solid ${currentTheme.colors.primary}33;
            box-shadow: 0 4px 24px 0 ${currentTheme.colors.primary}18;
            backdrop-filter: blur(8px);
          `"
        >
          <div class="flex items-center justify-between mb-4">
            <h3
              class="text-base font-semibold"
              :style="`color: ${currentTheme.colors.primary}`"
            >
              最近記錄
            </h3>
            <button
              class="text-xs underline font-medium rounded-full px-3 py-1 transition-all hover:shadow-md"
              :style="`
                color: ${currentTheme.colors.primary};
                background: ${currentTheme.colors.primary}08;
                box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
              `"
              @click="showAllTransactions = !showAllTransactions"
            >
              {{ showAllTransactions ? "收起" : "展開" }}
            </button>
          </div>
          <div class="space-y-2">
            <TransactionItem
              v-for="transaction in displayTransactions"
              :key="transaction.id"
              :transaction="transaction"
              :get-category-icon="getCategoryIcon"
              :get-category-name="getCategoryName"
              :format-date="formatDate"
              :format-currency="formatCurrency"
              @edit="editTransaction"
              @duplicate="duplicateTransaction"
              @delete="handleTransactionDelete"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Modal 組件 -->
    <!-- 支出詳情 Modal -->
    <div
      v-if="showDetailedExpenseChart"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :style="`background: linear-gradient(120deg, ${currentTheme.colors.error}11 0%, ${currentTheme.colors.surface}EE 100%)`"
      @click.self="showDetailedExpenseChart = false"
    >
      <div
        class="rounded-2xl shadow-xl p-6 w-[90vw] max-w-xs relative"
        :style="`background: ${currentTheme.colors.surface}; border: 2px solid ${currentTheme.colors.error}33;`"
      >
        <button
          class="absolute top-2 right-2 rounded-full p-1 transition hover:bg-[${currentTheme.colors.error}11]"
          :style="`color: ${currentTheme.colors.error}`"
          @click="showDetailedExpenseChart = false"
        >
          ✕
        </button>
        <h3
          class="text-lg font-bold mb-2"
          :style="`color: ${currentTheme.colors.error}`"
        >
          支出詳情
        </h3>
        <div class="h-48 mb-2" v-if="expenseChartData">
          <DoughnutChart
            :data="expenseChartData"
            :options="detailedChartOptions"
          />
        </div>
        <ul class="text-sm">
          <li
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="flex justify-between py-1"
          >
            <span>{{ cat.name }}</span>
            <span>{{ formatCurrency(cat.amount) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 收入詳情 Modal -->
    <div
      v-if="showDetailedIncomeChart"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :style="`background: linear-gradient(120deg, ${currentTheme.colors.success}11 0%, ${currentTheme.colors.surface}EE 100%)`"
      @click.self="showDetailedIncomeChart = false"
    >
      <div
        class="rounded-2xl shadow-xl p-6 w-[90vw] max-w-xs relative"
        :style="`background: ${currentTheme.colors.surface}; border: 2px solid ${currentTheme.colors.success}33;`"
      >
        <button
          class="absolute top-2 right-2 rounded-full p-1 transition hover:bg-[${currentTheme.colors.success}11]"
          :style="`color: ${currentTheme.colors.success}`"
          @click="showDetailedIncomeChart = false"
        >
          ✕
        </button>
        <h3
          class="text-lg font-bold mb-2"
          :style="`color: ${currentTheme.colors.success}`"
        >
          收入詳情
        </h3>
        <div class="h-48 mb-2" v-if="incomeChartData">
          <DoughnutChart
            :data="incomeChartData"
            :options="detailedChartOptions"
          />
        </div>
        <ul class="text-sm">
          <li
            v-for="cat in incomeCategories"
            :key="cat.id"
            class="flex justify-between py-1"
          >
            <span>{{ cat.name }}</span>
            <span>{{ formatCurrency(cat.amount) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 設定預算 Modal -->
    <div
      v-if="showBudgetModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :style="`background: rgba(0, 0, 0, 0.5)`"
      @click.self="showBudgetModal = false"
    >
      <div
        class="rounded-2xl shadow-xl p-6 w-[90vw] max-w-sm relative"
        :style="`background: ${currentTheme.colors.surface}; border: 2px solid ${currentTheme.colors.primary}33;`"
      >
        <button
          class="absolute top-2 right-2 rounded-full p-1 transition"
          :style="`color: ${currentTheme.colors.primary}`"
          @click="showBudgetModal = false"
        >
          ✕
        </button>
        <h3
          class="text-lg font-bold mb-4"
          :style="`color: ${currentTheme.colors.primary}`"
        >
          設定月預算
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">預算金額</label>
            <input
              v-model="budgetInput"
              type="number"
              placeholder="請輸入預算金額"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              :style="`border-color: ${currentTheme.colors.primary}33; focus:ring-color: ${currentTheme.colors.primary}33;`"
            />
          </div>
          <div class="flex space-x-2">
            <button
              @click="saveBudget(Number(budgetInput))"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
              :style="`background: ${currentTheme.colors.primary}; color: white;`"
            >
              確定
            </button>
            <button
              @click="showBudgetModal = false"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
              :style="`background: ${currentTheme.colors.surface}; color: ${currentTheme.colors.text}; border: 1px solid ${currentTheme.colors.primary}33;`"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Preferences } from '@capacitor/preferences'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import TransactionItem from '~/components/dashboard/TransactionItem.vue'

// Composables
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { useSupabaseTransactions } from '~/composables/useSupabaseTransactions'
import { useTheme } from '~/composables/useTheme'
import { useTransactionStore } from '~/stores/transaction'
import { useFormatters } from '~/composables/useFormatters'

// 註冊 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend)

// Router 和基礎狀態
const router = useRouter()
const { user } = useSupabaseAuth()
const { currentTheme } = useTheme()
const { formatCurrency, formatDate } = useFormatters()

// 交易和數據管理
const {
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
  loading: transactionsLoading
} = useSupabaseTransactions()

const store = useTransactionStore()

// 核心狀態
const currentMonth = ref(dayjs().format('YYYY-MM'))
const monthlyBudget = ref(9999)
const showDetailedExpenseChart = ref(false)
const showDetailedIncomeChart = ref(false)
const showAllTransactions = ref(false)
const showBudgetModal = ref(false)
const budgetInput = ref<string>('')

// 計算屬性 - 月份和統計
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format('YYYY年M月')
})

const monthlyStats = computed(() => {
  return getMonthlyStats(currentMonth.value)
})

const remainingBudget = computed(() => {
  return monthlyBudget.value - monthlyStats.value.totalExpense
})

// 財務健康狀況
const financialHealth = computed(() => {
  const income = monthlyStats.value.totalIncome
  const expense = monthlyStats.value.totalExpense
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0
  
  if (savingsRate <= 0) {
    return {
      status: '超支',
      emoji: '😢',
      class: 'bg-danger-100 text-danger-700',
      advice: '支出超過收入，建議縮減不必要的開支'
    }
  } else if (savingsRate < 10) {
    return {
      status: '警戒',
      emoji: '😐',
      class: 'bg-warning-100 text-warning-700',
      advice: '儲蓄率偏低，可考慮增加收入或減少支出'
    }
  }
  
  return {
    status: '穩健',
    emoji: '😄',
    class: 'bg-success-100 text-success-700',
    advice: '您的儲蓄率良好，繼續保持'
  }
})

// 預算顯示相關
const budgetDisplay = computed(() => {
  const waterPercent = monthlyBudget.value > 0 
    ? Math.max(0, Math.min(remainingBudget.value / monthlyBudget.value, 1))
    : 0
    
  const percentage = monthlyBudget.value > 0 
    ? (remainingBudget.value / monthlyBudget.value) * 100
    : 0
    
  const status = monthlyBudget.value === 0 
    ? '點擊下方按鈕設定預算'
    : percentage >= 80 
      ? '預算充足'
      : percentage >= 20 
        ? '預算即將用完'
        : '預算已用完'
        
  return {
    waterPercent,
    percentage: percentage.toFixed(1),
    status,
    amount: formatCurrency(remainingBudget.value),
    color: percentage >= 80 ? 'success' : percentage >= 20 ? 'warning' : 'error'
  }
})

// 交易顯示
const displayTransactions = computed(() => {
  if (!transactions.value || !Array.isArray(transactions.value)) {
    return []
  }

  const filtered = transactions.value.filter(t => 
    t.date.startsWith(currentMonth.value)
  ).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return showAllTransactions.value ? filtered : filtered.slice(0, 5)
})

// 圖表數據
const chartData = computed(() => {
  const expenseCategories = store.categories
    .filter(c => c.type === 'expense')
    .map(category => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const incomeCategories = store.categories
    .filter(c => c.type === 'income')
    .map(category => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return {
    expense: {
      categories: expenseCategories,
      chartData: expenseCategories.length > 0 ? {
        labels: expenseCategories.map(c => c.name),
        datasets: [{
          data: expenseCategories.map(c => c.amount),
          backgroundColor: ['#FF6384', '#3B82F6', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      } : null
    },
    income: {
      categories: incomeCategories,
      chartData: incomeCategories.length > 0 ? {
        labels: incomeCategories.map(c => c.name),
        datasets: [{
          data: incomeCategories.map(c => c.amount),
          backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6']
        }]
      } : null
    }
  }
})

const expenseChartData = computed(() => chartData.value.expense.chartData)
const incomeChartData = computed(() => chartData.value.income.chartData)
const expenseCategories = computed(() => chartData.value.expense.categories)
const incomeCategories = computed(() => chartData.value.income.categories)

// Chart 選項
const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  },
  cutout: '60%'
}))

const detailedChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  },
  cutout: '50%'
}))

// SVG 水波動畫路徑
const waterWavePath = computed(() => {
  const waterPercent = budgetDisplay.value.waterPercent
  const amplitude = 4
  const frequency = 0.025
  const phase = Date.now() * 0.002
  
  const baseY = 125 - (waterPercent * 110)
  let path = `M15,${baseY}`
  
  for (let x = 15; x <= 125; x += 3) {
    const y = baseY + amplitude * Math.sin(frequency * x + phase)
    path += ` L${x},${y}`
  }
  
  path += ` L125,125 L15,125 Z`
  return path
})

// 第二層水波路徑（增強視覺層次）
const secondaryWavePath = computed(() => {
  const waterPercent = budgetDisplay.value.waterPercent
  const amplitude = 3
  const frequency = 0.03
  const phase = Date.now() * 0.0015
  
  const baseY = 125 - (waterPercent * 110) + 5
  let path = `M15,${baseY}`
  
  for (let x = 15; x <= 125; x += 3) {
    const y = baseY + amplitude * Math.sin(frequency * x + phase + Math.PI / 4)
    path += ` L${x},${y}`
  }
  
  path += ` L125,125 L15,125 Z`
  return path
})

// 水泡動畫效果
const waterBubbles = computed(() => {
  const bubbleCount = 5
  const bubbles = []
  
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push({
      x: 45 + (i * 10) + Math.sin(Date.now() * 0.001 + i) * 5,
      y: 90 + Math.cos(Date.now() * 0.0008 + i) * 15,
      r: 1.5 + Math.sin(Date.now() * 0.002 + i) * 0.5,
      opacity: 0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2,
      delay: i * 0.5
    })
  }
  
  return bubbles
})

// 工具函數
const getCategoryIcon = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.icon || '📝'
}

const getCategoryName = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.name || categoryId
}

// 取得交易的次要分類（最多兩個）
const getSecondaryCategoryIds = (t: any): string[] => {
  if (Array.isArray(t?.category_ids) && t.category_ids.length > 1) {
    return t.category_ids.slice(1, 3).filter(Boolean)
  }
  return []
}

// 事件處理函數
// 登出由全域 layout 的 App Bar 控制；首頁保留未登入導向 /auth 按鈕

const handleMonthChange = (direction: number) => {
  if (direction === 0) {
    // 回到當月
    currentMonth.value = dayjs().format('YYYY-MM')
  } else {
    // 上/下月
    currentMonth.value = dayjs(currentMonth.value)
      .add(direction, 'month')
      .format('YYYY-MM')
  }
}

const handleSetBudget = () => {
  showBudgetModal.value = true
}

const saveBudget = async (budget: number) => {
  monthlyBudget.value = budget
  await Preferences.set({ key: 'monthlyBudget', value: String(budget) })
  showBudgetModal.value = false
}

const editTransaction = (transaction: any) => {
  // 編輯交易邏輯
  console.log('編輯交易:', transaction)
}

const duplicateTransaction = async (transaction: any) => {
  try {
    const { id, ...txWithoutId } = transaction
    await addTransaction(txWithoutId)
  } catch (error) {
    console.error('複製交易失敗:', error)
  }
}

const handleTransactionDelete = async (id: string) => {
  try {
    if (confirm('確定要刪除此交易？')) {
      await deleteTransaction(id)
    }
  } catch (error) {
    console.error('刪除交易失敗:', error)
  }
}

// 初始化
const initBudget = async () => {
  const { value } = await Preferences.get({ key: 'monthlyBudget' })
  if (value) {
    monthlyBudget.value = Number(value)
  }
}

// 生命周期
onMounted(() => {
  if (user.value) {
    initBudget()
  }
})

// SEO
useHead({
  title: '懶人記帳 - AI智能記帳助手',
  meta: [
    { name: 'description', content: 'AI智能分類記帳應用，讓記帳變得簡單有趣' }
  ]
})
</script>

<style scoped>
.card-interactive {
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  aspect-ratio: 4/5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.18s cubic-bezier(0.4, 2, 0.6, 1), box-shadow 0.18s;
  border: 1px solid;
  background: white;
}

.card-interactive:hover {
  transform: scale(1.04) translateY(-2px);
  box-shadow: 0 8px 32px 0 rgba(59, 130, 246, 0.1),
    0 2px 8px 0 rgba(0, 0, 0, 0.04);
  z-index: 2;
}

.water-ball {
  filter: drop-shadow(0 4px 16px #05966922);
  transition: all 0.3s ease;
  background: transparent;
}

.water-ball:hover {
  filter: drop-shadow(0 8px 32px #05966944);
  transform: scale(1.02);
}

.water-ball-enhanced {
  filter: drop-shadow(0 6px 20px rgba(59, 130, 246, 0.15));
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.water-ball-enhanced:hover {
  filter: drop-shadow(0 12px 40px rgba(59, 130, 246, 0.25));
  transform: scale(1.05);
}

.progress-ring {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-wave {
  transition: d 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-wave {
  transition: d 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.water-reflection {
  transition: cy 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.water-bubble {
  animation: bubble-float 3s ease-in-out infinite;
}

.percentage-display {
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.percentage-display:hover {
  transform: scale(1.05);
}

.budget-status {
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

@keyframes bubble-float {
  0%, 100% {
    transform: translateY(0px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-8px);
    opacity: 0.6;
  }
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 500px) {
  .water-ball {
    width: 96px;
    height: 96px;
  }
}

@keyframes ripple {
  0% {
    r: 20;
    opacity: 1;
  }
  50% {
    r: 35;
    opacity: 0.5;
  }
  100% {
    r: 50;
    opacity: 0;
  }
}

.water-ball circle[filter="url(#water-blur)"] {
  animation: ripple 3s infinite;
}
</style>
