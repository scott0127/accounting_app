// composables/useSupabaseTransactions.ts
import { ref, computed, watch } from 'vue'
import { useSupabase } from './useSupabase'
import { useSupabaseAuth } from './useSupabaseAuth'
import type { Transaction, Category, MonthlyStats } from '~/types'

export function useSupabaseTransactions() {
  const supabase = useSupabase()
  const { user } = useSupabaseAuth()
  
  const transactions = ref<Transaction[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  
  // 獲取類別
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (err) throw err
      
      categories.value = data as Category[]
    } catch (err: any) {
      console.error('獲取類別失敗:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // 初始化
  const initialize = async () => {
    if (initialized.value) return
    
    try {
      loading.value = true
      error.value = null
      
      // 加載類別
      await fetchCategories()
      
      // 如果已登入，加載交易
      if (user.value) {
        await fetchTransactions()
      }
      
      initialized.value = true
    } catch (err: any) {
      console.error('初始化失敗:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
    // 獲取交易資料
  const fetchTransactions = async () => {
    if (!user.value) {
      transactions.value = []
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('date', { ascending: false })
        if (err) throw err      // 轉換資料格式以匹配前端模型，根據資料庫結構
      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        amount: item.amount,
        // 使用 type 欄位，確保它存在
        type: item.type || 'expense', 
        // 從 category_id 欄位映射到前端使用的 category 欄位
        category: item.category_id || '',
        date: new Date(item.date).toISOString().split('T')[0],
        description: item.description || '',
        note: item.note || ''
      }))
      
      transactions.value = formattedData
    } catch (err: any) {
      console.error('獲取交易失敗:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // 依月份獲取統計資料
  const getMonthlyStats = (month: string): MonthlyStats => {
    const monthTransactions = transactions.value.filter(t => t.date.startsWith(month))
    
    const stats: MonthlyStats = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categories: {}
    }

    monthTransactions.forEach(t => {
      if (t.type === 'income') {
        stats.totalIncome += t.amount
      } else {
        stats.totalExpense += t.amount
      }
      
      if (!stats.categories[t.category]) {
        stats.categories[t.category] = 0
      }
      stats.categories[t.category] += t.amount
    })

    stats.balance = stats.totalIncome - stats.totalExpense
    return stats
  }
    // 新增交易
  const addTransaction = async (transaction: Omit<Transaction, 'id'> & { category_id?: string }) => {
    if (!user.value) {
      throw new Error('必須登入才能新增交易')
    }
    
    try {
      loading.value = true
      error.value = null    // 根據實際資料庫結構調整欄位
      // 使用 category_id 而不是 category，因為資料庫已經改為使用 category_id
      const supabaseTransaction = {
        amount: transaction.amount,
        type: transaction.type, // 確保 type 欄位存在
        date: transaction.date,
        description: transaction.description || transaction.note || '',
        // 使用 category_id 欄位，因為資料庫已經改為使用這個欄位名稱
        category_id: transaction.category_id || transaction.category,
        user_id: user.value.id
      }
      
      const { data, error: err } = await supabase
        .from('transactions')
        .insert(supabaseTransaction)
        .select()
        .single()
      
      if (err) throw err
        // 轉換日期格式並新增到本地資料
      const newTransaction = {
        ...transaction,
        id: data.id.toString(),
        // 確保欄位一致性，映射 category_id 到前端的 category
        category: data.category_id || '',
        date: new Date(data.date).toISOString().split('T')[0]
      }
      
      transactions.value = [newTransaction, ...transactions.value]
      
      return newTransaction
    } catch (err: any) {
      console.error('新增交易失敗:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
    // 更新交易
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user.value) {
      throw new Error('必須登入才能更新交易')
    }
    
    try {
      loading.value = true
      error.value = null    // 處理欄位名稱差異，根據資料庫結構調整
      const supabaseUpdates: any = { ...updates }
      
      // 資料庫現在使用 category_id，不是 category
      // 如果有 category，則將其映射到 category_id
      if ('category' in supabaseUpdates) {
        supabaseUpdates.category_id = supabaseUpdates.category
        delete supabaseUpdates.category
      }
      
      // 如果已經提供了 category_id，則保留它
      if ('category_id' in supabaseUpdates) {
        // 已經是正確的欄位名稱，不需要調整
      }
      
      const { error: err } = await supabase
        .from('transactions')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.value.id)
      
      if (err) throw err
      
      // 更新本地資料
      const index = transactions.value.findIndex(t => t.id === id)
      if (index > -1) {
        transactions.value[index] = {
          ...transactions.value[index],
          ...updates
        }
      }
    } catch (err: any) {
      console.error('更新交易失敗:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 刪除交易
  const deleteTransaction = async (id: string) => {
    if (!user.value) {
      throw new Error('必須登入才能刪除交易')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)
      
      if (err) throw err
      
      // 從本地資料中刪除
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (err: any) {
      console.error('刪除交易失敗:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 監聽用戶狀態變更
  watch(() => user.value, async (newUser) => {
    if (newUser) {
      await fetchTransactions()
    } else {
      // 用戶登出時清空交易資料
      transactions.value = []
    }
  }, { immediate: true })
  
  return {
    transactions,
    categories,
    loading,
    error,
    initialize,
    fetchTransactions,
    fetchCategories,
    getMonthlyStats,
    addTransaction,
    updateTransaction,
    deleteTransaction
  }
}
