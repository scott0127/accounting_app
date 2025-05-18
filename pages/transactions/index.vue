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
                <span class="text-xl mr-3">{{ getCategoryIcon(transaction.category) }}</span>                <div>
                  <p class="font-medium">{{ getCategoryName(transaction.category) }}</p>
                  <p class="text-xs text-gray-500">{{ transaction.description || transaction.note || '無備註' }}</p>
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
      </template>    </div>
    
    <!-- 加入浮動添加按鈕 -->
    <div class="fixed bottom-6 right-6">
      <button 
        @click="router.push('/transactions/add')" 
        class="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- 編輯交易對話框 -->
    <TransactionModal
      v-if="showEditModal"
      :show="showEditModal"
      :categories="store.categories"
      :transaction="editingTransaction"
      :is-editing="true"
      @close="showEditModal = false"
      @save="handleTransactionEdit"
      @delete="handleTransactionDelete(editingTransaction.id)"
    />
    
    <!-- 載入中指示器 -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <p class="text-gray-600">載入中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { useSupabaseTransactions } from '~/composables/useSupabaseTransactions'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import TransactionModal from '~/components/dashboard/TransactionModal.vue'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'

const { user, isLoading } = useSupabaseAuth()

onMounted(async () => {
  // 等待 user 狀態 ready
  while (isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (user.value) {
    await initializeSupabase()
  }
})


dayjs.locale('zh-tw')

const router = useRouter()
const store = useTransactionStore()

// 使用 Supabase 交易數據
const { 
  transactions: supabaseTransactions, 
  getMonthlyStats, 
  loading,
  initialize: initializeSupabase,
  updateTransaction,
  deleteTransaction
} = useSupabaseTransactions()

// 初始化 Supabase 數據
onMounted(async () => {
  await initializeSupabase()
})

// 當前月份
const currentMonth = ref(dayjs().format('YYYY-MM'))

// 月份顯示
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format('YYYY年M月')
})

// 月度統計
const monthlyStats = computed(() => {
  return getMonthlyStats(currentMonth.value)
})

// 餘額顏色
const balanceColor = computed(() => {
  return monthlyStats.value.balance >= 0 ? 'text-green-500' : 'text-red-500'
})

// 按日期分組的交易記錄
const groupedTransactions = computed(() => {
  const transactions = supabaseTransactions.value
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
  // 先嘗試在 store.categories 中查找
  const storeCategory = store.categories.find(c => c.id === categoryId)
  if (storeCategory) return storeCategory.name
  
  // 如果在 store 中找不到，嘗試從 Supabase 獲取的類別中查找
  const { categories } = useSupabaseTransactions()
  const supabaseCategory = categories.value.find(c => c.id === categoryId)
  if (supabaseCategory) return supabaseCategory.name
  
  // 如果都找不到，返回 categoryId 作為後備選項
  return categoryId
}

const getDailyExpense = (transactions: any[]) => {
  return transactions
    .filter(t => t.type === 'expense' || !t.type) // 兼容沒有明確 type 的舊數據，默認為支出
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
const showEditModal = ref(false)
const editingTransaction = ref<any>({})

const editTransaction = (transaction: any) => {
  editingTransaction.value = { ...transaction }
  showEditModal.value = true
}

// 處理交易編輯
const handleTransactionEdit = async (transaction: any) => {
  try {
    // 建立要更新的交易資料物件 - 只保留資料庫實際需要的欄位
    const transactionToUpdate = {
      id: transaction.id,  // 確保 ID 是正確的
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description || transaction.note || "",
      category_id: transaction.category || transaction.category_id || ""
    }
    
    console.log('原始交易資料:', transaction)
    console.log('準備更新交易資料:', transactionToUpdate)
    
    // 發送更新請求，不帶 ID，因為它是路徑參數
    await updateTransaction(transaction.id, {
      amount: transactionToUpdate.amount,
      type: transactionToUpdate.type,
      date: transactionToUpdate.date,
      description: transactionToUpdate.description,
      category_id: transactionToUpdate.category_id
    })
    
    showEditModal.value = false
  } catch (error) {
    console.error('更新交易失敗:', error)
    alert('更新交易時發生錯誤，請稍後再試。')
  }
}
// 處理交易刪除
const handleTransactionDelete = async (id: string) => {
  try {
    if (confirm('確定要刪除此交易？')) {
      await deleteTransaction(id)
    }
  } catch (error) {
    console.error('刪除交易失敗:', error)
    alert('刪除交易時發生錯誤，請稍後再試。')
  }
}
</script>