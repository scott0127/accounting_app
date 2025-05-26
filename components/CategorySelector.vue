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
        class="flex flex-col items-center p-3 rounded-xl shadow-sm border border-transparent transition duration-150 hover:shadow-md hover:border-blue-200 group"
        :class="modelValue === category.id ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-blue-50'"
        @click="$emit('update:modelValue', category.id)"
      >
        <span class="text-2xl mb-1 transition-transform duration-150" :class="modelValue === category.id ? 'scale-110' : 'scale-100'">{{ category.icon }}</span>
        <span class="text-xs font-medium transition-colors duration-150" :class="modelValue === category.id ? 'text-blue-700' : 'text-gray-700'">{{ category.name }}</span>
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

defineProps<{
  modelValue: string;
  categories: Category[];
  type: 'income' | 'expense';
  typeSwitchable?: boolean;
  label?: string;
}>();

defineEmits(['update:modelValue', 'update:type']);
</script>