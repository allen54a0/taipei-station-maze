// 台北車站樞紐分層 + 節點/邊資料（MVP 抽象幾何）
// -----------------------------------------------------------------------------
// 座標系統：1 單位 = 5 公尺
//   x = 東(+) / 西(-)
//   z = 南(+) / 北(-)
//   y = 樓層高度（由 LEVELS[key].y 決定）
// 車站主體：STATION_W = 180 (900m 東西向) × STATION_D = 90 (450m 南北向)
// 機捷 A1 位於車站主體西北方（承德路口），座標 x < -60、z < -15
// 節點位置為「憑常識簡化」，之後對照官方站體圖校正
// -----------------------------------------------------------------------------

/** 樓層清單（由下而上） */
export const LEVELS = [
  { key: 'B4', name: 'B4', y: -30, color: 0x4a90e2, note: '北捷板南線 BL、淡水信義線 R 月台' },
  { key: 'B3', name: 'B3', y: -20, color: 0x50c9a5, note: '北捷穿堂層、機捷 A1 連通道' },
  { key: 'B2', name: 'B2', y: -10, color: 0xf5a623, note: '高鐵月台、機捷 A1 月台' },
  { key: 'B1', name: 'B1', y:   0, color: 0xf8e71c, note: '台鐵月台、大廳連通、地下街入口' },
  { key: '1F', name: '1F', y:  10, color: 0xd0021b, note: '主大廳（黑白格棋盤）、售票、四大門' },
  { key: '2F', name: '2F', y:  20, color: 0xbd10e0, note: '微風美食街、京站連通方向' },
];

/** 服務線路顏色 */
export const LINE_COLORS = {
  TRA:  0x005599, // 台鐵
  THSR: 0xff6600, // 高鐵
  BL:   0x0070bd, // 板南線 藍
  R:    0xe3002c, // 淡水信義線 紅
  A:    0x612e91, // 機場捷運 紫
};

/**
 * 節點清單（MVP 30 個）
 * type: 'platform' | 'hall' | 'gate' | 'transfer' | 'exit' | 'stair'
 */
