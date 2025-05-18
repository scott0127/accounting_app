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
    name: '湛藍天空',
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#6366F1',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textLight: '#64748B',
      success: '#10B981',
      error: '#F43F5E',
      chart: ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    }
  },
  {
    id: 'dark',
    name: '深夜星空',
    colors: {
      primary: '#60A5FA',
      secondary: '#818CF8',
      accent: '#A78BFA',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textLight: '#94A3B8',
      success: '#34D399',
      error: '#FB7185',
      chart: ['#60A5FA', '#818CF8', '#A78BFA', '#34D399', '#FBBF24', '#FB7185']
    }
  },
  {
    id: 'nature',
    name: '清新綠野',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#064E3B',
      textLight: '#047857',
      success: '#059669',
      error: '#E11D48',
      chart: ['#059669', '#10B981', '#047857', '#34D399', '#059669', '#065F46']
    }
  },
  {
    id: 'warm',
    name: '暖陽時光',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FDBA74',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#7C2D12',
      textLight: '#9A3412',
      success: '#16A34A',
      error: '#DC2626',
      chart: ['#F97316', '#FB923C', '#FDBA74', '#F59E0B', '#EAB308', '#CA8A04']
    }
  },
  {
    id: 'berry',
    name: '莓果甜心',
    colors: {
      primary: '#DB2777',
      secondary: '#EC4899',
      accent: '#F472B6',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      text: '#831843',
      textLight: '#BE185D',
      success: '#10B981',
      error: '#DC2626',
      chart: ['#DB2777', '#EC4899', '#F472B6', '#A21CAF', '#C026D3', '#E879F9']
    }
  },
  {
    id: 'ocean',
    name: '海洋之心',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      background: '#ECFEFF',
      surface: '#FFFFFF',
      text: '#155E75',
      textLight: '#0E7490',
      success: '#10B981',
      error: '#E11D48',
      chart: ['#0891B2', '#06B6D4', '#22D3EE', '#0284C7', '#0369A1', '#0EA5E9']
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
        } else if (Array.isArray(value) && key === 'chart') {
          // 設定圖表顏色
          value.forEach((color, index) => {
            root.style.setProperty(`--color-chart-${index + 1}`, color)
          })
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