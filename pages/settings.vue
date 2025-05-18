<!-- pages/settings.vue -->
<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-6">設定</h2>

    <!-- 主題設定 -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold">主題設定</h3>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="theme in themes"
          :key="theme.id"
          class="p-4 rounded-xl border-2 transition-all"
          :class="theme.id === currentTheme.id ? 'border-primary shadow-md' : 'border-transparent'"
          :style="{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text
          }"
          @click="setTheme(theme.id)"
        >
          <div class="flex items-center space-x-2 mb-2">
            <div
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: theme.colors.primary }"
            ></div>
            <span class="font-medium" :style="{ color: theme.colors.text }">{{ theme.name }}</span>
          </div>
          <div class="flex space-x-2">
            <div
              v-for="color in [theme.colors.primary, theme.colors.secondary, theme.colors.accent]"
              :key="color"
              class="w-6 h-2 rounded-full"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </button>
      </div>
    </div>

    <!-- 類別管理 -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold">類別管理</h3>
        <button
          class="text-primary"
          @click="showAddCategory = true"
        >
          新增
        </button>
      </div>

      <!-- 支出類別 -->
      <div class="mb-6">
        <h4 class="text-sm text-textLight mb-3">支出類別</h4>
        <div class="space-y-3">
          <div
            v-for="category in expenseCategories"
            :key="category.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <span class="text-xl mr-2">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </div>
            <button
              class="text-error text-sm"
              @click="deleteCategory(category.id)"
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      <!-- 收入類別 -->
      <div>
        <h4 class="text-sm text-textLight mb-3">收入類別</h4>
        <div class="space-y-3">
          <div
            v-for="category in incomeCategories"
            :key="category.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <span class="text-xl mr-2">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </div>
            <button
              class="text-error text-sm"
              @click="deleteCategory(category.id)"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 數據管理 -->
    <div class="card mb-6">
      <h3 class="text-base font-semibold mb-4">數據管理</h3>
      <button
        class="w-full py-2 text-error border border-error rounded-lg"
        @click="confirmClearData"
      >
        清除所有數據
      </button>
    </div>

    <!-- 關於 -->
    <div class="card">
      <h3 class="text-base font-semibold mb-4">關於</h3>
      <p class="text-textLight">版本：1.0.0</p>
    </div>

    <!-- 新增類別對話框 -->
    <div
      v-if="showAddCategory"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      @click.self="showAddCategory = false"
    >
      <div class="card w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-4">新增類別</h3>
        <form @submit.prevent="addNewCategory" class="space-y-4">
          <div>
            <label class="label">名稱</label>
            <input
              v-model="newCategory.name"
              type="text"
              class="input"
              required
            />
          </div>
          <div>
            <label class="label">圖示</label>
            <input
              v-model="newCategory.icon"
              type="text"
              class="input"
              required
            />
          </div>
          <div>
            <label class="label">類型</label>
            <select
              v-model="newCategory.type"
              class="input"
              required
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              class="btn"
              @click="showAddCategory = false"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary"
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
.border-primary {
  border-color: var(--color-primary);
}

.text-primary {
  color: var(--color-primary);
}

.text-error {
  color: var(--color-error);
}

.text-textLight {
  color: var(--color-textLight);
}

.border-error {
  border-color: var(--color-error);
}
</style>