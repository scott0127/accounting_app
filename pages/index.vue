<template>
  <div class="p-4">    <!-- 導覽列登入/登出按鈕 -->
    <div class="flex items-center justify-between px-4 h-14">
        <h1 class="text-lg font-bold">簡單記帳</h1>
      </div>
    <div class="flex justify-end mb-4">
      <template v-if="user">
        <div class="flex items-center bg-white rounded-full shadow-md px-3 py-1.5 border border-gray-100 transition-all hover:shadow-lg">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
              {{ user.email?.charAt(0).toUpperCase() }}
            </div>
            <span class="text-xs text-gray-600 mr-2 hidden sm:inline-block">{{ user.email }}</span>
          </div>
          <button 
            class="px-3 py-1 rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white text-xs font-medium shadow hover:shadow-md transition transform hover:-translate-y-0.5" 
            @click="handleLogout">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              登出
            </span>
          </button>
        </div>
      </template>
      <template v-else>
        <button 
          class="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center" 
          @click="router.push('/auth')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0z" clip-rule="evenodd" />
          </svg>
          登入
        </button>
      </template>
    </div>
    
    <!-- 未登入狀態 -->
    <template v-if="!user">
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">歡迎使用簡單記帳</h2>
        <p class="text-gray-600 mb-8">請登入以管理您的財務、追蹤收支和獲取財務洞察</p>
        <button 
          class="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition transform hover:-translate-y-1" 
          @click="router.push('/auth')">
          註冊或登入帳號
        </button>
        <div class="mt-8 p-4 bg-blue-50 rounded-lg max-w-md">
          <h3 class="text-lg font-semibold mb-2">應用功能</h3>
          <ul class="text-left space-y-2">
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>追蹤日常收入與支出</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>設定預算並監控消費習慣</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>取得個人財務健康分析</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>雲端資料同步，隨時隨地可存取</span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- 已登入狀態 -->
    <template v-if="user">
      <!-- 財務健康指標 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold mb-1">本月財務健康度</h2>
            <div :class="financialHealthClass" class="inline-block px-3 py-1 rounded-full text-sm font-medium">
              {{ financialHealthStatus }}
            </div>
            <p class="text-sm text-gray-500 mt-2">{{ financialAdvice }}</p>
          </div>
          <div class="text-3xl">{{ financialHealthEmoji }}</div>
        </div>
      </div>
      
      <!-- 月份選擇器 -->
      <div class="flex items-center justify-between mb-6">
        <button class="p-2" @click="previousMonth">
          <span class="text-xl">←</span>
        </button>
        <div class="flex items-center">
          <h2 class="text-lg font-semibold">{{ currentMonthDisplay }}</h2>
          <button 
            class="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            @click="goToCurrentMonth">
            今天
          </button>
        </div>
        <button class="p-2" @click="nextMonth">
          <span class="text-xl">→</span>
        </button>
      </div>

      <!-- 四個卡片的網格布局 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- 支出分析 -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold">支出分析</h3>
            <button 
              @click="showDetailedExpenseChart = true" 
              class="text-xs text-blue-500 hover:underline">
              查看詳情
            </button>
          </div>
          <div class="h-48">
            <template v-if="expenseChartData">
              <DoughnutChart
                :data="expenseChartData"
                :options="doughnutOptions"
              />
              <!-- 顯示前三大類別 -->
              <div v-if="topExpenseCategories.length" class="mt-2 text-xs">
                <div v-for="(category, index) in topExpenseCategories" :key="index" 
                  class="flex justify-between items-center">
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full mr-1" 
                        :style="{ backgroundColor: chartColors[index % chartColors.length] }"></div>
                    <span>{{ category.name }}</span>
                  </div>
                  <span>{{ formatAmount(category.amount) }}</span>
                </div>
              </div>
            </template>
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              無支出資料
            </div>
          </div>
          <p class="text-center mt-2 text-sm font-medium text-red-500">
            {{ formatAmount(monthlyStats.totalExpense) }}
          </p>
        </div>

        <!-- 收入分析 -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold">收入分析</h3>
            <button 
              @click="showDetailedIncomeChart = true" 
              class="text-xs text-blue-500 hover:underline">
              查看詳情
            </button>
          </div>
          <div class="h-48">
            <template v-if="incomeChartData">
              <DoughnutChart
                :data="incomeChartData"
                :options="doughnutOptions"
              />
              <!-- 顯示前三大類別 -->
              <div v-if="topIncomeCategories.length" class="mt-2 text-xs">
                <div v-for="(category, index) in topIncomeCategories" :key="index" 
                  class="flex justify-between items-center">
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full mr-1" 
                        :style="{ backgroundColor: incomeChartColors[index % incomeChartColors.length] }"></div>
                    <span>{{ category.name }}</span>
                  </div>
                  <span>{{ formatAmount(category.amount) }}</span>
                </div>
              </div>
            </template>
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              無收入資料
            </div>
          </div>
          <p class="text-center mt-2 text-sm font-medium text-green-500">
            {{ formatAmount(monthlyStats.totalIncome) }}
          </p>
        </div>

        <!-- 當月盈虧 -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="text-base font-semibold mb-2">當月盈虧</h3>
          <div class="flex flex-col items-center justify-center h-48">
            <p class="text-2xl font-bold" :class="balanceColor">
              {{ monthlyStats.balance >= 0 ? '+' : '' }}{{ formatAmount(monthlyStats.balance) }}
            </p>
            <p class="text-sm text-gray-500 mt-2">
              {{ monthlyStats.balance >= 0 ? '本月有結餘' : '本月超支' }}
            </p>
          </div>
        </div>

        <!-- 剩餘預算 -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="text-base font-semibold mb-3">剩餘預算</h3>
          <div class="flex flex-col items-center h-auto relative pb-4">
            <!-- 綜合預算顯示 -->
            <div class="relative w-40 h-40 flex items-center justify-center mb-2">
              <!-- 百分比環形進度 -->
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(229, 231, 235, 0.5)"
                  stroke-width="8"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  :stroke="budgetCircleColor"
                  stroke-width="8"
                  stroke-linecap="round"
                  fill="none"
                  :stroke-dasharray="getBudgetCircleValue()"
                  class="budget-circle-animation"
                />
              </svg>
              
              <!-- 玻璃容器 -->
              <div class="container-shape relative z-10">
                <div class="container-inner">
                  <!-- 刻度線 -->
                  <div class="measurement-lines">
                    <template v-for="i in 5" :key="i">
                      <div class="measurement-line" :style="{ opacity: (i/5) }">
                        <span class="measurement-text">{{ (100 - i * 20) }}%</span>
                      </div>
                    </template>
                  </div>

                  <!-- 水滴效果 -->
                  <div class="droplet" style="left: 30%; top: 20%"></div>
                  <div class="droplet" style="left: 50%; top: 15%; animation-delay: 0.5s"></div>
                  <div class="droplet" style="left: 70%; top: 25%; animation-delay: 1s"></div>

                  <!-- 水體效果 -->
                  <div class="water-body"
                    :style="{ 
                      height: getBudgetPercentageHeight(),
                      transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }">
                    <div class="wave wave-back"></div>
                    <div class="wave wave-front"></div>
                  </div>
                  
                  <!-- 懸浮金額顯示 -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div class="budget-display p-2 rounded-lg backdrop-blur">
                      <span class="text-md font-bold" :class="budgetTextColor">
                        {{ formatAmount(remainingBudget) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 預算狀態與設定 -->
            <div class="mt-2 text-center w-full z-20 relative">
              <div class="p-2 rounded-lg mb-2" :class="budgetStatusBackground">
                <p class="text-xs font-medium" :class="budgetTextColor">
                  {{ getBudgetStatus() }}
                </p>
              </div>
              
              <button 
                @click="showBudgetModal = true"
                class="w-full px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                設定預算
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近交易記錄 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold">最近記錄</h3>
          <button 
            class="text-xs text-blue-500 hover:underline"
            @click="showAllTransactions = !showAllTransactions">
            {{ showAllTransactions ? '收起' : '展開' }}
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="transaction in displayTransactions"
            :key="transaction.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center">
              <span class="text-xl mr-3">{{ getCategoryIcon(transaction.category) }}</span>
              <div>
                <p class="font-medium">{{ getCategoryName(transaction.category) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</p>
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
                <button @click="editTransaction(transaction)" 
                  class="text-gray-400 hover:text-gray-600 p-1">
                  ✎
                </button>
                <button @click="duplicateTransaction(transaction)"
                  class="text-gray-400 hover:text-gray-600 p-1">
                  ⧉
                </button>
                <button @click="handleTransactionDelete(transaction.id)" 
                  class="text-gray-400 hover:text-gray-600 p-1">
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 浮動按鈕 -->
      <button 
        @click="router.push('/transactions/add')"
        class="fixed right-6 bottom-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      >
        +
      </button>

      <!-- 異常支出提醒 -->
      <div 
        v-if="unusualExpenses.length > 0"
        class="fixed left-6 bottom-6 p-3 bg-yellow-100 border border-yellow-200 rounded-lg shadow-md max-w-xs"
      >
        <div class="flex items-center">
          <div class="mr-2 text-yellow-500 text-lg">⚠️</div>
          <div>
            <p class="font-medium text-sm text-yellow-800">本月異常支出</p>
            <p class="text-xs text-yellow-700">
              {{ unusualExpenses[0].name }} 支出比平常高出 {{ unusualExpenses[0].percentage.toFixed(0) }}%
            </p>
          </div>
          <button @click="unusualExpenses = []" class="ml-2 text-gray-500">✕</button>
        </div>
      </div>
      
      <!-- 新手引導教學 -->
      <div v-if="showTutorial" class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl max-w-sm w-full p-6 relative">
          <button 
            @click="showTutorial = false"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">{{ tutorialSteps[tutorialStep].title }}</h3>
            <p class="text-gray-600">{{ tutorialSteps[tutorialStep].description }}</p>
          </div>
          
          <div class="flex justify-between">
            <button
              v-if="tutorialStep > 0"
              @click="tutorialStep--"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              上一步
            </button>
            <div v-else class="w-16"></div>
            
            <div class="flex space-x-1">
              <template v-for="(_, index) in tutorialSteps" :key="index">
                <div
                  class="w-2 h-2 rounded-full" 
                  :class="index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'"
                ></div>
              </template>
            </div>
            
            <button
              @click="nextTutorialStep"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {{ tutorialStep === tutorialSteps.length - 1 ? '完成' : '下一步' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 財務目標設定對話框 -->
      <div
        v-if="showFinancialGoalModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showFinancialGoalModal = false"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h3 class="text-lg font-semibold mb-4">設定財務目標</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">目標類型</label>
            <select 
              v-model="goalType" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="savings">每月儲蓄</option>
              <option value="expense">消費限制</option>
              <option value="income">收入目標</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">目標金額</label>
            <input
              v-model="goalAmount"
              type="number"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg"
              placeholder="請輸入金額"
              min="0"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1">目標期限</label>
            <select 
              v-model="goalDeadline" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="1">1個月</option>
              <option value="3">3個月</option>
              <option value="6">6個月</option>
              <option value="12">12個月</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="showFinancialGoalModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              @click="saveFinancialGoal"
            >
              設定目標
            </button>
          </div>
        </div>
      </div>
      
      <!-- 編輯交易對話框 -->
      <TransactionModal
        v-if="showEditTransactionModal"
        :show="showEditTransactionModal"
        :categories="store.categories"
        :transaction="editingTransaction"
        :is-editing="true"
        @close="showEditTransactionModal = false"
        @save="handleTransactionEdit"
      />
      
      <!-- 添加交易對話框 -->
      <TransactionModal
        v-if="showAddTransactionModal"
        :show="showAddTransactionModal"
        :categories="store.categories"
        @close="showAddTransactionModal = false"
        @save="handleTransactionSave"
      />

      <!-- 預算設定對話框 -->
      <div
        v-if="showBudgetModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showBudgetModal = false"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h3 class="text-lg font-semibold mb-4">設定每月預算</h3>
          <input
            v-model="budgetInput"
            type="number"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
            placeholder="請輸入預算金額"
            min="0"
          />
          
          <!-- 智能預算建議 -->
          <div v-if="smartBudgetRecommendation" class="mb-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">
              <span class="font-medium">智能建議：</span> 
              根據您過去3個月的支出，建議本月預算為 {{ formatAmount(smartBudgetRecommendation) }}
            </p>
            <button 
              @click="useSuggestedBudget"
              class="mt-2 text-xs text-blue-600 hover:underline"
            >
              使用此建議
            </button>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="showBudgetModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              @click="saveBudget"
            >
              確定
            </button>
          </div>
        </div>
      </div>

      <!-- 詳細支出圖表彈窗 -->
      <div
        v-if="showDetailedExpenseChart"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDetailedExpenseChart = false"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">詳細支出分析</h3>
            <button 
              @click="showDetailedExpenseChart = false"
              class="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              ✕
            </button>
          </div>
          <div class="h-64">
            <DoughnutChart
              :data="expenseChartData"
              :options="detailedChartOptions"
            />
          </div>
          <div class="mt-4">
            <div v-for="(category, index) in expenseCategories" :key="index"
                class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" 
                    :style="{ backgroundColor: chartColors[index % chartColors.length] }"></div>
                <span>{{ category.name }}</span>
              </div>
              <div>
                <span class="mr-2">{{ formatAmount(category.amount) }}</span>
                <span class="text-xs text-gray-500">{{ calculatePercentage(category.amount, monthlyStats.totalExpense) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 詳細收入圖表彈窗 -->
      <div
        v-if="showDetailedIncomeChart"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDetailedIncomeChart = false"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">詳細收入分析</h3>
            <button 
              @click="showDetailedIncomeChart = false"
              class="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              ✕
            </button>
          </div>
          <div class="h-64">
            <DoughnutChart
              :data="incomeChartData"
              :options="detailedChartOptions"
            />
          </div>
          <div class="mt-4">
            <div v-for="(category, index) in incomeCategories" :key="index"
                class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" 
                    :style="{ backgroundColor: incomeChartColors[index % incomeChartColors.length] }"></div>
                <span>{{ category.name }}</span>
              </div>
              <div>
                <span class="mr-2">{{ formatAmount(category.amount) }}</span>
                <span class="text-xs text-gray-500">{{ calculatePercentage(category.amount, monthlyStats.totalIncome) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import dayjs from 'dayjs'
import { Preferences } from '@capacitor/preferences'
import TransactionModal from '~/components/dashboard/TransactionModal.vue'
import { useRouter } from 'vue-router'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { useSupabaseTransactions } from '~/composables/useSupabaseTransactions'

const router = useRouter()
const { user, signOut } = useSupabaseAuth()

// 註冊 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend)

const store = useTransactionStore()
const { 
  transactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  initialize: initializeSupabase,
  loading: transactionsLoading,
  getMonthlyStats
} = useSupabaseTransactions()
const showBudgetModal = ref(false)
const budgetInput = ref('')
const monthlyBudget = ref(0)
const showFinancialGoalModal = ref(false)

// 登出處理函數
const handleLogout = async () => {
  try {
    await signOut()
    // 轉到登入頁面
    router.push('/auth')
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// 確保檢測設備方向變化
const isLandscape = ref(false)
const showSmallScreenTooltips = ref(false)

// 增強的 onMounted
onMounted(() => {
  // 只有在用戶已登入時才初始化預算和財務目標
  if (user.value) {
    initBudget()
    initFinancialGoals()
    calculateSmartBudgetRecommendation()
  }
  
  // 添加方向變化偵聽器
  window.addEventListener('resize', checkOrientation)
  checkOrientation()

  // 添加滑動手勢監聽
  setupSwipeListeners()
  
  // 如果是新用戶，顯示引導提示
  if (user.value) {
    checkIfNewUser()
  }
})

// 檢查用戶是否為新用戶
const checkIfNewUser = async () => {
  const { value } = await Preferences.get({ key: 'hasSeenTutorial' })
  if (!value) {
    showTutorial.value = true
    await Preferences.set({ key: 'hasSeenTutorial', value: 'true' })
  }
}

// 設置滑動監聽
const setupSwipeListeners = () => {
  let touchStartX = 0
  let touchEndX = 0
  
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
  }
  
  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].clientX
    handleSwipe()
  }
  
  const handleSwipe = () => {
    if (touchStartX - touchEndX > 50) {
      // 向左滑動
      nextMonth()
    }
    
    if (touchEndX - touchStartX > 50) {
      // 向右滑動
      previousMonth()
    }
  }
  
  document.addEventListener('touchstart', handleTouchStart, false)
  document.addEventListener('touchend', handleTouchEnd, false)
}

// 檢查屏幕方向
const checkOrientation = () => {
  isLandscape.value = window.innerWidth > window.innerHeight
}

// 當前月份
const currentMonth = ref(dayjs().format('YYYY-MM'))

// 月份顯示
const currentMonthDisplay = computed(() => {
  return dayjs(currentMonth.value).format('YYYY年M月')
})

// 月度統計
const monthlyStats = computed(() => {
  // 使用 useSupabaseTransactions 提供的方法獲取月度統計
  return getMonthlyStats(currentMonth.value)
})

// 餘額顏色
const balanceColor = computed(() => {
  return monthlyStats.value.balance >= 0 ? 'text-green-500' : 'text-red-500'
})

// 剩餘預算顏色
const remainingBudgetColor = computed(() => {
  return remainingBudget.value >= 0 ? 'text-blue-500' : 'text-red-500'
})

// 剩餘預算
const remainingBudget = computed(() => {
  return monthlyBudget.value - monthlyStats.value.totalExpense
})

// 儲蓄率
const savingsRate = computed(() => {
  if (monthlyStats.value.totalIncome === 0) return 0
  return (monthlyStats.value.balance / monthlyStats.value.totalIncome) * 100
})

// 異常支出檢測
const unusualExpenses = computed(() => {
  // 從本月支出中找出異常高於歷史平均的支出
  const categories = store.categories.filter(c => c.type === 'expense')
  const result = []
  
  categories.forEach(category => {
    const currentAmount = monthlyStats.value.categories[category.id] || 0
    if (currentAmount > 0) {
      const averageAmount = calculateCategoryAverage(category.id)
      if (currentAmount > averageAmount * 1.5 && averageAmount > 0) {
        result.push({
          id: category.id,
          name: category.name,
          current: currentAmount,
          average: averageAmount,
          percentage: ((currentAmount - averageAmount) / averageAmount) * 100
        })
      }
    }
  })
  
  return result.sort((a, b) => b.percentage - a.percentage)
})

// 計算類別歷史平均
const calculateCategoryAverage = (categoryId) => {
  // 獲取過去3個月的數據
  const today = dayjs()
  let sum = 0
  let count = 0
  
  for (let i = 1; i <= 3; i++) {
    const monthDate = today.subtract(i, 'month').format('YYYY-MM')
    const stats = store.getMonthlyStats(monthDate)
    const amount = stats.categories[categoryId] || 0
    
    if (amount > 0) {
      sum += amount
      count++
    }
  }
  
  return count > 0 ? sum / count : 0
}

// 財務目標
const financialGoals = ref([])

// 初始化財務目標
const initFinancialGoals = async () => {
  const { value } = await Preferences.get({ key: 'financialGoals' })
  if (value) {
    financialGoals.value = JSON.parse(value)
  }
}

// 保存財務目標
const saveFinancialGoal = async () => {
  const goal = {
    id: Date.now().toString(),
    type: goalType.value,
    amount: Number(goalAmount.value),
    deadline: Number(goalDeadline.value),
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(Number(goalDeadline.value), 'month').format('YYYY-MM-DD'),
    progress: 0
  }
  
  financialGoals.value.push(goal)
  await Preferences.set({ key: 'financialGoals', value: JSON.stringify(financialGoals.value) })
  showFinancialGoalModal.value = false
  goalType.value = 'savings'
  goalAmount.value = 0
  goalDeadline.value = '1'
}

// 計算智能預算建議
const calculateSmartBudgetRecommendation = () => {
  // 獲取過去3個月的支出平均值
  const today = dayjs()
  let sum = 0
  let count = 0
  
  for (let i = 1; i <= 3; i++) {
    const monthDate = today.subtract(i, 'month').format('YYYY-MM')
    const stats = store.getMonthlyStats(monthDate)
    
    sum += stats.totalExpense
    count++
  }
  
  if (count > 0) {
    const average = sum / count
    smartBudgetRecommendation.value = Math.round(average)
  }
}

// 智能預算建議
const smartBudgetRecommendation = ref(0)

// 使用建議的預算
const useSuggestedBudget = () => {
  budgetInput.value = String(smartBudgetRecommendation.value)
  saveBudget()
}

// 支出圖表數據
const expenseChartData = computed(() => {
  const categories = store.categories
    .filter(c => c.type === 'expense')
    .map(category => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  if (categories.length === 0) {
    return {
      labels: ['無支出'],
      datasets: [{
        data: [100],
        backgroundColor: ['#E5E7EB']
      }]
    }
  }

  return {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.amount),
      backgroundColor: chartColors
    }]
  }
})

// 收入圖表數據
const incomeChartData = computed(() => {
  const categories = store.categories
    .filter(c => c.type === 'income')
    .map(category => ({
      id: category.id,
      name: category.name,
      amount: monthlyStats.value.categories[category.id] || 0
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  if (categories.length === 0) {
    return {
      labels: ['無收入'],
      datasets: [{
        data: [100],
        backgroundColor: ['#E5E7EB']
      }]
    }
  }

  return {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.amount),
      backgroundColor: incomeChartColors
    }]
  }
})

// 圖表顏色
const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
const incomeChartColors = ['#10B981', '#3B82F6', '#8B5CF6']

// 幫助提示功能
const tooltips = {
  financialHealth: '根據您的預算使用情況和儲蓄率計算的總體財務健康度',
  expenseChart: '您的各項支出佔比分析',
  incomeChart: '您的各項收入來源佔比',
  balance: '當月收入減去支出的餘額',
  budget: '您設定的當月預算限制',
  transactions: '最近記錄的交易'
}

// 顯示提示
const showTooltip = ref('')
const showTooltipInfo = (key) => {
  showTooltip.value = key
  setTimeout(() => {
    showTooltip.value = ''
  }, 3000)
}

// 圖表選項
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const value = context.raw
          return `${context.label}: ${formatAmount(value)}`
        }
      }
    }
  }
}

// 詳細圖表選項
const detailedChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        boxWidth: 12,
        font: {
          size: 10
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const value = context.raw
          return `${context.label}: ${formatAmount(value)}`
        }
      }
    }
  }
}

