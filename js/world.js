/* Agentworld: Parallax — the town map, shared by all three readings.
   One layout, three materializations: the versions repaint every tile, building and prop. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;

  const TL = (AW.TL = {
    GRASS: 0, ROAD: 1, PLAZA: 2, WATER: 3, BRIDGE: 4, TREE: 5, FOREST: 6, FLOWER: 7,
    FENCE: 8, HEDGE: 9, GARDEN: 10, BUILDING: 11, PROP: 12, LAMP: 13, BENCH: 14, POST: 15, SIGN: 16,
  });
  const SOLID = new Set([TL.WATER, TL.TREE, TL.FOREST, TL.FENCE, TL.HEDGE, TL.BUILDING, TL.PROP, TL.LAMP, TL.BENCH, TL.SIGN]);
  const ROADLIKE = new Set([TL.ROAD, TL.PLAZA, TL.BRIDGE]);

  const W = 60, H = 42;
  const world = (AW.world = {
    W, H, TL,
    tiles: new Uint8Array(W * H),
    buildings: [],
    props: [],
    signs: {},          // "x,y" -> sign id
    stations: [],
    nicheArea: { x: 19, y: 2, w: 27, h: 9 },
    plaza: { cx: 29.5, cy: 20.5, r: 6.6 },
    gate: { x: 29, y: 38 },
    in(x, y) { return x >= 0 && y >= 0 && x < W && y < H; },
    get(x, y) { return this.in(x, y) ? this.tiles[y * W + x] : TL.FOREST; },
    set(x, y, t) { if (this.in(x, y)) this.tiles[y * W + x] = t; },
    solid(x, y) { return SOLID.has(this.get(x, y)); },
    roadlike(x, y) { return ROADLIKE.has(this.get(x, y)); },
    buildingAt(x, y) {
      return this.buildings.find((b) => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h) || null;
    },
    propAt(x, y) {
      return this.props.find((p) => x >= p.x && y >= p.y && x < p.x + p.w && y < p.y + p.h) || null;
    },
    station(n) { return this.stations[n - 1]; },
    stationAt(x, y) {
      return this.stations.find((s) => x >= s.area[0] && y >= s.area[1] && x < s.area[0] + s.area[2] && y < s.area[1] + s.area[3]) || null;
    },
  });

  function fill(t, x, y, w, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) world.set(i, j, t); }

  function addBuilding(b) {
    b.door = b.door === undefined ? Math.floor(b.w / 2) : b.door; // door column offset, bottom row
    world.buildings.push(b);
    fill(TL.BUILDING, b.x, b.y, b.w, b.h);
  }
  function addProp(p) { world.props.push(p); fill(TL.PROP, p.x, p.y, p.w, p.h); }

  world.build = function () {
    world.tiles.fill(TL.GRASS);
    world.buildings.length = 0;
    world.props.length = 0;
    world.signs = {};

    // forest border with the south gate
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (x < 2 || x >= W - 2 || y < 2 || y >= H - 2) world.set(x, y, TL.FOREST);

    // canal
    fill(TL.WATER, 2, 11, W - 4, 2);

    // roads: 2 tiles wide
    const road = (x, y, w, h) => {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
        const t = world.get(i, j);
        world.set(i, j, t === TL.WATER ? TL.BRIDGE : TL.ROAD);
      }
    };
    road(2, 7, W - 4, 2);    // north: "Niche Street"
    road(2, 20, W - 4, 2);   // middle
    road(2, 34, W - 4, 2);   // south
    road(11, 7, 2, 29);      // west
    road(47, 7, 2, 29);      // east
    road(29, 7, 2, 35);      // main, through the gate

    // plaza
    const P = world.plaza;
    for (let y = 12; y < 30; y++) for (let x = 20; x < 40; x++) {
      if (Math.hypot(x + 0.5 - P.cx - 0.5, y + 0.5 - P.cy - 0.5) <= P.r) world.set(x, y, TL.PLAZA);
    }

    // buildings ---------------------------------------------------------
    addBuilding({ id: 'house_nw', kind: 'house', x: 3, y: 2, w: 6, h: 4, hue: 0 });
    addBuilding({ id: 'lodging', kind: 'home', x: 14, y: 2, w: 6, h: 5, hue: 1 });
    addBuilding({ id: 'shop1', kind: 'shop', x: 21, y: 3, w: 5, h: 4, hue: 2, niche: true, sign: 'PARCELS' });
    addBuilding({ id: 'shop2', kind: 'shop', x: 33, y: 3, w: 5, h: 4, hue: 3, niche: true, sign: 'REPAIR' });
    addBuilding({ id: 'shop3', kind: 'shop', x: 39, y: 3, w: 6, h: 4, hue: 4, niche: true, sign: 'CHARGE' });
    addBuilding({ id: 'sim', kind: 'sim', x: 50, y: 2, w: 7, h: 5, hue: 5 });
    addBuilding({ id: 'atelier', kind: 'atelier', x: 3, y: 14, w: 7, h: 5, hue: 6 });
    addBuilding({ id: 'school', kind: 'school', x: 15, y: 14, w: 7, h: 5, hue: 7 });
    addBuilding({ id: 'hall', kind: 'hall', x: 38, y: 14, w: 7, h: 5, hue: 8 });
    addBuilding({ id: 'switch', kind: 'switch', x: 50, y: 13, w: 7, h: 5, hue: 9 });
    addBuilding({ id: 'registry', kind: 'registry', x: 37, y: 22, w: 8, h: 5, hue: 10 });
    addBuilding({ id: 'court', kind: 'court', x: 50, y: 24, w: 7, h: 7, hue: 11 });
    addBuilding({ id: 'cafe', kind: 'cafe', x: 39, y: 28, w: 7, h: 5, hue: 12 });
    addBuilding({ id: 'old1', kind: 'house', x: 3, y: 23, w: 6, h: 4, hue: 13 });
    addBuilding({ id: 'old2', kind: 'house', x: 3, y: 29, w: 6, h: 4, hue: 14 });
    addBuilding({ id: 'plant', kind: 'plant', x: 51, y: 36, w: 6, h: 4, hue: 15, door: -1 });

    // props ---------------------------------------------------------------
    addProp({ id: 'well', kind: 'well', x: 29, y: 20, w: 2, h: 2 });
    addProp({ id: 'board', kind: 'board', x: 32, y: 24, w: 3, h: 2 });
    addProp({ id: 'simtable', kind: 'simtable', x: 51, y: 9, w: 5, h: 2 });
    addProp({ id: 'console', kind: 'console', x: 50, y: 18, w: 3, h: 1 });
    addProp({ id: 't_mono', kind: 'table', x: 33, y: 30, w: 1, h: 1 });
    addProp({ id: 't_babel', kind: 'table', x: 37, y: 30, w: 1, h: 1 });
    addProp({ id: 't_corridor', kind: 'table', x: 35, y: 32, w: 1, h: 1 });

    // human-made garden: current fence + interior
    for (let x = 15; x <= 22; x++) { world.set(x, 25, TL.FENCE); world.set(x, 31, TL.FENCE); }
    for (let y = 25; y <= 31; y++) { world.set(15, y, TL.FENCE); world.set(22, y, TL.FENCE); }
    fill(TL.GARDEN, 16, 26, 6, 5);
    world.set(18, 31, TL.GARDEN); world.set(19, 31, TL.GARDEN); // the gate (picketed)
    // the old, larger boundaries: fence posts left behind each time the line moved inward
    const ring = (x0, y0, x1, y1, step) => {
      for (let x = x0; x <= x1; x += step) { post(x, y0); post(x, y1); }
      for (let y = y0; y <= y1; y += step) { post(x0, y); post(x1, y); }
    };
    const post = (x, y) => { if (world.get(x, y) === TL.GRASS) world.set(x, y, TL.POST); };
    ring(14, 24, 23, 32, 2);
    ring(13, 23, 25, 33, 3);

    // benches, lamps, signs, hedges ------------------------------------
    const signs = [
      ['town', 31, 37], ['tram', 23, 30], ['garden', 23, 27], ['glossary', 35, 28],
      ['niche', 27, 9], ['school', 22, 19], ['court', 49, 30], ['plant', 50, 37],
    ];
    for (const [id, x, y] of signs) { world.set(x, y, TL.SIGN); world.signs[x + ',' + y] = id; }
    const lamps = [
      [28, 37], [31, 33], [28, 30], [31, 15], [27, 15], [13, 19], [10, 22], [13, 33], [46, 22], [49, 22],
      [46, 33], [26, 9], [36, 9], [44, 9], [10, 9], [20, 22], [43, 19], [33, 19], [24, 33], [36, 36], [22, 36],
    ];
    for (const [x, y] of lamps) if (world.get(x, y) === TL.GRASS) world.set(x, y, TL.LAMP);
    for (const [x, y] of [[26, 18], [33, 18], [25, 26], [24, 16]]) if (world.get(x, y) === TL.GRASS) world.set(x, y, TL.BENCH);
    // hedges along the arrival lane
    for (let y = 36; y <= 39; y++) { world.set(27, y, TL.HEDGE); world.set(32, y, TL.HEDGE); }
    world.set(31, 37, TL.SIGN);

    // stations -------------------------------------------------------------
    // area = trigger rectangle [x,y,w,h]; stand = where the player is walked to; face = facing there
    world.stations = [
      { n: 1, key: 'census', area: [26, 23, 9, 5], stand: [30, 25], face: 'right', focus: [33, 24] },
      { n: 2, key: 'atelier', area: [2, 19, 9, 3], stand: [6, 20], face: 'up', focus: [6, 19] },
      { n: 3, key: 'lodging', area: [13, 7, 8, 2], stand: [16, 7], face: 'up', focus: [16, 6] },
      { n: 4, key: 'niche', area: [24, 7, 13, 2], stand: [30, 8], face: 'up', focus: [30, 6] },
      { n: 5, key: 'sim', area: [49, 7, 9, 2], stand: [53, 8], face: 'down', focus: [53, 9] },
      { n: 6, key: 'switch', area: [49, 18, 9, 4], stand: [51, 19], face: 'up', focus: [51, 18] },
      { n: 7, key: 'court', area: [49, 31, 9, 5], stand: [53, 33], face: 'up', focus: [53, 31] },
      { n: 8, key: 'cafe', area: [32, 33, 14, 3], stand: [38, 34], face: 'left', focus: [36, 32] },
      { n: 9, key: 'garden', area: [14, 32, 11, 4], stand: [19, 33], face: 'up', focus: [19, 31] },
      { n: 10, key: 'commons', area: [27, 18, 6, 6], stand: [29, 22], face: 'up', focus: [29, 20] },
    ];

    // trees & flowers: deterministic scatter that keeps verges and station sites clear
    const keepClear = new Uint8Array(W * H);
    const mark = (x, y, w, h) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (world.in(i, j)) keepClear[j * W + i] = 1; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = world.get(x, y);
      if (ROADLIKE.has(t) || t === TL.SIGN || t === TL.LAMP || t === TL.BENCH) mark(x - 1, y - 1, 3, 3);
      if (t === TL.FENCE || t === TL.POST || t === TL.GARDEN) mark(x - 1, y - 1, 3, 3);
    }
    for (const b of world.buildings) mark(b.x - 1, b.y + b.h - 1, b.w + 2, 3);
    for (const p of world.props) mark(p.x - 1, p.y - 1, p.w + 2, p.h + 2);
    for (const s of world.stations) mark(s.area[0] - 1, s.area[1] - 1, s.area[2] + 2, s.area[3] + 2);
    mark(32, 28, 7, 6);   // café terrace
    mark(23, 28, 6, 4);   // tram stop
    mark(2, 9, W - 4, 2); // canal-side strip
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      if (world.get(x, y) !== TL.GRASS || keepClear[y * W + x]) continue;
      const r = U.hash(x, y, 7);
      if (r < 0.16) world.set(x, y, TL.TREE);
      else if (r < 0.27) world.set(x, y, TL.FLOWER);
    }
    // a few flower beds near the plaza and gate regardless
    for (const [x, y] of [[25, 36], [26, 37], [33, 36], [34, 37], [21, 22], [37, 19], [24, 13], [34, 13]])
      if (world.get(x, y) === TL.GRASS) world.set(x, y, TL.FLOWER);
  };

  /* BFS path on the grid for scripted walking. Returns array of [x,y] excluding start. */
  world.path = function (sx, sy, tx, ty, blocked) {
    if (sx === tx && sy === ty) return [];
    const prev = new Int32Array(W * H).fill(-1);
    const q = [sy * W + sx];
    prev[sy * W + sx] = sy * W + sx;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (q.length) {
      const cur = q.shift();
      const cx = cur % W, cy = (cur / W) | 0;
      if (cx === tx && cy === ty) break;
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (!world.in(nx, ny)) continue;
        const ni = ny * W + nx;
        if (prev[ni] !== -1) continue;
        if (world.solid(nx, ny) && !(nx === tx && ny === ty)) continue;
        if (blocked && blocked(nx, ny) && !(nx === tx && ny === ty)) continue;
        prev[ni] = cur;
        q.push(ni);
      }
    }
    const ti = ty * W + tx;
    if (prev[ti] === -1) return null;
    const out = [];
    let c = ti;
    while (c !== sy * W + sx) { out.push([c % W, (c / W) | 0]); c = prev[c]; }
    return out.reverse();
  };
})();
