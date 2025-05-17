// composables/useSupabaseAuth.ts
import { useSupabase } from './useSupabase'
import { ref, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'
import { useTransactionStore } from '~/stores/transaction'

export function useSupabaseAuth() {
  const supabase = useSupabase()
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 在 setup 階段取得用戶資料
  const initUser = async () => {
    try {
      isLoading.value = true
      const { data } = await supabase.auth.getUser()
      user.value = data.user
      
      // 如果用戶已登入，初始化他們的交易資料
      if (data.user) {
        await loadUserData()
      }
    } catch (err: any) {
      console.error('無法獲取用戶資訊:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
  
  // 初始化用戶資料
  onMounted(() => {
    initUser()
  })

  // 載入用戶資料
  const loadUserData = async () => {
    try {
      if (!user.value) return
      
      // 這裡可以載入其他用戶相關資料
      // 例如使用者偏好設定等
    } catch (err: any) {
      console.error('無法載入用戶資料:', err)
      error.value = err.message
    }
  }
  
  // 清除用戶資料
  const clearUserData = () => {
    const transactionStore = useTransactionStore()
    transactionStore.clearTransactions()
    // 這裡可以清除其他相關資料
  }

  // 監聽登入狀態變化
  supabase.auth.onAuthStateChange(async (event, session) => {
    const previousUser = user.value
    user.value = session?.user ?? null
    
    // 處理登入狀態變化
    if (!previousUser && session?.user) {
      // 用戶登入
      await loadUserData()
    } else if (previousUser && !session?.user) {
      // 用戶登出
      clearUserData()
    }
  })

  // 註冊
  const signUp = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      
      user.value = data.user
      
      // 如果註冊成功且用戶已登入，初始化資料
      if (data.user) {
        await loadUserData()
      }
      
      return data
    } catch (err: any) {
      console.error('註冊失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 登入
  const signIn = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      
      user.value = data.user
      
      // 載入用戶資料
      await loadUserData()
      
      return data
    } catch (err: any) {
      console.error('登入失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      await supabase.auth.signOut()
      user.value = null
      
      // 清除用戶資料
      clearUserData()
    } catch (err: any) {
      console.error('登出失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { 
    user, 
    signUp, 
    signIn, 
    signOut, 
    isLoading,
    error
  }
}