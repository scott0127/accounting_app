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
    <div class="grid grid-cols-4 gap-2 mb-6">
      <button
        @click="mode = 'ai'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'ai'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600',
        ]"
      >
        AI記帳
      </button>
      <button
        @click="mode = 'ai-suggestion'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'ai-suggestion'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600',
        ]"
      >
        AI建議
      </button>
      <button
        @click="mode = 'expense'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'expense'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600',
        ]"
      >
        支出
      </button>
      <button
        @click="mode = 'income'"
        :class="[
          'py-2 rounded-lg font-medium transition-colors text-center text-sm',
          mode === 'income'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600',
        ]"
      >
        收入
      </button>
    </div>

    <!-- AI 記帳模式 -->
    <form
      v-if="mode === 'ai'"
      @submit.prevent="handleSubmitAI"
      class="space-y-6"
    >
      <!-- 智能輸入 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2">
          消費內容
          <span class="text-xs text-gray-400 ml-2">（停止輸入2秒後自動分析，或按Enter鍵立即分析）</span>
        </label>
        <div class="relative">
          <input
            v-model="aiDescription"
            type="text"
            class="w-full text-lg focus:outline-none px-4 py-2 border border-gray-200 rounded-lg"
            placeholder="例如：午餐吃麥當勞100元"
            @input="handleDescriptionInput"
            @keyup.enter="handleManualAnalyze"
            :disabled="isProcessing"
            required
          />
          
          <!-- 手動分析按鈕 -->
          <button
            v-if="aiDescription.trim() && !isProcessing"
            @click="handleManualAnalyze"
            type="button"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            分析
          </button>
          
          <!-- 處理中指示器 -->
          <div
            v-if="isProcessing"
            class="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <div
              class="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"
            ></div>
          </div>
        </div>

        <!-- 即時 AI 分析結果 -->
        <div v-if="intermediateResult || llmResult" class="mt-3">
          <!-- 即時預覽結果 -->
          <div v-if="intermediateResult && isProcessing" class="mb-2 p-2 bg-blue-50 rounded-lg border-l-2 border-blue-300">
            <div class="flex items-center space-x-2 text-sm">
              <span class="text-blue-600">🔍 AI 分析中...</span>
              <div class="flex items-center space-x-1">
                <span v-if="intermediateResult.type" 
                      :class="intermediateResult.type === 'income' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                      class="px-2 py-0.5 rounded text-xs font-medium">
                  {{ intermediateResult.type === "income" ? "收入" : "支出" }}
                </span>
                <span v-if="intermediateResult.categoryId" class="text-gray-600 text-xs">
                  {{ getCategoryName(intermediateResult.categoryId) }}
                </span>
                <span v-if="intermediateResult.confidence" class="text-purple-600 text-xs">
                  {{ intermediateResult.confidence }}%
                </span>
              </div>
            </div>
          </div>

          <!-- 最終分析結果 -->
          <div v-if="llmResult && !isProcessing" class="space-y-2">
            <div class="flex items-center justify-between">
              <!-- 信心度指示器 -->
              <div class="flex items-center space-x-2">
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="
                    llmResult.type === 'income'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  "
                >
                  {{ llmResult.type === "income" ? "收入" : "支出" }}
                </span>
                <span
                  class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                >
                  {{ getCategoryName((llmResult.categoryIds && llmResult.categoryIds[0]) || llmResult.categoryId) }}
                </span>
                <span
                  v-if="llmResult.confidence > 0"
                  class="text-xs text-gray-500"
                >
                  ({{ llmResult.confidence }}% 信心度)
                </span>
                <!-- 速度指示器 -->
                <span v-if="llmResult.metadata?.processingTime" 
                      class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  ⚡ {{ llmResult.metadata.processingTime }}ms
                </span>
              </div>

              <!-- 手動選擇開關 -->
              <button
                v-if="!showManualCategorySelector"
                @click="showManualCategorySelector = true"
                type="button"
                class="text-xs text-blue-600 underline hover:text-blue-800 transition-colors"
              >
                手動選擇
              </button>
              <button
                v-else
                @click="showManualCategorySelector = false"
                type="button"
                class="text-xs text-gray-600 underline hover:text-gray-800 transition-colors"
              >
                使用AI建議
              </button>
            </div>

            <p class="text-xs text-gray-500 mt-1">{{ llmResult.explanation }}</p>
            <p v-if="llmResult.errorMessage" class="text-xs text-red-500 mt-1">
              {{ llmResult.errorMessage }}
            </p>
          </div>
        </div>

        <!-- LLM生成的備注 -->
        <div
          v-if="llmResult?.description && !isProcessing"
          class="mt-3 p-2 bg-gray-50 rounded-lg"
        >
          <div class="flex justify-between">
            <p class="text-sm font-medium">智能備註:</p>
            <span
              class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
              >AI生成</span
            >
          </div>
          <p class="text-sm">{{ llmResult.description }}</p>
        </div>
      </div>
      <!-- 手動類別選擇（美化版，component 實作） -->
      <CategorySelector
        v-if="showManualCategorySelector"
        :model-value="aiSelectedCategories"
        :categories="manualCategoryType === 'income' ? incomeCategories : expenseCategories"
        :type="manualCategoryType"
        type-switchable
        multiple
        :max-selection="3"
        @update:modelValue="aiSelectedCategories = $event as string[]"
        @update:type="manualCategoryType = $event"
      />

      <!-- 萃取的金額（可編輯，美化版） -->
      <div v-if="extractedAmount > 0" class="bg-white rounded-xl shadow-sm p-4">
        <label class="block text-sm text-gray-600 mb-2 flex items-center gap-2">
          <svg
            class="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 8v8m-4-4h8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          AI 識別金額
          <span
            class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
            >自動識別</span
          >
        </label>
        <div class="flex items-center gap-2 mt-2">
          <input
            v-model.number="extractedAmount"
            type="number"
            min="1"
            class="text-2xl font-bold w-32 px-3 py-1 border-2 border-green-200 rounded-lg focus:border-green-400 focus:outline-none transition"
            placeholder="金額"
          />
          <span class="text-lg text-gray-500">元</span>
        </div>
        <hr class="my-3 border-gray-200" />
        <p class="text-xs text-gray-500">
          若金額不正確，可直接修改。<span class="text-green-600 font-medium"
            >AI</span
          >
          會自動帶出描述中的金額。
        </p>
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
        {{ isProcessing ? "處理中..." : "儲存" }}
      </button>
    </form>

    <!-- AI 建議模式 -->
    <div v-else-if="mode === 'ai-suggestion'" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h3 class="text-lg font-medium mb-4">財務分析與建議</h3>

        <!-- 日期範圍選擇 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">開始日期</label>
            <input
              v-model="startDate"
              type="date"
              class="w-full p-2 border rounded-lg"
              :max="endDate"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">結束日期</label>
            <input
              v-model="endDate"
              type="date"
              class="w-full p-2 border rounded-lg"
              :min="startDate"
              :max="today"
            />
          </div>
        </div>

        <!-- 問題輸入 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">您想了解什麼？</label>
          <input
            v-model="aiSuggestionQuestion"
            type="text"
            class="w-full p-2 border rounded-lg"
            placeholder="例如：請分析我的消費習慣並提供建議"
          />
        </div>

        <!-- 生成按鈕 -->
        <button
          @click="generateAISuggestion"
          class="w-full bg-blue-500 text-white py-2 rounded-lg font-medium"
          :disabled="isGeneratingSuggestion"
        >
          {{ isGeneratingSuggestion ? "分析中..." : "生成建議" }}
        </button>
      </div>

      <!-- 分析結果 - 即時顯示系統 -->
      <div v-if="smartAnalysisResult" class="space-y-4">
        <!-- 快速摘要 - 有數據就立即顯示 -->
        <div 
          v-if="smartAnalysisResult.quickSummary" 
          class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-4 border-l-4 border-blue-400 
                 transform transition-all duration-500 ease-out animate-slide-in-from-top"
        >
          <div class="flex items-center mb-2">
            <span class="text-2xl mr-2 animate-bounce">💰</span>
            <h4 class="font-medium text-gray-800">財務快報</h4>
            <span 
              v-if="!smartAnalysisResult.spendingStory" 
              class="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse"
            >
              分析中...
            </span>
          </div>
          <p class="text-gray-700 text-lg leading-relaxed">{{ smartAnalysisResult.quickSummary }}</p>
        </div>

        <!-- 消費故事 - 有數據就立即顯示 -->
        <div 
          v-if="smartAnalysisResult.spendingStory" 
          class="bg-white rounded-xl shadow-sm p-4 border border-gray-100
                 transform transition-all duration-700 ease-out animate-slide-in-from-left"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">🛒</span>
            <h4 class="font-medium text-gray-800">你的消費故事</h4>
          </div>
          <p class="text-gray-700 mb-4 leading-relaxed">{{ smartAnalysisResult.spendingStory }}</p>
          
          <!-- 消費亮點回顧 -->
          <div 
            v-if="currentInsights.detailed?.spendingPatterns?.expensiveItems || currentInsights.detailed?.spendingPatterns?.topExpenses" 
            class="mt-4 space-y-3"
          >
            <!-- 最貴商品 -->
            <div 
              v-if="currentInsights.detailed.spendingPatterns.expensiveItems?.mostExpensive" 
              class="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border-l-4 border-amber-400"
            >
              <div class="flex items-center mb-2">
                <span class="text-xl mr-2">💎</span>
                <h5 class="font-medium text-amber-800">最大手筆</h5>
              </div>
              <div class="text-sm">
                <p class="text-amber-700 font-medium">
                  {{ currentInsights.detailed.spendingPatterns.expensiveItems.mostExpensive.item }}
                </p>
                <p class="text-amber-600">
                  金額：{{ currentInsights.detailed.spendingPatterns.expensiveItems.mostExpensive.amount.toLocaleString() }} 元
                </p>
                <p class="text-amber-600 text-xs mt-1">
                  {{ currentInsights.detailed.spendingPatterns.expensiveItems.mostExpensive.reason }}
                </p>
              </div>
            </div>
            
            <!-- 消費亮點 -->
            <div 
              v-if="currentInsights.detailed.spendingPatterns.topExpenses && currentInsights.detailed.spendingPatterns.topExpenses.length > 0" 
              class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
            >
              <div class="flex items-center mb-2">
                <span class="text-xl mr-2">🏆</span>
                <h5 class="font-medium text-blue-800">消費亮點</h5>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="expense in currentInsights.detailed.spendingPatterns.topExpenses!.slice(0, 2)" 
                  :key="expense.description"
                  class="text-sm"
                >
                  <p class="text-blue-700 font-medium">{{ expense.description }}</p>
                  <div class="flex justify-between text-blue-600 text-xs">
                    <span>{{ expense.amount.toLocaleString() }} 元 · {{ expense.category }}</span>
                    <span>{{ expense.date }}</span>
                  </div>
                  <p class="text-blue-600 text-xs mt-1">{{ expense.insight }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 進度指示器 -->
          <div v-if="analysisProgress.isLoading" class="mb-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span class="animate-pulse">{{ analysisProgress.message }}</span>
              <span class="font-mono text-blue-600">{{ analysisProgress.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-2 rounded-full 
                       transition-all duration-1000 ease-out bg-[length:200%_100%] animate-gradient-x"
                :style="{ width: `${analysisProgress.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 個人化小貼士 - 有數據就立即顯示 -->
        <div 
          v-if="smartAnalysisResult.personalizedTips && smartAnalysisResult.personalizedTips.length > 0" 
          class="bg-white rounded-xl shadow-sm p-4 border border-gray-100
                 transform transition-all duration-700 ease-out animate-slide-in-from-right"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">🎯</span>
            <h4 class="font-medium text-gray-800">專屬理財小貼士</h4>
          </div>
          <div class="space-y-3">
            <div
              v-for="(tip, index) in smartAnalysisResult.personalizedTips"
              :key="index"
              class="flex items-start p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400
                     transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-md
                     animate-fade-in"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <span class="text-yellow-600 mr-2 text-lg">{{ tip.split(' ')[0] }}</span>
              <span class="text-gray-700 leading-relaxed">{{ tip.split(' ').slice(1).join(' ') }}</span>
            </div>
          </div>
        </div>

        <!-- 預算建議 - 有數據就立即顯示 -->
        <div 
          v-if="smartAnalysisResult.budgetAdvice && smartAnalysisResult.budgetAdvice.explanation" 
          class="bg-white rounded-xl shadow-sm p-4 border border-gray-100
                 transform transition-all duration-700 ease-out animate-slide-in-from-bottom"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">📊</span>
            <h4 class="font-medium text-gray-800">理想預算分配</h4>
          </div>
          <div class="space-y-4">
            <!-- 生活必需品 -->
            <div class="bg-green-50 p-4 rounded-lg transform transition-all duration-500 hover:scale-[1.01]">
              <div class="flex justify-between items-center mb-2">
                <span class="text-green-700 font-medium flex items-center">
                  <span class="mr-2">🏠</span>生活必需品
                </span>
                <span class="text-green-700 font-bold text-lg">
                  {{ smartAnalysisResult.budgetAdvice.essentials.toLocaleString() }} 元
                </span>
              </div>
              <div class="w-full bg-green-200 rounded-full h-3 mb-2 overflow-hidden">
                <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full 
                           transition-all duration-2000 ease-out animate-width-60"></div>
              </div>
              <p class="text-sm text-green-600">房租、水電、交通等基本開銷</p>
            </div>
            
            <!-- 娛樂享受 -->
            <div class="bg-blue-50 p-4 rounded-lg transform transition-all duration-500 hover:scale-[1.01]">
              <div class="flex justify-between items-center mb-2">
                <span class="text-blue-700 font-medium flex items-center">
                  <span class="mr-2">🎮</span>娛樂享受
                </span>
                <span class="text-blue-700 font-bold text-lg">
                  {{ smartAnalysisResult.budgetAdvice.fun.toLocaleString() }} 元
                </span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-3 mb-2 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full 
                           transition-all duration-2000 ease-out animate-width-25"
                     style="animation-delay: 300ms"></div>
              </div>
              <p class="text-sm text-blue-600">吃喝玩樂、購物、聚餐</p>
            </div>
            
            <!-- 儲蓄投資 -->
            <div class="bg-purple-50 p-4 rounded-lg transform transition-all duration-500 hover:scale-[1.01]">
              <div class="flex justify-between items-center mb-2">
                <span class="text-purple-700 font-medium flex items-center">
                  <span class="mr-2">💎</span>儲蓄投資
                </span>
                <span class="text-purple-700 font-bold text-lg">
                  {{ smartAnalysisResult.budgetAdvice.savings.toLocaleString() }} 元
                </span>
              </div>
              <div class="w-full bg-purple-200 rounded-full h-3 mb-2 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full 
                           transition-all duration-2000 ease-out animate-width-15"
                     style="animation-delay: 600ms"></div>
              </div>
              <p class="text-sm text-purple-600">為未來的自己存錢</p>
            </div>
          </div>
          <div class="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p class="text-sm text-gray-600 leading-relaxed">
              <span class="text-lg mr-1">💡</span>{{ smartAnalysisResult.budgetAdvice.explanation }}
            </p>
          </div>
        </div>

        <!-- AI 貼心話 - 有數據就立即顯示 -->
        <div 
          v-if="smartAnalysisResult.conversationalAdvice" 
          class="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-xl shadow-sm p-4 border-l-4 border-pink-400
                 transform transition-all duration-700 ease-out animate-slide-in-from-top
                 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex items-center mb-2">
            <span class="text-2xl mr-2 animate-pulse">🤖</span>
            <h4 class="font-medium text-pink-800">AI 財務顧問的話</h4>
          </div>
          <p class="text-pink-700 text-lg leading-relaxed">{{ smartAnalysisResult.conversationalAdvice }}</p>
        </div>

        <!-- 主動建議 -->
        <div v-if="proactiveAdvice && proactiveAdvice.length > 0" class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">⚡</span>
            <h4 class="font-medium">即時提醒</h4>
          </div>
          <div class="space-y-3">
            <div
              v-for="advice in proactiveAdvice"
              :key="advice.title"
              class="p-3 rounded-lg border-l-3"
              :class="{
                'bg-red-50 border-red-400': advice.type === 'urgent',
                'bg-yellow-50 border-yellow-400': advice.type === 'warning',
                'bg-blue-50 border-blue-400': advice.type === 'suggestion'
              }"
            >
              <div class="flex items-center justify-between">
                <h5 class="font-medium" :class="{
                  'text-red-700': advice.type === 'urgent',
                  'text-yellow-700': advice.type === 'warning',
                  'text-blue-700': advice.type === 'suggestion'
                }">
                  {{ advice.type === 'urgent' ? '🚨' : advice.type === 'warning' ? '⚠️' : '💡' }}
                  {{ advice.title }}
                </h5>
                <button 
                  @click="handleAdviceAction(advice)"
                  class="text-xs px-2 py-1 rounded-full"
                  :class="{
                    'bg-red-100 text-red-600 hover:bg-red-200': advice.type === 'urgent',
                    'bg-yellow-100 text-yellow-600 hover:bg-yellow-200': advice.type === 'warning',
                    'bg-blue-100 text-blue-600 hover:bg-blue-200': advice.type === 'suggestion'
                  }"
                >
                  {{ advice.action }}
                </button>
              </div>
              <p class="text-sm mt-1" :class="{
                'text-red-600': advice.type === 'urgent',
                'text-yellow-600': advice.type === 'warning',
                'text-blue-600': advice.type === 'suggestion'
              }">{{ advice.message }}</p>
            </div>
          </div>
        </div>

        <!-- 智能問答 -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">💬</span>
            <h4 class="font-medium">問我任何問題</h4>
          </div>
          
          <!-- 建議問題 -->
          <div v-if="suggestedQuestions && suggestedQuestions.length > 0" class="mb-4">
            <p class="text-sm text-gray-600 mb-2">試試這些問題：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="question in suggestedQuestions.slice(0, 3)"
                :key="question"
                @click="askQuickQuestion(question)"
                class="text-xs px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
              >
                {{ question }}
              </button>
            </div>
          </div>
          
          <!-- 自由提問 -->
          <div class="flex gap-2">
            <input
              v-model="customQuestion"
              @keyup.enter="askQuickQuestion(customQuestion)"
              placeholder="例如：我下個月應該怎麼控制支出？"
              class="flex-1 p-2 border rounded-lg text-sm"
            />
            <button
              @click="askQuickQuestion(customQuestion)"
              :disabled="!customQuestion.trim()"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 text-sm"
            >
              問問看
            </button>
          </div>
          
          <!-- 問答結果 -->
          <div v-if="quickAnswerResult" class="mt-3 p-3 bg-blue-50 rounded-lg border-l-3 border-blue-400">
            <p class="text-blue-800">{{ quickAnswerResult }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 支出模式 -->
    <form
      v-else-if="mode === 'expense'"
      @submit.prevent="handleSubmitExpense"
      class="space-y-6"
    >
      <!-- 金額輸入（支出模式） -->
      <BaseInput
        v-if="mode === 'expense'"
        v-model="amount"
        label="金額"
        placeholder="0"
        type="number"
        inputmode="decimal"
        required
        inputClass="w-full text-2xl font-semibold focus:outline-none"
      />

      <!-- 類別選擇（支出模式） -->
      <CategorySelector
        v-if="mode === 'expense'"
        :categories="expenseCategories"
        :model-value="selectedCategories"
        :type="'expense'"
        label="類別"
        multiple
        :max-selection="3"
        @update:modelValue="selectedCategories = $event as string[]"
      />

      <!-- 日期選擇（支出模式） -->
      <BaseDateInput
        v-if="mode === 'expense'"
        v-model="date"
        label="日期"
        :max="today"
        required
      />

      <!-- 備註輸入（支出模式） -->
      <BaseInput
        v-if="mode === 'expense'"
        v-model="note"
        label="備註"
        placeholder="選填"
        inputClass="w-full text-lg focus:outline-none"
      />

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
    <form
      v-else-if="mode === 'income'"
      @submit.prevent="handleSubmitIncome"
      class="space-y-6"
    >
      <!-- 金額輸入（收入模式） -->
      <BaseInput
        v-if="mode === 'income'"
        v-model="amount"
        label="金額"
        placeholder="0"
        type="number"
        inputmode="decimal"
        required
        inputClass="w-full text-2xl font-semibold focus:outline-none"
      />

      <!-- 類別選擇（收入模式） -->
      <CategorySelector
        v-if="mode === 'income'"
        :categories="incomeCategories"
        :model-value="selectedCategories"
        :type="'income'"
        label="類別"
        multiple
        :max-selection="3"
        @update:modelValue="selectedCategories = $event as string[]"
      />

      <!-- 日期選擇（收入模式） -->
      <BaseDateInput
        v-if="mode === 'income'"
        v-model="date"
        label="日期"
        :max="today"
        required
      />

      <!-- 備註輸入（收入模式） -->
      <BaseInput
        v-if="mode === 'income'"
        v-model="note"
        label="備註"
        placeholder="選填"
        inputClass="w-full text-lg focus:outline-none"
      />

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

<style scoped>
/* 移除 number input 的箭頭 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* 自定義日期選擇器樣式 */
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
}

