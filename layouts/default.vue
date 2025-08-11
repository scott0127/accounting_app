<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen" :class="`bg-[${currentTheme.colors.background}]`">
    <!-- 玻璃感頂部 App Bar（僅首頁/列表頁顯示） -->
    <header v-if="showHeader" class="app-header fixed top-0 left-0 right-0 z-40">
      <div class="app-header__container mx-auto max-w-md">
        <div class="flex items-center gap-2 h-14 px-3">
          <!-- 品牌 / 標題區 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="brand-pill">
                <span class="brand-dot" />
                <span class="brand-text truncate">懶人記帳</span>
              </div>
              <span class="header-divider" />
              <div class="text-sm font-semibold opacity-80 truncate">{{ headerTitle }}</div>
            </div>
          </div>

          <!-- 搜尋/輸入區 -->
          <div v-if="isSearching" class="search-wrap">
            <form @submit.prevent="submitSearch" class="search-form">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M21 21l-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              <input ref="searchInputRef" v-model.trim="searchQuery" class="search-input" placeholder="搜尋交易... (Enter)" />
              <button type="button" class="clear-btn" v-if="searchQuery" @click="searchQuery=''"></button>
            </form>
          </div>
          <button v-else class="icon-btn" aria-label="搜尋" @click="openSearch">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>

          <!-- 登出按鈕 -->
          <button v-if="auth.user?.value" class="logout-pill" @click="handleSignOut">登出</button>
        </div>
      </div>
    </header>

    <!-- 主要內容區域 -->
    <main :class="['pb-20','pt-0', showHeader ? 'pt-16' : 'pt-0']">
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

    <!-- 新增記帳按鈕 - 現代 APP 風格 FAB (改為開啟 Quick Add 面板) -->
    <button
      class="fab-btn fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] w-14 h-14 rounded-full flex items-center justify-center z-50 group focus:outline-none shadow-lg"
      @click="openQuickAdd"
      aria-label="新增記帳"
    >
      <span class="fab-btn__glass absolute inset-0 rounded-full pointer-events-none"></span>
      <svg class="relative z-10" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="var(--color-primary)" opacity="0.12"/>
        <path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Bottom Sheet：Quick Add -->
    <transition name="fade">
      <div v-if="isSheetOpen" class="sheet-overlay" @click="closeSheet" />
    </transition>
    <transition name="sheet">
      <div
        v-if="isSheetOpen"
        class="sheet-panel"
        :class="{ 'no-transition': isDraggingSheet }"
        role="dialog" aria-modal="true"
        :style="sheetTransformStyle"
        @touchstart.passive="onSheetTouchStart"
        @touchmove.prevent="onSheetTouchMove"
        @touchend="onSheetTouchEnd"
      >
        <div class="sheet-handle" />
        <div class="px-5 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div class="text-sm text-gray-500 mb-3">快速新增</div>
          <div class="grid grid-cols-3 gap-3">
            <button class="quick-card qc-ai" @click="goQuick('ai')">
              <span class="qc-icon">🤖</span>
              <span class="qc-label">AI 記帳</span>
            </button>
            <button class="quick-card qc-expense" @click="goQuick('expense')">
              <span class="qc-icon">➖</span>
              <span class="qc-label">支出</span>
            </button>
            <button class="quick-card qc-income" @click="goQuick('income')">
              <span class="qc-icon">➕</span>
              <span class="qc-label">收入</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const auth = useSupabaseAuth();

const { currentTheme } = useTheme();
const route = useRoute()

// Header 顯示與標題
const showHeader = computed(() => {
  const p = route.path
  return p === '/' || p.startsWith('/transactions') || p.startsWith('/statistics') || p.startsWith('/settings')
})
const headerTitle = computed(() => {
  const p = route.path
  if (p.startsWith('/transactions')) return '記錄'
  if (p.startsWith('/statistics')) return '統計'
  if (p.startsWith('/settings')) return '設定'
  return '總覽'
})

const toggleMenu = () => {
  // 實現選單切換邏輯
};

// Quick Add Bottom Sheet 控制
const isSheetOpen = ref(false)
const isDraggingSheet = ref(false)
const startY = ref(0)
const dragY = ref(0)
const sheetTransformStyle = computed(() => ({ transform: `translateY(${Math.max(0, dragY.value)}px)` }))
const onSheetTouchStart = (e: TouchEvent) => {
  isDraggingSheet.value = true
  startY.value = e.touches[0].clientY
  dragY.value = 0
}
const onSheetTouchMove = (e: TouchEvent) => {
  const dy = e.touches[0].clientY - startY.value
  // 僅向下拖曳，加入阻尼
  dragY.value = dy > 0 ? dy * 0.9 : 0
}
const onSheetTouchEnd = () => {
  const shouldClose = dragY.value > 120
  isDraggingSheet.value = false
  if (shouldClose) {
    closeSheet()
  } else {
    // 回彈
    dragY.value = 0
  }
}
const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') isSheetOpen.value = false }
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const openQuickAdd = () => { isSheetOpen.value = true }
const closeSheet = () => { isSheetOpen.value = false }
const goQuick = (mode?: 'ai'|'expense'|'income') => {
  const q = mode ? `?mode=${mode}` : ''
  isSheetOpen.value = false
  navigateTo(`/transactions/add${q}`)
}

