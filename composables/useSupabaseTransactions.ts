// composables/useSupabaseTransactions.ts
import { ref, computed, watch } from "vue";
import { useSupabase } from "./useSupabase";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { useErrorHandler } from "./useErrorHandler";
import type { Transaction, Category, MonthlyStats } from "~/types";
import { Preferences } from '@capacitor/preferences'

// Module-scope singleton state to avoid duplicate instances/fetches
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const initialized = ref(false)
let inflightFetch: Promise<Transaction[] | null> | null = null
let lastFetchedAt: number | null = null
let lastUserId: string | null = null
const FETCH_TTL_MS = 30_000 // 30 秒 TTL，短期快取以降低重複請求

// 本地快取（以使用者為 Key）
const cacheKeyForUser = (uid: string) => `supabase:transactions:${uid}`
const loadCachedTransactions = async (uid: string) => {
  try {
    const { value } = await Preferences.get({ key: cacheKeyForUser(uid) })
    if (value) {
      const parsed: Transaction[] = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length > 0 && transactions.value.length === 0) {
        transactions.value = parsed
      }
    }
  } catch (e) {
    console.warn('Load cached transactions failed', e)
  }
}
const saveCachedTransactions = async (uid: string, data: Transaction[]) => {
  try {
    await Preferences.set({ key: cacheKeyForUser(uid), value: JSON.stringify(data) })
  } catch (e) {
    console.warn('Save cached transactions failed', e)
  }
}

// 正規化：確保 category_ids 與 category_id 一致，且日期為 YYYY-MM-DD
const normalizeTransaction = (raw: any): Transaction => {
  const ids: string[] = Array.isArray(raw.category_ids)
    ? raw.category_ids.filter(Boolean)
    : (raw.category_id ? [raw.category_id] : [])

  const primary = ids[0] || raw.category_id || ''

  return {
    id: String(raw.id),
    amount: Number(raw.amount),
    type: (raw.type === 'income' ? 'income' : 'expense'),
    category_id: primary || undefined,
    category_ids: ids.length ? ids.slice(0, 3) : undefined,
    date: new Date(raw.date).toISOString().split('T')[0],
    description: raw.description || '',
  note: (raw.note ?? (raw.description || ''))
  }
}

const normalizeTransactions = (rows: any[]): Transaction[] => rows.map(normalizeTransaction)

