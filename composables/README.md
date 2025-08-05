# Composables 優化文檔

本文檔說明了 composables 目錄中的優化內容和使用方式。

## 🚀 新增的核心 Composables

### 1. useErrorHandler.ts
**標準化錯誤處理 composable**

提供統一的錯誤處理、日誌記錄和用戶通知功能。

#### 主要功能：
- 統一錯誤狀態管理
- 異步操作包裝器 (`withErrorHandling`)
- 錯誤重試機制 (`retryOperation`)
- 批量錯誤處理
- 自動日誌記錄

#### 使用示例：
```typescript
import { useErrorHandler } from '~/composables'

const errorHandler = useErrorHandler({
  showNotifications: true,
  logErrors: true,
  defaultMessage: '操作失敗'
})

// 使用異步操作包裝器
const result = await errorHandler.withErrorHandling(
  async () => {
    return await someAsyncOperation()
  },
  {
    context: '載入數據',
    key: 'load-data',
    onSuccess: (result) => console.log('成功:', result),
    onError: (error) => console.error('錯誤:', error)
  }
)
```

### 2. useApi.ts
**標準化 API 處理 composable**

提供統一的 API 請求處理、緩存和狀態管理。

#### 主要功能：
- 統一的 HTTP 方法 (GET, POST, PUT, DELETE)
- 自動緩存機制
- 分頁請求支援
- 批量處理
- 錯誤處理整合

#### 使用示例：
```typescript
import { useApi } from '~/composables'

const api = useApi({
  cache: true,
  cacheDuration: 5 * 60 * 1000, // 5分鐘
  retryCount: 3
})

// GET 請求
const data = await api.get('/api/transactions')

// POST 請求
const newTransaction = await api.post('/api/transactions', {
  amount: 100,
  type: 'expense'
})

// 分頁請求
const paginatedData = await api.fetchPaginated(
  async (pagination) => {
    return await fetchTransactionsWithPagination(pagination)
  },
  { page: 1, limit: 10 }
)
```

### 3. useForm.ts
**統一表單處理 composable**

提供表單驗證、狀態管理和提交處理功能。

#### 主要功能：
- 聲明式表單配置
- 即時表單驗證
- 自動錯誤處理
- 表單狀態管理 (dirty, touched, valid)
- 預定義驗證規則

#### 使用示例：
```typescript
import { useForm, validationRules } from '~/composables'

const form = useForm({
  amount: {
    rules: [
      validationRules.required('金額為必填'),
      validationRules.positiveNumber('請輸入大於 0 的金額')
    ],
    initialValue: 0,
    transform: (value: any) => Number(value)
  },
  description: {
    rules: [validationRules.maxLength(200, '描述不能超過 200 字符')],
    initialValue: ''
  }
}, {
  validateOnChange: true,
  validateOnBlur: true,
  resetOnSubmit: true
})

// 提交表單
const handleSubmit = async () => {
  const result = await form.handleSubmit(
    async (data) => {
      return await submitTransaction(data)
    },
    {
      onSuccess: (result) => console.log('提交成功'),
      onError: (error) => console.error('提交失敗')
    }
  )
}

// 在模板中使用
const amountProps = form.getFieldProps('amount')
// amountProps 包含: value, error, touched, onChange, onBlur, onFocus
```

### 4. useSupabaseTransactionsV2.ts
**優化版 Supabase 交易管理**

基於新的錯誤處理機制重寫的交易管理 composable。

#### 改進點：
- 使用 `useErrorHandler` 進行統一錯誤處理
- 更好的類型安全
- 批量操作支援
- 更清晰的狀態管理

#### 使用示例：
```typescript
import { useSupabaseTransactionsV2 } from '~/composables'

const transactions = useSupabaseTransactionsV2()

// 初始化
await transactions.initialize()

// 新增交易
const newTransaction = await transactions.addTransaction({
  amount: 100,
  type: 'expense',
  category_id: 'food',
  date: '2024-01-01',
  description: '午餐'
})

// 批量新增
const newTransactions = await transactions.batchAddTransactions([
  { amount: 50, type: 'expense', category_id: 'transport', date: '2024-01-01' },
  { amount: 1000, type: 'income', category_id: 'salary', date: '2024-01-01' }
])
```

## 🔧 優化的現有 Composables

