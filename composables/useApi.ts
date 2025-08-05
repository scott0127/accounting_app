/**
 * 標準化 API 處理 composable
 * 提供統一的 API 請求處理、緩存和狀態管理
 */
import { ref, computed, reactive } from 'vue'
import { useErrorHandler } from './useErrorHandler'

export interface ApiState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
}

export interface ApiOptions {
  immediate?: boolean
  cache?: boolean
  cacheKey?: string
  cacheDuration?: number // 毫秒
  retryCount?: number
  retryDelay?: number
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useApi<T = any>(options: ApiOptions = {}) {
  const {
    immediate = false,
    cache: enableCache = false,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5分鐘
    retryCount = 3,
    retryDelay = 1000
  } = options

  const errorHandler = useErrorHandler()
  
  // 狀態管理
  const state = reactive<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  })

  // 緩存存儲
  const cacheStore = new Map<string, { data: any, timestamp: number }>()

  // 計算屬性
  const isLoading = computed(() => state.loading)
  const hasData = computed(() => state.data !== null)
  const hasError = computed(() => state.error !== null)
  const isEmpty = computed(() => !state.loading && !state.data)

  // 清除狀態
  const clear = () => {
    state.data = null
    state.error = null
    state.lastFetched = null
  }

  // 緩存檢查
  const getCachedData = (key: string) => {
    if (!enableCache) return null
    
    const cached = cacheStore.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > cacheDuration
    if (isExpired) {
      cacheStore.delete(key)
      return null
    }
    
    return cached.data
  }

  // 設置緩存
  const setCachedData = (key: string, data: any) => {
    if (!enableCache) return
    cacheStore.set(key, { data, timestamp: Date.now() })
  }

  // 基礎 fetch 方法
  const fetch = async <R = T>(
    fetcher: () => Promise<R>,
    options: { key?: string, useCache?: boolean } = {}
  ): Promise<R | null> => {
    const { key = cacheKey || 'default', useCache = enableCache } = options

    try {
      // 檢查緩存
      if (useCache) {
        const cachedData = getCachedData(key)
        if (cachedData) {
          state.data = cachedData
          return cachedData
        }
      }

      state.loading = true
      state.error = null

      // 執行請求
      const result = await errorHandler.retryOperation(
        fetcher,
        {
          maxRetries: retryCount,
          delay: retryDelay,
          context: `API fetch (${key})`
        }
      )

      if (result !== null) {
        state.data = result as any
        state.lastFetched = new Date()
        
        // 設置緩存
        if (useCache) {
          setCachedData(key, result)
        }
      } else {
        state.error = errorHandler.error.value?.message || '請求失敗'
      }

      return result
    } catch (err) {
      state.error = errorHandler.getErrorMessage(err)
      return null
    } finally {
      state.loading = false
    }
  }

  // GET 請求
  const get = async (url: string, config?: any) => {
    return fetch(async () => {
      const response = await $fetch(url, { method: 'GET', ...config })
      return response
    }, { key: url })
  }

  // POST 請求
  const post = async (url: string, data?: any, config?: any) => {
    return fetch(async () => {
      const response = await $fetch(url, { 
        method: 'POST', 
        body: data,
        ...config 
      })
      return response
    })
  }

  // PUT 請求
  const put = async (url: string, data?: any, config?: any) => {
    return fetch(async () => {
      const response = await $fetch(url, { 
        method: 'PUT', 
        body: data,
        ...config 
      })
      return response
    })
  }

  // DELETE 請求
  const del = async (url: string, config?: any) => {
    return fetch(async () => {
      const response = await $fetch(url, { method: 'DELETE', ...config })
      return response
    })
  }

  // 分頁請求
  const fetchPaginated = async (
    fetcher: (pagination: PaginationOptions) => Promise<{ data: T[], total: number }>,
    pagination: PaginationOptions = {}
  ) => {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination

    return fetch(async () => {
      const result = await fetcher({ page, limit, sortBy, sortOrder })
      return {
        ...result,
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page * limit < result.total,
        hasPrevPage: page > 1
      }
    })
  }

  // 刷新數據
  const refresh = async () => {
    if (cacheKey) {
      cacheStore.delete(cacheKey)
    }
    state.lastFetched = null
    // 這裡可以重新執行上一次的請求
  }

  // 無效化緩存
  const invalidateCache = (key?: string) => {
    if (key) {
      cacheStore.delete(key)
    } else {
      cacheStore.clear()
    }
  }

  // 批量處理
  const batchProcess = async <R>(
    items: any[],
    processor: (item: any) => Promise<R>,
    options: { concurrency?: number } = {}
  ) => {
    const { concurrency = 5 } = options
    const results: Array<{ success: boolean, data?: R, error?: any, item: any }> = []

    // 分批處理
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      const batchPromises = batch.map(async (item) => {
        try {
          const data = await processor(item)
          return { success: true, data, item }
        } catch (error) {
          return { success: false, error, item }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  return {
    // 狀態
    state: readonly(state),
    isLoading,
    hasData,
    hasError,
    isEmpty,

    // 基礎方法
    fetch,
    clear,
    refresh,

    // HTTP 方法
    get,
    post,
    put,
    delete: del,

    // 進階功能
    fetchPaginated,
    batchProcess,
    invalidateCache,

    // 錯誤處理 (從 errorHandler 選擇性導出)
    setError: errorHandler.setError,
    clearError: errorHandler.clearError,
    getError: errorHandler.getError,
    withErrorHandling: errorHandler.withErrorHandling
  }
}

// 預設實例
export const defaultApi = useApi({
  cache: true,
  cacheDuration: 5 * 60 * 1000,
  retryCount: 3
})
