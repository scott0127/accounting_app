import { reactive, readonly } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'
export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration?: number
  actionLabel?: string
  onAction?: () => void
}

const state = reactive<{ queue: ToastItem[] }>({ queue: [] })
let seed = 1

export function useToast() {
  const show = (message: string, options: Partial<Omit<ToastItem, 'id' | 'message'>> = {}) => {
    const item: ToastItem = {
      id: seed++,
      message,
      type: options.type || 'info',
      duration: options.duration ?? 3200,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    }
    state.queue.push(item)

    if (item.duration && item.duration > 0) {
      const id = item.id
      setTimeout(() => dismiss(id), item.duration)
    }
    return item.id
  }

  const dismiss = (id: number) => {
    const i = state.queue.findIndex(t => t.id === id)
    if (i > -1) state.queue.splice(i, 1)
  }

  const clearAll = () => {
    state.queue.splice(0, state.queue.length)
  }

  return {
    toasts: readonly(state.queue),
    show,
    dismiss,
    clearAll,
  }
}
