<!-- pages/index-optimized.vue -->
<template>
  <div
    :class="`min-h-screen transition-all duration-300`"
    :style="{ 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text 
    }"
  >
    <!-- App Status Bar -->
    <AppStatusBar />
    
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 h-16 sticky top-0 z-30 shadow-sm backdrop-blur-md"
      :style="{
        backgroundColor: currentTheme.colors.surface + '80'
      }"
    >
      <h1
        class="text-xl font-bold tracking-tight"
        :style="{ color: currentTheme.colors.accent }"
      >
        懶人記帳-AI幫你分類
      </h1>
      
      <!-- Auth Buttons -->
      <button
        v-if="user"
        @click="handleLogout"
        class="btn-logout flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        :style="`background: linear-gradient(90deg, ${currentTheme.colors.error}, ${currentTheme.colors.accent}); color: #fff;`"
      >
        <!-- Logout Icon -->
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
        <!-- Login Icon -->
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
      <!-- Welcome Screen for Non-Authenticated Users -->
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

      <!-- Dashboard for Authenticated Users -->
      <div v-else class="space-y-6">
        <!-- Financial Health Card -->
        <ThemeCard
          variant="gradient"
          :decoration="true"
          class="p-5 relative overflow-hidden"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
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
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium border shadow-sm"
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
            <div class="text-3xl">{{ getHealthEmoji(financialHealthStatus) }}</div>
          </div>
        </ThemeCard>

        <!-- Month Selector -->
        <MonthSelector
          v-model:selectedMonth="currentMonth"
          :subtitle="`${currentMonth}月財務概覽`"
          @change="handleMonthChange"
          @previous="changeMonth('prev')"
          @next="changeMonth('next')"
          @today="goToCurrentMonth"
        />

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-2 gap-4">
          <StatsCard
            label="本月收入"
            :value="monthlyStats.income"
            type="income"
            :subtitle="incomeChangeText"
          />
          <StatsCard
            label="本月支出"
            :value="monthlyStats.expense"
            type="expense"
            :subtitle="expenseChangeText"
          />
          <StatsCard
            label="淨收益"
            :value="monthlyStats.balance"
            type="balance"
            :subtitle="balanceSubtitle"
          />
          <StatsCard
            label="剩餘預算"
            :value="monthlyStats.remainingBudget"
            type="budget"
            :subtitle="budgetSubtitle"
          />
        </div>

        <!-- Charts Section -->
        <LazyChartCard />

        <!-- Transaction List -->
        <LazyTransactionList />

        <!-- Loading Overlay -->
        <PageLoader
          v-if="isLoading"
          message="載入中..."
          :overlay="false"
          size="medium"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { useTheme } from '~/composables/useTheme'
import { useDashboard } from '~/composables/useDashboard'

// Define lazy components
const LazyChartCard = defineAsyncComponent(() => import('~/components/dashboard/ChartCard.vue'))
const LazyTransactionList = defineAsyncComponent(() => import('~/components/dashboard/TransactionList.vue'))

const router = useRouter()
const { user, signOut } = useSupabaseAuth()
const { currentTheme } = useTheme()

// Use dashboard composable for all business logic
const {
  currentMonth,
  isLoading,
  monthlyStats,
  incomeChangeText,
  expenseChangeText,
  balanceSubtitle,
  budgetSubtitle,
  financialHealthStatus,
  financialAdvice,
  handleMonthChange,
  changeMonth,
  goToCurrentMonth,
  formatCurrency,
  formatDate,
  clearError
} = useDashboard()

// Handle logout
const handleLogout = async () => {
  try {
    await signOut()
    await router.push('/auth')
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// Get health emoji based on status
const getHealthEmoji = (status: string): string => {
  const emojiMap: Record<string, string> = {
    '穩健': '😊',
    '警戒': '😐',
    '超支': '😰',
    '優秀': '🎉'
  }
  return emojiMap[status] || '📊'
}

// Page meta
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.btn-logout:hover,
.btn-login:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
