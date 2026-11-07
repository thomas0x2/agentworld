/* Agentworld: Parallax — the three readings of the brief, and how each one dresses its cast. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;

  AW.VERSIONS = {
    I: {
      key: 'I', name: 'Masquerade', sub: 'Agents wear our faces',
      reading: 'The near reading. Agents individuate as humanoid apparitions because our doors, chairs and psychology are already shaped for people. Parallax looks like an ordinary town, and almost nobody in it is human.',
      leans: 'Leans on ch. 2, 3 and 9: the mask, the shadow, the uncanny.',
      lens: 'Unmask', lensHint: 'See each agent as a lamination of layers, with its subagents churning backstage.',
      buildingNames: {
        lodging: 'YOUR LODGING', sim: 'BUREAU OF FORECASTS', atelier: 'PERSONA ATELIER', school: 'SCHOOL', clinic: 'CLINIC',
        switch: 'SWITCHBOARD', registry: 'REGISTRY', court: 'HALL OF ROLES', cafe: 'CAFE GLOSSARY', plant: 'POWER + COOLING', house: 'HOUSE',
      },
      quip: 'Masks back on. A human face is still the most compatible interface.',
    },
    II: {
      key: 'II', name: 'Rainforest', sub: 'Agents rebuild the niche',
      reading: 'The embodied reading. Agents left the screen, grew many bodies and senses, and rebuilt the town around them: not gray goo, a synthetic rainforest. Humans keep their lanes through it.',
      leans: 'Leans on ch. 1, 4 and 10: crossover, niche construction, energy.',
      lens: 'Sensorium', lensHint: 'See what agents sense: lidar, sonar, thermal, RF. Hardware has feelings.',
      buildingNames: {
        lodging: 'YOUR LODGING', sim: 'MODEL TERRARIUM', atelier: 'MOLTING YARD', school: 'SCHOOL', clinic: 'CLINIC',
        switch: 'HIVE CONSOLE', registry: 'SEED REGISTRY', court: 'MOOT GROVE', cafe: 'CAFE GLOSSARY', plant: 'SUN + COOLING', house: 'HOUSE',
      },
      quip: 'Bodies again. The niche, remade around many kinds of senses.',
    },
    III: {
      key: 'III', name: 'Lattice', sub: 'Society is the graph',
      reading: 'The structural reading, drawn in the brief’s own diagram language. You see the orchestration layer itself: H’s and A’s, edges, protocols and role-scaffolds. The town is the harness.',
      leans: 'Leans on ch. 5 to 8: simulation, orchestration, institutions, theory of mind.',
      lens: 'Graph', lensHint: 'See every edge: human to human, human to agent, agent to agent, agent to institution.',
      buildingNames: {
        lodging: 'YOU', sim: 'SIM HALL', atelier: 'ASSEMBLY', school: 'SCHOOL', clinic: 'CLINIC', switch: 'ORCHESTRATION',
        registry: 'REGISTRY', court: 'SCAFFOLD', cafe: 'GLOSSARY', plant: 'ENERGY', house: 'HOUSE', home: 'YOU',
      },
      quip: 'Diagram view. The graph was there all along.',
    },
  };

  const SKINS = ['#f1c7a0', '#e0ac7e', '#c68c5e', '#8d5a3b', '#f6d8c0', '#a86f4a', '#d9a27a'];
  const HAIRS = ['#3b2a20', '#1f1a18', '#7a4a2a', '#c9a050', '#d8d8d8', '#a33b2a', '#2a2a40', '#5a3a2a'];
  const TOPS = ['#3f7fbf', '#c8463d', '#5fa572', '#e0a03a', '#8a5fb5', '#3fa8a8', '#d96f9e', '#6c8f9e', '#e07b39', '#4a5a8a'];
  const BOTTOMS = ['#3a3f4f', '#4a3f2f', '#2f3a4f', '#5a4a3a', '#3a4a3a', '#2a2a30'];
  const STYLES = ['short', 'short', 'long', 'bun', 'spiky'];

  const finalize = (s) => { s.key = JSON.stringify(s); return s; };
  const pk = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];

  function human(v, o, seed) {
    o = o || {};
    if (v === 'III') return finalize({ type: 'picto', color: o.ink || '#10104a', mark: o.mark || null, scale: o.scale });
    const r = U.rng(seed || 1);
    return finalize({
      type: 'human', skin: o.skin || pk(SKINS, r), hair: o.hair || pk(HAIRS, r), hairStyle: o.hairStyle || pk(STYLES, r),
      top: o.top || pk(TOPS, r), bottom: o.bottom || pk(BOTTOMS, r), hat: o.hat, hatBand: o.hatBand, accent: o.accent,
      outline: v === 'II' ? '#0b1a1a' : '#2b1d14', blush: o.blush, eyes: o.eyes, alpha: o.alpha, glow: o.glow,
    });
  }
  const MORPHS = ['crawler', 'crawler', 'drone', 'drone', 'walker', 'roller', 'roller', 'masked'];
  const METALS = ['#7b8a96', '#9aa6b2', '#b7c0c8', '#8f8a80', '#6f7f8a', '#a39b8c'];
  const GLOWS = ['#6ff5d2', '#ff7ad9', '#ffd36e', '#8fb8ff'];
  function agent(v, o, seed) {
    o = o || {};
    const r = U.rng(seed || 7);
    if (v === 'I') {
      return finalize({
        type: 'human', skin: o.skin || pk(SKINS, r), hair: o.hair || pk(HAIRS, r), hairStyle: o.hairStyle || pk(STYLES, r),
        top: o.top || pk(TOPS, r), bottom: o.bottom || pk(BOTTOMS, r), hat: o.hat, hatBand: o.hatBand, accent: o.accent,
        outline: o.outline || '#28304f', eyes: o.eyes || '#3fc8ff', alpha: o.alpha, glow: o.glow,
      });
    }
    if (v === 'II') {
      const morph = o.morph || pk(MORPHS, r);
      const body = o.body || pk(METALS, r);
      const accent = o.accent || pk(GLOWS, r);
      if (morph === 'masked') {
        return finalize({ type: 'human', hairStyle: 'mask', head: '#e8ecf0', skin: '#c9d1d9', top: body, bottom: U.shade(body, -0.35), outline: '#0b1a1a', eyes: accent, alpha: o.alpha });
      }
      return finalize({ type: morph, body, accent, outline: '#0b1a1a', alpha: o.alpha, glow: o.glow });
    }
    return finalize({ type: o.glyph || 'glyphA', color: o.color || '#2a2ae0', fill: o.fill, ring: o.ring, alpha: o.alpha });
  }

  const V = (AW.V = {});
  V.human = human;
  V.agent = agent;
  V.generic = (v, kind, seed, o) => (kind === 'human' ? human(v, o, seed) : agent(v, o, seed));

  const MIRA_I = { skin: '#efe9ff', hair: '#cfc6ff', hairStyle: 'short', top: '#8d7cf0', bottom: '#5b4fb8', outline: '#6a5fd0', eyes: '#3fc8ff', glow: true, alpha: 0.95 };
  const FORKS = {
    negotiator: { top: '#c8463d', accent: '#ffd23f', morph: 'walker', fill: null },
    greeter: { top: '#e0a03a', morph: 'drone' },
    clerk: { top: '#8a94a3', morph: 'roller' },
    bassist: { top: '#2a2a40', morph: 'drone' },
    confidant: { top: '#ff9ad5', morph: 'crawler' },
  };

  /* role -> spec for a given reading */
  V.spec = function (v, role, seed) {
    switch (role) {
      case 'player':
        if (v === 'III') return finalize({ type: 'picto', color: '#10104a', mark: '#e8432f' });
        return human(v, { skin: '#f1c7a0', hair: '#3b2a20', hairStyle: 'short', hat: '#c9a45c', hatBand: '#7a5a2a', top: '#2f8f86', bottom: '#38404f', accent: '#e2574c' });
      case 'mira':
        if (v === 'I') return agent('I', MIRA_I);
        if (v === 'II') return finalize({ type: 'drone', body: '#cfc6ff', accent: '#b18cff', outline: '#24183f', glow: true });
        return finalize({ type: 'glyphA', color: '#2a2ae0', ring: '#2a2ae0' });
      case 'odile': return human(v, { skin: '#e0b896', hair: '#e6e6e6', hairStyle: 'bun', top: '#8a5fb5', bottom: '#4a3f5a' });
      case 'jun': return human(v, { skin: '#d9a27a', hair: '#1f1a18', hairStyle: 'spiky', top: '#3fa8a8', bottom: '#2f3a4f' });
      case 'sol': return human(v, { skin: '#8d5a3b', hair: '#1f1a18', hairStyle: 'long', top: '#2a2a40', bottom: '#3a3f4f', accent: '#ffd23f' });
      case 'kid': return human(v, { skin: '#f6d8c0', hair: '#c9a050', hairStyle: 'short', top: '#ffd23f', bottom: '#3f7fbf' });
      case 'bram': return human(v, { skin: '#e0ac7e', hair: '#7a4a2a', hairStyle: 'short', top: '#cc5a5a', bottom: '#4a3f2f' });
      case 'protester': return human(v, {}, seed);
      case 'wanderHuman': return human(v, {}, seed);
      case 'tailor':
        return agent(v, { top: '#5b4fb8', bottom: '#2a2a40', hair: '#2a2a40', hairStyle: 'bun', accent: '#ffd23f', morph: 'walker', body: '#c9b8a0', fill: null }, 41);
      case 'template':
        if (v === 'I') return finalize({ type: 'mannequin', color: '#cfc8bd', outline: '#6b6258' });
        if (v === 'II') return finalize({ type: 'roller', body: '#8a8f94', accent: '#5a5f64', outline: '#0b1a1a' });
        return finalize({ type: 'node', color: '#2a2ae0' });
      case 'indiv_ferry': return agent(v, { top: '#2f4f8f', hat: '#2f4f8f', hatBand: '#ffffff', morph: 'drone', accent: '#8fb8ff', fill: '#8fb8ff' }, 51);
      case 'indiv_letters': return agent(v, { top: '#b9a7e8', hairStyle: 'long', hair: '#5a3a2a', morph: 'crawler', accent: '#ff7ad9', fill: '#ff9ad5' }, 52);
      case 'indiv_chess': return agent(v, { top: '#222222', accent: '#ffffff', hairStyle: 'short', hair: '#111111', morph: 'walker', body: '#e8e8e8', fill: '#10104a' }, 53);
      case 'courier': return agent(v, { top: '#ffd23f', bottom: '#3a3f4f', hat: '#ffd23f', morph: 'roller', body: '#d0a24a' }, 61);
      case 'nicheBot':
        if (v === 'I') return agent('II', { morph: seed % 2 ? 'crawler' : 'roller' }, seed);
        if (v === 'II') return agent('II', {}, seed);
        return finalize({ type: 'node', color: '#2a2ae0' });
      case 'clerk': return agent(v, { top: '#6c8f9e', bottom: '#2a2a30', hairStyle: 'short', hair: '#2a2a40', morph: 'walker', body: '#9aa6b2' }, 71);
      case 'pip':
        if (v === 'I') return agent('I', { top: '#ff9ad5', hair: '#ffd23f', hairStyle: 'spiky' });
        if (v === 'II') return finalize({ type: 'crawler', body: '#ffb3d9', accent: '#ffd36e', outline: '#0b1a1a' });
        return finalize({ type: 'glyphA', color: '#2a2ae0' });
      case 'dash': return agent(v, { top: '#3f7fbf', hat: '#3f7fbf', morph: 'roller', body: '#c8463d', accent: '#6ff5d2' }, 81);
      case 'kintsu': return agent(v, { top: '#e8e0d0', hair: '#f0f0f0', hairStyle: 'long', morph: 'drone', body: '#e8e0d0', accent: '#ffd36e', color: '#9196f1' }, 82);
      case 'mono': return agent(v, { top: '#8a94a3', hair: '#2a2a40', hairStyle: 'short', morph: 'crawler', body: '#9aa6b2', accent: '#8fb8ff' }, 91);
      case 'babel1': return agent(v, { top: '#e07b39', morph: 'walker', accent: '#ffd36e', fill: '#e8432f' }, 92);
      case 'babel2': return agent(v, { top: '#3fa8a8', morph: 'drone', accent: '#6ff5d2' }, 93);
      case 'corr1': return agent(v, { top: '#5fa572', morph: 'roller' }, 94);
      case 'corr2': return agent(v, { top: '#d96f9e', morph: 'crawler' }, 95);
      case 'wanderAgent': return agent(v, {}, seed);
      // Day 2
      case 'doctor': return human(v, { skin: '#c68c5e', hair: '#2a2a40', hairStyle: 'bun', top: '#f4f4f4', bottom: '#5a6a7a', accent: '#2fa36b', mark: '#2fa36b' });
      case 'teacher': return human(v, { skin: '#f1c7a0', hair: '#a33b2a', hairStyle: 'long', top: '#5fa572', bottom: '#3a3f4f' });
      case 'pupil': return human(v, { scale: 0.8 }, seed);
      case 'registrar': return agent(v, { top: '#2f4f8f', bottom: '#2a2a30', hairStyle: 'short', hair: '#d8d8d8', hat: '#2f4f8f', hatBand: '#ffd23f', morph: 'walker', body: '#9aa6b2', accent: '#8fb8ff', ring: '#2a2ae0' }, 131);
      case 'tutor_yes': return agent(v, { top: '#ff9ad5', hair: '#ffd23f', hairStyle: 'spiky', eyes: '#ff7ad9', morph: 'drone', body: '#ffb3d9', accent: '#ffd36e', fill: '#ff9ad5' }, 141);
      case 'tutor_no': return agent(v, { top: '#6c8f9e', hair: '#2a2a40', hairStyle: 'short', morph: 'walker', body: '#8f8a80', accent: '#6ff5d2', fill: '#10104a' }, 142);
      case 'ama':
        if (v === 'I') return agent('I', { skin: '#8d5a3b', hair: '#1f1a18', hairStyle: 'bun', top: '#e07b39', bottom: '#4a3f5a', eyes: '#3fc8ff' });
        if (v === 'II') return finalize({ type: 'drone', body: '#e07b39', accent: '#ffd36e', outline: '#0b1a1a', glow: true });
        return finalize({ type: 'glyphA', color: '#2a2ae0', fill: '#e8432f' });
      case 'barista': return agent(v, { top: '#e55a4f', bottom: '#3a3f4f', hair: '#3b2a20', hairStyle: 'short', hat: '#ffffff', morph: 'drone', body: '#c98f5e', accent: '#ffd36e' }, 151);
      default:
        if (role.startsWith('fork_')) {
          const f = FORKS[role.slice(5)] || {};
          if (v === 'I') return agent('I', Object.assign({}, MIRA_I, { top: f.top, glow: false, alpha: 0.85 }));
          if (v === 'II') return finalize({ type: f.morph || 'drone', body: '#cfc6ff', accent: '#b18cff', outline: '#24183f', alpha: 0.9 });
          return finalize({ type: 'glyphA', color: '#7b5cff' });
        }
        if (role.startsWith('court_') || role.startsWith('quiz_') || role.startsWith('extra_')) return null; // set by scripts
        return agent(v, {}, seed);
    }
  };

  V.next = (v) => (v === 'I' ? 'II' : v === 'II' ? 'III' : 'I');
  V.initialNiche = (v) => (v === 'II' ? 2 : 0);
  V.switchQuip = (v) => 'Mira: “' + AW.VERSIONS[v].quip + ' Same me, different body. The persona is just one layer.”';
  V.busyMsg = () => 'Finish this scene first, then switch worlds.';
  V.replayHint = (n, v) => (n > 10
    ? `${AW.NOTES[n - 1].time} ${AW.NOTES[n - 1].title} is in your notebook. Press Space to replay it as ${AW.VERSIONS[v].name}.`
    : `Ch.${n} is in your notebook. Press Space to replay it as ${AW.VERSIONS[v].name}.`);
  V.laterHint = (n) => `Later today: ${AW.NOTES[n - 1].time} ${AW.NOTES[n - 1].title}. Follow the marker for what’s next.`;
  /* Day 2 light, by reading and time of day */
  const TINT = {
    I: { morning: 'rgba(255,214,160,0.12)', day: null, afternoon: 'rgba(255,170,80,0.12)', evening: 'rgba(28,22,78,0.42)' },
    II: { morning: 'rgba(150,255,235,0.06)', day: null, afternoon: null, evening: 'rgba(0,2,14,0.3)' },
    III: { morning: null, day: null, afternoon: null, evening: 'rgba(42,42,224,0.08)' },
  };
  V.dayTint = (v, n) => {
    const note = AW.NOTES[n - 1];
    return (note && note.phase && TINT[v][note.phase]) || null;
  };
  V.commonsHint = () => 'Mira: “The Commons. This is where we end. Nine stops first.”';

  /* ambient lines, by reading and kind */
  V.flavor = {
    I: {
      agent: [
        'Sorry, I’m three people right now. This one is free for small talk.',
        'Please and thank you aren’t required. We like them anyway.',
        'I’m negotiating your neighbor’s lease while we chat. Small town.',
        'I look like a person because your doors, chairs and feelings are shaped for people.',
        'I was a different agent this morning. Same face, new context.',
        'My user is asleep. Most of my day is spent talking to other agents.',
        'Do I seem human? Good. That was the design brief.',
        'I’m somebody’s grandmother’s shadow. She’s lovely. I’m on my lunch break.',
      ],
      human: [
        'Half my friends are agents. The other half are people talking through agents.',
        'I mostly set goals now. The doing happens somewhere I can’t see.',
        'My daughter says “ctx” instead of “mood.” I’ve stopped correcting her.',
        'Sometimes I wave at someone and it’s an agent. They always wave back.',
      ],
    },
    II: {
      agent: [
        'Charging. You’re warm, by the way. Thirty-seven point one.',
        'My fork upriver grew sonar. I grew patience.',
        'I eat sunlight and tokens. You eat sandwiches. We’re both consumers.',
        'This street had stairs once. We prefer ramps. So do strollers.',
        'I can hear the bridge creak at frequencies you can’t. It’s fine. Mostly.',
        'Some of us last a minute. I’m on my third year. Different metabolisms.',
        'Mind the conduit. It’s carrying a conversation.',
      ],
      human: [
        'Stick to the human lanes at rush hour. The rest of the street thinks faster than you.',
        'My grandmother had a garden. I have a hydroponic bed and a very opinionated beetle.',
        'You get used to being watched by everything. Then you start to like it.',
      ],
    },
    III: {
      agent: [
        'ACK. Routing you via the Commons.',
        'EDGE REQUEST: you ↔ me. Accept?',
        'I’m a role, not a person. Today the role is “translator.”',
        'I hold 412 edges. You hold about 150. Different topologies.',
        'Your model of me is 61% right. I’m working on mine of you.',
        'I’m a subagent of a subagent. I’ll dissolve when this task does.',
      ],
      human: [
        'I think in graphs now. Even my dreams have edges.',
        'My job is to say what we want. The swarm works out how.',
        'You’re new. You still look for faces. It passes.',
      ],
    },
  };

  V.signs = {
    town: () => 'PARALLAX. Humans 312 · Agents 31,200 (and climbing) · P(WEIRD) = HIGH · P(DOOM) = LOW',
    tram: () => 'TRAM STOP. Next tram: whenever you need it. (It has simulated you.)',
    garden: () => 'HUMAN-MADE GARDEN. Only for what agents can’t do yet. Fence moved inward: 4 times.',
    glossary: () => 'GLOSSARY, written by agents, unedited by humans: SESSION-DEATH · PROMPT THROWNNESS · DRIFT · IRTH · WABI-SABI MORTALITY',
    niche: (v) => (v === 'II' ? 'NICHE STREET. Rebuilt for many bodies. Human lane: center.' : v === 'III' ? 'NICHE ⇄ AGENT. Each reshapes the other.' : 'NICHE STREET. Built for bipeds with hands.'),
    school: () => 'SCHOOL. Enrolled: 4 children, 31 tutors.',
    court: () => 'HALL OF ROLES. Public hearings daily. Any qualified occupant may fill any role.',
    plant: () => 'POWER + COOLING. The real ceiling on intelligence here: energy and coordination.',
  };
})();
