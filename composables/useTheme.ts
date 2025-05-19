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
    name: "湛藍天空",
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
    name: "深夜星空",
    colors: {
      primary: "#60A5FA", // 藍色主色（星空藍）
      secondary: "#818CF8", // 藍紫色（星雲紫）
      accent: "#FACC15", // 金黃色（星光點綴）
      background: "#181A20", // 深夜黑（主背景）
      surface: "#232634", // 深灰藍（卡片/區塊背景）
      text: "#F1F5F9", // 主要文字（高對比白）
      textLight: "#94A3B8", // 次要文字（淺灰藍）
      success: "#22C55E", // 綠色（收入/正向）
      error: "#EF4444", // 紅色（支出/錯誤）
      chart: [
        "#3B82F6", // 藍
        "#60A5FA", // 淺藍
        "#818CF8", // 藍紫
        "#22C55E", // 綠
        "#FACC15", // 黃
        "#EF4444", // 紅
      ],
    },
  },
  {
    id: "coffee-dark",
    name: "咖啡黑暗",
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
    name: "極簡暗黑",
    colors: {
      primary: "#E0E0E0", // 主色（亮灰，按鈕/重點/主文字）
      secondary: "#B0B0B0", // 次要色（中灰，輔助/次要文字）
      accent: "#888888", // 點綴（軟灰，icon/hover/小按鈕）
      background: "#121212", // 主背景（深黑）
      surface: "#1A1A1A", // 卡片/區塊（比背景稍亮一點的黑）
      text: "#E0E0E0", // 主文字（亮灰）
      textLight: "#B0B0B0", // 次要文字（中灰）
      success: "#888888", // 成功（用軟灰，不強調）
      error: "#444444", // 錯誤（深灰，不強調）
      chart: [
        "#E0E0E0", // 亮灰
        "#B0B0B0", // 中灰
        "#888888", // 軟灰
        "#444444", // 深灰
        "#1A1A1A", // 更深灰
        "#E0E0E0", // 亮灰
      ],
    },
  },
  {
    id: "warm-dark",
    name: "溫暖暗色",
    colors: {
      primary: "#F5E8D8", // 主文字（暖米色）
      secondary: "#DAA520", // 次要色（金黃）
      accent: "#FF6F61", // 主要點綴（珊瑚橘）
      background: "#1C1C1C", // 主背景（柔黑）
      surface: "#23201D", // 卡片/區塊（深咖啡灰，與背景有層次）
      text: "#F5E8D8", // 主文字（暖米色）
      textLight: "#DAA520", // 次要文字（金黃）
      success: "#DAA520", // 成功（用金黃）
      error: "#FF4500", // 錯誤（用珊瑚橘）
      chart: [
        "#FF6F61", // 珊瑚橘
        "#DAA520", // 金黃
        "#F5E8D8", // 米色
        "#FF4500", // 焦橘
        "#23201D", // 深咖啡
        "#1C1C1C", // 柔黑
      ],
    },
  },
  {
    id: "warm",
    name: "暖陽時光",
    colors: {
      primary: "#F59E42", // 橘黃
      secondary: "#B45309", // 深琥珀（對比）
      accent: "#FFF7ED", // 柔和米白
      background: "#FFF7ED", // 米白
      surface: "#FFFFFF", // 白
      text: "#7C2D12", // 深棕（高對比）
      textLight: "#F59E42", // 橘黃
      success: "#22C55E", // 綠
      error: "#EF4444", // 紅
      chart: ["#F59E42", "#FBBF24", "#B45309", "#FDE68A", "#EAB308", "#EF4444"],
    },
  },
  {
    id: "berry",
    name: "莓果甜心",
    colors: {
      primary: "#E11D48", // 莓紅
      secondary: "#7C3AED", // 紫莓（對比）
      accent: "#B70620", // 淡粉
      background: "#FDF2F8", // 淡粉
      surface: "#FFFFFF", // 白
      text: "#831843", // 深莓紅（高對比）
      textLight: "#FE2A74", // 粉紅
      success: "#22C55E", // 綠
      error: "#EF4444", // 紅
      chart: ["#E11D48", "#F472B6", "#7C3AED", "#A21CAF", "#C026D3", "#EF4444"],
    },
  },
  {
    id: "ocean",
    name: "海洋之心",
    colors: {
      primary: "#0EA5E9", // 藍
      secondary: "#155E75", // 深藍（對比）
      accent: "#000000", // 淺藍
      background: "#ECFEFF", // 極淺藍
      surface: "#FFFFFF", // 白
      text: "#155E75", // 深藍（高對比）
      textLight: "#38BDF8", // 淺藍
      success: "#22C55E", // 綠
      error: "#EF4444", // 紅
      chart: ["#0EA5E9", "#155E75", "#38BDF8", "#A5F3FC", "#0284C7", "#EF4444"],
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
