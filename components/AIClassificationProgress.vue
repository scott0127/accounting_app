<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
      <!-- 標題 -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          🤖 AI 智能分析中
        </h3>
        <button 
          v-if="canCancel" 
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 進度條 -->
      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>{{ currentStage }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- 即時結果預覽 -->
      <div v-if="intermediateResult" class="mb-4 p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600 mb-2">預覽結果：</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span :class="typeClass">
              {{ typeLabel }}
            </span>
            <span v-if="intermediateResult.categoryId" class="text-gray-700">
              {{ getCategoryName(intermediateResult.categoryId) }}
            </span>
          </div>
          <div v-if="intermediateResult.confidence" class="text-right">
            <div class="text-xs text-gray-500">信心度</div>
            <div :class="confidenceClass">{{ intermediateResult.confidence }}%</div>
          </div>
        </div>
      </div>

      <!-- 動畫效果 -->
      <div class="flex justify-center">
        <div class="flex space-x-1">
          <div 
            v-for="i in 3" 
            :key="i"
            class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            :style="{ animationDelay: `${i * 0.2}s` }"
          ></div>
        </div>
      </div>

      <!-- 性能提示 -->
      <div v-if="showPerformanceTip" class="mt-4 text-xs text-gray-500 text-center">
        💡 提示：{{ performanceTip }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LLMClassifierResult } from '~/composables/useLLMClassifier'
import { useTransactionStore } from '~/stores/transaction'

interface Props {
  visible: boolean
  progress: number
  currentStage: string
  intermediateResult?: Partial<LLMClassifierResult>
  canCancel?: boolean
  showPerformanceTip?: boolean
}

interface Emits {
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  progress: 0,
  currentStage: '準備中...',
  canCancel: true,
  showPerformanceTip: true
})

defineEmits<Emits>()

// 使用 store 獲取類別名稱
const store = useTransactionStore()

const getCategoryName = (categoryId: string): string => {
  const category = store.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

// 計算樣式
const typeClass = computed(() => {
  if (!props.intermediateResult?.type) return 'text-gray-500'
  return props.intermediateResult.type === 'expense' 
    ? 'text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-medium'
    : 'text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium'
})

const typeLabel = computed(() => {
  if (!props.intermediateResult?.type) return '分析中...'
  return props.intermediateResult.type === 'expense' ? '支出' : '收入'
})

const confidenceClass = computed(() => {
  const confidence = props.intermediateResult?.confidence || 0
  if (confidence >= 80) return 'text-green-600 font-semibold'
  if (confidence >= 60) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
})

const performanceTip = computed(() => {
  const tips = [
    '使用更簡潔的描述可以提高分析速度',
    '包含關鍵詞如"麥當勞"、"薪水"能提高準確度',
    'AI 正在學習您的消費習慣',
    '流式分析可以提供即時反饋'
  ]
  return tips[Math.floor(Math.random() * tips.length)]
})
</script>

<style scoped>
@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
