// 台北車站樞紐分層資料（MVP · 抽象幾何）
// 座標系統：1 單位 = 5 公尺；(x, z) 平面 x = 東西向、z = 南北向；y = 樓層高度

/**
 * 樓層清單（由下而上）
 * key   — 內部識別（不要改）
 * name  — UI 顯示名稱
 * y     — 樓層中心 y 座標（單位 = 5 公尺）
 * color — 半透明 Box 與標籤色
 * note  — 這層的重點內容（顯示在圖例）
 */
export const LEVELS = [
  { key: 'B4', name: 'B4', y: -30, color: 0x4a90e2, note: '北捷板南線 BL、淡水信義線 R 月台' },
  { key: 'B3', name: 'B3', y: -20, color: 0x50c9a5, note: '北捷穿堂層、機捷 A1 連通道' },
  { key: 'B2', name: 'B2', y: -10, color: 0xf5a623, note: '高鐵月台、機捷 A1 月台' },
  { key: 'B1', name: 'B1', y:   0, color: 0xf8e71c, note: '台鐵月台、大廳連通、地下街入口' },
  { key: '1F', name: '1F', y:  10, color: 0xd0021b, note: '主大廳（黑白格棋盤）、售票、四大門' },
  { key: '2F', name: '2F', y:  20, color: 0xbd10e0, note: '微風美食街、京站連通方向' },
];

/**
 * 節點清單（stub — 階段二會補完到約 30 個）
 * id    — 唯一識別
 * name  — UI 顯示
 * level — 所屬樓層 key
 * type  — 'platform' | 'hall' | 'transfer' | 'exit' | 'gate' | 'stair' | 'escalator'
 * pos   — [x, z]（y 由 level 決定）
 * lines — 服務的軌道系統（TRA=台鐵、THSR=高鐵、BL=板南線、R=淡水信義線、A=機場捷運）
 */
export const NODES = [
  // 五條線月台中心點（先各放一個佔位；階段二拆成月台頭尾兩端 + 閘門）
  { id: 'tra-platform',  name: '台鐵月台',       level: 'B1', type: 'platform', pos: [  0,   0], lines: ['TRA'] },
  { id: 'thsr-platform', name: '高鐵月台',       level: 'B2', type: 'platform', pos: [  0,   0], lines: ['THSR'] },
  { id: 'bl-platform',   name: '板南線月台 BL',  level: 'B4', type: 'platform', pos: [-40,   0], lines: ['BL'] },
  { id: 'r-platform',    name: '淡水信義線 R',   level: 'B4', type: 'platform', pos: [ 40,   0], lines: ['R'] },
  { id: 'a1-platform',   name: '機捷 A1 月台',   level: 'B2', type: 'platform', pos: [ 75, -20], lines: ['A'] },

  // 大廳／穿堂佔位
  { id: 'main-hall',     name: '1F 主大廳',      level: '1F', type: 'hall',     pos: [  0,   0], lines: [] },
  { id: 'metro-concourse', name: 'B3 北捷穿堂',  level: 'B3', type: 'hall',     pos: [  0,   0], lines: [] },
];

/**
 * 邊清單（stub — 階段三 Dijkstra 需要）
 * from/to — 節點 id
 * cost    — 步行成本（可以先用估算秒數，或步行距離÷1.2 m/s）
 */
export const EDGES = [
  // 之後階段二補齊：垂直（電扶梯／樓梯）＋ 水平（穿堂連通）
];
