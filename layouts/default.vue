<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen" :class="`bg-[${currentTheme.colors.background}]`">
    <!-- 主要內容區域 -->
    <main class="pb-16">
      <slot />
    </main>

    <!-- 底部導航欄 - 2025 台灣 APP 風格 -->
    <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-40">
      <div class="bottom-nav__container mx-auto flex justify-around items-center h-18 max-w-md rounded-t-3xl px-2">
        <NuxtLink
          to="/"
          class="bottom-nav__item"
          :class="{ active: $route.path === '/' }"
        >
          <span class="bottom-nav__icon" aria-label="總覽"> 
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="10" width="4" height="8" rx="2" :fill="$route.path==='/' ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <rect x="9" y="6" width="4" height="12" rx="2" :fill="$route.path==='/' ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <rect x="15" y="3" width="4" height="15" rx="2" :fill="$route.path==='/' ? 'var(--color-primary)' : 'var(--color-textLight)'" />
            </svg>
          </span>
          <span class="bottom-nav__label">總覽</span>
        </NuxtLink>
        <NuxtLink
          to="/transactions"
          class="bottom-nav__item"
          :class="{ active: $route.path.startsWith('/transactions') }"
        >
          <span class="bottom-nav__icon" aria-label="記錄">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="14" rx="3" :stroke="$route.path.startsWith('/transactions') ? 'var(--color-primary)' : 'var(--color-textLight)'" stroke-width="2" fill="none"/>
              <rect x="7" y="9" width="10" height="2" rx="1" :fill="$route.path.startsWith('/transactions') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <rect x="7" y="13" width="6" height="2" rx="1" :fill="$route.path.startsWith('/transactions') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
            </svg>
          </span>
          <span class="bottom-nav__label">記錄</span>
        </NuxtLink>
        <NuxtLink
          to="/statistics"
          class="bottom-nav__item"
          :class="{ active: $route.path.startsWith('/statistics') }"
        >
          <span class="bottom-nav__icon" aria-label="統計">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <polyline points="4,17 9,11 13,15 20,7" :stroke="$route.path.startsWith('/statistics') ? 'var(--color-primary)' : 'var(--color-textLight)'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="4" cy="17" r="1.5" :fill="$route.path.startsWith('/statistics') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <circle cx="9" cy="11" r="1.5" :fill="$route.path.startsWith('/statistics') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <circle cx="13" cy="15" r="1.5" :fill="$route.path.startsWith('/statistics') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
              <circle cx="20" cy="7" r="1.5" :fill="$route.path.startsWith('/statistics') ? 'var(--color-primary)' : 'var(--color-textLight)'" />
            </svg>
          </span>
          <span class="bottom-nav__label">統計</span>
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="bottom-nav__item"
          :class="{ active: $route.path.startsWith('/settings') }"
        >
          <span class="bottom-nav__icon" aria-label="設定">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" :stroke="$route.path.startsWith('/settings') ? 'var(--color-primary)' : 'var(--color-textLight)'" stroke-width="2" fill="none"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 4.6V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                :stroke="$route.path.startsWith('/settings') ? 'var(--color-primary)' : 'var(--color-textLight)'" stroke-width="2" fill="none"/>
            </svg>
          </span>
          <span class="bottom-nav__label">設定</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- 新增記帳按鈕 - 現代 APP 風格 FAB (優化) -->
    <button
      class="fab-btn fixed right-4 bottom-20 w-14 h-14 rounded-full flex items-center justify-center z-50 group focus:outline-none shadow-lg"
      @click="navigateToAdd"
      aria-label="新增記帳"
    >
      <span class="fab-btn__glass absolute inset-0 rounded-full pointer-events-none"></span>
      <svg class="relative z-10" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="var(--color-primary)" opacity="0.12"/>
        <path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";
useSupabaseAuth();

const router = useRouter();
const { currentTheme } = useTheme();

const toggleMenu = () => {
  // 實現選單切換邏輯
};

const navigateToAdd = () => {
  router.push("/transactions/add");
};
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
html,
body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* 允許內容區域滾動 */
main {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: calc(100vh - 3.5rem - 4rem);
  /* 扣除頂部和底部導航的高度 */
}

/* FAB 現代 APP 風格樣式 */
.fab-btn {
  background: linear-gradient(135deg, var(--color-primary) 70%, var(--color-accent));
  box-shadow: 0 4px 16px 0 var(--color-primary)22;
  position: fixed;
  transition: box-shadow 0.18s, transform 0.16s;
  overflow: visible;
  filter: drop-shadow(0 2px 8px var(--color-primary)22);
  will-change: transform, box-shadow;
}
.fab-btn:active {
  transform: scale(0.96);
}
.fab-btn__glass {
  background: rgba(255,255,255,0.13);
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
}
.fab-btn__icon {
  display: none;
}

/* 深色主題下 icon 更亮 */
html[data-theme='dark'] .fab-btn__icon {
  color: #fff;
  text-shadow: 0 2px 18px var(--color-primary), 0 1px 0 #0008;
  filter: drop-shadow(0 0 10px var(--color-primary)99);
}

/* 2025 台灣 APP 風格底部導航欄 */
.bottom-nav {
  background: transparent;
  pointer-events: none;
}
.bottom-nav__container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  box-shadow: 0 -2px 24px 0 var(--color-primary)11, 0 1.5px 6px 0 #0001;
  height: 5.0rem;
  pointer-events: auto;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  border: 1.5px solid var(--color-surface);
  margin-bottom: 0;
  transition: background 0.2s;
}
@media (max-width: 640px) {
  .bottom-nav__container {
    max-width: 100vw;
    border-radius: 1.5rem 1.5rem 0 0;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
.bottom-nav__item {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-textLight);
  font-weight: 500;
  font-size: 1.05rem;
  padding: 0.5rem 0 0.2rem 0;
  border-radius: 1.2rem;
  transition: color 0.18s, background 0.18s, box-shadow 0.18s;
  position: relative;
  min-width: 0;
  user-select: none;
}
.bottom-nav__item.active {
  color: var(--color-primary);
  background: linear-gradient(120deg, var(--color-primary)22 60%, var(--color-accent)11 100%);
  box-shadow: 0 2px 12px 0 var(--color-primary)22;
}
.bottom-nav__item:active {
  background: var(--color-primary)11;
  color: var(--color-primary);
}
.bottom-nav__icon {
  font-size: 1.7rem;
  line-height: 1;
  margin-bottom: 0.1rem;
  filter: drop-shadow(0 2px 6px var(--color-primary)11);
  transition: filter 0.18s;
}
.bottom-nav__item.active .bottom-nav__icon {
  filter: drop-shadow(0 2px 12px var(--color-primary)44);
}
.bottom-nav__label {
  font-size: 0.82rem;
  letter-spacing: 0.01em;
  font-weight: 600;
  margin-top: 0.05rem;
  transition: color 0.18s;
}
</style>
