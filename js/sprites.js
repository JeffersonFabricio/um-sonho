// ============================================================
// Marés do Recife — pixel art procedural (sem imagens externas)
// Canvas lógico 360x640, unidade de "pixel" U=4 (grade 90x160)
// ============================================================
const U = 4;

function PR(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
// retângulo em unidades de pixel-art
function PU(ctx, x, y, w, h, c) { PR(ctx, x * U, y * U, w * U, h * U, c); }

// desenha sprite a partir de mapa de strings
function drawMap(ctx, map, pal, x, y, s = U) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      PR(ctx, x + c * s, y + r * s, s, s, col);
    }
  }
}

// ---------- personagens ----------
const MAJU_MAP = [
  '..hhhh..',
  '.hhhhhh.',
  'hhhhhhhh',
  'hffffffh',
  'hfkffkfh',
  'hffffffh',
  'h.fmmf.h',
  '..ffff..',
  '.yyyyyy.',
  'yyryyryy',
  'yyyyyyyy',
  '.yyyyyy.',
  '..f..f..',
  '..f..f..',
  '.bb..bb.',
];
const MAJU_PAL = { h: '#2a1a12', f: '#a9683f', k: '#1c0f08', m: '#7c3a2d', y: '#f2c038', r: '#d94f4f', b: '#8a4b2a' };

const VOVO_MAP = [
  '..pppp..',
  '.pppppp.',
  'pppppppp',
  '.ffffff.',
  '.fkffkf.',
  '.ffffff.',
  '.wwwwww.',
  '.cccccc.',
  'cccccccc',
  'cccccccc',
  '.nnnnnn.',
  '..n..n..',
  '..n..n..',
  '.bb..bb.',
];
const VOVO_PAL = { p: '#d9b25c', f: '#8a5a3a', k: '#1c0f08', w: '#e8e4da', c: '#3a6ea5', n: '#6b4a2f', b: '#4a3320' };

const MAJU_FACE = [
  '.hhhhhhhhhh.',
  'hhhhhhhhhhhh',
  'hhhhhhhhhhhh',
  'hhhffffffhhh',
  'hhffffffffhh',
  'hffkffffkffh',
  'hffkffffkffh',
  'hffffffffffh',
  'hhffmmmmffhh',
  'hhffffffffhh',
  '.hhffffffhh.',
  '..hhhhhhhh..',
];
const VOVO_FACE = [
  '...pppppp...',
  '.pppppppppp.',
  'pppppppppppp',
  '.hffffffffh.',
  '.ffffffffff.',
  '.ffkffffkff.',
  '.ffffffffff.',
  '.fwwffffwwf.',
  '.wwwwwwwwww.',
  '.wwwwwwwwww.',
  '..wwwwwwww..',
  '...wwwwww...',
];
const FACE_PAL = {
  h: '#2a1a12', f: '#a9683f', k: '#1c0f08', m: '#7c3a2d',
  p: '#d9b25c', w: '#e8e4da',
};
const VOVO_FACE_PAL = { ...FACE_PAL, f: '#8a5a3a' };

const CRAB_MAP = [
  'c..........c',
  '.c...cc...c.',
  '.cc.rrrr.cc.',
  '..rrrrrrrr..',
  '.rrkrrrrkrr.',
  '..rrrrrrrr..',
  '.c..c..c..c.',
  'c..c....c..c',
];
const CRAB_PAL = { c: '#c2552f', r: '#e06a3a', k: '#ffffff' };

const SHARK_MAP = [
  '......ss........',
  '.....ssss.....s.',
  '.ssssssssssssss.',
  'sskssssssssssss.',
  'swwwwwwwsssss...',
  '.swwwwwsss......',
  '...ssss.........',
];
const SHARK_PAL = { s: '#5a6b7a', w: '#c8d4dc', k: '#0e141a' };

