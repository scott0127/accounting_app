/**
 * 優化的 Supabase 交易管理 composable
 * 使用統一的錯誤處理和更好的類型安全
 */
import { ref, computed, watch } from "vue";
import { useSupabase } from "./useSupabase";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { useErrorHandler } from "./useErrorHandler";
import type { Transaction, Category, MonthlyStats } from "~/types";

export function useSupabaseTransactionsV2() {
  const supabase = useSupabase();
  const { user } = useSupabaseAuth();
  const errorHandler = useErrorHandler({
    showNotifications: true,
    logErrors: true,
    defaultMessage: '交易操作失敗'
  });

  // 狀態管理
  const transactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const initialized = ref(false);

  // 計算屬性
  const hasTransactions = computed(() => transactions.value.length > 0);
  const transactionCount = computed(() => transactions.value.length);
  const isLoading = computed(() => loading.value || errorHandler.isLoading.value);

  // 獲取類別
  const fetchCategories = async (): Promise<Category[] | null> => {
    return await errorHandler.withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        
        categories.value = data as Category[];
        return data as Category[];
      },
      {
        context: '獲取類別',
        key: 'fetch-categories'
      }
    );
  };

  // 獲取交易資料
  const fetchTransactions = async (): Promise<Transaction[] | null> => {
    if (!user.value) {
      transactions.value = [];
      return [];
    }

    return await errorHandler.withErrorHandling(
      async () => {
        loading.value = true;

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.value!.id)
          .order("date", { ascending: false });

        if (error) throw error;

        if (!data) {
          transactions.value = [];
          return [];
        }

        // 轉換資料格式以匹配前端模型
        const formattedData: Transaction[] = data.map((item: any) => ({
          id: item.id.toString(),
          amount: item.amount,
          type: item.type || "expense",
          category_id: item.category_id || "",
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description || "",
          note: item.description || ""
        }));

        transactions.value = formattedData;
        return formattedData;
      },
      {
        context: '獲取交易資料',
        key: 'fetch-transactions',
        loadingState: false // 我們手動管理 loading 狀態
      }
    ).finally(() => {
      loading.value = false;
    });
  };

  // 初始化
  const initialize = async (): Promise<boolean> => {
    if (initialized.value) return true;

    const result = await errorHandler.withErrorHandling(
      async () => {
        // 加載類別
        await fetchCategories();

        // 如果已登入，加載交易
        if (user.value) {
          await fetchTransactions();
        }

        initialized.value = true;
        return true;
      },
      {
        context: '初始化交易模組',
        key: 'initialize'
      }
    );

    return result !== null;
  };

  // 依月份獲取統計資料
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

      if (!stats.categories[t.category_id]) {
        stats.categories[t.category_id] = 0;
      }
      stats.categories[t.category_id] += t.amount;
    });

    stats.balance = stats.totalIncome - stats.totalExpense;
    return stats;
  };

  // 新增交易
  const addTransaction = async (
    transaction: Omit<Transaction, "id">
  ): Promise<Transaction | null> => {
    if (!user.value) {
      errorHandler.setError('必須登入才能新增交易', 'auth-required');
      return null;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        const supabaseTransaction = {
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description || "",
          category_id: transaction.category_id,
          user_id: user.value!.id,
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert(supabaseTransaction)
          .select()
          .single();

        if (error) throw error;

        const newTransaction: Transaction = {
          id: data.id.toString(),
          amount: data.amount,
          type: data.type,
          category_id: data.category_id,
          date: new Date(data.date).toISOString().split("T")[0],
          description: data.description || "",
          note: data.description || ""
        };

        // 更新本地狀態
        transactions.value = [newTransaction, ...transactions.value];

        return newTransaction;
      },
      {
        context: '新增交易',
        key: 'add-transaction'
      }
    );
  };

  // 更新交易
  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>
  ): Promise<boolean> => {
    if (!user.value) {
      errorHandler.setError('必須登入才能更新交易', 'auth-required');
      return false;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        const supabaseUpdates: Record<string, any> = {};

        if (updates.amount !== undefined) supabaseUpdates.amount = updates.amount;
        if (updates.type !== undefined) supabaseUpdates.type = updates.type;
        if (updates.date !== undefined) supabaseUpdates.date = updates.date;
        if (updates.description !== undefined) supabaseUpdates.description = updates.description;
        if (updates.category_id !== undefined) supabaseUpdates.category_id = updates.category_id;

        if (Object.keys(supabaseUpdates).length === 0) {
          console.warn("No fields to update");
          return true;
        }

        const { error } = await supabase
          .from("transactions")
          .update(supabaseUpdates)
          .eq("id", id)
          .eq("user_id", user.value!.id);

        if (error) throw error;

        // 更新本地資料
        const index = transactions.value.findIndex((t) => t.id === id);
        if (index > -1) {
          transactions.value[index] = {
            ...transactions.value[index],
            ...updates
          };
        }

        return true;
      },
      {
        context: '更新交易',
        key: 'update-transaction'
      }
    ) !== null;
  };

  // 刪除交易
  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!user.value) {
      errorHandler.setError('必須登入才能刪除交易', 'auth-required');
      return false;
    }

    return await errorHandler.withErrorHandling(
      async () => {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.value!.id);

        if (error) throw error;

        // 從本地資料中刪除
        transactions.value = transactions.value.filter((t) => t.id !== id);
        return true;
      },
      {
        context: '刪除交易',
        key: 'delete-transaction'
      }
    ) !== null;
  };

  // 批量操作
  const batchAddTransactions = async (
    transactionList: Omit<Transaction, "id">[]
  ): Promise<Transaction[]> => {
    if (!user.value) {
      errorHandler.setError('必須登入才能批量新增交易', 'auth-required');
      return [];
    }

    const result = await errorHandler.withErrorHandling(
      async () => {
        const supabaseTransactions = transactionList.map(transaction => ({
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description || "",
          category_id: transaction.category_id,
          user_id: user.value!.id,
        }));

        const { data, error } = await supabase
          .from("transactions")
          .insert(supabaseTransactions)
          .select();

        if (error) throw error;

        const newTransactions: Transaction[] = (data || []).map((item: any) => ({
          id: item.id.toString(),
          amount: item.amount,
          type: item.type,
          category_id: item.category_id,
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description || "",
          note: item.description || ""
        }));

        // 更新本地狀態
        transactions.value = [...newTransactions, ...transactions.value];

        return newTransactions;
      },
      {
        context: '批量新增交易',
        key: 'batch-add-transactions'
      }
    );

    return result || [];
  };

  // 清空交易資料
  const clearTransactions = () => {
    transactions.value = [];
  };

  // 監聽用戶狀態變更
  watch(
    () => user.value,
    async (newUser) => {
      if (newUser) {
        await fetchTransactions();
      } else {
        clearTransactions();
      }
    },
    { immediate: true }
  );

  return {
    // 狀態
    transactions: readonly(transactions),
    categories: readonly(categories),
    loading: readonly(loading),
    isLoading,
    hasTransactions,
    transactionCount,
    initialized: readonly(initialized),

    // 方法
    initialize,
    fetchTransactions,
    fetchCategories,
    getMonthlyStats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    batchAddTransactions,
    clearTransactions,

    // 錯誤處理
    error: errorHandler.error,
    hasError: errorHandler.hasError,
    clearError: errorHandler.clearError,
    setError: errorHandler.setError
  };
}
