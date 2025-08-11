<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '~/stores/transaction'
import { useTheme } from '~/composables/useTheme'

const store = useTransactionStore()
const { initTheme } = useTheme()

// 初始化數據和主題
onMounted(async () => {
  try {
    await Promise.all([
      store.initialize(),
      initTheme()
    ])
    console.log('App initialized successfully')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
</script>

<style>
:root {
  --color-primary: #3B82F6;
  --color-secondary: #6366F1;
  --color-accent: #8B5CF6;
  --color-background: #F3F4F6;
  --color-surface: #FFFFFF;
  --color-text: #1F2937;
  --color-textLight: #6B7280;
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-chart-1: #FF6384;
  --color-chart-2: #36A2EB;
  --color-chart-3: #FFCE56;
  --color-chart-4: #4BC0C0;
  --color-chart-5: #9966FF;
  --color-chart-6: #FF9F40;
}

html {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.5;
}

/* 移除 iOS 點擊時的高亮效果 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 防止 iOS 橡皮筋效果 */
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  overscroll-behavior: none;
}

/* 允許內容區域滾動 */
#__nuxt {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 自定義滾動條樣式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-textLight);
  border-radius: 2px;
}

/* 移除輸入框的預設樣式 */
input, textarea {
  appearance: none;
  -webkit-appearance: none;
  border-radius: 0;
}

/* 移除按鈕的預設樣式 */
button {
  appearance: none;
  -webkit-appearance: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

/* Active 狀態的樣式 */
.active {
  color: var(--color-primary);
}

/* 卡片樣式 */
.card {
  background-color: var(--color-surface);
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  opacity: 0.9;
}

/* 輸入框樣式 */
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-textLight);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
  color: var(--color-text);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 標籤樣式 */
.label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-textLight);
  font-size: 0.875rem;
}

/* 偏好降低動畫時，關閉多數動畫與過渡 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>