// 最近交易
const recentTransactions = computed(() => {
  return transactions
    .filter(t => t.date.startsWith(currentMonth.value))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

// 按類型過濾類別
const categoriesByType = (type) => {
  return store.categories.filter(c => c.type === type)
}

// 教學導覽
const showTutorial = ref(false)
const tutorialStep = ref(0)
const tutorialSteps = [
  { title: '歡迎使用財務管理應用', description: '這個應用將幫助您追蹤和管理個人財務。' },
  { title: '財務健康度', description: '這裡顯示您本月的財務狀況概覽。' },
  { title: '收支分析', description: '圖表顯示您的收入和支出分類。' },
  { title: '預算設置', description: '設定每月預算來管理您的支出。' },
  { title: '交易記錄', description: '查看和管理您的所有交易記錄。' },
  { title: '財務目標', description: '設定儲蓄目標來實現您的財務計劃。' }
]

// 下一個教學步驟
const nextTutorialStep = () => {
  if (tutorialStep.value < tutorialSteps.length - 1) {
    tutorialStep.value++
  } else {
    showTutorial.value = false
  }
}

// 工具函數
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

const formatDate = (date: string) => {
  return dayjs(date).format('M/D')
}

const getCategoryIcon = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.icon || '📝'
}

const getCategoryName = (categoryId: string) => {
  return store.categories.find(c => c.id === categoryId)?.name || categoryId
}

// 計算百分比
const calculatePercentage = (amount: number, total: number) => {
  if (total === 0) return 0
  return ((amount / total) * 100).toFixed(1)
}

// 月份切換
const previousMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).subtract(1, 'month').format('YYYY-MM')
}

const nextMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).add(1, 'month').format('YYYY-MM')
}

// 返回當月
const goToCurrentMonth = () => {
  currentMonth.value = dayjs().format('YYYY-MM')
}

// 小豬狀態
const isWiggling = ref(false)

// 小豬顏色
const pigColor = computed(() => {
  if (monthlyBudget.value === 0) return '#F9A8D4' // 淺粉色
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return '#FCA5A5' // 紅色
  if (percentage >= 0.8) return '#FCD34D' // 黃色
  return '#F9A8D4' // 粉色
})

// 眼睛樣式
const eyeStyle = computed(() => {
  if (monthlyBudget.value === 0) return 'w-2 h-2 rounded-full bg-gray-800' // 普通眼睛
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return 'w-2 h-2 rounded-full bg-gray-800 before:content-["×"]' // 難過的眼睛
  if (percentage >= 0.8) return 'w-2 h-2 rounded-full bg-gray-800 animate-pulse' // 擔心的眼睛
  return 'w-2 h-2 rounded-full bg-gray-800' // 開心的眼睛
})

// 預算進度條顏色
const budgetProgressColor = computed(() => {
  if (monthlyBudget.value === 0) return '#E5E7EB'
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return '#EF4444' // 紅色
  if (percentage >= 0.8) return '#F59E0B' // 黃色
  return '#10B981' // 綠色
})

