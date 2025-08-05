<template>
  <div class="financial-assistant">
    <!-- 快速洞察卡片 - 立即顯示 -->
    <div v-if="currentInsights.quick" class="quick-insight-card">
      <h3>快速財務洞察</h3>
      <div class="insight-grid">
        <div class="insight-item">
          <span class="label">本月餘額</span>
          <span class="value" :class="{ 'negative': currentInsights.quick.monthlyBalance < 0 }">
            {{ formatCurrency(currentInsights.quick.monthlyBalance) }}
          </span>
        </div>
        <div class="insight-item">
          <span class="label">主要支出</span>
          <span class="value">{{ currentInsights.quick.topSpendingCategory }}</span>
        </div>
        <div class="insight-item">
          <span class="label">儲蓄率</span>
          <span class="value" :class="getSavingsRateClass(currentInsights.quick.savingsRate)">
            {{ currentInsights.quick.savingsRate.toFixed(1) }}%
          </span>
        </div>
      </div>
      
      <!-- 緊急警示 -->
      <div v-if="currentInsights.quick.urgentAlerts.length > 0" class="urgent-alerts">
        <div v-for="alert in currentInsights.quick.urgentAlerts" :key="alert" class="alert">
          ⚠️ {{ alert }}
        </div>
      </div>
    </div>

    <!-- 分析進度條 -->
    <div v-if="analysisProgress.isLoading" class="analysis-progress">
      <div class="progress-header">
        <h4>智能分析進行中...</h4>
        <span class="time-remaining">預計 {{ analysisProgress.timeRemaining }}秒</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${analysisProgress.percentage}%` }"
        ></div>
      </div>
      <p class="progress-message">{{ analysisProgress.message }}</p>
    </div>

    <!-- 主動建議 -->
    <div v-if="proactiveAdvice && proactiveAdvice.length > 0" class="proactive-advice">
      <h4>💡 智能建議</h4>
      <div v-for="advice in proactiveAdvice" :key="advice.title" 
           class="advice-card" :class="advice.type">
        <h5>{{ advice.title }}</h5>
        <p>{{ advice.message }}</p>
        <button @click="handleAdviceAction(advice)">{{ advice.action }}</button>
      </div>
    </div>

    <!-- 對話式互動 -->
    <div class="chat-interface">
      <div class="chat-header">
        <h4>💬 問我任何財務問題</h4>
      </div>
      
      <!-- 建議問題 -->
      <div class="suggested-questions">
        <p>試試這些問題：</p>
        <div class="question-chips">
          <button 
            v-for="question in suggestedQuestions" 
            :key="question"
            @click="askQuestion(question)"
            class="question-chip"
          >
            {{ question }}
          </button>
        </div>
      </div>

      <!-- 聊天輸入 -->
      <div class="chat-input">
        <input 
          v-model="userInput" 
          @keyup.enter="handleUserInput"
          placeholder="例如：我應該如何控制飲食支出？"
          class="chat-textbox"
        />
        <button @click="handleUserInput" :disabled="!userInput.trim()">
          發送
        </button>
      </div>

      <!-- 聊天回應 -->
      <div v-if="chatResponse" class="chat-response">
        <div class="assistant-message">
          {{ chatResponse }}
        </div>
      </div>
    </div>

    <!-- 詳細分析結果 -->
    <div v-if="currentInsights.detailed" class="detailed-analysis">
      <h3>詳細財務分析</h3>
      
      <!-- 財務健康分數 -->
      <div class="health-score">
        <div class="score-circle" :class="getHealthScoreClass(currentInsights.detailed.financialHealthScore)">
          {{ currentInsights.detailed.financialHealthScore }}
        </div>
        <p>財務健康分數</p>
      </div>

      <!-- 支出模式分析 -->
      <div class="spending-patterns">
        <h4>支出模式分析</h4>
        <div class="category-analysis">
          <div v-for="category in currentInsights.detailed.spendingPatterns.categories" 
               :key="category.name" class="category-item">
            <div class="category-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-trend" :class="category.trend">
                {{ getTrendIcon(category.trend) }}
              </span>
            </div>
            <div class="category-amount">
              {{ formatCurrency(category.amount) }} ({{ category.percentage.toFixed(1) }}%)
            </div>
            <div class="category-recommendation">
              {{ category.recommendation }}
            </div>
          </div>
        </div>
      </div>

      <!-- 預算最佳化建議 -->
      <div class="budget-optimization">
        <h4>預算最佳化建議</h4>
        <div class="budget-breakdown">
          <div class="budget-item">
            <span>必要支出</span>
            <span>{{ formatCurrency(currentInsights.detailed.budgetOptimization.essentials) }}</span>
          </div>
          <div class="budget-item">
            <span>可自由支配</span>
            <span>{{ formatCurrency(currentInsights.detailed.budgetOptimization.discretionary) }}</span>
          </div>
          <div class="budget-item">
            <span>建議儲蓄</span>
            <span>{{ formatCurrency(currentInsights.detailed.budgetOptimization.savings) }}</span>
          </div>
        </div>
        <p class="budget-explanation">{{ currentInsights.detailed.budgetOptimization.explanation }}</p>
        
        <!-- 快速改善建議 -->
        <div class="quick-wins">
          <h5>快速改善方案</h5>
          <ul>
            <li v-for="win in currentInsights.detailed.budgetOptimization.quickWins" :key="win">
              {{ win }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSmartFinancialAssistant } from '~/composables/useSmartFinancialAssistant'

const {
  currentInsights,
  analysisProgress,
  proactiveAdvice,
  suggestedQuestions,
  startAnalysis,
  quickAsk,
  generateConversationalResponse
} = useSmartFinancialAssistant()

const userInput = ref('')
const chatResponse = ref('')

// 格式化貨幣
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

// 儲蓄率樣式
const getSavingsRateClass = (rate: number) => {
  if (rate >= 20) return 'excellent'
  if (rate >= 10) return 'good'
  return 'needs-improvement'
}

// 健康分數樣式
const getHealthScoreClass = (score: number) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'needs-improvement'
}

// 趨勢圖標
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return '📈'
    case 'down': return '📉'
    default: return '➡️'
  }
}

// 處理用戶輸入
const handleUserInput = async () => {
  if (!userInput.value.trim()) return
  
  const input = userInput.value
  userInput.value = ''
  
  // 生成對話式回應
  chatResponse.value = generateConversationalResponse(input)
  
  // 如果需要更詳細的回答，可以調用 quickAsk
  try {
    const detailedResponse = await quickAsk(input, {
      start: getCurrentMonth().start,
      end: getCurrentMonth().end
    })
    
    if (detailedResponse.answer) {
      chatResponse.value = detailedResponse.answer
    }
  } catch (error) {
    console.error('Quick ask failed:', error)
  }
}

// 預設問題點擊
const askQuestion = (question: string) => {
  userInput.value = question
  handleUserInput()
}

// 建議操作處理
const handleAdviceAction = (advice: any) => {
  // 根據建議類型執行相應操作
  console.log('Handling advice action:', advice)
}

// 獲取當前月份範圍
const getCurrentMonth = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

// 初始化分析
onMounted(async () => {
  try {
    const dateRange = getCurrentMonth()
    await startAnalysis(dateRange, '請分析我的整體財務狀況')
  } catch (error) {
    console.error('Failed to start analysis:', error)
  }
})
</script>

<style scoped>
.financial-assistant {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.financial-assistant > * {
  margin-bottom: 20px;
}

.quick-insight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.insight-item {
  text-align: center;
}

.insight-item .label {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.insight-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
}

.value.negative {
  color: #ff6b6b;
}

.value.excellent {
  color: #51cf66;
}

.value.good {
  color: #ffd43b;
}

.value.needs-improvement {
  color: #ff8787;
}

.analysis-progress {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.proactive-advice {
  margin-bottom: 20px;
}

.advice-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
}

.advice-card.warning {
  border-left-color: #ffd43b;
  background: #fff8db;
}

.advice-card.urgent {
  border-left-color: #ff6b6b;
  background: #ffe0e0;
}

.chat-interface {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.suggested-questions {
  margin-bottom: 16px;
}

.question-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.question-chip {
  background: #e9ecef;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.question-chip:hover {
  background: #667eea;
  color: white;
}

.chat-input {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-textbox {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.chat-textbox:focus {
  outline: none;
  border-color: #667eea;
}

.chat-response {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.detailed-analysis {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.health-score {
  text-align: center;
  margin-bottom: 24px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.score-circle.excellent {
  background: #51cf66;
}

.score-circle.good {
  background: #ffd43b;
  color: #333;
}

.score-circle.needs-improvement {
  background: #ff6b6b;
}

.category-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 600;
}

.budget-breakdown {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.quick-wins ul {
  list-style: none;
  padding: 0;
}

.quick-wins li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.quick-wins li:before {
  content: "✅ ";
  margin-right: 8px;
}
</style>