export function useSupabaseTransactions() {
  const supabase = useSupabase();
  const { user } = useSupabaseAuth();
  const errorHandler = useErrorHandler({
    showNotifications: true,
    logErrors: true,
    defaultMessage: '交易操作失敗'
  });

  // 計算屬性
  const hasTransactions = computed(() => transactions.value.length > 0);
  const transactionCount = computed(() => transactions.value.length);

  // 獲取類別
  const fetchCategories = async () => {
    return await errorHandler.withErrorHandling(
      async () => {
        const { data, error: err } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (err) throw err;
        categories.value = data as Category[];
        return data;
      },
      {
        context: '獲取類別',
        loadingState: false
      }
    );
  };

  // 初始化
  const initialize = async () => {
    if (initialized.value) return;

    return await errorHandler.withErrorHandling(
      async () => {
        // 先以快取回填（若有），再並行撈取最新
        if (user.value) {
          await loadCachedTransactions(user.value.id)
        }
        await Promise.all([
          fetchCategories(),
          user.value ? fetchTransactions() : Promise.resolve(null)
        ])

        initialized.value = true;
      },
      {
        context: '初始化交易模組',
        loadingState: true
      }
    );
  };
  // 獲取交易資料
  const fetchTransactions = async () => {
    if (!user.value) {
      transactions.value = [];
      return;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        const now = Date.now()
        const uid = user.value!.id

        // 短期快取：同一使用者且在 TTL 內且已有資料，直接返回現有資料
        if (
          lastUserId === uid &&
          lastFetchedAt &&
          now - lastFetchedAt < FETCH_TTL_MS &&
          transactions.value.length > 0
        ) {
          return transactions.value
        }

        // 合併同時進行中的請求
        if (inflightFetch) {
          return await inflightFetch
        }

    loading.value = true;
    inflightFetch = (async () => {
          const { data, error: err } = await supabase
            .from("transactions")
      .select("id, amount, type, category_id, category_ids, date, description, user_id")
            .eq("user_id", uid)
            .order("date", { ascending: false });

        if (err) {
          console.error("Supabase fetch error:", err);
          throw err;
        }

        if (!data) {
          transactions.value = [];
          lastFetchedAt = now
          lastUserId = uid
          await saveCachedTransactions(uid, [])
          return []
        }

        // 正規化資料格式
        const formattedData: Transaction[] = normalizeTransactions(data as any[])

        transactions.value = formattedData;
        lastFetchedAt = now
        lastUserId = uid
        await saveCachedTransactions(uid, formattedData)
        return formattedData
        })()

        const result = await inflightFetch
        return result
      },
      {
        context: '獲取交易資料',
        key: 'fetch-transactions',
        loadingState: false
      }
    ).finally(() => {
      loading.value = false;
      inflightFetch = null
    });
  };  // 依月份獲取統計資料
  const getMonthlyStats = (month: string): MonthlyStats => {
    const monthTransactions = transactions.value.filter((t) =>
      t.date.startsWith(month)
    );

    const stats: MonthlyStats = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categories: {},
    };

    monthTransactions.forEach((t) => {
      if (t.type === "income") {
        stats.totalIncome += t.amount;
      } else {
        stats.totalExpense += t.amount;
      }

      const primaryCategory = (t.category_ids && t.category_ids[0]) || t.category_id
      if (primaryCategory) {
        if (!stats.categories[primaryCategory]) {
          stats.categories[primaryCategory] = 0;
        }
        stats.categories[primaryCategory] += t.amount;
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpense;
    return stats;
  };
  // 新增交易
  const addTransaction = async (
    transaction: Omit<Transaction, "id">
  ) => {
    if (!user.value) {
      errorHandler.setError("必須登入才能新增交易", "auth-required");
      return null;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        loading.value = true;

        // 根據實際資料庫結構調整欄位
        const supabaseTransaction: Record<string, any> = {
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description || "",
          user_id: user.value!.id,
        };

        // 寫入分類（優先使用 category_ids，相容舊欄位）
        if (transaction.category_ids && transaction.category_ids.length) {
          supabaseTransaction.category_ids = transaction.category_ids.slice(0, 3)
        } else if (transaction.category_id) {
          supabaseTransaction.category_id = transaction.category_id
        }

        console.log("addTransaction payload", supabaseTransaction);

        const { data, error: err } = await supabase
          .from("transactions")
          .insert(supabaseTransaction)
          .select()
          .single();

        if (err) {
          console.error("Supabase insert error:", err);
          throw err;
        }

        // 轉換日期格式並新增到本地資料
  const newTransaction: Transaction = normalizeTransaction(data)

        transactions.value = [newTransaction, ...transactions.value];
        return newTransaction;
      },
      {
        context: '新增交易',
        key: 'add-transaction',
        loadingState: false
      }
    ).finally(() => {
      loading.value = false;
    });
  }; // 更新交易
  // 更新交易
  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
  ) => {
    if (!user.value) {
      errorHandler.setError("必須登入才能更新交易", "auth-required");
      return false;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        loading.value = true;

        // 只處理資料庫中實際存在的欄位
        const supabaseUpdates: Record<string, any> = {};

        // 處理 amount 欄位
        if ("amount" in updates && updates.amount !== undefined) {
          supabaseUpdates.amount = updates.amount;
        }

        // 處理 type 欄位
        if ("type" in updates && updates.type !== undefined) {
          supabaseUpdates.type = updates.type;
        }

        // 處理 date 欄位
        if ("date" in updates && updates.date !== undefined) {
          supabaseUpdates.date = updates.date;
        }

        // 處理 description 欄位
        if ("description" in updates && updates.description !== undefined) {
          supabaseUpdates.description = updates.description;
        } else if ("note" in updates && updates.note !== undefined) {
          supabaseUpdates.description = updates.note;
        }

        // 處理分類欄位（優先 category_ids）
        if ("category_ids" in updates && updates.category_ids !== undefined) {
          supabaseUpdates.category_ids = (updates.category_ids || []).slice(0, 3)
        }
        // 相容舊欄位
        if ("category_id" in updates && updates.category_id !== undefined) {
          supabaseUpdates.category_id = updates.category_id;
        }

        console.log("updateTransaction payload", {
          id,
          user_id: user.value!.id,
          supabaseUpdates,
        });

        // 確保有資料要更新
        if (Object.keys(supabaseUpdates).length === 0) {
          console.warn("No fields to update");
          return true;
        }

        const { error: err } = await supabase
          .from("transactions")
          .update(supabaseUpdates)
          .eq("id", id)
          .eq("user_id", user.value!.id);

        if (err) {
          console.error("Supabase update error:", err);
          throw err;
        }

        // 更新本地資料
        const index = transactions.value.findIndex((t) => t.id === id);
        if (index > -1) {
          const merged = { ...transactions.value[index], ...updates }
          transactions.value[index] = normalizeTransaction(merged)
          console.log("交易更新成功，本地資料已更新:", transactions.value[index]);
        } else {
          console.warn("找不到要更新的交易記錄:", id);
        }

        return true;
      },
      {
        context: '更新交易',
        key: 'update-transaction',
        loadingState: false
      }
    ).finally(() => {
      loading.value = false;
    });
  };

  // 刪除交易
  const deleteTransaction = async (id: string) => {
    if (!user.value) {
      errorHandler.setError("必須登入才能刪除交易", "auth-required");
      return false;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        loading.value = true;

        const { error: err } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.value!.id);

        if (err) throw err;

        // 從本地資料中刪除
        transactions.value = transactions.value.filter((t) => t.id !== id);
        return true;
      },
      {
        context: '刪除交易',
        key: 'delete-transaction',
        loadingState: false
      }
    ).finally(() => {
      loading.value = false;
    });
  };

  // 監聽用戶狀態變更
  watch(
    () => user.value,
    async (newUser) => {
      if (newUser) {
        await fetchTransactions();
      } else {
        // 用戶登出時清空交易資料
        transactions.value = [];
      }
    },
    { immediate: true }
  );

  return {
    transactions,
    categories,
    loading,
    hasTransactions,
    transactionCount,
    initialized,
    initialize,
    fetchTransactions,
    fetchCategories,
    getMonthlyStats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // 錯誤處理
    error: errorHandler.error,
    hasError: errorHandler.hasError,
    clearError: errorHandler.clearError,
    setError: errorHandler.setError
  };
}
