<!-- pages/transactions/add.vue -->
<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <button class="p-2" @click="router.back()">
        <span class="text-xl">←</span>
      </button>
      <h2 class="text-lg font-semibold">新增記錄</h2>
      <div class="w-8"></div>
    </div>

    <!-- 模式選擇 -->
    <div class="grid grid-cols-3 gap-2 mb-6">
      <button 
        @click="mode = 'ai'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
        ]"
      >
        AI記帳
      </button>
      <button 
        @click="mode = 'expense'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        ]"
      >
        支出
      </button>
      <button 
        @click="mode = 'income'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        ]"
      >
        收入
      </button>
    </div>

    <!-- AI 記帳模式 -->
    <form v-if="mode === 'ai'" @submit.prevent="handleSubmitAI" class="space-y-6">
      <!-- 智能輸入 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">消費內容</label>
        <div class="relative">
          <input
            v-model="aiDescription"
            type="text"
            class="w-full text-lg focus:outline-none px-4 py-2 border border-gray-200 rounded-lg"
            placeholder="例如：午餐吃麥當勞100元"
            @blur="classifyWithLLMApi"
            @keyup.enter="classifyWithLLMApi"
            :disabled="isProcessing"
            required
          />
          <!-- 處理中指示器 -->
          <div v-if="isProcessing" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
        
        <!-- AI 分析結果 -->
        <div v-if="llmResult" class="mt-2">
          <div class="flex items-center justify-between">
            <!-- 信心度指示器 -->
            <div class="flex items-center">
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {{ getCategoryName(llmResult.categoryId) }}
              </span>
              <span v-if="llmResult.confidence > 0" class="text-xs text-gray-500 ml-2">
                ({{ llmResult.confidence }}% 信心度)
              </span>
            </div>
            
            <!-- 手動選擇開關 -->
            <button 
              v-if="!showManualCategorySelector"
              @click="showManualCategorySelector = true"
              type="button"
              class="text-xs text-blue-600 underline"
            >
              手動選擇
            </button>
            <button 
              v-else
              @click="showManualCategorySelector = false"
              type="button"
              class="text-xs text-gray-600 underline"
            >
              使用AI建議
            </button>
          </div>
          
          <p class="text-xs text-gray-500 mt-1">{{ llmResult.explanation }}</p>
          <p v-if="llmResult.errorMessage" class="text-xs text-red-500 mt-1">
            {{ llmResult.errorMessage }}
          </p>
        </div>

        <!-- LLM生成的備注 -->
        <div v-if="llmResult?.description" class="mt-3 p-2 bg-gray-50 rounded-lg">
          <div class="flex justify-between">
            <p class="text-sm font-medium">智能備註:</p>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AI生成</span>
          </div>
          <p class="text-sm">{{ llmResult.description }}</p>
        </div>
      </div>
        <!-- 手動類別選擇 -->
      <div v-if="showManualCategorySelector" class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-4">選擇類別</label>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="category in (llmResult?.type === 'income' ? incomeCategories : expenseCategories)"
            :key="category.id"
            type="button"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="aiSelectedCategory === category.id ? 'bg-blue-100' : ''"
            @click="selectCategory(category.id)"
          >
            <span class="text-2xl mb-1">{{ category.icon }}</span>
            <span class="text-xs">{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- 萃取的金額 -->
      <div v-if="extractedAmount > 0" class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">AI 識別金額</label>
        <div class="flex items-center justify-between">
          <span class="font-bold text-xl">{{ extractedAmount }} 元</span>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">自動識別</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">如果金額不正確，請在描述中明確輸入數字</p>
      </div>

      <!-- 日期選擇 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">日期</label>
        <input
          v-model="date"
          type="date"
          class="w-full text-lg focus:outline-none"
          :max="today"
          required
        />
      </div>

      <!-- 提交按鈕 -->
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-sm"
        :disabled="!isAIValid || isProcessing"
      >
        {{ isProcessing ? '處理中...' : '儲存' }}
      </button>
    </form>

    <!-- 支出模式 -->
    <form v-if="mode === 'expense'" @submit.prevent="handleSubmitExpense" class="space-y-6">
      <!-- 金額輸入 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">金額</label>
        <input
          v-model="amount"
          type="number"
          inputmode="decimal"
          class="w-full text-2xl font-semibold focus:outline-none"
          placeholder="0"
          required
        />
      </div>

      <!-- 類別選擇 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-4">類別</label>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="category in expenseCategories"
            :key="category.id"
            type="button"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="selectedCategory === category.id ? 'bg-blue-100' : ''"
            @click="selectedCategory = category.id"
          >
            <span class="text-2xl mb-1">{{ category.icon }}</span>
            <span class="text-xs">{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- 日期選擇 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">日期</label>
        <input
          v-model="date"
          type="date"
          class="w-full text-lg focus:outline-none"
          :max="today"
          required
        />
      </div>

      <!-- 備註 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">備註</label>
        <input
          v-model="note"
          type="text"
          class="w-full text-lg focus:outline-none"
          placeholder="選填"
        />
      </div>

      <!-- 提交按鈕 -->
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-sm"
        :disabled="!isExpenseValid"
      >
        儲存
      </button>
    </form>

    <!-- 收入模式 -->
    <form v-if="mode === 'income'" @submit.prevent="handleSubmitIncome" class="space-y-6">
      <!-- 金額輸入 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">金額</label>
        <input
          v-model="amount"
          type="number"
          inputmode="decimal"
          class="w-full text-2xl font-semibold focus:outline-none"
          placeholder="0"
          required
        />
      </div>

      <!-- 類別選擇 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-4">類別</label>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="category in incomeCategories"
            :key="category.id"
            type="button"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="selectedCategory === category.id ? 'bg-blue-100' : ''"
            @click="selectedCategory = category.id"
          >
            <span class="text-2xl mb-1">{{ category.icon }}</span>
            <span class="text-xs">{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- 日期選擇 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">日期</label>
        <input
          v-model="date"
          type="date"
          class="w-full text-lg focus:outline-none"
          :max="today"
          required
        />
      </div>

      <!-- 備註 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">備註</label>
        <input
          v-model="note"
          type="text"
          class="w-full text-lg focus:outline-none"
          placeholder="選填"
        />
      </div>

      <!-- 提交按鈕 -->
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-sm"
        :disabled="!isIncomeValid"
      >
        儲存
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { useExpenseClassifier } from '~/composables/useExpenseClassifier'
import { useLLMClassifier } from '~/composables/useLLMClassifier'
import { useSupabaseTransactions } from '~/composables/useSupabaseTransactions'
import dayjs from 'dayjs'


const { addTransaction, categories: supabaseCategories, loading: transactionLoading, initialize } = useSupabaseTransactions()
const router = useRouter()
const store = useTransactionStore()
const { classifyExpense, rememberCorrection } = useExpenseClassifier()
const { classifyWithLLM } = useLLMClassifier()

// 記帳模式
const mode = ref<'ai' | 'expense' | 'income'>('expense')

// 表單數據
const amount = ref('')
const selectedCategory = ref('')
const date = ref(dayjs().format('YYYY-MM-DD'))
const note = ref('')

// AI 記帳模式數據
const aiDescription = ref('')
const classificationResult = ref<any>(null)
const llmResult = ref<{
  type: 'income' | 'expense';
  categoryId: string;
  confidence: number;
  description: string;
  explanation: string;
  errorMessage?: string;
} | null>(null)
const isProcessing = ref(false)
const showManualCategorySelector = ref(false)
const aiSelectedCategory = ref('')
const extractedAmount = computed(() => extractAmountFromDescription(aiDescription.value))

// 防抖函數
let debounceTimeout: NodeJS.Timeout | null = null;

// 調用 LLM 分類 API
const classifyWithLLMApi = async () => {
  if (!aiDescription.value.trim()) return;
  
  try {
    isProcessing.value = true;
    
    // 優先使用真實 LLM 分類
    llmResult.value = await classifyWithLLM(aiDescription.value);
    
    // 如果 LLM API 失敗，使用本地分類器作為後備
    if (llmResult.value.confidence < 30) {
      classificationResult.value = classifyExpense(aiDescription.value);
      
      // 使用關鍵詞分類器覆蓋結果
      llmResult.value = {
        ...llmResult.value,
        categoryId: classificationResult.value.categoryId,
        confidence: classificationResult.value.confidence,
        explanation: '(本地分類) ' + classificationResult.value.explanation
      };
    }
    
    // 設置類別
    if (!showManualCategorySelector.value || !aiSelectedCategory.value) {
      aiSelectedCategory.value = llmResult.value.categoryId;
    }  } catch (error: unknown) {
    console.error('LLM classification failed:', error);
    // 當LLM失敗時使用本地分類器
    classificationResult.value = classifyExpense(aiDescription.value);
    
    if (classificationResult.value) {
      llmResult.value = {
        type: 'expense', // 本地分類器只支援支出
        categoryId: classificationResult.value.categoryId,
        confidence: classificationResult.value.confidence,
        description: aiDescription.value,
        explanation: '(本地分類) ' + classificationResult.value.explanation,
        errorMessage: error instanceof Error ? error.message : '分類失敗，請稍後再試'
      };
      
      aiSelectedCategory.value = classificationResult.value.categoryId;
    }
  } finally {
    isProcessing.value = false;
  }
};

// 計算屬性
const today = computed(() => dayjs().format('YYYY-MM-DD'))

const expenseCategories = computed(() => {
  // 優先使用 Supabase 類別，如果有的話
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    return supabaseCategories.value.filter(c => c.type === 'expense')
  }
  // 否則使用 store 的類別作為後備
  return store.categories.filter(c => c.type === 'expense')
})

const incomeCategories = computed(() => {
  // 優先使用 Supabase 類別，如果有的話
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    return supabaseCategories.value.filter(c => c.type === 'income')
  }
  // 否則使用 store 的類別作為後備
  return store.categories.filter(c => c.type === 'income')
})

// 重置表單
const resetForm = () => {
  amount.value = ''
  selectedCategory.value = ''
  date.value = dayjs().format('YYYY-MM-DD')
  note.value = ''
  aiDescription.value = ''
  classificationResult.value = null
  llmResult.value = null
  showManualCategorySelector.value = false
  aiSelectedCategory.value = ''
  isProcessing.value = false
  
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
    debounceTimeout = null
  }
}

