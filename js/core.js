/* Agentworld: Parallax — core utilities, input, audio, tiny bitmap font. */
'use strict';
(function () {
  const AW = (window.AW = window.AW || {});

  AW.T = 16;      // tile size in pixels
  AW.VW = 384;    // internal view width  (24 tiles)
  AW.VH = 240;    // internal view height (15 tiles)

  /* ------------------------------------------------------------------ utils */
  const U = (AW.util = {});
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hash = function (x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  U.pick = (arr, r) => arr[Math.floor((r === undefined ? Math.random() : r) * arr.length) % arr.length];
  U.sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  U.hexToRgb = function (hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map((v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  /* f > 0 lightens toward white, f < 0 darkens toward black */
  U.shade = function (hex, f) {
    const [r, g, b] = U.hexToRgb(hex);
    if (f >= 0) return U.rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
    return U.rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f));
  };
  U.mix = function (a, b, t) {
    const A = U.hexToRgb(a), B = U.hexToRgb(b);
    return U.rgbToHex(U.lerp(A[0], B[0], t), U.lerp(A[1], B[1], t), U.lerp(A[2], B[2], t));
  };
  U.rgba = function (hex, a) {
    const [r, g, b] = U.hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };

  /* ------------------------------------------------------------------ input */
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'act', Enter: 'act', KeyZ: 'act', KeyE: 'act',
    ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'back', Escape: 'back', Backspace: 'back',
    KeyL: 'lens', KeyV: 'version', KeyN: 'notebook', KeyM: 'mute', KeyH: 'help',
    Digit1: 'v1', Digit2: 'v2', Digit3: 'v3', Digit4: 'v4', Digit5: 'v5',
    Numpad1: 'v1', Numpad2: 'v2', Numpad3: 'v3', Numpad4: 'v4', Numpad5: 'v5',
  };
  const input = (AW.input = {
    down: Object.create(null),
    queue: [],          // actions pressed since last game poll (only when no modal is active)
    modal: [],          // stack of modal handlers fn(action) -> void
    lastDir: null,
    pushModal(fn) { this.modal.push(fn); this.queue.length = 0; },
    popModal(fn) {
      const i = this.modal.lastIndexOf(fn);
      if (i >= 0) this.modal.splice(i, 1);
      this.queue.length = 0;
    },
    hasModal() { return this.modal.length > 0; },
    press(action) {
      if (AW.audio) AW.audio.unlock();
      if (this.modal.length) { this.modal[this.modal.length - 1](action); return; }
      this.queue.push(action);
    },
    take(action) {
      const i = this.queue.indexOf(action);
      if (i >= 0) { this.queue.splice(i, 1); return true; }
      return false;
    },
    clearQueue() { this.queue.length = 0; },
    set(action, isDown) {
      if (isDown && !this.down[action]) { this.down[action] = true; this.press(action); }
      else if (!isDown) this.down[action] = false;
    },
    heldDir() {
      // most recently pressed held direction wins
      const order = this._dirOrder || [];
      for (let i = order.length - 1; i >= 0; i--) if (this.down[order[i]]) return order[i];
      return null;
    },
  });
  input._dirOrder = [];
  function noteDir(a, isDown) {
    if (!['up', 'down', 'left', 'right'].includes(a)) return;
    const o = input._dirOrder;
    const i = o.indexOf(a);
    if (i >= 0) o.splice(i, 1);
    if (isDown) o.push(a);
  }
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const a = KEYMAP[e.code];
    if (!a) return;
    e.preventDefault();
    if (e.repeat) return;
    noteDir(a, true);
    input.set(a, true);
  });
  window.addEventListener('keyup', (e) => {
    const a = KEYMAP[e.code];
    if (!a) return;
    noteDir(a, false);
    input.set(a, false);
  });
  window.addEventListener('blur', () => {
    for (const k in input.down) input.down[k] = false;
    input._dirOrder.length = 0;
  });
  input.virtual = function (a, isDown) { noteDir(a, isDown); input.set(a, isDown); };

  /* ------------------------------------------------------------------ audio */
  const audio = (AW.audio = {
    ctx: null, master: null, muted: false, ambient: null, _unlocked: false,
    unlock() {
      if (this._unlocked) return;
      this._unlocked = true;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.5;
        this.master.connect(this.ctx.destination);
        if (this._pendingAmbient) this.setAmbient(this._pendingAmbient);
      } catch (e) { this.ctx = null; }
    },
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.05);
    },
    tone(freq, dur, type, vol, slide) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },
    text(voice) { this.tone(voice || 520, 0.035, 'square', 0.018); },
    step() { this.tone(90 + Math.random() * 20, 0.04, 'triangle', 0.02); },
    select() { this.tone(660, 0.06, 'square', 0.03); this.tone(990, 0.08, 'square', 0.02); },
    confirm() { this.tone(523, 0.07, 'triangle', 0.05); setTimeout(() => this.tone(784, 0.12, 'triangle', 0.05), 70); },
    chime() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'sine', 0.05), i * 90));
    },
    whoosh() { this.tone(200, 0.5, 'sawtooth', 0.025, 6); },
    bump() { this.tone(70, 0.08, 'square', 0.03); },
    setAmbient(kind) {
      this._pendingAmbient = kind;
      if (!this.ctx) return;
      if (this.ambient) {
        const old = this.ambient;
        old.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
        setTimeout(() => old.oscs.forEach((o) => { try { o.stop(); } catch (e) {} }), 2000);
        this.ambient = null;
      }
      const chords = {
        I: [196.0, 246.94, 293.66, 392.0],
        II: [146.83, 220.0, 277.18, 329.63],
        III: [130.81, 196.0, 261.63, 311.13],
      };
      const freqs = chords[kind];
      if (!freqs) return;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'III' ? 900 : 650;
      filter.connect(gain);
      gain.connect(this.master);
      const oscs = [];
      freqs.forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = kind === 'II' ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = (i % 2 ? 6 : -6);
        const lfo = this.ctx.createOscillator();
        const lg = this.ctx.createGain();
        lfo.frequency.value = 0.07 + i * 0.03;
        lg.gain.value = 4;
        lfo.connect(lg); lg.connect(o.detune);
        o.connect(filter);
        o.start(); lfo.start();
        oscs.push(o, lfo);
      });
      gain.gain.setTargetAtTime(0.035, this.ctx.currentTime, 1.5);
      this.ambient = { gain, oscs };
    },
  });

  /* ------------------------------------------------------- tiny 3x5 font */
  const GLYPHS = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
    8: '111101111101111', 9: '111101111001110',
    '.': '000000000000010', ',': '000000000010100', ':': '000010000010000', '-': '000000111000000',
    '+': '000010111010000', '=': '000111000111000', '(': '010100100100010', ')': '010001001001010',
    '/': '001001010100100', '!': '010010010000010', '?': '110001010000010', '>': '100010001010100',
    '<': '001010100010001', '*': '000101010101000', "'": '010010000000000', '%': '101001010100101',
    '_': '000000000000111', '#': '101111101111101', '&': '010101010101011', '^': '010101000000000',
  };
  const font = (AW.font = {
    width(str) { return String(str).length * 4 - 1; },
    draw(ctx, str, x, y, color, scale) {
      const s = scale || 1;
      ctx.fillStyle = color || '#000';
      str = String(str).toUpperCase();
      let cx = Math.round(x);
      const cy = Math.round(y);
      for (const ch of str) {
        const g = GLYPHS[ch === '→' ? '>' : ch === '·' ? '.' : ch];
        if (g) {
          for (let i = 0; i < 15; i++) {
            if (g.charCodeAt(i) === 49) ctx.fillRect(cx + (i % 3) * s, cy + Math.floor(i / 3) * s, s, s);
          }
        }
        cx += 4 * s;
      }
    },
    drawCentered(ctx, str, cx, y, color, scale) {
      const s = scale || 1;
      this.draw(ctx, str, Math.round(cx - (this.width(str) * s) / 2), y, color, s);
    },
    /* text with a 1px halo for legibility over busy backgrounds */
    drawHalo(ctx, str, x, y, color, halo, centered) {
      const w = this.width(str);
      const x0 = centered ? Math.round(x - w / 2) : Math.round(x);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]])
        this.draw(ctx, str, x0 + dx, y + dy, halo);
      this.draw(ctx, str, x0, y, color);
    },
  });
})();