/* 自定義動畫（純 Tailwind 無法實現的） */
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes width-60 {
  from { width: 0%; }
  to { width: 60%; }
}

@keyframes width-25 {
  from { width: 0%; }
  to { width: 25%; }
}

@keyframes width-15 {
  from { width: 0%; }
  to { width: 15%; }
}

.animate-gradient-x {
  animation: gradient-x 2s ease infinite;
}

.animate-width-60 {
  animation: width-60 2s ease-out forwards;
}

.animate-width-25 {
  animation: width-25 2s ease-out forwards;
}

.animate-width-15 {
  animation: width-15 2s ease-out forwards;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTransactionStore } from "~/stores/transaction";
import { useSmartFinancialAssistant } from "~/composables/useSmartFinancialAssistant";
import { useExpenseClassifier } from "~/composables/useExpenseClassifier";
import { useLLMClassifier } from "~/composables/useLLMClassifier";
import { useSupabaseTransactions } from "~/composables/useSupabaseTransactions";
import dayjs from "dayjs";

const {
  addTransaction,
  categories: supabaseCategories,
  loading: transactionLoading,
  initialize,
} = useSupabaseTransactions();

// 使用新的智能財務助理
const {
  currentInsights,
  analysisProgress,
  proactiveAdvice,
  suggestedQuestions,
  startAnalysis,
  quickAsk,
  generateConversationalResponse
} = useSmartFinancialAssistant();

