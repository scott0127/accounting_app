/**
 * 統一表單處理 composable
 * 提供表單驗證、狀態管理和提交處理功能
 */
import { ref, reactive, computed, watch } from 'vue'
import { useErrorHandler } from './useErrorHandler'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface FieldConfig {
  rules?: ValidationRule[]
  initialValue?: any
  transform?: (value: any) => any
}

export interface FormConfig {
  [fieldName: string]: FieldConfig
}

export interface ValidationError {
  field: string
  message: string
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig,
  options: {
    validateOnChange?: boolean
    validateOnBlur?: boolean
    resetOnSubmit?: boolean
  } = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false
  } = options

  const errorHandler = useErrorHandler()

  // 表單數據
  const formData = reactive({} as T)
  const originalData = reactive({} as T)
  
  // 表單狀態
  const formErrors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const isSubmitting = ref(false)
  const isValidating = ref(false)

  // 初始化表單
  const initializeForm = () => {
    Object.keys(config).forEach(fieldName => {
      const fieldConfig = config[fieldName]
      const initialValue = fieldConfig.initialValue ?? ''
      
      ;(formData as any)[fieldName] = initialValue
      ;(originalData as any)[fieldName] = initialValue
      formErrors[fieldName] = ''
      touched[fieldName] = false
    })
  }

  // 計算屬性
  const isValid = computed(() => {
    return Object.values(formErrors).every(error => !error)
  })

  const isDirty = computed(() => {
    return Object.keys(formData).some(key => 
      (formData as any)[key] !== (originalData as any)[key]
    )
  })

  const hasErrors = computed(() => {
    return Object.values(formErrors).some(error => !!error)
  })

  const touchedFields = computed(() => {
    return Object.keys(touched).filter(key => touched[key])
  })

  // 驗證單個字段
  const validateField = (fieldName: string, value: any): string | null => {
    const fieldConfig = config[fieldName]
    if (!fieldConfig?.rules) return null

    for (const rule of fieldConfig.rules) {
      // 必填驗證
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rule.message || `${fieldName} 為必填項目`
      }

      // 如果值為空且不是必填，跳過其他驗證
      if (!value && !rule.required) continue

      // 最小長度驗證
      if (rule.minLength && String(value).length < rule.minLength) {
        return rule.message || `${fieldName} 長度不能少於 ${rule.minLength} 個字符`
      }

      // 最大長度驗證
      if (rule.maxLength && String(value).length > rule.maxLength) {
        return rule.message || `${fieldName} 長度不能超過 ${rule.maxLength} 個字符`
      }

      // 正則表達式驗證
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return rule.message || `${fieldName} 格式不正確`
      }

      // 自定義驗證
      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) return customError
      }
    }

    return null
  }

  // 驗證所有字段
  const validateForm = async (): Promise<boolean> => {
    isValidating.value = true
    
    try {
      const validationPromises = Object.keys(config).map(async (fieldName) => {
        const value = (formData as any)[fieldName]
        const error = validateField(fieldName, value)
        formErrors[fieldName] = error || ''
        return !error
      })

      const results = await Promise.all(validationPromises)
      return results.every(result => result)
    } finally {
      isValidating.value = false
    }
  }

  // 設置字段值
  const setFieldValue = (fieldName: string, value: any) => {
    const fieldConfig = config[fieldName]
    const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value
    
    ;(formData as any)[fieldName] = transformedValue

    // 即時驗證
    if (validateOnChange && touched[fieldName]) {
      const error = validateField(fieldName, transformedValue)
      formErrors[fieldName] = error || ''
    }
  }

  // 設置字段為已觸摸
  const setFieldTouched = (fieldName: string, isTouched = true) => {
    touched[fieldName] = isTouched

    // 失焦驗證
    if (validateOnBlur && isTouched) {
      const value = (formData as any)[fieldName]
      const error = validateField(fieldName, value)
      formErrors[fieldName] = error || ''
    }
  }

  // 設置字段錯誤
  const setFieldError = (fieldName: string, error: string) => {
    formErrors[fieldName] = error
  }

  // 清除字段錯誤
  const clearFieldError = (fieldName: string) => {
    formErrors[fieldName] = ''
  }

  // 清除所有錯誤
  const clearErrors = () => {
    Object.keys(formErrors).forEach(key => {
      formErrors[key] = ''
    })
  }

  // 重置表單
  const resetForm = () => {
    Object.keys(config).forEach(fieldName => {
      const initialValue = config[fieldName].initialValue ?? ''
      ;(formData as any)[fieldName] = initialValue
      ;(originalData as any)[fieldName] = initialValue
      formErrors[fieldName] = ''
      touched[fieldName] = false
    })
  }

  // 重置到原始狀態
  const resetToOriginal = () => {
    Object.keys(originalData).forEach(key => {
      ;(formData as any)[key] = (originalData as any)[key]
    })
    clearErrors()
  }

  // 設置表單數據
  const setFormData = (data: Partial<T>) => {
    Object.keys(data).forEach(key => {
      if (key in formData) {
        ;(formData as any)[key] = (data as any)[key]
        ;(originalData as any)[key] = (data as any)[key]
      }
    })
  }

  // 提交表單
  const handleSubmit = async <R>(
    onSubmit: (data: T) => Promise<R>,
    options: {
      skipValidation?: boolean
      onSuccess?: (result: R) => void
      onError?: (error: any) => void
    } = {}
  ): Promise<R | null> => {
    const { skipValidation = false, onSuccess, onError } = options

    try {
      isSubmitting.value = true
      errorHandler.clearError()

      // 標記所有字段為已觸摸
      Object.keys(config).forEach(key => {
        touched[key] = true
      })

      // 驗證表單
      if (!skipValidation) {
        const isFormValid = await validateForm()
        if (!isFormValid) {
          throw new Error('表單驗證失敗')
        }
      }

      // 提交數據
      const result = await onSubmit({ ...formData } as T)

      // 成功回調
      if (onSuccess) onSuccess(result)

      // 重置表單（如果需要）
      if (resetOnSubmit) {
        resetForm()
      }

      return result
    } catch (error) {
      errorHandler.setError(error, 'form-submit')
      if (onError) onError(error)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  // 獲取字段屬性（用於綁定到表單控件）
  const getFieldProps = (fieldName: string) => {
    return {
      value: (formData as any)[fieldName],
      error: formErrors[fieldName],
      touched: touched[fieldName],
      onChange: (value: any) => setFieldValue(fieldName, value),
      onBlur: () => setFieldTouched(fieldName, true),
      onFocus: () => setFieldTouched(fieldName, true)
    }
  }

  // 批量設置錯誤（用於服務器端驗證）
  const setServerErrors = (serverErrors: ValidationError[]) => {
    serverErrors.forEach(({ field, message }) => {
      if (field in formErrors) {
        formErrors[field] = message
      }
    })
  }

  // 監聽表單數據變化（可用於自動保存等功能）
  const watchFormData = (callback: (newData: T, oldData: T) => void) => {
    return watch(
      () => ({ ...formData }),
      (newData, oldData) => callback(newData as T, oldData as T),
      { deep: true }
    )
  }

  // 初始化
  initializeForm()

  return {
    // 數據
    formData: readonly(formData),
    formErrors: readonly(formErrors),
    touched: readonly(touched),

    // 狀態
    isValid,
    isDirty,
    hasErrors,
    isSubmitting: readonly(isSubmitting),
    isValidating: readonly(isValidating),
    touchedFields,

    // 方法
    setFieldValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearErrors,
    validateField,
    validateForm,
    resetForm,
    resetToOriginal,
    setFormData,
    handleSubmit,
    getFieldProps,
    setServerErrors,
    watchFormData,

    // 錯誤處理 (選擇性導出，避免衝突)
    setError: errorHandler.setError,
    clearError: errorHandler.clearError,
    getError: errorHandler.getError
  }
}

// 常用驗證規則
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || '此欄位為必填'
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || '請輸入有效的電子郵件地址'
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `長度不能少於 ${length} 個字符`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `長度不能超過 ${length} 個字符`
  }),

  number: (message?: string): ValidationRule => ({
    pattern: /^\d+$/,
    message: message || '請輸入有效的數字'
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value)
      return isNaN(num) || num <= 0 ? (message || '請輸入大於 0 的數字') : null
    }
  }),

  currency: (message?: string): ValidationRule => ({
    pattern: /^\d+(\.\d{1,2})?$/,
    message: message || '請輸入有效的金額（最多兩位小數）'
  })
}
