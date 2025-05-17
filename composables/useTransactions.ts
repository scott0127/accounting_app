import { ref, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import dayjs from 'dayjs'

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export function useTransactions(currentMonth: any) {
  const store = useTransactionStore()
  const showAddTransactionModal = ref(false)
  const showEditTransactionModal = ref(false)
  const showAllTransactions = ref(false)

  const newTransaction = ref<Transaction>({
    id: '',
    type: 'expense',
    category: '',
    amount: 0,
    date: dayjs().format('YYYY-MM-DD')
  })

  const editingTransaction = ref<Transaction | null>(null)

  // 添加交易
  const addTransaction = (): void => {
    const transaction = {
      ...newTransaction.value,
      id: Date.now().toString(),
      amount: Number(newTransaction.value.amount)
    }
    
    store.addTransaction(transaction)
    showAddTransactionModal.value = false
    resetNewTransaction()
  }
  
  // 重置新交易表單
  const resetNewTransaction = (): void => {
    newTransaction.value = {
      id: '',
      type: 'expense',
      category: '',
      amount: 0,
      date: dayjs().format('YYYY-MM-DD'),
      description: ''
    }
  }

  // 編輯交易
  const editTransaction = (transaction: Transaction): void => {
    editingTransaction.value = { ...transaction }
    showEditTransactionModal.value = true
  }

  // 更新交易
  const updateTransaction = (): void => {
    if (editingTransaction.value) {
      store.updateTransaction(editingTransaction.value.id, editingTransaction.value)
      showEditTransactionModal.value = false
      editingTransaction.value = null
    }
  }

  // 複製交易
  const duplicateTransaction = (transaction: Transaction): void => {
    const duplicate = { ...transaction, id: Date.now().toString() }
    store.addTransaction(duplicate)
  }

  // 刪除交易
  const deleteTransaction = (transactionId: string): void => {
    store.deleteTransaction(transactionId)
  }

  // 最近交易
  const recentTransactions = computed(() => {
    return store.transactions
      .filter(t => t.date.startsWith(currentMonth.value))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })
  
  // 顯示交易
  const displayTransactions = computed(() => {
    if (showAllTransactions.value) {
      return store.transactions
        .filter(t => t.date.startsWith(currentMonth.value))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      return recentTransactions.value
    }
  })

  // 按類型過濾類別
  const categoriesByType = (type: 'income' | 'expense') => {
    return store.categories.filter(c => c.type === type)
  }

  // 獲取類別圖標
  const getCategoryIcon = (categoryId: string): string => {
    return store.categories.find(c => c.id === categoryId)?.icon || '📝'
  }

  // 獲取類別名稱
  const getCategoryName = (categoryId: string): string => {
    return store.categories.find(c => c.id === categoryId)?.name || categoryId
  }

  return {
    showAddTransactionModal,
    showEditTransactionModal,
    showAllTransactions,
    newTransaction,
    editingTransaction,
    recentTransactions,
    displayTransactions,
    addTransaction,
    editTransaction,
    updateTransaction,
    duplicateTransaction,
    deleteTransaction,
    categoriesByType,
    getCategoryIcon,
    getCategoryName
  }
} 