export const NODES = [
  // ---- B4 板南線 BL（東西向月台）----
  { id: 'bl-plat-w',   name: 'BL 月台（往頂埔）',   level: 'B4', type: 'platform', pos: [-70,   0], lines: ['BL'] },
  { id: 'bl-plat-e',   name: 'BL 月台（往南港）',   level: 'B4', type: 'platform', pos: [ 30,   0], lines: ['BL'] },
  { id: 'bl-gate',     name: 'BL 閘門',             level: 'B4', type: 'gate',     pos: [-20,   0], lines: ['BL'] },

  // ---- B4 淡水信義線 R（南北向月台）----
  { id: 'r-plat-n',    name: 'R 月台(往淡水/北投)', level: 'B4', type: 'platform', pos: [ 20, -30], lines: ['R'] },
  { id: 'r-plat-s',    name: 'R 月台（往象山）',    level: 'B4', type: 'platform', pos: [ 20,  30], lines: ['R'] },
  { id: 'r-gate',      name: 'R 閘門',              level: 'B4', type: 'gate',     pos: [ 20,   0], lines: ['R'] },

  // ---- B3 北捷穿堂 ----
  { id: 'b3-bl',       name: 'B3 板南線穿堂',       level: 'B3', type: 'transfer', pos: [-20,  10], lines: ['BL'] },
  { id: 'b3-r',        name: 'B3 淡水信義線穿堂',   level: 'B3', type: 'transfer', pos: [ 20,  10], lines: ['R'] },
  { id: 'b3-transfer', name: 'B3 兩線轉乘走廊',     level: 'B3', type: 'transfer', pos: [  0,  10], lines: ['BL', 'R'] },
  { id: 'b3-a1',       name: 'B3 機捷連通道',       level: 'B3', type: 'transfer', pos: [-55, -15], lines: ['A'] },

  // ---- B2 高鐵 ----
  { id: 'thsr-plat-w', name: '高鐵月台西端',        level: 'B2', type: 'platform', pos: [-30,  -5], lines: ['THSR'] },
  { id: 'thsr-plat-e', name: '高鐵月台東端',        level: 'B2', type: 'platform', pos: [ 30,  -5], lines: ['THSR'] },
  { id: 'thsr-gate',   name: '高鐵閘門',            level: 'B2', type: 'gate',     pos: [  0,  20], lines: ['THSR'] },

  // ---- B2 機捷 A1（車站西北方）----
  { id: 'a1-plat',      name: '機捷 A1 月台',       level: 'B2', type: 'platform', pos: [-80, -30], lines: ['A'] },
  { id: 'a1-gate',      name: '機捷 A1 閘門',       level: 'B2', type: 'gate',     pos: [-70, -20], lines: ['A'] },
  { id: 'a1-concourse', name: '機捷 A1 穿堂',       level: 'B2', type: 'transfer', pos: [-60, -12], lines: ['A'] },

  // ---- B1 台鐵三月台 ----
  { id: 'tra-plat-1',   name: '台鐵 第 1 月台',     level: 'B1', type: 'platform', pos: [  0, -15], lines: ['TRA'] },
  { id: 'tra-plat-2',   name: '台鐵 第 2 月台',     level: 'B1', type: 'platform', pos: [  0,   0], lines: ['TRA'] },
  { id: 'tra-plat-3',   name: '台鐵 第 3 月台',     level: 'B1', type: 'platform', pos: [  0,  15], lines: ['TRA'] },
  { id: 'tra-gate-w',   name: '台鐵 西閘門',        level: 'B1', type: 'gate',     pos: [-30,   5], lines: ['TRA'] },
  { id: 'tra-gate-e',   name: '台鐵 東閘門',        level: 'B1', type: 'gate',     pos: [ 30,   5], lines: ['TRA'] },

  // ---- B1 地下街 ----
  { id: 'z-underground', name: 'Z 區站前地下街',    level: 'B1', type: 'transfer', pos: [-55,  25], lines: [] },
  { id: 'y-underground', name: 'Y 區台北地下街',    level: 'B1', type: 'transfer', pos: [ 55, -25], lines: [] },

  // ---- 1F 主大廳與四門 ----
  { id: 'hall-center', name: '1F 主大廳（黑白棋盤）', level: '1F', type: 'hall', pos: [  0,   0], lines: [] },
  { id: 'exit-w',      name: '西一出口（忠孝西路）', level: '1F', type: 'exit', pos: [-70,   5], lines: [] },
  { id: 'exit-e',      name: '東三出口（公園路）',   level: '1F', type: 'exit', pos: [ 70,  -5], lines: [] },
  { id: 'exit-s',      name: '南二出口（襄陽路）',   level: '1F', type: 'exit', pos: [  5,  35], lines: [] },
  { id: 'exit-n',      name: '北一出口（市民大道）', level: '1F', type: 'exit', pos: [ -5, -35], lines: [] },

  // ---- 2F 微風美食街 ----
  { id: '2f-breeze',    name: '2F 微風美食街',      level: '2F', type: 'hall', pos: [  0,   0], lines: [] },
  { id: '2f-jingzhan',  name: '2F 京站連通',        level: '2F', type: 'exit', pos: [ 30, -35], lines: [] },
];

/** 節點/樓層查表 */
export const NODE_MAP  = Object.fromEntries(NODES.map(n => [n.id, n]));
export const LEVEL_MAP = Object.fromEntries(LEVELS.map(l => [l.key, l]));

/**
 * 邊 raw：只寫連通關係與類型；cost 由 edgeCost 計算
 * type: 'walk' | 'gate' | 'escalator' | 'stair'
 *   walk      → 用歐氏距離（含樓層 y 差）
 *   gate      → 固定 5（過票閘）
 *   escalator → 固定 15（電扶梯上下一層）
 *   stair     → 固定 20（樓梯上下一層，比電扶梯累）
 */
const EDGE_TYPE_COST = { walk: null, gate: 5, escalator: 15, stair: 20 };

