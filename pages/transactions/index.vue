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

    <!-- 月度統計 -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <p class="text-sm text-gray-600">收入</p>
          <p class="text-lg font-semibold text-green-500">
            {{ formatAmount(monthlyStats.totalIncome) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">支出</p>
          <p class="text-lg font-semibold text-red-500">
            {{ formatAmount(monthlyStats.totalExpense) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">結餘</p>
          <p class="text-lg font-semibold" :class="balanceColor">
            {{ formatAmount(monthlyStats.balance) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 交易記錄列表 -->
    <div class="space-y-6">
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <!-- 日期標題 -->
          <div class="flex items-center justify-between p-4 bg-gray-50">
            <div class="flex items-center">
              <span class="text-gray-600">{{ formatGroupDate(date) }}</span>
              <span class="text-xs text-gray-500 ml-2">{{ getDayOfWeek(date) }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">支出 </span>
              <span class="font-medium text-red-500">
                {{ formatAmount(getDailyExpense(group)) }}
              </span>
            </div>
          </div>

          <!-- 交易列表 -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="transaction in group"
              :key="transaction.id"
              class="flex items-center justify-between p-4"
              @click="editTransaction(transaction)"
            >
              <div class="flex items-center">
                <span class="text-xl mr-3">{{ getCategoryIcon(transaction.category) }}</span>
                <div>
                  <p class="font-medium">{{ getCategoryName(transaction.category) }}</p>
                  <p class="text-xs text-gray-500">{{ transaction.note || '無備註' }}</p>
                </div>
              </div>
              <span
                class="font-semibold"
                :class="transaction.type === 'income' ? 'text-green-500' : 'text-red-500'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'

dayjs.locale('zh-tw')

const router = useRouter()
const store = useTransactionStore()

// 當前月份
const currentMonth = ref(dayjs().format('YYYY-MM'))

// 月份顯示
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format('YYYY年M月')
})

// 月度統計
const monthlyStats = computed(() => {
  return store.getMonthlyStats(currentMonth.value)
})

// 餘額顏色
const balanceColor = computed(() => {
  return monthlyStats.value.balance >= 0 ? 'text-green-500' : 'text-red-500'
})

// 按日期分組的交易記錄
const groupedTransactions = computed(() => {
  const transactions = store.transactions
    .filter(t => t.date.startsWith(currentMonth.value))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return transactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, typeof store.transactions>)
})

// 工具函數
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

const formatGroupDate = (date: string) => {
  return dayjs(date).format('M月D日')
}

const getDayOfWeek = (date: string) => {
  return dayjs(date).format('dddd')
}

const getCategoryIcon = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.icon || '📝'
}

const getCategoryName = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.name || categoryId
}

const getDailyExpense = (transactions: typeof store.transactions) => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

// 月份切換
const previousMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).subtract(1, 'month').format('YYYY-MM')
}

const nextMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).add(1, 'month').format('YYYY-MM')
}

// 編輯交易
const editTransaction = (transaction: typeof store.transactions[0]) => {
  // TODO: 實現編輯功能
  console.log('Edit transaction:', transaction)
}
</script> 