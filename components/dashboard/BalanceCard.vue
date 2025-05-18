<template>  <div class="rounded-xl shadow-sm p-4" :style="{ backgroundColor: currentTheme.colors.surface }">
    <h3 class="text-base font-semibold mb-2" :style="{ color: currentTheme.colors.text }">當月盈虧</h3>
    <div class="flex flex-col items-center justify-center h-48">
      <p class="text-2xl font-bold" :class="balanceColor">
        {{ balance >= 0 ? '+' : '' }}{{ formattedAmount }}
      </p>
      <p class="text-sm mt-2" :style="{ color: currentTheme.colors.textLight }">
        {{ balance >= 0 ? '本月有結餘' : '本月超支' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { currentTheme } = useTheme()

const props = defineProps({
  balance: {
    type: Number,
    required: true
  },
  formattedAmount: {
    type: String,
    required: true
  },
  balanceColor: {
    type: String,
    default: 'text-gray-500'
  }
})
</script>