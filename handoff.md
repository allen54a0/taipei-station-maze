# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## 🎯 PM 欄(中央 ai-pm 盤點讀這裡)
- 對應目標：待對應
- 狀態：🔥活躍

## ⏯️ 目前做到哪
**階段二完成**——30 節點 + 37 條邊 + 邊線視覺化 + hover tooltip 全部就位。滑鼠移到任何節點球會浮出名稱、樓層、類型、線路 tag（BL/R/TRA/THSR/A）；水平走道畫藍線、垂直電扶梯/樓梯畫黃線。節點/邊資料集中在 `src/data/graph.js`，cost 已預先計算好，Dijkstra 可直接吃。

## 🚦 目前狀態
- L1 本地 / L2 GitHub：同上（已 push）
- 3D 場景：✅ 6 層樓 Box + 30 節點球（platform 用線色、其他白/灰）+ 37 邊線（藍水平、黃垂直）+ 月台常駐標籤
- Hover tooltip：✅ 節點名、樓層、類型、線路 tag（顏色對應真實線色）
- 尋路：❌ 尚未實作（資料已完備）
- UI：左上圖例（樓層＋連通線）；起點/終點下拉尚未實作
- Debug：`window.__tsm` 掛 { scene, camera, renderer, nodesGroup, controls, THREE } 供 devtools 用

## ➡️ 下一步（階段三：Dijkstra 尋路 + 路徑動畫）
1. 新增 `src/pathfind.js`：Dijkstra 實作，輸入 (fromId, toId) → 節點 id 陣列 + 總 cost
2. `main.js`：路徑高亮——把路徑上的邊改用第三色（亮綠）並加粗（Tube 或 Line2）
3. 加動畫：一顆亮點沿路徑從起點跑到終點
4. UI 起點/終點下拉：從 `NODES` 陣列生 `<select>`，選完自動算路徑
5. 步驟提示面板：把路徑翻成人話（「從 BL 月台 → 走到 BL 閘門 → 上電扶梯到 B3 穿堂 → …」）

## ⚠️ 注意事項
- 專案在 **Dropbox 底下**，git 已加 `windows.appendAtomically false` 避免同步衝突；請勿手動改 git config
- **node_modules/ 已在 .gitignore**，Dropbox 也不會同步（避免拖垮效能）
- 若之後改用其他電腦：`git clone https://github.com/allen54a0/taipei-station-maze` 後跑 `npm install` 即可
- 台北車站真實結構複雜（B4~2F 六層、五套軌道系統），**初期先做「幾何抽象＋語意標籤」，不追求還原**；等 MVP 跑通再逐節點校正
- 尋路節點座標的「單位」統一為「1 單位 = 5 公尺」
- 節點座標「憑常識」放的，跟真實比例還沒對齊；hall-center / 2f-breeze / tra-plat-2 都在 xz=(0,0) 只是不同 y，側視角看很擠（不影響 raycaster hit）

## 🕐 最後更新
- 時間：2026-09-18
- 更新者：Claude Opus 4.7 @ DESKTOP-P3BS830
- Git push：✅ 已推
