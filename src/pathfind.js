// Dijkstra 最短路徑
// 30 節點用陣列線性掃描找 min 就秒殺，不必上 binary heap
// 未來若節點擴增到 100+ 再換 heap（可用 mnemonist 的 FibonacciHeap 或自刻）

import { NODES, EDGES, NODE_MAP } from './data/graph.js';

/** 建雙向鄰接表：nodeId → [{ to, cost, type, edge }] */
function buildAdjacency() {
  const adj = new Map();
  for (const n of NODES) adj.set(n.id, []);
  for (const e of EDGES) {
    adj.get(e.from)?.push({ to: e.to,   cost: e.cost, type: e.type, edge: e });
    adj.get(e.to)?.push  ({ to: e.from, cost: e.cost, type: e.type, edge: e });
  }
  return adj;
}

const ADJ = buildAdjacency();

/**
 * Dijkstra
 * @param {string} fromId
 * @param {string} toId
 * @returns {{ path: string[], edges: object[], totalCost: number } | null}
 */
export function findPath(fromId, toId) {
  if (!ADJ.has(fromId) || !ADJ.has(toId)) return null;
  if (fromId === toId) return { path: [fromId], edges: [], totalCost: 0 };

  const dist = new Map();
  const prev = new Map();   // toId → { from: nodeId, edge }
  const visited = new Set();
  for (const id of ADJ.keys()) dist.set(id, Infinity);
  dist.set(fromId, 0);

  while (visited.size < ADJ.size) {
    // 找出「未 visit 且 dist 最小」的節點
    let u = null;
    let uDist = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < uDist) {
        u = id;
        uDist = d;
      }
    }
    if (u === null) break;
    if (u === toId) break;
    visited.add(u);

    for (const nb of ADJ.get(u)) {
      if (visited.has(nb.to)) continue;
      const alt = uDist + nb.cost;
      if (alt < dist.get(nb.to)) {
        dist.set(nb.to, alt);
        prev.set(nb.to, { from: u, edge: nb.edge });
      }
    }
  }

  if (!prev.has(toId)) return null;

  // 回溯路徑
  const path = [toId];
  const edges = [];
  let cur = toId;
  while (cur !== fromId) {
    const p = prev.get(cur);
    if (!p) return null;
    edges.unshift(p.edge);
    path.unshift(p.from);
    cur = p.from;
  }
  return { path, edges, totalCost: dist.get(toId) };
}

/**
 * 幫 UI 用：把 path/edges 展成一步一步的物件陣列
 */
export function humanizeSteps(path, edges) {
  return edges.map((e, i) => ({
    from: NODE_MAP[path[i]],
    to:   NODE_MAP[path[i + 1]],
    type: e.type,
    cost: e.cost,
  }));
}
