/**
 * 標準化錯誤處理 composable
 * 提供統一的錯誤處理、日誌記錄和用戶通知功能
 */
import { ref, reactive } from 'vue'

export interface ErrorState {
  isError: boolean
  message: string
  code?: string
  details?: any
  timestamp: Date
}

export interface UseErrorHandlerOptions {
  showNotifications?: boolean
  logErrors?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showNotifications = true,
    logErrors = true,
    defaultMessage = '發生未知錯誤'
  } = options

  // 錯誤狀態
  const error = ref<ErrorState | null>(null)
  const isLoading = ref(false)
  const errors = reactive<Map<string, ErrorState>>(new Map())

  // 清除錯誤
  const clearError = (key?: string) => {
    if (key) {
      errors.delete(key)
    } else {
      error.value = null
      errors.clear()
    }
  }

  // 設置錯誤
  const setError = (err: any, key?: string, context?: string) => {
    const errorState: ErrorState = {
      isError: true,
      message: getErrorMessage(err),
      code: err?.code || err?.status?.toString(),
      details: err,
      timestamp: new Date()
    }

    if (key) {
      errors.set(key, errorState)
    } else {
      error.value = errorState
    }

    // 日誌記錄
    if (logErrors) {
      console.error(`[${context || 'Error'}]`, {
        message: errorState.message,
        code: errorState.code,
        details: err,
        timestamp: errorState.timestamp
      })
    }

    // 用戶通知（可以整合 toast 或其他通知系統）
    if (showNotifications) {
      // TODO: 整合通知系統
      console.warn('Error notification:', errorState.message)
    }

    return errorState
  }

  // 提取錯誤訊息
  const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err
    if (err?.message) return err.message
    if (err?.error?.message) return err.error.message
    if (err?.data?.message) return err.data.message
    return defaultMessage
  }

  // 異步操作包裝器
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    options: {
      key?: string
      context?: string
      loadingState?: boolean
      onError?: (error: ErrorState) => void
      onSuccess?: (result: T) => void
    } = {}
  ): Promise<T | null> => {
    const { key, context, loadingState = true, onError, onSuccess } = options

    try {
      if (loadingState) isLoading.value = true
      clearError(key)

      const result = await operation()
      
      if (onSuccess) onSuccess(result)
      return result
    } catch (err) {
      const errorState = setError(err, key, context)
      if (onError) onError(errorState)
      return null
    } finally {
      if (loadingState) isLoading.value = false
    }
  }

  // 獲取特定錯誤
  const getError = (key: string): ErrorState | null => {
    return errors.get(key) || null
  }

  // 檢查是否有錯誤
  const hasError = (key?: string): boolean => {
    if (key) return errors.has(key)
    return error.value?.isError || errors.size > 0
  }

  // 錯誤重試機制
  const retryOperation = async <T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      delay?: number
      key?: string
      context?: string
    } = {}
  ): Promise<T | null> => {
    const { maxRetries = 3, delay = 1000, key, context } = options

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        clearError(key)
        return result
      } catch (err) {
        if (attempt === maxRetries) {
          setError(err, key, `${context} (嘗試 ${attempt}/${maxRetries} 次後失敗)`)
          return null
        }

        if (logErrors) {
          console.warn(`[${context}] 嘗試 ${attempt}/${maxRetries} 失敗，${delay}ms 後重試:`, err)
        }

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return null
  }

  // 批量錯誤處理
  const handleBatchErrors = (results: Array<{ success: boolean, error?: any, key: string }>) => {
    results.forEach(({ success, error, key }) => {
      if (!success && error) {
        setError(error, key)
      }
    })
  }

  return {
    // 狀態
    error: readonly(error),
    errors: readonly(errors),
    isLoading: readonly(isLoading),
    
    // 方法
    setError,
    clearError,
    getError,
    hasError,
    withErrorHandling,
    retryOperation,
    handleBatchErrors,
    
    // 工具方法
    getErrorMessage
  }
}

// 全局錯誤處理實例（可選）
export const globalErrorHandler = useErrorHandler({
  showNotifications: true,
  logErrors: true,
  defaultMessage: '系統錯誤，請稍後再試'
})
