<template>
  <div class="min-h-screen p-4 transition-all duration-300" :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold" :class="`text-[${currentTheme.colors.text}]`">設定</h1>
      <p class="text-sm mt-1" :class="`text-[${currentTheme.colors.textLight}]`">自訂您的使用體驗</p>
    </div>

    <!-- 主題設定 -->
    <div class="mb-8 rounded-2xl p-6 relative overflow-hidden" 
         :style="`
           background: ${currentTheme.colors.surface};
           box-shadow: 0 4px 20px -2px ${currentTheme.colors.text}10;
           border: 1px solid ${currentTheme.colors.text}20;
         `">
      <!-- 背景裝飾 -->
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
           :style="`background: radial-gradient(circle, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`">
      </div>

      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="`text-[${currentTheme.colors.primary}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        主題設定
      </h3>

      <div class="grid grid-cols-2 gap-4 relative z-10">
        <button
          v-for="theme in themes"
          :key="theme.id"
          class="group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105"
          :class="theme.id === currentTheme.id ? 'shadow-lg transform scale-105' : ''"
          :style="{
            backgroundColor: theme.colors.surface,
            borderColor: theme.id === currentTheme.id ? theme.colors.primary : 'transparent'
          }"
          @click="setTheme(theme.id)"
        >
          <!-- 主題預覽 -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: theme.colors.primary }"></div>
                <span class="font-medium text-sm" :style="{ color: theme.colors.text }">{{ theme.name }}</span>
              </div>
              <div v-if="theme.id === currentTheme.id" 
                   class="w-5 h-5 rounded-full flex items-center justify-center"
                   :style="{ backgroundColor: theme.colors.primary }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <!-- 顏色展示 -->
            <div class="flex space-x-1.5">
              <div v-for="color in [
                theme.colors.primary,
                theme.colors.secondary,
                theme.colors.accent,
                theme.colors.success,
                theme.colors.error
              ]" 
              :key="color"
              class="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
              :style="{ backgroundColor: color }">
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 類別管理 -->
    <div class="mb-8 rounded-2xl shadow-md p-6 relative overflow-hidden" 
         :class="`bg-[${currentTheme.colors.surface}]`"
         :style="`
           box-shadow: 0 4px 20px -2px ${currentTheme.colors.primary}15;
           border: 1px solid ${currentTheme.colors.text}15;
         `">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="`text-[${currentTheme.colors.primary}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          類別管理
        </h3>
        <button
          class="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
          :style="{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
            color: 'white'
          }"
          @click="showAddCategory = true"
        >
          新增類別
        </button>
      </div>

      <!-- 支出類別 -->
      <div class="mb-6 space-y-4">
        <h4 class="text-sm font-medium" :class="`text-[${currentTheme.colors.textLight}]`">支出類別</h4>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="category in expenseCategories"
            :key="category.id"
            class="flex items-center justify-between p-3 rounded-xl transition-all group relative"
            :style="`
              background: ${currentTheme.colors.background}; 
              border: 1px solid ${currentTheme.colors.text}15;
              box-shadow: ${currentTheme.id.includes('dark') 
                ? `0 2px 8px -2px ${currentTheme.colors.text}20, inset 0 0 0 1px ${currentTheme.colors.surface}`
                : `0 2px 8px -2px ${currentTheme.colors.text}15, inset 0 0 0 1px ${currentTheme.colors.text}10`};
            `"
          >
            <div class="absolute inset-0 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                 :style="`
                   box-shadow: inset 0 0 0 1.5px ${currentTheme.colors.error};
                   background: ${currentTheme.colors.error}${currentTheme.id.includes('dark') ? '10' : '05'};
                 `">
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" 
                   :style="`background: linear-gradient(135deg, ${currentTheme.colors.error}20, ${currentTheme.colors.background})`">
                <span class="text-xl">{{ category.icon }}</span>
              </div>
              <span class="font-medium">{{ category.name }}</span>
            </div>
            <button
              class="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              :class="`hover:bg-[${currentTheme.colors.error}] hover:bg-opacity-10`"
              @click="deleteCategory(category.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="`text-[${currentTheme.colors.error}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 收入類別 -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium" :class="`text-[${currentTheme.colors.textLight}]`">收入類別</h4>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="category in incomeCategories"
            :key="category.id"
            class="flex items-center justify-between p-3 rounded-xl transition-all group relative"
            :style="`
              background: ${currentTheme.colors.background};
              border: 1px solid ${currentTheme.colors.text}15;
              box-shadow: ${currentTheme.id.includes('dark') 
                ? `0 2px 8px -2px ${currentTheme.colors.text}20, inset 0 0 0 1px ${currentTheme.colors.surface}`
                : `0 2px 8px -2px ${currentTheme.colors.text}15, inset 0 0 0 1px ${currentTheme.colors.text}10`};
            `"
          >
            <div class="absolute inset-0 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                 :style="`
                   box-shadow: inset 0 0 0 1.5px ${currentTheme.colors.success};
                   background: ${currentTheme.colors.success}${currentTheme.id.includes('dark') ? '10' : '05'};
                 `">
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" 
                   :style="`background: linear-gradient(135deg, ${currentTheme.colors.success}20, ${currentTheme.colors.background})`">
                <span class="text-xl">{{ category.icon }}</span>
              </div>
              <span class="font-medium">{{ category.name }}</span>
            </div>
            <button
              class="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              :class="`hover:bg-[${currentTheme.colors.success}] hover:bg-opacity-10`"
              @click="deleteCategory(category.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="`text-[${currentTheme.colors.success}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 數據管理 -->
    <div class="mb-8 rounded-2xl shadow-md p-6 relative overflow-hidden" 
         :class="`bg-[${currentTheme.colors.surface}]`"
         :style="`
           box-shadow: 0 4px 20px -2px ${currentTheme.colors.primary}15;
           border: 1px solid ${currentTheme.colors.text}15;
         `">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="`text-[${currentTheme.colors.primary}]`" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        數據管理
      </h3>
      <button
        class="w-full py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden"
        :style="`
          border: 1.5px solid ${currentTheme.colors.error};
          color: ${currentTheme.colors.error};
          background: ${currentTheme.colors.error}05;
        `"
        @click="confirmClearData"
      >
        清除所有數據
      </button>
    </div>

    <!-- 關於部分 -->
    <div class="rounded-2xl shadow-md p-6 relative overflow-hidden" 
         :class="`bg-[${currentTheme.colors.surface}]`"
         :style="`
           box-shadow: 0 4px 20px -2px ${currentTheme.colors.primary}15;
           border: 1px solid ${currentTheme.colors.text}15;
         `">
      <h3 class="text-lg font-bold mb-4">關於</h3>
      <p class="text-sm" :class="`text-[${currentTheme.colors.textLight}]`">版本：1.0.0</p>
    </div>

    <!-- 新增類別對話框 - 美化版本 -->
    <div v-if="showAddCategory"
         class="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
         :style="`background: ${currentTheme.colors.text}40;`"
         @click.self="showAddCategory = false">
      <div class="rounded-2xl p-6 relative overflow-hidden w-full max-w-sm" 
           :style="`
             background: ${currentTheme.colors.surface};
             box-shadow: 0 8px 32px -4px ${currentTheme.colors.text}30;
             border: 1px solid ${currentTheme.colors.text}20;
           `">
        <h3 class="text-lg font-bold mb-4">新增類別</h3>
        <form @submit.prevent="addNewCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" :class="`text-[${currentTheme.colors.textLight}]`">名稱</label>
            <input
              v-model="newCategory.name"
              type="text"
              class="w-full p-2 rounded-lg transition-all"
              :style="`
                background: ${currentTheme.colors.background};
                border: 1.5px solid ${currentTheme.colors.text}20;
                color: ${currentTheme.colors.text};
                &:focus {
                  border-color: ${currentTheme.colors.primary};
                  box-shadow: 0 0 0 2px ${currentTheme.colors.primary}20;
                }
              `"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="`text-[${currentTheme.colors.textLight}]`">圖示</label>
            <input
              v-model="newCategory.icon"
              type="text"
              class="w-full p-2 rounded-lg transition-all"
              :style="`
                background: ${currentTheme.colors.background};
                border: 1.5px solid ${currentTheme.colors.text}20;
                color: ${currentTheme.colors.text};
                &:focus {
                  border-color: ${currentTheme.colors.primary};
                  box-shadow: 0 0 0 2px ${currentTheme.colors.primary}20;
                }
              `"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" :class="`text-[${currentTheme.colors.textLight}]`">類型</label>
            <select
              v-model="newCategory.type"
              class="w-full p-2 rounded-lg transition-all"
              :style="`
                background: ${currentTheme.colors.background};
                border: 1.5px solid ${currentTheme.colors.text}20;
                color: ${currentTheme.colors.text};
                &:focus {
                  border-color: ${currentTheme.colors.primary};
                  box-shadow: 0 0 0 2px ${currentTheme.colors.primary}20;
                }
              `"
              required
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              :class="`bg-[${currentTheme.colors.background}] text-[${currentTheme.colors.text}]`"
              @click="showAddCategory = false"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              :class="`bg-[${currentTheme.colors.primary}] text-white`"
            >
              確定
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { useTheme } from '~/composables/useTheme'
import type { Category } from '~/types'

const store = useTransactionStore()
const { themes, currentTheme, setTheme } = useTheme()

// 類別列表
const expenseCategories = computed(() => {
  return store.categories.filter(c => c.type === 'expense')
})

const incomeCategories = computed(() => {
  return store.categories.filter(c => c.type === 'income')
})

// 新增類別
const showAddCategory = ref(false)
const newCategory = ref({
  name: '',
  icon: '',
  type: 'expense' as const
})

const addNewCategory = () => {
  const category: Category = {
    id: Date.now().toString(),
    name: newCategory.value.name,
    icon: newCategory.value.icon,
    type: newCategory.value.type
  }
  store.categories.push(category)
  showAddCategory.value = false
  newCategory.value = {
    name: '',
    icon: '',
    type: 'expense'
  }
}

// 刪除類別
const deleteCategory = (id: string) => {
  const index = store.categories.findIndex(c => c.id === id)
  if (index > -1) {
    store.categories.splice(index, 1)
  }
}

// 清除數據
const confirmClearData = () => {
  if (window.confirm('確定要清除所有數據嗎？此操作無法復原。')) {
    store.transactions = []
    store.saveTransactions()
  }
}
</script>

<style scoped>
.theme-transition {
  transition: all 0.3s ease;
}

.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.float-icon {
  animation: float 3s ease-in-out infinite;
}

/* 添加邊界過渡效果 */
.border-transition {
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 強化卡片懸浮效果 */
.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.1);
}

/* 添加全局邊界增強 */
.enhance-borders * {
  outline: none !important;
}

/* 針對淺色主題的特殊處理 */
:deep(.light-theme) {
  --border-opacity: 0.15;
  --shadow-opacity: 0.1;
}

/* 針對深色主題的特殊處理 */
:deep(.dark-theme) {
  --border-opacity: 0.2;
  --shadow-opacity: 0.3;
}
</style>