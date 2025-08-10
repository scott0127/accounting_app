<!-- components/ui/ThemeCard.vue -->
<template>
  <div 
    class="rounded-2xl shadow-lg p-6 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
    :class="[
      variant === 'gradient' && 'bg-gradient-to-br',
      variant === 'glass' && 'backdrop-blur-md',
      size === 'sm' && 'p-4',
      size === 'lg' && 'p-8'
    ]"
    :style="containerStyle"
  >
    <!-- 背景裝飾元素 -->
    <div 
      v-if="showDecoration"
      class="absolute inset-0 opacity-5 pointer-events-none"
    >
      <div 
        class="absolute -right-8 -top-8 w-32 h-32 rounded-full"
        :style="decorationStyle.primary"
      />
      <div 
        class="absolute -left-4 -bottom-6 w-16 h-16 rounded-full"
        :style="decorationStyle.secondary"
      />
    </div>

    <!-- 標題區域 -->
    <div 
      v-if="title || $slots.header"
      class="flex items-center justify-between mb-4 relative z-10"
    >
      <h3 
        v-if="title"
        class="text-lg font-bold flex items-center gap-2"
        :style="titleStyle"
      >
        <span 
          v-if="showTitleAccent"
          class="inline-block w-1 h-6 rounded-full"
          :style="accentStyle"
        />
        <slot name="icon" />
        {{ title }}
      </h3>
      <slot name="header" />
    </div>

    <!-- 主要內容 -->
    <div class="relative z-10">
      <slot />
    </div>

    <!-- 操作按鈕區域 -->
    <div 
      v-if="$slots.actions"
      class="mt-6 relative z-10"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'solid' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'error' | 'neutral'
  showDecoration?: boolean
  showTitleAccent?: boolean
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  size: 'md',
  color: 'primary',
  showDecoration: true,
  showTitleAccent: true
})

const { currentTheme } = useTheme()

const colorMap = computed(() => ({
  primary: currentTheme.value.colors.primary,
  success: currentTheme.value.colors.success,
  error: currentTheme.value.colors.error,
  neutral: currentTheme.value.colors.text
}))

const containerStyle = computed(() => {
  const baseStyle = {
    border: `1px solid ${props.borderColor || currentTheme.value.colors.primary}22`
  }

  switch (props.variant) {
    case 'gradient':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${currentTheme.value.colors.surface} 20%, ${colorMap.value[props.color]}20)`
      }
    case 'glass':
      return {
        ...baseStyle,
        background: `${currentTheme.value.colors.surface}CC`,
        backdropFilter: 'blur(8px)'
      }
    default:
      return {
        ...baseStyle,
        background: currentTheme.value.colors.surface
      }
  }
})

const titleStyle = computed(() => ({
  color: currentTheme.value.colors.text
}))

const accentStyle = computed(() => ({
  background: colorMap.value[props.color]
}))

const decorationStyle = computed(() => ({
  primary: {
    background: `radial-gradient(circle, ${colorMap.value[props.color]}, ${currentTheme.value.colors.accent})`
  },
  secondary: {
    background: `radial-gradient(circle, ${currentTheme.value.colors.accent}, ${colorMap.value[props.color]})`
  }
}))
</script>