const router = useRouter();
const route = useRoute();
const store = useTransactionStore();
const { classifyExpense, rememberCorrection } = useExpenseClassifier();
const { 
  classifyWithLLM, 
  classifyStreaming, 
  classifyIntelligent 
} = useLLMClassifier();

// 記帳模式（可由 query 預設）
const initialMode = ((): 'ai'|'ai-suggestion'|'expense'|'income' => {
  const m = (route.query.mode as string) || 'ai'
  if (m === 'expense' || m === 'income' || m === 'ai' || m === 'ai-suggestion') return m
  return 'ai'
})()
const mode = ref<"ai" | "ai-suggestion" | "expense" | "income">(initialMode);
const aiDescription = ref("");
const classificationResult = ref<any>(null);
const llmResult = ref<{
  type: "income" | "expense";
  categoryId: string;
  categoryIds?: string[];
  confidences?: number[];
  confidence: number;
  description: string;
  explanation: string;
  errorMessage?: string;
  metadata?: {
    processingTime?: number;
    apiAttempts?: number;
    fallbackUsed?: boolean;
    confidenceFactors?: string[];
  };
} | null>(null);
const isProcessing = ref(false);
const showManualCategorySelector = ref(false);
const aiSelectedCategory = ref("");
const aiSelectedCategories = ref<string[]>([]);
const intermediateResult = ref<Partial<typeof llmResult.value> | null>(null);
let extractedAmount = ref(0);
let debounceTimeout: any = null;
let isAnalyzing = ref(false); // 防止重複分析

