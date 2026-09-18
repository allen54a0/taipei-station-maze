import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  LEVELS, NODES, EDGES, NODE_MAP, LEVEL_MAP, LINE_COLORS,
} from './data/graph.js';

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

// ---------------- Loop / Resize ----------------
function tick() {
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

// 開發用：暴露主要物件到 window 方便 devtools 除錯
window.__tsm = { scene, camera, renderer, nodesGroup, controls, THREE };

// ================ Builders ================

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
      // hall / transfer / stair
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

    // 只給月台常駐標籤（其他用 hover tooltip 避免視覺擁擠）
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
    vertexColors: true, transparent: true, opacity: 0.6,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.name = 'edges';
  scene.add(lines);
}

// ---------------- Raycaster + Tooltip ----------------

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

function labelType(t) {
  return ({
    platform: '月台', hall: '大廳', gate: '閘門',
    transfer: '穿堂／連通', exit: '出入口', stair: '樓梯',
    escalator: '電扶梯',
  })[t] ?? t;
}

// ---------------- Helpers ----------------

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
