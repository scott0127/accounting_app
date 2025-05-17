import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'
import dayjs from 'dayjs'

export interface FinancialGoal {
  id: string;
  type: 'savings' | 'expense' | 'income';
  amount: number;
  deadline: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export function useFinancialGoals() {
  const showFinancialGoalModal = ref(false)
  const financialGoals = ref<FinancialGoal[]>([])
  const goalType = ref<'savings' | 'expense' | 'income'>('savings')
  const goalAmount = ref(0)
  const goalDeadline = ref('1')

  // 初始化財務目標
  const initFinancialGoals = async (): Promise<void> => {
    const { value } = await Preferences.get({ key: 'financialGoals' })
    if (value) {
      financialGoals.value = JSON.parse(value)
    }
  }

  // 保存財務目標
  const saveFinancialGoal = async (): Promise<void> => {
    const goal: FinancialGoal = {
      id: Date.now().toString(),
      type: goalType.value,
      amount: Number(goalAmount.value),
      deadline: Number(goalDeadline.value),
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(Number(goalDeadline.value), 'month').format('YYYY-MM-DD'),
      progress: 0
    }
    
    financialGoals.value.push(goal)
    await Preferences.set({ key: 'financialGoals', value: JSON.stringify(financialGoals.value) })
    showFinancialGoalModal.value = false
    goalType.value = 'savings'
    goalAmount.value = 0
    goalDeadline.value = '1'
  }

  // 更新目標進度
  const updateGoalProgress = (goalId: string, progress: number): void => {
    const index = financialGoals.value.findIndex(g => g.id === goalId)
    if (index !== -1) {
      financialGoals.value[index].progress = progress
      Preferences.set({ key: 'financialGoals', value: JSON.stringify(financialGoals.value) })
    }
  }

  // 刪除目標
  const deleteGoal = async (goalId: string): Promise<void> => {
    financialGoals.value = financialGoals.value.filter(g => g.id !== goalId)
    await Preferences.set({ key: 'financialGoals', value: JSON.stringify(financialGoals.value) })
  }

  return {
    financialGoals,
    showFinancialGoalModal,
    goalType,
    goalAmount,
    goalDeadline,
    initFinancialGoals,
    saveFinancialGoal,
    updateGoalProgress,
    deleteGoal
  }
} 