function drawMaju(ctx, x, y, s = U) { drawMap(ctx, MAJU_MAP, MAJU_PAL, x, y, s); }
function drawVovo(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, VOVO_PAL, x, y, s); }
function drawCrab(ctx, x, y, s = U) { drawMap(ctx, CRAB_MAP, CRAB_PAL, x, y, s); }
function drawShark(ctx, x, y, s = U, flip = false) {
  if (flip) {
    ctx.save();
    ctx.translate(x + 16 * s, y);
    ctx.scale(-1, 1);
    drawMap(ctx, SHARK_MAP, SHARK_PAL, 0, 0, s);
    ctx.restore();
  } else drawMap(ctx, SHARK_MAP, SHARK_PAL, x, y, s);
}

// ---------- elementos de cena ----------
const CASA_CORES = ['#d94f4f', '#e8b94a', '#5b8bd9', '#67b06b', '#c97bb6', '#e8855b'];

function skyBands(ctx, colors, y0 = 0, y1 = 640) {
  const h = (y1 - y0) / colors.length;
  colors.forEach((c, i) => PR(ctx, 0, y0 + i * h, 360, h + 1, c));
}

function sun(ctx, cx, cy, r, t, core = '#ffd94a', glow = '#ffb24a') {
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.3;
    const rx = cx + Math.cos(a) * (r + 10 + Math.sin(t * 2 + i) * 3);
    const ry = cy + Math.sin(a) * (r + 10 + Math.sin(t * 2 + i) * 3);
    PR(ctx, rx - 3, ry - 3, 6, 6, glow);
  }
  PR(ctx, cx - r, cy - r / 2, r * 2, r, core);
  PR(ctx, cx - r / 2, cy - r, r, r * 2, core);
  PR(ctx, cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, core);
}

function cloud(ctx, x, y, w, c = '#ffffff') {
  PR(ctx, x, y, w, 10);
  PR(ctx, x + w * 0.2, y - 6, w * 0.5, 8, c);
  PR(ctx, x, y, w, 10, c);
}

function casario(ctx, yBase, seed = 0) {
  // casario colorido do Recife Antigo
  let x = -8;
  let i = seed;
  while (x < 360) {
    const w = 44 + ((i * 13) % 3) * 8;
    const h = 70 + ((i * 7) % 4) * 14;
    const c = CASA_CORES[i % CASA_CORES.length];
    PR(ctx, x, yBase - h, w, h, c);
    PR(ctx, x, yBase - h, w, 6, '#f5efe0'); // platibanda
    // janelas coloniais
    for (let wy = yBase - h + 14; wy < yBase - 16; wy += 22) {
      for (let wx = x + 6; wx < x + w - 10; wx += 16) {
        PR(ctx, wx, wy, 8, 12, '#f5efe0');
        PR(ctx, wx + 1, wy + 2, 6, 9, '#2a3a4f');
      }
    }
    x += w + 4;
    i++;
  }
  // torre da igreja
  PR(ctx, 296, yBase - 130, 30, 130, '#f5efe0');
  PR(ctx, 292, yBase - 138, 38, 10, '#d9b25c');
  PR(ctx, 304, yBase - 158, 14, 22, '#f5efe0');
  PR(ctx, 308, yBase - 168, 6, 12, '#d9b25c');
  PR(ctx, 306, yBase - 124, 10, 14, '#2a3a4f');
}

function sea(ctx, y0, y1, t, base = '#1d6fa3', deep = '#15578a', foam = '#bfe6f2') {
  PR(ctx, 0, y0, 360, y1 - y0, base);
  PR(ctx, 0, y0 + (y1 - y0) * 0.5, 360, (y1 - y0) * 0.5, deep);
  for (let r = 0; r < 6; r++) {
    const y = y0 + 8 + r * ((y1 - y0 - 16) / 6);
    for (let k = 0; k < 5; k++) {
      const x = ((k * 90 + Math.sin(t * 1.2 + r * 1.7 + k) * 22) % 400) - 20;
      PR(ctx, x, y, 26, 3, foam);
    }
  }
}

function sand(ctx, y0, y1, c = '#e8d49a', dot = '#d4ba7e') {
  PR(ctx, 0, y0, 360, y1 - y0, c);
  for (let i = 0; i < 40; i++) {
    const x = (i * 53) % 360;
    const y = y0 + ((i * 37) % (y1 - y0));
    PR(ctx, x, y, 3, 3, dot);
  }
}