// 防抖處理輸入
const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = target.value;
  
  // 如果值沒有變化，不執行任何操作
  if (newValue === aiDescription.value) {
    return;
  }
  
  aiDescription.value = newValue;
  
  // 如果正在分析中，不啟動新的分析
  if (isAnalyzing.value || isProcessing.value) {
    return;
  }
  
  // 清除之前的防抖計時器
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
  
  // 如果輸入為空，清除結果
  if (!newValue.trim()) {
    llmResult.value = null;
    intermediateResult.value = null;
    extractedAmount.value = 0;
    return;
  }
  
  // 設置新的防抖計時器 - 用戶停止輸入2秒後觸發分析
  debounceTimeout = setTimeout(() => {
    if (aiDescription.value.trim() && !isAnalyzing.value && !isProcessing.value) {
      classifyWithLLMApiStreaming();
    }
  }, 2000); // 2秒延遲
};

// 手動觸發分析
const handleManualAnalyze = () => {
  // 清除防抖計時器，立即執行
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
  
  if (aiDescription.value.trim() && !isAnalyzing.value && !isProcessing.value) {
    classifyWithLLMApiStreaming();
  }
};

// AI 分析狀態（移除重複宣告）
// analysisProgress 已在 useSmartFinancialAssistant 中提供

// AI Suggestion state - 使用新的智能分析系統
const startDate = ref(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
const endDate = ref(dayjs().format("YYYY-MM-DD"));
const aiSuggestionQuestion = ref("請分析我的消費習慣並提供建議");
const isGeneratingSuggestion = ref(false);
const manualCategoryType = ref<"income" | "expense">("expense");

// 智能分析結果（口語化）
const smartAnalysisResult = ref<{
  quickSummary: string;
  spendingStory: string;
  personalizedTips: string[];
  budgetAdvice: {
    essentials: number;
    fun: number;
    savings: number;
    explanation: string;
  };
  conversationalAdvice: string;
} | null>(null);

// 智能問答相關
const customQuestion = ref('');
const quickAnswerResult = ref('');

// Generate AI Suggestion - 真正的即時顯示系統
const generateAISuggestion = async () => {
  if (!startDate.value || !endDate.value) {
    alert("請選擇日期範圍");
    return;
  }

  try {
    isGeneratingSuggestion.value = true;
    console.log('開始生成 AI 建議...')
    
    // 初始化空的結果結構，準備逐步填充
    smartAnalysisResult.value = {
      quickSummary: '',
      spendingStory: '',
      personalizedTips: [],
      budgetAdvice: {
        essentials: 0,
        fun: 0,
        savings: 0,
        explanation: ''
      },
      conversationalAdvice: ''
    };

    // 啟動分析，不等待完成
    const analysisPromise = startAnalysis(
      { start: startDate.value, end: endDate.value },
      aiSuggestionQuestion.value
    );

    // 即時監聽並更新 UI（不使用 setTimeout）
    const quickUnwatch = watch(currentInsights, (insights) => {
      if (insights.quick && smartAnalysisResult.value) {
        console.log('🚀 即時顯示快速摘要')
        smartAnalysisResult.value.quickSummary = generateQuickSummary(insights.quick);
      }
    }, { immediate: true });

    const detailedUnwatch = watch(currentInsights, (insights) => {
      if (insights.detailed && smartAnalysisResult.value) {
        console.log('🚀 即時顯示詳細分析')
        
        // 立即更新所有可用數據
        smartAnalysisResult.value.spendingStory = generateSpendingStory(insights.detailed);
        smartAnalysisResult.value.personalizedTips = generatePersonalizedTips(insights.detailed);
        smartAnalysisResult.value.budgetAdvice = {
          essentials: insights.detailed.budgetOptimization.essentials,
          fun: insights.detailed.budgetOptimization.discretionary, // 修復：使用 discretionary 字段
          savings: insights.detailed.budgetOptimization.savings,
          explanation: insights.detailed.budgetOptimization.explanation ?? ''
        };
        smartAnalysisResult.value.conversationalAdvice = generateConversationalAdvice(insights.quick, insights.detailed);
        
        // 清理監聽器
        detailedUnwatch();
      }
    }, { immediate: true });

    // 等待分析完成並清理
    await analysisPromise;
    quickUnwatch();
    
    console.log('✅ 分析完成，最終結果:', smartAnalysisResult.value)

  } catch (error) {
    console.error("生成建議時出錯:", error);
    const errorMessage = error instanceof Error ? error.message : "發生未知錯誤";
    alert(`生成建議時出錯: ${errorMessage}`);
  } finally {
    console.log('🏁 設置 isGeneratingSuggestion 為 false')
    isGeneratingSuggestion.value = false;
  }
};

// 口語化函數
const generateQuickSummary = (quick: any) => {
  const balance = quick.monthlyBalance;
  const category = quick.topSpendingCategory;
  const rate = quick.savingsRate;
  
  // 處理沒有資料的情況
  if (category === '暫無資料' || balance === 0) {
    return '還沒有交易記錄喔！開始記帳來獲得個人化的理財建議吧 📊'
  }
  
  if (balance > 0) {
    return `這個月你還剩 ${balance.toLocaleString()} 元！主要都花在${category}上，儲蓄率有 ${rate.toFixed(1)}%。`
  } else {
    return `這個月超支了 ${Math.abs(balance).toLocaleString()} 元，主要花在${category}上，需要注意一下支出喔！`
  }
};

const generateSpendingStory = (detailed: any) => {
  const categories = detailed.spendingPatterns.categories.slice(0, 3);
  const topExpenses = detailed.spendingPatterns.topExpenses;
  const expensiveItems = detailed.spendingPatterns.expensiveItems;
  
  // 處理沒有資料的情況
  if (!categories || categories.length === 0) {
    return '還沒有消費記錄，開始記帳後我就能告訴你有趣的消費故事囉！記錄每一筆花費，發現自己的消費模式吧 🕵️‍♀️'
  }
  
  let story = "讓我看看你都買了什麼... ";
  
  // 基本分類消費
  categories.forEach((cat: any, index: number) => {
    if (index === 0) {
      story += `最愛花錢在${cat.name}，總共花了 ${cat.amount.toLocaleString()} 元`;
    } else if (index === 1) {
      story += `，其次是${cat.name} ${cat.amount.toLocaleString()} 元`;
    } else {
      story += `，還有${cat.name} ${cat.amount.toLocaleString()} 元`;
    }
  });
  
  // 添加最貴商品信息
  if (expensiveItems?.mostExpensive?.item) {
    story += `。 最大手筆是買了「${expensiveItems.mostExpensive.item}」花了 ${expensiveItems.mostExpensive.amount.toLocaleString()} 元`;
    if (expensiveItems.mostExpensive.reason) {
      story += `，${expensiveItems.mostExpensive.reason}`;
    }
  }
  
  // 添加具體商品回顧
  if (topExpenses && topExpenses.length > 0) {
    const topItem = topExpenses[0];
    story += `。值得注意的是「${topItem.description}」消費了 ${topItem.amount.toLocaleString()} 元`;
    if (topItem.insight) {
      story += `，${topItem.insight}`;
    }
  }
  
  return story + "。看起來你挺會享受生活的嘛！";
};

const generatePersonalizedTips = (detailed: any) => {
  const tips = [];
  
  // 處理沒有資料的情況
  if (!detailed.personalizedAdvice.immediate || detailed.personalizedAdvice.immediate.length === 0) {
    return [
      '📝 開始記錄每一筆消費，不管多小都要記',
      '🎯 設定每月預算目標，讓錢花得更有意義',
      '💡 選個順手的記帳工具，養成每日記帳的好習慣'
    ]
  }
  
  // 基於immediate建議轉換為口語化
  detailed.personalizedAdvice.immediate.forEach((advice: string) => {
    tips.push(`💡 ${advice.replace(/建議/, '').replace(/應該/, '可以')}`);
  });
  
  // 加入一些根據支出模式的具體建議
  const topCategory = detailed.spendingPatterns.categories[0];
  if (topCategory?.name.includes('餐飲') || topCategory?.name.includes('飲食')) {
    tips.push('🍕 外食族！試試一週自己下廚 2-3 次，荷包會感謝你的');
  }
  
  if (topCategory?.name.includes('購物') || topCategory?.name.includes('服飾')) {
    tips.push('🛍️ 購物前先想想：我真的需要嗎？還是只是想要？');
  }
  
  return tips;
};

const generateConversationalAdvice = (quick: any, detailed: any) => {
  const healthScore = detailed.financialHealthScore;
  
  // 處理新手用戶
  if (quick.topSpendingCategory === '暫無資料' || healthScore <= 50) {
    return "歡迎加入理財的行列！雖然現在還沒有記錄，但每個理財高手都是從第一筆記錄開始的。加油，你已經踏出重要的第一步了！ 🌟";
  }
  
  if (healthScore >= 80) {
    return "你的理財功力不錯耶！繼續保持這個節奏，未來的你會很感謝現在的自己。";
  } else if (healthScore >= 60) {
    return "財務狀況還算穩定，不過還有進步空間。調整一下消費習慣，你可以做得更好！";
  } else {
    return "嗯...看起來需要好好整理一下財務了。別擔心，從小改變開始，一步一步來就對了！";
  }
};

// 智能問答函數
const askQuickQuestion = async (question: string) => {
  if (!question.trim()) return;
  
  try {
    quickAnswerResult.value = '思考中...';
    
    const result = await quickAsk(question, {
      start: startDate.value,
      end: endDate.value
    });
    
    quickAnswerResult.value = result.answer;
    
    // 清空問題輸入
    if (question === customQuestion.value) {
      customQuestion.value = '';
    }
  } catch (error) {
    quickAnswerResult.value = '抱歉，目前無法回答這個問題，請稍後再試。';
  }
};

// 處理建議操作
const handleAdviceAction = (advice: any) => {
  // 可以根據不同的建議類型執行不同操作
  console.log('Handling advice:', advice);
  // 例如：跳轉到相關頁面、顯示詳細資訊等
};

// 計算屬性
const today = computed(() => dayjs().format("YYYY-MM-DD"));

const expenseCategories = computed(() => {
  // 優先使用 Supabase 類別，如果有的話
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    return supabaseCategories.value.filter((c) => c.type === "expense");
  }
  // 否則使用 store 的類別作為後備
  return store.categories.filter((c) => c.type === "expense");
});

