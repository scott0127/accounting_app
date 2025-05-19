<template>
  <div
    :class="`min-h-screen transition-all duration-300 bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`"
  >
    <!-- 主題色動態頂部欄 -->
    <header
      :class="`flex items-center justify-between px-4 h-16 sticky top-0 z-30 shadow-sm bg-[${currentTheme.colors.surface}]/80 backdrop-blur-md`"
    >
      <h1
        class="text-xl font-bold tracking-tight"
        :style="{ color: currentTheme.colors.accent }"
      >
        懶人記帳-AI幫你分類
      </h1>
      <button
        v-if="user"
        @click="handleLogout"
        class="btn-logout flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        :style="`background: linear-gradient(90deg, ${currentTheme.colors.error}, ${currentTheme.colors.accent}); color: #fff;`"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7"
          />
        </svg>
        登出
      </button>
      <button
        v-else
        @click="router.push('/auth')"
        class="btn-login flex items-center px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :style="`background: linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent}); color: #fff;`"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
        登入/註冊
      </button>
    </header>

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
                  :class="financialHealthClass + ' shadow-sm'"
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium border"
                  :style="`
            border-color: ${currentTheme.colors.primary}22;
            background: ${currentTheme.colors.primary}08;
            color: ${currentTheme.colors.primary};
          `"
                >
                  {{ financialHealthStatus }}
                </div>
                <p
                  class="text-sm mt-2"
                  :style="`color: ${currentTheme.colors.textLight}`"
                >
                  {{ financialAdvice }}
                </p>
              </div>
            </div>
            <div class="text-3xl">{{ financialHealthEmoji }}</div>
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
            @click="previousMonth"
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
              @click="goToCurrentMonth"
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
            @click="nextMonth"
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
              {{ formatAmount(monthlyStats.totalExpense) }}
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
              {{ formatAmount(monthlyStats.totalIncome) }}
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
              }}{{ formatAmount(monthlyStats.balance) }}
            </p>
            <p
              class="text-sm mt-2"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              {{ monthlyStats.balance >= 0 ? "本月有結餘" : "本月超支" }}
            </p>
          </div>

          <!-- 剩餘預算卡（圓形水球動畫） -->
          <div
            class="card-interactive border-[${currentTheme.colors.primary}22] flex flex-col items-center justify-center relative"
            :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}22 0%, ${currentTheme.colors.surface} 100%)`"
          >
            <h3
              class="text-base font-semibold mb-2"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              剩餘預算
            </h3>
            <div
              class="relative w-32 h-32 flex items-center justify-center mb-2 select-none"
            >
              <!-- 水球 SVG -->
              <svg
                viewBox="0 0 128 128"
                width="128"
                height="128"
                class="water-ball"
              >
                <defs>
                  <clipPath id="circle-clip">
                    <circle cx="64" cy="64" r="60" />
                  </clipPath>
                  <!-- 主水波漸層 -->
                  <linearGradient
                    :id="'water-gradient'"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      :stop-color="currentTheme.colors.primary"
                      stop-opacity="0.8"
                      offset="0%"
                    />
                    <stop
                      :stop-color="currentTheme.colors.accent"
                      stop-opacity="0.6"
                      offset="100%"
                    />
                  </linearGradient>
                  <!-- 水波光澤效果 -->
                  <linearGradient
                    id="shine-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop stop-color="white" stop-opacity="0.3" offset="0%" />
                    <stop stop-color="white" stop-opacity="0" offset="100%" />
                  </linearGradient>
                  <!-- 額外的裝飾效果 -->
                  <filter id="water-blur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                  </filter>
                </defs>
                <!-- 外圓 -->
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  :fill="currentTheme.colors.surface"
                  stroke="#ddd"
                  stroke-width="4"
                />
                <g clip-path="url(#circle-clip)">
                  <!-- 主要水波 -->
                  <path
                    :d="waterWavePath"
                    :fill="`url(#water-gradient)`"
                    :style="{ transition: 'd 0.7s cubic-bezier(.4,2,.6,1)' }"
                  />
                  <!-- 光澤層 -->
                  <path
                    :d="waterWavePath"
                    fill="url(#shine-gradient)"
                    opacity="0.6"
                    transform="translate(0, -2)"
                  />
                  <!-- 裝飾性水波紋 -->
                  <circle
                    :cy="64 + 60 - 120 * waterPercent"
                    cx="64"
                    r="30"
                    fill="white"
                    opacity="0.1"
                    filter="url(#water-blur)"
                  />
                  <!-- 水面反光 -->
                  <ellipse
                    cx="64"
                    :cy="64 - 60 * waterPercent + 20"
                    rx="28"
                    ry="8"
                    fill="white"
                    fill-opacity="0.18"
                  />
                </g>
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  :stroke="currentTheme.colors.primary"
                  stroke-width="2"
                />
              </svg>
              <!-- 百分比文字 -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
              >
                <span class="text-l font-semibold text-black">
                  {{ getBudgetPercentage() }}
                </span>
              </div>
            </div>
            <div class="group relative">
              <p
                class="text-2xl font-bold tracking-tight transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg drop-shadow-sm"
                :class="{
                  'animate-[bounce_2s_ease-in-out_infinite]':
                    remainingBudget < 0,
                  'animate-[pulse_2s_ease-in-out_infinite]':
                    remainingBudget > monthlyBudget * 0.8,
                  'font-quicksand': true, // 使用 Quicksand 字體
                }"
              >
                <span
                  class="relative inline-block transform hover:rotate-2 transition-transform"
                >
                  <!-- 療癒感氣泡背景 -->
                  <span
                    class="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl -z-10"
                  ></span>

                  <!-- 金額文字 -->
                  <span
                    class="relative inline-flex items-center font-rounded leading-relaxed tracking-wider"
                    :style="`color: ${
                      remainingBudget >= 0
                        ? currentTheme.colors.success
                        : currentTheme.colors.error
                    }`"
                  >
                    {{ formatAmount(remainingBudget) }}
                  </span>

                  <!-- 可愛底線動畫 -->
                  <span
                    class="absolute -bottom-1 left-0 h-1 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100"
                    :style="`background: ${
                      remainingBudget >= 0
                        ? currentTheme.colors.success
                        : currentTheme.colors.error
                    }`"
                  ></span>
                </span>

                <!-- 療癒感漸層光暈 -->
                <span
                  class="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-20 blur-xl"
                  :style="`background: radial-gradient(circle at center, ${
                    remainingBudget >= 0
                      ? currentTheme.colors.success + '33'
                      : currentTheme.colors.error + '33'
                  } 0%, transparent 70%)`"
                ></span>
              </p>

              <!-- 變化指示器加上可愛動畫 -->
              <div
                class="absolute -right-4 top-0 text-sm font-medium transition-all duration-300 transform hover:scale-110"
                :class="{
                  'opacity-0 translate-y-2': !showChangeIndicator,
                  'opacity-100 translate-y-0': showChangeIndicator,
                }"
                :style="`color: ${
                  remainingBudget >= 0
                    ? currentTheme.colors.success
                    : currentTheme.colors.error
                }`"
              >
                <span class="inline-block animate-bounce">
                  {{ remainingBudget >= 0 ? "↑" : "↓" }}
                </span>
              </div>
            </div>
            <p
              class="text-sm mt-2"
              :style="`color: ${currentTheme.colors.textLight}`"
            >
              {{ getBudgetStatus() }}
            </p>
            <button
              @click="showBudgetModal = true"
              class="mt-2 px-3 py-1.5 text-xs rounded-lg font-medium transition-all border border-[${currentTheme.colors.primary}33] bg-[${currentTheme.colors.surface}]"
              :style="`color: ${currentTheme.colors.primary}`"
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
            <div
              v-for="transaction in displayTransactions"
              :key="transaction.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 transition-all group/item hover:bg-[${currentTheme.colors.primary}07] hover:shadow-md rounded-xl"
              :style="`
                border-color: ${currentTheme.colors.primary}22;
                background: transparent;
              `"
            >
              <div class="flex items-center mb-2 sm:mb-0">
                <span
                  class="text-xl mr-3 flex items-center justify-center rounded-full shadow-sm transition-all"
                  :style="`
                    color: ${
                      transaction.type === 'income'
                        ? currentTheme.colors.success
                        : currentTheme.colors.error
                    };
                    background: ${
                      transaction.type === 'income'
                        ? currentTheme.colors.success + '18'
                        : currentTheme.colors.error + '18'
                    };
                    box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
                    width: 2.5rem; height: 2.5rem;
                  `"
                >
                  {{ getCategoryIcon(transaction.category) }}
                </span>
                <div>
                  <p
                    class="font-medium"
                    :style="`color: ${currentTheme.colors.text}`"
                  >
                    {{ getCategoryName(transaction.category) }}
                  </p>
                  <p
                    class="text-xs"
                    :style="`color: ${currentTheme.colors.textLight}`"
                  >
                    {{ formatDate(transaction.date) }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center justify-between sm:justify-end w-full sm:w-auto"
              >
                <span
                  class="font-semibold mr-3"
                  :style="`color: ${
                    transaction.type === 'income'
                      ? currentTheme.colors.success
                      : currentTheme.colors.error
                  }`"
                >
                  {{ transaction.type === "income" ? "+" : "-"
                  }}{{ formatAmount(transaction.amount) }}
                </span>
                <div class="flex space-x-2">
                  <button
                    @click="editTransaction(transaction)"
                    class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
                    :style="`
                      color: ${currentTheme.colors.textLight};
                      background: ${currentTheme.colors.primary}10;
                      box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
                    `"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6H3v6z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="duplicateTransaction(transaction)"
                    class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
                    :style="`
                      color: ${currentTheme.colors.textLight};
                      background: ${currentTheme.colors.accent}10;
                      box-shadow: 0 2px 8px 0 ${currentTheme.colors.accent}11;
                    `"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16h8M8 12h8m-8-4h8"
                      />
                    </svg>
                  </button>
                  <button
                    @click="handleTransactionDelete(transaction.id)"
                    class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
                    :style="`
                      color: ${currentTheme.colors.error};
                      background: ${currentTheme.colors.error}10;
                      box-shadow: 0 2px 8px 0 ${currentTheme.colors.error}11;
                    `"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useTransactionStore } from "~/stores/transaction";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut as DoughnutChart } from "vue-chartjs";
import dayjs from "dayjs";
import { Preferences } from "@capacitor/preferences";
import TransactionModal from "~/components/dashboard/TransactionModal.vue";
import { useRouter } from "vue-router";
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";
import { useSupabaseTransactions } from "~/composables/useSupabaseTransactions";
import { useTheme } from "~/composables/useTheme";

const router = useRouter();
const { user, signOut } = useSupabaseAuth();

// 註冊 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend);

const store = useTransactionStore();
const {
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  initialize: initializeSupabase,
  loading: transactionsLoading,
  getMonthlyStats,
} = useSupabaseTransactions();
const showBudgetModal = ref(false);
const budgetInput = ref("");
const monthlyBudget = ref(9999);
const showFinancialGoalModal = ref(false);
const { currentTheme } = useTheme();
// 登出處理函數
const handleLogout = async () => {
  try {
    await signOut();
    // 轉到登入頁面
    router.push("/auth");
  } catch (error) {
    console.error("登出失敗:", error);
  }
};

// 確保檢測設備方向變化
const isLandscape = ref(false);
const showSmallScreenTooltips = ref(false);

// 增強的 onMounted
onMounted(() => {
  // 只有在用戶已登入時才初始化預算和財務目標
  if (user.value) {
    initBudget();
    initFinancialGoals();
    calculateSmartBudgetRecommendation();
  }

  // 添加方向變化偵聽器
  window.addEventListener("resize", checkOrientation);
  checkOrientation();

  // 添加滑動手勢監聽
  setupSwipeListeners();

  // 如果是新用戶，顯示引導提示
  if (user.value) {
    checkIfNewUser();
  }
});

// 檢查用戶是否為新用戶
const checkIfNewUser = async () => {
  const { value } = await Preferences.get({ key: "hasSeenTutorial" });
  if (!value) {
    showTutorial.value = true;
    await Preferences.set({ key: "hasSeenTutorial", value: "true" });
  }
};

const mountainPercent = computed(() => {
  if (monthlyBudget.value === 0) return 0;
  return Math.max(0, Math.min(remainingBudget.value / monthlyBudget.value, 1));
});
const mountainHeight = computed(() => 80 * mountainPercent.value + 8); // 最低8, 最高88
const mountainY = computed(() => 104 - mountainHeight.value);
const mountainColor = computed(() => {
  if (mountainPercent.value > 0.8) return "#34D399"; // 綠
  if (mountainPercent.value > 0.5) return "#6EE7B7"; // 淺綠
  if (mountainPercent.value > 0.2) return "#FCD34D"; // 黃
  if (mountainPercent.value > 0) return "#FCA5A5"; // 紅
  return "#F87171"; // 用完
});
const billCount = computed(() => {
  if (monthlyBudget.value === 0) return 0;
  const percent = Math.max(
    0,
    Math.min(remainingBudget.value / monthlyBudget.value, 1)
  );
  if (percent === 0) return 0;
  if (percent > 0.8) return 5;
  if (percent > 0.6) return 4;
  if (percent > 0.4) return 3;
  if (percent > 0.2) return 2;
  return 1;
});

const budgetStatus = computed(() => {
  if (monthlyBudget.value === 0) return "unset";
  const percent = remainingBudget.value / monthlyBudget.value;
  if (percent > 0.3) return "add"; // 充足：搬進
  if (percent > 0) return "remove"; // 不太足夠：搬走
  return "empty"; // 用完
});
// 設置滑動監聽
const setupSwipeListeners = () => {
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX - touchEndX > 50) {
      // 向左滑動
      nextMonth();
    }

    if (touchEndX - touchStartX > 50) {
      // 向右滑動
      previousMonth();
    }
  };

  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchend", handleTouchEnd, false);
};

// 檢查屏幕方向
const checkOrientation = () => {
  isLandscape.value = window.innerWidth > window.innerHeight;
};

// 當前月份
const currentMonth = ref(dayjs().format("YYYY-MM"));

// 月份顯示
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format("YYYY年M月");
});

// 月度統計
const monthlyStats = computed(() => {
  // 使用 useSupabaseTransactions 提供的方法獲取月度統計
  return getMonthlyStats(currentMonth.value);
});

// 餘額顏色
const balanceColor = computed(() => {
  return monthlyStats.value.balance >= 0
    ? "text-success-500"
    : "text-danger-500";
});

// 剩餘預算顏色
const remainingBudgetColor = computed(() => {
  return remainingBudget.value >= 0 ? "text-blue-500" : "text-red-500";
});

// 剩餘預算
const remainingBudget = computed(() => {
  return monthlyBudget.value - monthlyStats.value.totalExpense;
});
const showChangeIndicator = ref(false);

// 監聽預算變化
watch(remainingBudget, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    showChangeIndicator.value = true;
    setTimeout(() => {
      showChangeIndicator.value = false;
    }, 2000);
  }
});
// 儲蓄率
const savingsRate = computed(() => {
  if (monthlyStats.value.totalIncome === 0) return 0;
  return (monthlyStats.value.balance / monthlyStats.value.totalIncome) * 100;
});

// 異常支出檢測
const unusualExpenses = computed(() => {
  // 從本月支出中找出異常高於歷史平均的支出
  const categories = store.categories.filter((c) => c.type === "expense");
  const result = [];

  categories.forEach((category) => {
    const currentAmount = monthlyStats.value.categories[category.id] || 0;
    if (currentAmount > 0) {
      const averageAmount = calculateCategoryAverage(category.id);
      if (currentAmount > averageAmount * 1.5 && averageAmount > 0) {
        result.push({
          id: category.id,
          name: category.name,
          current: currentAmount,
          average: averageAmount,
          percentage: ((currentAmount - averageAmount) / averageAmount) * 100,
        });
      }
    }
  });

  return result.sort((a, b) => b.percentage - a.percentage);
});

// 計算類別歷史平均
const calculateCategoryAverage = (categoryId) => {
  // 獲取過去3個月的數據
  const today = dayjs();
  let sum = 0;
  let count = 0;

  for (let i = 1; i <= 3; i++) {
    const monthDate = today.subtract(i, "month").format("YYYY-MM");
    const stats = store.getMonthlyStats(monthDate);
    const amount = stats.categories[categoryId] || 0;

    if (amount > 0) {
      sum += amount;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
};

// 財務目標
const financialGoals = ref([]);

// 初始化財務目標
const initFinancialGoals = async () => {
  const { value } = await Preferences.get({ key: "financialGoals" });
  if (value) {
    financialGoals.value = JSON.parse(value);
  }
};

// 保存財務目標
const saveFinancialGoal = async () => {
  const goal = {
    id: Date.now().toString(),
    type: goalType.value,
    amount: Number(goalAmount.value),
    deadline: Number(goalDeadline.value),
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs()
      .add(Number(goalDeadline.value), "month")
      .format("YYYY-MM-DD"),
    progress: 0,
  };

  financialGoals.value.push(goal);
  await Preferences.set({
    key: "financialGoals",
    value: JSON.stringify(financialGoals.value),
  });
  showFinancialGoalModal.value = false;
  goalType.value = "savings";
  goalAmount.value = 0;
  goalDeadline.value = "1";
};

// 計算智能預算建議
const calculateSmartBudgetRecommendation = () => {
  // 獲取過去3個月的支出平均值
  const today = dayjs();
  let sum = 0;
  let count = 0;

  for (let i = 1; i <= 3; i++) {
    const monthDate = today.subtract(i, "month").format("YYYY-MM");
    const stats = store.getMonthlyStats(monthDate);

    sum += stats.totalExpense;
    count++;
  }

  if (count > 0) {
    const average = sum / count;
    smartBudgetRecommendation.value = Math.round(average);
  }
};

// 智能預算建議
const smartBudgetRecommendation = ref(0);

// 使用建議的預算
const useSuggestedBudget = () => {
  budgetInput.value = String(smartBudgetRecommendation.value);
  saveBudget();
};

// 支出圖表數據
const expenseChartData = computed(() => {
  const categories = store.categories
    .filter((c) => c.type === "expense")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  if (categories.length === 0) {
    return {
      labels: ["無支出"],
      datasets: [
        {
          data: [100],
          backgroundColor: ["#E5E7EB"],
        },
      ],
    };
  }

  return {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: chartColors,
      },
    ],
  };
});

// 收入圖表數據
const incomeChartData = computed(() => {
  const categories = store.categories
    .filter((c) => c.type === "income")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  if (categories.length === 0) {
    return {
      labels: ["無收入"],
      datasets: [
        {
          data: [100],
          backgroundColor: ["#E5E7EB"],
        },
      ],
    };
  }

  return {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: incomeChartColors,
      },
    ],
  };
});

// 圖表顏色
const chartColors = [
  "#FF6384",
  "#3B82F6",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];
const incomeChartColors = ["#10B981", "#3B82F6", "#8B5CF6"];

// 幫助提示功能
const tooltips = {
  financialHealth: "根據您的預算使用情況和儲蓄率計算的總體財務健康度",
  expenseChart: "您的各項支出佔比分析",
  incomeChart: "您的各項收入來源佔比",
  balance: "當月收入減去支出的餘額",
  budget: "您設定的當月預算限制",
  transactions: "最近記錄的交易",
};

// 顯示提示
const showTooltip = ref("");
const showTooltipInfo = (key) => {
  showTooltip.value = key;
  setTimeout(() => {
    showTooltip.value = "";
  }, 3000);
};

// 圖表選項
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const value = context.raw;
          return `${context.label}: ${formatAmount(value)}`;
        },
      },
    },
  },
};

// 詳細圖表選項
const detailedChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "right",
      labels: {
        boxWidth: 12,
        font: {
          size: 10,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const value = context.raw;
          return `${context.label}: ${formatAmount(value)}`;
        },
      },
    },
  },
};

// 最近交易
const recentTransactions = computed(() => {
  // 確保 transactions 存在且是陣列
  if (!transactions.value || !Array.isArray(transactions.value)) {
    return [];
  }

  return transactions.value
    .filter((t) => t.date.startsWith(currentMonth.value))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

// 顯示交易列表
const displayTransactions = computed(() => {
  // 確保 transactions 存在且是陣列
  if (!transactions.value || !Array.isArray(transactions.value)) {
    return [];
  }

  return showAllTransactions.value
    ? transactions.value.filter((t) => t.date.startsWith(currentMonth.value))
    : recentTransactions.value;
});

// 按類型過濾類別
const categoriesByType = (type) => {
  return store.categories.filter((c) => c.type === type);
};

// 教學導覽
const showTutorial = ref(false);
const tutorialStep = ref(0);
const tutorialSteps = [
  {
    title: "歡迎使用財務管理應用",
    description: "這個應用將幫助您追蹤和管理個人財務。",
  },
  { title: "財務健康度", description: "這裡顯示您本月的財務狀況概覽。" },
  { title: "收支分析", description: "圖表顯示您的收入和支出分類。" },
  { title: "預算設置", description: "設定每月預算來管理您的支出。" },
  { title: "交易記錄", description: "查看和管理您的所有交易記錄。" },
  { title: "財務目標", description: "設定儲蓄目標來實現您的財務計劃。" },
];

// 下一個教學步驟
const nextTutorialStep = () => {
  if (tutorialStep.value < tutorialSteps.length - 1) {
    tutorialStep.value++;
  } else {
    showTutorial.value = false;
  }
};

// 工具函數
const formatAmount = (amount: number) => {
  return amount.toLocaleString("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  });
};

const formatDate = (date: string) => {
  return dayjs(date).format("M/D");
};

const getCategoryIcon = (categoryId: string) => {
  return store.categories.find((c) => c.id === categoryId)?.icon || "📝";
};

const getCategoryName = (categoryId: string) => {
  return store.categories.find((c) => c.id === categoryId)?.name || categoryId;
};

// 計算百分比
const calculatePercentage = (amount: number, total: number) => {
  if (total === 0) return 0;
  return ((amount / total) * 100).toFixed(1);
};

// 月份切換
const previousMonth = () => {
  currentMonth.value = dayjs(currentMonth.value)
    .subtract(1, "month")
    .format("YYYY-MM");
};

const nextMonth = () => {
  currentMonth.value = dayjs(currentMonth.value)
    .add(1, "month")
    .format("YYYY-MM");
};

// 返回當月
const goToCurrentMonth = () => {
  currentMonth.value = dayjs().format("YYYY-MM");
};

// 小豬狀態
const isWiggling = ref(false);

// 小豬顏色
const pigColor = computed(() => {
  if (monthlyBudget.value === 0) return "#F9A8D4"; // 淺粉色
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "#FCA5A5"; // 紅色
  if (percentage >= 0.8) return "#FCD34D"; // 黃色
  return "#F9A8D4"; // 粉色
});

// 眼睛樣式
const eyeStyle = computed(() => {
  if (monthlyBudget.value === 0) return "w-2 h-2 rounded-full bg-gray-800"; // 普通眼睛
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1)
    return 'w-2 h-2 rounded-full bg-gray-800 before:content-["×"]'; // 難過的眼睛
  if (percentage >= 0.8)
    return "w-2 h-2 rounded-full bg-gray-800 animate-pulse"; // 擔心的眼睛
  return "w-2 h-2 rounded-full bg-gray-800"; // 開心的眼睛
});

// 預算進度條顏色
const budgetProgressColor = computed(() => {
  if (monthlyBudget.value === 0) return "#E5E7EB";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "#EF4444"; // 紅色
  if (percentage >= 0.8) return "#F59E0B"; // 黃色
  return "#10B981"; // 綠色
});

// 獲取預算使用寬度
const getBudgetPercentageWidth = () => {
  if (monthlyBudget.value === 0) return "0%";
  const percentage =
    (monthlyStats.value.totalExpense / monthlyBudget.value) * 100;
  return `${Math.min(percentage, 100)}%`;
};

// 預算液體顏色
const budgetLiquidColor = computed(() => {
  if (monthlyBudget.value === 0) return "rgba(0, 153, 255, 0.5)";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "rgba(255, 99, 71, 0.5)"; // 紅色
  if (percentage >= 0.8) return "rgba(255, 165, 0, 0.5)"; // 橙色
  return "rgba(0, 153, 255, 0.5)"; // 藍色
});

// 預算文字顏色
const budgetTextColor = computed(() => {
  if (monthlyBudget.value === 0) return "text-gray-500";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "text-danger-600";
  if (percentage >= 0.8) return "text-warning-600";
  return "text-success-600";
});

// 獲取預算高度百分比
const getBudgetPercentageHeight = () => {
  if (monthlyBudget.value === 0) return "0%";
  const percentage = (remainingBudget.value / monthlyBudget.value) * 100;
  return `${Math.max(Math.min(percentage, 100), 0)}%`;
};

// 更新預算狀態文字
const getBudgetStatus = () => {
  if (monthlyBudget.value === 0) return "點擊下方按鈕設定預算";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "預算已用完";
  if (percentage >= 0.8) return "預算即將用完";
  return "預算充足";
};

// 保存預算時觸發動畫
const saveBudget = async () => {
  const budget = Number(budgetInput.value);
  if (budget >= 0) {
    monthlyBudget.value = budget;
    await Preferences.set({ key: "monthlyBudget", value: String(budget) });
    showBudgetModal.value = false;
    budgetInput.value = "";
    // 觸發小豬搖動動畫
    isWiggling.value = true;
    setTimeout(() => {
      isWiggling.value = false;
    }, 500);
  }
};

// 初始化預算
const initBudget = async () => {
  const { value } = await Preferences.get({ key: "monthlyBudget" });
  if (value) {
    monthlyBudget.value = Number(value);
  }
};

// 獲取預算百分比
const getBudgetPercentage = () => {
  if (monthlyBudget.value === 0) return "尚未設定";
  const percentage = (remainingBudget.value / monthlyBudget.value) * 100;
  return `剩餘 ${percentage.toFixed(1)}%`;
};

// 統一顏色系統輔助函數
const getStatusColorClass = (type, value) => {
  switch (type) {
    case "expense":
      return "text-red-600";
    case "income":
      return "text-green-600";
    case "balance":
      return value >= 0 ? "text-green-600" : "text-red-600";
    case "budget":
      return value >= 80
        ? "text-red-600"
        : value >= 50
        ? "text-yellow-600"
        : "text-green-600";
    default:
      return "text-gray-600";
  }
};

// 新增的計算屬性和方法
const financialHealthClass = computed(() => {
  const savingRate = savingsRate.value;
  if (savingRate <= 0) return "bg-danger-100 text-danger-700";
  if (savingRate < 10) return "bg-warning-100 text-warning-700";
  return "bg-success-100 text-success-700";
});

const financialHealthStatus = computed(() => {
  const savingRate = savingsRate.value;
  if (savingRate <= 0) return "超支";
  if (savingRate < 10) return "警戒";
  return "穩健";
});

const financialAdvice = computed(() => {
  const savingRate = savingsRate.value;
  if (savingRate <= 0) return "支出超過收入，建議縮減不必要的開支";
  if (savingRate < 10) return "儲蓄率偏低，可考慮增加收入或減少支出";
  return "您的儲蓄率良好，繼續保持";
});

const financialHealthEmoji = computed(() => {
  const savingRate = savingsRate.value;
  if (savingRate <= 0) return "😢";
  if (savingRate < 10) return "😐";
  return "😄";
});

// 獲取環形進度條的值
const getBudgetCircleValue = () => {
  if (monthlyBudget.value === 0) return "0 440";

  // 計算百分比
  const percentage = remainingBudget.value / monthlyBudget.value;
  const validPercentage = Math.max(0, Math.min(percentage, 1));

  // 計算圓周長 (2 * PI * r，r = 70)
  const circumference = 2 * Math.PI * 70;

  // 計算最終值
  return `${validPercentage * circumference} ${circumference}`;
};

// 恢复丢失的变量
const showDetailedExpenseChart = ref(false);
const showDetailedIncomeChart = ref(false);
const showAllTransactions = ref(false);

// 交易相关变量
const showAddTransactionModal = ref(false);
const showEditTransactionModal = ref(false);
const newTransaction = ref({
  type: "expense",
  category: "",
  amount: 0,
  date: dayjs().format("YYYY-MM-DD"),
});
const editingTransaction = ref({});

// 财务目标相关变量
const goalType = ref("savings");
const goalAmount = ref(0);
const goalDeadline = ref("1");

// 计算属性
const topExpenseCategories = computed(() => {
  const categories = store.categories
    .filter((c) => c.type === "expense")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return categories.length === 0 ? [] : categories.slice(0, 3);
});

const topIncomeCategories = computed(() => {
  const categories = store.categories
    .filter((c) => c.type === "income")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return categories.length === 0 ? [] : categories.slice(0, 3);
});

const expenseCategories = computed(() => {
  return store.categories
    .filter((c) => c.type === "expense")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
});

const incomeCategories = computed(() => {
  return store.categories
    .filter((c) => c.type === "income")
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
});

// 预算相关计算属性
const budgetCircleColor = computed(() => {
  if (monthlyBudget.value === 0) return "rgba(209, 213, 219, 0.5)";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "rgba(239, 68, 68, 0.7)"; // 红色
  if (percentage >= 0.8) return "rgba(245, 158, 11, 0.7)"; // 橙色
  return "rgba(16, 185, 129, 0.7)"; // 绿色
});

const budgetStatusBackground = computed(() => {
  if (monthlyBudget.value === 0) return "bg-gray-100";
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value;
  if (percentage >= 1) return "bg-danger-50";
  if (percentage >= 0.8) return "bg-warning-50";
  return "bg-success-50";
});

// 交易相关方法
const editTransaction = (transaction) => {
  editingTransaction.value = { ...transaction };
  showEditTransactionModal.value = true;
};

// 刪除未使用的函數

const duplicateTransaction = async (transaction) => {
  try {
    // 使用從 useAuthenticatedTransactions 引入的 addTransaction
    const { id, ...txWithoutId } = transaction;
    await addTransaction(txWithoutId);
  } catch (error) {
    console.error("複製交易失敗:", error);
    alert("複製交易時發生錯誤，請稍後再試。");
  }
};

// 初始化新的交易資料
const initNewTransaction = () => {
  return {
    type: "expense",
    category: "",
    amount: 0,
    date: dayjs().format("YYYY-MM-DD"),
  };
};

// 處理新增交易
const handleTransactionSave = async (transaction) => {
  try {
    await addTransaction(transaction);
    showAddTransactionModal.value = false;
  } catch (error) {
    console.error("新增交易失敗:", error);
    alert("新增交易時發生錯誤，請稍後再試。");
  }
};

// 處理編輯交易
const handleTransactionEdit = async (transaction) => {
  try {
    // 從編輯對話框取得的完整交易物件，需要更新 ID 對應的交易
    // 使用從 useAuthenticatedTransactions 引入的 updateTransaction
    await updateTransaction(transaction.id, transaction);
    showEditTransactionModal.value = false;
  } catch (error) {
    console.error("更新交易失敗:", error);
    alert("更新交易時發生錯誤，請稍後再試。");
  }
};

// 處理刪除交易
const handleTransactionDelete = async (id: string | number) => {
  try {
    if (confirm("確定要刪除此交易？")) {
      await deleteTransaction(String(id));
    }
  } catch (error) {
    console.error("刪除交易失敗:", error);
    alert("刪除交易時發生錯誤，請稍後再試。");
  }
};

// 水球動畫相關
const waterPercent = computed(() => {
  if (monthlyBudget.value === 0) return 0;
  return Math.max(0, Math.min(remainingBudget.value / monthlyBudget.value, 1));
});

// 動態水位動畫狀態
const waterAnimPercent = ref(waterPercent.value);
const wavePhase = ref(0); // 新增：追蹤波浪相位
let waterAnimFrame: number;
// 動態產生水波 path，使用動畫水位，並讓波浪隨時間流動
const waterWavePath = computed(() => {
  const percent = waterAnimPercent.value;
  const baseY = 64 + 60 - 120 * percent;
  const waveHeight = 4 * (1 - percent) + 2;
  const phase = wavePhase.value; // 使用相位變數

  let path = `M0,128 `;

  for (let x = 0; x <= 128; x += 1) {
    // 使用相位來控制波浪移動
    const wave1 = Math.sin((x / 30 + phase) * Math.PI) * waveHeight;
    const wave2 =
      Math.sin((x / 15 + phase * 1.5) * Math.PI) * (waveHeight * 0.5);
    const y = baseY + wave1 + wave2;
    path += `L${x},${y} `;
  }

  path += "L128,128 Z";
  return path;
});
// 修改動畫函數
const animateWater = () => {
  // 更新水位
  const target = waterPercent.value;
  const current = waterAnimPercent.value;
  const speed = 0.08;

  if (Math.abs(target - current) > 0.001) {
    waterAnimPercent.value += (target - current) * speed;
  } else {
    waterAnimPercent.value = target;
  }

  // 更新波浪相位
  wavePhase.value += 0.01;

  // 持續觸發動畫
  requestAnimationFrame(animateWater);
};

// 動畫效果

onMounted(() => {
  animateWater();
});

onUnmounted(() => {
  // 清除任何正在進行的動畫
  if (waterAnimFrame) {
    cancelAnimationFrame(waterAnimFrame);
  }
});
</script>

<style scoped>
.btn-login,
.btn-logout {
  box-shadow: 0 2px 8px 0 var(--color-primary) 11;
  font-weight: 600;
}

::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* 教學提示動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-animation {
  animation: fadeIn 0.3s ease-out forwards;
}

/* 提示樣式 */
.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  z-index: 40;
  max-width: 200px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}
.card-interactive {
  @apply rounded-xl shadow-md p-4 relative overflow-hidden min-h-[200px] aspect-[4/5] flex flex-col justify-between transition-all duration-200 border bg-white;
  transition: transform 0.18s cubic-bezier(0.4, 2, 0.6, 1), box-shadow 0.18s;
}
.card-interactive:hover {
  transform: scale(1.04) translateY(-2px);
  box-shadow: 0 8px 32px 0 rgba(59, 130, 246, 0.1),
    0 2px 8px 0 rgba(0, 0, 0, 0.04);
  z-index: 2;
}
@keyframes worker-move-in {
  0% {
    transform: translateX(-40px);
    opacity: 0;
  }
  60% {
    transform: translateX(8px);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes worker-move-out {
  0% {
    transform: translateX(40px);
    opacity: 0;
  }
  60% {
    transform: translateX(-8px);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes bill-fly-in {
  0% {
    transform: translateY(20px) scale(0.7);
    opacity: 0;
  }
  60% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
@keyframes bill-fly-out {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  60% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(20px) scale(0.7);
    opacity: 0;
  }
}
.animate-worker-move-in {
  animation: worker-move-in 1.2s infinite alternate;
}
.animate-worker-move-out {
  animation: worker-move-out 1.2s infinite alternate;
}
.animate-bill-fly-in {
  animation: bill-fly-in 1.2s infinite alternate;
}
.animate-bill-fly-out {
  animation: bill-fly-out 1.2s infinite alternate;
}
.water-ball {
  filter: drop-shadow(0 4px 16px #05966922);
  transition: filter 0.3s;
  background: transparent;
}
.water-ball:hover {
  filter: drop-shadow(0 8px 32px #05966944);
}
@media (max-width: 500px) {
  .water-ball {
    width: 96px;
    height: 96px;
  }
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

.water-ball circle[filter="url(#water-blur)"] {
  animation: ripple 3s infinite;
}
</style>
