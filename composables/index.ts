/**
 * Composables 統一導出文件
 * 提供所有 composable 的統一入口點
 */
import { computed } from 'vue'
import dayjs from 'dayjs'

// 核心功能
export { useErrorHandler, globalErrorHandler } from './useErrorHandler'
export { useApi, defaultApi } from './useApi'
export { useForm, validationRules } from './useForm'

// 數據管理
export { useSupabase } from './useSupabase'
export { useSupabaseAuth } from './useSupabaseAuth'
export { useSupabaseTransactions } from './useSupabaseTransactions'
export { useSupabaseTransactionsV2 } from './useSupabaseTransactionsV2'
export { useAuthenticatedTransactions } from './useAuthenticatedTransactions'

// 業務邏輯
export { useTransactions } from './useTransactions'
export { useBudget } from './useBudget'
export { useCharts } from './useCharts'
export { useFinancialGoals } from './useFinancialGoals'
export { useHealthStatus } from './useHealthStatus'

// 主題與 UI
export { useTheme } from './useTheme'
export { useUI } from './useUI'

// AI 功能
export { useExpenseClassifier } from './useExpenseClassifier'
export { useLLMClassifier } from './useLLMClassifier'
export { useLLMSummary } from './useLLMSummary'

// 重新導出所有類型
export type { ErrorState, UseErrorHandlerOptions } from './useErrorHandler'
export type { ApiState, ApiOptions, PaginationOptions } from './useApi'
export type { ValidationRule, FieldConfig, FormConfig, ValidationError } from './useForm'

/**
 * 常用 composable 組合 (示例，使用時需要根據實際情況調整)
 */

// 基礎交易管理組合
export const createTransactionManagement = () => {
  // 這個函數需要在組件內部調用，不能在模組級別調用
  return {
    // 返回創建函數，而不是直接創建實例
    create: () => {
      const transactions = useSupabaseTransactions() // 使用現有的穩定版本
      const budget = useBudget()
      
      return {
        transactions,
        budget
      }
    }
  }
}

// 認證相關組合創建函數
export const createAuthenticatedApp = () => {
  return {
    create: () => {
      const auth = useSupabaseAuth()
      const transactions = useSupabaseTransactions()
      const theme = useTheme()
      const ui = useUI()
      
      return {
        auth,
        transactions,
        theme,
        ui
      }
    }
  }
}
