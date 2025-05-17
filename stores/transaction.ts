import { defineStore } from 'pinia'
import type { Transaction, Category, MonthlyStats } from '~/types'
import { Preferences } from '@capacitor/preferences'

interface State {
  transactions: Transaction[]
  categories: Category[]
  initialized: boolean
}

export const useTransactionStore = defineStore('transaction', {
  state: (): State => ({
    transactions: [] as Transaction[],
    categories: [
      { id: 'food', name: '飲食', type: 'expense', icon: '🍴' },
      { id: 'transport', name: '交通', type: 'expense', icon: '🚗' },
      { id: 'shopping', name: '購物', type: 'expense', icon: '🛍️' },
      { id: 'entertainment', name: '娛樂', type: 'expense', icon: '🎮' },
      { id: 'health', name: '醫療', type: 'expense', icon: '💊' },
      { id: 'housing', name: '住房', type: 'expense', icon: '🏠' },
      { id: 'utility', name: '水電瓦斯', type: 'expense', icon: '💡' },
      { id: 'communication', name: '通訊', type: 'expense', icon: '📱' },
      { id: 'education', name: '教育', type: 'expense', icon: '📚' },
      { id: 'insurance', name: '保險', type: 'expense', icon: '🛡️' },
      { id: 'tax', name: '稅金', type: 'expense', icon: '💸' },
      { id: 'parental', name: '孝親', type: 'expense', icon: '👵' },
      { id: 'children', name: '小孩', type: 'expense', icon: '🧒' },
      { id: 'pet', name: '寵物', type: 'expense', icon: '🐶' },
      { id: 'travel', name: '旅遊', type: 'expense', icon: '✈️' },
      { id: 'social', name: '交際', type: 'expense', icon: '🤝' },
      { id: 'beauty', name: '美容', type: 'expense', icon: '💅' },
      { id: 'sports', name: '運動', type: 'expense', icon: '🏃' },
      { id: 'other', name: '其他', type: 'expense', icon: '🔖' },
      { id: 'salary', name: '薪資', type: 'income', icon: '💰' },
      { id: 'bonus', name: '獎金', type: 'income', icon: '🎁' },
      { id: 'investment', name: '投資', type: 'income', icon: '📈' },
      { id: 'interest', name: '利息', type: 'income', icon: '🏦' },
      { id: 'refund', name: '退款', type: 'income', icon: '↩️' },
      { id: 'other_income', name: '其他收入', type: 'income', icon: '🪙' },
    ] as Category[],
    initialized: false
  }),

  getters: {
    getMonthlyStats: (state: State) => (month: string): MonthlyStats => {
      const monthTransactions = state.transactions.filter(t => t.date.startsWith(month))
      
      const stats: MonthlyStats = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: {}
      }

      monthTransactions.forEach(t => {
        if (t.type === 'income') {
          stats.totalIncome += t.amount
        } else {
          stats.totalExpense += t.amount
        }
        
        if (!stats.categories[t.category]) {
          stats.categories[t.category] = 0
        }
        stats.categories[t.category] += t.amount
      })

      stats.balance = stats.totalIncome - stats.totalExpense
      return stats
    }
  },

  actions: {
    async initialize() {
      if (this.initialized) return

      try {
        console.log('Initializing store...')
        const { value } = await Preferences.get({ key: 'transactions' })
        console.log('Loaded transactions:', value)
        
        if (value) {
          const parsedTransactions = JSON.parse(value)
          this.$patch((state) => {
            state.transactions = parsedTransactions
            state.initialized = true
          })
        } else {
          this.$patch((state) => {
            state.initialized = true
          })
        }
      } catch (error) {
        console.error('Error loading transactions:', error)
        this.$patch((state) => {
          state.initialized = true
        })
      }
    },

    async saveTransactions() {
      try {
        console.log('Saving transactions...')
        await Preferences.set({
          key: 'transactions',
          value: JSON.stringify(this.transactions)
        })
        console.log('Transactions saved successfully')
      } catch (error) {
        console.error('Error saving transactions:', error)
        throw error
      }
    },

    async addTransaction(transaction: Omit<Transaction, 'id'>) {
      try {
        const id = Date.now().toString()
        const newTransaction = { ...transaction, id }
        
        this.$patch((state) => {
          state.transactions.push(newTransaction)
        })
        
        await this.saveTransactions()
        return newTransaction
      } catch (error) {
        console.error('Error adding transaction:', error)
        throw error
      }
    },

    async deleteTransaction(id: string) {
      try {
        const index = this.transactions.findIndex((t: Transaction) => t.id === id)
        if (index > -1) {
          this.$patch((state) => {
            state.transactions.splice(index, 1)
          })
          await this.saveTransactions()
        }
      } catch (error) {
        console.error('Error deleting transaction:', error)
        throw error
      }
    },

    async updateTransaction(id: string, updates: Partial<Transaction>) {
      try {
        const transaction = this.transactions.find((t: Transaction) => t.id === id)
        if (transaction) {
          this.$patch((state) => {
            const index = state.transactions.findIndex(t => t.id === id)
            if (index > -1) {
              state.transactions[index] = { ...transaction, ...updates }
            }
          })
          await this.saveTransactions()
        }
      } catch (error) {
        console.error('Error updating transaction:', error)
        throw error
      }
    }
  }
})