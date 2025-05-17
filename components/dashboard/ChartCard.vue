<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-base font-semibold">{{ title }}</h3>
      <button 
        @click="$emit('show-details')" 
        class="text-xs text-blue-500 hover:underline">
        查看詳情
      </button>
    </div>
    <div class="h-48">
      <template v-if="chartData">
        <slot name="chart"></slot>
        <!-- 顯示前三大類別 -->
        <div v-if="topCategories.length" class="mt-2 text-xs">
          <div v-for="(category, index) in topCategories" :key="index" 
               class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-1" 
                   :style="{ backgroundColor: colors[index % colors.length] }"></div>
              <span>{{ category.name }}</span>
            </div>
            <span>{{ formatAmount(category.amount) }}</span>
          </div>
        </div>
      </template>
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        {{ emptyText }}
      </div>
    </div>
    <p :class="totalClass" class="text-center mt-2 text-sm font-medium">
      {{ formatAmount(totalAmount) }}
    </p>
  </div>

  <!-- 詳細圖表彈窗 -->
  <div
    v-if="showDetails"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close-details')"
  >
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{{ detailsTitle }}</h3>
        <button 
          @click="$emit('close-details')"
          class="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
        >
          ✕
        </button>
      </div>
      <div class="h-64">
        <slot name="detail-chart"></slot>
      </div>
      <div class="mt-4">
        <div v-for="(category, index) in categories" :key="index"
             class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" 
                 :style="{ backgroundColor: colors[index % colors.length] }"></div>
            <span>{{ category.name }}</span>
          </div>
          <div>
            <span class="mr-2">{{ formatAmount(category.amount) }}</span>
            <span class="text-xs text-gray-500">{{ calculatePercentage(category.amount, totalAmount) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Category {
  id: string;
  name: string;
  amount: number;
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  detailsTitle: {
    type: String,
    required: true
  },
  chartData: {
    type: Object,
    default: null
  },
  emptyText: {
    type: String,
    default: '無數據'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  totalClass: {
    type: String,
    default: 'text-gray-500'
  },
  colors: {
    type: Array as () => string[],
    required: true
  },
  topCategories: {
    type: Array as () => Category[],
    default: () => []
  },
  categories: {
    type: Array as () => Category[],
    default: () => []
  },
  showDetails: {
    type: Boolean,
    default: false
  }
})

defineEmits(['show-details', 'close-details'])

// 格式化金額
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

// 計算百分比
const calculatePercentage = (amount: number, total: number): string => {
  if (total === 0) return '0'
  return ((amount / total) * 100).toFixed(1)
}
</script> 