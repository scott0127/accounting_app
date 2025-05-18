<template>
  <div class="min-h-screen p-4 transition-all duration-300" :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold" :class="`text-[${currentTheme.colors.text}]`">交易記錄</h1>
      <p class="text-sm mt-1" :class="`text-[${currentTheme.colors.textLight}]`">追蹤您的收支情況</p>
    </div>
    
    <!-- 月份選擇器 - 重新設計為更現代的樣式 -->
    <div class="flex items-center justify-between mb-6 p-4 rounded-2xl shadow-sm backdrop-blur-sm" 
         :class="`bg-[${currentTheme.colors.surface}] bg-opacity-80`">
      <button class="p-3 rounded-full transition-transform transform hover:scale-110" 
              @click="previousMonth" 
              :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.primary}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <div class="text-center">
        <h2 class="text-lg font-semibold transition-all flex items-center justify-center" 
            :class="`text-[${currentTheme.colors.text}]`">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" :class="`text-[${currentTheme.colors.primary}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ currentMonthDisplay }}
        </h2>
        <p class="text-xs mt-1 flex items-center justify-center" :class="`text-[${currentTheme.colors.textLight}]`">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ getMonthsRange() }}
        </p>
      </div>
      
      <button class="p-3 rounded-full transition-transform transform hover:scale-110 shadow-sm" 
              @click="nextMonth"
              :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.primary}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 月度統計 - 使用卡片效果和動畫 -->
    <div class="rounded-2xl shadow-md p-5 mb-8 transform transition-all duration-300 hover:shadow-lg overflow-hidden relative"
         :class="`bg-[${currentTheme.colors.surface}]`">
      <!-- 背景裝飾元素 -->
      <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10"
           :style="`background: radial-gradient(circle, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`"></div>
      <div class="absolute -left-4 -bottom-6 h-16 w-16 rounded-full opacity-10"
           :style="`background: radial-gradient(circle, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`"></div>
           
      <h3 class="text-sm font-medium mb-3 flex items-center" :class="`text-[${currentTheme.colors.textLight}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        本月統計
      </h3>
      
      <div class="grid grid-cols-3 gap-4 relative z-10">
        <div class="stats-card income">
          <div class="flex items-center justify-center h-12 w-12 rounded-full mb-2 transition-all duration-300 hover:scale-110"
               :style="`background: linear-gradient(135deg, ${currentTheme.colors.success}, ${currentTheme.colors.success}80);`">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm" :class="`text-[${currentTheme.colors.textLight}]`">收入</p>
            <p class="text-lg font-bold mt-1" :class="`text-[${currentTheme.colors.success}]`">
              {{ formatAmount(monthlyStats.totalIncome) }}
            </p>
          </div>
        </div>
        
        <div class="stats-card expense">
          <div class="flex items-center justify-center h-12 w-12 rounded-full mb-2 transition-all duration-300 hover:scale-110" 
               :style="`background: linear-gradient(135deg, ${currentTheme.colors.error}, ${currentTheme.colors.error}80);`">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm" :class="`text-[${currentTheme.colors.textLight}]`">支出</p>
            <p class="text-lg font-bold mt-1" :class="`text-[${currentTheme.colors.error}]`">
              {{ formatAmount(monthlyStats.totalExpense) }}
            </p>
          </div>
        </div>
        
        <div class="stats-card balance">
          <div class="flex items-center justify-center h-12 w-12 rounded-full mb-2 transition-all duration-300 hover:scale-110"
               :style="`background: linear-gradient(135deg, ${monthlyStats.balance >= 0 ? currentTheme.colors.success : currentTheme.colors.error}, ${monthlyStats.balance >= 0 ? currentTheme.colors.success + '80' : currentTheme.colors.error + '80'});`">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <p class="text-sm" :class="`text-[${currentTheme.colors.textLight}]`">結餘</p>
            <p class="text-lg font-bold mt-1" 
               :class="monthlyStats.balance >= 0 ? `text-[${currentTheme.colors.success}]` : `text-[${currentTheme.colors.error}]`">
              {{ formatAmount(monthlyStats.balance) }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- 改進的圖表區域 - 使用更可愛的設計 -->
      <div class="mt-5 pt-5 border-t relative z-10" :class="`border-[${currentTheme.colors.textLight}] border-opacity-10`">
       
       
      </div>
    </div>

    <!-- 交易標題 - 添加裝飾性元素 -->
    <div class="flex justify-between items-center mb-4 relative">
      <div class="flex items-center">
        <div class="h-5 w-1.5 rounded-full mr-2" 
             :style="`background: linear-gradient(to bottom, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`"></div>
        <h3 class="font-semibold" :class="`text-[${currentTheme.colors.text}]`">最近交易</h3>
      </div>
      <button class="text-sm px-3 py-1 rounded-full" 
              :style="`background: linear-gradient(to right, ${currentTheme.colors.primary}, ${currentTheme.colors.accent}); color: white;`">
        查看全部
      </button>
    </div>

    <!-- 交易記錄列表 - 增強色彩視覺效果 -->
    <div class="space-y-5">
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="transaction-group">
          <!-- 日期標題 - 更有設計感 -->
          <div class="flex items-center mb-2 px-2">
            <span class="font-medium" :class="`text-[${currentTheme.colors.text}]`">{{ formatGroupDate(date) }}</span>
            <span class="text-xs ml-2 px-2 py-0.5 rounded-full" 
                 :style="`background: linear-gradient(to right, ${currentTheme.colors.accent}22, ${currentTheme.colors.primary}22); color: ${currentTheme.colors.text};`">
              {{ getDayOfWeek(date) }}
            </span>
            <div class="flex-grow"></div>
            <div class="text-sm">
              <span class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">支出: </span>
              <span class="font-medium" :class="`text-[${currentTheme.colors.error}]`">
                {{ formatAmount(getDailyExpense(group)) }}
              </span>
            </div>
          </div>

          <!-- 交易列表 - 卡片添加漸層邊框效果 -->
          <div class="space-y-3">
            <div
              v-for="transaction in group"
              :key="transaction.id"
              class="p-4 rounded-xl transition-all duration-200 transform cursor-pointer relative"
              :class="`bg-[${currentTheme.colors.surface}] hover:shadow-md hover:-translate-y-0.5`"
              @click="editTransaction(transaction)"
              :style="`box-shadow: 0 0 0 1px ${transaction.type === 'income' ? currentTheme.colors.success + '20' : currentTheme.colors.error + '20'};`"
            >
              <!-- 左側色彩指示條 -->
              <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" 
                   :style="`background: ${transaction.type === 'income' ? currentTheme.colors.success : currentTheme.colors.error};`">
              </div>
              
              <div class="flex items-center">
                <!-- 類別圖標 - 更可愛的設計 -->
                <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm float-icon overflow-hidden" 
                     :style="`background: linear-gradient(135deg, ${transaction.type === 'income' ? currentTheme.colors.success + '30' : currentTheme.colors.error + '30'}, ${currentTheme.colors.background});`">
                  <!-- 自訂圖示的容器，添加可愛效果 -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :style="`background: linear-gradient(135deg, ${currentTheme.colors.primary}30, ${currentTheme.colors.accent}20);`">
                    <span class="text-xl" :style="`color: ${transaction.type === 'income' ? currentTheme.colors.success : currentTheme.colors.error};`">
                      {{ getCategoryIcon(transaction.category) }}
                    </span>
                  </div>
                </div>

                <!-- 交易內容 -->
                <div class="ml-4 flex-grow">
                  <div class="flex justify-between items-start">
                    <p class="font-medium" :class="`text-[${currentTheme.colors.text}]`">
                      {{ getCategoryName(transaction.category) }}
                    </p>
                    <span
                      class="font-bold text-base"
                      :class="transaction.type === 'income' ? `text-[${currentTheme.colors.success}]` : `text-[${currentTheme.colors.error}]`"
                    >
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center mt-1">
                    <p class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">
                      {{ transaction.description || transaction.note || '無備註' }}
                    </p>
                    <span class="text-xs" :class="`text-[${currentTheme.colors.textLight}]`">
                      {{ formatTime(transaction.date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 無交易時的提示 -->
      <div v-if="Object.keys(groupedTransactions).length === 0" 
           class="flex flex-col items-center justify-center py-12"
           :class="`text-[${currentTheme.colors.textLight}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-30" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        <p class="text-center">本月尚無交易記錄</p>
        <button 
          @click="router.push('/transactions/add')"
          class="mt-4 px-4 py-2 rounded-full text-sm transition-all"
          :class="`bg-[${currentTheme.colors.primary}] text-white hover:bg-opacity-90`"
        >
          新增第一筆交易
        </button>
      </div>
    </div>

    <!-- 浮動添加按鈕 - 重新設計，增加吸引力 -->
    <div class="fixed bottom-8 right-8 z-30">
      <button 
        @click="router.push('/transactions/add')" 
        class="w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
        :class="`bg-[${currentTheme.colors.primary}] text-white hover:shadow-xl`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        
        <!-- 浮動效果 -->
        <span class="absolute inset-0 rounded-full animate-ping opacity-25" :class="`bg-[${currentTheme.colors.primary}]`"></span>
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
    
    <!-- 載入中指示器 - 美化版本 -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all" 
         :class="`bg-[${currentTheme.colors.background}] bg-opacity-50`">
      <div class="rounded-2xl p-8 shadow-xl transform transition-all scale-100" 
           :class="`bg-[${currentTheme.colors.surface}]`">
        <div class="flex flex-col items-center">
          <!-- 載入動畫 -->
          <div class="w-16 h-16 mb-5 relative">
            <div class="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" 
                 :class="`border-[${currentTheme.colors.primary}]`"></div>
            <div class="absolute inset-2 rounded-full border-2 border-t-transparent animate-spin animation-delay-150"
                 :class="`border-[${currentTheme.colors.secondary}]`"></div>
          </div>
          <p class="text-lg font-medium" :class="`text-[${currentTheme.colors.text}]`">載入中...</p>
        </div>
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
const { currentTheme } = useTheme()
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

const formatTime = (dateString: string) => {
  // 如果有時間資訊，顯示時間，否則只顯示「全天」
  const date = dayjs(dateString);
  if (dateString.includes('T') && dateString.includes(':')) {
    return date.format('HH:mm');
  }
  return '全天';
}

// 獲取月份起始和結束日期範圍
const getMonthsRange = () => {
  const startDate = dayjs(currentMonth.value).startOf('month').format('MM/DD');
  const endDate = dayjs(currentMonth.value).endOf('month').format('MM/DD');
  return `${startDate} - ${endDate}`;
}

// 格式化精簡金額
const formatCompactAmount = (amount: number) => {
  if (amount >= 10000) {
    return `${Math.floor(amount / 1000)}k`;
  }
  return amount.toString();
}

// 獲取本週每日數據
const getDaysOfWeek = () => {
  const result = [];
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  
  // 模擬一些數據以產生視覺效果
  const mockValues = [3200, 0, 5600, 8900, 1200, 7500, 4300];
  const maxValue = Math.max(...mockValues);
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day');
    const dayValue = mockValues[i];
    const percentage = maxValue > 0 ? (dayValue / maxValue) * 90 : 0; // 最高90%高度
    
    result.push({
      date: date.format('YYYY-MM-DD'),
      label: date.format('dd').substring(0, 1), // 取星期的第一個字
      value: dayValue,
      percentage,
      isToday: date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
    });
  }
  
  return result;
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

<style>
@import '~/assets/css/animations.css';

/* 圖標顏色過渡效果 */
.icon-transition {
  transition: color 0.3s ease, transform 0.3s ease;
}

/* 圓形按鈕效果 */
.round-btn {
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.round-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>