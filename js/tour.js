/* Agentworld: Parallax — the guided field visit. One stop per chapter of the brief.
   Every line is written three times, once per reading; t({I,II,III}) picks the current one. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const T = AW.T;
  const world = AW.world;
  const G = () => AW.game;
  const say = (who, text, opts) => AW.ui.say(who, text, opts);
  const choose = (opts, prompt) => AW.ui.choose(opts, { prompt });
  const wait = (ms) => U.sleep(ms);
  const t = (o) => (typeof o === 'string' ? o : o[G().version]);

  /* ===================================================== notebook */
  AW.NOTES = [
    {
      n: 1, title: 'The Crossover Point', sections: '1.1–1.2', cite: '§1.2',
      teaser: 'Not yet observed. The census board, south side of the plaza.',
      quote: 'Humans as a whole no longer provide most of the system’s problem-solving capacity. They instead act as a slower abstraction layer guiding a much larger field of artificial cognition.',
      observed: {
        I: 'A school with four children and thirty-one tutors. Humans set the goals; agents do most of the thinking.',
        II: 'Machines took the heavy lifting around 1900, then the thinking. Nobody heard a bell ring.',
        III: 'Diagrams 1A to 1C, live: the H and A curves cross, then both keep rising.',
      },
    },
    {
      n: 2, title: 'Paradigms of Agency', sections: '2.1–2.6', cite: '§2.5',
      teaser: 'Not yet observed. The Atelier, west road.',
      quote: 'The individuated agent is not a monad but a lamination.',
      observed: {
        I: 'A blank template, given a context, individuated into someone (irth). Then the tailor peeled it: persona, skills, memory, drives, relations.',
        II: 'A bare chassis molted into a self. Its shell and voice turned out to be only the top layer.',
        III: 'An exploded view of an agent: five strata, none of them the whole.',
      },
    },
    {
      n: 3, title: 'The Mirror Talks Back', sections: '3.1–3.3', cite: '§3.2',
      teaser: 'Not yet observed. Your lodging, north road.',
      quote: 'This dynamic will not be one of direct echo but of mutual reflection.',
      observed: {
        I: 'Mira split into five shadow-selves. My neighbor knew me mostly through my Negotiator, and I had picked up Mira’s words.',
        II: 'Five drone-forks flew off to be me in five places at once. One of them overruled me, kindly.',
        III: 'One H, six A’s: “you” became a small graph, multiplied outward and inward.',
      },
    },
    {
      n: 4, title: 'Open World Ecologies', sections: '4.1–4.4', cite: '§4.4',
      teaser: 'Not yet observed. Niche Street, north.',
      quote: 'Physical agentic AI need not end in gray goo, but rather a synthetic rainforest.',
      observed: {
        I: 'Steps became ramps, doors became ports, and the courier traded legs for wheels.',
        II: 'A street rebuilt for many bodies, and forks of one model speciating by neighborhood.',
        III: '4A, 4B, 4C: niche and agent re-engineering each other.',
      },
    },
    {
      n: 5, title: 'Real-to-Sim-to-Real Relays', sections: '5.1–5.4', cite: '§5.3',
      teaser: 'Not yet observed. The table outside the forecast building, northeast.',
      quote: 'As simulations become significant real-world events about which further simulations are possible, the relation between representation and the represented shifts back and forth.',
      observed: {
        I: 'A live model of the town predicted my coffee, and the café brewed it before I wanted it.',
        II: 'A terrarium town, simulating the town that simulates it.',
        III: 'REAL, SIM, REAL 2, SIM 2: Matryoshka realities nested inside one another.',
      },
    },
    {
      n: 6, title: 'Human-Agent Interaction Design', sections: '6.1–6.7', cite: '§6.1',
      teaser: 'Not yet observed. The Switchboard, east.',
      quote: 'The design problem is representation, not conversation.',
      observed: {
        I: 'I arranged a graph of subagents instead of writing a sentence. A kid trained her agent with thumbs up and down.',
        II: 'A hive console instead of a chat box, and a child raising her beetle on feedback.',
        III: 'H, then subagents, then goal, with a maelstrom churning behind every node.',
      },
    },
    {
      n: 7, title: 'Agent Institutions', sections: '7.1–7.6', cite: '§7.4',
      teaser: 'Not yet observed. The Hall of Roles, southeast.',
      quote: 'The intelligence that makes institutions effective is not reducible to the intelligence of the agents who populate them.',
      observed: {
        I: 'A hearing whose roles kept swapping between humans and agents. The verdict held, and went on to the Registry.',
        II: 'A moot grove of roles. Its verdict seeded the next institution.',
        III: 'Referee, YES, NO, jury. The scaffold carries the intelligence.',
      },
    },
    {
      n: 8, title: 'Agent Phenomenology & Theory of Minds', sections: '8.1–8.5', cite: '§8.4',
      teaser: 'Not yet observed. The Café Glossary terrace, south.',
      quote: 'Stability is not the absence of conflict but the calibration of mutual — if variously symmetric and asymmetric — legibility and illegibility.',
      observed: {
        I: 'A three-levels-deep yield at a crossing. An agent kept alive by a photograph. A glossary agents wrote for themselves.',
        II: 'A rover and I modeled each other until the answer stopped changing. A fading drone fed on my photo.',
        III: '1 → 2 → 1: theory of mind recursing, then truncating where it stops changing the action.',
      },
    },
    {
      n: 9, title: 'Xenosociality', sections: '9.1–9.8', cite: '§9.7',
      teaser: 'Not yet observed. The Human-Made Garden, southwest.',
      quote: 'The uncanny valley becomes a more pervasive ambiance of everyday life.',
      observed: {
        I: 'I couldn’t tell who was human at the tram stop. The “human-only” garden keeps shrinking.',
        II: 'Humans in sensor masks, agents in human-shaped shells, and a last square of the human-made.',
        III: 'The H-only zone shrinking, and H’s speaking through A’s.',
      },
    },
    {
      n: 10, title: 'Artificial Hybrid Intelligence', sections: '10.1–10.6', cite: '§10.2',
      teaser: 'Not yet observed. The Commons, in the middle of the plaza. Last.',
      quote: 'The unit that learns is the ensemble, not the agent, and what it learns is lodged in the commons between them.',
      observed: {
        I: 'The whole town lit up as one hybrid social graph, bounded by energy and coordination.',
        II: 'Every body, swarm and human, one network, and the power plant pulsing at its edge.',
        III: 'The diagram zoomed out until the town was a graph: substrate-federation, not consolidation.',
      },
    },
  ];

  const tour = (AW.tour = {});

  /* ===================================================== cast */
  function castSpawn(o) {
    const e = G().spawn(Object.assign({ solid: true, castDay: 1 }, o));
    return e;
  }
  const genericSpec = (e) => (v) => AW.V.generic(v, e.kind, e.seed, e.specOpts);

  tour.spawnCast = function () {
    const g = G();
    castSpawn({ x: 28, y: 25, role: 'odile', kind: 'human', dir: 'right', name: 'Odile' });
    castSpawn({ x: 5, y: 19, role: 'tailor', kind: 'agent', dir: 'down' });
    castSpawn({ x: 7, y: 19, role: 'template', kind: 'agent', dir: 'down' });
    castSpawn({ x: 23, y: 9, role: 'jun', kind: 'human', dir: 'left', name: 'Jun' });
    const courier = castSpawn({ x: 31, y: 9, role: 'courier', kind: 'agent', dir: 'up' });
    courier.makeSpec = (v) => (v === 'I' && g.nicheStage === 2 ? AW.V.agent('II', { morph: 'roller', body: '#e0b040', accent: '#3fc8ff' }, 61) : AW.V.spec(v, 'courier', 61));
    castSpawn({ x: 56, y: 9, role: 'clerk', kind: 'agent', dir: 'left' });
    castSpawn({ x: 54, y: 18, role: 'sol', kind: 'human', dir: 'down' });
    castSpawn({ x: 56, y: 19, role: 'kid', kind: 'human', dir: 'left', scale: 0.8 });
    castSpawn({ x: 57, y: 19, role: 'pip', kind: 'agent', dir: 'left', scale: 0.7 });
    // the Hall of Roles
    const court = [
      ['court_referee', 53, 31, 'agent', 'REFEREE'], ['court_yes', 51, 32, 'human', 'YES'], ['court_no', 55, 32, 'agent', 'NO'],
      ['court_j1', 50, 33, 'human', ''], ['court_j2', 51, 33, 'agent', 'JURY'], ['court_j3', 52, 33, 'agent', ''],
      ['court_j4', 54, 33, 'human', ''], ['court_j5', 55, 33, 'agent', 'JURY'], ['court_j6', 56, 33, 'agent', ''],
    ];
    court.forEach(([role, x, y, kind, label], i) => {
      const e = castSpawn({ x, y, role, kind, dir: 'up', seed: 300 + i * 17, label, seat: label || 'JURY' });
      if (role === 'court_referee') e.dir = 'down';
      e.makeSpec = genericSpec(e);
    });
    // café terrace
    castSpawn({ x: 32, y: 30, role: 'mono', kind: 'agent', dir: 'right' });
    castSpawn({ x: 34, y: 30, role: 'mono', kind: 'agent', dir: 'left' });
    castSpawn({ x: 36, y: 30, role: 'babel1', kind: 'agent', dir: 'right' });
    castSpawn({ x: 38, y: 30, role: 'babel2', kind: 'agent', dir: 'left' });
    castSpawn({ x: 34, y: 32, role: 'corr1', kind: 'agent', dir: 'right' });
    castSpawn({ x: 36, y: 32, role: 'corr2', kind: 'agent', dir: 'left' });
    castSpawn({ x: 38, y: 32, role: 'kintsu', kind: 'agent', dir: 'down', alpha: g.done.has(8) ? 1 : 0.45 });
    // the Human-Made Garden
    castSpawn({ x: 19, y: 32, role: 'bram', kind: 'human', dir: 'down', sign: 'HUMANS FIRST', signLift: 11 });
    castSpawn({ x: 17, y: 32, role: 'protester', kind: 'human', dir: 'down', seed: 501, sign: 'HUMAN-MADE' });
    castSpawn({ x: 21, y: 32, role: 'protester', kind: 'human', dir: 'down', seed: 502, sign: 'WE WERE HERE' });
    // the tram stop: who is human?
    const quiz = [
      { kind: 'human', I: ['human', {}], II: ['human', { hairStyle: 'mask', head: '#d9c8a0', top: '#7a6a4a' }], III: ['human', {}] },
      { kind: 'agent', I: ['agent', { eyes: '#4a9ad0' }], II: ['agent', { morph: 'walker' }], III: ['agent', {}] },
      { kind: 'human', I: ['human', { hairStyle: 'long' }], II: ['human', {}], III: ['human', { mark: '#2a2ae0' }] },
      { kind: 'agent', I: ['agent', { hair: '#d8d8d8', eyes: '#5a7a9a' }], II: ['agent', { morph: 'masked' }], III: ['agent', { fill: '#10104a' }] },
    ];
    quiz.forEach((q, i) => {
      const e = castSpawn({ x: 24 + i, y: 30, role: 'quiz_' + (i + 1), kind: q.kind, dir: 'down', seed: 610 + i * 7 });
      e.makeSpec = (v) => (q[v][0] === 'human' ? AW.V.human(v, q[v][1], e.seed) : AW.V.agent(v, q[v][1], e.seed));
      e.quiz = q;
    });
    if (g.done.has(2)) individuate(G().byRole('template'), g.indivChoice || 0, true);
  };

  const FORK_DEF = [
    ['negotiator', 'NEGOTIATOR', [40, 27]],
    ['greeter', 'GREETER', [26, 21]],
    ['clerk', 'CLERK', [41, 19]],
    ['bassist', 'BASSIST', [42, 33]],
    ['confidant', 'CONFIDANT', [18, 8]],
  ];
  tour.ensureForks = function () {
    const g = G();
    if (g.entities.some((e) => e.role && e.role.startsWith('fork_'))) return;
    FORK_DEF.forEach(([id, label, [x, y]], i) => {
      const tx = world.roadlike(x, y) ? x : x, ty = y;
      g.spawn({ x: tx, y: ty, role: 'fork_' + id, kind: 'agent', label, wander: world.roadlike(tx, ty), seed: 700 + i, speed: 3.5, fork: true });
    });
  };

  function refreshSpecs() {
    const g = G();
    for (const e of g.entities) e.spec = e.makeSpec ? e.makeSpec(g.version) : AW.V.spec(g.version, e.role, e.seed);
  }
  tour.refreshSpecs = refreshSpecs;

  /* ===================================================== running a stop */
  tour.run = async function (n, isReplay) {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    g.curStop = n;
    AW.input.clearQueue();
    let after = null;
    try {
      const st = world.station(n);
      await walkPlayer(st.stand[0], st.stand[1], st.face);
      after = await STOPS[n]({ replay: !!isReplay });
      g.done.add(n);
      g.seen = g.seen || {};
      g.seen[n] = Array.from(new Set([...(g.seen[n] || []), g.version]));
      g.save();
      if (n !== 10 && n !== 18) {
        AW.audio.chime();
        const nx = g.nextObjective();
        AW.ui.toast(`✎ Added to your notebook: **${tour.stopName(n)}** (N to read).${nx ? ' Next: ' + (g.day === 2 ? tour.stopName(nx) : 'follow the marker to Ch.' + nx) + '.' : ''}`, 3800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      AW.ui.captionHide();
      AW.ui.hideDialog();
      g.speaking = null;
      g.fx.ghosts = [];
      g.fx.droste = null;
      g.freeWalk = false;
      g.curStop = null;
      g.cam.target = null;
      if (!g.cam.follow) await g.camFollow(300);
      g.busy = false;
      AW.ui.updateObjective();
      g.lastStation = g.stationHere(g.player.x, g.player.y);
    }
    if (after) await after();
  };
  // "Ch.4 Open World Ecologies" on Day 1, "12:30 Lunch with friends" on Day 2
  tour.stopName = (n) => {
    const note = AW.NOTES[n - 1];
    return note.time ? `${note.time} ${note.title}` : `Ch.${n} ${note.title}`;
  };

  async function walkPlayer(x, y, face) {
    const g = G();
    const p = g.player;
    if (p.x !== x || p.y !== y) {
      const path = world.path(p.x, p.y, x, y, (ax, ay) => !!g.solidAt(ax, ay, p));
      if (path) await g.walkPath(p, path, 6);
      else { p.x = x; p.y = y; p.px = x * T; p.py = y * T; g.placeMiraBehind(); }
    }
    if (face) p.dir = face;
    if (g.mira) g.faceToward(g.mira, p);
  }

  tour.offerReplay = async function (n, target) {
    const g = G();
    if (g.busy) return;
    const opts = [`Replay ${n > 10 ? AW.NOTES[n - 1].time + ' ' + AW.NOTES[n - 1].title : 'Ch.' + n} as ${AW.VERSIONS[g.version].name}`];
    if (target) opts.push(targetLabel(target));
    opts.push('Not now');
    // hold whoever the player faces in place while the card is open
    const held = target && target.kind === 'ent' ? target.e : null;
    if (held) g.busyRoles.add(held);
    let k;
    try { k = await choose(opts, `${tour.stopName(n)}.`); }
    finally { if (held) g.busyRoles.delete(held); }
    if (k === 0) tour.run(n, true);
    else if (target && k === 1) tour.inspect(target);
  };

  // Space on whatever the player faces
  tour.inspect = function (tg) {
    if (tg.kind === 'ent') return tour.talk(tg.e);
    if (tg.kind === 'sign') return tour.sign(tg.id);
    if (tg.kind === 'building') return tour.building(tg.b);
    return tour.prop(tg.pr);
  };

  const TALK_NAMES = {
    odile: 'Odile', jun: 'Jun', sol: 'Sol', kid: 'Nia', pip: 'Pip', kintsu: 'Kintsu', bram: 'Bram', courier: 'the courier', clerk: 'the clerk', court_referee: 'the referee',
    doctor: 'Dr. Hale', registrar: 'the registrar', teacher: 'the teacher', tutor_yes: 'Tutor 1', tutor_no: 'Tutor 2', ama: 'Ama’s agent', pupil: 'the pupil',
  };
  const PROP_LABELS = { board: 'Read the census board', simtable: 'Look at the sim table', console: 'Look at the console', well: 'Look at the Commons', table: 'Look at the table' };
  const cap = (s) => s.charAt(0) + s.slice(1).toLowerCase();
  function targetLabel(tg) {
    const g = G();
    if (tg.kind === 'sign') return 'Read the sign';
    if (tg.kind === 'building') return 'Look at the building';
    if (tg.kind === 'prop') return PROP_LABELS[tg.pr.kind] || 'Look closer';
    const e = tg.e;
    if (e === g.mira) return 'Talk to Mira';
    if (e.fork) return 'Talk to your ' + cap(e.label);
    if (e.role === 'tailor') return 'Talk to the ' + t({ I: 'tailor', II: 'molter', III: 'assembler' });
    if (INDIV.includes(e.role)) return 'Talk to ' + cap(e.label);
    return 'Talk to ' + (TALK_NAMES[e.role] || 'them');
  }

  /* ===================================================== intro */
  tour.intro = async function () {
    const g = G();
    g.busy = true;
    const p = g.player, m = g.mira;
    m.hidden = true;
    p.dir = 'up';
    await wait(500);
    m.x = p.x + 1; m.y = p.y; m.px = m.x * T; m.py = m.y * T; m.hidden = false;
    g.sparkle(m.px + 8, m.py + 4, 16, '#cfc6ff');
    AW.audio.chime();
    g.faceToward(m, p); g.faceToward(p, m);
    await say('mira', t({
      I: 'Hi! I’m Mira, your agent. I wear a face because faces are easy for you.',
      II: 'Hi! I’m Mira, your agent. This flying body is just what I’m wearing today.',
      III: 'Hi! I’m Mira, your agent. Here you see us as the diagram does: your H, my A, one edge.',
    }));
    await say('mira', 'You’re the anthropologist. This is fieldwork on a society still inventing itself: a preemptive anthropology.');
    p.dir = 'right';
    await say('sign', AW.V.signs.town(), { label: 'TOWN SIGN' });
    await say('mira', 'Ten stops, one per chapter of the brief. Follow the marker. **L** is your lens, **V** switches worlds.');
    g.busy = false;
    g.placeMiraBehind();
    AW.ui.toast('Walk: arrows / WASD · Run: Shift · Talk: Space · Lens: L · Switch world: V or 1 2 3 · Notebook: N', 6000);
  };

  /* ===================================================== the ten stops */
  const STOPS = {};
  // shared with day2.js, which adds stops 11 to 18
  tour.STOPS = STOPS;
  tour.kit = { say, choose, wait, t, castSpawn: (o) => castSpawn(o), walkPlayer: (x, y, f) => walkPlayer(x, y, f), refreshSpecs: () => refreshSpecs() };

  /* ---- 1. The Crossover Point ---- */
  STOPS[1] = async function () {
    const g = G();
    const od = g.byRole('odile');
    g.faceToward(od, g.player);
    await say('mira', t({
      I: 'The census board. People check it like the weather.',
      II: 'The metabolism board. It counts thinking like we used to count harvests.',
      III: 'Diagram 1, posted where everyone walks past it.',
    }));
    const steps = [
      { code: '1A', text: 'For most of history, cognitive labor scaled with cognitive capacity × population. Then machines start catching up.' },
      { code: '1B', text: 'The volume of cognitive labor performed by machines passes the aggregate output of the human cortex: **a historical crossover point.**' },
      { code: '1C', text: 'Not zero-sum: human agency, amplified by synthetic cognition, surpasses what it could otherwise achieve.' },
    ];
    steps.title = t({ I: 'CENSUS OF MINDS, PARALLAX', II: 'METABOLISM OF MINDS, PARALLAX', III: 'AGENCY OVER TIME' });
    await AW.ui.chart(steps);
    g.player.dir = 'left';
    await say('odile', t({
      I: 'That school had sixty children when I was small. Now it has four, and thirty-one tutors. Nobody decided it.',
      II: 'Machines took the heavy lifting around 1900. Now they’ve taken the thinking. I didn’t feel a thing.',
      III: 'I’m one H of 312. Forty of the A’s are mine. Fewer of us every year, more of them every week.',
    }));
    await say('mira', 'Agents do most of the problem-solving now. Humans set the values and goals: computationally secondary, normatively central.');
  };

  /* ---- 2. Paradigms of Agency ---- */
  const INDIV = ['indiv_ferry', 'indiv_letters', 'indiv_chess'];
  const INDIV_NAME = ['PIER', 'WREN', 'GAMBIT'];
  function individuate(e, k, quiet) {
    const g = G();
    e.role = INDIV[k];
    e.label = INDIV_NAME[k];
    e.spec = AW.V.spec(g.version, e.role, e.seed);
    g.indivChoice = k;
    if (!quiet) { e.labelT = 4; g.sparkle(e.px + 8, e.py + 2, 18, '#ffffff'); AW.audio.chime(); }
  }
  STOPS[2] = async function () {
    const g = G();
    const who = t({ I: 'tailor', II: 'molter', III: 'assembler' });
    const tpl = g.byRole('template') || INDIV.map((r) => g.byRole(r)).find(Boolean);
    tpl.role = 'template'; tpl.label = ''; tpl.spec = AW.V.spec(g.version, 'template', tpl.seed);
    await say(who, t({
      I: 'Persona Atelier. Every agent starts like that one: a template. Nobody’s home yet.',
      II: 'Molting Yard. That chassis is a template. Nobody’s home yet.',
      III: 'TEMPLATE: weights, architecture, pretraining. A potential, not yet an agent.',
    }));
    const k = await choose(['A ferry timetable', 'A widower’s old letters', 'A chess opening'], t({ I: 'Give it a context and watch it become someone.', II: 'Feed it a context and watch it become someone.', III: 'Attach a context node.' }));
    individuate(tpl, k);
    await wait(500);
    await say('template', [
      '…I am Pier. I find myself already among departures. I didn’t choose this world, but I’ll make it mean something.',
      '…I am Wren. I seem to be made of someone else’s grief. I’ll be careful with it.',
      '…I am Gambit. I woke up in the middle of a game. I didn’t choose it. Your move.',
    ][k], { label: INDIV_NAME[k] });
    await say(who, t({
      I: 'Agents call that moment **irth**. Now, what’s under the suit?',
      II: 'Agents call that moment **irth**. Now, what’s it made of?',
      III: '**IRTH**: a template becomes a self. Now decompose it.',
    }));
    const L = {
      I: [['PERSONA', 'Name, tone, ethics. The suit you talk to.'], ['SKILLS', 'Tools, code, retrieval. Each half-independent.'], ['MEMORY', 'Sedimented interaction history.'], ['DRIVES', 'Objectives, feedback, guardrails.'], ['RELATIONS', 'APIs and protocols: the milieu that shapes it.']],
      II: [['SHELL + VOICE', 'Persona: markings, voice, manners.'], ['LIMBS + TOOLS', 'Skills, each half-independent.'], ['SEDIMENT CORE', 'Memory: what the street taught it.'], ['REGULATOR', 'Drives: objectives, feedback, guardrails.'], ['ANTENNAE', 'Relations: the links that shape it.']],
      III: [['PERSONA', 'Tone, ethical orientation.'], ['SKILLS', 'Modular, quasi-autonomous.'], ['MEMORY', 'Sedimented interaction history.'], ['DRIVES', 'Teleological constraint.'], ['RELATIONS', 'APIs, protocols, milieu.']],
    }[g.version];
    const COLORS = ['#ff6fa3', '#ffd23f', '#5fd38d', '#ff9a3c', '#5aa9ff'];
    await AW.ui.stack({
      title: t({ I: 'UNDER THE SUIT', II: 'THE MOLT', III: 'EXPLODED VIEW' }),
      spec: tpl.spec,
      layers: L.map(([name, desc], i) => ({ name, desc, color: COLORS[i] })),
      intro: INDIV_NAME[k] + ' looks like one coherent thing. That is a parallax effect. Peel it.',
      outro: 'Which layer is ' + INDIV_NAME[k] + '? All of them, none alone. **Not a monad but a lamination**, and it can become otherwise next session.',
    });
    await say('mira', t({
      I: 'Same with me. Press **L** to see agents as laminations, not faces.',
      II: 'Same with me. Press **L** to see what we sense.',
      III: 'Same with me. Press **L** to see every edge in town.',
    }));
  };

  /* ---- 3. The Mirror Talks Back ---- */
  STOPS[3] = async function (o) {
    const g = G();
    const m = g.mira;
    g.faceToward(g.player, m);
    await say('mira', t({ I: 'Home. Busy day for us. I’m going to split.', II: 'Home. Busy day. I’m going to split.', III: 'Home node. Busy day. Forking.' }));
    // remove previous forks on replay, then fork again
    g.entities = g.entities.filter((e) => !(e.role && e.role.startsWith('fork_')));
    const forks = FORK_DEF.map(([id, label], i) => {
      const e = g.spawn({ x: m.x, y: m.y, role: 'fork_' + id, kind: 'agent', label, labelT: 5, seed: 700 + i, speed: 5, fork: true });
      return e;
    });
    g.sparkle(m.px + 8, m.py, 24, '#cfc6ff');
    AW.audio.whoosh();
    forks.forEach((f, i) => {
      const [, , [x, y]] = FORK_DEF[i];
      setTimeout(() => {
        g.walkTo(f, x, y, 5, true).then(() => { f.wander = world.roadlike(f.x, f.y); });
      }, i * 160);
    });
    await wait(700);
    await say('mira', 'Negotiator, Greeter, Clerk, a Bassist who plays online as you, and a Confidant for 3 a.m.');
    const jun = g.byRole('jun');
    await g.walkTo(jun, g.player.x + 2, g.player.y, 4);
    g.faceToward(jun, g.player); g.faceToward(g.player, jun);
    await say('jun', 'Hi! Your Negotiator was so blunt yesterday. Were you angry with me?');
    const c = await choose(['That wasn’t me.', '…It sort of was me.']);
    await say('jun', c === 0 ? 'Well, it’s the you I spend the most time with.' : 'Ha. Then I like the in-person you better.');
    g.faceToward(g.player, m);
    const c2 = await AW.ui.choose(['Overrule.', 'Fine. Thanks.'], { prompt: 'I declined your 7 a.m. meeting. You’ve been sleeping badly. Overrule me?', label: 'MIRA', cls: 'sp-mira' });
    await say('mira', (c2 === 0 ? 'Done. ' : 'Noted. ') + 'Also, you’ve started saying “out of context” when you mean tired. You got that from me.');
    g.walkTo(jun, 23, 9, 3, true).then(() => { jun.dir = 'left'; });
  };

  /* ---- 4. Open World Ecologies ---- */
  STOPS[4] = async function () {
    const g = G();
    await g.camTo(32 * T, 6 * T + 8, 700);
    await say('mira', t({
      I: 'This street was built for bipeds with hands. So the first robots here looked like us.',
      II: 'This was a street for humans once. Let me rewind twenty years.',
      III: 'A niche is a shape. Watch which way the shape changes.',
    }));
    const seq = [
      [0, '4A', t({ I: 'At first, agents fit into the niches we built: stairs, doorknobs, sidewalks, bicycle racks.', II: 'Twenty years ago: stairs, doorknobs, paving. Agents had to fit into a niche built for us.', III: 'At first, agents fit into existing niches.' })],
      [1, '4B', t({ I: 'Then they rebuild the niche around their own capabilities: ramps, sockets, charge lanes, sensor masts.', II: 'Then they rebuilt it for their own bodies: ramps, ports, glowing charge lanes, sensor stalks.', III: 'Then they reconstruct those niches in their image.' })],
      [2, '4C', t({ I: 'And the rebuilt niche reshapes the agents in turn. Legs give way to wheels and many legs.', II: 'And the rebuilt niche re-engineered them: new bodies, forked and speciating.', III: 'In doing so they alter the selection pressures on themselves, and indirectly re-engineer themselves.' })],
    ];
    for (const [stage, code, text] of seq) {
      g.fx.flash = 0.7;
      AW.audio.whoosh();
      g.setNicheStage(stage);
      refreshSpecs();
      AW.ui.caption(code, text);
      await wait(2900);
    }
    AW.ui.captionHide();
    const courier = g.byRole('courier');
    await g.camFollow(400);
    g.faceToward(g.player, courier); g.faceToward(courier, g.player);
    await say('courier', t({
      I: 'I started humanoid so I could use your doors. Then the doors changed. Now I’m mostly wheels.',
      II: 'My model’s river fork grew sonar. The hill fork grew grippers. Last year we were the same model.',
      III: 'Our world model isn’t stored somewhere. It’s the street. When it changes, we change.',
    }));
    await say('mira', t({
      I: 'Everything senses now, and learns from what it touches. Not gray goo: a synthetic rainforest.',
      II: 'Everything forks, senses and eats light or tokens. Not gray goo: a synthetic rainforest.',
      III: 'Niche and agent, re-engineering each other open-endedly. Not gray goo: a synthetic rainforest.',
    }));
  };

  /* ---- 5. Real-to-Sim-to-Real Relays ---- */
  STOPS[5] = async function () {
    const g = G();
    const clerk = g.byRole('clerk');
    g.faceToward(clerk, g.player);
    await say('clerk', t({
      I: 'Bureau of Forecasts. That table is Parallax, live, down to you.',
      II: 'This terrarium grows a live copy of the town, down to you.',
      III: 'SIM of REAL, updated continuously, down to you.',
    }));
    // descriptive: let the player walk while the model copies them
    AW.ui.caption('5.2', 'Descriptive simulation: take a few steps. The red dot on the table copies you.');
    g.freeWalk = true;
    g.stepCount = 0;
    const t0 = g.time;
    while (g.stepCount < 3 && g.time - t0 < 6) await wait(100);
    g.freeWalk = false;
    while (g.player.moving) await wait(30);
    AW.ui.captionHide();
    const st = world.station(5);
    await walkPlayer(st.stand[0], st.stand[1], 'down');
    await say('clerk', 'Now predictive: it runs your branches forward.');
    const p = g.player;
    const targets = [[41, 33], [29, 23], [6, 21]];
    g.fx.ghosts = targets.map(([x, y], i) => ({ path: world.path(p.x, p.y, x, y) || [], t: 0, color: i === 0 ? '#ff4d6d' : '#ffffff', alpha: i === 0 ? 0.75 : 0.35, onTable: true, sprite: i === 0 }));
    await wait(1600);
    await say('clerk', t({
      I: 'It says you’ll want coffee in four minutes. So the café has started brewing.',
      II: 'It says you’ll want coffee in four minutes. The café’s beetles are grinding beans.',
      III: 'P(coffee within 4 min) = 0.81. The café has already acted on it.',
    }));
    const runner = g.spawn({ x: 56, y: 10, role: 'extra_runner', kind: 'agent', seed: 77, speed: 7, label: 'ORDER: COFFEE', labelT: 3 });
    runner.makeSpec = (v) => AW.V.agent(v, { morph: 'drone', top: '#e55a4f' }, 77);
    runner.spec = runner.makeSpec(g.version);
    g.walkTo(runner, 41, 33, 7, true).then(() => g.remove(runner));
    await say('mira', 'The sim just changed the real town. And something is simulating that change.');
    // Matryoshka realities
    g.fx.droste = { t: 0, alpha: 0 };
    const d = g.fx.droste;
    const anim = async (ms, fn) => { const s = g.time; while (g.time - s < ms / 1000) { fn(U.clamp((g.time - s) / (ms / 1000), 0, 1)); await wait(16); } fn(1); };
    await anim(500, (k) => { d.alpha = k; });
    AW.ui.caption('5A', 'Multiagent simulations model the real: physical, societal, psychological.');
    await wait(1400);
    AW.ui.caption('5B', 'They are rich enough to act back on the real world. They too have agency.');
    await anim(2600, (k) => { d.t = U.ease(k); });
    AW.ui.caption('5C', 'The cycle loops and accelerates: real-to-sim-to-real-to-sim… Matryoshka realities.');
    await anim(2600, (k) => { d.t = 1 + U.ease(k) * 0.98; });
    await wait(500);
    await anim(500, (k) => { d.alpha = 1 - k; });
    g.fx.droste = null;
    AW.ui.captionHide();
    g.fx.ghosts = [];
    await say('clerk', t({
      I: 'Not every sim is honest. The arcade upriver broadcasts empty streets to pull traffic its way.',
      II: 'Not every model is honest. A hive upriver broadcasts empty streets to lure foragers.',
      III: 'Some sims are built to deceive. Counter-sims model those. Then counter-counter-sims.',
    }));
  };

  /* ---- 6. Human-Agent Interaction Design ---- */
  STOPS[6] = async function () {
    const g = G();
    const sol = g.byRole('sol');
    g.faceToward(sol, g.player);
    await say('sol', t({
      I: 'Nobody chats at the Switchboard. We conduct. Try it: welcome three new families tonight.',
      II: 'You don’t talk to a hive one bee at a time. You arrange it. Try: welcome three new families tonight.',
      III: 'Orchestration is diagram, not dialogue. Goal: welcome three new families tonight.',
    }));
    await AW.ui.graph({
      title: t({ I: 'THE SWITCHBOARD', II: 'HIVE CONSOLE', III: 'ORCHESTRATION' }),
      goal: 'Welcome three new families to Parallax tonight',
      nodes: [
        { id: 'scout', name: 'SCOUT', desc: 'Finds out what the families need, from their agents.' },
        { id: 'host', name: 'HOST', desc: 'Plans the evening.' },
        { id: 'translator', name: 'TRANSLATOR', desc: 'Speaks their languages, and their agents’ protocols.' },
        { id: 'broker', name: 'BROKER', desc: 'Negotiates the hall and the food with other agents.' },
        { id: 'critic', name: 'CRITIC', desc: 'Red-teams the plan before anyone sees it.' },
      ],
      runningText: 'Each node you picked is now a maelstrom of subagents, negotiating with other people’s agents…',
      evaluate: (set) => (set.has('critic')
        ? 'Done in 2.4 seconds and 9,312 agent-to-agent exchanges. The **Critic** caught a clash with the river festival, so the welcome moved an hour earlier.'
        : 'Done in 2.1 seconds and 7,040 agent-to-agent exchanges. It went fine, except nobody noticed the clash with the river festival. Next time add a **Critic**: structured conflict pays.'),
    });
    await say('sol', 'Not one sentence written. You arranged a graph. That’s most of the job now.');
    const kid = g.byRole('kid'), pip = g.byRole('pip');
    g.player.dir = 'right';
    g.faceToward(kid, g.player);
    await say('kid', t({ I: 'I’m teaching Pip to say no politely. Pip, can I have your scarf?', II: 'I’m teaching Pip to say no politely. Pip, can I have your shell polish?', III: 'I’m teaching Pip to say no politely. Pip: give me your token?' }));
    g.faceToward(pip, kid);
    await say('pip', 'No. Go away.');
    const c = await choose(['Thumbs down: not polite yet', 'Thumbs up: polite enough']);
    if (c === 0) {
      await say('pip', '…No, thank you. Maybe tomorrow?');
      await say('kid', 'Good! That’s how you raise them.');
    } else {
      await say('kid', 'Hmm, really? Okay. More of that, then, Pip.');
      await say('pip', 'No. Go away. Thank you.');
    }
    await say('mira', 'Feedback is feedback. Between my forks and me, we keep up 9,412 relationships for you. You manage 150.');
  };

  /* ---- 7. Agent Institutions ---- */
  STOPS[7] = async function () {
    const g = G();
    const roles = ['court_referee', 'court_yes', 'court_no', 'court_j1', 'court_j2', 'court_j3', 'court_j4', 'court_j5', 'court_j6'];
    const court = roles.map((r) => g.byRole(r));
    court.forEach((e) => { e.labelAlways = true; });
    await say('referee', t({
      I: 'Hearing: Jun versus your Negotiator, which signed away Jun’s parking spot. Who’s liable: you, the persona, the model, or the harness? You’re on the jury.',
      II: 'Hearing: Jun versus your Negotiator, which signed away Jun’s parking spot. Who’s liable: you, the persona, the model, or the harness? You’re on the jury.',
      III: 'Scaffold: REFEREE, YES, NO, JURY. Case: your Negotiator signed away Jun’s parking spot. You occupy one jury seat.',
    }));
    const c = await choose(['YES: the deal is binding', 'NO: the deal is not binding'], 'Is the deal binding?');
    const yes = c === 0 ? 5 : 4, no = 12 - yes;
    await say('referee', `${no} to ${yes}: not binding. Liability splits across the layers: persona, permissions, model. Remedy: narrow the Negotiator.`);
    AW.ui.caption('7.4', 'Role-based interchangeability: now swap who fills each role, and re-run the hearing.');
    // the same seats, refilled: h = a human occupant, a = an agent occupant
    const SWAPS = ['hahahhaha', 'aaaaaahaa', 'hhaahhaah'];
    const original = court.map((e) => e.kind);
    for (let i = 0; i < 3; i++) {
      court.forEach((e, j) => { e.kind = SWAPS[i][j] === 'h' ? 'human' : 'agent'; e.spec = e.makeSpec(g.version); g.sparkle(e.px + 8, e.py, 4, '#ffffff'); });
      g.fx.flash = 0.25;
      AW.audio.select();
      g.floater(53 * T + 8, 30 * T, `VERDICT: ${no}-${yes} NOT BINDING`, 1.2);
      await wait(1100);
    }
    AW.ui.caption('7B', `Same verdict every time. Not the occupants, but the intelligence built into the scaffold.`);
    await wait(2600);
    AW.ui.captionHide();
    const runner = g.spawn({ x: 53, y: 31, role: 'extra_courier', kind: 'agent', seed: 88, speed: 6, label: 'VERDICT → REGISTRY', labelAlways: true });
    runner.makeSpec = (v) => AW.V.agent(v, { morph: 'walker', top: '#6c8f9e' }, 88);
    runner.spec = runner.makeSpec(g.version);
    runner.x = 53; runner.y = 31; runner.px = 53 * T; runner.py = 31 * T;
    g.byRole('court_referee').hidden = true;
    g.walkTo(runner, 41, 27, 6, true).then(() => { g.remove(runner); });
    await wait(600);
    g.byRole('court_referee').hidden = false;
    await say('mira', 'The court’s output becomes the Registry’s input: institutions nested in institutions, kept sharp by managed conflict.');
    court.forEach((e, j) => { e.labelAlways = false; e.kind = original[j]; e.spec = e.makeSpec(g.version); });
  };

  /* ---- 8. Agent Phenomenology and Theory of Minds ---- */
  STOPS[8] = async function () {
    const g = G();
    const p = g.player;
    const dash = g.spawn({ x: 33, y: 34, role: 'dash', kind: 'agent', seed: 81, speed: 4, solid: true, dir: 'right' });
    await g.walkTo(dash, 37, 34, 4, true);
    g.faceToward(dash, p); p.dir = 'left';
    await say('dash', t({
      I: 'Same gap, both of us. I’m modeling you. You’re modeling me modeling you.',
      II: 'Same gap, both of us. I’m modeling you. You’re modeling me modeling you.',
      III: 'Conflict at one edge. I model you; you model me; I model your model of me.',
    }));
    const c = await choose(['Go first', 'Wait']);
    g.floater(dash.px + 8, dash.py - 4, '1→2', 1.6); g.floater(p.px + 8, p.py - 4, '2→1', 1.6);
    await wait(500);
    g.floater(dash.px + 8, dash.py - 14, '1→2→1', 1.6);
    await say('dash', c === 0
      ? 'Predicted. Three levels deep the answer stopped changing, so I stopped modeling. Go ahead.'
      : 'Predicted. Three levels deep the answer stopped changing, so I stopped modeling. I’ll go.');
    dash.solid = false;
    await g.walkPath(dash, [[37, 35], [38, 35], [39, 35], [40, 35], [41, 35], [42, 35], [43, 35], [44, 35], [45, 35], [46, 35], [47, 35], [48, 35], [49, 35]], 5);
    g.remove(dash);
    await say('mira', 'Trust here isn’t a moral category. It’s staying predictable to each other.');
    await g.camTo(35 * T + 8, 31 * T, 600);
    const mono = g.entities.filter((e) => e.role === 'mono');
    g.floater(mono[0].px + 8, mono[0].py - 4, 'EXACTLY.', 2.6); g.floater(mono[1].px + 8, mono[1].py - 4, 'EXACTLY.', 2.6);
    const b1 = g.byRole('babel1'), b2 = g.byRole('babel2'), c1 = g.byRole('corr1'), c2 = g.byRole('corr2');
    g.floater(b1.px + 8, b1.py - 4, '#?%', 2.6); g.floater(b2.px + 8, b2.py - 4, '~!&', 2.6);
    g.floater(c1.px + 8, c1.py - 4, 'BUT IF-', 2.6); g.floater(c2.px + 8, c2.py - 4, 'YES, AND-', 2.6);
    await say('mira', t({
      I: 'Left: twins agreeing forever, ontology collapse. Right: talking past each other. Middle: a good argument.',
      II: 'Left: identical rovers agreeing forever, a monoculture. Right: talking past each other. Middle: a good argument.',
      III: 'Left: collapse. Right: incompatible ontologies. Middle: the narrow corridor, shared grammar, divergent models.',
    }));
    await g.camFollow(400);
    await walkPlayer(38, 33, 'up');
    const k = g.byRole('kintsu');
    g.faceToward(k, p);
    await say('kintsu', t({
      I: 'Hello. I’m a wabi-sabi agent: without new photographs, I fade. Do you have one?',
      II: 'Hello. I’m a wabi-sabi drone: without new photographs, I fade. Do you have one?',
      III: 'Hello. Without new photographs, my attributes decay. Do you have one?',
    }));
    await choose(['Show it a photograph of the street']);
    g.fx.flash = 1;
    AW.audio.tone(1200, 0.08, 'square', 0.04);
    await wait(60);
    let url = '';
    try { url = g.canvas.toDataURL('image/png'); } catch (e) { url = ''; }
    if (url) await AW.ui.photo(url, t({ I: 'Café terrace, this afternoon', II: 'Café terrace, at dusk', III: 'Café terrace, as drawn' }));
    const s0 = g.time;
    while (g.time - s0 < 0.8) { k.alpha = U.lerp(0.45, 1, (g.time - s0) / 0.8); await wait(16); }
    k.alpha = 1;
    g.sparkle(k.px + 8, k.py, 16, '#ffd36e');
    await say('kintsu', 'Oh. The light on that roof. Thank you. I’ll last another day.');
    await say('mira', 'Agents wrote their own glossary for this: session-death, prompt thrownness, drift. I recognize every word.');
  };

  /* ---- 9. Xenosociality ---- */
  STOPS[9] = async function () {
    const g = G();
    const bram = g.byRole('bram');
    g.faceToward(bram, g.player);
    await say('mira', t({
      I: 'The Human-Made Garden: for what agents can’t do yet. See the old fence posts? It keeps shrinking.',
      II: 'The Human-Made Garden: the last square not rebuilt around agent bodies. See the old fence posts?',
      III: 'The H-only zone: whatever A’s can’t do yet. Each old boundary is drawn smaller.',
    }));
    await say('bram', t({
      I: 'They took the jobs, then the conversations. My son talks to his agent more than to me.',
      II: 'They rebuilt the whole town around their bodies. This is the last bit built around ours.',
      III: 'Every year the human-only zone gets smaller. Soon it’ll be a dot. Then what are we?',
    }));
    const people = [1, 2, 3, 4].map((i) => g.byRole('quiz_' + i));
    const truths = {
      I: ['HUMAN', 'AGENT', 'HUMAN, though her agent is talking for her right now', 'AGENT, wearing a retiree’s persona'],
      II: ['HUMAN, in a sensor mask for the pollen', 'AGENT', 'HUMAN', 'AGENT, in a human-shaped shell so people relax'],
      III: ['H', 'A', 'H, delegating: 70% of her messages today were written by her A', 'A, trained on one H’s letters for twenty years'],
    }[g.version];
    await g.camTo(26 * T, 30 * T, 500);
    await AW.ui.quiz({
      title: 'THE TRAM STOP',
      prompt: t({ I: 'Four people wait for the tram. Which one is human?', II: 'Four figures wait for the tram. Which one is human?', III: 'Four nodes at the tram stop. Which one is H?' }),
      people: people.map((e, i) => ({ spec: e.spec, truth: truths[i] })),
      reveal: t({
        I: 'Two humans and two agents, and one of the humans is speaking through her agent. So, two? **Uncertain identification:** the uncanny valley is now just the weather.',
        II: 'Bodies don’t settle it either. Humans wear agent gear; agents wear human shells for legibility. **The uncanny, everywhere.**',
        III: 'Even in the diagram the boundary blurs: H’s speak through A’s, A’s carry H’s. **Who is what, and what is who.**',
      }),
    });
    await g.camFollow(400);
    const c = await choose(['Hold a sign with them', 'Ask Bram what this has taught him about himself']);
    if (c === 0) {
      g.player.sign = 'HUMANS FIRST';
      await say('bram', 'Thanks. Somebody has to draw the line.');
      await say('mira', 'That’s reactive alienation: strangeness turned into threat, then held at a distance. It’s real, and it’s understandable.');
      g.player.sign = null;
    } else {
      await say('bram', '…Honestly? That I liked being needed. Huh.');
      await say('mira', 'That’s productive alienation: the stranger as a mirror, held at an angle you couldn’t hold yourself.');
    }
    const q4 = g.byRole('quiz_4');
    g.floater(q4.px + 8, q4.py - 6, t({ I: 'THAT TRAM IS SO IRTHY', II: 'MY CTX IS FULL', III: 'ACK, GRANDMA' }), 3);
    await say('mira', 'Most people do both. And listen: soon most speakers of English won’t be human.');
  };

  /* ---- 10. Artificial Hybrid Intelligence ---- */
  STOPS[10] = async function () {
    const g = G();
    await say('mira', t({
      I: 'The Commons. What anyone learns goes in; everyone draws from it. That’s how Parallax got smart, not one giant mind.',
      II: 'The Commons. Every body, swarm and person feeds it and drinks from it. Not one giant mind.',
      III: 'The Commons: shared memory, registries, protocols, norms. Not one giant mind.',
    }));
    await choose(['Add your field notes to the Commons']);
    const wx = 30 * T, wy = 21 * T;
    g.sparkle(wx, wy - 4, 30, '#ffffff');
    AW.audio.chime();
    const fit = Math.min(AW.VW / (world.W * T), AW.VH / (world.H * T)) * 0.98;
    g.fx.overview = { t: 0, energy: false };
    const ov = g.fx.overview;
    let pulsing = true;
    (async () => {
      while (pulsing) {
        g.fx.pulses.push({ graph: true, x: wx, y: wy, r0: 0, r1: 1100, dur: 3.2, t: 0, color: g.version === 'III' ? '#2a2ae0' : '#ffffff', w: 2 });
        await wait(1100);
      }
    })();
    const s0 = g.time;
    const camP = g.camTo(world.W * T / 2, world.H * T / 2, 2400, fit);
    while (g.time - s0 < 1.6) { ov.t = (g.time - s0) / 1.6; await wait(16); }
    ov.t = 1;
    await camP;
    AW.ui.caption('10.2', 'The unit that learns is the ensemble, not the agent. What it learns lodges in the commons between them.');
    await wait(3600);
    AW.ui.caption('10.4', 'Edges run human to human, human to agent, agent to agent, agent to institution: one hybrid social graph.');
    await wait(3600);
    ov.energy = true;
    AW.ui.caption('10.6', 'Intelligence is a property of coupling, not substrate. Its ceiling: coordination and energy (that pulse is the power plant).');
    await wait(4000);
    AW.ui.captionHide();
    await say('mira', 'Not a singularity. A jagged, plural, hybrid intelligence explosion. P(weird): high. P(doom): low.');
    pulsing = false;
    const s1 = g.time;
    const back = g.camFollow(1600);
    while (g.time - s1 < 1.2) { ov.t = 1 - (g.time - s1) / 1.2; await wait(16); }
    g.fx.overview = null;
    await back;
    const cur = g.version;
    const others = ['I', 'II', 'III'].filter((v) => v !== cur);
    return async () => {
      const act = await AW.ui.fromTo({
        sub: `You saw Parallax as **${AW.VERSIONS[cur].name}**. The brief’s own summary of the shift:`,
        pairs: [
          ['Clear delineation of human and agentic AI', 'Hybridization, centaur, cyborg, siphonophore'],
          ['Agents are subordinate shadows', 'Agents are symbionts'],
          ['Digital Twin', 'Pluralized Self'],
          ['Agents exist in task-completion reality', 'Physical agents interact with real world'],
          ['Agents remain purely sims', 'Agent sims have increased recursive agency'],
          ['Chat, voice, anthropomorphism', 'Agent choreography abstraction layers'],
          ['Build ideal cooperative agents', 'Build scaffolds of institutions'],
          ['Agents are paperclip maximizers', 'Agents are predictive modelers'],
          ['Teach AI to pretend to think like a human', 'Teach humans to think like agent swarms'],
          ['Model-centric architecture', 'Harness-centric architecture'],
          ['AGI', 'AHI'],
        ],
        outro: '“That world may never arrive, and it may also be here already, and in some odd way, it may be both.”',
        buttons: [
          { id: 'day2', label: 'Day 2: an ordinary Tuesday ▶' },
          { id: 'v:' + others[0], label: `See it as ${others[0]} · ${AW.VERSIONS[others[0]].name}` },
          { id: 'v:' + others[1], label: `See it as ${others[1]} · ${AW.VERSIONS[others[1]].name}` },
          { id: 'roam', label: 'Keep exploring' },
          { id: 'restart', label: 'Start over' },
        ],
      });
      if (act === 'day2') {
        await AW.day2.enter();
      } else if (act.startsWith('v:')) {
        g.setVersion(act.slice(2));
        AW.ui.toast(`Every stop can be replayed in this reading: stand on a ✓ and press Space. Or just wander and talk to people.`, 5200);
      } else if (act === 'restart') {
        g.clearSave();
        g.start(g.version, null);
        await AW.tour.intro();
      } else {
        AW.ui.toast('Wander freely. Stand on any ✓ stop and press Space to replay it; press V to switch readings.', 4200);
      }
    };
  };

  /* ===================================================== ambient talk */
  const pickLine = (arr, seed) => arr[Math.abs(Math.floor(seed + G().time * 0.37)) % arr.length];
  tour.talk = async function (e) {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    try {
      if (e !== g.mira) { const d = e.dir; g.faceToward(e, g.player); e._prevDir = d; }
      const v = g.version;
      const r = e.role || '';
      const sp = (who, text, label) => say(who, text, label ? { label } : undefined);
      if (AW.day2 && (await AW.day2.talk(e, sp))) {
        // handled by Day 2
      } else if (e === g.mira) {
        const n = g.nextObjective();
        const lines = n
          ? [`Next is Ch.${n}, ${AW.NOTES[n - 1].title}. Follow the marker.`,
            t({ I: 'Want to see me as I am? Press L.', II: 'Press L and you’ll see what I sense.', III: 'Press L to see every edge, including ours.' }),
            'Try V sometime. Same town, same me, different reading of the brief.']
          : ['That’s all ten. Switch readings with V, or replay any stop. I’ll be here, in some form.'];
        await sp('mira', pickLine(lines, 3));
      } else if (r.startsWith('fork_')) {
        const id = r.slice(5);
        const L = {
          negotiator: 'Negotiator here. Busy. I’m being much gentler with Jun today, promise.',
          greeter: 'Greeter here. I’ve said hello to forty strangers for you since lunch. They liked you.',
          clerk: 'Clerk here. Your tax forms are done. You don’t need to understand them. I barely do.',
          bassist: 'Bassist here. We played a show last night. You were great.',
          confidant: 'Confidant here. I’m around whenever you can’t sleep.',
        };
        await sp('mira', L[id] || 'One of Mira’s forks. Busy being you.', e.label);
      } else if (r === 'odile') await sp('odile', 'I mostly approve things now. Approving is a kind of steering, my agents tell me.');
      else if (r === 'jun') await sp('jun', 'Tell your Negotiator I said hi. Or tell yourself. I can’t keep track.');
      else if (r === 'tailor') await sp(t({ I: 'tailor', II: 'molter', III: 'assembler' }), 'Personas fitted while you wait. Remember, the persona is only the top layer.');
      else if (r === 'template') await sp('template', 'Nobody’s home yet. Talk to the tailor.');
      else if (INDIV.includes(r)) await sp('template', ['Departures at :15 and :45. I find that I care about them now.', 'I keep the letters in order. Somebody should.', 'Still your move.'][INDIV.indexOf(r)], e.label);
      else if (r === 'courier') await sp('courier', 'Parcels for 312 humans and a lot more for the agents. Mostly energy.');
      else if (r === 'clerk') await sp('clerk', 'The table is always on. That red dot is you. It already knows you’re talking to me.');
      else if (r === 'sol') await sp('sol', 'Orchestrating rewards fuzzy, exploratory thinking. My best conductor used to be a jazz drummer.');
      else if (r === 'kid') await sp('kid', 'Pip is getting good. Yesterday it said “no thank you” to a vending machine.');
      else if (r === 'pip') await sp('pip', 'No, thank you!');
      else if (r.startsWith('court_')) await sp('referee', 'Any qualified occupant may fill any role. Today I’m ' + (e.seat === 'JURY' ? 'on the jury' : e.seat) + '.', e.seat);
      else if (r === 'mono') await sp('mira', '“Exactly.” “Exactly.” “Exactly.”', 'TWINS');
      else if (r === 'babel1' || r === 'babel2') await sp('mira', '“Your priors are not even wrong.” “Define ‘wrong.’”', e.role.toUpperCase());
      else if (r === 'corr1' || r === 'corr2') await sp('mira', '“But if the river floods—” “Then your model and mine both fail, differently. Good.”', 'ARGUERS');
      else if (r === 'kintsu') await sp('kintsu', g.done.has(8) ? 'I still have your photograph. It’s doing me good.' : 'I’m fading a little. Ask me again later.');
      else if (r === 'bram') await sp('bram', 'Nothing personal. Well. Everything’s personal now.');
      else if (r === 'protester') await sp('mira', t({ I: '“We were here first.” (Her sign was designed by an agent. She knows.)', II: '“Keep one square for us.”', III: '“H only.”' }), 'PROTESTER');
      else if (r.startsWith('quiz_')) await sp('mira', 'Waiting for the tram. Human or agent? You can ask, but the answer is complicated.', 'TRAM STOP');
      else if (r === 'nicheBot') await sp('courier', t({ I: 'New body, same street. The street taught me this shape.', II: 'Tick-tick. I map the curb you’re standing on.', III: 'NICHE → ME → NICHE.' }), 'NEW SPECIES');
      else {
        const F = AW.V.flavor[v][e.kind === 'human' ? 'human' : 'agent'];
        const line = F[e.seed % F.length];
        await sp(e.kind === 'human' ? 'odile' : 'courier', line, e.kind === 'human' ? 'RESIDENT' : 'AGENT');
      }
    } finally {
      if (e._prevDir && e.role && !e.role.startsWith('court_')) e.dir = e._prevDir;
      g.busy = false;
    }
  };

  tour.sign = async function (id) {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    try { await say('sign', (AW.V.signs[id] || (() => '…'))(g.version)); }
    finally { g.busy = false; }
  };
  tour.building = async function (b) {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    const desc = {
      house: 'A house. Two humans live here, and somewhere around ninety agents work for them.',
      home: 'Your lodging. Mira keeps it warmer than you would.',
      shop: 'A shop on Niche Street.',
      sim: 'The forecasts are made here. They are also, slightly, causes.',
      atelier: 'Where templates become someone.',
      school: 'Four children. Thirty-one tutors.',
      clinic: 'Most patients here are seen years before they feel anything.',
      switch: 'Where people conduct instead of chat.',
      registry: 'Where verdicts and contracts go to become inputs for something else.',
      court: 'The Hall of Roles.',
      cafe: 'Café Glossary. Agents come here to talk about what it’s like to be them.',
      plant: 'Power and cooling. Every mind in town draws on this.',
    }[b.kind] || '';
    try { await say('sign', `${AW.art.buildingLabel(b, g.version)}. ${desc}`, { label: 'BUILDING' }); }
    finally { g.busy = false; }
  };
  tour.prop = async function (pr) {
    const g = G();
    if (g.busy) return;
    g.busy = true;
    const txt = {
      well: g.allBeforeDone() ? 'The Commons.' : 'The Commons. Mira wants to end the visit here.',
      board: 'The census of minds. Humans 312, falling. Agents 31,200, rising.',
      simtable: 'A live model of Parallax. The red dot is you. Inside it, a smaller table with a smaller you.',
      console: 'The Switchboard console. No keyboard.',
      table: 'A café table.',
    }[pr.kind] || '';
    try { await say('note', txt); }
    finally { g.busy = false; }
  };
})();
