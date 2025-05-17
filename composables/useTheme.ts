import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textLight: string
    success: string
    error: string
    chart: string[]
  }
}

const themes: Theme[] = [
  {
    id: 'default',
    name: '預設主題',
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#F3F4F6',
      surface: '#FFFFFF',
      text: '#1F2937',
      textLight: '#6B7280',
      success: '#10B981',
      error: '#EF4444',
      chart: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }
  },
  {
    id: 'dark',
    name: '暗色主題',
    colors: {
      primary: '#60A5FA',
      secondary: '#818CF8',
      accent: '#A78BFA',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textLight: '#9CA3AF',
      success: '#34D399',
      error: '#F87171',
      chart: ['#F472B6', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#FB923C']
    }
  },
  {
    id: 'nature',
    name: '自然主題',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#065F46',
      background: '#ECFDF5',
      surface: '#FFFFFF',
      text: '#064E3B',
      textLight: '#047857',
      success: '#059669',
      error: '#DC2626',
      chart: ['#059669', '#047857', '#065F46', '#047857', '#065F46', '#059669']
    }
  },
  {
    id: 'warm',
    name: '暖色主題',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#B45309',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#92400E',
      textLight: '#B45309',
      success: '#059669',
      error: '#DC2626',
      chart: ['#F59E0B', '#D97706', '#B45309', '#D97706', '#B45309', '#F59E0B']
    }
  }
]

export const useTheme = () => {
  const currentTheme = ref<Theme>(themes[0])

  const setTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      currentTheme.value = theme
      await Preferences.set({ key: 'theme', value: themeId })
      
      // 更新 CSS 變數
      const root = document.documentElement
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--color-${key}`, value)
        }
      })
    }
  }

  const initTheme = async () => {
    const { value } = await Preferences.get({ key: 'theme' })
    if (value) {
      await setTheme(value)
    }
  }

  return {
    themes,
    currentTheme,
    setTheme,
    initTheme
  }
} 