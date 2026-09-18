# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## 🎯 PM 欄（中央 ai-pm 盤點讀這裡）
- 對應目標：待對應
- 狀態：🔥活躍

## ⏯️ 目前做到哪
**階段一完成**——Vite + Three.js 骨架跑起來，6 層樓半透明 Box + 節點占位球 + OrbitControls 都 OK。左上 UI 面板已顯示樓層圖例；dev server 在 http://localhost:5173 驗證無 console error。

## 🚦 目前狀態
- L1 本地：`AGENTS.md` ＋ `handoff.md` 就位；四個李廠長子資料夾建好
- L2 GitHub：`allen54a0/taipei-station-maze`（私有）已建、已 push
- L3 Obsidian：**未建**（本機 Obsidian MCP 連線失敗；之後在有 Obsidian 的電腦補建）
- Vite 環境：✅ 已建（three ^0.186、vite ^8.3），`npm run dev` 可跑
- 3D 場景：✅ 6 層樓半透明 Box × 底層網格 × 樓層標籤（B4~2F）× 節點占位球（7 個 stub）
- 尋路：❌ 尚未實作
- UI：只有左上圖例；起點/終點下拉尚未實作

## ➡️ 下一步（階段二：節點資料建圖）
1. 把 `src/data/graph.js` 的節點從 7 個 stub 擴充到約 30 個（月台頭尾、閘門、電扶梯、穿堂連通口）
2. 填 `EDGES` 陣列：垂直（電扶梯／樓梯連接不同樓層）＋ 水平（同層穿堂連通），cost 用步行距離估算
3. 加 raycaster：滑鼠點節點顯示 tooltip，方便肉眼校正位置
4. 補齊各線月台的官方中文站名（例如「月台 1A」、「M8 出口」等）
5. 隱形節點層與樓層 Box 疊放：確認節點球都在對應樓層的 Box 內

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