// 獲取預算使用寬度
const getBudgetPercentageWidth = () => {
  if (monthlyBudget.value === 0) return '0%'
  const percentage = (monthlyStats.value.totalExpense / monthlyBudget.value) * 100
  return `${Math.min(percentage, 100)}%`
}

// 預算液體顏色
const budgetLiquidColor = computed(() => {
  if (monthlyBudget.value === 0) return 'rgba(0, 153, 255, 0.5)'
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return 'rgba(255, 99, 71, 0.5)' // 紅色
  if (percentage >= 0.8) return 'rgba(255, 165, 0, 0.5)' // 橙色
  return 'rgba(0, 153, 255, 0.5)' // 藍色
})

// 預算文字顏色
const budgetTextColor = computed(() => {
  if (monthlyBudget.value === 0) return 'text-gray-500'
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return 'text-red-600'
  if (percentage >= 0.8) return 'text-yellow-600'
  return 'text-green-600'
})

// 獲取預算高度百分比
const getBudgetPercentageHeight = () => {
  if (monthlyBudget.value === 0) return '0%'
  const percentage = (remainingBudget.value / monthlyBudget.value) * 100
  return `${Math.max(Math.min(percentage, 100), 0)}%`
}

// 更新預算狀態文字
const getBudgetStatus = () => {
  if (monthlyBudget.value === 0) return '點擊下方按鈕設定預算'
  const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
  if (percentage >= 1) return '預算已用完'
  if (percentage >= 0.8) return '預算即將用完'
  return '預算充足'
}

