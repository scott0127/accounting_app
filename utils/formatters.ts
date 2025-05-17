import dayjs from 'dayjs'

/**
 * 格式化貨幣金額
 * @param amount - 金額數值
 * @returns 格式化的貨幣字符串
 */
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

/**
 * 格式化日期
 * @param date - 日期字符串
 * @param format - 輸出格式(可選)
 * @returns 格式化的日期字符串
 */
export const formatDate = (date: string, format: string = 'M/D'): string => {
  return dayjs(date).format(format)
}

/**
 * 計算百分比
 * @param amount - 數量
 * @param total - 總量
 * @param decimals - 小數位數(可選)
 * @returns 格式化的百分比字符串
 */
export const calculatePercentage = (amount: number, total: number, decimals: number = 1): string => {
  if (total === 0) return '0'
  return ((amount / total) * 100).toFixed(decimals)
} 