const incomeCategories = computed(() => {
  // 優先使用 Supabase 類別，如果有的話
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    return supabaseCategories.value.filter((c) => c.type === "income");
  }
  // 否則使用 store 的類別作為後備
  return store.categories.filter((c) => c.type === "income");
});

// 表單數據
const amount = ref("");
const selectedCategory = ref("");
const selectedCategories = ref<string[]>([]);
const date = ref(dayjs().format("YYYY-MM-DD"));
const note = ref("");

// 重置表單
const resetForm = () => {
  amount.value = "";
  selectedCategory.value = "";
  selectedCategories.value = [];
  date.value = dayjs().format("YYYY-MM-DD");
  aiDescription.value = "";
  classificationResult.value = null;
  llmResult.value = null;
  showManualCategorySelector.value = false;
  aiSelectedCategory.value = "";
  aiSelectedCategories.value = [];
  isProcessing.value = false;
  isAnalyzing.value = false;
  intermediateResult.value = null;
  extractedAmount.value = 0;

  // 清除防抖計時器
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
};

//手動切換支出收入分類
watch(
  () => showManualCategorySelector.value,
  (val) => {
    if (val && llmResult.value) {
      manualCategoryType.value = llmResult.value.type;
    }
  }
);

// 監視模式變化，重置表單
watch(mode, (newMode) => {
  if (newMode !== "ai-suggestion") {
    resetForm();
  } else {
    // 初始化AI建議的日期範圍為最近一個月
    startDate.value = dayjs().subtract(1, "month").format("YYYY-MM-DD");
    endDate.value = dayjs().format("YYYY-MM-DD");
  }
});