function edgeCost({ from, to, type }) {
  const preset = EDGE_TYPE_COST[type];
  if (preset != null) return preset;
  const a = NODE_MAP[from], b = NODE_MAP[to];
  if (!a || !b) return 999;
  const dx = a.pos[0] - b.pos[0];
  const dz = a.pos[1] - b.pos[1];
  const dy = LEVEL_MAP[a.level].y - LEVEL_MAP[b.level].y;
  return Math.round(Math.hypot(dx, dz, dy));
}

const RAW_EDGES = [
  // === B4 同層 ===
  { from: 'bl-plat-w', to: 'bl-gate', type: 'walk' },
  { from: 'bl-plat-e', to: 'bl-gate', type: 'walk' },
  { from: 'r-plat-n',  to: 'r-gate',  type: 'walk' },
  { from: 'r-plat-s',  to: 'r-gate',  type: 'walk' },

  // === B3 同層 ===
  { from: 'b3-bl',       to: 'b3-transfer', type: 'walk' },
  { from: 'b3-r',        to: 'b3-transfer', type: 'walk' },
  { from: 'b3-bl',       to: 'b3-a1',       type: 'walk' },

  // === B2 同層 ===
  { from: 'thsr-plat-w', to: 'thsr-gate',    type: 'walk' },
  { from: 'thsr-plat-e', to: 'thsr-gate',    type: 'walk' },
  { from: 'a1-plat',     to: 'a1-gate',      type: 'walk' },
  { from: 'a1-gate',     to: 'a1-concourse', type: 'walk' },

  // === B1 同層 ===
  { from: 'tra-plat-1',   to: 'tra-gate-w', type: 'walk' },
  { from: 'tra-plat-2',   to: 'tra-gate-w', type: 'walk' },
  { from: 'tra-plat-3',   to: 'tra-gate-w', type: 'walk' },
  { from: 'tra-plat-1',   to: 'tra-gate-e', type: 'walk' },
  { from: 'tra-plat-2',   to: 'tra-gate-e', type: 'walk' },
  { from: 'tra-plat-3',   to: 'tra-gate-e', type: 'walk' },
  { from: 'tra-gate-w',   to: 'z-underground', type: 'walk' },
  { from: 'tra-gate-e',   to: 'y-underground', type: 'walk' },

  // === 1F 大廳四通八達 ===
  { from: 'hall-center',  to: 'exit-w', type: 'walk' },
  { from: 'hall-center',  to: 'exit-e', type: 'walk' },
  { from: 'hall-center',  to: 'exit-s', type: 'walk' },
  { from: 'hall-center',  to: 'exit-n', type: 'walk' },

  // === 2F 同層 ===
  { from: '2f-breeze',    to: '2f-jingzhan', type: 'walk' },

  // === 垂直 B4 → B3 ===
  { from: 'bl-gate', to: 'b3-bl', type: 'escalator' },
  { from: 'r-gate',  to: 'b3-r',  type: 'escalator' },

  // === 垂直 B3 → B2 ===
  { from: 'b3-transfer', to: 'thsr-gate',    type: 'escalator' },
  { from: 'b3-a1',       to: 'a1-concourse', type: 'escalator' },

  // === 垂直 B2 → B1 ===
  { from: 'thsr-gate',   to: 'tra-gate-w',   type: 'escalator' },
  { from: 'thsr-gate',   to: 'tra-gate-e',   type: 'escalator' },
  { from: 'a1-concourse', to: 'z-underground', type: 'escalator' },

  // === 垂直 B1 → 1F ===
  { from: 'tra-gate-w',    to: 'hall-center', type: 'escalator' },
  { from: 'tra-gate-e',    to: 'hall-center', type: 'escalator' },
  { from: 'z-underground', to: 'exit-w',      type: 'stair' },
  { from: 'y-underground', to: 'exit-e',      type: 'stair' },

  // === 垂直 1F → 2F ===
  { from: 'hall-center', to: '2f-breeze',   type: 'escalator' },
  { from: 'exit-n',      to: '2f-jingzhan', type: 'stair' },
];

export const EDGES = RAW_EDGES.map(e => ({ ...e, cost: edgeCost(e) }));
