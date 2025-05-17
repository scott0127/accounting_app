<template>
  <div class="max-w-sm mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
    <div class="text-center mb-6">
      <h2 class="text-xl font-bold text-gray-800 mb-2">{{ isLogin ? '歡迎回來' : '建立新帳戶' }}</h2>
      <p class="text-sm text-gray-500">{{ isLogin ? '請登入您的帳戶' : '請填寫以下資訊進行註冊' }}</p>
    </div>
    
    <form @submit.prevent="handleAuth" class="space-y-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <input 
          v-model="email" 
          type="email" 
          placeholder="電子郵件" 
          class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
          required 
        />
      </div>
      
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          v-model="password" 
          type="password" 
          placeholder="密碼" 
          class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
          required 
        />
      </div>
      
      <button 
        type="submit" 
        class="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {{ isLogin ? '登入' : '註冊' }}
      </button>
    </form>
    
    <div class="mt-6 text-center">
      <button 
        class="text-sm text-blue-600 hover:text-blue-800 font-medium transition" 
        @click="isLogin = !isLogin"
      >
        {{ isLogin ? '沒有帳號？註冊新帳戶' : '已有帳號？登入' }}
      </button>
    </div>
    
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 text-xs flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </p>
    </div>
    
    <div class="mt-8 border-t border-gray-200 pt-4">
      <p class="text-xs text-gray-500 text-center">簡單記帳 · 安全認證</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { useRouter } from 'vue-router'

const { signUp, signIn, user } = useSupabaseAuth()
const router = useRouter()
const email = ref('')
const password = ref('')
const isLogin = ref(true)
const error = ref('')

const handleAuth = async () => {
  error.value = ''
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value)
    }
    if (user.value) router.push('/')
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<style scoped>
/* 移除舊的樣式，現在使用 Tailwind 類別直接在元素上 */
</style>