// 驗證表單
const isExpenseValid = computed(() => {
  return amount.value && (selectedCategories.value.length > 0 || selectedCategory.value) && date.value;
});

const isIncomeValid = computed(() => {
  return amount.value && (selectedCategories.value.length > 0 || selectedCategory.value) && date.value;
});

const isAIValid = computed(() => {
  return (
    aiDescription.value &&
    extractedAmount.value > 0 &&
    date.value &&
    (showManualCategorySelector.value
      ? (aiSelectedCategories.value.length > 0 || !!aiSelectedCategory.value)
      : (!!llmResult.value?.categoryId || (llmResult.value?.categoryIds && llmResult.value.categoryIds.length > 0)))
  );
});

// 從描述中提取金額
const extractAmountFromDescription = (description: string): number => {
  const matches = description.match(/\d+/);
  return matches ? parseInt(matches[0]) : 0;
};

// 手動選擇類別
const selectCategory = (categoryId: string) => {
  aiSelectedCategory.value = categoryId;
};

// 獲取類別名稱
const getCategoryName = (categoryId: string): string => {
  // 優先從 Supabase 類別中查找
  if (supabaseCategories.value && supabaseCategories.value.length > 0) {
    const category = supabaseCategories.value.find((c) => c.id === categoryId);
    if (category) return category.name;
  }

  // 如果在 Supabase 找不到，從 store 中查找
  const storeCategory = store.categories.find((c) => c.id === categoryId);
  return storeCategory ? storeCategory.name : categoryId;
};

