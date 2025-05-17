<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold">{{ title }}</h3>
      <button 
        class="text-xs text-blue-500 hover:underline"
        @click="$emit('toggle-expanded')">
        {{ isExpanded ? '收起' : '展開' }}
      </button>
    </div>
    <div class="space-y-4">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
      >
        <div class="flex items-center">
          <span class="text-xl mr-3">{{ getCategoryIcon(transaction.category) }}</span>
          <div>
            <p class="font-medium">{{ getCategoryName(transaction.category) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</p>
            <p v-if="transaction.description" class="text-xs text-gray-600 mt-1 italic">
              {{ transaction.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center">
          <span
            class="font-semibold mr-3"
            :class="transaction.type === 'income' ? 'text-green-500' : 'text-red-500'"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
          </span>
          <div class="flex space-x-1">
            <button @click="$emit('edit', transaction)" 
              class="text-gray-400 hover:text-gray-600 p-1">
              ✎
            </button>
            <button @click="$emit('duplicate', transaction)"
              class="text-gray-400 hover:text-gray-600 p-1">
              ⧉
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="transactions.length === 0" class="py-8 text-center text-gray-400">
        沒有交易記錄
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatAmount, formatDate } from '~/utils/formatters'

interface TransactionItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
}

const props = defineProps({
  title: {
    type: String,
    default: '最近記錄'
  },
  transactions: {
    type: Array as () => TransactionItem[],
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  getCategoryIcon: {
    type: Function,
    required: true
  },
  getCategoryName: {
    type: Function,
    required: true
  }
})

defineEmits(['edit', 'duplicate', 'toggle-expanded'])
</script> 