# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## 🎯 PM 欄（中央 ai-pm 盤點讀這裡）
- 對應目標：待對應
- 狀態：✅結案
- 最終結論：MVP 上線完成 → https://allen54a0.github.io/taipei-station-maze/ （結案日期 2026-09-18）

## ⏯️ 目前做到哪
**全案 MVP 上線** 🎉——原始需求「Three.js 半透明 3D 台北車站 + 起終點輸入 + 最短路徑動畫」100% 達成，並已部署到 GitHub Pages。使用者從左上下拉選起點/終點 → 綠色管狀路徑跨層平滑跳出 → 鏡頭自動聚焦到路徑 → 亮黃球沿路徑循環 → 步驟面板顯示段數/公尺/分鐘。預設載入「機捷 A1 月台 → R 月台象山」9 段 845 公尺 11.7 分鐘。

## 🚦 目前狀態
- L1 本地 / L2 GitHub：全部就位並 push
- **線上網址**：https://allen54a0.github.io/taipei-station-maze/ （GitHub Pages，HTTP 200 已驗證）
- 3D 場景：✅ 6 層樓 Box + 30 節點 + 37 邊 + 路徑 Tube + 亮點動畫 + 起終點光暈環 + 鏡頭聚焦
- 尋路演算：✅ Dijkstra + 雙向鄰接表
- UI：✅ 起終點下拉（change 自動找）、找路徑/清除按鈕、步驟面板、hover tooltip
- CI/CD：✅ `.github/workflows/deploy.yml`（push main → build → deploy），13s build + 10s deploy
- Repo visibility：⚠️ 已從 private 轉為 **public**（因為 GH Pages 對 private repo 要 Pro 方案）

## ➡️ 下一步（收尾後的長期擴充選項）
以下都是 nice-to-have，不影響目前 MVP：
1. **座標校正**：找台北車站官方站體圖或 OSM 室內圖，把 30 節點的相對比例對齊真實距離
2. **節點擴充**：從 30 → 60~80，含 M1~M8/Y/Z/K/R 各區出口編號、微風/京站更細分區
3. **多路徑比較**：Yen's K-shortest paths，同時顯示前 3 條備選路徑
4. **時間軸模擬**：把「11.7 分鐘」變成可以播放的走路動畫，每步定格解說
5. **手機版**：目前 UI 面板在小螢幕會擠，可加 collapse 按鈕
6. **多語**：加英文/日文/韓文切換（車站對外國旅客的價值最高）
7. **深色/淺色主題切換**

## ⚠️ 注意事項
- 專案在 **Dropbox 底下**，git 已加 `windows.appendAtomically false` 避免同步衝突；請勿手動改 git config
- **node_modules/ 已在 .gitignore**，Dropbox 也不會同步
- 若之後改用其他電腦：`git clone https://github.com/allen54a0/taipei-station-maze` 後跑 `npm install` 即可
- 尋路節點座標「1 單位 = 5 公尺」；cost 同單位；步行速度假設 1.2 m/s（`renderSteps` 內）
- 節點座標「憑常識」放的，跟真實比例還沒對齊；Dijkstra 結果只反映當前座標的相對距離
- `window.__tsm` 掛 { scene, camera, renderer, nodesGroup, pathGroup, controls, THREE, findPath } 供 devtools 除錯
- **Repo 已改為 public**——之後 push 前記得確認不要 commit 任何敏感檔（目前沒有）

## 🕐 最後更新
- 時間：2026-09-18
- 更新者：Claude Opus 4.7 @ DESKTOP-P3BS830
- Git push：✅ 已推
- 部署：✅ 上線
