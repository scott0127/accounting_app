<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <label v-if="label" class="block text-sm text-gray-600 mb-2">{{ label }}</label>
    <input
      v-model="inputValue"
      type="date"
      :max="max"
      :min="min"
      :required="required"
      class="w-full text-lg focus:outline-none"
      @input="$emit('update:modelValue', inputValue)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  modelValue: string,
  label?: string,
  max?: string,
  min?: string,
  required?: boolean
}>();
const emit = defineEmits(['update:modelValue']);
const inputValue = ref(props.modelValue);
watch(() => props.modelValue, v => inputValue.value = v);
</script>
