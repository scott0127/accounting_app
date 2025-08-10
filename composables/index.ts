/**
 * Composables 統一導出文件
 * 提供所有 composable 的統一入口點
 */
import { computed } from 'vue'
import dayjs from 'dayjs'

// 注意：避免在此檔案 re-export composables 與型別
// 讓 Nuxt 的 auto-import 只維持單一來源（各自的檔案），否則會出現 duplicated imports 警告。

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
