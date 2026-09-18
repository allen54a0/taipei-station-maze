import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  LEVELS, NODES, EDGES, NODE_MAP, LEVEL_MAP, LINE_COLORS,
} from './data/graph.js';
import { findPath } from './pathfind.js';

// 1 單位 = 5 公尺
const STATION_W = 180;
const STATION_D = 90;
const FLOOR_H = 6;

// ---------------- Renderer / Scene / Camera ----------------
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);
scene.fog = new THREE.Fog(0x0b1020, 280, 640);

const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 2000,
);
camera.position.set(180, 130, 200);

// ---------------- Lights ----------------
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
keyLight.position.set(120, 200, 100);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x88aaff, 0.4);
rimLight.position.set(-100, -60, -80);
scene.add(rimLight);

// ---------------- Controls ----------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 30;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);
controls.update();

// ---------------- Build ----------------
buildFloors();

const nodesGroup = new THREE.Group();
nodesGroup.name = 'nodes';
scene.add(nodesGroup);
buildNodes();

buildEdges();

const grid = new THREE.GridHelper(400, 40, 0x334488, 0x1a2244);
grid.position.y = LEVELS[0].y - FLOOR_H / 2 - 0.5;
scene.add(grid);

populateLegend();
setupRaycaster();

// ---------------- Path 群組 + 狀態 ----------------
const pathGroup = new THREE.Group();
pathGroup.name = 'path';
scene.add(pathGroup);

/** @type {{ curve: THREE.Curve, t: number, speed: number, marker: THREE.Mesh } | null} */
let pathAnim = null;

populatePathSelects();
setupPathfinderUI();
runFind();   // 開場預設就顯示一條路徑

// ---------------- Loop / Resize ----------------
let lastTime = performance.now();

