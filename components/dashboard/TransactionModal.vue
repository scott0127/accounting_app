<template>
  <div
    v-if="show"
    class="fixed inset-0 flex flex-col justify-end md:justify-center items-center z-50"
    @click.self="$emit('close')"
  >
    <!-- 背景遮罩 - 獨立層提高視覺層次 -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
         @click="$emit('close')"></div>
    
    <!-- 表單容器 - 手機上從底部彈出 -->
    <div :class="`relative w-full max-w-md md:rounded-xl rounded-t-xl shadow-2xl 
                transform transition-all duration-300 z-10 overflow-hidden bg-[${currentTheme.colors.surface}]`">
      <!-- 頂部裝飾 -->
      <div :class="`h-1 bg-gradient-to-r from-[${currentTheme.colors.primary}] to-[${currentTheme.colors.accent}]`"></div>
      
      <!-- 手機拖動條 -->
      <div :class="`w-12 h-1 rounded-full mx-auto my-2 md:hidden bg-[${currentTheme.colors.textLight}40]`"></div>
      
      <!-- 標題區域 -->
      <div :class="`px-4 py-3 flex items-center justify-between border-b border-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`">
        <h3 class="text-lg font-semibold flex items-center">
          <span :class="`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getIconBackgroundColorThemed()}`">
            <component :is="getHeaderIcon()" :class="`h-4 w-4 ${getIconTextColorThemed()}`" />
          </span>
          {{ isEditing ? '編輯交易' : '新增交易' }}
        </h3>
        <button @click="$emit('close')" 
                :class="`w-8 h-8 rounded-full flex items-center justify-center text-[${currentTheme.colors.textLight}] hover:bg-[${currentTheme.colors.background}]`">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- 表單內容 - 滾動區域 -->
      <div class="overflow-y-auto max-h-[calc(85vh-80px)] md:max-h-[600px]">
        <div :class="`p-4 text-[${currentTheme.colors.text}]`">
          <!-- 模式選擇 - 只在新增時顯示 -->
          <div v-if="!isEditing" class="mb-6">
            <div :class="`p-1 rounded-lg flex bg-[${currentTheme.colors.background}]`">
              <button 
                v-for="(mode, index) in modes" :key="mode.value"
                @click="transactionMode = mode.value"
                class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
                :class="transactionMode === mode.value ? getActiveTabClassThemed(mode.value) : `text-[${currentTheme.colors.textLight}]`"
              >
                <div class="flex items-center justify-center">
                  <component :is="mode.icon" class="h-3.5 w-3.5 mr-1.5" />
                  {{ mode.label }}
                </div>
              </button>
            </div>
          </div>
          
          <!-- AI記帳模式 -->
          <template v-if="transactionMode === 'ai'">
            <div class="space-y-4">
              <div>
                <label :class="`block text-sm font-medium mb-1 text-[${currentTheme.colors.text}]`">消費內容</label>
                <input
                  v-model="expenseDescription"
                  type="text"
                  :class="`w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none bg-[${currentTheme.colors.background}] border border-[${currentTheme.colors.textLight}40] text-[${currentTheme.colors.text}] focus:ring-[${currentTheme.colors.primary}] focus:border-[${currentTheme.colors.primary}]`"
                  placeholder="例如：午餐吃麥當勞100元"
                  @input="autoClassifyExpense"
                />
                
                <div v-if="classificationResult" 
                     :class="`mt-2 p-2 rounded-lg bg-[${currentTheme.colors.primary}15]`">
                  <div class="flex items-center">
                    <span :class="`text-xs px-2 py-0.5 rounded-full bg-[${currentTheme.colors.primary}30] text-[${currentTheme.colors.primary}]`">
                      {{ getCategoryName(classificationResult.categoryId) }}
                    </span>
                    <span v-if="classificationResult.confidence > 0" 
                          :class="`text-xs ml-2 text-[${currentTheme.colors.textLight}]`">
                      ({{ classificationResult.confidence }}% 信心度)
                    </span>
                  </div>
                  <p :class="`text-xs mt-1 text-[${currentTheme.colors.textLight}]`">
                    {{ classificationResult.explanation }}
                  </p>
                </div>
              </div>
              
              <div>
                <label :class="`block text-sm font-medium mb-1 text-[${currentTheme.colors.text}]`">日期</label>
                <div class="relative">
                  <input
                    v-model="transactionData.date"
                    type="date"
                    :class="`w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none bg-[${currentTheme.colors.background}] border border-[${currentTheme.colors.textLight}40] text-[${currentTheme.colors.text}] focus:ring-[${currentTheme.colors.primary}] focus:border-[${currentTheme.colors.primary}]`"
                    :max="today"
                  />
                </div>
              </div>
            </div>
          </template>
          
          <!-- 標準記帳模式 -->
          <template v-else>
            <!-- 金額輸入 -->
            <div class="mb-5">
              <label :class="`block text-sm font-medium mb-1 text-[${currentTheme.colors.text}]`">金額</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold"
                     :class="`text-[${transactionMode === 'income' ? currentTheme.colors.success : currentTheme.colors.error}]`">
                  $
                </span>
                <input
                  v-model="transactionData.amount"
                  type="number"
                  inputmode="decimal"
                  class="w-full text-2xl font-bold pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:outline-none"
                  :class="`bg-[${currentTheme.colors.background}] border border-[${currentTheme.colors.textLight}40] 
                          text-[${transactionMode === 'income' ? currentTheme.colors.success : currentTheme.colors.error}] 
                          focus:ring-[${transactionMode === 'income' ? currentTheme.colors.success : currentTheme.colors.error}] 
                          focus:border-[${transactionMode === 'income' ? currentTheme.colors.success : currentTheme.colors.error}]`"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <!-- 類別選擇 - 更適合移動端的網格 -->
            <div class="mb-5">
              <label :class="`block text-sm font-medium mb-2 text-[${currentTheme.colors.text}]`">類別</label>
              <div :class="`grid grid-cols-4 gap-3 p-2 rounded-lg bg-[${currentTheme.colors.background}]`">
                <button
                  v-for="category in currentCategories"
                  :key="category.id"
                  type="button"
                  class="aspect-square flex flex-col items-center justify-center p-2 rounded-lg transition-all"
                  :class="transactionData.category === category.id ? 
                    `bg-[${currentTheme.colors.primary}15] border-2 border-[${currentTheme.colors.primary}] shadow` : 
                    `bg-[${currentTheme.colors.surface}] border border-[${currentTheme.colors.textLight}40] hover:border-[${currentTheme.colors.primary}40]`"
                  @click="transactionData.category = category.id"
                >
                  <div class="text-2xl mb-1" :class="transactionData.category === category.id ? 'scale-110' : ''">
                    {{ category.icon }}
                  </div>
                  <span class="text-xs truncate w-full text-center" 
                        :class="transactionData.category === category.id ? 
                          `text-[${currentTheme.colors.primary}] font-medium` : 
                          `text-[${currentTheme.colors.textLight}]`">
                    {{ category.name }}
                  </span>
                </button>
                
                <!-- 捲動提示 -->
                <div v-if="currentCategories.length > 8" class="col-span-4 -mt-1">
                  <div class="flex justify-center">
                    <span :class="`text-xs text-[${currentTheme.colors.textLight}80]`">左右滑動查看更多類別</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 備註 -->
            <div class="mb-5">
              <label :class="`block text-sm font-medium mb-1 text-[${currentTheme.colors.text}]`">備註</label>
              <input
                v-model="expenseDescription"
                type="text"
                :class="`w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none bg-[${currentTheme.colors.background}] border border-[${currentTheme.colors.textLight}40] text-[${currentTheme.colors.text}] focus:ring-[${currentTheme.colors.primary}] focus:border-[${currentTheme.colors.primary}]`"
                placeholder="選填"
              />
            </div>

            <!-- 日期選擇器 -->
            <div class="mb-1">
              <label :class="`block text-sm font-medium mb-1 text-[${currentTheme.colors.text}]`">日期</label>
              <div class="relative">
                <input
                  v-model="transactionData.date"
                  type="date"
                  :class="`w-full px-4 py-3 rounded-lg focus:ring-2 focus:outline-none bg-[${currentTheme.colors.background}] border border-[${currentTheme.colors.textLight}40] text-[${currentTheme.colors.text}] focus:ring-[${currentTheme.colors.primary}] focus:border-[${currentTheme.colors.primary}]`"
                  :max="today"
                />
                <div :class="`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[${currentTheme.colors.textLight}]`">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 操作按鈕 - 固定在底部 -->
      <div :class="`p-4 border-t border-[${currentTheme.colors.background}] bg-[${currentTheme.colors.surface}]`">
        <div class="flex justify-between items-center">
          <!-- 刪除按鈕 (編輯模式) -->
          <button v-if="isEditing"
                  :class="`px-4 py-2.5 rounded-lg transition-colors text-[${currentTheme.colors.error}] border border-[${currentTheme.colors.error}] hover:bg-[${currentTheme.colors.error}10]`"
                  @click="confirmDelete"
          >
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              刪除
            </div>
          </button>
          
          <div :class="{'ml-auto': isEditing}" class="flex space-x-3">
            <button
              :class="`px-4 py-2.5 rounded-lg transition-colors text-[${currentTheme.colors.textLight}] hover:bg-[${currentTheme.colors.background}]`"
              @click="$emit('close')"
            >
              取消
            </button>
            <button
              class="px-6 py-2.5 rounded-lg flex items-center justify-center transition-colors"
              :class="isValid ? 
                `bg-[${currentTheme.colors.primary}] text-white hover:bg-[${darkenColor(currentTheme.colors.primary, 10)}]` : 
                `bg-[${currentTheme.colors.textLight}40] text-[${currentTheme.colors.textLight}] cursor-not-allowed`"
              @click="saveTransaction"
              :disabled="!isValid"
            >
              <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ isEditing ? '更新' : '新增' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 刪除確認彈窗 -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-[60]">
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
    <div :class="`rounded-xl shadow-2xl p-5 max-w-xs w-full mx-4 relative z-10 bg-[${currentTheme.colors.surface}] text-[${currentTheme.colors.text}]`">
      <div :class="`flex items-center justify-center mb-3 text-[${currentTheme.colors.error}]`">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 :class="`text-lg font-bold text-center mb-2 text-[${currentTheme.colors.text}]`">確定要刪除嗎？</h3>
      <p :class="`text-sm text-center mb-5 text-[${currentTheme.colors.textLight}]`">此操作無法復原，交易記錄將被永久刪除</p>
      <div class="flex space-x-3">
        <button 
          :class="`flex-1 py-2.5 rounded-lg border transition-colors text-[${currentTheme.colors.text}] border-[${currentTheme.colors.textLight}40] hover:bg-[${currentTheme.colors.background}]`"
          @click="showDeleteConfirm = false"
        >
          取消
        </button>
        <button 
          :class="`flex-1 py-2.5 rounded-lg transition-colors bg-[${currentTheme.colors.error}] text-white hover:bg-[${darkenColor(currentTheme.colors.error, 10)}]`"
          @click="handleDelete"
        >
          確定刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useExpenseClassifier } from '~/composables/useExpenseClassifier'
import dayjs from 'dayjs'

type TransactionMode = 'ai' | 'expense' | 'income'

// 獲取當前主題
const { currentTheme } = useTheme()

interface TransactionData {
  id?: string;
  type: 'income' | 'expense';
  category: string; // 前端界面使用 category，但會轉換為 category_id 傳給後端
  category_id?: string; // 增加 category_id 欄位以支持 Supabase 結構
  amount: number | string;
  date: string;
  description?: string;
  note?: string; // 增加 note 欄位以支持資料庫結構
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object as () => TransactionData | null,
    default: null
  },
  categories: {
    type: Array as () => Category[],
    required: true
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

// Initialize the expense classifier
const { classifyExpense } = useExpenseClassifier()

// Transaction mode state
const transactionMode = ref<TransactionMode>('expense')

// Create a copy of the transaction data to avoid mutating props
const transactionData = ref<TransactionData>({
  type: 'expense',
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

// State for the auto-categorization system
const expenseDescription = ref('')
const classificationResult = ref<any>(null)

// 當前日期
const today = computed(() => dayjs().format('YYYY-MM-DD'))

// 當前類別列表
const currentCategories = computed(() => {
  const type = transactionMode.value === 'income' ? 'income' : 'expense'
  return props.categories.filter(c => c.type === type)
})

// Reset the form to defaults
const resetForm = () => {
  transactionData.value = {
    type: transactionMode.value === 'income' ? 'income' : 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  }
  expenseDescription.value = ''
  classificationResult.value = null
}

// Extract amount from AI description
const extractAmountFromDescription = (description: string): number => {
  const matches = description.match(/\d+/)
  return matches ? parseInt(matches[0]) : 0
}

// Validate form
const isValid = computed(() => {
  // 對 AI 模式的驗證邏輯
  if (transactionMode.value === 'ai') {
    return expenseDescription.value.trim() !== '' && extractAmountFromDescription(expenseDescription.value) > 0
  }
  
  // 對一般模式的驗證邏輯（支出/收入）
  const amount = Number(transactionData.value.amount)
  
  return amount > 0 && transactionData.value.category !== ''
})

// Auto-classify the expense based on description
const autoClassifyExpense = () => {
  if (expenseDescription.value.trim()) {
    classificationResult.value = classifyExpense(expenseDescription.value)
    if (transactionMode.value === 'ai') {
      transactionData.value.category = classificationResult.value.categoryId
      
      // If in AI mode, try to extract amount
      const amount = extractAmountFromDescription(expenseDescription.value)
      if (amount > 0) {
        transactionData.value.amount = amount
      }
    }
  } else {
    classificationResult.value = null
  }
}

// Watch for transaction mode changes
watch(transactionMode, (newMode) => {
  transactionData.value.type = newMode === 'income' ? 'income' : 'expense'
  resetForm()
})

// Update transaction data when props change
watch(() => props.transaction, (newVal) => {
  if (newVal) {
    transactionData.value = { ...newVal }
    expenseDescription.value = newVal.description || ''
    transactionMode.value = newVal.type === 'income' ? 'income' : 'expense'
    
    if (newVal.type === 'expense' && expenseDescription.value) {
      autoClassifyExpense()
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Get category name from ID
const getCategoryName = (categoryId: string): string => {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

// Save the transaction
const saveTransaction = () => {
  if (!isValid.value) return
  
  const dataToSave = { ...transactionData.value }
  
  if (transactionMode.value === 'ai') {
    // AI 模式處理
    dataToSave.type = 'expense'
    dataToSave.description = expenseDescription.value
    dataToSave.amount = extractAmountFromDescription(expenseDescription.value)
    dataToSave.category = classificationResult.value?.categoryId || 'food'
    dataToSave.category_id = classificationResult.value?.categoryId || 'food'
  } else {
    // 一般模式處理
    dataToSave.description = expenseDescription.value
    dataToSave.category_id = dataToSave.category
  }
  
  // 確保前端也能顯示 note，但是不會傳送到後端
  // 為了保持前端顯示一致性，將 description 也保存在前端的 note 欄位中
  dataToSave.note = dataToSave.description
  
  // 處理資料庫不存在的欄位，避免 Supabase 錯誤
  const cleanedData = { ...dataToSave }
  
  // 刪除可能導致問題的欄位
  if ('updated_at' in cleanedData) delete cleanedData.updated_at
  
  emit('save', cleanedData)
}

// 模式定義
const modes = [
  {
    label: 'AI記帳',
    value: 'ai',
    icon: defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        class: 'h-full w-full', 
        fill: 'none', 
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, [
        h('path', { 
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M13 10V3L4 14h7v7l9-11h-7z'
        })
      ])
    })
  },
  {
    label: '支出',
    value: 'expense',
    icon: defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        class: 'h-full w-full', 
        fill: 'none', 
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, [
        h('path', { 
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
        })
      ])
    })
  },
  {
    label: '收入',
    value: 'income',
    icon: defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        class: 'h-full w-full', 
        fill: 'none', 
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, [
        h('path', { 
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        })
      ])
    })
  }
]

// 刪除確認
const showDeleteConfirm = ref(false)

// 顯示刪除確認框
const confirmDelete = () => {
  showDeleteConfirm.value = true
}

// 處理刪除
const handleDelete = () => {
  emit('delete', transactionData.value.id)
  showDeleteConfirm.value = false
}

// 動態顏色處理
const getIconBackgroundColorThemed = () => {
  if (props.isEditing) {
    return `bg-[${currentTheme.value.colors.primary}20]`
  } else if (transactionMode.value === 'income') {
    return `bg-[${currentTheme.value.colors.success}20]`
  } else if (transactionMode.value === 'expense') {
    return `bg-[${currentTheme.value.colors.error}20]`
  } else {
    return `bg-[${currentTheme.value.colors.accent}20]`
  }
}

// 獲取圖標文字顏色
const getIconTextColorThemed = () => {
  if (props.isEditing) {
    return `text-[${currentTheme.value.colors.primary}]`
  } else if (transactionMode.value === 'income') {
    return `text-[${currentTheme.value.colors.success}]`
  } else if (transactionMode.value === 'expense') {
    return `text-[${currentTheme.value.colors.error}]`
  } else {
    return `text-[${currentTheme.value.colors.accent}]`
  }
}

// 頭部圖標樣式
const getHeaderIcon = () => {
  if (props.isEditing) {
    return defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        class: 'h-full w-full', 
        fill: 'none', 
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, [
        h('path', { 
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
        })
      ])
    })
  } else if (transactionMode.value === 'income') {
    return modes[2].icon
  } else if (transactionMode.value === 'expense') {
    return modes[1].icon
  } else {
    return modes[0].icon
  }
}

// 獲取激活標籤類
const getActiveTabClassThemed = (mode: string) => {
  if (mode === 'ai') {
    return `bg-[${currentTheme.value.colors.accent}20] text-[${currentTheme.value.colors.accent}]`
  } else if (mode === 'expense') {
    return `bg-[${currentTheme.value.colors.error}20] text-[${currentTheme.value.colors.error}]`
  } else {
    return `bg-[${currentTheme.value.colors.success}20] text-[${currentTheme.value.colors.success}]`
  }
}

// 顏色處理函數 - 讓顏色更深/更淺
const darkenColor = (color: string, percent: number) => {
  if (!color || color === 'transparent') return color;
  let hex = color;
  
  // 如果是HEX色碼格式處理
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  
  // 將HEX轉為RGB
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  
  // 調整亮度
  r = Math.max(0, Math.min(255, r - (r * percent / 100)));
  g = Math.max(0, Math.min(255, g - (g * percent / 100)));
  b = Math.max(0, Math.min(255, b - (b * percent / 100)));
  
  // 轉回HEX
  const rHex = Math.round(r).toString(16).padStart(2, '0');
  const gHex = Math.round(g).toString(16).padStart(2, '0');
  const bHex = Math.round(b).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}
</script>

<style>
/* 移除數字輸入框的上下按鈕 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* 美化日期選擇器 */
input[type="date"] {
  position: relative;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  color: transparent;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 移動端優化滑動 */
@media (max-width: 768px) {
  .grid {
    scroll-snap-type: x mandatory;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }
  
  .grid > button {
    scroll-snap-align: start;
  }
  
  ::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

/* 入場動畫 */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .fixed > div:last-child {
    animation: slideUp 0.3s ease-out forwards;
  }
}

@media (min-width: 769px) {
  .fixed > div:last-child {
    animation: fadeIn 0.2s ease-out forwards;
  }
}
</style>