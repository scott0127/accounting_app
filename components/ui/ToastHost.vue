<template>
  <div class="toast-host" role="status" aria-live="polite">
    <transition-group name="toast" tag="div" class="space-y-2">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <div class="toast__msg">{{ t.message }}</div>
        <button v-if="t.actionLabel" class="toast__action" @click="handleAction(t)">{{ t.actionLabel }}</button>
        <button class="toast__close" @click="dismiss(t.id)" aria-label="關閉">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { toasts, dismiss } = useToast()

const handleAction = (t: any) => {
  try { t.onAction && t.onAction() } finally { dismiss(t.id) }
}
</script>

<style scoped>
.toast-host { position: fixed; left: 0; right: 0; bottom: calc(5.5rem + env(safe-area-inset-bottom)); display:flex; justify-content:center; pointer-events:none; z-index: 80 }
.toast-enter-active, .toast-leave-active { transition: all .22s ease }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px) }
.toast { pointer-events:auto; display:flex; align-items:center; gap:.5rem; padding:.6rem .8rem; border-radius:.75rem; background:#111a; color:#fff; backdrop-filter: blur(8px); box-shadow:0 4px 14px #0004 }
.toast__msg { font-weight:600; font-size:.9rem }
.toast__action { background:transparent; border:0; color:#fff; font-weight:700; padding:.2rem .4rem; border-radius:.4rem; text-decoration: underline; }
.toast__close { background:transparent; border:0; color:#fff; font-weight:700; font-size:1.1rem }
.toast--success { background: rgba(34,197,94,.92) }
.toast--error { background: rgba(239,68,68,.92) }
.toast--warning { background: rgba(245,158,11,.92) }
.toast--info { background: rgba(59,130,246,.92) }
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active, .toast-leave-active { transition: none }
}
</style>
