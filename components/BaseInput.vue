<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <label v-if="label" class="block text-sm text-gray-600 mb-2">{{ label }}</label>
    <input
      v-model="inputValue"
      :type="type"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :disabled="disabled"
      :required="required"
      :class="inputClass"
      @input="$emit('update:modelValue', inputValue)"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  modelValue: string | number,
  label?: string,
  placeholder?: string,
  type?: string,
  inputmode?: string,
  min?: string | number,
  max?: string | number,
  disabled?: boolean,
  required?: boolean,
  inputClass?: string
}>();
const emit = defineEmits(['update:modelValue']);
const inputValue = ref(props.modelValue);
watch(() => props.modelValue, v => inputValue.value = v);
</script>
