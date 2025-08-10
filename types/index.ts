export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  /**
   * 相容舊欄位：單一分類（相容期內保留）
   */
  category_id?: string
  /**
   * 新欄位：最多 3 個分類，前端統計以第一個為主，其餘僅作為輔助顯示
   */
  category_ids?: string[]
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