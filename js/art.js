/* Agentworld: Parallax — procedural pixel art.
   Everything is drawn in code: tiles, buildings, props and characters, in three materializations:
   I  Masquerade  — a familiar daylight town; agents wear human faces.
   II Rainforest  — dusk; embodied agents in many bodies have rebuilt the niche (bioluminescent).
   III Lattice    — the brief's own diagram language: ultramarine ink on paper, H and A glyphs. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const TL = AW.TL;
  const art = (AW.art = {});

  /* ------------------------------------------------------------ helpers */
  const cv = (art.cv = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  });
  function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function P(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  function disc(ctx, cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      const dy = y + 0.5 - cy;
      if (Math.abs(dy) > r) continue;
      const dx = Math.sqrt(r * r - dy * dy);
      const x0 = Math.round(cx - dx), x1 = Math.round(cx + dx);
      if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }
  function ellipse(ctx, cx, cy, rx, ry, c) {
    ctx.fillStyle = c;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const dx = rx * Math.sqrt(1 - dy * dy);
      const x0 = Math.round(cx - dx), x1 = Math.round(cx + dx);
      if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }
  function ring(ctx, cx, cy, r, c) {
    ctx.fillStyle = c;
    const steps = Math.max(12, Math.ceil(r * 8));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r - 0.5), Math.round(cy + Math.sin(a) * r - 0.5), 1, 1);
    }
  }
  function line(ctx, x0, y0, x1, y1, c) {
    ctx.fillStyle = c;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1);
  }
  art.disc = disc; art.ring = ring; art.line = line; art.R = R; art.P = P; art.ellipse = ellipse;

  /* 1px outline around opaque pixels (4-neighbourhood), drawn into the transparent margin */
  function outline(src, col) {
    const w = src.width, h = src.height;
    const ctx = src.getContext('2d');
    const d = ctx.getImageData(0, 0, w, h);
    const a = d.data;
    const [r, g, b] = U.hexToRgb(col);
    const isOn = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 40;
    const out = new Uint8ClampedArray(a);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (isOn(x, y)) continue;
      if (isOn(x - 1, y) || isOn(x + 1, y) || isOn(x, y - 1) || isOn(x, y + 1)) {
        const i = (y * w + x) * 4;
        out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
      }
    }
    ctx.putImageData(new ImageData(out, w, h), 0, 0);
    return src;
  }
  art.outline = outline;

  /* ======================================================= palettes */
  const PAL = (art.PAL = {
    I: {
      grass: '#8ccf6a', grassD: '#73b856', grassL: '#a9e086',
      road: '#e4d2a8', roadD: '#d0bb8f', roadE: '#b69c6e',
      plaza: '#ebe3d1', plazaD: '#d5c9b0', plazaL: '#f6f0e2',
      water: '#4ea7e2', waterL: '#93d3f6', waterD: '#3b88c4',
      tree: '#3f9a4f', treeD: '#2b7a3b', treeL: '#66bd67', trunk: '#7a5232',
      forest: '#2c7a40', forestD: '#1f5c30', forestL: '#4d9e56',
      wood: '#b97f48', woodD: '#8a5a30', woodL: '#d6a26a',
      fence: '#fbf6ea', fenceD: '#cfc4ab',
      soil: '#8b5e3c', soilD: '#734b2f', sprout: '#5dbb4a',
      wall: '#f7eed9', wallD: '#e2d2b2', win: '#a6d8f4', winL: '#e2f4ff', frame: '#6b4a32',
      door: '#8a5a30', ink: '#2b1d14', metal: '#8a94a3',
      roofs: ['#d8624e', '#4f7fd8', '#e0a03a', '#5fa572', '#9a6fd1', '#d96f9e', '#3fa8a8', '#c27a4a',
        '#5b6fb0', '#cc5a5a', '#7d8c3f', '#8a5fb5', '#e07b39', '#6c8f9e', '#a7746a', '#7a7f87'],
    },
    II: {
      grass: '#2c5a4b', grassD: '#22483c', grassL: '#3b715f',
      glow: '#6ff5d2', glow2: '#ff7ad9', glow3: '#ffd36e', glow4: '#8fb8ff',
      road: '#4b3b33', roadD: '#3b2e28', roadL: '#665247', conduit: '#56e8c4',
      plaza: '#30443d', plazaD: '#263731', plazaL: '#3f5a51',
      water: '#0f3442', waterD: '#0a2531', waterL: '#1b4a5b',
      fern: '#2f8a62', fernD: '#20664a', fernL: '#55bb88', trunk: '#3a2c26',
      forest: '#16362e', forestD: '#0f2722', forestL: '#265a48',
      wood: '#5b4337', woodD: '#45322a', woodL: '#7a5b49',
      soil: '#2b2622', soilD: '#1f1b18', sprout: '#7cf08f',
      wall: '#2c3b40', wallD: '#223035', wallL: '#3e5259', win: '#7ff1ff', winWarm: '#ffcf73', vine: '#3f9a6b',
      ink: '#0b1a1a', metal: '#7d8b96',
      roofs: ['#2f8a62', '#2e7f86', '#4e8a3a', '#3a6f8f', '#5a7f3f', '#2f6f6a', '#3f8a7a', '#5a8a5a'],
    },
    III: {
      paper: '#f4f3ee', paperD: '#e9e8e1', grid: '#cfd2f3', blue: '#2a2ae0', blueL: '#9196f1', blueLL: '#e2e4fb',
      ink: '#10104a', red: '#e8432f',
    },
  });

  /* ===================================================== tile painting */
  // world reference used for neighbour lookups
  const W = () => AW.world;
  const RL = (t) => t === TL.ROAD || t === TL.PLAZA || t === TL.BRIDGE;

  function nbInfo(gx, gy) {
    const w = W();
    return {
      u: w.get(gx, gy - 1), d: w.get(gx, gy + 1), l: w.get(gx - 1, gy), r: w.get(gx + 1, gy),
    };
  }

  /* ---- Version I: Masquerade ---- */
  const T1 = {};
  T1.grass = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.grass);
    for (let i = 0; i < 7; i++) {
      const hx = Math.floor(U.hash(gx * 7 + i, gy, 11) * 16), hy = Math.floor(U.hash(gx, gy * 7 + i, 12) * 16);
      P(c, x + hx, y + hy, i < 4 ? p.grassD : p.grassL);
    }
    if (U.hash(gx, gy, 13) < 0.45) {
      const hx = 2 + Math.floor(U.hash(gx, gy, 14) * 11), hy = 3 + Math.floor(U.hash(gx, gy, 15) * 10);
      P(c, x + hx, y + hy, p.grassD); P(c, x + hx + 2, y + hy, p.grassD); P(c, x + hx + 1, y + hy + 1, p.grassD);
    }
  };
  T1.flower = function (c, x, y, gx, gy, f, p) {
    T1.grass(c, x, y, gx, gy, f, p);
    const cols = ['#ffffff', '#ff6b6b', '#ffd23f', '#ff9ad5', '#9fb7ff'];
    for (let i = 0; i < 3; i++) {
      const fx = 2 + Math.floor(U.hash(gx * 3 + i, gy, 21) * 11), fy = 2 + Math.floor(U.hash(gx, gy * 3 + i, 22) * 11);
      const col = cols[Math.floor(U.hash(gx + i, gy - i, 23) * cols.length)];
      P(c, x + fx, y + fy - 1, col); P(c, x + fx - 1, y + fy, col); P(c, x + fx + 1, y + fy, col); P(c, x + fx, y + fy + 1, col);
      P(c, x + fx, y + fy, '#ffe680');
    }
  };
  T1.road = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.road);
    for (let i = 0; i < 6; i++) {
      const hx = Math.floor(U.hash(gx * 5 + i, gy, 31) * 16), hy = Math.floor(U.hash(gx, gy * 5 + i, 32) * 16);
      P(c, x + hx, y + hy, p.roadD);
    }
    const n = nbInfo(gx, gy);
    if (!RL(n.u)) { R(c, x, y, 16, 1, p.roadE); R(c, x, y + 1, 16, 1, p.roadD); }
    if (!RL(n.d)) { R(c, x, y + 15, 16, 1, p.roadE); }
    if (!RL(n.l)) { R(c, x, y, 1, 16, p.roadE); }
    if (!RL(n.r)) { R(c, x + 15, y, 1, 16, p.roadE); }
  };
  T1.plaza = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.plaza);
    R(c, x, y, 16, 1, p.plazaD); R(c, x, y + 8, 16, 1, p.plazaD);
    R(c, x, y, 1, 8, p.plazaD); R(c, x + 8, y + 8, 1, 8, p.plazaD);
    P(c, x + 2, y + 2, p.plazaL); P(c, x + 10, y + 10, p.plazaL);
    // ring inlays around the commons
    const pl = W().plaza;
    for (let j = 0; j < 16; j += 1) for (let i = 0; i < 16; i += 1) {
      const d = Math.hypot(gx * 16 + i + 0.5 - (pl.cx + 0.5) * 16, gy * 16 + j + 0.5 - (pl.cy + 0.5) * 16);
      if (Math.abs(d - 56) < 0.7 || Math.abs(d - 88) < 0.7) P(c, x + i, y + j, '#c7b48e');
    }
    const n = nbInfo(gx, gy);
    if (!RL(n.u)) R(c, x, y, 16, 1, p.roadE);
    if (!RL(n.d)) R(c, x, y + 15, 16, 1, p.roadE);
    if (!RL(n.l)) R(c, x, y, 1, 16, p.roadE);
    if (!RL(n.r)) R(c, x + 15, y, 1, 16, p.roadE);
  };
  T1.water = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.water);
    for (let i = 0; i < 3; i++) {
      const hx = Math.floor(U.hash(gx * 3 + i, gy, 41) * 12), hy = 3 + Math.floor(U.hash(gx, gy * 3 + i, 42) * 10);
      R(c, x + ((hx + f * 3) % 13), y + hy, 3, 1, p.waterL);
    }
    const n = nbInfo(gx, gy);
    if (n.u !== TL.WATER && n.u !== TL.BRIDGE) { R(c, x, y, 16, 2, '#d9f1ff'); R(c, x, y + 2, 16, 1, p.waterD); }
    if (n.d !== TL.WATER && n.d !== TL.BRIDGE) { R(c, x, y + 14, 16, 2, p.waterD); }
  };
  T1.bridge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.water);
    for (let j = 0; j < 16; j += 4) { R(c, x, y + j, 16, 3, p.wood); R(c, x, y + j + 3, 16, 1, p.woodD); }
    const n = nbInfo(gx, gy);
    if (n.l !== TL.BRIDGE) { R(c, x, y, 2, 16, p.woodD); R(c, x + 2, y, 1, 16, p.woodL); }
    if (n.r !== TL.BRIDGE) { R(c, x + 14, y, 2, 16, p.woodD); R(c, x + 13, y, 1, 16, p.woodL); }
  };
  function tree1(c, x, y, p, gx, gy) {
    R(c, x + 6, y + 11, 4, 5, p.trunk); R(c, x + 9, y + 11, 1, 5, U.shade(p.trunk, -0.3));
    disc(c, x + 8, y + 7, 7, p.treeD);
    disc(c, x + 7.5, y + 6.5, 6, p.tree);
    disc(c, x + 6, y + 5, 2.5, p.treeL);
    P(c, x + 5, y + 4, '#9be29a');
    if (U.hash(gx, gy, 51) < 0.3) { P(c, x + 10, y + 8, '#ff6b6b'); P(c, x + 5, y + 9, '#ff6b6b'); }
  }
  T1.tree = function (c, x, y, gx, gy, f, p) { T1.grass(c, x, y, gx, gy, f, p); tree1(c, x, y, p, gx, gy); };
  T1.forest = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.forestD);
    disc(c, x + 8, y + 8, 8.5, U.shade(p.forestD, -0.2));
    disc(c, x + 8, y + 7, 7.5, p.forest);
    disc(c, x + 6, y + 5, 3, p.forestL);
    P(c, x + 5, y + 4, '#7cc27a');
    if (U.hash(gx, gy, 52) < 0.5) disc(c, x + 12, y + 12, 2, p.forestL);
  };
  T1.fence = function (c, x, y, gx, gy, f, p) {
    T1.grass(c, x, y, gx, gy, f, p);
    const n = nbInfo(gx, gy);
    const horiz = n.l === TL.FENCE || n.r === TL.FENCE;
    const vert = n.u === TL.FENCE || n.d === TL.FENCE;
    if (horiz || !vert) {
      R(c, x, y + 6, 16, 2, p.fence); R(c, x, y + 10, 16, 2, p.fence); R(c, x, y + 12, 16, 1, p.fenceD);
      for (const px of [2, 10]) { R(c, x + px, y + 3, 3, 11, p.fence); R(c, x + px + 2, y + 3, 1, 11, p.fenceD); }
    }
    if (vert) {
      R(c, x + 6, y, 3, 16, p.fence); R(c, x + 8, y, 1, 16, p.fenceD);
      R(c, x + 5, y + 4, 5, 3, p.fence); R(c, x + 5, y + 12, 5, 3, p.fence);
    }
  };
  T1.hedge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.treeD);
    for (let i = 0; i < 5; i++) disc(c, x + 3 + i * 3, y + 4 + (i % 2) * 6, 3, p.tree);
    R(c, x, y, 16, 2, p.treeL);
  };
  T1.garden = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.soil);
    for (let j = 2; j < 16; j += 4) R(c, x, y + j, 16, 1, p.soilD);
    for (let i = 0; i < 4; i++) {
      const sx = 1 + Math.floor(U.hash(gx * 4 + i, gy, 61) * 13), sy = Math.floor(i * 4);
      P(c, x + sx, y + sy, p.sprout); P(c, x + sx + 1, y + Math.max(0, sy - 1), p.sprout);
      P(c, x + sx + 1, y + sy + 1, '#3f9a3a');
    }
    if (U.hash(gx, gy, 62) < 0.4) { P(c, x + 7, y + 9, '#e04848'); P(c, x + 12, y + 5, '#f08a24'); }
  };
  T1.lamp = function (c, x, y, gx, gy, f, p, base) {
    (base || T1.grass)(c, x, y, gx, gy, f, p);
    R(c, x + 6, y + 14, 4, 2, '#5a5f6a');
    R(c, x + 7, y + 4, 2, 11, '#4a4f5a');
    R(c, x + 5, y + 1, 6, 3, '#4a4f5a');
    R(c, x + 6, y + 2, 4, 1, '#fff2a8');
  };
  T1.bench = function (c, x, y, gx, gy, f, p) {
    T1.grass(c, x, y, gx, gy, f, p);
    R(c, x + 2, y + 4, 12, 2, p.woodD);
    R(c, x + 2, y + 7, 12, 3, p.wood); R(c, x + 2, y + 9, 12, 1, p.woodD);
    R(c, x + 3, y + 10, 2, 4, '#5a4a3a'); R(c, x + 11, y + 10, 2, 4, '#5a4a3a');
  };
  T1.post = function (c, x, y, gx, gy, f, p) {
    T1.grass(c, x, y, gx, gy, f, p);
    R(c, x + 6, y + 7, 4, 7, '#a08a6a'); R(c, x + 6, y + 7, 4, 1, '#c8b28e'); R(c, x + 9, y + 8, 1, 6, '#7a6648');
    R(c, x + 5, y + 13, 6, 1, p.grassD);
  };
  T1.sign = function (c, x, y, gx, gy, f, p) {
    T1.grass(c, x, y, gx, gy, f, p);
    R(c, x + 7, y + 9, 2, 6, p.woodD);
    R(c, x + 2, y + 3, 12, 7, p.woodD); R(c, x + 3, y + 4, 10, 5, p.woodL);
    R(c, x + 4, y + 5, 8, 1, p.woodD); R(c, x + 4, y + 7, 6, 1, p.woodD);
  };

  /* ---- Version II: Rainforest ---- */
  const T2 = {};
  T2.grass = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.grass);
    for (let i = 0; i < 8; i++) {
      const hx = Math.floor(U.hash(gx * 7 + i, gy, 111) * 16), hy = Math.floor(U.hash(gx, gy * 7 + i, 112) * 16);
      P(c, x + hx, y + hy, i < 5 ? p.grassD : p.grassL);
    }
    if (U.hash(gx, gy, 113) < 0.35) {
      const hx = 1 + Math.floor(U.hash(gx, gy, 114) * 14), hy = 1 + Math.floor(U.hash(gx, gy, 115) * 14);
      const on = (U.hash(gx, gy, 116) < 0.5) === (f === 0);
      P(c, x + hx, y + hy, on ? p.glow : U.shade(p.glow, -0.5));
    }
  };
  T2.flower = function (c, x, y, gx, gy, f, p) {
    T2.grass(c, x, y, gx, gy, f, p);
    for (let i = 0; i < 3; i++) {
      const fx = 2 + Math.floor(U.hash(gx * 3 + i, gy, 121) * 11), fy = 4 + Math.floor(U.hash(gx, gy * 3 + i, 122) * 9);
      const col = [p.glow2, p.glow, p.glow3][i % 3];
      R(c, x + fx, y + fy, 1, 3, '#9aa6a0');
      R(c, x + fx - 1, y + fy - 1, 3, 1, f === 0 ? col : U.shade(col, -0.25));
      P(c, x + fx, y + fy - 2, U.shade(col, 0.4));
    }
  };
  T2.road = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.road);
    for (let i = 0; i < 5; i++) {
      const hy = Math.floor(U.hash(gx, gy * 5 + i, 131) * 16), hx = Math.floor(U.hash(gx * 5 + i, gy, 132) * 10);
      R(c, x + hx, y + hy, 5, 1, i % 2 ? p.roadL : p.roadD);
    }
    const n = nbInfo(gx, gy);
    const cond = f === 0 ? p.conduit : U.shade(p.conduit, -0.35);
    if (RL(n.l) && RL(n.r)) {
      if (!RL(n.u) && RL(n.d)) R(c, x, y + 15, 16, 1, cond);
      if (RL(n.u) && !RL(n.d)) R(c, x, y, 16, 1, cond);
    }
    if (RL(n.u) && RL(n.d)) {
      if (!RL(n.l) && RL(n.r)) R(c, x + 15, y, 1, 16, cond);
      if (RL(n.l) && !RL(n.r)) R(c, x, y, 1, 16, cond);
    }
    if (!RL(n.u)) { R(c, x, y, 16, 2, p.grassD); for (let i = 0; i < 16; i += 3) P(c, x + i, y + 2, p.grassD); }
    if (!RL(n.d)) { R(c, x, y + 14, 16, 2, p.grassD); }
    if (!RL(n.l)) R(c, x, y, 2, 16, p.grassD);
    if (!RL(n.r)) R(c, x + 14, y, 2, 16, p.grassD);
  };
  T2.plaza = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.plaza);
    const seam = p.plazaD;
    R(c, x, y, 16, 1, seam); R(c, x, y + 8, 16, 1, seam); R(c, x + 4, y, 1, 8, seam); R(c, x + 12, y + 8, 1, 8, seam);
    const pl = W().plaza;
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const d = Math.hypot(gx * 16 + i + 0.5 - (pl.cx + 0.5) * 16, gy * 16 + j + 0.5 - (pl.cy + 0.5) * 16);
      if (Math.abs(d - 56) < 0.7 || Math.abs(d - 88) < 0.7) P(c, x + i, y + j, f === 0 ? p.glow : U.shade(p.glow, -0.4));
    }
    if (U.hash(gx, gy, 141) < 0.2) P(c, x + 6, y + 11, p.glow3);
  };
  T2.water = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.water);
    for (let i = 0; i < 4; i++) {
      const hx = Math.floor(U.hash(gx * 3 + i, gy, 151) * 14), hy = 2 + Math.floor(U.hash(gx, gy * 3 + i, 152) * 12);
      R(c, x + ((hx + f * 2) % 15), y + hy, 2, 1, i % 2 ? p.waterL : (f ? U.shade(p.glow, -0.3) : p.glow));
    }
    const n = nbInfo(gx, gy);
    if (n.u !== TL.WATER && n.u !== TL.BRIDGE) R(c, x, y, 16, 2, p.waterD);
    if (n.d !== TL.WATER && n.d !== TL.BRIDGE) R(c, x, y + 14, 16, 2, p.waterD);
  };
  T2.bridge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.wood);
    for (let j = 0; j < 16; j += 3) R(c, x, y + j, 16, 1, p.woodD);
    for (let i = 0; i < 16; i += 5) R(c, x + i, y, 1, 16, p.woodL);
    const n = nbInfo(gx, gy);
    if (n.l !== TL.BRIDGE) { R(c, x, y, 2, 16, '#2a1f1a'); R(c, x + 2, y, 1, 16, f === 0 ? p.glow : U.shade(p.glow, -0.4)); }
    if (n.r !== TL.BRIDGE) { R(c, x + 14, y, 2, 16, '#2a1f1a'); R(c, x + 13, y, 1, 16, f === 0 ? p.glow : U.shade(p.glow, -0.4)); }
  };
  function fern(c, x, y, p, gx, gy, f) {
    R(c, x + 7, y + 6, 2, 10, p.trunk);
    const fronds = [[-6, -2], [-5, 2], [6, -2], [5, 2], [-2, -6], [2, -6]];
    for (const [dx, dy] of fronds) {
      line(c, x + 8, y + 7, x + 8 + dx, y + 7 + dy, p.fernD);
      line(c, x + 8, y + 6, x + 8 + dx, y + 6 + dy, p.fern);
    }
    disc(c, x + 8, y + 7, 3, p.fern);
    disc(c, x + 7.5, y + 6, 1.6, p.fernL);
    const g = [p.glow, p.glow2, p.glow3][Math.floor(U.hash(gx, gy, 161) * 3)];
    R(c, x + 7, y + 2, 2, 2, f === 0 ? g : U.shade(g, -0.35));
    P(c, x + 8, y + 1, U.shade(g, 0.5));
  }
  T2.tree = function (c, x, y, gx, gy, f, p) { T2.grass(c, x, y, gx, gy, f, p); fern(c, x, y, p, gx, gy, f); };
  T2.forest = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.forestD);
    ellipse(c, x + 5, y + 6, 6, 4, p.forest);
    ellipse(c, x + 11, y + 11, 6, 4, p.forest);
    ellipse(c, x + 6, y + 12, 3, 2, p.forestL);
    ellipse(c, x + 11, y + 5, 3, 2, p.forestL);
    if (U.hash(gx, gy, 171) < 0.35) P(c, x + Math.floor(U.hash(gx, gy, 172) * 16), y + Math.floor(U.hash(gx, gy, 173) * 16), f ? U.shade(p.glow2, -0.3) : p.glow2);
  };
  T2.fence = function (c, x, y, gx, gy, f, p) {
    T2.grass(c, x, y, gx, gy, f, p);
    const n = nbInfo(gx, gy);
    const horiz = n.l === TL.FENCE || n.r === TL.FENCE;
    const vert = n.u === TL.FENCE || n.d === TL.FENCE;
    if (horiz || !vert) {
      R(c, x, y + 8, 16, 2, p.vine); for (const px of [3, 11]) R(c, x + px, y + 4, 2, 10, '#1f2b26');
      P(c, x + 7, y + 7, f === 0 ? p.glow2 : U.shade(p.glow2, -0.3));
    }
    if (vert) { R(c, x + 7, y, 2, 16, p.vine); R(c, x + 6, y + 3, 4, 2, '#1f2b26'); R(c, x + 6, y + 11, 4, 2, '#1f2b26'); }
  };
  T2.hedge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.fernD);
    for (let i = 0; i < 5; i++) disc(c, x + 3 + i * 3, y + 4 + (i % 2) * 6, 3, p.fern);
    for (let i = 0; i < 3; i++) P(c, x + 2 + i * 5, y + 3 + i * 4, f === 0 ? p.glow : U.shade(p.glow, -0.4));
  };
  T2.garden = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.soil);
    for (let j = 1; j < 16; j += 5) { R(c, x + 1, y + j, 14, 3, p.soilD); }
    for (let i = 0; i < 5; i++) {
      const sx = 1 + Math.floor(U.hash(gx * 5 + i, gy, 181) * 13), sy = 1 + (i % 3) * 5;
      P(c, x + sx, y + sy, p.sprout); P(c, x + sx, y + sy + 1, '#3fae54');
    }
    if (f === 0) P(c, x + 8, y + 8, '#c79bff');
  };
  T2.lamp = function (c, x, y, gx, gy, f, p, base) {
    (base || T2.grass)(c, x, y, gx, gy, f, p);
    R(c, x + 7, y + 5, 2, 11, '#1f2b26');
    const g = f === 0 ? p.glow : U.shade(p.glow, -0.2);
    c.fillStyle = U.rgba(p.glow, 0.18); c.fillRect(x + 3, y, 10, 8);
    disc(c, x + 8, y + 3.5, 3, g);
    P(c, x + 7, y + 2, '#e8fff8');
  };
  T2.bench = function (c, x, y, gx, gy, f, p) {
    T2.grass(c, x, y, gx, gy, f, p);
    ellipse(c, x + 8, y + 9, 6.5, 3, p.wood);
    ellipse(c, x + 8, y + 8, 5.5, 2, p.woodL);
    P(c, x + 4, y + 8, p.glow);
  };
  T2.post = function (c, x, y, gx, gy, f, p) {
    T2.grass(c, x, y, gx, gy, f, p);
    R(c, x + 6, y + 6, 4, 8, '#4a3b33'); R(c, x + 6, y + 6, 4, 1, '#6a564a');
    R(c, x + 5, y + 9, 6, 1, p.vine); P(c, x + 9, y + 8, p.vine);
  };
  T2.sign = function (c, x, y, gx, gy, f, p) {
    T2.grass(c, x, y, gx, gy, f, p);
    R(c, x + 7, y + 9, 2, 7, '#1f2b26');
    R(c, x + 2, y + 2, 12, 8, '#10302b');
    R(c, x + 2, y + 2, 12, 1, p.glow); R(c, x + 2, y + 9, 12, 1, U.shade(p.glow, -0.4));
    R(c, x + 4, y + 4, 8, 1, f === 0 ? p.glow : U.shade(p.glow, -0.3)); R(c, x + 4, y + 6, 5, 1, U.shade(p.glow, -0.2));
  };

  /* ---- Version III: Lattice ---- */
  const T3 = {};
  T3.grass = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    P(c, x, y, p.grid); P(c, x + 8, y + 8, U.mix(p.grid, p.paper, 0.5));
  };
  T3.flower = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    for (let i = 0; i < 2; i++) {
      const fx = 3 + Math.floor(U.hash(gx * 3 + i, gy, 221) * 9), fy = 3 + Math.floor(U.hash(gx, gy * 3 + i, 222) * 9);
      R(c, x + fx - 1, y + fy, 3, 1, p.blueL); R(c, x + fx, y + fy - 1, 1, 3, p.blueL);
    }
  };
  T3.road = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    const n = nbInfo(gx, gy);
    if (RL(n.l) && RL(n.r)) {
      if (!RL(n.u) && RL(n.d)) for (let i = (f * 2) % 4; i < 16; i += 4) R(c, x + i, y + 15, 2, 1, p.blueL);
      if (RL(n.u) && !RL(n.d)) for (let i = (f * 2) % 4; i < 16; i += 4) R(c, x + i, y, 2, 1, p.blueL);
    }
    if (RL(n.u) && RL(n.d)) {
      if (!RL(n.l) && RL(n.r)) for (let i = (f * 2) % 4; i < 16; i += 4) R(c, x + 15, y + i, 1, 2, p.blueL);
      if (RL(n.l) && !RL(n.r)) for (let i = (f * 2) % 4; i < 16; i += 4) R(c, x, y + i, 1, 2, p.blueL);
    }
    if (!RL(n.u)) R(c, x, y, 16, 1, p.blue);
    if (!RL(n.d)) R(c, x, y + 15, 16, 1, p.blue);
    if (!RL(n.l)) R(c, x, y, 1, 16, p.blue);
    if (!RL(n.r)) R(c, x + 15, y, 1, 16, p.blue);
  };
  T3.plaza = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    const pl = W().plaza;
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const d = Math.hypot(gx * 16 + i + 0.5 - (pl.cx + 0.5) * 16, gy * 16 + j + 0.5 - (pl.cy + 0.5) * 16);
      if (d > 24 && Math.abs((d % 16) - 8) < 0.55) P(c, x + i, y + j, p.blueL);
    }
    const n = nbInfo(gx, gy);
    if (!RL(n.u)) R(c, x, y, 16, 1, p.blue);
    if (!RL(n.d)) R(c, x, y + 15, 16, 1, p.blue);
    if (!RL(n.l)) R(c, x, y, 1, 16, p.blue);
    if (!RL(n.r)) R(c, x + 15, y, 1, 16, p.blue);
  };
  T3.water = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.blueLL);
    for (let j = (f % 2) * 1; j < 16; j += 3) R(c, x, y + j, 16, 1, p.blueL);
    const n = nbInfo(gx, gy);
    if (n.u !== TL.WATER && n.u !== TL.BRIDGE) R(c, x, y, 16, 1, p.blue);
    if (n.d !== TL.WATER && n.d !== TL.BRIDGE) R(c, x, y + 15, 16, 1, p.blue);
  };
  T3.bridge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    for (let j = 2; j < 16; j += 4) R(c, x + 2, y + j, 12, 1, p.grid);
    const n = nbInfo(gx, gy);
    if (n.l !== TL.BRIDGE) R(c, x, y, 2, 16, p.blue);
    if (n.r !== TL.BRIDGE) R(c, x + 14, y, 2, 16, p.blue);
  };
  T3.tree = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    const k = U.hash(gx, gy, 231);
    ring(c, x + 8, y + 8, 5, p.blue);
    if (k < 0.33) disc(c, x + 8, y + 8, 2, p.blue);
    else if (k < 0.66) { R(c, x + 5, y + 8, 7, 1, p.blue); R(c, x + 8, y + 5, 1, 7, p.blue); }
    else ring(c, x + 8, y + 8, 2.5, p.blueL);
  };
  T3.forest = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    for (let i = -16; i < 16; i += 3) line(c, x + Math.max(0, i), y + Math.max(0, -i), x + Math.min(15, i + 15), y + Math.min(15, 15 - i), p.blueL);
  };
  T3.fence = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    const n = nbInfo(gx, gy);
    const horiz = n.l === TL.FENCE || n.r === TL.FENCE;
    const vert = n.u === TL.FENCE || n.d === TL.FENCE;
    if (horiz || !vert) for (let i = 0; i < 16; i += 4) R(c, x + i, y + 8, 3, 2, p.ink);
    if (vert) for (let i = 0; i < 16; i += 4) R(c, x + 7, y + i, 2, 3, p.ink);
  };
  T3.hedge = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, p.paper);
    R(c, x + 1, y + 1, 14, 1, p.blue); R(c, x + 1, y + 14, 14, 1, p.blue);
    R(c, x + 1, y + 1, 1, 14, p.blue); R(c, x + 14, y + 1, 1, 14, p.blue);
    for (let i = 0; i < 12; i += 3) line(c, x + 2 + i, y + 2, x + 2, y + 2 + i, p.blueL);
  };
  T3.garden = function (c, x, y, gx, gy, f, p) {
    R(c, x, y, 16, 16, '#fbf8ef');
    for (let i = 0; i < 16; i += 4) { R(c, x + i, y, 1, 16, '#e7dcc4'); R(c, x, y + i, 16, 1, '#e7dcc4'); }
    if (U.hash(gx, gy, 241) < 0.6) {
      const hx = 4 + Math.floor(U.hash(gx, gy, 242) * 6), hy = 4 + Math.floor(U.hash(gx, gy, 243) * 6);
      AW.font.draw(c, 'H', x + hx, y + hy, p.ink);
    }
  };
  T3.lamp = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    ring(c, x + 8, y + 8, 3.5, p.ink); line(c, x + 6, y + 6, x + 10, y + 10, p.ink); line(c, x + 10, y + 6, x + 6, y + 10, p.ink);
  };
  T3.bench = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    R(c, x + 2, y + 6, 12, 1, p.ink); R(c, x + 2, y + 10, 12, 1, p.ink); R(c, x + 2, y + 6, 1, 5, p.ink); R(c, x + 13, y + 6, 1, 5, p.ink);
  };
  T3.post = function (c, x, y, gx, gy, f, p) { T3.grass(c, x, y, gx, gy, f, p); R(c, x + 7, y + 7, 3, 3, p.blueL); };
  T3.sign = function (c, x, y, gx, gy, f, p) {
    T3.grass(c, x, y, gx, gy, f, p);
    R(c, x + 2, y + 3, 12, 1, p.blue); R(c, x + 2, y + 10, 12, 1, p.blue); R(c, x + 2, y + 3, 1, 8, p.blue); R(c, x + 13, y + 3, 1, 8, p.blue);
    R(c, x + 4, y + 5, 8, 1, p.blueL); R(c, x + 4, y + 7, 5, 1, p.blueL); R(c, x + 7, y + 11, 2, 4, p.blue);
  };

  const PAINTERS = { I: T1, II: T2, III: T3 };
  const NAME = {
    [TL.GRASS]: 'grass', [TL.ROAD]: 'road', [TL.PLAZA]: 'plaza', [TL.WATER]: 'water', [TL.BRIDGE]: 'bridge',
    [TL.TREE]: 'tree', [TL.FOREST]: 'forest', [TL.FLOWER]: 'flower', [TL.FENCE]: 'fence', [TL.HEDGE]: 'hedge',
    [TL.GARDEN]: 'garden', [TL.LAMP]: 'lamp', [TL.BENCH]: 'bench', [TL.POST]: 'post', [TL.SIGN]: 'sign',
    [TL.BUILDING]: 'grass', [TL.PROP]: 'grass',
  };
  art.paintTile = function (ctx, v, type, gx, gy, frame) {
    const T = PAINTERS[v];
    const p = PAL[v];
    const fn = T[NAME[type]] || T.grass;
    const x = gx * 16, y = gy * 16;
    // lamps on roads keep the road underneath
    if (type === TL.LAMP) {
      const n = nbInfo(gx, gy);
      const base = RL(n.u) && RL(n.d) && RL(n.l) && RL(n.r) ? T.road : null;
      fn(ctx, x, y, gx, gy, frame, p, base);
    } else fn(ctx, x, y, gx, gy, frame, p);
  };

  /* ======================================================= buildings */
  const KIND_ICON = {
    sim: 'SIM', court: 'COURT', cafe: 'CAFE', registry: 'REGISTRY', plant: 'POWER', switch: 'SWITCH',
    atelier: 'ATELIER', school: 'SCHOOL', home: 'LODGING', hall: 'TOWN HALL', house: 'HOUSE', shop: 'SHOP',
  };
  art.buildingLabel = function (b, v) {
    const L = (AW.VERSIONS && AW.VERSIONS[v] && AW.VERSIONS[v].buildingNames) || {};
    return (L[b.id] || L[b.kind] || b.sign || KIND_ICON[b.kind] || '').toUpperCase();
  };

  function building1(c, b, f, p) {
    const x = b.x * 16, y = b.y * 16, w = b.w * 16, h = b.h * 16;
    const roofH = h - 26;
    const roof = p.roofs[b.hue % p.roofs.length];
    // roof
    R(c, x, y + 2, w, roofH, roof);
    for (let j = y + 6; j < y + roofH; j += 4) {
      R(c, x, j, w, 1, U.shade(roof, -0.18));
      for (let i = x + ((j / 4) % 2 ? 2 : 6); i < x + w; i += 8) R(c, i, j - 3, 1, 3, U.shade(roof, -0.1));
    }
    R(c, x, y + 2, w, 3, U.shade(roof, 0.25));
    R(c, x, y + roofH, w, 2, U.shade(roof, -0.4));
    R(c, x, y + 2, 1, roofH, U.shade(roof, -0.4)); R(c, x + w - 1, y + 2, 1, roofH, U.shade(roof, -0.4));
    // wall
    const wy = y + roofH + 2, wh = h - roofH - 2;
    R(c, x + 1, wy, w - 2, wh, p.wall);
    R(c, x + 1, wy + wh - 3, w - 2, 3, p.wallD);
    R(c, x + 1, wy, 1, wh, p.wallD);
    const dcol = b.door;
    for (let i = 0; i < b.w; i++) {
      if (i === dcol) continue;
      const wx = x + i * 16 + 4;
      R(c, wx - 1, wy + 5, 10, 10, p.frame);
      R(c, wx, wy + 6, 8, 8, p.win);
      R(c, wx, wy + 6, 3, 3, p.winL);
      R(c, wx + 4, wy + 6, 1, 8, p.frame);
    }
    if (dcol >= 0) {
      const dx = x + dcol * 16 + 3;
      R(c, dx - 1, wy + 3, 12, wh - 3, U.shade(p.door, -0.3));
      R(c, dx, wy + 4, 10, wh - 4, p.door);
      R(c, dx + 7, wy + 13, 2, 2, '#ffd86b');
      R(c, dx - 2, y + h - 2, 14, 2, '#c9bfa9');
    }
    // kind details
    const k = b.kind;
    if (k === 'home') { R(c, x + w - 20, y - 2, 6, 10, '#8a5a50'); R(c, x + w - 21, y - 3, 8, 2, '#5a3a30'); }
    if (k === 'sim') {
      disc(c, x + w - 18, y + 9, 6, '#e8edf2'); disc(c, x + w - 18, y + 9, 4, '#c3ccd6'); R(c, x + w - 19, y + 9, 2, 8, '#8a94a3');
    }
    if (k === 'switch') { for (const ax of [10, 22, 34]) { R(c, x + ax, y - 4, 1, 8, '#4a4f5a'); P(c, x + ax, y - 5, '#ff5a5a'); } }
    if (k === 'court' || k === 'registry' || k === 'hall') {
      for (let i = 0; i < b.w; i++) if (i !== dcol) R(c, x + i * 16 + 2, wy + 2, 2, wh - 5, '#ffffff');
      // pediment
      for (let j = 0; j < 8; j++) R(c, x + w / 2 - j * 3, y + 2 + j, j * 6, 1, U.shade(roof, 0.35));
    }
    if (k === 'hall') { disc(c, x + w / 2, y + 12, 5, '#fffbe8'); line(c, x + w / 2, y + 12, x + w / 2, y + 9, '#333'); line(c, x + w / 2, y + 12, x + w / 2 + 3, y + 12, '#333'); }
    if (k === 'cafe') {
      for (let i = 0; i < w - 2; i += 6) R(c, x + 1 + i, wy - 2, 3, 6, i % 12 ? '#ffffff' : '#e55a4f');
      R(c, x + 1, wy + 4, w - 2, 1, U.shade('#e55a4f', -0.3));
    }
    if (k === 'atelier') {
      // the big shop window with a mannequin silhouette
      R(c, x + 6, wy + 4, 34, 14, p.frame); R(c, x + 7, wy + 5, 32, 12, '#d9eef8');
      disc(c, x + 22, wy + 8, 2.5, '#c9c2b8'); R(c, x + 20, wy + 11, 5, 6, '#c9c2b8');
    }
    if (k === 'school') { R(c, x + w / 2 - 3, y - 4, 6, 6, '#e0a03a'); R(c, x + w / 2 - 1, y - 2, 2, 3, '#7a5a20'); }
    if (k === 'plant') {
      for (const tx of [10, 46]) {
        R(c, x + tx, y + 2, 26, h - 6, '#c9cfd6'); R(c, x + tx, y + 2, 26, 3, '#e8edf2'); R(c, x + tx + 20, y + 2, 6, h - 6, '#a8b0ba');
        R(c, x + tx + 4, y + 14, 18, 2, '#e8c840');
      }
    }
    if (b.sign || k !== 'house') {
      // shops hang their sign over the door; institutions carry a name board on the roof
      const label = art.buildingLabel(b, 'I');
      const tw = AW.font.width(label) + 6;
      const sx = Math.round(x + w / 2 - tw / 2);
      const sy = b.sign ? wy - 5 : y + roofH - 13;
      R(c, sx, sy, tw, 9, '#3b2a20'); R(c, sx + 1, sy + 1, tw - 2, 7, '#fff7e0');
      AW.font.draw(c, label, sx + 3, sy + 2, '#3b2a20');
    }
  }

  function building2(c, b, f, p) {
    const x = b.x * 16, y = b.y * 16, w = b.w * 16, h = b.h * 16;
    const roofH = h - 24;
    const roof = p.roofs[b.hue % p.roofs.length];
    const wy = y + roofH, wh = h - roofH;
    // walls: dark, organic
    R(c, x + 2, wy - 4, w - 4, wh + 4, p.wall);
    R(c, x + 2, y + h - 3, w - 4, 3, p.wallD);
    R(c, x + 2, wy - 4, w - 4, 1, p.wallL);
    // canopy roof: overlapping leaf petals
    ellipse(c, x + w / 2, y + roofH / 2 + 2, w / 2 + 1, roofH / 2 + 3, U.shade(roof, -0.45));
    const petals = Math.max(3, b.w);
    for (let i = 0; i < petals; i++) {
      const px = x + 8 + (i * (w - 16)) / Math.max(1, petals - 1);
      ellipse(c, px, y + roofH / 2 + 1, 9, roofH / 2 + 1, U.shade(roof, -0.15));
      ellipse(c, px - 1, y + roofH / 2 - 1, 7, roofH / 2 - 2, roof);
      line(c, px, y + 4, px, y + roofH, U.shade(roof, 0.25));
      P(c, px, y + 3, f === 0 ? p.glow : U.shade(p.glow, -0.4));
    }
    // solar leaves glints
    for (let i = 0; i < b.w; i++) P(c, x + i * 16 + 6, y + 7 + (i % 2) * 5, U.shade(roof, 0.5));
    // hanging vines
    for (let i = 0; i < b.w * 2; i++) {
      const vx = x + 4 + i * 8 + Math.floor(U.hash(b.x + i, b.y, 301) * 4);
      const vl = 3 + Math.floor(U.hash(b.x, b.y + i, 302) * 8);
      R(c, vx, wy - 3, 1, vl, p.vine);
      if (i % 3 === 0) P(c, vx, wy - 3 + vl, f === 0 ? p.glow2 : U.shade(p.glow2, -0.4));
    }
    // round glowing windows and a port door
    for (let i = 0; i < b.w; i++) {
      if (i === b.door) continue;
      const cx = x + i * 16 + 8;
      disc(c, cx, wy + 9, 4, '#14211f');
      disc(c, cx, wy + 9, 3, (i + b.hue) % 3 === 0 ? p.winWarm : p.win);
      P(c, cx - 1, wy + 8, '#ffffff');
    }
    if (b.door >= 0) {
      const dx = x + b.door * 16 + 8;
      disc(c, dx, wy + 14, 6, '#0f1a19');
      ring(c, dx, wy + 14, 6, f === 0 ? p.glow : U.shade(p.glow, -0.3));
      R(c, dx - 5, y + h - 4, 10, 4, '#0f1a19');
    }
    const k = b.kind;
    if (k === 'sim') {
      disc(c, x + w - 18, y + 9, 8, U.rgba('#9ff8ff', 0.35));
      ring(c, x + w - 18, y + 9, 8, '#9ff8ff');
      for (let i = 0; i < 5; i++) P(c, x + w - 22 + i * 2, y + 7 + (i % 2) * 3, f === 0 ? p.glow3 : p.glow);
    }
    if (k === 'plant') {
      for (const tx of [12, 48]) {
        ellipse(c, x + tx + 12, y + 18, 14, 16, '#253b3a'); ellipse(c, x + tx + 12, y + 16, 11, 13, '#2f4c4a');
        ring(c, x + tx + 12, y + 16, 9, f === 0 ? p.glow3 : U.shade(p.glow3, -0.4));
        disc(c, x + tx + 12, y + 16, 3, f === 0 ? p.glow3 : U.shade(p.glow3, -0.3));
      }
    }
    if (k === 'switch') for (const ax of [10, 24, 38]) { R(c, x + ax, y - 3, 1, 8, '#1f2b26'); P(c, x + ax, y - 4, f === 0 ? p.glow2 : p.glow); }
    if (k === 'court') { for (let i = 0; i < 3; i++) ring(c, x + w / 2, y + roofH / 2 + 2, 4 + i * 4, U.shade(p.glow4, -0.2 * i)); }
    if (b.sign || k === 'cafe' || k === 'atelier') {
      const label = art.buildingLabel(b, 'II');
      const tw = AW.font.width(label) + 6;
      const sx = Math.round(x + w / 2 - tw / 2);
      R(c, sx, wy - 2, tw, 9, '#081614'); R(c, sx, wy - 2, tw, 1, p.glow);
      AW.font.draw(c, label, sx + 3, wy, f === 0 ? p.glow : U.shade(p.glow, -0.2));
    }
  }

  function building3(c, b, f, p) {
    const x = b.x * 16, y = b.y * 16, w = b.w * 16, h = b.h * 16;
    R(c, x + 1, y + 1, w - 2, h - 2, p.paper);
    // double outline
    R(c, x + 1, y + 1, w - 2, 2, p.blue); R(c, x + 1, y + h - 3, w - 2, 2, p.blue);
    R(c, x + 1, y + 1, 2, h - 2, p.blue); R(c, x + w - 3, y + 1, 2, h - 2, p.blue);
    R(c, x + 5, y + 5, w - 10, 1, p.blueL); R(c, x + 5, y + h - 6, w - 10, 1, p.blueL);
    R(c, x + 5, y + 5, 1, h - 10, p.blueL); R(c, x + w - 6, y + 5, 1, h - 10, p.blueL);
    // hatched roof band
    const bandH = Math.max(10, h - 34);
    for (let i = -bandH; i < w - 12; i += 4) line(c, x + 6 + Math.max(0, i), y + 6 + Math.max(0, -i), x + 6 + Math.min(w - 13, i + bandH - 1), y + 6 + Math.min(bandH - 1, w - 13 - i), p.blueLL === undefined ? p.blueL : U.mix(p.blueL, p.paper, 0.35));
    R(c, x + 5, y + 6 + bandH, w - 10, 1, p.blue);
    // label
    const label = art.buildingLabel(b, 'III');
    const words = label.split(' ');
    const lines = AW.font.width(label) > w - 14 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [label];
    const ly = y + 6 + bandH + Math.max(3, Math.floor((h - bandH - 16 - lines.length * 7) / 2));
    lines.forEach((ln, i) => {
      const tw = AW.font.width(ln);
      R(c, Math.round(x + w / 2 - tw / 2) - 2, ly + i * 7 - 1, tw + 4, 7, p.paper);
      AW.font.drawCentered(c, ln, x + w / 2, ly + i * 7, p.blue);
    });
    // door gap with arrow
    if (b.door >= 0) {
      const dx = x + b.door * 16 + 4;
      R(c, dx, y + h - 6, 8, 6, p.paper);
      R(c, dx - 1, y + h - 6, 1, 6, p.blue); R(c, dx + 8, y + h - 6, 1, 6, p.blue);
      P(c, dx + 4, y + h - 2, p.blue); R(c, dx + 3, y + h - 3, 3, 1, p.blue);
    }
    // kind glyphs in the band
    const k = b.kind;
    const gx = x + 10, gy = y + 9;
    if (k === 'sim') { for (let i = 0; i < 3; i++) { R(c, gx + i * 2, gy + i * 2, 12 - i * 4, 1, p.blue); R(c, gx + i * 2, gy + i * 2 + 8 - i * 4, 12 - i * 4, 1, p.blue); R(c, gx + i * 2, gy + i * 2, 1, 8 - i * 4, p.blue); R(c, gx + i * 2 + 11 - i * 4, gy + i * 2, 1, 8 - i * 4, p.blue); } }
    if (k === 'court') { line(c, gx, gy + 8, gx + 6, gy, p.blue); line(c, gx + 6, gy, gx + 12, gy + 8, p.blue); R(c, gx, gy + 8, 13, 1, p.blue); }
    if (k === 'switch') { disc(c, gx + 1, gy + 4, 1.5, p.blue); disc(c, gx + 10, gy + 1, 1.5, p.blue); disc(c, gx + 10, gy + 7, 1.5, p.blue); line(c, gx + 1, gy + 4, gx + 10, gy + 1, p.blue); line(c, gx + 1, gy + 4, gx + 10, gy + 7, p.blue); }
    if (k === 'plant') { line(c, gx + 6, gy, gx + 2, gy + 5, p.red); line(c, gx + 2, gy + 5, gx + 8, gy + 4, p.red); line(c, gx + 8, gy + 4, gx + 4, gy + 9, p.red); }
    if (k === 'atelier') { for (let i = 0; i < 5; i++) R(c, gx, gy + i * 2, 12, 1, i === 0 ? p.red : p.blue); }
  }

  art.paintBuilding = function (ctx, v, b, frame) {
    const p = PAL[v];
    if (v === 'I') building1(ctx, b, frame, p);
    else if (v === 'II') building2(ctx, b, frame, p);
    else building3(ctx, b, frame, p);
  };

  /* ======================================================= props */
  art.paintProp = function (c, v, pr, f) {
    const p = PAL[v];
    const x = pr.x * 16, y = pr.y * 16, w = pr.w * 16, h = pr.h * 16;
    const k = pr.kind;
    if (k === 'well') {
      if (v === 'I') {
        disc(c, x + 16, y + 17, 15, '#a99f8c'); disc(c, x + 16, y + 16, 14, '#d8cfbd');
        disc(c, x + 16, y + 16, 10, p.waterD); disc(c, x + 16, y + 15, 9, p.water);
        R(c, x + 14, y + 4, 4, 12, '#a99f8c'); disc(c, x + 16, y + 4, 3, '#d8cfbd');
        P(c, x + 12 + f * 3, y + 14, p.waterL); P(c, x + 19 - f * 2, y + 18, p.waterL);
      } else if (v === 'II') {
        disc(c, x + 16, y + 17, 15, '#2a1f1a'); disc(c, x + 16, y + 16, 14, '#4b3b33');
        disc(c, x + 16, y + 16, 9, '#0c2a33'); disc(c, x + 16, y + 16, 6, f === 0 ? U.rgba(p.glow, 0.8) : U.rgba(p.glow, 0.5));
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + f * 0.4; P(c, x + 16 + Math.cos(a) * 12, y + 16 + Math.sin(a) * 12, p.glow3); }
      } else {
        ring(c, x + 16, y + 16, 14, p.blue); ring(c, x + 16, y + 16, 11, p.blue); disc(c, x + 16, y + 16, 4, p.blue);
        AW.font.drawCentered(c, 'COMMONS', x + 16, y - 6, p.blue);
      }
    } else if (k === 'board') {
      if (v === 'I') {
        R(c, x + 4, y + 18, 3, 14, p.woodD); R(c, x + w - 7, y + 18, 3, 14, p.woodD);
        R(c, x + 1, y + 1, w - 2, 22, p.woodD); R(c, x + 3, y + 3, w - 6, 18, '#fffaf0');
        line(c, x + 5, y + 18, x + w - 6, y + 12, '#c8463d');
        line(c, x + 5, y + 19, x + w / 2, y + 17, '#3b62c4'); line(c, x + w / 2, y + 17, x + w - 6, y + 5, '#3b62c4');
        AW.font.draw(c, 'MINDS', x + 5, y + 4, '#3b2a20');
      } else if (v === 'II') {
        R(c, x + 21, y + 18, 6, 14, '#1f2b26');
        R(c, x + 1, y + 1, w - 2, 22, '#081614'); R(c, x + 1, y + 1, w - 2, 1, p.glow);
        line(c, x + 4, y + 18, x + w - 5, y + 12, p.glow3);
        line(c, x + 4, y + 20, x + w / 2, y + 16, p.glow); line(c, x + w / 2, y + 16, x + w - 5, y + 4, p.glow);
        P(c, x + w / 2 + 2, y + 14, '#ffffff');
      } else {
        R(c, x + 1, y + 1, w - 2, h - 2, p.paper);
        R(c, x + 3, y + 3, 1, h - 7, p.blue); R(c, x + 3, y + h - 5, w - 6, 1, p.blue);
        line(c, x + 4, y + h - 7, x + w - 5, y + 14, p.ink);
        line(c, x + 4, y + h - 6, x + w / 2, y + 22, p.blue); line(c, x + w / 2, y + 22, x + w - 5, y + 5, p.blue);
        AW.font.draw(c, 'A', x + w - 9, y + 4, p.blue); AW.font.draw(c, 'H', x + w - 9, y + 16, p.ink);
      }
    } else if (k === 'simtable') {
      if (v === 'I') { R(c, x, y + 2, w, h - 2, '#6b4a32'); R(c, x + 1, y + 3, w - 2, h - 6, '#8a5a30'); }
      else if (v === 'II') { R(c, x, y + 1, w, h - 1, '#1d2d2a'); R(c, x, y + 1, w, 1, p.glow); }
      else { R(c, x, y, w, h, p.paper); R(c, x, y, w, 1, p.blue); R(c, x, y + h - 1, w, 1, p.blue); R(c, x, y, 1, h, p.blue); R(c, x + w - 1, y, 1, h, p.blue); }
    } else if (k === 'console') {
      if (v === 'I') {
        R(c, x, y + 3, w, 11, '#6b4a32'); R(c, x + 1, y + 4, w - 2, 8, '#2f6b4f');
        for (let i = 0; i < 6; i++) R(c, x + 4 + i * 7, y + 6 + (i % 2) * 2, 5, 3, ['#fff', '#ffd23f', '#9fd3f2'][i % 3]);
      } else if (v === 'II') {
        R(c, x, y + 3, w, 11, '#1d2d2a');
        for (let i = 0; i < 5; i++) { disc(c, x + 6 + i * 9, y + 8, 2, f === 0 ? [p.glow, p.glow2, p.glow3][i % 3] : p.glow4); }
        line(c, x + 6, y + 8, x + 42, y + 8, U.shade(p.glow, -0.5));
      } else {
        R(c, x, y + 2, w, 12, p.paper); R(c, x, y + 2, w, 1, p.blue); R(c, x, y + 13, w, 1, p.blue);
        for (let i = 0; i < 4; i++) { disc(c, x + 6 + i * 12, y + 8, 2, p.blue); if (i) line(c, x + 6 + (i - 1) * 12, y + 8, x + 6 + i * 12, y + 8, p.blueL); }
      }
    } else if (k === 'table') {
      if (v === 'I') { disc(c, x + 8, y + 9, 6, '#a8734a'); disc(c, x + 8, y + 8, 5, '#c98f5e'); R(c, x + 7, y + 11, 2, 4, '#5a3a20'); P(c, x + 6, y + 6, '#ffffff'); }
      else if (v === 'II') { ellipse(c, x + 8, y + 9, 7, 4, '#4b2f4f'); ellipse(c, x + 8, y + 8, 6, 3, '#7a4a80'); P(c, x + 6, y + 7, p.glow2); R(c, x + 7, y + 11, 2, 4, '#2a1f1a'); }
      else { ring(c, x + 8, y + 8, 5, p.blue); }
    }
  };

  /* ======================================================= characters */
  const spriteCache = new Map();
  art.clearCache = () => spriteCache.clear();

  /* spec: { type, colours..., outline } ; dir: 'down'|'up'|'left'|'right' ; frame 0..2 */
  art.sprite = function (spec, dir, frame) {
    const key = spec.key + '|' + dir + '|' + frame;
    let s = spriteCache.get(key);
    if (s) return s;
    const mirror = dir === 'left';
    const d = mirror ? 'right' : dir;
    const c = cv(16, 20);
    const ctx = c.getContext('2d');
    const fn = CHAR[spec.type] || CHAR.human;
    fn(ctx, spec, d, frame);
    if (spec.outline) outline(c, spec.outline);
    if (spec.after) spec.after(ctx, d, frame);
    if (mirror) {
      const m = cv(16, 20);
      const mc = m.getContext('2d');
      mc.translate(16, 0); mc.scale(-1, 1); mc.drawImage(c, 0, 0);
      s = m;
    } else s = c;
    spriteCache.set(key, s);
    return s;
  };

  const CHAR = {};
  CHAR.human = function (c, s, d, f) {
    const skin = s.skin || '#f1c7a0', hair = s.hair || '#3b2a20', top = s.top || '#3f7fbf', bot = s.bottom || '#3a3f4f';
    const shoe = s.shoe || '#2e2622';
    const topD = U.shade(top, -0.22);
    const mask = s.hairStyle === 'mask';
    const headCol = mask ? (s.head || '#e8ecf0') : skin;
    // legs
    const legs = (lx, len) => { R(c, lx, 16, 2, len, bot); R(c, lx, 15 + len, 2, 1, shoe); };
    if (d === 'down' || d === 'up') {
      legs(5, f === 1 ? 2 : 3); legs(9, f === 2 ? 2 : 3);
      R(c, 4, 11, 8, 5, top); R(c, 4, 15, 8, 1, U.shade(bot, -0.1));
      if (s.accent) { if (d === 'down') { line(c, 5, 11, 10, 14, s.accent); } else R(c, 4, 11, 8, 1, s.accent); }
      R(c, 3, 11, 1, 4, topD); R(c, 12, 11, 1, 4, topD);
      P(c, 3, 15 - (f === 1 ? 1 : 0), skin); P(c, 12, 15 - (f === 2 ? 1 : 0), skin);
      // head
      R(c, 5, 2, 6, 1, headCol); R(c, 4, 3, 8, 1, headCol); R(c, 3, 4, 10, 6, headCol); R(c, 4, 10, 8, 1, headCol);
      if (mask) {
        R(c, 4, 6, 8, 3, '#1c2433');
        P(c, 6, 7, s.eyes || '#46e0ff'); P(c, 9, 7, s.eyes || '#46e0ff');
        if (d === 'up') R(c, 4, 6, 8, 3, U.shade(headCol, -0.15));
      } else if (d === 'down') {
        hairDown(c, s, hair);
        R(c, 6, 7, 1, 2, s.eyes || '#2b1d14'); R(c, 9, 7, 1, 2, s.eyes || '#2b1d14');
        if (s.eyes) { P(c, 6, 7, U.shade(s.eyes, 0.6)); P(c, 9, 7, U.shade(s.eyes, 0.6)); }
        if (s.blush) { P(c, 5, 9, s.blush); P(c, 10, 9, s.blush); }
      } else {
        R(c, 5, 2, 6, 1, hair); R(c, 4, 3, 8, 1, hair); R(c, 3, 4, 10, 6, hair); R(c, 4, 10, 8, 1, hair);
        if (s.hairStyle === 'long') { R(c, 3, 10, 10, 2, hair); }
        if (s.hairStyle === 'bun') { R(c, 6, 0, 4, 2, hair); }
      }
      if (s.hat) hatDraw(c, s, d);
    } else { // right
      if (f === 0) { R(c, 6, 16, 4, 3, bot); R(c, 6, 18, 4, 1, shoe); }
      else if (f === 1) { R(c, 5, 16, 2, 2, bot); P(c, 5, 18, shoe); P(c, 6, 18, shoe); R(c, 9, 16, 2, 3, bot); R(c, 9, 18, 3, 1, shoe); }
      else { R(c, 6, 16, 2, 3, bot); R(c, 6, 18, 2, 1, shoe); R(c, 8, 16, 2, 2, bot); R(c, 8, 18, 3, 1, shoe); }
      R(c, 5, 11, 6, 5, top); R(c, 5, 15, 6, 1, U.shade(bot, -0.1));
      if (s.accent) R(c, 5, 11, 6, 1, s.accent);
      const ax = f === 1 ? 8 : f === 2 ? 6 : 7;
      R(c, ax, 11, 2, 4, topD); P(c, ax, 15, skin); P(c, ax + 1, 15, skin);
      R(c, 6, 2, 5, 1, headCol); R(c, 5, 3, 7, 1, headCol); R(c, 4, 4, 9, 6, headCol); R(c, 5, 10, 7, 1, headCol);
      if (mask) {
        R(c, 8, 6, 5, 3, '#1c2433'); P(c, 11, 7, s.eyes || '#46e0ff');
      } else {
        R(c, 6, 2, 5, 1, hair); R(c, 5, 3, 7, 1, hair); R(c, 4, 4, 9, 2, hair); R(c, 4, 6, 4, 3, hair); P(c, 8, 6, hair);
        if (s.hairStyle === 'long') { R(c, 4, 9, 4, 3, hair); }
        if (s.hairStyle === 'bun') { R(c, 4, 1, 3, 3, hair); }
        R(c, 10, 7, 1, 2, s.eyes || '#2b1d14');
        if (s.blush) P(c, 10, 9, s.blush);
      }
      if (s.hat) hatDraw(c, s, d);
    }
  };
  function hairDown(c, s, hair) {
    R(c, 5, 2, 6, 1, hair); R(c, 4, 3, 8, 1, hair); R(c, 3, 4, 10, 2, hair);
    R(c, 3, 6, 2, 2, hair); R(c, 11, 6, 2, 2, hair); R(c, 5, 6, 2, 1, hair);
    if (s.hairStyle === 'long') { R(c, 3, 8, 2, 4, hair); R(c, 11, 8, 2, 4, hair); }
    if (s.hairStyle === 'bun') { R(c, 6, 0, 4, 2, hair); }
    if (s.hairStyle === 'spiky') { P(c, 4, 2, hair); P(c, 7, 1, hair); P(c, 10, 2, hair); }
  }
  function hatDraw(c, s, d) {
    const hc = s.hat, band = s.hatBand || U.shade(hc, -0.35);
    if (d === 'right') {
      R(c, 6, 0, 5, 1, hc); R(c, 5, 1, 7, 3, hc); R(c, 5, 3, 7, 1, band); R(c, 3, 4, 12, 1, U.shade(hc, -0.15));
    } else {
      R(c, 5, 0, 6, 1, hc); R(c, 4, 1, 8, 3, hc); R(c, 4, 3, 8, 1, band); R(c, 1, 4, 14, 1, U.shade(hc, -0.15));
      if (d === 'down') R(c, 4, 5, 8, 1, U.shade(s.skin || '#f1c7a0', -0.18));
    }
  }

  CHAR.crawler = function (c, s, d, f) {
    const body = s.body || '#7b8a96', acc = s.accent || '#6ff5d2';
    const leg = U.shade(body, -0.45);
    if (d === 'right') {
      for (let i = 0; i < 3; i++) {
        const lx = 4 + i * 4, up = (i + f) % 2;
        R(c, lx, 16, 1, 2 - up, leg); P(c, lx + (up ? 1 : -1), 18 - up, leg);
      }
      ellipse(c, 8, 13, 6, 3.6, body);
      R(c, 3, 12, 10, 1, U.shade(body, 0.25));
      R(c, 4, 14, 8, 1, acc);
      P(c, 13, 12, acc); P(c, 14, 12, U.shade(acc, 0.5));
    } else {
      for (let i = 0; i < 3; i++) {
        const ly = 10 + i * 3, up = (i + f) % 2;
        P(c, 2, ly + up, leg); P(c, 1, ly + 1 + up, leg); P(c, 13, ly + 1 - up, leg); P(c, 14, ly + 2 - up, leg);
      }
      ellipse(c, 8, 13, 5, 4.5, body);
      R(c, 7, 9, 2, 8, U.shade(body, 0.25));
      R(c, 5, 12, 6, 1, acc);
      if (d === 'down') { R(c, 6, 16, 4, 1, acc); P(c, 7, 16, '#ffffff'); }
      else { P(c, 5, 9, '#ff5a5a'); P(c, 10, 9, '#ff5a5a'); }
    }
  };
  CHAR.drone = function (c, s, d, f) {
    const body = s.body || '#9aa6b2', acc = s.accent || '#ff7ad9';
    const wing = U.rgba('#e8fbff', 0.75);
    c.fillStyle = wing;
    if (f % 2 === 0) { ellipse(c, 3.5, 6, 3, 1.4, wing); ellipse(c, 12.5, 6, 3, 1.4, wing); }
    else { ellipse(c, 3.5, 4.5, 2.4, 1, wing); ellipse(c, 12.5, 4.5, 2.4, 1, wing); }
    disc(c, 8, 8, 4, body);
    R(c, 4, 8, 8, 1, acc);
    disc(c, 7, 6.5, 1.3, U.shade(body, 0.4));
    if (d === 'down') { P(c, 7, 10, acc); P(c, 8, 10, acc); }
    else if (d === 'right') { P(c, 11, 8, '#ffffff'); P(c, 11, 9, acc); }
    R(c, 7, 12, 2, 2, U.shade(body, -0.4));
  };
  CHAR.walker = function (c, s, d, f) {
    const body = s.body || '#b7c0c8', acc = s.accent || '#ffd36e';
    const dark = U.shade(body, -0.4);
    if (d === 'right') {
      R(c, 6, 1, 6, 4, body); R(c, 9, 2, 3, 2, acc);
      R(c, 7, 5, 2, 1, dark);
      R(c, 6, 6, 4, 6, body); P(c, 8, 8, acc);
      R(c, 7 + (f === 1 ? 1 : 0), 7, 1, 5, dark);
      R(c, 7, 12, 1, 7 - (f === 1 ? 1 : 0), dark); R(c, 9 - (f === 2 ? 1 : 0), 12, 1, 7, dark);
    } else {
      R(c, 5, 1, 6, 4, body); if (d === 'down') R(c, 6, 3, 4, 1, acc);
      R(c, 7, 5, 2, 1, dark);
      R(c, 6, 6, 4, 6, body); if (d === 'down') P(c, 7, 8, acc);
      R(c, 5, 6, 1, 5, dark); R(c, 10, 6, 1, 5, dark);
      R(c, 6, 12, 1, 7 - (f === 1 ? 1 : 0), dark); R(c, 9, 12, 1, 7 - (f === 2 ? 1 : 0), dark);
    }
  };
  CHAR.roller = function (c, s, d, f) {
    const body = s.body || '#d0a24a', acc = s.accent || '#6ff5d2';
    if (d === 'right') {
      R(c, 2, 8, 12, 7, body); R(c, 2, 8, 12, 1, U.shade(body, 0.3));
      R(c, 10, 10, 3, 2, acc);
      disc(c, 5, 16, 2.4, '#1f1f24'); disc(c, 11, 16, 2.4, '#1f1f24');
      P(c, 5 + (f % 2), 16, '#888'); P(c, 11 - (f % 2), 16, '#888');
    } else {
      R(c, 3, 8, 10, 7, body); R(c, 3, 8, 10, 1, U.shade(body, 0.3));
      if (d === 'down') { R(c, 5, 10, 6, 3, '#1c2433'); P(c, 6, 11, acc); P(c, 9, 11, acc); }
      R(c, 3, 15, 10, 3, '#1f1f24');
      for (let i = 0; i < 10; i += 3) P(c, 3 + ((i + f) % 10), 16, '#666');
    }
    R(c, 7, 6, 2, 2, acc);
  };
  CHAR.picto = function (c, s, d, f) {
    const ink = s.color || '#10104a';
    disc(c, 8, 5, 3.2, ink);
    R(c, 5, 9, 6, 6, ink); c.clearRect(5, 9, 1, 1); c.clearRect(10, 9, 1, 1);
    if (d === 'right') {
      R(c, 7, 10, 2, 4, U.shade(ink, 0.3));
      if (f === 1) { R(c, 5, 15, 2, 4, ink); R(c, 9, 15, 2, 4, ink); } else { R(c, 6, 15, 2, 4, ink); R(c, 8, 15, 2, 4, ink); }
      P(c, 10, 4, '#ffffff');
    } else {
      R(c, 4, 10, 1, 4, ink); R(c, 11, 10, 1, 4, ink);
      R(c, 5, 15, 2, f === 1 ? 3 : 4, ink); R(c, 9, 15, 2, f === 2 ? 3 : 4, ink);
      if (d === 'down') { P(c, 7, 5, '#ffffff'); P(c, 9, 5, '#ffffff'); }
    }
    if (s.mark) { R(c, 6, 11, 4, 1, s.mark); }
  };
  CHAR.glyphA = function (c, s, d, f) {
    const col = s.color || '#2a2ae0';
    const oy = 8;
    R(c, 5, oy + 0, 6, 1, col); R(c, 4, oy + 1, 8, 1, col); R(c, 3, oy + 2, 10, 8, col);
    // counter and leg gap
    R(c, 6, oy + 3, 4, 2, s.fill || 'rgba(0,0,0,0)'); c.clearRect(6, oy + 7, 4, 3);
    if (!s.fill) c.clearRect(6, oy + 3, 4, 2);
    if (f === 1) c.clearRect(3, oy + 9, 3, 1);
    if (f === 2) c.clearRect(10, oy + 9, 3, 1);
    if (d === 'down') { P(c, 5, oy + 1, U.shade(col, 0.6)); }
    if (d === 'right') { P(c, 12, oy + 2, U.shade(col, 0.6)); P(c, 12, oy + 3, U.shade(col, 0.6)); }
    if (d === 'left') { P(c, 3, oy + 2, U.shade(col, 0.6)); }
    if (s.ring) ring(c, 8, oy + 5, 7.5, s.ring);
  };
  CHAR.mannequin = function (c, s, d, f) {
    const g = s.color || '#c9c2b8';
    disc(c, 8, 5, 3.5, g);
    R(c, 5, 9, 6, 6, g); R(c, 7, 15, 2, 3, U.shade(g, -0.3)); R(c, 5, 18, 6, 1, U.shade(g, -0.4));
  };
  CHAR.node = function (c, s, d, f) {
    const col = s.color || '#2a2ae0';
    ring(c, 8, 12, 5, col); disc(c, 8, 12, 2.5, col);
  };

  /* Big portrait canvas (scaled sprite) for panels */
  art.portrait = function (spec, scale, dir) {
    const s = art.sprite(spec, dir || 'down', 0);
    const c = cv(16 * scale, 20 * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s, 0, 0, 16 * scale, 20 * scale);
    return c;
  };
})();