function rainFx(ctx, t, c = '#9fc4e0') {
  for (let i = 0; i < 36; i++) {
    const x = (i * 67 + 40) % 380 - 10;
    const y = ((i * 131 + t * 420) % 700) - 30;
    PR(ctx, x, y, 2, 12, c);
  }
}

function bandeirinhas(ctx, y, t) {
  PR(ctx, 0, y, 360, 2, '#3a2a1a');
  const cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6'];
  for (let i = 0; i < 12; i++) {
    const x = i * 30 + 6;
    const sway = Math.sin(t * 2 + i) * 2;
    ctx.fillStyle = cores[i % cores.length];
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + 16, y + 2);
    ctx.lineTo(x + 8 + sway, y + 16);
    ctx.closePath();
    ctx.fill();
  }
}

function coqueiro(ctx, x, yBase, h = 80) {
  for (let i = 0; i < h; i += 8) {
    PR(ctx, x + Math.sin(i * 0.05) * 6, yBase - i, 8, 9, '#8a5a3a');
  }
  const tx = x + Math.sin(h * 0.05) * 6 + 4;
  const ty = yBase - h;
  [[-26, -8], [-16, -16], [0, -20], [16, -16], [26, -8]].forEach(([dx, dy]) => {
    PR(ctx, tx + dx - 6, ty + dy, 18, 6, '#2f7d3f');
    PR(ctx, tx + dx / 2 - 5, ty + dy / 2 - 2, 14, 5, '#3f9b52');
  });
  PR(ctx, tx - 5, ty - 2, 6, 6, '#6b4a2f');
  PR(ctx, tx + 1, ty + 1, 6, 6, '#6b4a2f');
}

function jangadaSil(ctx, x, y, s = 1, sil = null) {
  const hull = sil || '#6b4a2f';
  const sail = sil || '#f5efe0';
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 30 * s, y);
  ctx.lineTo(x + 30 * s, y);
  ctx.lineTo(x + 22 * s, y + 8 * s);
  ctx.lineTo(x - 22 * s, y + 8 * s);
  ctx.closePath();
  ctx.fill();
  PR(ctx, x - 2 * s, y - 38 * s, 3 * s, 38 * s, hull);
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(x + 1 * s, y - 38 * s);
  ctx.lineTo(x + 24 * s, y - 4 * s);
  ctx.lineTo(x + 1 * s, y - 4 * s);
  ctx.closePath();
  ctx.fill();
}

function antena(ctx, x, y, s = 1, c = '#1a2f26') {
  // parabólica enfiada na lama (símbolo do manguebeat)
  PR(ctx, x - 2 * s, y - 40 * s, 4 * s, 40 * s, c);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y - 46 * s, 20 * s, 8 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  PR(ctx, x - 1, y - 52 * s, 2, 8 * s, c);
}

function stars(ctx, n = 40, yMax = 300) {
  for (let i = 0; i < n; i++) {
    const x = (i * 89 + 23) % 360;
    const y = (i * 53 + 11) % yMax;
    PR(ctx, x, y, 2, 2, i % 4 === 0 ? '#fff8d0' : '#9fb4d0');
  }
}

function confete(ctx, t) {
  const cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6', '#e8855b'];
  for (let i = 0; i < 30; i++) {
    const x = (i * 73 + Math.sin(t * 2 + i) * 30 + 360) % 360;
    const y = ((i * 113 + t * 90) % 700) - 30;
    PR(ctx, x, y, 5, 5, cores[i % cores.length]);
  }
}

