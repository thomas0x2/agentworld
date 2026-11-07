/* Agentworld: Parallax — engine: entities, movement, camera, rendering, lens, effects. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const TL = AW.TL;
  const T = AW.T;
  const world = AW.world;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

  const G = (AW.game = {
    version: 'I',
    mode: 'title',
    time: 0,
    animFrame: 0,
    entities: [],
    swarm: [],
    player: null,
    mira: null,
    cam: { x: 0, y: 0, scale: 1, follow: true, anim: null },
    lens: false,
    busy: false,
    done: new Set(),
    replaying: false,
    nicheStage: 0,
    mapCanvas: [null, null],
    overview: null,
    fx: { droste: null, overview: null, floaters: [], ghosts: [], sparkles: [], flash: 0, pulses: [], tether: true },
    counts: { h: 0, a: 0, sub: 0 },
    speaking: null,
    commonsHinted: false,
    lastStation: null,
    DIRS, OPP,
  });

  let canvas, ctx;

  /* ============================================================ entities */
  class Ent {
    constructor(o) {
      this.x = 0; this.y = 0; this.dir = 'down';
      this.moving = false; this.fx = 0; this.fy = 0; this.mt = 0;
      this.speed = 4.5; this.animT = 0; this.kind = 'agent'; this.role = ''; this.spec = null;
      this.solid = false; this.alpha = 1; this.hidden = false; this.wander = false; this.idle = Math.random() * 2;
      this.name = ''; this.label = ''; this.labelT = 0; this.queue = null; this.onArrive = null;
      this.hover = 0; this.seed = Math.floor(Math.random() * 1e6); this.tag = null; this.sign = null; this.glow = null;
      Object.assign(this, o);
      this.px = this.x * T; this.py = this.y * T;
    }
    get cx() { return this.px + 8; }
    get cy() { return this.py + 8; }
  }
  G.Ent = Ent;
  function specFor(e, v) {
    if (e.makeSpec) return e.makeSpec(v);
    return e.role ? AW.V.spec(v, e.role, e.seed) : e.spec;
  }
  G.specFor = specFor;

  G.spawn = function (o) {
    const e = new Ent(o);
    if (!e.spec) e.spec = specFor(e, G.version);
    G.entities.push(e);
    return e;
  };
  G.remove = function (e) {
    const i = G.entities.indexOf(e);
    if (i >= 0) G.entities.splice(i, 1);
  };
  G.byRole = (role) => G.entities.find((e) => e.role === role);
  G.solidAt = function (x, y, except) {
    for (const e of G.entities) if (e !== except && e.solid && !e.hidden && e.x === x && e.y === y) return e;
    return null;
  };
  G.entAt = function (x, y, except) {
    let best = null;
    for (const e of G.entities) {
      if (e === except || e.hidden || e === G.mira) continue;
      if (e.x === x && e.y === y) { if (!best || e.solid || e.talk) best = e; }
    }
    return best;
  };

  function canEnter(e, nx, ny) {
    if (!world.in(nx, ny) || world.solid(nx, ny)) return false;
    if (e === G.player) return !G.solidAt(nx, ny, e);
    if (e.wander) {
      if (!world.roadlike(nx, ny)) return false;
      const p = G.player;
      if (p && ((p.x === nx && p.y === ny) || (p.moving && p.fx === nx && p.fy === ny))) return false;
      return !G.solidAt(nx, ny, e);
    }
    return true;
  }

  G.step = function (e, dir, force) {
    const [dx, dy] = DIRS[dir];
    e.dir = dir;
    const nx = e.x + dx, ny = e.y + dy;
    if (!force && !canEnter(e, nx, ny)) return false;
    e.fx = e.x; e.fy = e.y;
    e.x = nx; e.y = ny;
    e.moving = true; e.mt = 0;
    return true;
  };

  /* walk an entity along a path (array of [x,y]); returns a promise */
  G.walkPath = function (e, path, speed) {
    return new Promise((res) => {
      if (!path || !path.length) { res(); return; }
      e.queue = path.slice();
      if (speed) e.speed = speed;
      e.onDone = res;
    });
  };
  G.walkTo = function (e, tx, ty, speed, ignoreEntities) {
    const path = world.path(e.x, e.y, tx, ty, ignoreEntities ? null : (x, y) => !!G.solidAt(x, y, e));
    return G.walkPath(e, path || [], speed);
  };
  G.face = function (e, dir) { e.dir = dir; };
  G.faceToward = function (e, other) {
    const dx = other.x - e.x, dy = other.y - e.y;
    e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  };

  function updateEnt(e, dt) {
    if (e.moving) {
      e.mt += dt * e.speed;
      e.animT += dt * e.speed;
      if (e.mt >= 1) {
        e.mt = 1;
        e.moving = false;
        e.px = e.x * T; e.py = e.y * T;
        if (e === G.player) onPlayerArrive();
      } else {
        e.px = U.lerp(e.fx, e.x, e.mt) * T;
        e.py = U.lerp(e.fy, e.y, e.mt) * T;
      }
    }
    if (!e.moving && e.queue) {
      if (e.queue.length) {
        const [nx, ny] = e.queue.shift();
        const dx = nx - e.x, dy = ny - e.y;
        const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
        if (Math.abs(dx) + Math.abs(dy) !== 1) { e.x = nx; e.y = ny; e.px = nx * T; e.py = ny * T; }
        else {
          if (e === G.player) followMira(e.x, e.y);
          G.step(e, dir, true);
        }
      } else {
        e.queue = null;
        const cb = e.onDone; e.onDone = null;
        if (cb) cb();
      }
    }
    if (!e.moving && !e.queue) e.animT = 0;
    if (e.wander && !e.moving && !e.queue && !G.busyRoles.has(e)) wanderStep(e, dt);
    if (e.labelT > 0) e.labelT -= dt;
  }
  G.busyRoles = new Set();

  function wanderStep(e, dt) {
    e.idle -= dt;
    if (e.idle > 0) return;
    const opts = [];
    for (const d of ['up', 'down', 'left', 'right']) {
      const [dx, dy] = DIRS[d];
      if (canEnter(e, e.x + dx, e.y + dy)) opts.push(d);
    }
    if (!opts.length) { e.idle = 0.5 + Math.random(); return; }
    let d = e.dir;
    if (!opts.includes(d) || Math.random() < 0.18) d = opts[Math.floor(Math.random() * opts.length)];
    if (opts.length > 1 && d === OPP[e.dir] && Math.random() < 0.8) d = opts.find((o) => o !== OPP[e.dir]) || d;
    G.step(e, d);
    if (Math.random() < 0.08) e.idle = 0.6 + Math.random() * 2.2;
  }

  /* follower: Mira steps into the tile the player just left */
  function followMira(fromX, fromY) {
    const m = G.mira;
    if (!m || m.hidden || m.queue || m.pinned) return;
    if (Math.abs(m.x - fromX) + Math.abs(m.y - fromY) === 1) {
      const dir = fromX > m.x ? 'right' : fromX < m.x ? 'left' : fromY > m.y ? 'down' : 'up';
      m.speed = G.player.speed;
      G.step(m, dir, true);
    } else if (!(m.x === fromX && m.y === fromY)) {
      m.x = fromX; m.y = fromY; m.px = fromX * T; m.py = fromY * T; m.moving = false;
    }
  }
  G.placeMiraBehind = function () {
    const p = G.player, m = G.mira;
    if (!m) return;
    const [dx, dy] = DIRS[OPP[p.dir]];
    let tx = p.x + dx, ty = p.y + dy;
    if (world.solid(tx, ty)) {
      for (const d of ['down', 'left', 'right', 'up']) {
        const [ax, ay] = DIRS[d];
        if (!world.solid(p.x + ax, p.y + ay)) { tx = p.x + ax; ty = p.y + ay; break; }
      }
    }
    m.x = tx; m.y = ty; m.px = tx * T; m.py = ty * T; m.moving = false; m.queue = null;
    G.faceToward(m, p);
  };

  /* ============================================================ player */
  function updatePlayer(dt) {
    const p = G.player;
    if (!p || (G.busy && !G.freeWalk) || AW.input.hasModal()) return;
    if (!p.moving && !p.queue) {
      const dir = AW.input.heldDir();
      if (dir) {
        p.speed = AW.input.down.run ? 9 : 5.5;
        const fromX = p.x, fromY = p.y;
        if (G.step(p, dir)) {
          followMira(fromX, fromY);
          if (Math.random() < 0.5) AW.audio.step();
        } else {
          p.dir = dir;
          G._bumpT = (G._bumpT || 0) - dt;
          if (G._bumpT <= 0) { AW.audio.bump(); G._bumpT = 0.3; }
        }
      }
    }
    if (AW.input.take('act') && !G.freeWalk) interact();
  }

  function onPlayerArrive() {
    const p = G.player;
    if (G.freeWalk) G.stepCount = (G.stepCount || 0) + 1;
    if (G.busy || G.mode !== 'play') return;
    const st = world.stationAt(p.x, p.y);
    if (st !== G.lastStation) {
      G.lastStation = st;
      if (st && G.done.has(st.n)) AW.ui.toast(AW.V.replayHint(st.n, G.version), 2600);
    }
    if (st && !G.done.has(st.n)) {
      if (st.n === 10 && !G.allBeforeDone()) {
        if (!G.commonsHinted) { G.commonsHinted = true; AW.ui.toast(AW.V.commonsHint(G.version), 3800); }
        return;
      }
      AW.tour.run(st.n);
    }
  }
  G.allBeforeDone = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => G.done.has(n));
  G.nextObjective = function () {
    for (let n = 1; n <= 10; n++) if (!G.done.has(n)) return n;
    return null;
  };

  // what the player is facing: a character, a sign, a building or a prop
  function facing() {
    const p = G.player;
    const [dx, dy] = DIRS[p.dir];
    const tx = p.x + dx, ty = p.y + dy;
    const e = G.entAt(tx, ty, p);
    if (e) return { kind: 'ent', e };
    if (world.get(tx, ty) === TL.SIGN) return { kind: 'sign', id: world.signs[tx + ',' + ty] };
    const b = world.buildingAt(tx, ty);
    if (b) return { kind: 'building', b };
    const pr = world.propAt(tx, ty);
    if (pr) return { kind: 'prop', pr };
    return null;
  }

  function interact() {
    const p = G.player;
    const target = facing();
    // On a finished stop, Space always offers the replay. Whatever the player
    // faces (the board, a door, someone in the scene) becomes a second option
    // on the card instead of swallowing the press.
    const st = world.stationAt(p.x, p.y);
    if (st && G.done.has(st.n)) { AW.tour.offerReplay(st.n, target); return; }
    if (target) { AW.tour.inspect(target); return; }
    if (G.mira && !G.mira.hidden && Math.abs(G.mira.x - p.x) + Math.abs(G.mira.y - p.y) <= 1) AW.tour.talk(G.mira);
  }

  /* ============================================================ population */
  G.populate = function () {
    // keep scripted characters, rebuild ambient population
    G.entities = G.entities.filter((e) => !e.ambient);
    const v = G.version;
    const rnd = U.rng(1234 + v.length * 77);
    const roadTiles = [];
    for (let y = 2; y < world.H - 2; y++) for (let x = 2; x < world.W - 2; x++) if (world.roadlike(x, y)) roadTiles.push([x, y]);
    const taken = new Set(G.entities.map((e) => e.x + ',' + e.y));
    const nAgents = v === 'I' ? 64 : v === 'II' ? 46 : 70;
    const nHumans = v === 'I' ? 7 : 6;
    const place = (role, kind) => {
      for (let tries = 0; tries < 40; tries++) {
        const [x, y] = roadTiles[Math.floor(rnd() * roadTiles.length)];
        const k = x + ',' + y;
        if (taken.has(k)) continue;
        if (Math.abs(x - world.gate.x) < 4 && y > 33) continue;
        taken.add(k);
        const e = G.spawn({ x, y, role, kind, wander: true, ambient: true, seed: Math.floor(rnd() * 1e6), speed: 2.6 + rnd() * 1.6, dir: ['up', 'down', 'left', 'right'][Math.floor(rnd() * 4)] });
        return e;
      }
      return null;
    };
    for (let i = 0; i < nAgents; i++) place('wanderAgent', 'agent');
    for (let i = 0; i < nHumans; i++) place('wanderHuman', 'human');
    // Mira's forks persist once created
    if (G.done.has(3)) AW.tour.ensureForks();
    // swarms
    G.swarm = [];
    if (v === 'II') {
      for (let s = 0; s < 14; s++) {
        const [x, y] = roadTiles[Math.floor(rnd() * roadTiles.length)];
        const sw = { cx: x * T + 8, cy: y * T + 8, tx: x * T + 8, ty: y * T + 8, t: rnd() * 10, col: ['#6ff5d2', '#ff7ad9', '#ffd36e'][s % 3] };
        for (let i = 0; i < 11; i++) G.swarm.push({ sw, a: rnd() * 6.28, r: 3 + rnd() * 9, sp: 1.5 + rnd() * 2.5, ph: rnd() * 6.28, x: 0, y: 0 });
      }
    } else if (v === 'III') {
      for (let i = 0; i < 170; i++) {
        const [x, y] = roadTiles[Math.floor(rnd() * roadTiles.length)];
        G.swarm.push({ packet: true, x: x * T + 8, y: y * T + 8, gx: x, gy: y, dir: ['up', 'down', 'left', 'right'][Math.floor(rnd() * 4)], sp: 30 + rnd() * 50, prog: 0 });
      }
    }
  };

  function updateSwarm(dt) {
    for (const s of G.swarm) {
      if (s.packet) {
        s.prog += (s.sp * dt) / T;
        if (s.prog >= 1) {
          s.prog = 0;
          const [dx, dy] = DIRS[s.dir];
          s.gx += dx; s.gy += dy;
          const opts = Object.keys(DIRS).filter((d) => { const [ax, ay] = DIRS[d]; return world.roadlike(s.gx + ax, s.gy + ay); });
          if (!opts.length) { s.dir = OPP[s.dir]; continue; }
          if (!opts.includes(s.dir) || Math.random() < 0.15) {
            const fw = opts.filter((d) => d !== OPP[s.dir]);
            s.dir = (fw.length ? fw : opts)[Math.floor(Math.random() * (fw.length ? fw.length : opts.length))];
          }
        }
        const [dx, dy] = DIRS[s.dir];
        s.x = (s.gx + dx * s.prog) * T + 8;
        s.y = (s.gy + dy * s.prog) * T + 8;
      } else {
        const sw = s.sw;
        if (!sw._upd || sw._upd !== G.frameNo) {
          sw._upd = G.frameNo;
          sw.t += dt;
          if (Math.hypot(sw.tx - sw.cx, sw.ty - sw.cy) < 4 || Math.random() < 0.002) {
            sw.tx = U.clamp(sw.cx + (Math.random() - 0.5) * 160, 40, world.W * T - 40);
            sw.ty = U.clamp(sw.cy + (Math.random() - 0.5) * 120, 40, world.H * T - 40);
          }
          sw.cx += U.clamp(sw.tx - sw.cx, -1, 1) * 14 * dt;
          sw.cy += U.clamp(sw.ty - sw.cy, -1, 1) * 14 * dt;
        }
        s.a += s.sp * dt;
        s.x = sw.cx + Math.cos(s.a + s.ph) * s.r;
        s.y = sw.cy + Math.sin(s.a * 1.3 + s.ph) * s.r * 0.6 - 6;
      }
    }
  }

  /* ============================================================ map canvas */
  G.buildMap = function () {
    const v = G.version;
    for (let f = 0; f < 2; f++) {
      const c = G.mapCanvas[f] || AW.art.cv(world.W * T, world.H * T);
      const x = c.getContext('2d');
      x.clearRect(0, 0, c.width, c.height);
      for (let gy = 0; gy < world.H; gy++) for (let gx = 0; gx < world.W; gx++) AW.art.paintTile(x, v, world.get(gx, gy), gx, gy, f);
      for (const b of world.buildings) AW.art.paintBuilding(x, v, b, f);
      for (const p of world.props) AW.art.paintProp(x, v, p, f);
      AW.niche.paint(x, v, G.nicheStage, f);
      G.mapCanvas[f] = c;
    }
    const o = G.overview || AW.art.cv(world.W * 4, world.H * 4);
    const ox = o.getContext('2d');
    ox.imageSmoothingEnabled = true;
    ox.clearRect(0, 0, o.width, o.height);
    ox.drawImage(G.mapCanvas[0], 0, 0, o.width, o.height);
    G.overview = o;
  };

  G.setNicheStage = function (s) {
    G.nicheStage = s;
    G.buildMap();
    AW.niche.populate(s);
  };

  /* ============================================================ version */
  G.setVersion = function (v, opts) {
    opts = opts || {};
    if (!AW.VERSIONS[v]) return;
    if (G.busy && !opts.force) { AW.ui.toast(AW.V.busyMsg(), 1800); return; }
    const changed = v !== G.version;
    G.version = v;
    AW.art.clearCache();
    G.nicheStage = G.done.has(4) ? 2 : AW.V.initialNiche(v);
    G.buildMap();
    for (const e of G.entities) e.spec = specFor(e, v);
    G.populate();
    AW.niche.populate(G.nicheStage);
    AW.ui.setVersion(v);
    AW.audio.setAmbient(v);
    if (changed && !opts.silent) {
      G.fx.flash = 1;
      AW.audio.whoosh();
      AW.ui.toast(AW.V.switchQuip(v), 3200);
    }
    G.save();
  };

  /* ============================================================ camera */
  G.camTo = function (x, y, ms, scale) {
    return new Promise((res) => {
      G.cam.follow = false;
      G.cam.anim = { x0: G.cam.x, y0: G.cam.y, s0: G.cam.scale, x1: x, y1: y, s1: scale || G.cam.scale, t: 0, dur: (ms || 600) / 1000, res };
    });
  };
  G.camFollow = function (ms) {
    const p = G.player;
    return G.camTo(p.px + 8, p.py + 8, ms || 400, 1).then(() => { G.cam.follow = true; });
  };
  function updateCam(dt) {
    const c = G.cam;
    if (c.anim) {
      const a = c.anim;
      a.t += dt;
      const k = U.ease(U.clamp(a.t / a.dur, 0, 1));
      c.x = U.lerp(a.x0, a.x1, k); c.y = U.lerp(a.y0, a.y1, k); c.scale = U.lerp(a.s0, a.s1, k);
      if (a.t >= a.dur) { c.anim = null; a.res(); }
    } else if (c.follow && G.player) {
      c.x = G.player.px + 8; c.y = G.player.py + 8;
    }
    if (c.scale >= 0.999) {
      const hw = AW.VW / 2, hh = AW.VH / 2;
      c.x = U.clamp(c.x, hw, world.W * T - hw);
      c.y = U.clamp(c.y, hh, world.H * T - hh);
    }
  }

  /* ============================================================ effects */
  G.floater = function (x, y, text, dur, color) {
    G.fx.floaters.push({ x, y, text, t: 0, dur: dur || 2.5, color: color || null });
  };
  G.sparkle = function (x, y, n, color) {
    for (let i = 0; i < (n || 10); i++) {
      const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 40;
      G.fx.sparkles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, t: 0, dur: 0.6 + Math.random() * 0.5, color: color || '#ffffff' });
    }
  };
  function updateFx(dt) {
    const fx = G.fx;
    fx.floaters = fx.floaters.filter((f) => (f.t += dt) < f.dur);
    fx.sparkles = fx.sparkles.filter((s) => { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt; return s.t < s.dur; });
    fx.pulses = fx.pulses.filter((p) => (p.t += dt) < p.dur);
    if (fx.flash > 0) fx.flash = Math.max(0, fx.flash - dt * 2.2);
    for (const g of fx.ghosts) g.t += dt;
  }

  /* ============================================================ main loop */
  let last = 0;
  G.frameNo = 0;
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    G.time += dt;
    G.frameNo++;
    if (G.mode === 'play') {
      G.animFrame = Math.floor(G.time * 1.6) % 2;
      updatePlayer(dt);
      for (const e of G.entities) updateEnt(e, dt);
      updateSwarm(dt);
      updateFx(dt);
      updateCam(dt);
      handleGlobalKeys();
      render();
      if (G.frameNo % 10 === 0) AW.ui.updateHud();
    } else {
      renderTitleBackdrop(dt);
    }
    requestAnimationFrame(loop);
  }

  function handleGlobalKeys() {
    const I = AW.input;
    if (I.take('lens')) G.toggleLens();
    if (I.take('notebook')) AW.ui.notebook();
    if (I.take('help')) AW.ui.help();
    if (I.take('mute')) AW.ui.toggleMute();
    if (I.take('version')) G.setVersion(AW.V.next(G.version));
    if (I.take('v1')) G.setVersion('I');
    if (I.take('v2')) G.setVersion('II');
    if (I.take('v3')) G.setVersion('III');
    if (I.take('back')) { /* nothing in free roam */ }
  }
  G.toggleLens = function (force) {
    G.lens = force === undefined ? !G.lens : force;
    AW.ui.setLens(G.lens);
    if (G.lens) AW.audio.select();
  };

  /* ============================================================ rendering */
  function render() {
    const v = G.version;
    const pal = AW.art.PAL[v];
    const c = G.cam;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = v === 'I' ? '#2c7a40' : v === 'II' ? '#0f2722' : '#f4f3ee';
    ctx.fillRect(0, 0, AW.VW, AW.VH);
    const s = c.scale;
    const ox = s >= 0.999 ? Math.round(AW.VW / 2 - c.x * s) : AW.VW / 2 - c.x * s;
    const oy = s >= 0.999 ? Math.round(AW.VH / 2 - c.y * s) : AW.VH / 2 - c.y * s;
    ctx.setTransform(s, 0, 0, s, ox, oy);
    ctx.drawImage(G.mapCanvas[G.animFrame], 0, 0);

    const view = { x0: (-ox) / s - 32, y0: (-oy) / s - 32, x1: (-ox + AW.VW) / s + 32, y1: (-oy + AW.VH) / s + 32 };
    const vis = (x, y) => x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1;

    drawSimTable(pal);
    if (!G.busy && G.mode === 'play' && !G.fx.overview) drawMarkers();
    drawGhosts();

    // tether (Lattice): your H and your A
    if (v === 'III' && G.mira && !G.mira.hidden && G.fx.tether) {
      ctx.strokeStyle = U.rgba(pal.blue, 0.6); ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(G.player.px + 8, G.player.py + 4); ctx.lineTo(G.mira.px + 8, G.mira.py + 6); ctx.stroke();
      ctx.setLineDash([]);
    }

    // entities, y-sorted
    const ents = G.entities.filter((e) => !e.hidden && vis(e.px, e.py)).sort((a, b) => a.py - b.py || a.px - b.px);
    let h = 0, a = 0;
    for (const e of ents) {
      if (e.kind === 'human') h++; else if (e.kind === 'agent') a++;
    }
    for (const e of ents) drawEnt(e, pal);
    // swarm
    let swarmVis = 0;
    for (const p of G.swarm) {
      if (!vis(p.x, p.y)) continue;
      swarmVis++;
      if (p.packet) {
        ctx.fillStyle = pal.blue; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
        ctx.fillStyle = U.rgba(pal.blue, 0.25);
        const [dx, dy] = DIRS[p.dir];
        ctx.fillRect(Math.round(p.x - dx * 4) - 1, Math.round(p.y - dy * 4) - 1, 2, 2);
      } else {
        ctx.fillStyle = U.rgba(p.sw.col, 0.25); ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3);
        ctx.fillStyle = p.sw.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
    }
    a += swarmVis;
    G.counts.h = h; G.counts.a = a;
    G.counts.sub = G.lens && v === 'I' ? a * 6 : 0;

    if (G.lens && !G.fx.overview) drawLens(ents, pal);
    drawLabels(ents, pal);
    drawFx(pal);
    if (G.fx.overview) drawOverviewGraph(pal);

    // screen space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (v === 'II' && !G.lens) {
      // dusk vignette
      const g = ctx.createRadialGradient(AW.VW / 2, AW.VH / 2, 80, AW.VW / 2, AW.VH / 2, 260);
      g.addColorStop(0, 'rgba(5,15,25,0)'); g.addColorStop(1, 'rgba(5,15,25,0.45)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, AW.VW, AW.VH);
    }
    if (!G.busy && G.mode === 'play' && !G.fx.overview) drawObjectiveArrow(pal);
    if (G.fx.droste) drawDroste(pal);
    if (G.fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${G.fx.flash * 0.8})`; ctx.fillRect(0, 0, AW.VW, AW.VH); }
  }
  G.render = render;

  function drawShadow(x, y, w) {
    ctx.fillStyle = G.version === 'III' ? 'rgba(42,42,224,0.12)' : 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 15, w || 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnt(e, pal) {
    if (!e.spec) return;
    const moving = e.moving || e.queue;
    const frame = moving ? (Math.floor(e.animT * 2) % 2 === 0 ? 1 : 2) : 0;
    let x = Math.round(e.px), y = Math.round(e.py);
    let hover = 0;
    if (e.spec.type === 'drone') hover = Math.round(Math.sin(G.time * 4 + e.seed) * 1.5) - 3;
    const sc = e.scale || 1;
    drawShadow(x, y, (e.spec.type === 'crawler' || e.spec.type === 'roller' ? 6 : 4.5) * sc);
    const spr = AW.art.sprite(e.spec, e.dir, e.spec.type === 'drone' ? Math.floor(G.time * 12 + e.seed) % 2 : frame);
    const alpha = e.alpha * (e.spec.alpha || 1);
    if (alpha < 1) ctx.globalAlpha = alpha;
    const dw = Math.round(spr.width * sc), dh = Math.round(spr.height * sc);
    const bx = x + Math.round((16 - dw) / 2), by = y - 4 + hover + (spr.height - dh);
    if (e.spec.glow) {
      ctx.globalAlpha = 0.35 * alpha;
      ctx.drawImage(spr, bx - 1, by, dw, dh); ctx.drawImage(spr, bx + 1, by, dw, dh);
      ctx.drawImage(spr, bx, by - 1, dw, dh); ctx.drawImage(spr, bx, by + 1, dw, dh);
      ctx.globalAlpha = alpha;
    }
    ctx.drawImage(spr, bx, by, dw, dh);
    ctx.globalAlpha = 1;
    if (e.sign) drawCarriedSign(e, x, y, pal);
    if (G.speaking === e) {
      const bob = Math.round(Math.sin(G.time * 6));
      const bx = x + 10, by = y - 12 + bob;
      ctx.fillStyle = G.version === 'III' ? pal.blue : '#ffffff';
      ctx.fillRect(bx, by, 9, 6); ctx.fillRect(bx + 1, by + 6, 2, 1);
      ctx.fillStyle = G.version === 'III' ? '#ffffff' : '#333';
      ctx.fillRect(bx + 2, by + 3, 1, 1); ctx.fillRect(bx + 4, by + 3, 1, 1); ctx.fillRect(bx + 6, by + 3, 1, 1);
    }
  }

  function drawCarriedSign(e, x, y, pal) {
    const txt = e.sign;
    const w = AW.font.width(txt) + 6;
    const sx = Math.round(x + 8 - w / 2), sy = y - 22 - (e.signLift || 0);
    ctx.fillStyle = G.version === 'II' ? '#3a2c26' : G.version === 'III' ? pal.ink : '#7a5232';
    ctx.fillRect(x + 7, sy + 8, 2, 12 + (e.signLift || 0));
    ctx.fillStyle = G.version === 'III' ? '#ffffff' : '#fff7e0';
    ctx.fillRect(sx, sy, w, 9);
    ctx.fillStyle = G.version === 'III' ? pal.ink : '#3b2a20';
    ctx.fillRect(sx, sy, w, 1); ctx.fillRect(sx, sy + 8, w, 1); ctx.fillRect(sx, sy, 1, 9); ctx.fillRect(sx + w - 1, sy, 1, 9);
    AW.font.draw(ctx, txt, sx + 3, sy + 2, G.version === 'III' ? pal.ink : '#c8463d');
  }

  function drawLabels(ents, pal) {
    for (const e of ents) {
      const show = e.labelT > 0 || (e.label && e.labelAlways) || (G.lens && e.label && e.kind !== 'none');
      if (!show || !e.label) continue;
      const col = G.version === 'III' ? pal.blue : G.version === 'II' ? '#e8fff8' : '#ffffff';
      const halo = G.version === 'III' ? '#ffffff' : G.version === 'II' ? '#0b1a1a' : '#2b1d14';
      AW.font.drawHalo(ctx, e.label, Math.round(e.px + 8), Math.round(e.py) - 12 - (e.sign ? 14 : 0), col, halo, true);
    }
  }

  function drawMarkers() {
    const v = G.version;
    const next = G.nextObjective();
    for (const st of world.stations) {
      const done = G.done.has(st.n);
      if (st.n === 10 && !G.allBeforeDone() && !done) continue;
      const x = st.focus[0] * T + 8, y = st.focus[1] * T - 2 + Math.sin(G.time * 3 + st.n) * 2;
      const isNext = st.n === next;
      const col = v === 'III' ? '#2a2ae0' : v === 'II' ? '#6ff5d2' : '#ffd23f';
      if (done) {
        ctx.fillStyle = v === 'III' ? '#2a2ae0' : 'rgba(255,255,255,0.75)';
        ctx.fillRect(x - 2, y + 1, 1, 1); ctx.fillRect(x - 1, y + 2, 1, 1); ctx.fillRect(x, y + 1, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x + 2, y - 1, 1, 1);
        continue;
      }
      const r = isNext ? 7 : 5;
      if (isNext) {
        ctx.fillStyle = U.rgba(col, 0.25 + 0.15 * Math.sin(G.time * 5));
        ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = v === 'III' ? '#ffffff' : '#1d1d2b';
      ctx.beginPath(); ctx.moveTo(x, y - r - 1); ctx.lineTo(x + r + 1, y); ctx.lineTo(x, y + r + 1); ctx.lineTo(x - r - 1, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
      const label = String(st.n);
      AW.font.drawCentered(ctx, label, x + (label.length > 1 ? 0 : 0.5), y - 2, v === 'III' ? '#ffffff' : '#1d1d2b');
    }
  }

  function drawObjectiveArrow(pal) {
    const n = G.nextObjective();
    if (!n) return;
    const st = world.station(n);
    if (n === 10 && !G.allBeforeDone()) return;
    const c = G.cam;
    const sx = st.focus[0] * T + 8 - c.x + AW.VW / 2, sy = st.focus[1] * T + 8 - c.y + AW.VH / 2;
    if (sx > 8 && sx < AW.VW - 8 && sy > 20 && sy < AW.VH - 8) return;
    const cx = AW.VW / 2, cy = AW.VH / 2;
    const ang = Math.atan2(sy - cy, sx - cx);
    const mx = AW.VW / 2 - 16, my = AW.VH / 2 - 22;
    const k = Math.min(Math.abs(mx / Math.cos(ang)), Math.abs(my / Math.sin(ang)));
    const ax = cx + Math.cos(ang) * k, ay = cy + Math.sin(ang) * k + 6;
    const col = G.version === 'III' ? pal.blue : G.version === 'II' ? '#6ff5d2' : '#ffd23f';
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    const pulse = 1 + Math.sin(G.time * 6) * 0.12;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = G.version === 'III' ? '#ffffff' : '#1d1d2b';
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -7); ctx.lineTo(-3, 0); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -5); ctx.lineTo(-2, 0); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    AW.font.drawHalo(ctx, 'CH.' + n, Math.round(ax - Math.cos(ang) * 16), Math.round(ay - Math.sin(ang) * 14 - 2), col, G.version === 'III' ? '#ffffff' : '#1d1d2b', true);
  }

  /* ---- live model of the town on the sim table (descriptive simulation) ---- */
  function drawSimTable(pal) {
    const pr = world.props.find((p) => p.kind === 'simtable');
    if (!pr || !G.overview) return;
    const tx = pr.x * T + 4, ty = pr.y * T + 3, tw = pr.w * T - 8, th = pr.h * T - 6;
    drawNestedModel(tx, ty, tw, th, 2, pal);
  }
  function drawNestedModel(tx, ty, tw, th, depth, pal) {
    const O = G.overview;
    const k = Math.min(tw / (world.W * T), th / (world.H * T));
    const w = world.W * T * k, h = world.H * T * k;
    const x0 = tx + (tw - w) / 2, y0 = ty + (th - h) / 2;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(O, x0, y0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = G.version === 'III' ? pal.blue : '#ff4d6d';
    const p = G.player;
    ctx.fillRect(x0 + (p.px + 8) * k - 1, y0 + (p.py + 8) * k - 1, 2, 2);
    if (G.mira && !G.mira.hidden) { ctx.fillStyle = '#b18cff'; ctx.fillRect(x0 + (G.mira.px + 8) * k, y0 + (G.mira.py + 8) * k, 1, 1); }
    for (const gh of G.fx.ghosts) {
      if (!gh.onTable) continue;
      ctx.fillStyle = U.rgba(gh.color || '#ffffff', 0.8);
      const n = Math.min(gh.path.length, Math.floor(gh.t * 12));
      for (let i = 0; i < n; i++) ctx.fillRect(x0 + (gh.path[i][0] * T + 8) * k, y0 + (gh.path[i][1] * T + 8) * k, 1, 1);
    }
    if (depth > 1) {
      const pr = world.props.find((q) => q.kind === 'simtable');
      drawNestedModel(x0 + (pr.x * T + 4) * k, y0 + (pr.y * T + 3) * k, (pr.w * T - 8) * k, (pr.h * T - 6) * k, depth - 1, pal);
    }
    ctx.restore();
  }

  function drawGhosts() {
    for (const gh of G.fx.ghosts) {
      if (gh.onTable === 'only') continue;
      const n = Math.min(gh.path.length, Math.floor(gh.t * 10));
      for (let i = 0; i < n; i++) {
        const [x, y] = gh.path[i];
        const a = (gh.alpha || 0.5) * (1 - i / (gh.path.length + 4));
        ctx.fillStyle = U.rgba(gh.color || '#ffffff', a);
        const off = i % 2 ? 3 : -3;
        ctx.fillRect(x * T + 7 + off, y * T + 9, 2, 3);
      }
      if (gh.sprite && n > 0) {
        const [x, y] = gh.path[Math.min(n, gh.path.length) - 1];
        ctx.globalAlpha = 0.35;
        ctx.drawImage(AW.art.sprite(G.player.spec, 'down', 0), x * T, y * T - 4);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ---- lens views: as agents are, not as they appear (6.1) ---- */
  const LAYERS = ['#ff6fa3', '#ffd23f', '#5fd38d', '#ff9a3c', '#5aa9ff'];
  function drawLens(ents, pal) {
    const v = G.version;
    const t = G.time;
    if (v === 'I') {
      for (const e of ents) {
        if (e.kind === 'human') {
          AW.font.drawHalo(ctx, 'H', Math.round(e.px + 8), Math.round(e.py) - 11, '#ffd9a0', '#2b1d14', true);
          continue;
        }
        if (e.kind !== 'agent') continue;
        const x = Math.round(e.px), y = Math.round(e.py);
        // lamination: five strata over the body
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = U.rgba(LAYERS[i], 0.85);
          ctx.fillRect(x + 3, y - 2 + i * 3, 10, 2);
        }
        // the maelstrom of subagents backstage (6B)
        for (let i = 0; i < 6; i++) {
          const a = t * (2 + (i % 3)) + i * 1.05 + e.seed;
          const r = 9 + (i % 2) * 3;
          ctx.fillStyle = U.rgba('#9fe8ff', 0.9);
          ctx.fillRect(Math.round(x + 8 + Math.cos(a) * r), Math.round(y + 2 + Math.sin(a) * r * 0.6), 1, 1);
        }
      }
    } else if (v === 'II') {
      ctx.fillStyle = 'rgba(2,10,22,0.62)';
      ctx.fillRect(G.cam.x - 400, G.cam.y - 300, 800, 600);
      for (const e of ents) {
        const x = e.px + 8, y = e.py + 6;
        if (e.kind === 'human') {
          const g = ctx.createRadialGradient(x, y, 1, x, y, 12);
          g.addColorStop(0, 'rgba(255,170,60,0.95)'); g.addColorStop(1, 'rgba(255,60,30,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        const type = e.spec && e.spec.type;
        if (type === 'crawler') { // lidar sweep
          const a0 = t * 3 + e.seed;
          for (let r = 6; r < 30; r += 4) for (let k = 0; k < 6; k++) {
            const a = a0 + k * 0.09;
            ctx.fillStyle = U.rgba('#6ff5d2', 0.9 - r / 34);
            ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
          }
        } else if (type === 'drone') { // sonar rings
          for (let k = 0; k < 2; k++) {
            const r = ((t * 18 + k * 12 + e.seed) % 24) + 2;
            ctx.strokeStyle = U.rgba('#ff7ad9', 1 - r / 26);
            ctx.beginPath(); ctx.arc(x, y - 4, r, 0, Math.PI * 2); ctx.stroke();
          }
        } else if (type === 'walker' || type === 'human') { // vision cone
          const [dx, dy] = DIRS[e.dir];
          const ang = Math.atan2(dy, dx);
          const g = ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 34);
          g.addColorStop(0, 'rgba(255,211,110,0.5)'); g.addColorStop(1, 'rgba(255,211,110,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.arc(x, y - 4, 34, ang - 0.5, ang + 0.5); ctx.closePath(); ctx.fill();
        } else { // RF / magnetic field
          for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = U.rgba('#8fb8ff', 0.6 - k * 0.15);
            ctx.beginPath(); ctx.ellipse(x, y, 6 + k * 4, 3 + k * 2, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
        ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y - 2), 1, 1);
      }
      for (const p of G.swarm) {
        ctx.fillStyle = U.rgba(p.sw ? p.sw.col : '#fff', 0.5);
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3);
      }
    } else {
      // Lattice: the hybrid social graph — every edge
      const nodes = ents.filter((e) => e.kind === 'human' || e.kind === 'agent');
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const near = nodes.map((b) => [b, Math.hypot(b.px - a.px, b.py - a.py)]).filter(([b, d]) => b !== a && d < 80).sort((p, q) => p[1] - q[1]).slice(0, 3);
        for (const [b] of near) {
          if (b.seed < a.seed && near.length > 1) continue;
          const hh = a.kind === 'human' && b.kind === 'human';
          const ha = a.kind !== b.kind;
          ctx.strokeStyle = hh ? U.rgba(pal.ink, 0.8) : ha ? U.rgba(pal.red, 0.55) : U.rgba(pal.blue, 0.45);
          ctx.setLineDash(ha ? [3, 2] : []);
          ctx.beginPath(); ctx.moveTo(a.px + 8, a.py + 6); ctx.lineTo(b.px + 8, b.py + 6); ctx.stroke();
          const k = (t * 0.8 + a.seed * 0.001) % 1;
          ctx.fillStyle = pal.blue;
          ctx.fillRect(Math.round(U.lerp(a.px, b.px, k) + 8), Math.round(U.lerp(a.py, b.py, k) + 6), 2, 2);
        }
        // agent → institution
        if (a.kind === 'agent') {
          let best = null, bd = 1e9;
          for (const bd2 of world.buildings) {
            const d = Math.hypot(bd2.x * T + bd2.w * 8 - a.px, bd2.y * T + bd2.h * 8 - a.py);
            if (d < bd) { bd = d; best = bd2; }
          }
          if (best && bd < 120) {
            ctx.strokeStyle = U.rgba(pal.blue, 0.18); ctx.setLineDash([1, 3]);
            ctx.beginPath(); ctx.moveTo(a.px + 8, a.py + 6); ctx.lineTo(best.x * T + best.w * 8, best.y * T + best.h * 8); ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
    }
  }

  function drawFx(pal) {
    for (const s of G.fx.sparkles) {
      ctx.fillStyle = U.rgba(s.color, 1 - s.t / s.dur);
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    for (const p of G.fx.pulses) {
      const r = p.r0 + (p.r1 - p.r0) * (p.t / p.dur);
      ctx.strokeStyle = U.rgba(p.color, 1 - p.t / p.dur);
      ctx.lineWidth = p.w || 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (const f of G.fx.floaters) {
      const k = f.t / f.dur;
      const y = Math.round(f.y - 10 - k * 10);
      const col = f.color || (G.version === 'III' ? pal.blue : '#ffffff');
      const halo = G.version === 'III' ? '#ffffff' : '#1d1d2b';
      ctx.globalAlpha = k > 0.8 ? (1 - k) * 5 : 1;
      AW.font.drawHalo(ctx, f.text, Math.round(f.x), y, col, halo, true);
      ctx.globalAlpha = 1;
    }
  }

  /* ---- finale: the town as a hybrid social graph (10.4) ---- */
  function drawOverviewGraph(pal) {
    const ov = G.fx.overview;
    const k = U.clamp(ov.t, 0, 1);
    const v = G.version;
    const nodes = G.entities.filter((e) => !e.hidden && (e.kind === 'human' || e.kind === 'agent'));
    ctx.fillStyle = v === 'III' ? `rgba(244,243,238,${0.55 * k})` : `rgba(5,8,25,${0.62 * k})`;
    ctx.fillRect(-200, -200, world.W * T + 400, world.H * T + 400);
    const wellX = 30 * T, wellY = 21 * T;
    const edgeCol = v === 'III' ? pal.blue : v === 'II' ? '#6ff5d2' : '#9fd3ff';
    const lit = (x, y) => {
      let m = 0;
      for (const p of G.fx.pulses) {
        if (!p.graph) continue;
        const r = p.r0 + (p.r1 - p.r0) * (p.t / p.dur);
        const d = Math.hypot(x - p.x, y - p.y);
        m = Math.max(m, Math.max(0, 1 - Math.abs(d - r) / 40));
      }
      return m;
    };
    ctx.lineWidth = 1.5;
    // institution hubs
    for (const b of world.buildings) {
      const bx = b.x * T + b.w * 8, by = b.y * T + b.h * 8;
      ctx.strokeStyle = U.rgba(edgeCol, 0.25 * k);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(wellX, wellY); ctx.stroke();
    }
    for (const a of nodes) {
      const near = [];
      for (const b of nodes) {
        if (b === a) continue;
        const d = Math.hypot(b.px - a.px, b.py - a.py);
        if (d < 110) near.push([b, d]);
      }
      near.sort((p, q) => p[1] - q[1]);
      for (const [b] of near.slice(0, 3)) {
        const L = lit((a.px + b.px) / 2, (a.py + b.py) / 2);
        const hh = a.kind === 'human' && b.kind === 'human';
        ctx.strokeStyle = U.rgba(hh ? '#ffb86b' : a.kind !== b.kind ? '#ff7ad9' : edgeCol, (0.25 + 0.75 * L) * k);
        ctx.beginPath(); ctx.moveTo(a.px + 8, a.py + 8); ctx.lineTo(b.px + 8, b.py + 8); ctx.stroke();
      }
      let best = null, bd = 1e9;
      for (const b of world.buildings) {
        const d = Math.hypot(b.x * T + b.w * 8 - a.px, b.y * T + b.h * 8 - a.py);
        if (d < bd) { bd = d; best = b; }
      }
      if (best) {
        ctx.strokeStyle = U.rgba(edgeCol, (0.12 + 0.4 * lit(a.px, a.py)) * k);
        ctx.beginPath(); ctx.moveTo(a.px + 8, a.py + 8); ctx.lineTo(best.x * T + best.w * 8, best.y * T + best.h * 8); ctx.stroke();
      }
    }
    for (const p of G.swarm) {
      ctx.fillStyle = U.rgba(edgeCol, 0.6 * k);
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    for (const b of world.buildings) {
      const bx = b.x * T + b.w * 8, by = b.y * T + b.h * 8;
      ctx.fillStyle = U.rgba(v === 'III' ? pal.ink : '#ffffff', 0.9 * k);
      ctx.fillRect(bx - 5, by - 5, 10, 10);
      ctx.fillStyle = U.rgba(edgeCol, k);
      ctx.fillRect(bx - 3, by - 3, 6, 6);
    }
    for (const a of nodes) {
      const L = lit(a.px, a.py);
      const r = a.kind === 'human' ? 6 : 4;
      ctx.fillStyle = a.kind === 'human' ? U.rgba('#ffb86b', k) : U.rgba(edgeCol, (0.6 + 0.4 * L) * k);
      ctx.beginPath(); ctx.arc(a.px + 8, a.py + 8, r + L * 3, 0, Math.PI * 2); ctx.fill();
      if (a.kind === 'human') {
        ctx.fillStyle = U.rgba('#1d1d2b', k);
        AW.font.drawCentered(ctx, 'H', a.px + 8.5, a.py + 6, U.rgba('#1d1d2b', k));
      }
    }
    // the commons
    ctx.fillStyle = U.rgba('#ffffff', k);
    ctx.beginPath(); ctx.arc(wellX, wellY, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = U.rgba(edgeCol, k);
    ctx.beginPath(); ctx.arc(wellX, wellY, 10, 0, Math.PI * 2); ctx.fill();
    // energy: the power plant pulses, the ceiling
    const plant = world.buildings.find((b) => b.kind === 'plant');
    if (plant && ov.energy) {
      const px = plant.x * T + plant.w * 8, py = plant.y * T + plant.h * 8;
      const r = 20 + Math.sin(G.time * 5) * 6;
      ctx.strokeStyle = U.rgba('#ffd23f', 0.9 * k); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  /* ---- Matryoshka realities: the sim within the sim (5.4) ---- */
  function drawDroste(pal) {
    const d = G.fx.droste;
    const O = G.overview;
    if (!O) return;
    const OW = world.W * T, OH = world.H * T;
    const pr = world.props.find((p) => p.kind === 'simtable');
    const tx = pr.x * T + 4, ty = pr.y * T + 3, tw = pr.w * T - 8, th = pr.h * T - 6;
    const k = Math.min(tw / OW, th / OH);
    const inX = tx + (tw - OW * k) / 2, inY = ty + (th - OH * k) / 2; // inner origin
    const qx = inX / (1 - k), qy = inY / (1 - k); // fixed point of the self-similarity
    const fit = Math.min(AW.VW / OW, AW.VH / OH);
    const z = Math.pow(1 / k, U.clamp(d.t, 0, 1.999));
    // start framed on the whole town, then drift the vanishing point to the middle of the screen
    const m = U.ease(U.clamp(d.t / 0.8, 0, 1));
    const Cx = U.lerp(AW.VW / 2 - (OW / 2 - qx) * fit, AW.VW / 2, m), Cy = U.lerp(AW.VH / 2 - (OH / 2 - qy) * fit, AW.VH / 2 + 18, m);
    const toScreen = (x, y) => [(x - qx) * fit * z + Cx, (y - qy) * fit * z + Cy];
    ctx.fillStyle = G.version === 'III' ? '#f4f3ee' : '#05070f';
    ctx.globalAlpha = d.alpha === undefined ? 1 : d.alpha;
    ctx.fillRect(0, 0, AW.VW, AW.VH);
    ctx.imageSmoothingEnabled = true;
    let ox = 0, oy = 0, sc = 1; // level transform in level-0 coords: p0 = o + p*sc
    const labels = ['REAL', 'SIM', 'REAL 2', 'SIM 2', 'REAL 3', 'SIM 3'];
    for (let lvl = 0; lvl < 6; lvl++) {
      const [sx, sy] = toScreen(ox, oy);
      const s = fit * z * sc;
      if (OW * s < 2) break;
      if (OW * s < AW.VW * 40) {
        // close up, draw the full-resolution town so the outer level stays crisp
        if (OW * s > O.width * 1.5) { ctx.imageSmoothingEnabled = false; ctx.drawImage(G.mapCanvas[G.animFrame], sx, sy, OW * s, OH * s); ctx.imageSmoothingEnabled = true; }
        else ctx.drawImage(O, sx, sy, OW * s, OH * s);
        ctx.strokeStyle = G.version === 'III' ? pal.blue : '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, OW * s - 1, OH * s - 1);
        // dim each enclosing level so the eye goes to the model inside it
        if (OW * s > AW.VW * 1.2) { ctx.fillStyle = G.version === 'III' ? 'rgba(244,243,238,0.55)' : 'rgba(5,7,15,0.55)'; ctx.fillRect(0, 0, AW.VW, AW.VH); }
        if (OW * s > 60 && OW * s < AW.VW * 3) {
          AW.font.drawHalo(ctx, labels[lvl], Math.max(4, sx + 4), Math.max(4, sy + 4), G.version === 'III' ? pal.blue : '#ffffff', G.version === 'III' ? '#ffffff' : '#000000');
        }
        const p = G.player;
        ctx.fillStyle = '#ff4d6d';
        const pxs = sx + (p.px + 8) * s, pys = sy + (p.py + 8) * s;
        const ps = Math.max(1, Math.min(4, s * 16 * 0.4));
        ctx.fillRect(pxs - ps / 2, pys - ps / 2, ps, ps);
      }
      ox = ox + inX * sc; oy = oy + inY * sc; sc *= k;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
  }

  /* ============================================================ title backdrop */
  let tctx;
  function renderTitleBackdrop(dt) {
    if (!G.mapCanvas[0]) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const t = G.time * 8;
    const W2 = world.W * T, H2 = world.H * T;
    const x = (t % (W2 - AW.VW));
    ctx.drawImage(G.mapCanvas[Math.floor(G.time * 1.6) % 2], -x, -260);
  }

  /* ============================================================ save */
  G.save = function () {
    try { localStorage.setItem('agentworld-parallax', JSON.stringify({ v: G.version, done: [...G.done], seen: G.seen || {}, indiv: G.indivChoice || 0 })); } catch (e) {}
  };
  G.load = function () {
    try {
      const s = JSON.parse(localStorage.getItem('agentworld-parallax') || 'null');
      return s && Array.isArray(s.done) ? s : null;
    } catch (e) { return null; }
  };
  G.clearSave = function () { try { localStorage.removeItem('agentworld-parallax'); } catch (e) {} };

  /* ============================================================ boot */
  G.init = function () {
    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    G.ctx = ctx; G.canvas = canvas;
    world.build();
    G.buildMap();
    requestAnimationFrame(loop);
  };

  G.start = function (version, resume) {
    G.mode = 'play';
    G.entities = [];
    G.done = new Set(resume ? resume.done : []);
    G.seen = (resume && resume.seen) || {};
    G.indivChoice = (resume && resume.indiv) || 0;
    G.lens = false; G.busy = false; G.freeWalk = false; G.commonsHinted = false;
    G.fx.overview = null; G.fx.droste = null; G.fx.ghosts = [];
    G.version = version;
    const gx = world.gate.x, gy = world.gate.y;
    let sx = gx, sy = gy, dir = 'up';
    if (resume && resume.done.length) {
      const lastN = Math.max(...resume.done);
      const st = world.station(lastN);
      [sx, sy] = st.stand; dir = st.face;
    }
    G.player = G.spawn({ x: sx, y: sy, role: 'player', kind: 'human', dir, solid: false, speed: 5.5, name: 'You' });
    G.mira = G.spawn({ x: sx, y: sy + 1, role: 'mira', kind: 'agent', dir, name: 'Mira', label: 'MIRA' });
    if (resume) G.placeMiraBehind();
    AW.tour.spawnCast();
    G.setVersion(version, { force: true, silent: true });
    G.cam.x = G.player.px + 8; G.cam.y = G.player.py + 8; G.cam.scale = 1; G.cam.follow = true;
    AW.ui.showHud(true);
    AW.ui.updateObjective();
  };
})();
