# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## 🎯 PM 欄（中央 ai-pm 盤點讀這裡）
- 對應目標：待對應
- 狀態：🔥活躍

## ⏯️ 目前做到哪
**階段三完成 + 階段四大半完成**——Dijkstra 尋路 + Tube 路徑高亮 + 亮點動畫 + 起終點下拉 + 步驟面板全部就位。使用者從左上下拉選起點/終點，畫面出現一條**綠色管狀最短路徑**（跨層平滑），一顆亮黃球沿路徑循環跑；步驟面板顯示段數/公尺/分鐘與每步「A → 走／電扶梯／樓梯 → B」。預設載入「機捷 A1 月台 → R 月台（往象山）」9 段 845 公尺 11.7 分鐘。

## 🚦 目前狀態
- L1 本地 / L2 GitHub：同上（已 push）
- 3D 場景：✅ 6 層樓 Box + 30 節點 + 37 邊 + 路徑 Tube + 亮點動畫 + 起終點光暈環
- 尋路演算：✅ `src/pathfind.js` Dijkstra（線性掃 min，30 節點無壓力；可雙向雙路查詢）
- UI 面板：✅ 起點/終點下拉（change 自動找）、找路徑/清除按鈕、步驟面板
- Hover tooltip：✅ 仍在（與路徑並存）
- **只剩鏡頭聚焦沒做**（路徑找到後鏡頭 auto-fit 到路徑 BoundingBox）——nice to have

## ➡️ 下一步（收尾 → 階段五部署）
1. （可選）加鏡頭 auto-focus：新路徑出現時把 controls.target lerp 到路徑中心，camera position 依 BoundingBox 反推距離
2. `npm run build` 驗證能出 `dist/`（vite.config.js base 已設 `/taipei-station-maze/`）
3. 加 GitHub Actions 部署到 GitHub Pages（`.github/workflows/deploy.yml`）
4. 開啟 repo 的 Pages 設定 → source = GitHub Actions
5. 測試 `https://allen54a0.github.io/taipei-station-maze/`
6. Optional：節點座標對照真實站體圖校正、擴充到「標準」範圍（60~80 節點含主要出口編號 M1~M8/Y 區/K 區等）

## ⚠️ 注意事項
- 專案在 **Dropbox 底下**，git 已加 `windows.appendAtomically false` 避免同步衝突；請勿手動改 git config
- **node_modules/ 已在 .gitignore**，Dropbox 也不會同步（避免拖垮效能）
- 若之後改用其他電腦：`git clone https://github.com/allen54a0/taipei-station-maze` 後跑 `npm install` 即可
- 台北車站真實結構複雜（B4~2F 六層、五套軌道系統），**初期先做「幾何抽象＋語意標籤」，不追求還原**
- 尋路節點座標「1 單位 = 5 公尺」；cost 同單位；步行速度假設 1.2 m/s（`renderSteps` 內）
- 節點座標「憑常識」放的，跟真實比例還沒對齊；Dijkstra 結果只反映當前座標的相對距離
- `window.__tsm` 掛 { scene, camera, renderer, nodesGroup, pathGroup, controls, THREE, findPath } 供 devtools 除錯

## 🕐 最後更新
- 時間：2026-09-18
- 更新者：Claude Opus 4.7 @ DESKTOP-P3BS830
- Git push：✅ 已推
