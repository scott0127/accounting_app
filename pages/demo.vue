<!-- pages/demo.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🚀 LLM 分類效能優化演示</h1>
      <p class="text-gray-600">比較不同的 AI 分類方法，體驗流式響應的威力</p>
    </div>

    <!-- 測試輸入 -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">測試輸入</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">交易描述</label>
          <input
            v-model="testDescription"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如：星巴克咖啡 120元"
          />
        </div>
        
        <!-- 預設範例 -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="example in examples"
            :key="example"
            @click="testDescription = example"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {{ example }}
          </button>
        </div>
      </div>
    </div>

    <!-- 測試按鈕 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- 標準分類 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-3 flex items-center">
          🐌 標準分類
          <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">慢但準確</span>
        </h3>
        <button
          @click="testStandardClassification"
          :disabled="!testDescription.trim() || isStandardTesting"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {{ isStandardTesting ? '分析中...' : '開始測試' }}
        </button>
        
        <!-- 結果顯示 -->
        <div v-if="standardResult" class="mt-4 text-sm">
          <div class="flex justify-between items-center mb-2">
            <span :class="typeClass(standardResult.type)">{{ standardResult.type === 'expense' ? '支出' : '收入' }}</span>
            <span class="text-blue-600 font-mono">{{ standardResult.metadata?.processingTime }}ms</span>
          </div>
          <div class="text-gray-600">{{ getCategoryName(standardResult.categoryId) }}</div>
          <div class="text-xs text-gray-500 mt-1">信心度: {{ standardResult.confidence }}%</div>
        </div>
      </div>

      <!-- 快速分類 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-3 flex items-center">
          ⚡ 快速分類
          <span class="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">快速優先</span>
        </h3>
        <button
          @click="testFastClassification"
          :disabled="!testDescription.trim() || isFastTesting"
          class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {{ isFastTesting ? '分析中...' : '開始測試' }}
        </button>
        
        <!-- 結果顯示 -->
        <div v-if="fastResult" class="mt-4 text-sm">
          <div class="flex justify-between items-center mb-2">
            <span :class="typeClass(fastResult.type)">{{ fastResult.type === 'expense' ? '支出' : '收入' }}</span>
            <span class="text-yellow-600 font-mono">{{ fastResult.metadata?.processingTime }}ms</span>
          </div>
          <div class="text-gray-600">{{ getCategoryName(fastResult.categoryId) }}</div>
          <div class="text-xs text-gray-500 mt-1">信心度: {{ fastResult.confidence }}%</div>
        </div>
      </div>

      <!-- 流式分類 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-3 flex items-center">
          🌊 流式分類
          <span class="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">體驗優先</span>
        </h3>
        <button
          @click="testStreamingClassification"
          :disabled="!testDescription.trim() || isStreamTesting"
          class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {{ isStreamTesting ? '分析中...' : '開始測試' }}
        </button>
        
        <!-- 進度顯示 -->
        <div v-if="streamProgress.stage && isStreamTesting" class="mt-3">
          <div class="text-xs text-gray-600 mb-1">{{ streamProgress.stage }}</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-green-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${streamProgress.progress}%` }"
            ></div>
          </div>
        </div>
        
        <!-- 即時結果 -->
        <div v-if="streamIntermediateResult && isStreamTesting" class="mt-3 p-2 bg-green-50 rounded border-l-2 border-green-300">
          <div class="text-xs text-green-700 mb-1">即時預覽</div>
          <div class="flex items-center space-x-2 text-sm">
            <span v-if="streamIntermediateResult.type" :class="typeClass(streamIntermediateResult.type)">
              {{ streamIntermediateResult.type === 'expense' ? '支出' : '收入' }}
            </span>
            <span v-if="streamIntermediateResult.categoryId" class="text-gray-600">
              {{ getCategoryName(streamIntermediateResult.categoryId) }}
            </span>
            <span v-if="streamIntermediateResult.confidence" class="text-green-600">
              {{ streamIntermediateResult.confidence }}%
            </span>
          </div>
        </div>
        
        <!-- 最終結果 -->
        <div v-if="streamResult && !isStreamTesting" class="mt-4 text-sm">
          <div class="flex justify-between items-center mb-2">
            <span :class="typeClass(streamResult.type)">{{ streamResult.type === 'expense' ? '支出' : '收入' }}</span>
            <span class="text-green-600 font-mono">{{ streamResult.metadata?.processingTime }}ms</span>
          </div>
          <div class="text-gray-600">{{ getCategoryName(streamResult.categoryId) }}</div>
          <div class="text-xs text-gray-500 mt-1">信心度: {{ streamResult.confidence }}%</div>
        </div>
      </div>
    </div>

    <!-- 性能比較 -->
    <div v-if="standardResult || fastResult || streamResult" class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 class="text-xl font-semibold mb-4">📊 性能比較</h3>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">方法</th>
              <th class="text-left py-2">耗時</th>
              <th class="text-left py-2">類型</th>
              <th class="text-left py-2">類別</th>
              <th class="text-left py-2">信心度</th>
              <th class="text-left py-2">特點</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="standardResult" class="border-b">
              <td class="py-2">標準分類</td>
              <td class="py-2 font-mono">{{ standardResult.metadata?.processingTime }}ms</td>
              <td class="py-2">
                <span :class="typeClass(standardResult.type)">
                  {{ standardResult.type === 'expense' ? '支出' : '收入' }}
                </span>
              </td>
              <td class="py-2">{{ getCategoryName(standardResult.categoryId) }}</td>
              <td class="py-2">{{ standardResult.confidence }}%</td>
              <td class="py-2 text-gray-600">最準確，但等待時間長</td>
            </tr>
            <tr v-if="fastResult" class="border-b">
              <td class="py-2">快速分類</td>
              <td class="py-2 font-mono">{{ fastResult.metadata?.processingTime }}ms</td>
              <td class="py-2">
                <span :class="typeClass(fastResult.type)">
                  {{ fastResult.type === 'expense' ? '支出' : '收入' }}
                </span>
              </td>
              <td class="py-2">{{ getCategoryName(fastResult.categoryId) }}</td>
              <td class="py-2">{{ fastResult.confidence }}%</td>
              <td class="py-2 text-gray-600">速度快，適合批量處理</td>
            </tr>
            <tr v-if="streamResult">
              <td class="py-2">流式分類</td>
              <td class="py-2 font-mono">{{ streamResult.metadata?.processingTime }}ms</td>
              <td class="py-2">
                <span :class="typeClass(streamResult.type)">
                  {{ streamResult.type === 'expense' ? '支出' : '收入' }}
                </span>
              </td>
              <td class="py-2">{{ getCategoryName(streamResult.categoryId) }}</td>
              <td class="py-2">{{ streamResult.confidence }}%</td>
              <td class="py-2 text-gray-600">體驗最佳，有即時反饋</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 推薦建議 -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-2">💡 推薦建議</h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li><strong>日常記帳：</strong>使用流式分類，提供最佳用戶體驗</li>
          <li><strong>批量處理：</strong>使用快速分類，提高處理效率</li>
          <li><strong>重要交易：</strong>使用標準分類，確保最高準確度</li>
        </ul>
      </div>
    </div>

    <!-- 功能特點 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 優化特點 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-xl font-semibold mb-4 flex items-center">
          🔧 優化特點
        </h3>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <strong>智能模型選擇：</strong>根據輸入長度自動選擇 GPT-3.5 或 GPT-4
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <strong>流式響應：</strong>即時顯示分析過程，消除等待感
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <strong>智能回退：</strong>LLM 失敗時自動使用本地分類器
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <strong>性能監控：</strong>記錄處理時間，協助優化決策
            </div>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <div>
              <strong>批量處理：</strong>支援並行分類，提高批處理效率
            </div>
          </li>
        </ul>
      </div>

      <!-- 使用建議 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-xl font-semibold mb-4 flex items-center">
          💡 使用建議
        </h3>
        <div class="space-y-4 text-sm">
          <div class="p-3 bg-blue-50 rounded-lg">
            <h4 class="font-medium text-blue-900 mb-1">日常記帳</h4>
            <p class="text-blue-800">使用智能分類或流式分類，提供最佳的互動體驗</p>
          </div>
          <div class="p-3 bg-yellow-50 rounded-lg">
            <h4 class="font-medium text-yellow-900 mb-1">批量導入</h4>
            <p class="text-yellow-800">使用快速分類或並行分類，快速處理大量資料</p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <h4 class="font-medium text-green-900 mb-1">移動設備</h4>
            <p class="text-green-800">流式分類在網路較慢時仍能提供即時反饋</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLLMClassifier } from '~/composables/useLLMClassifier'
import { useTransactionStore } from '~/stores/transaction'
import type { LLMClassifierResult } from '~/composables/useLLMClassifier'

// 設置頁面標題
useHead({
  title: 'LLM 分類效能演示'
})

const store = useTransactionStore()
const { 
  classifyWithLLM, 
  classifyFast, 
  classifyStreaming, 
  classifyIntelligent 
} = useLLMClassifier()

// 測試資料
const testDescription = ref('星巴克咖啡 120元')
const examples = [
  '星巴克咖啡 120元',
  '捷運悠遊卡儲值 500元',
  '公司發薪 35000元',
  '晚餐麥當勞漢堡 250元',
  '電影票 300元',
  '股票獲利 8000元',
  '房租 15000元',
  '手機話費 699元'
]

// 測試狀態
const isStandardTesting = ref(false)
const isFastTesting = ref(false)
const isStreamTesting = ref(false)

// 測試結果
const standardResult = ref<LLMClassifierResult | null>(null)
const fastResult = ref<LLMClassifierResult | null>(null)
const streamResult = ref<LLMClassifierResult | null>(null)

// 流式測試相關
const streamProgress = ref({
  stage: '',
  progress: 0
})
const streamIntermediateResult = ref<Partial<LLMClassifierResult> | null>(null)

// 工具函數
const getCategoryName = (categoryId: string): string => {
  const category = store.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

const typeClass = (type: 'income' | 'expense') => {
  return type === 'expense' 
    ? 'text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-medium'
    : 'text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium'
}

// 測試方法
const testStandardClassification = async () => {
  if (!testDescription.value.trim()) return
  
  isStandardTesting.value = true
  standardResult.value = null
  
  try {
    const result = await classifyWithLLM(testDescription.value)
    standardResult.value = result
  } catch (error) {
    console.error('標準分類測試失敗:', error)
  } finally {
    isStandardTesting.value = false
  }
}

const testFastClassification = async () => {
  if (!testDescription.value.trim()) return
  
  isFastTesting.value = true
  fastResult.value = null
  
  try {
    const result = await classifyFast(testDescription.value)
    fastResult.value = result
  } catch (error) {
    console.error('快速分類測試失敗:', error)
  } finally {
    isFastTesting.value = false
  }
}

const testStreamingClassification = async () => {
  if (!testDescription.value.trim()) return
  
  isStreamTesting.value = true
  streamResult.value = null
  streamIntermediateResult.value = null
  streamProgress.value = { stage: '', progress: 0 }
  
  try {
    const result = await classifyStreaming(testDescription.value, {
      onProgress: (stage, progress) => {
        streamProgress.value = { stage, progress }
      },
      onIntermediateResult: (partial) => {
        streamIntermediateResult.value = partial
      }
    })
    streamResult.value = result
  } catch (error) {
    console.error('流式分類測試失敗:', error)
  } finally {
    isStreamTesting.value = false
    streamProgress.value = { stage: '', progress: 0 }
    streamIntermediateResult.value = null
  }
}
</script>