// Header Search
const isSearching = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const openSearch = async () => {
  isSearching.value = true
  await nextTick()
  searchInputRef.value?.focus()
}
const submitSearch = () => {
  const q = searchQuery.value.trim()
  isSearching.value = false
  if (!q) return
  navigateTo(`/transactions?search=${encodeURIComponent(q)}`)
}
const handleSignOut = async () => {
  try { await auth.signOut() } finally { navigateTo('/auth') }
}
</script>

<style scoped>
.router-link-active {
  color: var(--color-primary);
}

/* 玻璃感頂部 App Bar */
.app-header {
  background: transparent;
  pointer-events: none;
}
.app-header__container {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  box-shadow: 0 1px 10px #00000014;
  border-bottom: 1px solid var(--color-surface);
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  pointer-events: auto;
}
.icon-btn { color: var(--color-text); padding: 6px; border-radius: 10px; transition: background 0.18s }
.icon-btn:active { background: var(--color-primary)11 }

/* 品牌區 */
.brand-pill { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:14px; background: linear-gradient(120deg, var(--color-primary)11, var(--color-accent)11) }
.brand-dot { width:8px; height:8px; border-radius:999px; background: var(--color-primary); box-shadow: 0 0 10px var(--color-primary)55 }
.brand-text { font-weight:700; font-size:.95rem }
.header-divider { width:1px; height:18px; background:#0002 }

/* 搜尋欄 */
.search-wrap { flex: 1; max-width: 56%; }
.search-form { display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:12px; background: #00000006; border:1px solid #0001 }
.search-icon { opacity:.7 }
.search-input { outline:none; border:0; background:transparent; width:140px; font-size:.9rem }
.clear-btn { width:16px; height:16px; border-radius:999px; background:#0003; position:relative }
.clear-btn::before, .clear-btn::after { content:''; position:absolute; left:50%; top:50%; width:9px; height:2px; background:white; transform-origin:center; border-radius:1px }
.clear-btn::before { transform: translate(-50%,-50%) rotate(45deg) }
.clear-btn::after { transform: translate(-50%,-50%) rotate(-45deg) }

/* 登出按鈕 */
.logout-pill { padding:6px 10px; border-radius:999px; font-weight:600; font-size:.85rem; color:#fff; background: linear-gradient(120deg, var(--color-secondary), var(--color-primary)); box-shadow: 0 2px 10px var(--color-primary)22 }

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
  min-height: 100vh;
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
  margin-bottom: env(safe-area-inset-bottom);
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

/* Bottom Sheet（Quick Add）*/
.sheet-overlay { position: fixed; inset: 0; background: #0006; z-index: 60 }
.sheet-panel {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 61;
  margin: 0 auto; max-width: 28rem;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border-top-left-radius: 1.25rem; border-top-right-radius: 1.25rem;
  box-shadow: 0 -10px 30px #0000001a;
}
.sheet-handle { width: 40px; height: 4px; background: #0003; border-radius: 999px; margin: 8px auto 10px }
.fade-enter-active, .fade-leave-active { transition: opacity .18s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.sheet-enter-active { transition: transform .26s cubic-bezier(.22,.61,.36,1.2) }
.sheet-leave-active { transition: transform .22s ease }
.sheet-enter-from, .sheet-leave-to { transform: translateY(24px) }
.no-transition { transition: none !important }

.quick-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:14px 10px; border-radius:16px; font-weight:600; transition: transform .12s, box-shadow .12s }
.quick-card:active { transform: scale(.97) }
.qc-icon { font-size: 20px; }
.qc-label { font-size: .85rem; }
.qc-ai { background: linear-gradient(135deg, #eef2ff, #f5f3ff); color:#4f46e5 }
.qc-expense { background: linear-gradient(135deg, #fee2e2, #ffe4e6); color:#dc2626 }
.qc-income { background: linear-gradient(135deg, #dcfce7, #d1fae5); color:#16a34a }

/* 深色模式調整 */
html[data-theme='dark'] .app-header__container { background: rgba(20,20,24,0.6); border-bottom-color: #ffffff10; box-shadow: 0 1px 10px #00000066 }
html[data-theme='dark'] .icon-btn { color: #e5e7eb }
html[data-theme='dark'] .brand-pill { background: linear-gradient(120deg, #0ea5e911, #a855f711) }
html[data-theme='dark'] .header-divider { background: #ffffff1a }
html[data-theme='dark'] .search-form { background: #ffffff0a; border-color: #ffffff12 }
html[data-theme='dark'] .sheet-overlay { background: #000a }
html[data-theme='dark'] .sheet-panel { background: rgba(20,20,24,0.82); box-shadow: 0 -10px 30px #000000aa }
html[data-theme='dark'] .sheet-handle { background: #ffffff26 }
html[data-theme='dark'] .bottom-nav__container { background: rgba(20,20,24,0.72); border-color: #ffffff10; box-shadow: 0 -2px 24px 0 #00000099 }
</style>
