// composables/useAuthenticatedTransactions.ts
import { ref, watch, onMounted, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { useSupabase } from './useSupabase'
import { useSupabaseAuth } from './useSupabaseAuth'
import type { Transaction } from '~/types'

export function useAuthenticatedTransactions() {
  const supabase = useSupabase()
  const { user } = useSupabaseAuth()
  const transactionStore = useTransactionStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 從 Supabase 載入交易
  const loadFromSupabase = async () => {
    if (!user.value) {
      // 如果沒有用戶，就清空交易並提前返回
      transactionStore.clearTransactions()
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('transactions')
        .select('id, amount, type, date, description, category_id, category_ids')
        .eq('user_id', user.value.id)
        .order('date', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      if (data) {
        // 轉換日期格式為 YYYY-MM-DD 並正規化分類欄位
        const formattedData = data.map((item: any) => {
          const primary = (Array.isArray(item.category_ids) && item.category_ids.length > 0)
            ? item.category_ids[0]
            : (item.category_id || '')
          const category_ids = Array.isArray(item.category_ids)
            ? item.category_ids.slice(0, 3)
            : (primary ? [primary] : [])
          return {
            id: String(item.id),
            amount: item.amount,
            type: item.type || 'expense',
            category_id: primary || undefined,
            category_ids,
            date: new Date(item.date).toISOString().split('T')[0],
            description: item.description || '',
            note: (item as any).note ?? (item.description || '')
          } as Transaction
        })
        
        // 更新 store
        transactionStore.setTransactions(formattedData)
      } else {
        transactionStore.clearTransactions()
      }
    } catch (err: any) {
      console.error('從 Supabase 載入交易失敗:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // 新增交易
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user.value) {
      throw new Error('必須登入才能新增交易')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // 首先插入到 Supabase
      const category_ids = Array.isArray(transaction.category_ids)
        ? transaction.category_ids.slice(0, 3)
        : (transaction.category_id ? [transaction.category_id] : [])

      const { data, error: supabaseError } = await supabase
        .from('transactions')
        .insert({
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description || '',
          category_id: category_ids[0] || null,
          category_ids,
          user_id: user.value.id
        })
        .select()
        .single()
      
      if (supabaseError) throw supabaseError
      
      // 轉換日期格式
      const newTransaction: Transaction = {
        id: String(data.id),
        amount: data.amount,
        type: data.type,
        category_id: data.category_id || undefined,
        category_ids: Array.isArray(data.category_ids) ? data.category_ids.slice(0, 3) : (data.category_id ? [data.category_id] : []),
        date: new Date(data.date).toISOString().split('T')[0],
        description: data.description || '',
        note: (data as any).note ?? (data.description || '')
      }
      
      // 新增到 store
      await transactionStore.addTransaction(newTransaction)
      
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
      error.value = null
      
      // 更新 Supabase
      const supabaseUpdates: Record<string, any> = {}
      if (updates.amount !== undefined) supabaseUpdates.amount = updates.amount
      if (updates.type !== undefined) supabaseUpdates.type = updates.type
      if (updates.date !== undefined) supabaseUpdates.date = updates.date
      if (updates.description !== undefined) supabaseUpdates.description = updates.description
      if (Array.isArray(updates.category_ids)) {
        supabaseUpdates.category_ids = updates.category_ids.slice(0, 3)
        supabaseUpdates.category_id = updates.category_ids[0] || null
      } else if (updates.category_id !== undefined) {
        supabaseUpdates.category_id = updates.category_id
        supabaseUpdates.category_ids = updates.category_id ? [updates.category_id] : []
      }

      const { error: supabaseError } = await supabase
        .from('transactions')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.value.id)
      
      if (supabaseError) throw supabaseError
      
      // 更新 store
      const mergedUpdates: Partial<Transaction> = {
        ...updates,
        category_ids: Array.isArray(updates.category_ids)
          ? updates.category_ids.slice(0, 3)
          : updates.category_id ? [updates.category_id] : undefined,
        category_id: Array.isArray(updates.category_ids)
          ? (updates.category_ids[0] || undefined)
          : updates.category_id
      }
      await transactionStore.updateTransaction(id, mergedUpdates)
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
      
      // 從 Supabase 刪除
      const { error: supabaseError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)
      
      if (supabaseError) throw supabaseError
      
      // 從 store 刪除
      await transactionStore.deleteTransaction(id)
    } catch (err: any) {
      console.error('刪除交易失敗:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 當用戶狀態變更時，載入或清空交易資料
  watch(() => user.value, async (newUser) => {
    if (newUser) {
      await loadFromSupabase()
    } else {
      transactionStore.clearTransactions()
    }
  }, { immediate: true })
    // 初始載入
  onMounted(async () => {
    if (user.value) {
      await loadFromSupabase()
    } else {
      // 確保未登入時清空交易
      transactionStore.clearTransactions()
    }
  })
  
  // 計算屬性 - 必須通過使用者驗證才能存取交易資料
  const transactions = computed(() => {
    return user.value ? transactionStore.transactions : []
  })
  
  return {
    transactions,
    categories: computed(() => transactionStore.categories),
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyStats: (month: string) => {
      // 未登入時返回空的統計資料
      if (!user.value) {
        return {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          categories: {}
        }
      }
      return transactionStore.getMonthlyStats(month)
    },
    loadFromSupabase
  }
}