// 保存預算時觸發動畫
const saveBudget = async () => {
  const budget = Number(budgetInput.value)
  if (budget >= 0) {
    monthlyBudget.value = budget
    await Preferences.set({ key: 'monthlyBudget', value: String(budget) })
    showBudgetModal.value = false
    budgetInput.value = ''
    // 觸發小豬搖動動畫
    isWiggling.value = true
    setTimeout(() => {
      isWiggling.value = false
    }, 500)
  }
}

// 初始化預算
const initBudget = async () => {
  const { value } = await Preferences.get({ key: 'monthlyBudget' })
  if (value) {
    monthlyBudget.value = Number(value)
  }
}

// 獲取預算百分比
const getBudgetPercentage = () => {
  if (monthlyBudget.value === 0) return '尚未設定'
  const percentage = (remainingBudget.value / monthlyBudget.value * 100)
  return `剩餘 ${percentage.toFixed(1)}%`
}

// 統一顏色系統輔助函數
const getStatusColorClass = (type, value) => {
  switch (type) {
    case 'expense':
      return 'text-red-600'
    case 'income':
      return 'text-green-600'
    case 'balance':
      return value >= 0 ? 'text-green-600' : 'text-red-600'
    case 'budget':
      return value >= 80 ? 'text-red-600' : value >= 50 ? 'text-yellow-600' : 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

// 新增的計算屬性和方法
const financialHealthClass = computed(() => {
  const savingRate = savingsRate.value
  if (savingRate <= 0) return 'bg-red-100 text-red-700'
  if (savingRate < 10) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
})

const financialHealthStatus = computed(() => {
  const savingRate = savingsRate.value
  if (savingRate <= 0) return '超支'
  if (savingRate < 10) return '警戒'
  return '穩健'
})

const financialAdvice = computed(() => {
  const savingRate = savingsRate.value
  if (savingRate <= 0) return '支出超過收入，建議縮減不必要的開支'
  if (savingRate < 10) return '儲蓄率偏低，可考慮增加收入或減少支出'
  return '您的儲蓄率良好，繼續保持'
})

const financialHealthEmoji = computed(() => {
  const savingRate = savingsRate.value
  if (savingRate <= 0) return '😢'
  if (savingRate < 10) return '😐'
  return '😄'
})

// 獲取環形進度條的值
const getBudgetCircleValue = () => {
  if (monthlyBudget.value === 0) return '0 440'
  
  // 計算百分比
  const percentage = remainingBudget.value / monthlyBudget.value
  const validPercentage = Math.max(0, Math.min(percentage, 1))
  
  // 計算圓周長 (2 * PI * r，r = 70)
  const circumference = 2 * Math.PI * 70
  
  // 計算最終值
  return `${validPercentage * circumference} ${circumference}`
}

// 恢复丢失的变量
const showDetailedExpenseChart = ref(false)
const showDetailedIncomeChart = ref(false)
const showAllTransactions = ref(false)
const displayTransactions = computed(() => {
    return showAllTransactions.value ? 
        transactions.filter(t => t.date.startsWith(currentMonth.value)) : 
        recentTransactions.value
})

// 交易相关变量
const showAddTransactionModal = ref(false)
const showEditTransactionModal = ref(false)
const newTransaction = ref({ type: 'expense', category: '', amount: 0, date: dayjs().format('YYYY-MM-DD') })
const editingTransaction = ref({})

// 财务目标相关变量
const goalType = ref('savings')
const goalAmount = ref(0)
const goalDeadline = ref('1')

// 计算属性
const topExpenseCategories = computed(() => {
    const categories = store.categories
        .filter(c => c.type === 'expense')
        .map(category => ({
            id: category.id,
            name: category.name,
            amount: monthlyStats.value.categories[category.id] || 0
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
    
    return categories.length === 0 ? [] : categories.slice(0, 3)
})

const topIncomeCategories = computed(() => {
    const categories = store.categories
        .filter(c => c.type === 'income')
        .map(category => ({
            id: category.id,
            name: category.name,
            amount: monthlyStats.value.categories[category.id] || 0
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
    
    return categories.length === 0 ? [] : categories.slice(0, 3)
})

const expenseCategories = computed(() => {
    return store.categories
        .filter(c => c.type === 'expense')
        .map(category => ({
            id: category.id,
            name: category.name,
            amount: monthlyStats.value.categories[category.id] || 0
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
})

const incomeCategories = computed(() => {
    return store.categories
        .filter(c => c.type === 'income')
        .map(category => ({
            id: category.id,
            name: category.name,
            amount: monthlyStats.value.categories[category.id] || 0
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
})

// 预算相关计算属性
const budgetCircleColor = computed(() => {
    if (monthlyBudget.value === 0) return 'rgba(209, 213, 219, 0.5)'
    const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
    if (percentage >= 1) return 'rgba(239, 68, 68, 0.7)' // 红色
    if (percentage >= 0.8) return 'rgba(245, 158, 11, 0.7)' // 橙色
    return 'rgba(16, 185, 129, 0.7)' // 绿色
})

const budgetStatusBackground = computed(() => {
    if (monthlyBudget.value === 0) return 'bg-gray-100'
    const percentage = monthlyStats.value.totalExpense / monthlyBudget.value
    if (percentage >= 1) return 'bg-red-50'
    if (percentage >= 0.8) return 'bg-yellow-50'
    return 'bg-green-50'
})

// 交易相关方法
const editTransaction = (transaction) => {
    editingTransaction.value = { ...transaction }
    showEditTransactionModal.value = true
}

// 刪除未使用的函數

const duplicateTransaction = async (transaction) => {
    try {
        // 使用從 useAuthenticatedTransactions 引入的 addTransaction
        const { id, ...txWithoutId } = transaction;
        await addTransaction(txWithoutId)
    } catch (error) {
        console.error('複製交易失敗:', error)
        alert('複製交易時發生錯誤，請稍後再試。')
    }
}

// 初始化新的交易資料
const initNewTransaction = () => {
    return {
        type: 'expense',
        category: '',
        amount: 0,
        date: dayjs().format('YYYY-MM-DD') 
    }
}

// 處理新增交易
const handleTransactionSave = async (transaction) => {
  try {
    await addTransaction(transaction)
    showAddTransactionModal.value = false
  } catch (error) {
    console.error('新增交易失敗:', error)
    alert('新增交易時發生錯誤，請稍後再試。')
  }
}

// 處理編輯交易
const handleTransactionEdit = async (transaction) => {
  try {
    // 從編輯對話框取得的完整交易物件，需要更新 ID 對應的交易
    // 使用從 useAuthenticatedTransactions 引入的 updateTransaction
    await updateTransaction(transaction.id, transaction)
    showEditTransactionModal.value = false
  } catch (error) {
    console.error('更新交易失敗:', error)
    alert('更新交易時發生錯誤，請稍後再試。')
  }
}

// 處理刪除交易
const handleTransactionDelete = async (id) => {
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
@keyframes flowIn {
  0% {
    height: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    height: 100px;
    opacity: 0;
  }
}

@keyframes flowOut {
  0% {
    height: 0;
    opacity: 0;
    transform: translateY(-100%);
  }
  50% {
    opacity: 1;
  }
  100% {
    height: 100px;
    opacity: 0;
    transform: translateY(0);
  }
}

.flow-container {
  position: absolute;
  width: 40px;
  overflow: hidden;
  bottom: 0;
  top: -80px;
}

.flow-in {
  right: -45px;
  transform: rotate(-15deg);
}

.flow-out {
  left: -45px;
  transform: rotate(15deg);
}

.water-stream {
  position: absolute;
  width: 100%;
  background: linear-gradient(180deg, transparent, currentColor);
  border-radius: 0 0 20px 20px;
  opacity: 0;
}

.stream-in {
  bottom: 0;
  color: rgba(0, 255, 127, 0.5);
  animation: flowIn 2s ease-in infinite;
}

.stream-out {
  top: 0;
  color: rgba(255, 99, 71, 0.5);
  animation: flowOut 2s ease-out infinite;
}

.container-shape {
  position: relative;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    inset 0 0 15px rgba(255, 255, 255, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.container-inner {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 50%;
}

.measurement-lines {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10px;
  width: 1px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.measurement-line {
  width: 6px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.measurement-text {
  position: absolute;
  left: 15px;
  font-size: 7px;
  color: rgba(255, 255, 255, 0.6);
  transform: translateY(-50%);
}

.water-body {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  transition: all 1s ease;
  border-radius: 0 0 8px 8px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: waterWave 3s infinite linear;
  transform-origin: center bottom;
}

.wave-front {
  background: linear-gradient(180deg, 
    rgba(0, 153, 255, 0.7) 0%,
    rgba(0, 153, 255, 0.3) 100%
  );
}

.wave-back {
  background: linear-gradient(180deg, 
    rgba(0, 153, 255, 0.4) 0%,
    rgba(0, 153, 255, 0.1) 100%
  );
  animation-delay: 0.5s;
}

@keyframes waterWave {
  0% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-30%) translateZ(0) scaleY(0.95);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}

.droplet {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 153, 255, 0.6);
  border-radius: 50%;
  animation: droplet 2s infinite;
}

@keyframes droplet {
  0% {
    transform: translateY(-20px) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(10px) scale(0.5);
    opacity: 0;
  }
}

.budget-display {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(5px);
  padding: 3px 8px;
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.budget-display:hover {
  transform: translateY(-4px);
}

.budget-circle-animation {
  transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.budgetStatusBackground {
  animation: pulse 2s infinite ease-in-out;
}

/* 教學提示動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-animation {
  animation: fadeIn 0.3s ease-out forwards;
}

/* 交叉裝置樣式 */
@media (max-width: 430px) {
  .container-shape {
    width: 90px;
    height: 90px;
  }
  
  .budget-display {
    padding: 2px 6px;
  }
  
  .budget-display span {
    font-size: 0.875rem;
  }
  
  .measurement-text {
    font-size: 6px;
    left: 12px;
  }
  
  .measurement-line {
    width: 5px;
  }
}

/* 橫屏模式樣式 */
@media (orientation: landscape) {
  .landscape-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .landscape-chart-container {
    height: 180px;
  }
}

/* 提示樣式 */
.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  z-index: 40;
  max-width: 200px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}
</style>