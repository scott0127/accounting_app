// composables/useSupabaseTransactions.ts
import { ref, computed, watch } from "vue";
import { useSupabase } from "./useSupabase";
import { useSupabaseAuth } from "./useSupabaseAuth";
import type { Transaction, Category, MonthlyStats } from "~/types";

export function useSupabaseTransactions() {
  const supabase = useSupabase();
  const { user } = useSupabaseAuth();

  const transactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // 獲取類別
  const fetchCategories = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (err) throw err;

      categories.value = data as Category[];
    } catch (err: any) {
      console.error("獲取類別失敗:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // 初始化
  const initialize = async () => {
    if (initialized.value) return;

    try {
      loading.value = true;
      error.value = null;

      // 加載類別
      await fetchCategories();

      // 如果已登入，加載交易
      if (user.value) {
        await fetchTransactions();
      }

      initialized.value = true;
    } catch (err: any) {
      console.error("初始化失敗:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  // 獲取交易資料
  const fetchTransactions = async () => {
    if (!user.value) {
      transactions.value = [];
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.value.id)
        .order("date", { ascending: false });

      if (err) {
        console.error("Supabase fetch error:", err);
        throw err;
      }

      if (!data) {
        transactions.value = [];
        return;
      }

      // 轉換資料格式以匹配前端模型
      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        amount: item.amount,
        // 使用 type 欄位，確保它存在
        type: item.type || "expense",
        // 從 category_id 欄位映射到前端使用的 category 欄位
        category: item.category_id || "",
        date: new Date(item.date).toISOString().split("T")[0],
        // 在前端同時使用 description 和 note 欄位，但資料來源只有 description
        description: item.description || "",
        note: item.description || "", // 前端也使用 note，但我們從 description 取值
      }));

      transactions.value = formattedData;
    } catch (err: any) {
      console.error("獲取交易失敗:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
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

      if (!stats.categories[t.category]) {
        stats.categories[t.category] = 0;
      }
      stats.categories[t.category] += t.amount;
    });

    stats.balance = stats.totalIncome - stats.totalExpense;
    return stats;
  };
  // 新增交易
  const addTransaction = async (
    transaction: Omit<Transaction, "id"> & { category_id?: string }
  ) => {
    if (!user.value) {
      throw new Error("必須登入才能新增交易");
    }

    try {
      loading.value = true;
      error.value = null;

      // 根據實際資料庫結構調整欄位
      const supabaseTransaction = {
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        // 處理 description 欄位 - 從 note 或 description 中取值
        description: transaction.description || transaction.note || "",
        // 使用 category_id 欄位
        category_id: transaction.category_id || transaction.category,
        user_id: user.value.id,
      };

      // 除錯：列印即將送出的新增內容
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
      const newTransaction = {
        ...transaction,
        id: data.id.toString(),
        // 確保欄位一致性，映射 category_id 到前端的 category
        category: data.category_id || "",
        date: new Date(data.date).toISOString().split("T")[0],
        // 確保 note 和 description 欄位的同步
        description: data.description || "",
        note: data.description || "", // 前端使用 note，但我們從 description 取值
      };

      transactions.value = [newTransaction, ...transactions.value];

      return newTransaction;
    } catch (err: any) {
      console.error("新增交易失敗:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }; // 更新交易
  // 更新交易
  // 更新交易 - 簡化版，僅處理實際存在的資料庫欄位
  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
  ) => {
    if (!user.value) {
      throw new Error("必須登入才能更新交易");
    }

    try {
      loading.value = true;
      error.value = null;

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
        // 如果前端提供 note 但沒提供 description，則使用 note 更新 description
        supabaseUpdates.description = updates.note;
      }

      // 處理 category_id 欄位
      if ("category" in updates && updates.category !== undefined) {
        supabaseUpdates.category_id = updates.category;
      } else if (
        "category_id" in updates &&
        (updates as any).category_id !== undefined
      ) {
        supabaseUpdates.category_id = (updates as any).category_id;
      }

      // 除錯：列印即將送出的更新內容
      console.log("updateTransaction payload", {
        id,
        user_id: user.value.id,
        supabaseUpdates,
      });

      // 確保有資料要更新
      if (Object.keys(supabaseUpdates).length === 0) {
        console.warn("No fields to update");
        return;
      }

      // 發送更新請求到 Supabase，不使用 .select() 避免 schema 問題
      const { error: err } = await supabase
        .from("transactions")
        .update(supabaseUpdates)
        .eq("id", id)
        .eq("user_id", user.value.id);

      if (err) {
        console.error("Supabase update error:", err);
        throw err;
      }

      // 更新本地資料
      const index = transactions.value.findIndex((t) => t.id === id);
      if (index > -1) {
        // 創建前端需要的更新物件
        const updatedTransaction: Partial<Transaction> = {};

        // 複製基本欄位
        if ("amount" in updates) updatedTransaction.amount = updates.amount;
        if ("type" in updates) updatedTransaction.type = updates.type;
        if ("date" in updates) updatedTransaction.date = updates.date;

        // 處理前端的 category 欄位
        if ("category" in updates) {
          updatedTransaction.category = updates.category;
        } else if ("category_id" in (updates as any)) {
          updatedTransaction.category = (updates as any).category_id;
        }

        // 前端同時處理 description 和 note (兩者保持同步)
        if ("description" in updates) {
          updatedTransaction.description = updates.description;
          updatedTransaction.note = updates.description; // 同步到 note
        } else if ("note" in updates) {
          updatedTransaction.description = updates.note;
          updatedTransaction.note = updates.note;
        }

        // 更新本地資料
        transactions.value[index] = {
          ...transactions.value[index],
          ...updatedTransaction,
        };
        console.log("交易更新成功，本地資料已更新:", transactions.value[index]);
      } else {
        console.warn("找不到要更新的交易記錄:", id);
      }
    } catch (err: any) {
      console.error("更新交易失敗:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 刪除交易
  const deleteTransaction = async (id: string) => {
    if (!user.value) {
      throw new Error("必須登入才能刪除交易");
    }

    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.value.id);

      if (err) throw err;

      // 從本地資料中刪除
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (err: any) {
      console.error("刪除交易失敗:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
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
    error,
    initialize,
    fetchTransactions,
    fetchCategories,
    getMonthlyStats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
