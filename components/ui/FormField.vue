<!-- components/ui/FormField.vue -->
<template>
  <div class="form-field">
    <label 
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium mb-2 transition-colors duration-200"
      :style="labelStyle"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div 
        v-if="$slots.prefix || prefixIcon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
      >
        <slot name="prefix">
          <component :is="prefixIcon" class="h-5 w-5 opacity-60" />
        </slot>
      </div>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        class="form-input transition-all duration-200 focus:scale-105"
        :class="[
          inputClasses,
          hasPrefix ? 'pl-10' : 'pl-4',
          hasSuffix ? 'pr-10' : 'pr-4'
        ]"
        :style="inputStyle"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div 
        v-if="$slots.suffix || suffixIcon"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
      >
        <slot name="suffix">
          <component :is="suffixIcon" class="h-5 w-5 opacity-60" />
        </slot>
      </div>
    </div>
    
    <p 
      v-if="error"
      class="text-sm mt-1 transition-all duration-200"
      :style="errorStyle"
    >
      {{ error }}
    </p>
    
    <p 
      v-else-if="hint"
      class="text-sm mt-1 opacity-70"
      :style="hintStyle"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  prefixIcon?: string
  suffixIcon?: string
  min?: number
  max?: number
  step?: number
  variant?: 'default' | 'filled' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
}>()

const slots = useSlots()
const { currentTheme } = useTheme()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const hasPrefix = computed(() => Boolean(slots.prefix || props.prefixIcon))
const hasSuffix = computed(() => Boolean(slots.suffix || props.suffixIcon))

const inputClasses = computed(() => {
  const baseClasses = 'w-full py-3 rounded-xl border-2 font-medium focus:outline-none focus:ring-0'
  
  if (props.error) {
    return `${baseClasses} border-red-500 focus:border-red-600`
  }
  
  if (props.disabled) {
    return `${baseClasses} border-gray-300 bg-gray-100 cursor-not-allowed`
  }
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-blue-500',
    outline: 'border-2 border-gray-300 focus:border-blue-500'
  }
  
  return `${baseClasses} ${variantClasses[props.variant]}`
})

const labelStyle = computed(() => ({
  color: currentTheme.value.colors.text
}))

const inputStyle = computed(() => {
  if (props.disabled) {
    return {
      backgroundColor: currentTheme.value.colors.surface + '80',
      color: currentTheme.value.colors.textLight,
      borderColor: currentTheme.value.colors.textLight + '40'
    }
  }
  
  return {
    backgroundColor: currentTheme.value.colors.surface,
    color: currentTheme.value.colors.text,
    borderColor: props.error 
      ? currentTheme.value.colors.error 
      : currentTheme.value.colors.textLight + '60'
  }
})

const errorStyle = computed(() => ({
  color: currentTheme.value.colors.error
}))

const hintStyle = computed(() => ({
  color: currentTheme.value.colors.textLight
}))

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = () => {
  emit('blur')
}

const handleFocus = () => {
  emit('focus')
}
</script>

<style scoped>
.form-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