### useTransactions.ts
- 修正了類型不一致問題
- 使用統一的 `Transaction` 類型
- 改進了錯誤處理

### useSupabase.ts
- 優化了 Supabase 客戶端初始化
- 添加了向後兼容性

## 📋 預定義驗證規則

`useForm.ts` 提供了以下預定義驗證規則：

```typescript
import { validationRules } from '~/composables'

// 必填
validationRules.required('此欄位為必填')

// 電子郵件
validationRules.email('請輸入有效的電子郵件地址')

// 最小/最大長度
validationRules.minLength(3, '長度不能少於 3 個字符')
validationRules.maxLength(100, '長度不能超過 100 個字符')

// 數字
validationRules.number('請輸入有效的數字')
validationRules.positiveNumber('請輸入大於 0 的數字')

// 貨幣
validationRules.currency('請輸入有效的金額（最多兩位小數）')
```

## 🏗️ 架構改進

### 1. 統一錯誤處理
所有新的 composables 都使用 `useErrorHandler` 進行錯誤處理，確保：
- 一致的錯誤訊息格式
- 統一的日誌記錄
- 自動重試機制
- 用戶友好的錯誤通知

### 2. 類型安全
- 使用 TypeScript 嚴格模式
- 統一的類型定義 (`~/types/index.ts`)
- 避免 `any` 類型的使用

### 3. 可組合性
- 每個 composable 職責單一
- 可以輕鬆組合使用
- 避免循環依賴

### 4. 測試友好
- 純函數設計
- 清晰的輸入輸出
- 可模擬的依賴

## 📖 使用指南

### 推薦的 Composable 組合方式

```typescript
// 在頁面或組件中
export default defineComponent({
  setup() {
    // 錯誤處理
    const errorHandler = useErrorHandler()
    
    // 認證
    const auth = useSupabaseAuth()
    
    // 交易管理（推薦使用 V2 版本）
    const transactions = useSupabaseTransactionsV2()
    
    // 表單處理
    const transactionForm = useForm(/* 配置 */)
    
    // 主題
    const theme = useTheme()
    
    return {
      errorHandler,
      auth,
      transactions,
      transactionForm,
      theme
    }
  }
})
```

### 遷移指南

如果你正在使用舊版本的 composables，建議按以下步驟遷移：

1. **useSupabaseTransactions → useSupabaseTransactionsV2**
   ```typescript
   // 舊版本
   const { transactions, loading, error } = useSupabaseTransactions()
   
   // 新版本
   const { transactions, isLoading, hasError, error } = useSupabaseTransactionsV2()
   ```

2. **手動錯誤處理 → useErrorHandler**
   ```typescript
   // 舊版本
   try {
     const result = await someOperation()
   } catch (error) {
     console.error(error)
     // 手動處理錯誤
   }
   
   // 新版本
   const errorHandler = useErrorHandler()
   const result = await errorHandler.withErrorHandling(
     () => someOperation(),
     { context: '操作描述' }
   )
   ```

3. **自定義表單驗證 → useForm**
   ```typescript
   // 舊版本 - 手動驗證
   const validateForm = () => {
     if (!amount.value) return false
     if (amount.value <= 0) return false
     // ...
   }
   
   // 新版本 - 聲明式配置
   const form = useForm({
     amount: {
       rules: [
         validationRules.required(),
         validationRules.positiveNumber()
       ]
     }
   })
   ```

## 🧪 測試建議

新的 composables 設計得更加測試友好：

```typescript
// 測試示例
import { useErrorHandler } from '~/composables'

describe('useErrorHandler', () => {
  it('should handle errors correctly', async () => {
    const errorHandler = useErrorHandler()
    
    const result = await errorHandler.withErrorHandling(
      async () => {
        throw new Error('Test error')
      }
    )
    
    expect(result).toBeNull()
    expect(errorHandler.hasError('test-key')).toBe(true)
  })
})
```

## 🔮 未來計畫

1. **性能優化**
   - 添加更智能的緩存策略
   - 實現虛擬滾動支援
   - 優化大數據集處理

2. **功能擴展**
   - 添加離線支援
   - 實現數據同步機制
   - 添加更多預定義驗證規則

3. **開發者體驗**
   - 添加 devtools 整合
   - 提供更多使用範例
   - 建立自動化測試

這些優化大大改善了代碼的可維護性、可測試性和開發者體驗。建議新功能優先使用新版本的 composables。