// 新的流式 LLM 分類 API
const classifyWithLLMApiStreaming = async () => {
  if (!aiDescription.value || isAnalyzing.value || isProcessing.value) {
    console.log('跳過分析：', { hasDescription: !!aiDescription.value, isAnalyzing: isAnalyzing.value, isProcessing: isProcessing.value });
    return;
  }
  
  // 設置分析狀態，防止重複觸發
  isAnalyzing.value = true;
  isProcessing.value = true;
  
  // 清除之前的結果
  intermediateResult.value = null;
  llmResult.value = null;
  
  console.log('開始 AI 分析:', aiDescription.value);
  
  try {
    // 使用智能分類（自動選擇最佳方法）
    const result = await classifyIntelligent(aiDescription.value, {
      preferSpeed: false, // 優先體驗而非速度
      onProgress: (stage, progress) => {
        // analysisProgress 是只讀的，我們用本地變量
        console.log(`🚀 AI 分類進度: ${stage} (${progress}%)`);
      },
      onIntermediateResult: (partial) => {
        intermediateResult.value = partial;
        console.log('🔍 中間結果:', partial);
      }
    });
    
    llmResult.value = result;
    
    // 設置金額
    const matches = aiDescription.value.match(/\d+/);
    extractedAmount.value = matches ? parseInt(matches[0]) : 0;
    
    // 設置類別（優先使用多類別）
    const predictedIds = (result as any).categoryIds && (result as any).categoryIds.length
      ? (result as any).categoryIds as string[]
      : [result.categoryId];
    if (!showManualCategorySelector.value || aiSelectedCategory.value === "") {
      aiSelectedCategory.value = predictedIds[0];
    }
    if (!showManualCategorySelector.value || aiSelectedCategories.value.length === 0) {
      aiSelectedCategories.value = predictedIds.slice(0, 3);
    }
    
    console.log('AI 分析完成:', result);
    
  } catch (error: unknown) {
    console.error("LLM classification failed:", error);
    
    // 當LLM失敗時使用本地分類器
    classificationResult.value = classifyExpense(aiDescription.value);
    if (classificationResult.value) {
      llmResult.value = {
        type: "expense",
        categoryId: classificationResult.value.categoryId,
        confidence: classificationResult.value.confidence,
        description: aiDescription.value,
        explanation: "(本地分類) " + classificationResult.value.explanation,
        errorMessage: error instanceof Error ? error.message : "分類失敗，請稍後再試",
        metadata: {
          fallbackUsed: true,
          processingTime: 0
        }
      };
      aiSelectedCategory.value = classificationResult.value.categoryId;
    }
  } finally {
    isProcessing.value = false;
    isAnalyzing.value = false;
    intermediateResult.value = null; // 清除中間結果
    console.log('AI 分析結束');
  }
};

