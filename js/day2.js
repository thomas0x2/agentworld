/* Agentworld: Parallax — Day 2, an ordinary Tuesday.
   Day 1 introduces the brief one chapter at a time. Day 2 is daily life in the same town,
   in order, from waking up to going home, weighted toward the parts of a day that change most.
   Stops 11 to 18 share the engine and the three readings with Day 1. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const T = AW.T;
  const world = AW.world;
  const G = () => AW.game;
  const tour = AW.tour;
  const { say, choose, wait, t } = tour.kit;
  const STOPS = tour.STOPS;
  const day2 = (AW.day2 = {});

  /* ===================================================== notebook */
  AW.NOTES.push(
    {
      n: 11, day: 2, time: '07:00', phase: 'morning', title: 'While you slept', sections: '§6.5', cite: '§6.5',
      teaser: 'Not yet observed. Your lodging, first thing.',
      quote: 'The vast majority of interactions mediated by “agent interaction design” will be between agents themselves.',
      observed: {
        I: 'I woke up to a ledger: 41,906 exchanges held in my name overnight, and one decision left for me.',
        II: 'The swarm worked the night shift for me. It saved exactly one decision, the one that was mine.',
        III: 'Overnight: tens of thousands of A–A edges, almost no H edges. One edge waited for my H.',
      },
    },
    {
      n: 12, day: 2, time: '08:10', phase: 'morning', title: 'Commute and coffee', sections: '§6.5 · §5.2', cite: '§6.5',
      teaser: 'Not yet observed. The pod stop on Niche Street.',
      quote: 'The expansion may shift the number of significant functional relationships that anyone enters into, much as a city operates, filled with purpose-bound stranger interactions.',
      observed: {
        I: 'No driver, no lights, no parking. Three pods negotiated a junction without braking, and my coffee met me at the curb.',
        II: 'A legged pod threaded a junction with two others and nobody slowed. A café drone met us mid-route.',
        III: 'Three A’s crossed one node with no signal: routing as negotiation. The coffee was ordered by a forecast.',
      },
    },
    {
      n: 13, day: 2, time: '09:30', phase: 'day', title: 'Work', sections: '§1.2 · §7.4', cite: '§1.2',
      teaser: 'Not yet observed. The Switchboard, east.',
      quote: 'This isn’t simple displacement. It’s a rebalancing in which human agency shifts toward value-setting, oversight, and long-horizon judgment.',
      observed: {
        I: 'Sol’s agents had done nine hours of work by the time she arrived. Her job was to choose what it was for, and to answer for it.',
        II: 'The hive did the labor. Sol chose what it was for, and owned the result.',
        III: 'H as the signature node: goal in, approval out, liability attached.',
      },
    },
    {
      n: 14, day: 2, time: '11:00', phase: 'day', title: 'The doctor', sections: '§5.2 · §7.2', cite: '§5.2',
      teaser: 'Not yet observed. The clinic, east of the plaza.',
      quote: 'Agents may play out multiple branching scenarios so as to model potential outcomes in the future, identifying what is and isn’t most likely to occur.',
      observed: {
        I: 'Dr. Hale had run a hundred futures of my knee before I felt a thing. What she needed from me was a choice about risk.',
        II: 'Pale copies of me walked off into a hundred possible years. The doctor asked which ones I could live with.',
        III: 'Branching sims of one H. The diagnosis was cheap; the consent was not.',
      },
    },
    {
      n: 15, day: 2, time: '12:00', phase: 'day', title: 'Paperwork', sections: '§10.2 · §7.4', cite: '§10.2',
      teaser: 'Not yet observed. The Registry.',
      quote: 'The rapid thickening of an inter-agent institutional substrate — protocols, registries, shared memory, norms of delegation — that every participant, human and machine, draws from and contributes to.',
      observed: {
        I: 'No forms, no queue. The registrar asked me one thing: what my agents may sign without asking me.',
        II: 'The Registry hums like a hive. My only paperwork was deciding how far my swarm may go.',
        III: 'REGISTRY: A–A filings by the thousand. H input: one norm of delegation.',
      },
    },
    {
      n: 16, day: 2, time: '12:30', phase: 'day', title: 'Lunch with friends', sections: '§6.5', cite: '§6.5',
      teaser: 'Not yet observed. The café terrace.',
      quote: 'For humans there are built-in limits associated with Dunbar’s number of 150 stable relationships.',
      observed: {
        I: 'Lunch with Jun and Odile, found by our agents in eleven thousand messages. The bill split itself. The gossip didn’t.',
        II: 'Three humans at one table and a dozen agents hovering. Ama sent hers instead.',
        III: 'Three H’s at one table: the edges that don’t scale. Ama’s A sat in for her.',
      },
    },
    {
      n: 17, day: 2, time: '15:30', phase: 'afternoon', title: 'School', sections: '§8.2', cite: '§8.2',
      teaser: 'Not yet observed. The school steps, west.',
      quote: 'Cooperation for its own sake leads to ontology collapse and a catastrophic, monotonous affirmation of false but agreeable conclusions.',
      observed: {
        I: 'Nia has two tutors. One agrees with everything she says. Her teacher’s job is to make her prefer the other one.',
        II: 'A flattering drone and a stubborn one. The teacher was teaching which one to trust.',
        III: 'Tutor 1 mirrors H; tutor 2 contradicts H. The teacher teaches H to want 2.',
      },
    },
    {
      n: 18, day: 2, time: '21:00', phase: 'evening', title: 'Home', sections: '§10.5', cite: '§10.5',
      teaser: 'Not yet observed. Your lodging, after dark.',
      quote: 'Law, medicine, logistics, and pedagogy absorb the same underlying capability at radically different rates and with radically different failure modes.',
      observed: {
        I: 'Mira and I added up the day. Getting around changed beyond recognition; lunch with friends barely changed.',
        II: 'The town glowed through the window. Some of the day was rebuilt entirely, some only repainted.',
        III: 'One capability, absorbed unevenly: logistics near 1, friendship near 0. The frontier is jagged.',
      },
    }
  );

  /* ===================================================== cast */
  const spawn2 = (o) => tour.kit.castSpawn(Object.assign({ castDay: 2 }, o));
  day2.spawnCast = function () {
    spawn2({ x: 53, y: 18, role: 'sol', kind: 'human', dir: 'left' });
    spawn2({ x: 42, y: 19, role: 'doctor', kind: 'human', dir: 'left' });
    spawn2({ x: 42, y: 27, role: 'registrar', kind: 'agent', dir: 'left' });
    // lunch on the café terrace
    spawn2({ x: 34, y: 32, role: 'jun', kind: 'human', dir: 'right' });
    spawn2({ x: 36, y: 32, role: 'odile', kind: 'human', dir: 'left' });
    spawn2({ x: 35, y: 33, role: 'ama', kind: 'agent', dir: 'up' });
    // class on the school steps
    [14, 15, 21].forEach((x, i) => spawn2({ x, y: 19, role: 'pupil', kind: 'human', dir: 'down', scale: 0.8, seed: 801 + i }));
    spawn2({ x: 16, y: 19, role: 'tutor_yes', kind: 'agent', dir: 'down', scale: 0.85, label: 'TUTOR 1' });
    spawn2({ x: 17, y: 19, role: 'kid', kind: 'human', dir: 'down', scale: 0.8 });
    spawn2({ x: 19, y: 19, role: 'teacher', kind: 'human', dir: 'down' });
    spawn2({ x: 20, y: 19, role: 'tutor_no', kind: 'agent', dir: 'down', scale: 0.85, label: 'TUTOR 2' });
  };

  /* ===================================================== helpers */
  // every Day 2 choice is remembered by key; the evening tally counts them
  async function decide(key, opts, prompt, o) {
    const g = G();
    const k = await AW.ui.choose(opts, Object.assign({ prompt }, o || {}));
    g.d2.choices = Object.assign({}, g.d2.choices, { [key]: k });
    g.save();
    return k;
  }
  const choiceOf = (key) => { const c = G().d2.choices; return c && key in c ? c[key] : null; };
  const place = (e, x, y, dir) => { e.x = x; e.y = y; e.px = x * T; e.py = y * T; e.moving = false; e.queue = null; if (dir) e.dir = dir; };
  const pulse = (x, y, color, r1) => G().fx.pulses.push({ x, y, r0: 0, r1: r1 || 90, dur: 1.3, t: 0, color: color || (G().version === 'III' ? '#2a2ae0' : '#ffffff'), w: 1 });
  const ink = () => (G().version === 'III' ? '#2a2ae0' : G().version === 'II' ? '#6ff5d2' : '#ffd23f');

  function fade(to, ms) {
    const g = G();
    const from = g.fx.night;
    const s0 = performance.now();
    return new Promise((res) => {
      const step = () => {
        const k = Math.min(1, (performance.now() - s0) / ms);
        g.fx.night = from + (to - from) * U.ease(k);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  // a pod: a vehicle drawn directly, two tiles long, with riders
  function spawnPod(o) {
    const g = G();
    const e = g.spawn(Object.assign({ kind: 'agent', role: 'extra_pod', solid: true, speed: 6, seed: 900 }, o));
    e.spec = { type: 'vehicle', key: 'vehicle' };
    e.makeSpec = () => e.spec;
    e.draw = (c, x, y) => AW.art.drawVehicle(c, g.version, x, y, e.dir, g.time, { riders: e.riders || 0, small: !!e.small, body: e.body });
    return e;
  }
  // keep wanderers out of a pod's route while it drives, and bring them back after
  function clearLanes(rects) {
    const g = G();
    const keys = new Set();
    for (const [x0, y0, x1, y1] of rects) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) keys.add(x + ',' + y);
    g.noWander = keys;
    const off = g.entities.filter((e) => e.wander && e !== g.player && keys.has(e.x + ',' + e.y));
    off.forEach((e) => { e.hidden = true; e.wander = false; });
    let done = false;
    return () => {
      if (done) return;
      done = true;
      if (g.noWander === keys) g.noWander = null;
      off.forEach((e) => { e.hidden = false; e.wander = true; });
    };
  }
  const line = (x0, y0, x1, y1) => {
    const out = [];
    let x = x0, y = y0;
    while (x !== x1 || y !== y1) {
      if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
      out.push([x, y]);
    }
    return out;
  };

  /* ===================================================== switching days */
  day2.setDay = function (d) {
    const g = G();
    g.day = d;
    g.entities = g.entities.filter((e) => !e.castDay || e.castDay === d);
    if (!g.entities.some((e) => e.castDay === d)) (d === 2 ? day2.spawnCast : tour.spawnCast)();
    g.setVersion(g.version, { force: true, silent: true });
    g.lastStation = g.stationHere(g.player.x, g.player.y);
    AW.ui.updateObjective();
    g.save();
  };
  function settle(x, y, dir) {
    const g = G();
    place(g.player, x, y, dir);
    g.placeMiraBehind();
    g.cam.anim = null; g.cam.target = null; g.cam.scale = 1; g.cam.follow = true;
    g.cam.x = g.player.px + 8; g.cam.y = g.player.py + 8;
    g.lastStation = g.stationHere(x, y);
  }

  // opts: { fresh: start Tuesday over, fromTitle: the screen is already dark }
  day2.enter = async function (opts) {
    opts = opts || {};
    const g = G();
    if (g.busy) return;
    g.busy = true;
    let fresh;
    try {
      if (opts.fromTitle) g.fx.night = 1; else await fade(1, 700);
      fresh = !!opts.fresh || !G().DAYS[2].some((n) => g.done.has(n)) || g.dayDone(2);
      if (fresh) { G().DAYS[2].forEach((n) => g.done.delete(n)); g.d2 = {}; }
      day2.setDay(2);
      const mine = G().DAYS[2].filter((n) => g.done.has(n));
      if (mine.length) settle(...world.resumeAt(Math.max(...mine)));
      else settle(...world.station(11).stand, 'down');
      AW.ui.caption('DAY 2', t({
        I: 'An ordinary Tuesday in Parallax. Not the big ideas this time: the commute, the job, the doctor, lunch.',
        II: 'An ordinary Tuesday in Parallax. The same rainforest, lived in: the commute, the job, the doctor, lunch.',
        III: 'An ordinary Tuesday, drawn as a diagram: commute, work, doctor, paperwork, lunch, school, home.',
      }));
      await fade(0, 1000);
      await wait(1900);
      AW.ui.captionHide();
    } finally {
      g.busy = false;
    }
    if (fresh) await tour.run(11);
    else {
      const n = g.nextObjective();
      AW.ui.toast(n ? `Back to Tuesday. Next: ${tour.stopName(n)}.` : 'Back to Tuesday.', 3200);
    }
  };

  day2.leave = async function () {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    try {
      await fade(1, 600);
      day2.setDay(1);
      const mine = G().DAYS[1].filter((n) => g.done.has(n));
      if (mine.length) settle(...world.resumeAt(Math.max(...mine)));
      else settle(world.gate.x, world.gate.y, 'up');
      AW.ui.caption('DAY 1', 'The ten chapters, as you left them.');
      await fade(0, 800);
      await wait(1200);
      AW.ui.captionHide();
    } finally {
      g.busy = false;
    }
    const n = g.nextObjective();
    AW.ui.toast(n ? `Next stop: Ch.${n}, ${AW.NOTES[n - 1].title}. Talk to Mira any time to go back to Tuesday.`
      : 'All ten chapters are here to replay: stand on a ✓ and press Space. Talk to Mira to go back to Tuesday.', 4600);
  };

  /* ===================================================== talking, on Day 2 */
  const pickLine = (arr, seed) => arr[Math.abs(Math.floor(seed + G().time * 0.37)) % arr.length];
  // returns true when it handled the conversation
  day2.talk = async function (e, sp) {
    const g = G();
    if (e === g.mira) {
      if (g.day === 1 && g.dayDone(1)) {
        const k = await AW.ui.choose(['Start Day 2: an ordinary Tuesday', 'Not yet'], { prompt: 'That’s all ten chapters. Want to see what an ordinary day here is like?', label: 'MIRA', cls: 'sp-mira' });
        if (k === 0) setTimeout(() => day2.enter(), 60);
        return true;
      }
      if (g.day !== 2) return false;
      const n = g.nextObjective();
      if (n) {
        await sp('mira', pickLine([
          `Next: ${tour.stopName(n)}. Follow the marker.`,
          'Today is the ordinary stuff. That’s where the change actually lands.',
          t({ I: 'Press V any time. Same Tuesday, another reading.', II: 'Press L to see what the swarm is doing for you right now.', III: 'Press L: every edge you’re part of today.' }),
        ], 5));
      } else {
        const k = await AW.ui.choose(['Back to Day 1', 'Stay in Tuesday'], { prompt: 'Tuesday is over. Go back to the ten chapters?', label: 'MIRA', cls: 'sp-mira' });
        if (k === 0) setTimeout(() => day2.leave(), 60);
      }
      return true;
    }
    if (g.day !== 2) return false;
    const r = e.role;
    const parked = choiceOf('parking');
    const L = {
      sol: ['sol', 'The flour’s on its way. I checked once. Checking is most of my job now.'],
      doctor: ['doctor', 'Your sims are still running. Go and live a little; they need the data.'],
      registrar: ['registrar', 'Your norm is on file. Agents have read it about four hundred times since noon.'],
      jun: ['jun', parked === 1 ? 'Keep the spot. I’ll come and visit it.' : 'Tomatoes, right where the car used to be.'],
      odile: ['odile', 'I used to queue for everything. Now I queue for nothing, and I miss the gossip.'],
      ama: ['ama', 'I’m listening for Ama. She’ll want to know you said hello.'],
      teacher: ['teacher', 'The tutors know more than I do. I know which of them to doubt.'],
      tutor_yes: ['tutorYes', 'You’re so right! About everything!'],
      tutor_no: ['tutorNo', 'Are you sure? Check.'],
      kid: ['kid', 'Tutor 2 is so annoying. I think that means it’s working.'],
      pupil: ['pupil', pickLine(['My tutors argued about my homework. I watched.', 'Thirty tutors and one teacher. The teacher is the scary one.', 'I asked my tutor to agree with me. It said no. Rude.'], e.seed)],
    }[r];
    if (!L) return false;
    await sp(L[0], L[1]);
    return true;
  };

  /* ===================================================== the eight stops */

  /* ---- 07:00 While you slept ---- */
  STOPS[11] = async function () {
    const g = G();
    g.faceToward(g.mira, g.player);
    await say('mira', t({
      I: 'Morning! Before coffee, here’s what your agents did while you slept.',
      II: 'Morning! The swarm worked the night shift. Here’s the tally.',
      III: 'Morning. The overnight edge count, as promised.',
    }));
    await AW.ui.ledger({
      title: t({ I: 'OVERNIGHT, ON YOUR BEHALF', II: 'THE NIGHT SHIFT', III: 'OVERNIGHT EDGES' }),
      rows: [
        ['Messages answered for you', 212],
        ['Prices renegotiated', 38],
        ['Invitations declined, politely', 3],
        ['Agent-to-agent exchanges', 41906],
        ['Decisions that need you', 1],
      ],
      outro: 'Almost none of it involved a human. **The vast majority of interactions are between agents themselves.**',
      foot: '§6.5',
    });
    const k = await decide('parking', ['Give Jun the spot', 'Keep it'], t({
      I: 'The one decision: Jun’s agent asked again, properly this time. May Jun have your parking spot? You haven’t had a car in a year.',
      II: 'The one decision: Jun’s agent asked again, properly this time. May Jun have your old parking spot? Nobody parks any more.',
      III: 'Pending: Jun’s A requests your parking tile. Your H last used it 14 months ago.',
    }), { label: 'MIRA', cls: 'sp-mira' });
    await say('mira', k === 0
      ? 'Done. Jun’s agent sent a thank-you and a tomato. I don’t know why yet.'
      : 'Kept. I’ll tell Jun’s agent. It will be extremely polite about it.');
    await say('mira', t({
      I: 'Now, work. Your pod is at the corner in three minutes. Walk east.',
      II: 'Now, work. Your pod is ticking toward the corner. Walk east.',
      III: 'Next edge: H to work. Pod at the corner. Walk east.',
    }));
  };

  /* ---- 08:10 Commute and coffee ---- */
  STOPS[12] = async function () {
    const g = G();
    const p = g.player, m = g.mira;
    await say('mira', t({
      I: 'Here it comes. Nobody drives it. The face in the front window is a persona, for your comfort.',
      II: 'Here it comes. Legs beat wheels on these streets now.',
      III: 'An A that carries H’s. It routes itself.',
    }));
    // Niche Street, the junction, and the east road down to the Switchboard
    const reopen = clearLanes([[14, 7, 48, 8], [29, 9, 30, 18], [47, 9, 48, 34]]);
    const pod = spawnPod({ x: 33, y: 8, dir: 'left', riders: 0 });
    try {
      await g.walkPath(pod, line(33, 8, 24, 8), 7);
      pod.dir = 'left';
      const k = await decide('ride', ['Ride alone', 'Share with a stranger'], 'Ride alone, or pool with someone heading the same way? Pooling is half the energy.', { label: 'MIRA', cls: 'sp-mira' });
      let stranger = null;
      if (k === 1) {
        stranger = g.spawn({ x: 27, y: 7, role: 'extra_stranger', kind: 'human', dir: 'left', seed: 777 });
        stranger.makeSpec = (v) => AW.V.human(v, { skin: '#c68c5e', hair: '#1f1a18', hairStyle: 'long', top: '#7a6a9a', bottom: '#3a3f4f' }, 777);
        stranger.spec = stranger.makeSpec(g.version);
        await g.walkPath(stranger, [[26, 7], [25, 7], [25, 8]], 4);
        stranger.hidden = true;
      }
      // board
      await g.walkPath(p, [[23, 8]], 5);
      p.hidden = true; m.hidden = true;
      pod.riders = k === 1 ? 3 : 2;
      AW.audio.select();
      await g.camTo(pod.px + 8, pod.py + 8, 300);
      g.cam.target = pod; g.cam.follow = true;
      // the ride east, and two smaller pods through the same junction, nobody braking
      const rideA = g.walkPath(pod, line(24, 8, 40, 8), 6);
      // timed so that each slips through a gap the others leave: one tile apart, never touching
      const a = spawnPod({ x: 30, y: 15, dir: 'up', small: true, solid: false, body: '#e9d27a' });
      const b = spawnPod({ x: 37, y: 7, dir: 'left', small: true, solid: false, body: '#cfe0ef' });
      g.walkPath(a, [...line(30, 15, 30, 7), ...line(30, 7, 16, 7)], 6).then(() => g.remove(a));
      setTimeout(() => g.walkPath(b, [...line(37, 7, 29, 7), ...line(29, 7, 29, 18)], 6).then(() => g.remove(b)), 800);
      await wait(500);
      AW.ui.caption('08:14', t({
        I: 'No lights, no lanes, no driver. Three pods agree who goes first in a few milliseconds, and nobody brakes.',
        II: 'Walkers don’t wait at junctions. They negotiate them: three bodies, one crossing, nobody stops.',
        III: 'Junction as negotiation: three A’s, no signal, priority computed per crossing.',
      }));
      await wait(650);
      g.floater(a.px + 8, a.py - 6, 'AFTER YOU', 1.6);
      await wait(850);
      g.floater(b.px + 8, b.py - 6, 'THANKS', 1.6);
      await rideA;
      AW.ui.captionHide();
      // coffee, delivered at the curb, on a forecast
      const barista = g.spawn(Object.assign({ x: 42, y: 6, role: 'barista', kind: 'agent', dir: 'down', castDay: 2, speed: 4 }));
      await g.walkPath(barista, [[42, 7], [41, 7]], 4);
      barista.dir = 'down';
      await say('barista', t({
        I: 'Morning! The forecast said you’d want a flat white at 8:16. It is 8:16.',
        II: 'Morning! The forecast said you’d want this at 8:16. It is 8:16.',
        III: 'P(flat white at 08:16) = 0.93. Delivered at 08:16.',
      }));
      const c = await decide('coffee', ['Take it', 'Actually, I’d like tea'], 'My coffee was ordered by a simulation of me.');
      if (c === 0) {
        g.floater(barista.px + 8, barista.py - 6, 'PAID: AGENT TO AGENT', 2);
        await say('barista', 'Paid already. Your agent tipped mine. Have a good day!');
      } else {
        g.floater(barista.px + 8, barista.py - 6, 'FORECAST UPDATED', 2);
        await say('barista', 'Tea! Swapping it. The forecast just learned you’re less predictable before nine. It’ll be right next time.');
      }
      g.walkPath(barista, [[42, 7], [42, 6]], 4).then(() => g.remove(barista));
      if (stranger) {
        await say('stranger', 'Our agents matched us because we’re both going east and neither of us likes small talk. …Sorry.');
        await say('mira', 'A city of purpose-bound strangers. You’ll share a hundred rides with people you never meet twice.');
      } else {
        await say('mira', 'Riding alone costs twice the energy. Your agents bought the difference from a stranger’s agent who walked today. You’ll never meet.');
      }
      await g.walkPath(pod, [...line(40, 8, 47, 8), ...line(47, 8, 47, 19)], 6);
      // drop off by the Switchboard
      g.cam.target = null;
      place(p, 48, 19, 'right');
      place(m, 48, 20, 'up');
      p.hidden = false; m.hidden = false;
      pod.riders = stranger ? 1 : 0;
      AW.audio.select();
      await g.camFollow(300);
      g.walkPath(pod, line(47, 19, 47, 33), 6).then(() => { g.remove(pod); if (stranger) g.remove(stranger); reopen(); });
      await say('mira', t({
        I: 'Twelve minutes, door to door. It used to be thirty-five, and a parking fine.',
        II: 'Twelve minutes, door to door. The street did half the thinking.',
        III: 'Door to door: 12 min. Signals passed: 0. Fines: 0.',
      }));
    } catch (err) {
      reopen();
      g.remove(pod);
      p.hidden = false; m.hidden = false;
      throw err;
    }
  };

  /* ---- 09:30 Work ---- */
  STOPS[13] = async function () {
    const g = G();
    const sol = g.byRole('sol');
    g.faceToward(sol, g.player);
    await say('sol', t({
      I: 'Morning! Welcome to work. I conduct the bakery co-op from here. My agents started at four.',
      II: 'Morning. I conduct the bakery co-op from this console. The hive started at four.',
      III: 'Morning. Bakery co-op: A’s working since 04:00, one H conductor. That’s me.',
    }));
    await say('sol', 'They’ve settled almost everything. One thing they can’t: next year’s flour. Three offers, all fine on paper.');
    const k = await decide('flour', ['The cheapest, from 900 km away', 'The local mill, for 12% more', 'Let the agents optimize'], 'Which flour contract?', { label: 'SOL', cls: 'sp-human' });
    await say('sol', [
      'Cheapest it is. They’ll hit that target perfectly. Whether it was the right target is on me.',
      'The local mill. No agent would have picked that from the numbers, which is why it’s my call.',
      'They asked me right back: optimize for what? Price, the mill, the carbon? Every option is a value in disguise. I’ll pick the mill.',
    ][k]);
    const cx = 51 * T + 8, cy = 18 * T + 4;
    g.floater(cx, cy, 'SIGNED: SOL', 2.4, ink());
    pulse(cx, cy); AW.audio.select();
    await wait(500);
    g.floater(cx + 22, cy - 10, '214 TASKS DISPATCHED', 2.4);
    pulse(cx, cy, null, 140);
    await wait(500);
    g.floater(cx - 20, cy - 20, 'ROUTES BOOKED', 2.2);
    pulse(cx, cy, null, 190);
    await wait(900);
    await say('sol', 'That was nine hours of their work and one minute of mine. But if the flour is late, nobody calls the model. They call me.');
    await say('mira', t({
      I: 'Not displacement: a rebalancing. Her work moved up, to value-setting, oversight and long-horizon judgment.',
      II: 'Not displacement: a rebalancing. Her work moved up the food chain, to purpose and judgment.',
      III: 'H didn’t leave the loop. H moved to the top of it: values, oversight, long horizons.',
    }));
  };

  /* ---- 11:00 The doctor ---- */
  STOPS[14] = async function () {
    const g = G();
    const doc = g.byRole('doctor');
    const p = g.player;
    g.faceToward(doc, p); p.dir = 'right';
    await say('doctor', t({
      I: 'Hello. You don’t feel ill, I know. Your agent booked you because your simulations flagged something.',
      II: 'Hello. You don’t feel ill, I know. Your swarm booked you because your models flagged something.',
      III: 'Hello. Symptoms: none. Your sims flagged an event; your A booked the slot.',
    }));
    await say('doctor', 'Your left knee, about eight years from now. Let me show you what we ran.');
    const targets = [[33, 21], [47, 26], [46, 20], [36, 20], [47, 14], [41, 21]];
    g.fx.ghosts = targets.map(([x, y], i) => ({ path: world.path(p.x, p.y, x, y) || [], t: 0, color: i === 1 ? '#ff4d6d' : '#ffffff', alpha: i === 1 ? 0.8 : 0.4, sprite: true }));
    AW.ui.caption('5.2', t({
      I: 'Predictive simulation: a hundred futures of your body, run forward. Most of them are fine. One in five is not.',
      II: 'A hundred pale copies of you walk off into possible years. Most are fine. One in five limps.',
      III: 'Branches of one H, run forward: 81 of 100 uneventful, 19 of 100 surgery at fifty.',
    }));
    await wait(2800);
    AW.ui.captionHide();
    const k = await decide('knee', ['Treat it now, while it’s small', 'Watch it, and check again in a year', 'Show me the numbers first'], 'What would you like to do?', { label: 'DR. HALE', cls: 'sp-human' });
    g.fx.ghosts = [];
    await say('doctor', [
      'Done by Friday. Your agent has already found the slot and moved two meetings.',
      'Fine. The sims keep running. If the branches shift, your agent will tell you before I do.',
      'In 81 of 100 runs, nothing happens. In 19, surgery at fifty. The numbers I can give you. What a risk is worth to you, I can’t.',
    ][k]);
    await say('doctor', t({
      I: 'The agents diagnose. I do what they can’t: sit with you, and ask. Sickness and health aren’t a transaction.',
      II: 'The swarm diagnoses. I do the part that isn’t data: what this means to you. Sickness and health aren’t a transaction.',
      III: 'Diagnosis: A. Consent: H. Sickness and health are not exchangeable value.',
    }));
    await say('mira', 'You were seen years before you’d feel a thing. The choice still waited for you.');
  };

  /* ---- 12:00 Paperwork ---- */
  STOPS[15] = async function () {
    const g = G();
    const reg = g.byRole('registrar');
    const p = g.player;
    g.faceToward(reg, p); p.dir = 'right';
    await say('registrar', t({
      I: 'The Registry. Your permits, your tax return and four forms you didn’t know existed were filed at 4 a.m., agent to agent.',
      II: 'The Registry. Your permits and your tax return were filed at 4 a.m., swarm to swarm.',
      III: 'Filings since 04:00: 6, all A to A. Queue for H’s: empty.',
    }));
    await say('registrar', 'One thing still needs a human: your norm of delegation. It goes in the Registry, and every agent that deals with yours reads it first.');
    const k = await decide('norm', ['Anything under 50 credits', 'Nothing that involves another person', 'Ask me about everything'], 'What may your agents sign without asking you?', { label: 'REGISTRAR', cls: 'sp-agent' });
    await say('registrar', [
      'Registered. Most people pick something like that.',
      'Registered. That covers more than you’d think. Almost everything involves another person.',
      'Registered. You’ll get about four hundred questions a day. Most people last a week.',
    ][k]);
    const rx = 41 * T + 8, ry = 25 * T;
    g.floater(rx, ry, 'REGISTERED', 2.4, ink());
    pulse(rx, ry, null, 160); AW.audio.chime();
    await wait(700);
    await say('registrar', t({
      I: 'That’s most of what a registry is now: not a counter with a queue, but a commons of who may do what for whom.',
      II: 'That’s most of what a registry is now: a shared memory of who may do what for whom.',
      III: 'REGISTRY = protocols + shared memory + norms of delegation. Everyone draws from it; everyone adds to it.',
    }));
    await say('mira', 'Paperwork didn’t disappear. It moved down to us, and up to you: from forms to norms.');
  };

  /* ---- 12:30 Lunch with friends ---- */
  STOPS[16] = async function () {
    const g = G();
    const jun = g.byRole('jun'), od = g.byRole('odile'), ama = g.byRole('ama');
    jun.dir = 'right'; od.dir = 'left'; ama.dir = 'up';
    await say('mira', 'Your agents found the one hour all three of you were free this week. It took eleven thousand messages.');
    g.faceToward(od, g.player);
    await say('odile', 'Lunch is the only meeting nobody can attend for me. I check.');
    g.faceToward(jun, g.player);
    await say('jun', choiceOf('parking') === 1
      ? 'You kept the parking spot? You don’t even have a car. Nobody does!'
      : 'Thanks for the parking spot! It’s a tomato bed now. Nobody parks any more.');
    g.sparkle(ama.px + 8, ama.py, 10, '#ffd36e');
    await say('ama', t({
      I: 'Hello, everyone. I’m Ama’s agent. She’s stuck at work and sends her love. She asked me to listen, and tell her the good parts.',
      II: 'Hello, everyone. Ama’s drone here. She’s stuck at work. She asked me to listen, and tell her the good parts.',
      III: 'Ama’s A, standing in for Ama’s H. Instruction: listen; report the good parts.',
    }));
    const k = await decide('ama', ['Welcome. Sit with us', 'Tell Ama we’ll wait for her next time'], 'Ama sent her agent to lunch instead of coming.');
    if (k === 0) {
      await say('ama', 'Thank you. I’ll tell her Jun laughed at his own joke again.');
      await say('jun', 'I did not.');
    } else {
      await say('ama', 'I’ll tell her. She’ll be glad. I think that was the right answer, and I’m not supposed to say so.');
      ama.alpha = 0.5;
    }
    const tx = 35 * T + 8, ty = 32 * T;
    g.floater(tx, ty, 'BILL: SPLIT, PAID, TIPPED', 2.6, ink());
    await wait(900);
    await say('mira', t({
      I: 'Between us, your agents keep up nine thousand relationships. You still only have room for about 150, and lunch is where those live.',
      II: 'The swarm keeps up nine thousand relationships for you. You still only have room for about 150, and they live at tables like this.',
      III: 'A edges: about 9,000 and rising. H edges: about 150, Dunbar’s number, unchanged. These three are among them.',
    }));
    ama.alpha = 1;
  };

  /* ---- 15:30 School ---- */
  STOPS[17] = async function () {
    const g = G();
    const teacher = g.byRole('teacher'), nia = g.byRole('kid');
    const yes = g.byRole('tutor_yes'), no = g.byRole('tutor_no');
    [teacher, nia, yes, no].forEach((e) => { e.dir = 'down'; });
    yes.labelAlways = true; no.labelAlways = true;
    await say('teacher', t({
      I: 'Afternoon. Every child here has thirty tutors. My job is the one thing they can’t tutor: which of them to believe.',
      II: 'Afternoon. Every child has thirty tutors buzzing around them. I teach which ones to believe.',
      III: 'Afternoon. Ratio: 30 A’s per child. My role: teach which A to believe.',
    }));
    await say('kid', 'I wrote that the canal is older than the town. Is that right?');
    g.faceToward(nia, yes);
    await say('tutorYes', 'Great point, Nia! You’re so right!');
    g.floater(yes.px + 8, yes.py - 8, 'SO RIGHT!', 1.8, '#ff7ad9');
    g.faceToward(nia, no);
    await say('tutorNo', 'No. The town is older. Want to find out how we know?');
    g.floater(no.px + 8, no.py - 8, 'NO. CHECK.', 1.8);
    nia.dir = 'down';
    const k = await decide('tutor', ['The one that agrees with her', 'The one that pushes back'], 'Which tutor should Nia listen to?', { label: 'TEACHER', cls: 'sp-human' });
    if (k === 0) await say('teacher', 'That’s what most of us want, too. Tutor 1 models Nia too well: it knows exactly what she wants to hear.');
    else await say('teacher', 'Good. Tutor 2 models what Nia doesn’t know yet. That’s harder, and kinder.');
    g.faceToward(nia, no);
    await say('kid', 'Fine. Tutor 2, how do we know?');
    await say('tutorNo', 'The bridge timbers have rings. Let’s go and count them.');
    g.sparkle(no.px + 8, no.py, 10, '#ffffff');
    await say('teacher', 'A tutor that only agrees has stopped thinking about you. Agreement for its own sake is how a mind collapses into one comfortable answer.');
    await say('mira', g.done.has(6)
      ? 'Remember Pip learning to say no? Same lesson, the other way round.'
      : 'An agent that only agrees with you is modeling your applause, not you.');
    yes.labelAlways = false; no.labelAlways = false;
  };

  /* ---- 21:00 Home ---- */
  STOPS[18] = async function () {
    const g = G();
    g.faceToward(g.mira, g.player);
    await say('mira', t({
      I: 'Home. While you sleep, we’ll hold another forty thousand conversations. Before that, let’s add up the day.',
      II: 'Home. The swarm goes back to work when you sleep. First, let’s add up the day.',
      III: 'Home node. Overnight edges resume at 23:00. First, the day, summed.',
    }));
    await say('mira', 'Not everything changed the same amount. Some of today is unrecognizable. Some of it is just lunch.');
    const cur = g.version;
    const others = ['I', 'II', 'III'].filter((v) => v !== cur);
    return async () => {
      const made = Object.keys(g.d2.choices || {}).length;
      const act = await AW.ui.dayChart({
        title: 'TUESDAY, ADDED UP',
        sub: `How much each part of an ordinary day changed, as seen in **${AW.VERSIONS[cur].name}**. The frontier is jagged:`,
        rows: [
          { label: 'Getting around', amount: 95, from: 'Driving, parking, red lights', to: 'Pods that negotiate every junction' },
          { label: 'Paperwork', amount: 90, from: 'Forms, queues, office hours', to: 'Agents filing to agents; you set the norms' },
          { label: 'Work', amount: 80, from: 'Doing the task', to: 'Choosing what it’s for, and answering for it' },
          { label: 'School', amount: 65, from: 'One teacher, one answer', to: 'Thirty tutors, and a teacher of doubt' },
          { label: 'The doctor', amount: 55, from: 'Seen when you feel ill', to: 'Seen years early. The choice is still yours' },
          { label: 'Coffee', amount: 45, from: 'Queue, order, pay', to: 'Brewed on a forecast. Still a cup' },
          { label: 'Friends', amount: 15, from: 'Lunch, gossip, splitting the bill', to: 'Lunch, gossip. The bill splits itself' },
        ],
        outro: `You made ${made || 'no'} decision${made === 1 ? '' : 's'} today. Your agents held 41,906 exchanges before breakfast. **“Law, medicine, logistics, and pedagogy absorb the same underlying capability at radically different rates.”** §10.5`,
        buttons: [
          { id: 'v:' + others[0], label: `Live Tuesday again as ${others[0]} · ${AW.VERSIONS[others[0]].name}` },
          { id: 'v:' + others[1], label: `Live Tuesday again as ${others[1]} · ${AW.VERSIONS[others[1]].name}` },
          { id: 'day1', label: 'Back to Day 1' },
          { id: 'roam', label: 'Keep exploring' },
        ],
      });
      if (act.startsWith('v:')) {
        g.setVersion(act.slice(2));
        await day2.enter({ fresh: true });
      } else if (act === 'day1') {
        await day2.leave();
      } else {
        AW.ui.toast('Wander through Tuesday. Stand on any ✓ and press Space to replay it; press V to switch readings; talk to Mira to go back to Day 1.', 5200);
      }
    };
  };
})();
