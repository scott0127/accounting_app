# 簡單記帳

一款智慧型個人財務管理應用程式，旨在簡化您的記帳流程並提供清晰的財務洞察。結合 AI 技術，讓費用追蹤、分類和預算管理變得前所未有的簡單。

## 主要功能

*   **⚡ 快速記帳**: 輕鬆記錄您的每一筆收入和支出。
*   **🤖 AI 智能分類**: 自動辨識並分類您的交易，省時省力。 (需設定 Gemini API Key)
*   **📊 圖表分析**:透過直觀的圖表和視覺化數據，清晰掌握您的財務狀況。
*   **💰 預算管理**: 設定和追蹤您的月度預算，有效控制開支。
*   **🎯 財務目標**: 設定並追蹤您的財務目標。
*   **ጤ 健康狀態**: 了解您的財務健康狀況評估。
*   **📑 交易列表與篩選**: 方便查詢、篩選和管理您的所有交易紀錄。
*   **📱 PWA & 行動應用**: 支援漸進式網頁應用 (PWA)，並可透過 Capacitor 打包為 Android/iOS 應用程式。
*   **🔒 資料安全**: 使用 Supabase 進行後端管理，確保您的資料安全。
*   **🌓 主題切換**: 支援深色/淺色模式。
*   **🔧 自訂類別**: 除了系統預設類別外，您還可以新增符合個人需求的收支類別。

## 🚀 環境設定與安裝 (Setup and Installation)