// 原版 LLM 分類 API（保留作為備用）
const classifyWithLLMApi = async () => {
  if (!aiDescription.value) return;
  isProcessing.value = true;
  
  try {
    const result = await classifyWithLLM(aiDescription.value);
    llmResult.value = {
      ...result,
      metadata: result.metadata || { processingTime: 0, fallbackUsed: false }
    };
    
    // 設置金額
    const matches = aiDescription.value.match(/\d+/);
    extractedAmount.value = matches ? parseInt(matches[0]) : 0;
    
    // 設置類別（優先使用多類別）
    const predictedIds = (result as any).categoryIds && (result as any).categoryIds.length
      ? (result as any).categoryIds as string[]
      : [result.categoryId];
    if (!showManualCategorySelector.value || aiSelectedCategory.value === "") {
      aiSelectedCategory.value = predictedIds[0];
    }
    if (!showManualCategorySelector.value || aiSelectedCategories.value.length === 0) {
      aiSelectedCategories.value = predictedIds.slice(0, 3);
    }
  } catch (error: unknown) {
    console.error("LLM classification failed:", error);
    // 當LLM失敗時使用本地分類器
    classificationResult.value = classifyExpense(aiDescription.value);
    if (classificationResult.value) {
      llmResult.value = {
        type: "expense",
        categoryId: classificationResult.value.categoryId,
        confidence: classificationResult.value.confidence,
        description: aiDescription.value,
        explanation: "(本地分類) " + classificationResult.value.explanation,
        errorMessage: error instanceof Error ? error.message : "分類失敗，請稍後再試",
        metadata: { fallbackUsed: true, processingTime: 0 }
      };
      aiSelectedCategory.value = classificationResult.value.categoryId;
    }
  } finally {
    isProcessing.value = false;
  }
};

// 處理 AI 記帳提交
const handleSubmitAI = async () => {
  if (!aiDescription.value || !llmResult.value || isProcessing.value) return;
  const finalCategoryIds = showManualCategorySelector.value
    ? (aiSelectedCategories.value.length ? aiSelectedCategories.value : [aiSelectedCategory.value])
    : ((llmResult.value.categoryIds && llmResult.value.categoryIds.length)
        ? llmResult.value.categoryIds.slice(0, 3)
        : [llmResult.value.categoryId]);

  // 取得目前選擇的 category
  const categoryList = [...incomeCategories.value, ...expenseCategories.value];
  const category = categoryList.find((c) => c.id === finalCategoryIds[0]);

  if (!category) {
    alert("找不到對應的分類，請重新選擇");
    return;
  }

  // 確保 type 一致，若不一致以 category.type 為主
  let finalType: "income" | "expense" = llmResult.value.type;
  if (category.type !== llmResult.value.type) {
    finalType = category.type;
  }

  try {
    await addTransaction({
      amount: extractedAmount.value,
      type: finalType,
      category_ids: finalCategoryIds.slice(0, 3),
      date: date.value,
      description: llmResult.value.description || aiDescription.value,
    });
  if (showManualCategorySelector.value && finalCategoryIds[0] !== ((llmResult.value.categoryIds && llmResult.value.categoryIds[0]) || llmResult.value.categoryId)) {
      rememberCorrection(aiDescription.value, finalCategoryIds[0]);
    }
    router.push("/transactions");
  } catch (error: unknown) {
    console.error("Failed to add transaction:", error);
    alert(`新增記錄失敗: ${error instanceof Error ? error.message : "請稍後再試"}`);
  }
};

// 處理支出提交
const handleSubmitExpense = async () => {
  if (!isExpenseValid.value) return;

  try {
    await addTransaction({
      amount: Number(amount.value),
      type: "expense",
  category_ids: (selectedCategories.value.length ? selectedCategories.value.slice(0, 3) : [selectedCategory.value]),
      date: date.value,
      description: note.value || "", // 確保有預設值
    });

    // 成功後導航到交易列表
    router.push("/transactions");
  } catch (error) {
    console.error("Failed to add transaction:", error);
    alert(`新增記錄失敗: ${error instanceof Error ? error.message : "請稍後再試"}`);
  }
};

// 處理收入提交
const handleSubmitIncome = async () => {
  if (!isIncomeValid.value) return;

  try {
    await addTransaction({
      amount: Number(amount.value),
      type: "income",
  category_ids: (selectedCategories.value.length ? selectedCategories.value.slice(0, 3) : [selectedCategory.value]),
      date: date.value,
      description: note.value || "", // 確保有預設值
    });

    // 成功後導航到交易列表
    router.push("/transactions");
  } catch (error) {
    console.error("Failed to add transaction:", error);
    alert(`新增記錄失敗: ${error instanceof Error ? error.message : "請稍後再試"}`);
  }
};

onMounted(async () => {
  try {
    await initialize();

    // 確保類別資料已載入，否則等待 500ms 後重試
    if (!supabaseCategories.value || supabaseCategories.value.length === 0) {
      setTimeout(() => {
        if (!transactionLoading.value) {
          initialize().catch((err) => console.error("重新初始化失敗:", err));
        }
      }, 500);
    }
  } catch (error) {
    console.error("初始化交易服務失敗:", error);
  }
});

// 組件卸載時清理計時器
onBeforeUnmount(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
  
  // 重置分析狀態
  isAnalyzing.value = false;
  isProcessing.value = false;
});
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
  appearance: textfield;
}

/* 自定義日期選擇器樣式 */
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