function sombrinha(ctx, cx, cy, r, rot, cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b']) {
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = cores[i % cores.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, rot + (i / 8) * Math.PI * 2, rot + ((i + 1) / 8) * Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  PR(ctx, cx - 1, cy - 1, 3, 3, '#3a2a1a');
}

function alfaiaDrum(ctx, x, y, w, h) {
  PR(ctx, x, y, w, h, '#8a5a3a');
  PR(ctx, x, y, w, 6, '#e8d4b0');
  PR(ctx, x, y + h - 5, w, 5, '#5a3a22');
  ctx.strokeStyle = '#e8d4b0';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const x0 = x + (i / 4) * w;
    ctx.beginPath();
    ctx.moveTo(x0, y + 6);
    ctx.lineTo(x0 + w / 4, y + h - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0 + w / 4, y + 6);
    ctx.lineTo(x0, y + h - 5);
    ctx.stroke();
  }
}

function mangueRoots(ctx, yBase) {
  for (let i = 0; i < 9; i++) {
    const x = i * 42 + 10;
    const h = 60 + (i * 29 % 40);
    PR(ctx, x, yBase - h, 7, h, '#4a3320');
    PR(ctx, x - 8, yBase - h * 0.5, 8, 4, '#4a3320');
    PR(ctx, x - 12, yBase - h * 0.5 + 2, 6, h * 0.5, '#3a2818');
    PR(ctx, x + 7, yBase - h * 0.6, 8, 4, '#4a3320');
    PR(ctx, x + 13, yBase - h * 0.6 + 2, 6, h * 0.6, '#3a2818');
    PR(ctx, x - 14, yBase - h - 10, 36, 16, '#2f5a35');
    PR(ctx, x - 8, yBase - h - 20, 26, 14, '#3a7042');
  }
}