// 監視模式變化，重置表單
watch(mode, () => {
  resetForm()
})

// 驗證表單
const isExpenseValid = computed(() => {
  return amount.value && selectedCategory.value && date.value
})

const isIncomeValid = computed(() => {
  return amount.value && selectedCategory.value && date.value
})

const isAIValid = computed(() => {
  return aiDescription.value && extractedAmount.value > 0 && date.value && 
         (showManualCategorySelector.value ? aiSelectedCategory.value : (llmResult.value?.categoryId || false))
})

// 從描述中提取金額
const extractAmountFromDescription = (description: string): number => {
  const matches = description.match(/\d+/)
  return matches ? parseInt(matches[0]) : 0
}

// 手動選擇類別
const selectCategory = (categoryId: string) => {
  aiSelectedCategory.value = categoryId
}

// 獲取類別名稱
const getCategoryName = (categoryId: string): string => {
  // 優先從 Supabase 類別中查找
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    const category = supabaseCategories.value.find(c => c.id === categoryId)
    if (category) return category.name
  }
  
  // 如果在 Supabase 找不到，從 store 中查找
  const storeCategory = store.categories.find(c => c.id === categoryId)
  return storeCategory ? storeCategory.name : categoryId
}

// 處理 AI 記帳提交
const handleSubmitAI = async () => {
  if (!isAIValid.value || isProcessing.value) return

  // 如果沒有LLM結果，先獲取
  if (!llmResult.value) {
    await classifyWithLLMApi();
  }

  // 如果還是沒有結果，返回
  if (!llmResult.value) return;

  const finalCategoryId = showManualCategorySelector.value 
    ? aiSelectedCategory.value 
    : llmResult.value.categoryId;

  // 找到對應的類別對象
  const categoryList = llmResult.value.type === 'income' ? incomeCategories.value : expenseCategories.value;
  const category = categoryList.find(c => c.id === finalCategoryId) || null;
    
  try {
    // 添加交易，使用LLM生成的備註和類型
    await addTransaction({
      amount: extractedAmount.value,
      type: llmResult.value.type,
      category_id: finalCategoryId,
      category: category,
      date: date.value,
      description: llmResult.value.description || aiDescription.value
    });
    
    // 如果是手動選擇了類別，記住這個更正
    if (showManualCategorySelector.value && 
        finalCategoryId !== llmResult.value.categoryId) {
      rememberCorrection(aiDescription.value, finalCategoryId);
    }

    // 成功後導航到交易列表
    router.push('/transactions');
  } catch (error: unknown) {
    console.error('Failed to add transaction:', error);
    alert(`新增記錄失敗: ${error instanceof Error ? error.message : '請稍後再試'}`);
  }
}