function tick() {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (pathAnim) {
    pathAnim.t += pathAnim.speed * dt;
    if (pathAnim.t > 1.15) pathAnim.t = -0.05;      // 循環,兩端各留短暫停頓
    const tt = Math.max(0, Math.min(1, pathAnim.t));
    pathAnim.curve.getPointAt(tt, pathAnim.marker.position);
    // 微微上下浮動,讓亮點看起來活的
    pathAnim.marker.position.y += Math.sin(now * 0.005) * 0.4;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 開發除錯用
window.__tsm = { scene, camera, renderer, nodesGroup, pathGroup, controls, THREE, findPath };

// =====================================================================
// Builders
// =====================================================================

function buildFloors() {
  const group = new THREE.Group();
  group.name = 'levels';
  scene.add(group);

  for (const lv of LEVELS) {
    const geo = new THREE.BoxGeometry(STATION_W, FLOOR_H, STATION_D);
    const mat = new THREE.MeshStandardMaterial({
      color: lv.color,
      transparent: true,
      opacity: 0.13,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = lv.y;
    mesh.name = `floor-${lv.key}`;
    group.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: lv.color, transparent: true, opacity: 0.55 }),
    );
    line.position.y = lv.y;
    group.add(line);

    const label = makeLabelSprite(lv.name, lv.color, 64);
    label.position.set(-STATION_W / 2 - 10, lv.y, 0);
    label.scale.set(20, 10, 1);
    group.add(label);
  }
}

function buildNodes() {
  const platformGeo = new THREE.SphereGeometry(3.6, 20, 14);
  const gateGeo     = new THREE.SphereGeometry(2.2, 14, 10);
  const hallGeo     = new THREE.SphereGeometry(2.8, 16, 12);

  for (const node of NODES) {
    const level = LEVEL_MAP[node.level];
    if (!level) continue;

    let geo, color, emissive;
    if (node.type === 'platform') {
      color = node.lines?.[0] ? LINE_COLORS[node.lines[0]] : level.color;
      emissive = color;
      geo = platformGeo;
    } else if (node.type === 'gate') {
      geo = gateGeo;
      color = 0xaaccff;
      emissive = 0x2244aa;
    } else if (node.type === 'exit') {
      geo = hallGeo;
      color = 0xffffff;
      emissive = 0x224466;
    } else {
      geo = hallGeo;
      color = 0xddddff;
      emissive = 0x334477;
    }

    const mat = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: 0.45, roughness: 0.4,
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(node.pos[0], level.y, node.pos[1]);
    sphere.userData = { ...node, _baseEmissive: 0.45 };
    sphere.name = `node-${node.id}`;
    nodesGroup.add(sphere);

    if (node.type === 'platform') {
      const label = makeLabelSprite(node.name, color, 30);
      label.position.set(node.pos[0], level.y + 4.5, node.pos[1]);
      label.scale.set(20, 6, 1);
      nodesGroup.add(label);
    }
  }
}

function buildEdges() {
  const positions = [];
  const colors = [];
  const walkColor = new THREE.Color(0x66aaff);
  const vertColor = new THREE.Color(0xffcc66);

  for (const e of EDGES) {
    const a = NODE_MAP[e.from], b = NODE_MAP[e.to];
    if (!a || !b) continue;
    const ay = LEVEL_MAP[a.level].y;
    const by = LEVEL_MAP[b.level].y;
    positions.push(a.pos[0], ay, a.pos[1]);
    positions.push(b.pos[0], by, b.pos[1]);
    const c = (e.type === 'escalator' || e.type === 'stair') ? vertColor : walkColor;
    colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.55,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.name = 'edges';
  scene.add(lines);
}

// =====================================================================
// Raycaster + Tooltip
// =====================================================================

function setupRaycaster() {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tooltip = document.querySelector('#tooltip');
  let hovered = null;

  function clearHover() {
    if (!hovered) return;
    hovered.material.emissiveIntensity = hovered.userData._baseEmissive ?? 0.45;
    hovered = null;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
    canvas.style.cursor = '';
  }

  canvas.addEventListener('pointermove', (ev) => {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const meshes = nodesGroup.children.filter(o => o.isMesh);
    const hits = raycaster.intersectObjects(meshes, false);

    const first = hits[0]?.object;
    if (first && first.userData?.id) {
      if (hovered !== first) {
        if (hovered) hovered.material.emissiveIntensity = hovered.userData._baseEmissive ?? 0.45;
        hovered = first;
        hovered.material.emissiveIntensity = 1.15;
      }
      showTooltip(ev.clientX, ev.clientY, first.userData);
      canvas.style.cursor = 'pointer';
    } else {
      clearHover();
    }
  });

  canvas.addEventListener('pointerleave', clearHover);

  function showTooltip(x, y, node) {
    const level = LEVEL_MAP[node.level];
    const tags = (node.lines || [])
      .map(l => `<span class="tag tag-${l.toLowerCase()}">${l}</span>`)
      .join('');
    tooltip.innerHTML = `
      <div class="t-name">${node.name}</div>
      <div class="t-meta">${level?.name ?? ''} · ${labelType(node.type)}</div>
      ${tags ? `<div class="t-lines">${tags}</div>` : ''}
    `;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }
}

// =====================================================================
// Pathfinder UI
// =====================================================================

function populatePathSelects() {
  const fromEl = document.querySelector('#from-select');
  const toEl   = document.querySelector('#to-select');
  const opts = NODES.map(n => {
    const lv = LEVEL_MAP[n.level];
    return `<option value="${n.id}">${lv.name} · ${n.name}</option>`;
  }).join('');
  fromEl.innerHTML = `<option value="">— 選擇起點 —</option>` + opts;
  toEl.innerHTML   = `<option value="">— 選擇終點 —</option>` + opts;

  // 一個有趣的預設(機捷 A1 月台 → 淡水信義線 R 月台南端)
  fromEl.value = 'a1-plat';
  toEl.value   = 'r-plat-s';
}

function setupPathfinderUI() {
  document.querySelector('#find-btn').addEventListener('click', runFind);
  document.querySelector('#clear-btn').addEventListener('click', clearPath);
  document.querySelector('#from-select').addEventListener('change', autoFind);
  document.querySelector('#to-select').addEventListener('change', autoFind);
}

function autoFind() {
  const f = document.querySelector('#from-select').value;
  const t = document.querySelector('#to-select').value;
  if (f && t) runFind();
}

function runFind() {
  const fromId = document.querySelector('#from-select').value;
  const toId   = document.querySelector('#to-select').value;
  if (!fromId || !toId) {
    showResultMessage('請選擇起點與終點', 'warn');
    return;
  }
  const result = findPath(fromId, toId);
  if (!result) {
    showResultMessage('找不到路徑（節點未連通）', 'warn');
    return;
  }
  drawPath(result);
  renderSteps(result);
}

function drawPath(result) {
  clearPathScene();
  const points = result.path.map(id => nodePosVec3(id)).filter(Boolean);
  if (points.length < 2) return;

  // 用 CatmullRomCurve3 平滑一點,再拉成 Tube
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.15);
  const segments = Math.max(64, points.length * 12);
  const tubeGeo = new THREE.TubeGeometry(curve, segments, 0.9, 10, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x66ff99,
    emissive: 0x33cc66,
    emissiveIntensity: 1.0,
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.renderOrder = 100;
  pathGroup.add(tube);

  // 動畫亮點
  const markerGeo = new THREE.SphereGeometry(2.5, 20, 14);
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffee66,
    emissiveIntensity: 2.2,
  });
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.position.copy(points[0]);
  marker.renderOrder = 101;
  pathGroup.add(marker);

  // 起終點光暈
  addHalo(points[0],                    0x00ff88);
  addHalo(points[points.length - 1],    0xff6644);

  pathAnim = { curve, t: 0, speed: 0.35, marker };
}

