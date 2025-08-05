<!-- components/ui/MonthSelector.vue -->
<template>
  <div 
    class="flex items-center justify-between p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-300"
    :style="containerStyle"
  >
    <button 
      class="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md"
      :style="buttonStyle"
      @click="$emit('previous')"
      :disabled="loading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <div class="text-center">
      <h2 
        class="text-lg font-semibold transition-all flex items-center justify-center gap-2"
        :style="textStyle"
      >
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </slot>
        {{ displayMonth }}
      </h2>
      <p 
        v-if="subtitle" 
        class="text-xs mt-1 opacity-70"
        :style="subtitleStyle"
      >
        {{ subtitle }}
      </p>
    </div>
    
    <button 
      class="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md"
      :style="buttonStyle"
      @click="$emit('next')"
      :disabled="loading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables'

interface Props {
  displayMonth: string
  subtitle?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  previous: []
  next: []
}>()

const { currentTheme } = useTheme()

const containerStyle = computed(() => ({
  background: `${currentTheme.value.colors.surface}E6`,
  backdropFilter: 'blur(6px)',
  border: `1px solid ${currentTheme.value.colors.primary}22`
}))

const buttonStyle = computed(() => ({
  background: currentTheme.value.colors.background,
  color: currentTheme.value.colors.primary,
  boxShadow: `0 2px 8px 0 ${currentTheme.value.colors.primary}11`
}))

const textStyle = computed(() => ({
  color: currentTheme.value.colors.text
}))

const subtitleStyle = computed(() => ({
  color: currentTheme.value.colors.textLight
}))
</script>
