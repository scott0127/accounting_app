<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
      <h3 class="text-lg font-semibold mb-4">{{ isEditing ? '編輯交易' : '新增交易' }}</h3>
      
      <!-- 模式選擇 -->
      <div v-if="!isEditing" class="grid grid-cols-3 gap-2 mb-4">
        <button 
          @click="transactionMode = 'ai'"
          :class="[
            'py-2 rounded-lg font-medium transition-colors text-center text-sm',
            transactionMode === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          ]"
        >
          AI記帳
        </button>
        <button 
          @click="transactionMode = 'expense'"
          :class="[
            'py-2 rounded-lg font-medium transition-colors text-center text-sm',
            transactionMode === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          ]"
        >
          支出
        </button>
        <button 
          @click="transactionMode = 'income'"
          :class="[
            'py-2 rounded-lg font-medium transition-colors text-center text-sm',
            transactionMode === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          ]"
        >
          收入
        </button>
      </div>

      <!-- AI記帳模式 -->
      <template v-if="transactionMode === 'ai'">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">消費內容</label>
          <input
            v-model="expenseDescription"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg"
            placeholder="例如：午餐吃麥當勞100元"
            @input="autoClassifyExpense"
          />
          <!-- AI 分析結果 -->
          <div v-if="classificationResult" class="mt-2">
            <div class="flex items-center">
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {{ getCategoryName(classificationResult.categoryId) }}
              </span>
              <span v-if="classificationResult.confidence > 0" class="text-xs text-gray-500 ml-2">
                ({{ classificationResult.confidence }}% 信心度)
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ classificationResult.explanation }}</p>
          </div>
        </div>
      </template>

      <!-- 一般記帳模式（支出和收入） -->
      <template v-else>
        <!-- 金額輸入 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">金額</label>
          <div class="relative">
            <input
              v-model="transactionData.amount"
              type="number"
              inputmode="decimal"
              class="w-full text-2xl font-semibold focus:outline-none px-4 py-2 border border-gray-200 rounded-lg"
              placeholder="0"
              required
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          </div>
        </div>

        <!-- 類別選擇 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-4">類別</label>
          <div class="grid grid-cols-4 gap-4">
            <button
              v-for="category in currentCategories"
              :key="category.id"
              type="button"
              class="flex flex-col items-center p-2 rounded-lg transition-colors"
              :class="transactionData.category === category.id ? 'bg-blue-100' : ''"
              @click="transactionData.category = category.id"
            >
              <span class="text-2xl mb-1">{{ category.icon }}</span>
              <span class="text-xs">{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- 備註 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">備註</label>
          <input
            v-model="expenseDescription"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg"
            placeholder="選填"
          />
        </div>
      </template>
      
      <!-- 共用的日期選擇器 -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-1">日期</label>
        <input
          v-model="transactionData.date"
          type="date"
          class="w-full px-4 py-2 border border-gray-200 rounded-lg"
          :max="today"
        />
      </div>
      
      <div class="flex justify-end space-x-2">
        <button
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          @click="$emit('close')"
        >
          取消
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          @click="saveTransaction"
          :disabled="!isValid"
        >
          {{ isEditing ? '更新' : '新增' }}
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

interface TransactionData {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number | string;
  date: string;
  description?: string;
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

const emit = defineEmits(['close', 'save'])

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
  if (transactionMode.value === 'ai') {
    return expenseDescription.value.trim() !== '' && extractAmountFromDescription(expenseDescription.value) > 0
  }
  
  const amount = Number(transactionData.value.amount)
  return amount > 0 && transactionData.value.category !== ''
})

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
    dataToSave.type = 'expense'
    dataToSave.description = expenseDescription.value
    dataToSave.amount = extractAmountFromDescription(expenseDescription.value)
    dataToSave.category = classificationResult.value?.categoryId || 'food'
  } else {
    dataToSave.description = expenseDescription.value
  }
  
  emit('save', dataToSave)
}
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style> 