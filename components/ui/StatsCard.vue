<!-- components/ui/StatsCard.vue -->
<template>
  <div class="stats-card transition-all duration-300 hover:scale-105">
    <div 
      class="flex items-center justify-center h-12 w-12 rounded-full mb-3 transition-all duration-300 hover:scale-110 shadow-lg"
      :style="iconContainerStyle"
    >
      <slot name="icon">
        <component :is="iconComponent" class="h-6 w-6 text-white" />
      </slot>
    </div>
    <div>
      <p 
        class="text-sm font-medium"
        :style="labelStyle"
      >
        {{ label }}
      </p>
      <p 
        class="text-xl font-bold mt-1 transition-all duration-300"
        :style="valueStyle"
      >
        {{ formattedValue }}
      </p>
      <p 
        v-if="subtitle"
        class="text-xs mt-1 opacity-70"
        :style="subtitleStyle"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables'

interface Props {
  label: string
  value: number
  type: 'income' | 'expense' | 'balance' | 'budget'
  subtitle?: string
  formatCurrency?: boolean
  showTrend?: boolean
  trendValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  formatCurrency: true,
  showTrend: false
})

const { currentTheme } = useTheme()

const typeColorMap = computed(() => ({
  income: currentTheme.value.colors.success,
  expense: currentTheme.value.colors.error,
  balance: props.value >= 0 ? currentTheme.value.colors.success : currentTheme.value.colors.error,
  budget: currentTheme.value.colors.primary
}))

const iconComponent = computed(() => {
  const icons = {
    income: 'heroicons:arrow-trending-up',
    expense: 'heroicons:arrow-trending-down',
    balance: 'heroicons:scale',
    budget: 'heroicons:banknotes'
  }
  return icons[props.type]
})

const iconContainerStyle = computed(() => {
  const color = typeColorMap.value[props.type]
  return {
    background: `linear-gradient(135deg, ${color}, ${color}80)`
  }
})

const labelStyle = computed(() => ({
  color: currentTheme.value.colors.textLight
}))

const valueStyle = computed(() => ({
  color: typeColorMap.value[props.type]
}))

const subtitleStyle = computed(() => ({
  color: currentTheme.value.colors.textLight
}))

const formattedValue = computed(() => {
  if (props.formatCurrency) {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(props.value)
  }
  return props.value.toLocaleString()
})
</script>
