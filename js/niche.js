/* Agentworld: Parallax — Niche Street (ch. 4): the same block at three stages of niche construction.
   4A agents fit niches built for humans; 4B they rebuild the niche; 4C the new niche reshapes them. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const T = AW.T;
  const A = () => AW.art;
  const niche = (AW.niche = {});

  const DOORS = [[23, 6], [35, 6], [42, 6]];   // shop doors (bottom row of each shop)
  const MASTS = [[31, 9], [40, 9], [21, 9]];
  const CANOPIES = [[24, 9], [37, 9], [43, 9]];

  niche.paint = function (c, v, stage, f) {
    const art = A();
    const R = art.R, P = art.P, disc = art.disc, ring = art.ring, line = art.line;
    const pal = art.PAL[v];
    if (v === 'I') {
      if (stage === 0) {
        for (const [dx, dy] of DOORS) {
          const x = dx * T, y = dy * T + 16;
          R(c, x + 1, y, 14, 2, '#cfc6b4'); R(c, x + 2, y + 2, 12, 2, '#bdb3a0');
        }
        // bicycle rack and a mailbox: a street sized for bipeds with hands
        for (const bx of [32 * T + 2, 33 * T + 2]) { ring(c, bx + 3, 9 * T + 10, 3, '#3b3b48'); ring(c, bx + 10, 9 * T + 10, 3, '#3b3b48'); line(c, bx + 3, 9 * T + 10, bx + 7, 9 * T + 6, '#c8463d'); line(c, bx + 7, 9 * T + 6, bx + 10, 9 * T + 10, '#c8463d'); }
        R(c, 38 * T + 5, 9 * T + 2, 6, 7, '#3b62c4'); R(c, 38 * T + 7, 9 * T + 9, 2, 6, '#2b3a6a');
      } else {
        // ramps instead of steps, docking sockets, machine-readable facades, charge lane
        for (const [dx, dy] of DOORS) {
          const x = dx * T, y = dy * T;
          for (let i = 0; i < 16; i += 4) { R(c, x + i, y + 16, 2, 3, '#f0c020'); R(c, x + i + 2, y + 16, 2, 3, '#2b2b30'); }
          // widened port
          if (stage === 2) { R(c, x - 4, y + 2, 24, 14, '#1c2433'); R(c, x - 4, y + 2, 24, 1, '#3fc8ff'); }
          // socket + QR-ish facade glyph
          R(c, x + 18, y + 6, 5, 5, '#2b2b30'); P(c, x + 20, y + 8, '#3fc8ff');
          for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) if (U.hash(dx * 7 + i, j, 9) < 0.5) P(c, x - 9 + i, y + 7 + j, '#1c1c1c');
        }
        for (let x = 19 * T; x < 46 * T; x += 8) R(c, x, 8 * T - 1, 5, 2, '#f0c020');
        for (let x = 20 * T; x < 46 * T; x += 48) { R(c, x, 8 * T + 9, 10, 5, '#2b2b30'); line(c, x + 6, 8 * T + 9, x + 3, 8 * T + 12, '#f0c020'); }
        for (const [mx, my] of MASTS) {
          const x = mx * T + 7, y = my * T;
          R(c, x, y - 4, 2, 18, '#5a5f6a'); disc(c, x + 1, y - 5, 3, '#e8edf2'); P(c, x + 1, y - 6, '#ff5a5a');
        }
        if (stage === 2) {
          for (const [cx, cy] of CANOPIES) {
            const x = cx * T, y = cy * T;
            art.ellipse(c, x + 8, y + 6, 10, 5, '#2e7f86'); art.ellipse(c, x + 8, y + 5, 8, 3, '#4fb0b0');
            R(c, x + 7, y + 10, 2, 12, '#5a5f6a'); P(c, x + 8, y + 3, '#c9f7ff');
          }
          // charging pucks set into the pavement, glowing where a body is docked
          for (let x = 21 * T; x < 46 * T; x += 56) { disc(c, x + 8, 8 * T + 4, 3, '#2b2b30'); disc(c, x + 8, 8 * T + 4, 1.5, '#3fc8ff'); }
        }
      }
    } else if (v === 'II') {
      if (stage === 0) {
        // a memory of the human street: paving, plain doors, steps, warm sepia
        c.fillStyle = 'rgba(232,206,160,0.55)';
        c.fillRect(19 * T, 2 * T, 27 * T, 9 * T);
        for (let x = 19; x < 46; x++) for (let y = 7; y < 9; y++) { R(c, x * T, y * T, 16, 16, '#a8a196'); R(c, x * T, y * T, 16, 1, '#8f887c'); R(c, x * T, y * T, 1, 16, '#8f887c'); }
        for (const [dx, dy] of DOORS) { R(c, dx * T + 3, dy * T + 2, 10, 14, '#6b4a32'); R(c, dx * T + 1, dy * T + 16, 14, 2, '#cfc6b4'); }
        AW.font.drawHalo(c, 'TWENTY YEARS AGO', 32 * T, 9 * T + 6, '#5a3a20', '#f3e3c3', true);
      } else {
        for (const [mx, my] of MASTS) {
          const x = mx * T + 7, y = my * T;
          R(c, x, y - 8, 2, 22, '#1f2b26');
          disc(c, x + 1, y - 9, 3, f === 0 ? pal.glow : U.shade(pal.glow, -0.3));
          ring(c, x + 1, y - 9, 6, U.rgba(pal.glow, 0.5));
        }
        for (const [dx, dy] of DOORS) { ring(c, dx * T + 8, dy * T + 12, 7, f === 0 ? pal.glow2 : U.shade(pal.glow2, -0.3)); }
        if (stage === 2) {
          for (const [cx, cy] of CANOPIES) { art.ellipse(c, cx * T + 8, cy * T + 6, 11, 6, '#1d4f45'); art.ellipse(c, cx * T + 8, cy * T + 5, 9, 4, '#2f8a62'); P(c, cx * T + 8, cy * T + 3, pal.glow3); }
          for (let x = 20 * T; x < 46 * T; x += 32) line(c, x, 7 * T, x + 12, 9 * T - 1, U.shade(pal.road, 0.3));
        } else {
          c.fillStyle = 'rgba(232,206,160,0.22)';
          c.fillRect(19 * T, 2 * T, 27 * T, 9 * T);
        }
      }
    } else {
      // Lattice: the niche drawn as a shape, and which way the shape changes
      const glyph = stage === 0 ? 'H' : 'A';
      for (const [dx, dy] of DOORS) {
        const x = dx * T + 2, y = dy * T - 40;
        R(c, x - 3, y - 3, 18, 21, pal.paper);
        R(c, x - 3, y - 3, 18, 1, pal.blueL); R(c, x - 3, y + 17, 18, 1, pal.blueL); R(c, x - 3, y - 3, 1, 21, pal.blueL); R(c, x + 14, y - 3, 1, 21, pal.blueL);
        AW.font.draw(c, glyph, x + 1, y, stage === 0 ? pal.ink : pal.blue, 3);
      }
      const label = stage === 0 ? '4A  AGENTS FIT THE NICHE' : stage === 1 ? '4B  AGENTS RESHAPE THE NICHE' : '4C  THE NICHE RESHAPES THE AGENTS';
      // the caption floats on the river, clear of the street and its traffic
      const tw = AW.font.width(label) + 8, ly = 11 * T + 4;
      R(c, 36 * T - tw / 2, ly, tw, 9, pal.paper);
      R(c, 36 * T - tw / 2, ly, tw, 1, pal.blue); R(c, 36 * T - tw / 2, ly + 8, tw, 1, pal.blue);
      AW.font.drawCentered(c, label, 36 * T, ly + 2, pal.blue);
      if (stage === 2) {
        for (const [dx, dy] of DOORS) {
          const x = dx * T + 8, y = dy * T - 30;
          ring(c, x + 16, y + 4, 9, pal.blue);
          R(c, x + 23, y + 1, 3, 1, pal.blue); R(c, x + 24, y, 1, 3, pal.blue);
        }
      }
    }
  };

  /* agents that only exist once the niche has been rebuilt */
  niche.populate = function (stage) {
    const G = AW.game;
    G.entities = G.entities.filter((e) => e.role !== 'nicheBot');
    if (stage < 2) return;
    const spots = [[22, 8], [27, 7], [34, 8], [38, 7], [43, 8], [25, 8]];
    spots.forEach(([x, y], i) => {
      if (G.player && G.player.x === x && G.player.y === y) return;
      G.spawn({ x, y, role: 'nicheBot', kind: 'agent', wander: true, seed: 900 + i, speed: 3 + (i % 3) });
    });
  };
})();