// 處理支出提交
const handleSubmitExpense = async () => {
  if (!isExpenseValid.value) return

  try {
    await addTransaction({
      amount: Number(amount.value),
      type: 'expense',
      category_id: selectedCategory.value, // 使用 category_id 而不是 category
      date: date.value,
      description: note.value || ''  // 確保有預設值
    })

    // 成功後導航到交易列表
    router.push('/transactions')
  } catch (error) {
    console.error('Failed to add transaction:', error)
    alert(`新增記錄失敗: ${error.message || '請稍後再試'}`)
  }
}

// 處理收入提交
const handleSubmitIncome = async () => {
  if (!isIncomeValid.value) return

  try {
    await addTransaction({
      amount: Number(amount.value),
      type: 'income',
      category_id: selectedCategory.value, // 使用 category_id 而不是 category
      date: date.value,
      description: note.value || ''  // 確保有預設值
    })

    // 成功後導航到交易列表
    router.push('/transactions')
  } catch (error) {
    console.error('Failed to add transaction:', error)
    alert(`新增記錄失敗: ${error.message || '請稍後再試'}`)
  }
}

onMounted(async () => {
  try {
    await initialize()
    
    // 確保類別資料已載入，否則等待 500ms 後重試
    if (!supabaseCategories.value || supabaseCategories.value.length === 0) {
      setTimeout(() => {
        if (!transactionLoading.value) {
          initialize().catch(err => console.error('重新初始化失敗:', err))
        }
      }, 500)
    }
  } catch (error) {
    console.error('初始化交易服務失敗:', error)
  }
})
</script>

<style scoped>
/* 移除 number input 的箭頭 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* 自定義日期選擇器樣式 */
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>