function addHalo(pos, color) {
  const geo = new THREE.RingGeometry(3.8, 5.2, 32);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.7,
    side: THREE.DoubleSide, depthTest: false,
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.copy(pos);
  ring.rotation.x = -Math.PI / 2;
  ring.renderOrder = 500;
  pathGroup.add(ring);
}

function clearPath() {
  clearPathScene();
  const el = document.querySelector('#path-result');
  el.hidden = true;
}

function clearPathScene() {
  while (pathGroup.children.length > 0) {
    const c = pathGroup.children[0];
    pathGroup.remove(c);
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
  }
  pathAnim = null;
}

function renderSteps(result) {
  const el = document.querySelector('#path-result');
  const summary = el.querySelector('.result-summary');
  const list = el.querySelector('.result-steps');

  const meters = result.totalCost * 5;                 // 1 單位 = 5 m
  const minutes = (meters / 1.2 / 60).toFixed(1);      // 步行 1.2 m/s
  summary.textContent = `${result.path.length - 1} 段 · 約 ${meters} 公尺 · 步行約 ${minutes} 分鐘`;

  list.innerHTML = result.edges.map((e, i) => {
    const from = NODE_MAP[result.path[i]];
    const to   = NODE_MAP[result.path[i + 1]];
    return `<li>${from.name}<span class="step-verb">${verbOf(e.type)}</span>${to.name}</li>`;
  }).join('');
  el.hidden = false;
}

function showResultMessage(msg, kind) {
  const el = document.querySelector('#path-result');
  const summary = el.querySelector('.result-summary');
  const list = el.querySelector('.result-steps');
  summary.textContent = (kind === 'warn' ? '⚠️ ' : '') + msg;
  list.innerHTML = '';
  el.hidden = false;
}

function verbOf(t) {
  return ({
    walk: '→ 走 →', gate: '→ 過閘 →',
    escalator: '→ 電扶梯 →', stair: '→ 樓梯 →',
  })[t] ?? '→';
}

function nodePosVec3(nodeId) {
  const n = NODE_MAP[nodeId];
  if (!n) return null;
  const y = LEVEL_MAP[n.level].y;
  return new THREE.Vector3(n.pos[0], y, n.pos[1]);
}

function labelType(t) {
  return ({
    platform: '月台', hall: '大廳', gate: '閘門',
    transfer: '穿堂／連通', exit: '出入口', stair: '樓梯',
    escalator: '電扶梯',
  })[t] ?? t;
}

// =====================================================================
// Helpers
// =====================================================================

function makeLabelSprite(text, color, fontPx = 64) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.font = `bold ${fontPx}px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(20, 5, 1);
  sp.renderOrder = 999;
  return sp;
}

function populateLegend() {
  const list = document.querySelector('#legend-list');
  if (!list) return;
  const ordered = [...LEVELS].reverse();
  list.innerHTML = ordered
    .map((lv) => {
      const hex = '#' + lv.color.toString(16).padStart(6, '0');
      return `<li>
        <span class="swatch" style="background:${hex}"></span>
        <span class="lv-name">${lv.name}</span>
        <span class="lv-note">${lv.note}</span>
      </li>`;
    })
    .join('');
}
