import { ref, onMounted, onUnmounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import dayjs from 'dayjs'

// 教學步驟類型
export interface TutorialStep {
  title: string;
  description: string;
}

export function useUI() {
  const currentMonth = ref(dayjs().format('YYYY-MM'))
  const isLandscape = ref(false)
  const showSmallScreenTooltips = ref(false)
  const showTooltip = ref('')
  const showTutorial = ref(false)
  const tutorialStep = ref(0)

  // 教學步驟
  const tutorialSteps: TutorialStep[] = [
    { title: '歡迎使用財務管理應用', description: '這個應用將幫助您追蹤和管理個人財務。' },
    { title: '財務健康度', description: '這裡顯示您本月的財務狀況概覽。' },
    { title: '收支分析', description: '圖表顯示您的收入和支出分類。' },
    { title: '預算設置', description: '設定每月預算來管理您的支出。' },
    { title: '交易記錄', description: '查看和管理您的所有交易記錄。' },
    { title: '財務目標', description: '設定儲蓄目標來實現您的財務計劃。' }
  ]

  // 檢查屏幕方向
  const checkOrientation = (): void => {
    isLandscape.value = window.innerWidth > window.innerHeight
  }

  // 設置滑動監聽
  const setupSwipeListeners = (previousMonthFn: Function, nextMonthFn: Function): void => {
    let touchStartX = 0
    let touchEndX = 0
    
    const handleTouchStart = (e: TouchEvent): void => {
      touchStartX = e.touches[0].clientX
    }
    
    const handleTouchEnd = (e: TouchEvent): void => {
      touchEndX = e.changedTouches[0].clientX
      handleSwipe()
    }
    
    const handleSwipe = (): void => {
      if (touchStartX - touchEndX > 50) {
        // 向左滑動
        nextMonthFn()
      }
      
      if (touchEndX - touchStartX > 50) {
        // 向右滑動
        previousMonthFn()
      }
    }
    
    document.addEventListener('touchstart', handleTouchStart, false)
    document.addEventListener('touchend', handleTouchEnd, false)

    // 確保移除事件監聽器
    onUnmounted(() => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    })
  }

  // 檢查是否為新用戶
  const checkIfNewUser = async (): Promise<void> => {
    const { value } = await Preferences.get({ key: 'hasSeenTutorial' })
    if (!value) {
      showTutorial.value = true
      await Preferences.set({ key: 'hasSeenTutorial', value: 'true' })
    }
  }

  // 下一個教學步驟
  const nextTutorialStep = (): void => {
    if (tutorialStep.value < tutorialSteps.length - 1) {
      tutorialStep.value++
    } else {
      showTutorial.value = false
    }
  }

  // 顯示提示
  const showTooltipInfo = (key: string, duration: number = 3000): void => {
    showTooltip.value = key
    setTimeout(() => {
      showTooltip.value = ''
    }, duration)
  }

  // 配置小屏幕
  const configureForSmallScreens = (): void => {
    if (window.innerWidth < 640) {
      showSmallScreenTooltips.value = true
    }
  }

  // 月份顯示
  const currentMonthDisplay = computed(() => {
    return dayjs(currentMonth.value).format('YYYY年M月')
  })

  // 月份切換
  const previousMonth = (): void => {
    currentMonth.value = dayjs(currentMonth.value).subtract(1, 'month').format('YYYY-MM')
  }

  const nextMonth = (): void => {
    currentMonth.value = dayjs(currentMonth.value).add(1, 'month').format('YYYY-MM')
  }

  // 返回當月
  const goToCurrentMonth = (): void => {
    currentMonth.value = dayjs().format('YYYY-MM')
  }

  // 初始化UI
  onMounted(() => {
    window.addEventListener('resize', checkOrientation)
    checkOrientation()
    configureForSmallScreens()
    checkIfNewUser()
  })

  // 清理
  onUnmounted(() => {
    window.removeEventListener('resize', checkOrientation)
  })

  return {
    currentMonth,
    currentMonthDisplay,
    isLandscape,
    showSmallScreenTooltips,
    showTooltip,
    showTutorial,
    tutorialStep,
    tutorialSteps,
    previousMonth,
    nextMonth,
    goToCurrentMonth,
    setupSwipeListeners,
    nextTutorialStep,
    showTooltipInfo
  }
} 