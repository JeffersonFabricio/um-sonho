// ============================================================
// world3d.js — Mundo Isométrico 3D de Recife
// Grade 10×10; TW=36 TH=18 → cabe exatamente nos 360px do canvas
// camX=180 (centro) camY=105
// ============================================================

const World3D = (() => {
  const TW = 36, TH = 18;   // largura e altura do tile isométrico
  const FH = 18;             // altura de 1 andar (px)
  const COLS = 10, ROWS = 10;
  const CAM_X = 180, CAM_Y = 220;

  // Mapa [row][col]
  // ~=oceano  w=rio  .=praia  g=terra  r=rua  m=mangue  a=arrecife  1-6=prédio(andares)
  const MAP = [
    // col:  0    1    2    3    4    5    6    7    8    9
    /* 0 */ ['m', 'm', 'w', 'w', '~', '~', '~', '~', '~', '~'],
    /* 1 */ ['m', 'g', 'g', 'w', 'w', '~', '~', '~', '.', '~'],
    /* 2 */ ['g', 'g', '1', 'g', 'w', '~', '~', '.', '3', '4'],
    /* 3 */ ['g', 'r', '1', '2', 'w', '.', '.', '3', '4', '5'],
    /* 4 */ ['r', 'r', '2', '2', 'a', '.', '4', '5', '6', '4'],
    /* 5 */ ['r', '2', '3', 'r', '.', '4', '5', '6', '5', '3'],
    /* 6 */ ['2', '2', 'r', 'r', '3', '4', '4', '3', 'g', 'g'],
    /* 7 */ ['g', 'r', '2', '2', '3', '3', '2', 'g', 'g', 'g'],
    /* 8 */ ['g', 'g', '2', '1', '2', '1', 'g', 'g', 'g', 'g'],
    /* 9 */ ['g', 'g', 'g', '1', 'g', 'g', 'g', 'g', 'g', 'g'],
  ];

  // Pseudo-random determinístico (janelas sempre iguais entre frames)
  function rnd(a, b) {
    const x = Math.sin(a * 127.1 + b * 311.7 + 1.0) * 43758.5453;
    return x - Math.floor(x);
  }

  // Paleta de prédios
  function buildColors(col, row) {
    const isBoaViagem = col >= 5;
    const idx = (col * 7 + row * 13) % 6;
    const hist = [
      { top: '#d4a870', left: '#7a4a1a', right: '#b07840' },
      { top: '#e8d86a', left: '#887010', right: '#caa030' },
      { top: '#e0a07a', left: '#904828', right: '#c07850' },
      { top: '#8ab0d0', left: '#3a6898', right: '#5a88b8' },
      { top: '#a8d880', left: '#487830', right: '#78b050' },
      { top: '#e09898', left: '#903838', right: '#c06060' },
    ];
    const mod = [
      { top: '#7ab8e8', left: '#2a5888', right: '#4a80c0' },
      { top: '#90c8e0', left: '#306888', right: '#5090b0' },
      { top: '#b0d0e8', left: '#4878a0', right: '#68a0c8' },
      { top: '#7898c8', left: '#284878', right: '#4870b0' },
      { top: '#a0bcd8', left: '#385888', right: '#5880b0' },
      { top: '#c8d8f0', left: '#4870a0', right: '#6898c8' },
    ];
    return isBoaViagem ? mod[idx] : hist[idx];
  }

  // Projeção isométrica
  function iso(col, row) {
    return {
      x: (col - row) * TW / 2 + CAM_X,
      y: (col + row) * TH / 2 + CAM_Y,
    };
  }

  // Diamond (tile de chão)
  function diamond(ctx, x, y, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x,          y          );
    ctx.lineTo(x + TW / 2, y + TH / 2);
    ctx.lineTo(x,          y + TH     );
    ctx.lineTo(x - TW / 2, y + TH / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Janelas (determinísticas por seed)
  function drawWindows(ctx, x, y, floors, col, row) {
    for (let f = 0; f < floors; f++) {
      const floorBase = y + TH - (f + 1) * FH;
      // Face direita: 2 janelas
      for (let wc = 0; wc < 2; wc++) {
        const lit = rnd(col * 3 + f, row * 5 + wc) > 0.38;
        const t = (wc + 0.6) / 2.5;
        const wx = x + t * TW / 2 - 2;
        const wy = floorBase + t * TH / 4 + 3;
        ctx.fillStyle = lit ? 'rgba(255,238,160,0.75)' : 'rgba(20,40,80,0.45)';
        ctx.fillRect(wx, wy, 4, Math.floor(FH * 0.45));
      }
      // Face esquerda: 1 janela
      const lit2 = rnd(col * 9 + f + 1, row * 7 + 20) > 0.45;
      ctx.fillStyle = lit2 ? 'rgba(200,220,255,0.55)' : 'rgba(10,20,50,0.35)';
      ctx.fillRect(x - TW / 4 - 2, floorBase - TH / 8 + 3, 4, Math.floor(FH * 0.45));
    }
  }

  // Prédio isométrico
  function building(ctx, x, y, floors, col, row) {
    const h = floors * FH;
    const c = buildColors(col, row);

    // Face esquerda (sombra)
    ctx.beginPath();
    ctx.moveTo(x - TW / 2, y + TH / 2    );
    ctx.lineTo(x,           y + TH        );
    ctx.lineTo(x,           y + TH - h    );
    ctx.lineTo(x - TW / 2, y + TH / 2 - h);
    ctx.closePath();
    ctx.fillStyle = c.left;
    ctx.fill();

    // Face direita (luz)
    ctx.beginPath();
    ctx.moveTo(x,           y + TH        );
    ctx.lineTo(x + TW / 2,  y + TH / 2    );
    ctx.lineTo(x + TW / 2,  y + TH / 2 - h);
    ctx.lineTo(x,           y + TH - h    );
    ctx.closePath();
    ctx.fillStyle = c.right;
    ctx.fill();

    // Topo
    diamond(ctx, x, y - h, c.top, null);

    // Contorno sutil no topo
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x,           y - h          );
    ctx.lineTo(x + TW / 2,  y - h + TH / 2);
    ctx.lineTo(x,           y - h + TH     );
    ctx.lineTo(x - TW / 2,  y - h + TH / 2);
    ctx.closePath();
    ctx.stroke();

    drawWindows(ctx, x, y, floors, col, row);
  }

  // Manguezal (com raízes-escora e copa)
  function mangrove(ctx, x, y, t) {
    const sway = Math.sin(t * 0.7 + x * 0.05) * 2;

    ctx.strokeStyle = '#3a2410';
    ctx.lineWidth = 1.0;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI - Math.PI / 2;
      const rx = x + Math.cos(ang) * 7 + sway * 0.2;
      const ry = y + TH / 2 + 7;
      ctx.beginPath();
      ctx.moveTo(x + sway * 0.3, y + TH / 2);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }

    ctx.strokeStyle = '#241808';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + sway * 0.5, y + TH / 2);
    ctx.lineTo(x + sway,       y - 15     );
    ctx.stroke();

    [
      [0,  -15, 10, '#1a5520'],
      [-5, -11,  7, '#244a1a'],
      [ 5, -11,  7, '#2a7030'],
    ].forEach(([dx, dy, r, col]) => {
      ctx.beginPath();
      ctx.arc(x + dx + sway, y + dy, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });
  }

  // Água animada
  function water(ctx, x, y, t, ocean) {
    diamond(ctx, x, y, ocean ? '#0b2548' : '#14406a', null);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x,           y         );
    ctx.lineTo(x + TW / 2,  y + TH / 2);
    ctx.lineTo(x,           y + TH    );
    ctx.lineTo(x - TW / 2,  y + TH / 2);
    ctx.closePath();
    ctx.clip();
    const phase = (t * 28 + x * 0.3) % TW;
    ctx.strokeStyle = ocean ? 'rgba(70,150,255,0.18)' : 'rgba(50,130,220,0.22)';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 2; i++) {
      const lx = x - TW / 2 + ((phase + i * TW / 2.5) % TW);
      ctx.beginPath();
      ctx.moveTo(lx - 4, y + TH / 2 - 1);
      ctx.quadraticCurveTo(lx, y + TH / 2 - 3, lx + 4, y + TH / 2 - 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Arrecife com corais
  function reef(ctx, x, y) {
    diamond(ctx, x, y, '#7aaa98', '#4a8a78');
    ctx.fillStyle = '#e87a60';
    ctx.beginPath(); ctx.arc(x - 4, y + TH / 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#60d8a8';
    ctx.beginPath(); ctx.arc(x + 6, y + TH / 2 - 2, 2.0, 0, Math.PI * 2); ctx.fill();
  }

  // Céu pôr-do-sol
  function drawSky(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    g.addColorStop(0,    '#0a1e4a');
    g.addColorStop(0.30, '#1a3a80');
    g.addColorStop(0.60, '#2a6abf');
    g.addColorStop(0.82, '#f08030');
    g.addColorStop(1,    '#e04010');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Sol com halo
  function drawSun(ctx) {
    const sx = 290, sy = 100;
    const halo = ctx.createRadialGradient(sx, sy, 14, sx, sy, 55);
    halo.addColorStop(0, 'rgba(255,200,80,0.38)');
    halo.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(sx, sy, 55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd040'; ctx.fill();
  }

  // Nuvens
  function drawClouds(ctx, t) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffe8d0';
    [
      { bx: 60,  y: 45, sx: 55, spd: 8  },
      { bx: 200, y: 30, sx: 70, spd: 5  },
      { bx: 310, y: 58, sx: 45, spd: 11 },
      { bx: 140, y: 68, sx: 40, spd: 7  },
    ].forEach(c => {
      const cx = ((c.bx + t * c.spd) % 420) - 30;
      ctx.beginPath();
      ctx.arc(cx,               c.y,     c.sx * 0.28, 0, Math.PI * 2);
      ctx.arc(cx + c.sx * 0.22, c.y - 6, c.sx * 0.32, 0, Math.PI * 2);
      ctx.arc(cx + c.sx * 0.50, c.y,     c.sx * 0.22, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Pássaros / gaivotas
  function drawBirds(ctx, t) {
    ctx.save();
    ctx.strokeStyle = '#0a1838';
    ctx.lineWidth = 1.2;
    [
      { bx: 80,  y: 85, ph: 0   },
      { bx: 195, y: 68, ph: 1.8 },
      { bx: 265, y: 92, ph: 0.9 },
    ].forEach(b => {
      const cx = ((b.bx + t * 22) % 430) - 20;
      const cy = b.y + Math.sin(t * 2.2 + b.ph) * 6;
      const flap = Math.sin(t * 5 + b.ph) * 5;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + flap);
      ctx.lineTo(cx,     cy       );
      ctx.lineTo(cx + 7, cy + flap);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Fundo de mar abaixo do grid
  function drawSeaBg(ctx, W, H) {
    const seaY = CAM_Y + 80;
    const g = ctx.createLinearGradient(0, seaY, 0, H);
    g.addColorStop(0, '#0d2d5a');
    g.addColorStop(1, '#071828');
    ctx.fillStyle = g;
    ctx.fillRect(0, seaY, W, H - seaY);
  }

  // HUD
  function drawHud(ctx, W, H) {
    ctx.fillStyle = 'rgba(10,20,40,0.88)';
    ctx.fillRect(10, 10, 96, 34);
    ctx.fillStyle = '#bfe6f2';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('‹ voltar', 20, 27);

    ctx.fillStyle = 'rgba(10,20,40,0.78)';
    ctx.fillRect(W / 2 - 95, H - 52, 190, 38);
    ctx.fillStyle = '#f2c038';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Recife 3D', W / 2, H - 38);
    ctx.fillStyle = '#9fb4d0';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText('manguezal · prédios · cidade', W / 2, H - 22);
  }

  // Frame principal
  function render(ctx, W, H, t) {
    drawSky(ctx, W, H);
    drawSun(ctx);
    drawClouds(ctx, t);
    drawBirds(ctx, t);
    drawSeaBg(ctx, W, H);

    // Ordem do pintor: row 0→9, col 0→9
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = MAP[row][col];
        const { x, y } = iso(col, row);

        switch (tile) {
          case '~': water(ctx, x, y, t, true);  break;
          case 'w': water(ctx, x, y, t, false); break;
          case '.': diamond(ctx, x, y, '#e0d098', '#c0a868'); break;
          case 'a': reef(ctx, x, y);            break;
          case 'g': diamond(ctx, x, y, '#5a7838', '#3a5020'); break;
          case 'r':
            diamond(ctx, x, y, '#545454', '#3a3a3a');
            ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 4, y + TH / 2); ctx.lineTo(x + 4, y + TH / 2);
            ctx.stroke();
            break;
          case 'm':
            diamond(ctx, x, y, '#2a4018', '#1a2e10');
            mangrove(ctx, x, y, t);
            break;
          default: {
            const fl = parseInt(tile);
            if (fl >= 1 && fl <= 6) {
              diamond(ctx, x, y, col >= 5 ? '#787060' : '#5a7838', '#303020');
              building(ctx, x, y, fl, col, row);
            }
          }
        }
      }
    }

    drawHud(ctx, W, H);
  }

  // API pública — render() é chamado pelo loop principal do jogo
  let _t0 = null;

  function tick(ctx, W, H, gameT) {
    render(ctx, W, H, gameT);
  }

  function reset() { _t0 = null; }

  return { tick, reset };
})();
