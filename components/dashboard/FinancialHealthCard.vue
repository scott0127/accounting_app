<template>
  <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold mb-1">本月財務健康度</h2>
        <div :class="healthClass" class="inline-block px-3 py-1 rounded-full text-sm font-medium">
          {{ healthStatus }}
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ healthAdvice }}</p>
      </div>
      <div class="text-3xl">{{ healthEmoji }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  healthClass: {
    type: String,
    required: true
  },
  healthStatus: {
    type: String,
    required: true
  },
  healthAdvice: {
    type: String,
    required: true
  },
  healthEmoji: {
    type: String,
    required: true
  }
})
</script> 