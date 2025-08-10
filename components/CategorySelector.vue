<template>
  <div>
    <label v-if="label" class="block text-sm text-gray-600 mb-4 font-semibold tracking-wide">
      {{ label }}
    </label>
    <div v-if="typeSwitchable" class="flex space-x-2 mb-4">
      <button
        type="button"
        class="px-4 py-1 rounded-full text-xs font-semibold shadow transition duration-150"
        :class="type === 'expense' ? 'bg-red-100 text-red-700 ring-2 ring-red-300' : 'bg-gray-100 text-gray-600 hover:bg-red-50'"
        @click="$emit('update:type', 'expense')"
      >
        支出
      </button>
      <button
        type="button"
        class="px-4 py-1 rounded-full text-xs font-semibold shadow transition duration-150"
        :class="type === 'income' ? 'bg-green-100 text-green-700 ring-2 ring-green-300' : 'bg-gray-100 text-gray-600 hover:bg-green-50'"
        @click="$emit('update:type', 'income')"
      >
        收入
      </button>
    </div>
  <div class="grid grid-cols-4 gap-4">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
    class="flex flex-col items-center p-3 rounded-xl shadow-sm border border-transparent transition duration-150 hover:shadow-md hover:border-blue-200 group relative"
    :class="isSelected(category.id) ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-blue-50'"
    @click="toggle(category.id)"
      >
  <span class="text-2xl mb-1 transition-transform duration-150" :class="isSelected(category.id) ? 'scale-110' : 'scale-100'">{{ category.icon }}</span>
  <span class="text-xs font-medium transition-colors duration-150" :class="isSelected(category.id) ? 'text-blue-700' : 'text-gray-700'">{{ category.name }}</span>
    <span v-if="multiple && isSelected(category.id)"
        class="absolute top-1 right-1 text-[10px] bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
      {{ selectionIndex(category.id) + 1 }}
    </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Category {
  id: string;
  name: string;
  icon?: string;
  type: 'income' | 'expense';
}

const props = defineProps<{
  modelValue: string | string[];
  categories: Category[];
  type: 'income' | 'expense';
  typeSwitchable?: boolean;
  label?: string;
  multiple?: boolean;
  maxSelection?: number;
}>();

const emit = defineEmits(['update:modelValue', 'update:type']);

const multiple = computed(() => props.multiple === true)
const maxSelection = computed(() => props.maxSelection ?? 3)

const isSelected = (id: string) => {
  if (!multiple.value) return props.modelValue === id
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  return arr.includes(id)
}

const selectionIndex = (id: string) => {
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  return arr.indexOf(id)
}

const toggle = (id: string) => {
  if (!multiple.value) {
    emit('update:modelValue', id)
    return
  }
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const idx = current.indexOf(id)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    if (current.length >= maxSelection.value) return
    current.push(id)
  }
  emit('update:modelValue', current)
}
</script>