# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## 🎯 PM 欄（中央 ai-pm 盤點讀這裡）
- 對應目標：待對應
- 狀態：🔥活躍

## ⏯️ 目前做到哪
專案初始化完成（L1 本地藍圖 + L2 GitHub 私有 repo）。範圍已與 Allen 對齊：**MVP 核心樞紐、半透明 Box 抽象幾何、憑常識建圖、Vite + 原生 Three.js**。尚未寫任何程式碼。

## 🚦 目前狀態
- L1 本地：`AGENTS.md` ＋ `handoff.md` 就位；四個李廠長子資料夾建好
- L2 GitHub：`allen54a0/taipei-station-maze`（私有）已建、已 push
- L3 Obsidian：**未建**（本機 Obsidian MCP 連線失敗；之後在有 Obsidian 的電腦補建）
- Vite 環境：**尚未建立**

## ➡️ 下一步
1. 建立 Vite 專案骨架：`npm create vite@latest . -- --template vanilla`（在專案根執行；同意覆寫 index.html）
2. 安裝依賴：`npm install three`
3. 在 `src/main.js` 建最小 Three.js 場景（半透明 Box × 6 層樓，OrbitControls 可轉可縮）
4. 開一個 `src/data/graph.js` 資料檔，先寫 5 條線月台 + 大廳的節點 stub（不用完整）

## ⚠️ 注意事項
- 專案在 **Dropbox 底下**，git 已加 `windows.appendAtomically false` 避免同步衝突；請勿手動改 git config
- **node_modules/ 已在 .gitignore**，Dropbox 也不會同步（避免拖垮效能）
- 若之後改用其他電腦：`git clone https://github.com/allen54a0/taipei-station-maze` 後跑 `npm install` 即可
- 台北車站真實結構複雜（B4~2F 六層、五套軌道系統），**初期先做「幾何抽象＋語意標籤」，不追求還原**；等 MVP 跑通再逐節點校正
- 尋路節點座標的「單位」統一為「1 單位 = 5 公尺」

## 🕐 最後更新
- 時間：2026-09-18
- 更新者：Claude Opus 4.7 @ DESKTOP-P3BS830
- Git push：✅ 已推