// ---------- ícones (puzzles de memória e sombras) ----------
// cada ícone: (ctx, x, y, s, mono) — mono = cor única p/ silhueta
function iconConcha(ctx, x, y, s, m) {
  const c1 = m || '#f2b8a0', c2 = m || '#e08a6a';
  PR(ctx, x + 2 * s, y + 2 * s, 12 * s, 8 * s, c1);
  PR(ctx, x + 4 * s, y + 1 * s, 8 * s, 2 * s, c1);
  for (let i = 0; i < 3; i++) PR(ctx, x + (4 + i * 4) * s, y + 3 * s, 2 * s, 6 * s, c2);
  PR(ctx, x + 6 * s, y + 10 * s, 4 * s, 3 * s, c2);
}
function iconEstrela(ctx, x, y, s, m) {
  const c = m || '#f2a038';
  PR(ctx, x + 7 * s, y + 1 * s, 2 * s, 14 * s, c);
  PR(ctx, x + 1 * s, y + 6 * s, 14 * s, 3 * s, c);
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 9 * s, c);
  if (!m) PR(ctx, x + 7 * s, y + 6 * s, 2 * s, 2 * s, '#d97a2a');
}
function iconSiri(ctx, x, y, s, m) {
  drawMapMono(ctx, CRAB_MAP, CRAB_PAL, x + s, y + 3 * s, s, m);
}
function iconCoco(ctx, x, y, s, m) {
  PR(ctx, x + 3 * s, y + 4 * s, 10 * s, 9 * s, m || '#6b4a2f');
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 2 * s, m || '#6b4a2f');
  if (!m) {
    PR(ctx, x + 6 * s, y + 6 * s, 2 * s, 2 * s, '#3a2818');
    PR(ctx, x + 9 * s, y + 6 * s, 2 * s, 2 * s, '#3a2818');
    PR(ctx, x + 7 * s, y + 9 * s, 3 * s, 2 * s, '#3a2818');
  }
  PR(ctx, x + 6 * s, y + 1 * s, 4 * s, 3 * s, m || '#3f9b52');
}
function iconPeixe(ctx, x, y, s, m) {
  const c = m || '#5b8bd9';
  PR(ctx, x + 2 * s, y + 5 * s, 9 * s, 6 * s, c);
  PR(ctx, x + 4 * s, y + 3 * s, 5 * s, 10 * s, c);
  PR(ctx, x + 11 * s, y + 4 * s, 3 * s, 3 * s, c);
  PR(ctx, x + 11 * s, y + 9 * s, 3 * s, 3 * s, c);
  if (!m) PR(ctx, x + 4 * s, y + 6 * s, 2 * s, 2 * s, '#0e141a');
}
function iconSombrinha(ctx, x, y, s, m) {
  if (m) {
    ctx.fillStyle = m;
    ctx.beginPath();
    ctx.arc(x + 8 * s, y + 7 * s, 7 * s, Math.PI, 0);
    ctx.fill();
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 8 * s, m);
  } else {
    sombrinha(ctx, x + 8 * s, y + 7 * s, 7 * s, 0);
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 8 * s, '#3a2a1a');
  }
}
function iconBolo(ctx, x, y, s, m) {
  // bolo de rolo (espiral)
  PR(ctx, x + 2 * s, y + 4 * s, 12 * s, 9 * s, m || '#c97a4a');
  if (!m) {
    PR(ctx, x + 3 * s, y + 6 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 3 * s, y + 8 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 3 * s, y + 10 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 4 * s, y + 2 * s, 3 * s, 2 * s, '#e8d4b0');
  }
}
function iconRenda(ctx, x, y, s, m) {
  // renda renascença (roseta)
  const c = m || '#f5efe0';
  PR(ctx, x + 4 * s, y + 4 * s, 8 * s, 8 * s, c);
  PR(ctx, x + 6 * s, y + 2 * s, 4 * s, 12 * s, c);
  PR(ctx, x + 2 * s, y + 6 * s, 12 * s, 4 * s, c);
  if (!m) {
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 2 * s, '#c97bb6');
    PR(ctx, x + 4 * s, y + 7 * s, s, 2 * s, '#9fb4d0');
    PR(ctx, x + 11 * s, y + 7 * s, s, 2 * s, '#9fb4d0');
    PR(ctx, x + 7 * s, y + 4 * s, 2 * s, s, '#9fb4d0');
    PR(ctx, x + 7 * s, y + 11 * s, 2 * s, s, '#9fb4d0');
  }
}
function iconCordel(ctx, x, y, s, m) {
  // folheto de cordel pendurado
  PR(ctx, x + 1 * s, y + 2 * s, 14 * s, s, m || '#8a5a3a');
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 11 * s, m || '#e8dcc0');
  if (!m) {
    PR(ctx, x + 5 * s, y + 5 * s, 6 * s, 3 * s, '#3a2a1a');
    PR(ctx, x + 5 * s, y + 9 * s, 6 * s, s, '#6a5a4a');
    PR(ctx, x + 5 * s, y + 11 * s, 4 * s, s, '#6a5a4a');
  }
}
function iconBarro(ctx, x, y, s, m) {
  // boneco de barro (Alto do Moura / Mestre Vitalino)
  const c = m || '#b06a3a';
  PR(ctx, x + 5 * s, y + 1 * s, 6 * s, 5 * s, c);
  PR(ctx, x + 4 * s, y + 6 * s, 8 * s, 6 * s, c);
  PR(ctx, x + 3 * s, y + 12 * s, 10 * s, 2 * s, c);
  PR(ctx, x + 2 * s, y + 7 * s, 2 * s, 4 * s, c);
  PR(ctx, x + 12 * s, y + 7 * s, 2 * s, 4 * s, c);
  if (!m) {
    PR(ctx, x + 6 * s, y + 3 * s, s, s, '#3a2818');
    PR(ctx, x + 9 * s, y + 3 * s, s, s, '#3a2818');
    PR(ctx, x + 4 * s, y, 8 * s, s, '#8a5a3a');
  }
}
function drawMapMono(ctx, map, pal, x, y, s, mono) {
  if (!mono) { drawMap(ctx, map, pal, x, y, s); return; }
  const p2 = {};
  for (const k in pal) p2[k] = mono;
  drawMap(ctx, map, p2, x, y, s);
}

const ICONS = {
  concha: iconConcha, estrela: iconEstrela, siri: iconSiri, coco: iconCoco,
  peixe: iconPeixe, sombrinha: iconSombrinha,
  bolo: iconBolo, renda: iconRenda, cordel: iconCordel, barro: iconBarro,
};

