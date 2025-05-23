// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],
  runtimeConfig: {
    public: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  app: {
    head: {
      title: '簡單記帳',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover' },
        { name: 'description', content: '簡單好用的記帳 App' },
        // iOS
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: '簡單記帳' },
        // Android
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'application-name', content: '簡單記帳' },
        // PWA
        { name: 'display-mode', content: 'standalone' }
      ],
      link: [
        {
          rel: 'manifest',
          href: '/manifest.json'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Varela+Round&display=swap'
        }
      ]
    }
  },
  css: [
    // 添加顏色主題文件
    '~/assets/css/colors.css',
    // ...其他CSS文件
  ],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '懶人記帳',
      short_name: '懶人記帳',
      description: 'AI 智能記帳，簡單又方便',
      display: 'standalone',
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      // 每小時檢查更新
      periodicSyncForUpdates: 3600
    },
    // 確保 service worker 正確註冊
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  }
})
