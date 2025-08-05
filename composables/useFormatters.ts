import { formatAmount, formatDate as utilFormatDate } from '~/utils/formatters'

export const useFormatters = () => {
  const formatCurrency = (amount: number): string => {
    return formatAmount(amount)
  }

  const formatDate = (date: string | Date, format: string = 'M/D'): string => {
    const dateStr = date instanceof Date ? date.toISOString() : date
    return utilFormatDate(dateStr, format)
  }

  return {
    formatCurrency,
    formatDate
  }
}