// conta do colar
function drawBead(ctx, x, y, r, color, filled = true) {
  if (filled) {
    PR(ctx, x - r, y - r / 2, r * 2, r, color);
    PR(ctx, x - r / 2, y - r, r, r * 2, color);
    PR(ctx, x - r / 2, y - r / 2, r, r / 2, 'rgba(255,255,255,0.5)');
  } else {
    PR(ctx, x - r, y - r / 2, r * 2, r, '#2a3a4f');
    PR(ctx, x - r / 2, y - r, r, r * 2, '#2a3a4f');
    PR(ctx, x - r + 2, y - r / 2 + 2, r * 2 - 4, r - 4, '#0f1d30');
    PR(ctx, x - r / 2 + 2, y - r + 2, r - 4, r * 2 - 4, '#0f1d30');
  }
}

// ---------- cenários por fase ----------
const SCENES = {
  1(ctx, t) { // Dias de Sol — Marco Zero
    skyBands(ctx, ['#7ec8e8', '#9fd8f0', '#bfe6f2', '#d8f0f8'], 0, 420);
    sun(ctx, 290, 80, 26, t);
    cloud(ctx, 30 + Math.sin(t * 0.3) * 10, 60, 50);
    cloud(ctx, 150, 110, 38, '#f0f8fc');
    casario(ctx, 420, 0);
    PR(ctx, 0, 420, 360, 220, '#d8c8a8'); // praça
    // rosa dos ventos do Marco Zero
    PR(ctx, 150, 480, 60, 60, '#c8b490');
    PR(ctx, 176, 470, 8, 80, '#8a6a4a');
    PR(ctx, 140, 506, 80, 8, '#8a6a4a');
  },
  2(ctx, t) { // Praia de Boa Viagem
    skyBands(ctx, ['#7ec8e8', '#9fd8f0', '#bfe6f2'], 0, 280);
    sun(ctx, 60, 70, 22, t);
    cloud(ctx, 220 + Math.sin(t * 0.4) * 14, 70, 56);
    sea(ctx, 280, 420, t);
    sand(ctx, 420, 640);
    coqueiro(ctx, 30, 470, 90);
    coqueiro(ctx, 320, 500, 70);
  },
  3(ctx, t) { // Águas do Tubarão
    skyBands(ctx, ['#9fd8f0', '#bfe6f2'], 0, 160);
    cloud(ctx, 60, 50, 50);
    sea(ctx, 160, 560, t, '#1d6fa3', '#123f66');
    sand(ctx, 560, 640);
    // bandeira vermelha de alerta
    PR(ctx, 30, 480, 4, 90, '#5a3a22');
    PR(ctx, 34, 480, 36, 24, '#d92f2f');
    drawShark(ctx, 200 + Math.sin(t * 0.7) * 60, 240, 3, Math.cos(t * 0.7) < 0);
  },
  4(ctx, t) { // Dias de Chuva
    skyBands(ctx, ['#5a6b7a', '#6b7d8c', '#7d8f9e'], 0, 420);
    cloud(ctx, 40, 50, 70, '#4a5a68');
    cloud(ctx, 180, 80, 90, '#43525f');
    cloud(ctx, 280, 40, 60, '#4a5a68');
    casario(ctx, 420, 2);
    PR(ctx, 0, 420, 360, 220, '#5a6b7a');
    PR(ctx, 40, 460, 80, 8, '#7d9fb4'); // poças
    PR(ctx, 220, 520, 100, 8, '#7d9fb4');
    rainFx(ctx, t);
  },
  5(ctx, t) { // Mangue
    skyBands(ctx, ['#8fb8a8', '#a8c8b8'], 0, 240);
    PR(ctx, 0, 240, 360, 200, '#3a5a45');
    mangueRoots(ctx, 440);
    PR(ctx, 0, 440, 360, 200, '#4a3a28'); // lama
    for (let i = 0; i < 14; i++) {
      const x = (i * 61) % 360;
      const y = 460 + (i * 43) % 160;
      PR(ctx, x, y, 6, 3, '#3a2d1e');
    }
    // bolhas na lama
    const bx = (t * 20) % 360;
    PR(ctx, bx, 500 + Math.sin(t * 3) * 4, 4, 4, '#6a5a42');
  },
  6(ctx, t) { // Cultura Viva — mercado
    skyBands(ctx, ['#e8b96a', '#e8a05a'], 0, 300);
    casario(ctx, 380, 4);
    PR(ctx, 0, 380, 360, 260, '#b08a5a');
    bandeirinhas(ctx, 40, t);
    bandeirinhas(ctx, 80, t + 2);
  },
  7(ctx, t) { // Noite de Maracatu
    skyBands(ctx, ['#0a1228', '#101a35', '#1a2545'], 0, 440);
    stars(ctx, 50, 350);
    PR(ctx, 290, 60, 30, 30, '#f0ead0'); // lua
    PR(ctx, 296, 66, 8, 8, '#d8d0b0');
    casarioSilhueta(ctx, 440);
    PR(ctx, 0, 440, 360, 200, '#1a1525');
    // tochas
    [40, 320].forEach(x => {
      PR(ctx, x, 380, 6, 60, '#4a3320');
      const f = Math.sin(t * 8 + x) * 3;
      PR(ctx, x - 3, 364 + f, 12, 16, '#e8762a');
      PR(ctx, x - 1, 360 + f, 8, 10, '#f2c038');
    });
  },
  8(ctx, t) { // Frevo no Ar
    skyBands(ctx, ['#7ec8e8', '#9fd8f0', '#bfe6f2'], 0, 400);
    sun(ctx, 310, 60, 20, t);
    casario(ctx, 400, 1);
    PR(ctx, 0, 400, 360, 240, '#c8b490');
    bandeirinhas(ctx, 100, t);
    confete(ctx, t);
  },
  9(ctx, t) { // Manguebeat — crepúsculo
    skyBands(ctx, ['#2a4a55', '#3a6a6a', '#5a8a78', '#8aa888'], 0, 420);
    stars(ctx, 20, 160);
    casarioSilhueta(ctx, 380, '#13242a');
    PR(ctx, 0, 380, 360, 260, '#2a2418'); // lama do mangue
    mangueRootsSil(ctx, 440);
    antena(ctx, 80, 560, 1.4);
    antena(ctx, 290, 580, 1);
    const bx = (t * 14) % 360;
    PR(ctx, bx, 530, 4, 4, '#5a5242');
  },
  10(ctx, t) { // Jangadeiros ao Pôr do Sol
    skyBands(ctx, ['#3a2a55', '#8a3a5a', '#d95a4a', '#f2904a', '#f2c038'], 0, 380);
    sun(ctx, 180, 350, 30, t, '#fff0a0', '#ffd94a');
    sea(ctx, 380, 580, t, '#8a4a55', '#5a2a45', '#f2b080');
    sand(ctx, 580, 640, '#c8a878', '#b09060');
    jangadaSil(ctx, 80, 470, 1, '#1a1020');
    jangadaSil(ctx, 280, 430, 0.7, '#1a1020');
  },
};

function casarioSilhueta(ctx, yBase, c = '#0d1525') {
  let x = -8, i = 0;
  while (x < 360) {
    const w = 44 + ((i * 13) % 3) * 8;
    const h = 70 + ((i * 7) % 4) * 14;
    PR(ctx, x, yBase - h, w, h, c);
    x += w + 4;
    i++;
  }
  PR(ctx, 296, yBase - 140, 30, 140, c);
  PR(ctx, 304, yBase - 162, 14, 24, c);
}
function mangueRootsSil(ctx, yBase) {
  for (let i = 0; i < 9; i++) {
    const x = i * 42 + 10;
    const h = 50 + (i * 29 % 36);
    PR(ctx, x, yBase - h, 6, h, '#13110a');
    PR(ctx, x - 12, yBase - h - 8, 32, 14, '#1a2415');
  }
}

function drawScene(n, ctx, t) {
  (SCENES[n] || SCENES[1])(ctx, t);
}
