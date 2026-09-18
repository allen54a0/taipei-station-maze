import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LEVELS, NODES } from './data/graph.js';

// 1 單位 = 5 公尺
const STATION_W = 180; // 東西向約 900 m（涵蓋台北車站主體 + 機捷延伸）
const STATION_D = 90;  // 南北向約 450 m
const FLOOR_H = 6;     // 樓層厚度約 30 m 視覺（實際 5~7 m，這裡拉高視覺分層）

// ---------------- Renderer / Scene / Camera ----------------
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);
scene.fog = new THREE.Fog(0x0b1020, 260, 620);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
camera.position.set(160, 120, 180);

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

// ---------------- 樓層 Box ----------------
const levelsGroup = new THREE.Group();
levelsGroup.name = 'levels';
scene.add(levelsGroup);

for (const lv of LEVELS) {
  // 半透明樓層本體
  const geo = new THREE.BoxGeometry(STATION_W, FLOOR_H, STATION_D);
  const mat = new THREE.MeshStandardMaterial({
    color: lv.color,
    transparent: true,
    opacity: 0.16,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false, // 半透明堆疊時避免遮擋錯誤
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = lv.y;
  mesh.name = `floor-${lv.key}`;
  levelsGroup.add(mesh);

  // 邊框線（讓樓層輪廓清楚）
  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: lv.color,
      transparent: true,
      opacity: 0.7,
    }),
  );
  line.position.y = lv.y;
  levelsGroup.add(line);

  // 樓層名 sprite（貼在西側）
  const label = makeLabelSprite(lv.name, lv.color);
  label.position.set(-STATION_W / 2 - 10, lv.y, 0);
  levelsGroup.add(label);
}

// ---------------- 節點占位球（stub — 之後尋路會用）----------------
const nodesGroup = new THREE.Group();
nodesGroup.name = 'nodes';
scene.add(nodesGroup);

const nodeGeo = new THREE.SphereGeometry(1.6, 16, 12);

for (const node of NODES) {
  const level = LEVELS.find(l => l.key === node.level);
  if (!level) continue;
  const mat = new THREE.MeshStandardMaterial({
    color: node.type === 'platform' ? level.color : 0xffffff,
    emissive: node.type === 'platform' ? level.color : 0x333355,
    emissiveIntensity: 0.4,
    roughness: 0.4,
  });
  const sphere = new THREE.Mesh(nodeGeo, mat);
  sphere.position.set(node.pos[0], level.y, node.pos[1]);
  sphere.userData = node;
  sphere.name = `node-${node.id}`;
  nodesGroup.add(sphere);

  const nlabel = makeLabelSprite(node.name, 0xffffff, 32);
  nlabel.position.set(node.pos[0], level.y + 4, node.pos[1]);
  nlabel.scale.set(12, 6, 1);
  nodesGroup.add(nlabel);
}

// ---------------- 網格輔助（底層下方）----------------
const grid = new THREE.GridHelper(400, 40, 0x334488, 0x1a2244);
grid.position.y = LEVELS[0].y - FLOOR_H / 2 - 0.5;
scene.add(grid);

// ---------------- UI：填充圖例 ----------------
populateLegend();

// ---------------- Loop ----------------
function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// ---------------- Resize ----------------
addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ================ Helpers ================

function makeLabelSprite(text, color, fontPx = 64) {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.font = `bold ${fontPx}px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false, // 讓標籤永遠可見
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(20, 10, 1);
  sp.renderOrder = 999;
  return sp;
}

function populateLegend() {
  const list = document.querySelector('#legend-list');
  if (!list) return;
  // 從上到下顯示（跟 3D 視覺方向一致）
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