開始之前，請確保您已安裝 [Node.js](https://nodejs.org/) (建議版本 LTS) 和 [pnpm](https://pnpm.io/installation)。

1.  **複製專案 (Clone the repository):**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git # 請替換成實際的 repo URL
    cd your-repository-name
    ```

2.  **安裝依賴 (Install dependencies):**
    本專案使用 `pnpm` 作為套件管理器。
    ```bash
    pnpm install
    ```

3.  **設定環境變數 (Set up environment variables):**
    *   複製 `.env.example` 檔案並重新命名為 `.env`：
        ```bash
        cp .env.example .env
        ```
    *   編輯 `.env` 檔案，填入您的 Supabase 和 Gemini API 金鑰等資訊。Supabase 金鑰可於專案儀表板取得，Gemini API Key 可於 Google AI Studio 申請。

    ```
    # .env 檔案內容範例:
    # Supabase
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # Gemini (用於 AI 記帳分類功能)
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **設定 Supabase 資料庫 (Set up Supabase database):**
    *   登入您的 [Supabase 帳戶](https://supabase.com/) 或建立一個新帳戶。
    *   建立一個新的專案。
    *   在專案的 SQL Editor 中，執行位於 `supabase/schema.sql` 的腳本。這將建立必要的資料表 (transactions, categories, profiles) 和設定行級安全策略 (RLS)。
    *   **重要**: `schema.sql` 包含預設的支出和收入類別。

5.  **(可選) 設定 LLM/AI 功能 (Optional - Set up LLM/AI Features):**
    *   詳細的 AI 功能設定（例如 Gemini API 金鑰的獲取與使用）請參考 `LLM_SETUP.md` 文件。

## ▶️ 執行專案 (Running the Project)

### 開發模式 (Development)

啟動開發伺服器，通常會在 `http://localhost:3000` 上運行：

```bash
pnpm dev
```

此模式支援熱模odule替換 (HMR)，方便即時查看變更。

### 生產模式 (Production)

1.  **建置應用程式 (Build the application):**
    此命令會將您的應用程式打包並優化，準備部署到伺服器。
    ```bash
    pnpm build
    ```

2.  **在本機預覽生產建置 (Locally preview production build):**
    建置完成後，您可以在本機啟動一個伺服器來預覽生產版本的應用程式。
    ```bash
    pnpm preview
    ```

## 📂 專案結構 (Project Structure)

以下是本專案主要目錄結構和說明：

```
.
├── android/            # Capacitor Android 專案相關檔案
├── app.vue             # Nuxt 3 主要的 Vue 應用程式進入點
├── assets/             # 未經 Webpack 編譯的靜態資源 (如 CSS, 字型)
├── components/         # Vue 組件 (可重複使用的 UI 元件)
│   ├── dashboard/      # 儀表板相關的組件
│   └── ...
├── composables/        # Nuxt 3 Composition API 可組合函數 (VueUse, 自訂 hooks)
├── layouts/            # 版面組件 (定義頁面佈局)
├── LLM_SETUP.md        # 大型語言模型 (AI) 功能設定說明
├── nuxt.config.ts      # Nuxt 專案的設定檔
├── pages/              # 頁面組件 (對應路由)
│   ├── transactions/   # 交易相關頁面
│   └── ...
├── package.json        # 專案依賴和腳本設定
├── pnpm-lock.yaml      # pnpm 鎖定的依賴版本
├── public/             # 純靜態資源，會直接複製到輸出目錄 (如 favicon.ico, manifest.json)
├── README.md           # 就是你現在正在看的這個檔案 :)
├── server/             # Nuxt 3 伺服器端 API 路由和中間件 (如果有的話)
├── stores/             # Pinia 狀態管理 stores
├── supabase/           # Supabase 相關設定
│   └── schema.sql      # 資料庫結構定義檔
├── tailwind.config.js  # Tailwind CSS 設定檔
├── tsconfig.json       # TypeScript 設定檔
└── types/              # TypeScript 型別定義
    ├── index.ts
    └── supabase.ts     # Supabase 自動產生的型別 (通常透過 CLI)
```

## 📱 Capacitor 行動應用程式使用 (Capacitor Mobile App Usage)

本專案使用 [Capacitor](https://capacitorjs.com/) 將 Nuxt 應用程式打包成原生 Android 和 iOS 應用程式。

### 設定步驟 (Setup Steps)

1.  **安裝 Capacitor CLI (Install Capacitor CLI):**
    如果您尚未全域安裝 Capacitor CLI，請執行：
    ```bash
    npm install -g @capacitor/cli
    # 或者
    pnpm add -g @capacitor/cli
    ```

2.  **建置 Web 資源 (Build Web Assets):**
    首先，您需要建置 Nuxt 應用程式的生產版本。
    ```bash
    pnpm build
    ```
    Capacitor 會將 `.output/public` 目錄的內容複製到原生專案中。Nuxt 3 的輸出目錄通常是 `.output/public`。

### Android

1.  **同步 Web 資源 (Sync Web Assets):**
    ```bash
    npx cap sync android
    ```
    此命令會將 Web 建置資源複製到 Android 專案，並更新原生依賴。

2.  **開啟 Android Studio (Open in Android Studio):**
    ```bash
    npx cap open android
    ```
    接著，您可以在 Android Studio 中建置、執行和偵錯您的應用程式，或直接部署到實體裝置/模擬器。

### iOS

1.  **同步 Web 資源 (Sync Web Assets):**
    ```bash
    npx cap sync ios
    ```
    此命令會將 Web 建置資源複製到 iOS 專案，並更新原生依賴 (例如 CocoaPods)。

2.  **開啟 Xcode (Open in Xcode):**
    ```bash
    npx cap open ios
    ```
    接著，您可以在 Xcode 中建置、執行和偵錯您的應用程式，或直接部署到實體裝置/模擬器。請確保您有 Apple 開發者帳號並已設定好開發團隊。

**注意:**
*   每次更新 Web 內容後，都需要重新執行 `pnpm build` 和 `npx cap sync <platform>`。
*   原生專案的設定 (如 App ID, icons, splash screens) 可以在 `capacitor.config.ts` 和原生專案的設定檔中調整。

## ✨ 技術棧 (Tech Stack)

*   **前端框架 (Frontend Framework):** [Nuxt.js](https://nuxt.com/) (Vue.js)
*   **狀態管理 (State Management):** [Pinia](https://pinia.vuejs.org/)
*   **CSS 框架 (CSS Framework):** [Tailwind CSS](https://tailwindcss.com/)
*   **後端服務 (Backend Service):** [Supabase](https://supabase.io/) (PostgreSQL, Authentication, Storage)
*   **AI 功能 (AI Features):** [Gemini API](https://ai.google.dev/gemini-api/docs)
*   **圖表庫 (Charting Library):** [Chart.js](https://www.chartjs.org/)
*   **日期處理 (Date Utility):** [Day.js](https://day.js.org/)
*   **行動應用打包 (Mobile App Bundling):** [Capacitor](https://capacitorjs.com/)
*   **PWA 功能 (PWA Features):** [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt.html)
