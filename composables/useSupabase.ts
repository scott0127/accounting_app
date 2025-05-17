// composables/useSupabase.ts
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  if (!supabaseInstance) {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseAnonKey = config.public.supabaseAnonKey
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseInstance
}

// 為了向後相容，也提供一個直接訪問 supabase 實例的方式
export const supabase = {
  get client() {
    if (!supabaseInstance) {
      // 這會在第一次使用時初始化 Supabase 客戶端
      return useSupabase()
    }
    return supabaseInstance
  }
}
