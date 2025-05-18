<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen" :class="`bg-[${currentTheme.colors.background}]`">
    

    <!-- 主要內容區域 -->
    <main class=" pb-16">
      <slot />
    </main>

    <!-- 底部導航欄 -->
    <nav
      class="fixed bottom-0 left-0 right-0 card border-t"
      :class="`bg-[${currentTheme.colors.surface}] border-[${currentTheme.colors.textLight}]`"
    >
      <div class="grid grid-cols-4 h-16">
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center"
          :class="`text-[${currentTheme.colors.text}]`"
        >
          <i class="text-xl mb-1">📊</i>
          <span class="text-xs">總覽</span>
        </NuxtLink>
        <NuxtLink
          to="/transactions"
          class="flex flex-col items-center justify-center"
          :class="`text-[${currentTheme.colors.text}]`"
        >
          <i class="text-xl mb-1">📝</i>
          <span class="text-xs">記錄</span>
        </NuxtLink>
        <NuxtLink
          to="/statistics"
          class="flex flex-col items-center justify-center"
          :class="`text-[${currentTheme.colors.text}]`"
        >
          <i class="text-xl mb-1">📈</i>
          <span class="text-xs">統計</span>
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="flex flex-col items-center justify-center"
          :class="`text-[${currentTheme.colors.text}]`"
        >
          <i class="text-xl mb-1">⚙️</i>
          <span class="text-xs">設定</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- 新增記帳按鈕 -->
    <button 
      class="fixed right-4 bottom-20 w-14 h-14 rounded-full text-white text-2xl shadow-lg flex items-center justify-center"
      :class="`bg-[${currentTheme.colors.primary}]`"
      @click="navigateToAdd"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
useSupabaseAuth()

const router = useRouter()
const { currentTheme } = useTheme()

const toggleMenu = () => {
  // 實現選單切換邏輯
}

const navigateToAdd = () => {
  router.push('/transactions/add')
}
</script>

<style scoped>
.router-link-active {
  color: var(--color-primary);
}

/* 針對移動設備的優化 */
@media (max-width: 640px) {
  .text-xs {
    font-size: 0.65rem;
  }
}

/* 防止 iOS 橡皮筋效果 */
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* 允許內容區域滾動 */
main {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: calc(100vh - 3.5rem - 4rem); /* 扣除頂部和底部導航的高度 */
}
</style>