<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 transition-all group/item hover:shadow-md rounded-xl"
    :style="`
      border-color: ${currentTheme.colors.primary}22;
      background: transparent;
    `"
    @click="$emit('edit', transaction)"
  >
    <div class="flex items-center gap-3 mb-2 sm:mb-0">
      <span
        class="text-xl flex items-center justify-center rounded-full shadow-sm transition-all"
        :style="`
          color: ${transaction.type === 'income' ? currentTheme.colors.success : currentTheme.colors.error};
          background: ${transaction.type === 'income' ? currentTheme.colors.success + '18' : currentTheme.colors.error + '18'};
          box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
          width: 2.5rem; height: 2.5rem;
        `"
      >
        {{ getCategoryIcon(primaryCategoryId) }}
      </span>

      <div class="min-w-0">
        <!-- 第一行：主分類 + 型別徽章 + 次要分類標籤（在型別徽章右側） -->
        <div class="flex items-center flex-wrap gap-2">
          <p class="font-medium truncate" :style="`color: ${currentTheme.colors.text}`">
            {{ getCategoryName(primaryCategoryId) }}
          </p>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap"
            :style="`
              background: ${transaction.type === 'income' ? currentTheme.colors.success + '14' : currentTheme.colors.error + '14'};
              color: ${transaction.type === 'income' ? currentTheme.colors.success : currentTheme.colors.error};
              border-color: ${transaction.type === 'income' ? currentTheme.colors.success + '33' : currentTheme.colors.error + '33'};
            `"
          >
            {{ transaction.type === 'income' ? '收入' : '支出' }}
          </span>
          <template v-for="secId in secondaryCategoryIds" :key="secId">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap"
              :style="`
                background: ${currentTheme.colors.primary}14;
                color: ${currentTheme.colors.textLight};
                border-color: ${currentTheme.colors.primary}26;
              `"
            >
              {{ getCategoryName(secId) }}
            </span>
          </template>
        </div>
        <!-- 第二行：日期（可改為描述） -->
        <p class="text-xs truncate mt-1" :style="`color: ${currentTheme.colors.textLight}`">
          {{ formatDate(transaction.date) }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
      <span
        class="font-semibold mr-3 tabular-nums tracking-tight whitespace-nowrap"
        :style="`color: ${transaction.type === 'income' ? currentTheme.colors.success : currentTheme.colors.error}`"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
      </span>
      <div class="flex space-x-2" v-if="showActions">
        <button
          @click.stop="$emit('edit', transaction)"
          class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
          :style="`
            color: ${currentTheme.colors.textLight};
            background: ${currentTheme.colors.primary}10;
            box-shadow: 0 2px 8px 0 ${currentTheme.colors.primary}11;
          `"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6H3v6z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('duplicate', transaction)"
          class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
          :style="`
            color: ${currentTheme.colors.textLight};
            background: ${currentTheme.colors.accent}10;
            box-shadow: 0 2px 8px 0 ${currentTheme.colors.accent}11;
          `"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-8-4h8" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', transaction.id)"
          class="p-1.5 rounded-full transition-all hover:scale-110 hover:shadow-md"
          :style="`
            color: ${currentTheme.colors.error};
            background: ${currentTheme.colors.error}10;
            box-shadow: 0 2px 8px 0 ${currentTheme.colors.error}11;
          `"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables/useTheme'

const props = withDefaults(defineProps<{
  transaction: any,
  getCategoryIcon: (id: string) => string,
  getCategoryName: (id: string) => string,
  formatDate: (d: string) => string,
  formatCurrency: (n: number) => string,
  showActions?: boolean,
}>(), {
  showActions: true,
})

const emit = defineEmits<{
  (e: 'edit', tx: any): void
  (e: 'duplicate', tx: any): void
  (e: 'delete', id: string): void
}>()

const { currentTheme } = useTheme()

const primaryCategoryId = computed(() => (props.transaction?.category_ids && props.transaction.category_ids[0]) || props.transaction?.category_id || '')

const secondaryCategoryIds = computed(() => {
  const ids = Array.isArray(props.transaction?.category_ids) ? props.transaction.category_ids : []
  return ids.length > 1 ? ids.slice(1, 3).filter(Boolean) : []
})

const getCategoryIcon = props.getCategoryIcon
const getCategoryName = props.getCategoryName
const formatDate = props.formatDate
const formatCurrency = props.formatCurrency
</script>
