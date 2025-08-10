import { ref } from "vue";
import { Preferences } from "@capacitor/preferences";

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    success: string;
    error: string;
    chart: string[];
  };
}

const themes: Theme[] = [
  {
    id: "default",
  name: "藍",
    colors: {
      primary: "#2563EB", // 更深的藍，現代感更強
      secondary: "#60A5FA",
      accent: "#38BDF8", // 亮藍 accent
      background: "#F1F5F9", // 柔和灰白
      surface: "#FFFFFF",
      text: "#1E293B",
      textLight: "#64748B",
      success: "#22C55E",
      error: "#EF4444",
      chart: ["#2563EB", "#38BDF8", "#60A5FA", "#22C55E", "#F59E42", "#EF4444"],
    },
  },
  {
    id: "dark",
    name: "夜",
    colors: {
      primary: "#3B82F6", // 冷靜藍（重點）
      secondary: "#64748B", // 石板灰藍（輔助）
      accent: "#94A3B8", // 淺灰藍（微點綴）
      background: "#0F172A", // slate-900（背景）
      surface: "#111827", // slate-800（卡片）
      text: "#E5E7EB", // 高對比淺灰
      textLight: "#9CA3AF", // 次要文字
      success: "#10B981",
      error: "#EF4444",
      chart: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#14B8A6",
      ],
    },
  },
  {
    id: "coffee-dark",
    name: "咖",
    colors: {
      primary: "#8D6748", // 咖啡棕（主色，按鈕/重點）
      secondary: "#BCA18A", // 淺咖啡（輔助/標籤）
      accent: "#D6CCC2", // 米白（點綴/hover）
      background: "#181818", // 幾乎純黑（主背景）
      surface: "#23201D", // 深咖啡灰（卡片/區塊）
      text: "#F4F4F4", // 幾乎純白（主文字）
      textLight: "#BCA18A", // 淺咖啡（次要文字）
      success: "#8D6748", // 咖啡棕（不強調）
      error: "#6B4F3A", // 深咖啡（錯誤/警告）
      chart: [
        "#8D6748", // 咖啡棕
        "#BCA18A", // 淺咖啡
        "#23201D", // 深咖啡灰
        "#D6CCC2", // 米白
        "#6B4F3A", // 深咖啡
        "#F4F4F4", // 白
      ],
    },
  },
  {
    id: "minimal-dark",
    name: "素",
    colors: {
      primary: "#E5E7EB", // 亮灰作為主色
      secondary: "#9CA3AF", // 中灰
      accent: "#6B7280", // 深灰點綴
      background: "#121212", // 純淨深黑
      surface: "#1A1A1A", // 稍亮的黑
      text: "#E5E7EB",
      textLight: "#9CA3AF",
      success: "#22C55E",
      error: "#EF4444",
      chart: [
        "#E5E7EB",
        "#9CA3AF",
        "#6B7280",
        "#374151",
        "#111827",
        "#D1D5DB",
      ],
    },
  },
  {
    id: "warm-dark",
    name: "暖",
    colors: {
      primary: "#F59E0B", // 琥珀重點
      secondary: "#FDE68A", // 淡金黃
      accent: "#FB923C", // 柔和橘
      background: "#171717", // 柔黑
      surface: "#23201D", // 深咖啡灰
      text: "#F5F5F4", // 暖白
      textLight: "#FCD34D", // 金黃文字
      success: "#22C55E",
      error: "#EF4444",
      chart: [
        "#F59E0B",
        "#FB923C",
        "#FDE68A",
        "#22C55E",
        "#EF4444",
        "#A16207",
      ],
    },
  },
  {
    id: "warm",
    name: "陽",
    colors: {
      primary: "#F59E0B", // 琥珀
      secondary: "#FDE68A", // 淡金
      accent: "#FDBA74", // 柔橘
      background: "#FFF7ED", // 米白
      surface: "#FFFFFF", // 白
      text: "#7C2D12", // 深棕
      textLight: "#F59E0B",
      success: "#22C55E",
      error: "#EF4444",
      chart: ["#F59E0B", "#FDBA74", "#FDE68A", "#B45309", "#EAB308", "#EF4444"],
    },
  },
  {
    id: "berry",
    name: "莓",
    colors: {
      primary: "#DB2777", // 玫紅（收斂）
      secondary: "#A78BFA", // 柔紫
      accent: "#FB7185", // 淡玫紅
      background: "#FDF2F8", // 粉白
      surface: "#FFFFFF",
      text: "#831843", // 深莓
      textLight: "#F472B6",
      success: "#22C55E",
      error: "#EF4444",
      chart: ["#DB2777", "#A78BFA", "#F472B6", "#C026D3", "#7C3AED", "#EF4444"],
    },
  },
  {
    id: "ocean",
    name: "海",
    colors: {
      primary: "#06B6D4", // 青藍
      secondary: "#0E7490", // 深青
      accent: "#22D3EE", // 淺青
      background: "#ECFEFF", // 淺藍白
      surface: "#FFFFFF",
      text: "#0E7490", // 深青
      textLight: "#67E8F9",
      success: "#22C55E",
      error: "#EF4444",
      chart: ["#06B6D4", "#22D3EE", "#67E8F9", "#0E7490", "#0891B2", "#EF4444"],
    },
  },
];

const currentTheme = ref<Theme>(themes[0]); // module-scope 單例
export const useTheme = () => {
  const setTheme = async (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      currentTheme.value = theme;
      await Preferences.set({ key: "theme", value: themeId });

      // 更新 CSS 變數
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === "string") {
          root.style.setProperty(`--color-${key}`, value);
        } else if (Array.isArray(value) && key === "chart") {
          // 設定圖表顏色
          value.forEach((color, index) => {
            root.style.setProperty(`--color-chart-${index + 1}`, color);
          });
        }
      });
    }
  };

  const initTheme = async () => {
    const { value } = await Preferences.get({ key: "theme" });
    if (value) {
      await setTheme(value);
    }
  };

  return {
    themes,
    currentTheme,
    setTheme,
    initTheme,
  };
};
