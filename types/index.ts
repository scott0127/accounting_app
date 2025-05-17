export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  note?: string
  description?: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
}

export interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  balance: number
  categories: {
    [key: string]: number
  }
} 