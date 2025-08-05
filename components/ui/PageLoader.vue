<!-- components/ui/PageLoader.vue -->
<template>
  <div class="page-loader" :style="containerStyle">
    <div class="loader-content">
      <div class="loader-spinner" :style="spinnerStyle">
        <div class="spinner-ring" :style="ringStyle"></div>
        <div class="spinner-ring" :style="ringStyle"></div>
        <div class="spinner-ring" :style="ringStyle"></div>
      </div>
      <p class="loader-text" :style="textStyle">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables'

interface Props {
  message?: string
  overlay?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  message: '載入中...',
  overlay: true,
  size: 'medium'
})

const { currentTheme } = useTheme()

const sizeMap = {
  small: '40px',
  medium: '60px',
  large: '80px'
}

const containerStyle = computed(() => {
  const baseStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: props.overlay ? '100vh' : '200px',
    width: '100%'
  }
  
  if (props.overlay) {
    return {
      ...baseStyle,
      position: 'fixed' as const,
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: currentTheme.value.colors.background + 'E6',
      backdropFilter: 'blur(4px)',
      zIndex: 9999
    }
  }
  
  return baseStyle
})

const spinnerStyle = computed(() => ({
  width: sizeMap[props.size],
  height: sizeMap[props.size],
  position: 'relative' as const
}))

const ringStyle = computed(() => ({
  position: 'absolute' as const,
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  border: `3px solid transparent`,
  borderTopColor: currentTheme.value.colors.primary,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}))

const textStyle = computed(() => ({
  color: currentTheme.value.colors.text,
  marginTop: '1rem',
  fontSize: '14px',
  fontWeight: '500'
}))
</script>

<style scoped>
.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
