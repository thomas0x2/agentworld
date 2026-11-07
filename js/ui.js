/* Agentworld: Parallax — DOM interface: dialogue, choices, panels, notebook, HUD, title. */
'use strict';
(function () {
  const AW = window.AW;
  const U = AW.util;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ui = (AW.ui = {});
  let stage, dialog, dName, dText, dMore, choicesEl, captionEl, panelEl, toastEl, titleEl, hud;

  /* speakers: label, colour class, voice pitch, and which entity role "speaks" */
  const SPEAKERS = {
    mira: { label: 'MIRA', cls: 'sp-mira', voice: 640, role: 'mira' },
    you: { label: 'YOU', cls: 'sp-you', voice: 330, role: 'player' },
    odile: { label: 'ODILE', cls: 'sp-human', voice: 300, role: 'odile' },
    jun: { label: 'JUN', cls: 'sp-human', voice: 380, role: 'jun' },
    tailor: { label: 'TAILOR', cls: 'sp-agent', voice: 560, role: 'tailor' },
    molter: { label: 'MOLTER', cls: 'sp-agent', voice: 560, role: 'tailor' },
    assembler: { label: 'ASSEMBLER', cls: 'sp-agent', voice: 560, role: 'tailor' },
    template: { label: '???', cls: 'sp-agent', voice: 700, role: 'template' },
    courier: { label: 'COURIER', cls: 'sp-agent', voice: 600, role: 'courier' },
    clerk: { label: 'CLERK', cls: 'sp-agent', voice: 500, role: 'clerk' },
    sol: { label: 'SOL', cls: 'sp-human', voice: 350, role: 'sol' },
    kid: { label: 'NIA', cls: 'sp-human', voice: 520, role: 'kid' },
    pip: { label: 'PIP', cls: 'sp-agent', voice: 820, role: 'pip' },
    referee: { label: 'REFEREE', cls: 'sp-agent', voice: 450, role: 'court_referee' },
    dash: { label: 'DASH', cls: 'sp-agent', voice: 620, role: 'dash' },
    kintsu: { label: 'KINTSU', cls: 'sp-agent', voice: 760, role: 'kintsu' },
    bram: { label: 'BRAM', cls: 'sp-human', voice: 260, role: 'bram' },
    sign: { label: 'SIGN', cls: 'sp-sign', voice: 200, role: null },
    note: { label: 'FIELD NOTE', cls: 'sp-sign', voice: 240, role: null },
  };
  ui.SPEAKERS = SPEAKERS;

  /* ================================================================ layout */
  ui.init = function () {
    stage = $('#stage'); dialog = $('#dialog'); dName = $('#dialog .name'); dText = $('#dialog .text'); dMore = $('#dialog .more');
    choicesEl = $('#choices'); captionEl = $('#caption'); panelEl = $('#panel'); toastEl = $('#toast'); titleEl = $('#title'); hud = $('#hud');
    window.addEventListener('resize', ui.layout);
    ui.layout();
    dialog.addEventListener('pointerdown', (e) => { e.preventDefault(); AW.input.press('act'); });
    // HUD buttons
    hud.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const a = b.dataset.act;
      if (AW.input.hasModal() && a !== 'mute') return;
      if (a === 'v') AW.game.setVersion(b.dataset.v);
      else if (a === 'lens') AW.game.toggleLens();
      else if (a === 'notes') ui.notebook();
      else if (a === 'help') ui.help();
      else if (a === 'mute') ui.toggleMute();
      b.blur();
    });
    // touch controls
    const touch = $('#touch');
    const bind = (el) => {
      const a = el.dataset.k;
      const on = (e) => { e.preventDefault(); AW.input.virtual(a, true); el.classList.add('on'); };
      const off = (e) => { e.preventDefault(); AW.input.virtual(a, false); el.classList.remove('on'); };
      el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off);
    };
    touch.querySelectorAll('[data-k]').forEach(bind);
    const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    document.body.classList.toggle('touch', isTouch);
    ui.layout();
  };

  ui.layout = function () {
    const touch = document.body.classList.contains('touch');
    const vw = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const vh = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);
    const availW = vw;
    const availH = vh - (touch ? Math.min(190, vh * 0.32) : 0);
    let s = Math.min(availW / AW.VW, availH / AW.VH);
    if (s >= 2) s = Math.floor(s * 2) / 2;
    s = Math.max(0.6, s);
    stage.style.width = Math.round(AW.VW * s) + 'px';
    stage.style.height = Math.round(AW.VH * s) + 'px';
    document.documentElement.style.setProperty('--u', s + 'px');
  };

  /* ================================================================ dialogue */
  let typing = null;
  ui.say = function (who, text, opts) {
    opts = opts || {};
    const sp = SPEAKERS[who] || { label: String(who).toUpperCase(), cls: 'sp-agent', voice: 500 };
    return new Promise((resolve) => {
      const G = AW.game;
      G.speaking = sp.role ? G.byRole(sp.role) : null;
      dialog.classList.remove('hidden');
      dName.textContent = opts.label || sp.label;
      dName.className = 'name ' + sp.cls;
      dText.innerHTML = '';
      dMore.classList.add('hidden');
      const full = String(text);
      let i = 0, done = false, acc = 0;
      const speed = 70; // chars per second
      let lastT = performance.now();
      const tick = (now) => {
        if (done) return;
        acc += ((now - lastT) / 1000) * speed;
        lastT = now;
        const n = Math.min(full.length, Math.floor(acc));
        if (n > i) {
          if (Math.floor(n / 3) > Math.floor(i / 3) && full[n - 1] !== ' ') AW.audio.text(sp.voice);
          i = n;
          dText.innerHTML = fmt(full.slice(0, i));
        }
        if (i >= full.length) finishTyping();
        else typing = requestAnimationFrame(tick);
      };
      const finishTyping = () => {
        done = true;
        cancelAnimationFrame(typing);
        dText.innerHTML = fmt(full);
        if (!opts.noWait) dMore.classList.remove('hidden');
        if (opts.noWait) { cleanup(); resolve(); }
      };
      const handler = (a) => {
        if (a !== 'act' && a !== 'back') return;
        if (!done) { finishTyping(); return; }
        AW.audio.select();
        cleanup();
        resolve();
      };
      const cleanup = () => {
        AW.input.popModal(handler);
        if (!opts.keep) dialog.classList.add('hidden');
        AW.game.speaking = null;
      };
      if (!opts.noWait) AW.input.pushModal(handler);
      typing = requestAnimationFrame(tick);
    });
  };
  // **bold** and _emph_ in dialogue
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<i>$1</i>');
  }
  ui.hideDialog = () => dialog.classList.add('hidden');

  ui.choose = function (options, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      choicesEl.innerHTML = '';
      choicesEl.classList.remove('hidden');
      if (opts.prompt) {
        dialog.classList.remove('hidden');
        dName.textContent = opts.label || 'YOU';
        dName.className = 'name ' + (opts.cls || 'sp-you');
        dText.innerHTML = fmt(opts.prompt);
        dMore.classList.add('hidden');
      }
      let sel = 0;
      const items = options.map((o, i) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = `<span class="k">${i + 1}</span>${fmt(o)}`;
        b.addEventListener('pointerenter', () => { sel = i; paint(); });
        b.addEventListener('click', (e) => { e.preventDefault(); sel = i; pick(); });
        choicesEl.appendChild(b);
        return b;
      });
      const paint = () => items.forEach((b, i) => b.classList.toggle('sel', i === sel));
      paint();
      const pick = () => {
        AW.audio.confirm();
        AW.input.popModal(handler);
        choicesEl.classList.add('hidden');
        dialog.classList.add('hidden');
        resolve(sel);
      };
      const handler = (a) => {
        if (a === 'up' || a === 'left') { sel = (sel + options.length - 1) % options.length; paint(); AW.audio.text(400); }
        else if (a === 'down' || a === 'right') { sel = (sel + 1) % options.length; paint(); AW.audio.text(400); }
        else if (a === 'act') pick();
        else if (/^v[1-5]$/.test(a)) { const k = +a[1] - 1; if (k < options.length) { sel = k; paint(); pick(); } }
      };
      AW.input.pushModal(handler);
    });
  };

  /* ================================================================ caption / toast */
  ui.caption = function (code, text) {
    captionEl.innerHTML = (code ? `<span class="code">${esc(code)}</span>` : '') + `<span>${fmt(text)}</span>`;
    captionEl.classList.remove('hidden');
  };
  ui.captionHide = () => captionEl.classList.add('hidden');
  let toastTimer = null;
  ui.toast = function (text, ms) {
    toastEl.innerHTML = fmt(text);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 2500);
  };

  /* ================================================================ panels */
  function openPanel(html, cls) {
    panelEl.className = 'panel ' + (cls || '');
    panelEl.innerHTML = html;
    panelEl.classList.remove('hidden');
    return panelEl;
  }
  function closePanel() { panelEl.classList.add('hidden'); panelEl.innerHTML = ''; }
  ui.closePanel = closePanel;

  /* ---- ch.1 census chart (1A, 1B, 1C) ---- */
  ui.chart = function (steps) {
    return new Promise((resolve) => {
      let k = 0;
      const H = (x) => 250 - (x - 40) * 0.3;
      const Acurve = (x) => 268 - 230 * Math.pow(Math.max(0, x - 230) / 250, 2.1);
      let cx = 400;
      for (let x = 240; x < 480; x += 0.5) if (Acurve(x) <= H(x)) { cx = x; break; }
      const pts = (f, a, b, step) => { const o = []; for (let x = a; x <= b; x += step || 5) o.push(x.toFixed(1) + ',' + f(x).toFixed(1)); return o.join(' '); };
      const Hamp = (x) => (x <= cx ? H(x) : H(x) - Math.pow((x - cx) / 90, 2) * 26);
      const draw = () => {
        const s = steps[k];
        const showA = k >= 0;
        const svg = `
<svg viewBox="0 0 520 300" class="chart">
  ${k === 2 ? `<rect x="${cx}" y="10" width="${490 - cx}" height="262" class="amp"/>` : ''}
  <line x1="40" y1="10" x2="40" y2="272" class="axis"/><line x1="40" y1="272" x2="495" y2="272" class="axis"/>
  <text x="46" y="24" class="lbl">AGENCY</text><text x="490" y="292" class="lbl" text-anchor="end">TIME →</text>
  <polyline points="${pts(k === 2 ? Hamp : H, 40, k === 0 ? 330 : 480)}" class="lineH draw"/>
  ${showA ? `<polyline points="${pts(Acurve, 230, k === 0 ? 330 : 470, 2)}" class="lineA draw"/>` : ''}
  ${k >= 1 ? `<line x1="${cx}" y1="10" x2="${cx}" y2="272" class="dash"/><circle cx="${cx}" cy="${H(cx)}" r="6" class="dot"/>
    <text x="${cx - 8}" y="${H(cx) + 30}" class="lbl small" text-anchor="end">THE CROSSOVER POINT</text>` : ''}
  <g class="glyph" transform="translate(110,${H(123) - 40})"><rect width="26" height="22" rx="3"/><text x="13" y="17" text-anchor="middle">H</text></g>
  <g class="glyph a" transform="translate(${k === 0 ? 300 : 386},${k === 0 ? Acurve(300) - 30 : Acurve(380) + 4})"><rect width="26" height="22" rx="3"/><text x="13" y="17" text-anchor="middle">A</text></g>
</svg>`;
        openPanel(`
<div class="ptitle"><span class="code">${esc(s.code)}</span> ${esc(steps.title || 'CENSUS OF MINDS')}</div>
${svg}
<p class="pcap">${fmt(s.text)}</p>
<div class="pfoot"><span>${k + 1} / ${steps.length}</span><button class="pbtn">${k < steps.length - 1 ? 'Next ▶' : 'Close'}</button></div>`, 'p-chart');
        panelEl.querySelector('.pbtn').addEventListener('click', next);
      };
      const next = () => {
        AW.audio.select();
        if (k < steps.length - 1) { k++; draw(); }
        else { AW.input.popModal(handler); closePanel(); resolve(); }
      };
      const handler = (a) => { if (a === 'act' || a === 'right') next(); };
      AW.input.pushModal(handler);
      draw();
    });
  };

  /* ---- ch.2 the lamination: peel an agent layer by layer ---- */
  ui.stack = function (cfg) {
    return new Promise((resolve) => {
      let peeled = 0;
      const layers = cfg.layers;
      const portrait = AW.art.portrait(cfg.spec, 7);
      const render = () => {
        const rows = layers.map((L, i) => `<div class="layer ${i < peeled ? 'gone' : ''}" style="--c:${L.color}"><b>${esc(L.name)}</b><span>${esc(L.desc)}</span></div>`).join('');
        const msg = peeled === 0 ? cfg.intro : peeled < layers.length ? `<b>${esc(layers[peeled - 1].name)}</b> peeled. ${esc(layers[peeled - 1].desc)}` : cfg.outro;
        openPanel(`
<div class="ptitle"><span class="code">2.5</span> ${esc(cfg.title)}</div>
<div class="stackwrap"><div class="portrait"></div><div class="layers">${rows}</div></div>
<p class="pcap">${fmt(msg)}</p>
<div class="pfoot"><span>${peeled < layers.length ? 'Space: peel the next layer' : ''}</span><button class="pbtn">${peeled < layers.length ? 'Peel ▶' : 'Close'}</button></div>`, 'p-stack');
        const pc = panelEl.querySelector('.portrait');
        pc.appendChild(portrait);
        portrait.style.opacity = String(1 - peeled / (layers.length + 1));
        panelEl.querySelector('.pbtn').addEventListener('click', next);
      };
      const next = () => {
        AW.audio.select();
        if (peeled < layers.length) { peeled++; render(); }
        else { AW.input.popModal(handler); closePanel(); resolve(); }
      };
      const handler = (a) => { if (a === 'act' || a === 'right' || a === 'down') next(); };
      AW.input.pushModal(handler);
      render();
    });
  };

  /* ---- ch.6 orchestration: compose a graph of subagents instead of chatting ---- */
  ui.graph = function (cfg) {
    return new Promise((resolve) => {
      const nodes = cfg.nodes; // [{id,name,desc}]
      const chosen = new Set(cfg.preselect || []);
      let sel = 0;
      let running = false, finished = false, result = '';
      const N = nodes.length;
      const ny = (i) => 40 + i * (220 / (N - 1));
      const draw = () => {
        const edges = nodes.map((n, i) => chosen.has(n.id) ? `<line x1="70" y1="150" x2="270" y2="${ny(i)}" class="edge ${running ? 'run' : ''}"/><line x1="290" y1="${ny(i)}" x2="480" y2="150" class="edge ${running ? 'run' : ''}"/>` : '').join('');
        const swarm = running ? nodes.map((n, i) => chosen.has(n.id) ? Array.from({ length: 16 }, (_, j) => `<circle class="sub" r="1.8" cx="${280 + Math.cos(j) * 4}" cy="${ny(i)}" style="--dx:${(Math.cos(j * 2.4) * (24 + (j % 4) * 7)).toFixed(1)}px;--dy:${(Math.sin(j * 2.4) * (12 + (j % 3) * 6)).toFixed(1)}px;animation-delay:${(j * 0.06).toFixed(2)}s"/>`).join('') : '').join('') : '';
        const nodeEls = nodes.map((n, i) => `<g class="node ${chosen.has(n.id) ? 'on' : ''} ${i === sel && !running ? 'sel' : ''}" data-i="${i}" transform="translate(280,${ny(i)})"><circle r="13"/><text y="4" text-anchor="middle">${i + 1}</text><text x="22" y="4" class="nm">${esc(n.name)}</text></g>`).join('');
        const svg = `<svg viewBox="0 0 560 300" class="graph">${edges}${swarm}
          <g class="hub h" transform="translate(52,150)"><rect x="-18" y="-15" width="36" height="30" rx="4"/><text y="6" text-anchor="middle">H</text></g>
          <g class="hub goal" transform="translate(496,150)"><rect x="-20" y="-16" width="40" height="32" rx="4"/><text y="5" text-anchor="middle">GOAL</text></g>
          ${nodeEls}</svg>`;
        const desc = finished ? fmt(result) : running ? fmt(cfg.runningText || 'Running…') : (nodes[sel] ? `<b>${esc(nodes[sel].name)}</b>: ${esc(nodes[sel].desc)}` : '');
        openPanel(`
<div class="ptitle"><span class="code">6.4</span> ${esc(cfg.title)}</div>
<div class="goaltxt">GOAL: ${esc(cfg.goal)}</div>
${svg}
<p class="pcap">${desc}</p>
<div class="pfoot"><span>${finished ? '' : running ? '' : `Pick at least 3 (1–${N} or Space), then Run. Selected: ${chosen.size}`}</span>
<button class="pbtn">${finished ? 'Close' : running ? '…' : 'Run ▶'}</button></div>`, 'p-graph');
        panelEl.querySelectorAll('.node').forEach((g) => g.addEventListener('click', () => { if (running) return; sel = +g.dataset.i; toggle(); }));
        panelEl.querySelector('.pbtn').addEventListener('click', () => { if (finished) close(); else if (!running) run(); });
      };
      const toggle = () => {
        const id = nodes[sel].id;
        if (chosen.has(id)) chosen.delete(id); else chosen.add(id);
        AW.audio.select(); draw();
      };
      const run = () => {
        if (chosen.size < 3) { AW.audio.bump(); ui.toast('Pick at least three subagents to run the graph.', 1600); return; }
        running = true; AW.audio.whoosh(); draw();
        setTimeout(() => { running = false; finished = true; result = cfg.evaluate(chosen); AW.audio.chime(); draw(); }, 2400);
      };
      const close = () => { AW.input.popModal(handler); closePanel(); resolve([...chosen]); };
      const handler = (a) => {
        if (finished) { if (a === 'act') close(); return; }
        if (running) return;
        if (a === 'up') { sel = (sel + N - 1) % N; draw(); }
        else if (a === 'down') { sel = (sel + 1) % N; draw(); }
        else if (a === 'act') toggle();
        else if (a === 'right') run();
        else if (/^v[1-5]$/.test(a)) { const k = +a[1] - 1; if (k < N) { sel = k; toggle(); } }
      };
      AW.input.pushModal(handler);
      draw();
    });
  };

  /* ---- ch.9 uncertain identification: who here is human? ---- */
  ui.quiz = function (cfg) {
    return new Promise((resolve) => {
      let sel = 0, revealed = false;
      const ports = cfg.people.map((p) => AW.art.portrait(p.spec, 5));
      const draw = () => {
        openPanel(`
<div class="ptitle"><span class="code">9.7</span> ${esc(cfg.title)}</div>
<div class="quiz">${cfg.people.map((p, i) => `<div class="qp ${i === sel ? 'sel' : ''} ${revealed ? 'rev' : ''}" data-i="${i}"><div class="pc"></div><div class="qn">${i + 1}</div>${revealed ? `<div class="qt">${esc(p.truth)}</div>` : ''}</div>`).join('')}</div>
<p class="pcap">${revealed ? fmt(cfg.reveal) : fmt(cfg.prompt)}</p>
<div class="pfoot"><span>${revealed ? '' : '← → then Space'}</span><button class="pbtn">${revealed ? 'Close' : 'This one ▶'}</button></div>`, 'p-quiz');
        panelEl.querySelectorAll('.qp').forEach((el, i) => {
          el.querySelector('.pc').appendChild(ports[i]);
          el.addEventListener('click', () => { if (!revealed) { sel = i; pick(); } });
        });
        panelEl.querySelector('.pbtn').addEventListener('click', () => (revealed ? close() : pick()));
      };
      const pick = () => { revealed = true; AW.audio.confirm(); draw(); };
      const close = () => { AW.input.popModal(handler); closePanel(); resolve(sel); };
      const handler = (a) => {
        if (revealed) { if (a === 'act') close(); return; }
        if (a === 'left' || a === 'up') { sel = (sel + 3) % 4; draw(); }
        else if (a === 'right' || a === 'down') { sel = (sel + 1) % 4; draw(); }
        else if (a === 'act') pick();
        else if (/^v[1-4]$/.test(a)) { sel = +a[1] - 1; pick(); }
      };
      AW.input.pushModal(handler);
      draw();
    });
  };

  /* ---- ch.8 a photograph for a wabi-sabi agent ---- */
  ui.photo = function (dataUrl, caption) {
    return new Promise((resolve) => {
      openPanel(`<div class="polaroid"><img alt="A photograph of the street" src="${dataUrl}"><div>${fmt(caption)}</div></div>
<div class="pfoot"><span></span><button class="pbtn">Give it ▶</button></div>`, 'p-photo');
      const close = () => { AW.input.popModal(handler); closePanel(); resolve(); };
      const handler = (a) => { if (a === 'act') close(); };
      panelEl.querySelector('.pbtn').addEventListener('click', close);
      AW.input.pushModal(handler);
    });
  };

  /* ---- ending: FROM -> TO ---- */
  ui.fromTo = function (cfg) {
    return new Promise((resolve) => {
      const btns = cfg.buttons;
      let sel = 0;
      const draw = () => {
        openPanel(`
<div class="ptitle big">FROM <span class="arrow">→</span> TO</div>
<p class="psub">${fmt(cfg.sub)}</p>
<div class="fromto">${cfg.pairs.map(([a, b]) => `<div class="ft"><span class="f">${esc(a)}</span><span class="t">→ ${esc(b)}</span></div>`).join('')}</div>
<p class="pcap">${fmt(cfg.outro)}</p>
<div class="pbtns">${btns.map((b, i) => `<button class="pbtn ${i === sel ? 'sel' : ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div>`, 'p-fromto');
        panelEl.querySelectorAll('.pbtns .pbtn').forEach((el) => el.addEventListener('click', () => { sel = +el.dataset.i; pick(); }));
      };
      const pick = () => { AW.audio.confirm(); AW.input.popModal(handler); closePanel(); resolve(btns[sel].id); };
      const handler = (a) => {
        if (a === 'left' || a === 'up') { sel = (sel + btns.length - 1) % btns.length; draw(); }
        else if (a === 'right' || a === 'down') { sel = (sel + 1) % btns.length; draw(); }
        else if (a === 'act') pick();
      };
      AW.input.pushModal(handler);
      draw();
    });
  };

  /* ---- notebook ---- */
  ui.notebook = function () {
    if (panelEl && !panelEl.classList.contains('hidden')) return;
    const G = AW.game;
    const V = AW.VERSIONS[G.version];
    const NOTES = AW.NOTES;
    const cards = NOTES.map((n) => {
      const seen = (G.seen && G.seen[n.n]) || [];
      const done = G.done.has(n.n);
      return `<div class="nb ${done ? 'done' : ''}">
  <div class="nbh"><span class="code">${n.n}</span><b>${esc(n.title)}</b><span class="sec">§ ${esc(n.sections)}</span></div>
  ${done ? `<blockquote>“${esc(n.quote)}” <cite>${esc(n.cite)}</cite></blockquote>
  ${['I', 'II', 'III'].filter((v) => seen.includes(v)).map((v) => `<p class="obs"><span class="vv">${v}</span> ${esc(n.observed[v])}</p>`).join('')}
  ${['I', 'II', 'III'].filter((v) => !seen.includes(v)).length ? `<p class="obs dim">Not yet seen as ${['I', 'II', 'III'].filter((v) => !seen.includes(v)).map((v) => AW.VERSIONS[v].name).join(' or ')}.</p>` : ''}`
        : `<p class="obs dim">${esc(n.teaser)}</p>`}
</div>`;
    }).join('');
    openPanel(`
<div class="ptitle">FIELD NOTEBOOK <span class="dim">· Parallax · ${G.done.size}/10</span></div>
<div class="reading"><b>${esc(AW.VERSIONS[G.version].key)} · ${esc(V.name)}.</b> ${esc(V.reading)} <span class="dim">${esc(V.leans)}</span></div>
<div class="nbs">${cards}</div>
<div class="pfoot"><span>Quotes are from the Agentworld brief (Bratton, Antikythera).</span><button class="pbtn">Close</button></div>`, 'p-notebook');
    const close = () => { AW.input.popModal(handler); closePanel(); };
    const handler = (a) => {
      const list = panelEl.querySelector('.nbs');
      if (a === 'down') list.scrollTop += 60;
      else if (a === 'up') list.scrollTop -= 60;
      else if (a === 'act' || a === 'back' || a === 'notebook') close();
    };
    panelEl.querySelector('.pbtn').addEventListener('click', close);
    AW.input.pushModal(handler);
  };

  ui.help = function () {
    if (panelEl && !panelEl.classList.contains('hidden')) return;
    const G = AW.game;
    const V = AW.VERSIONS[G.version];
    openPanel(`
<div class="ptitle">HOW TO PLAY</div>
<div class="help">
<p><kbd>←↑↓→</kbd> / <kbd>WASD</kbd> walk · hold <kbd>Shift</kbd> to run</p>
<p><kbd>Space</kbd> / <kbd>Enter</kbd> talk, read, continue</p>
<p><kbd>L</kbd> lens: <b>${esc(V.lens)}</b>. ${esc(V.lensHint)}</p>
<p><kbd>V</kbd> or <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> switch interpretation. The town re-materializes around you; your progress stays.</p>
<p><kbd>N</kbd> field notebook: each chapter of the brief, with a quote and what you saw.</p>
<p><kbd>M</kbd> sound on/off</p>
<p class="dim">Follow the glowing marker. Ten stops, one per chapter, about five minutes. You can wander off and talk to anyone.</p>
</div>
<div class="pfoot"><span></span><button class="pbtn">Close</button></div>`, 'p-help');
    const close = () => { AW.input.popModal(handler); closePanel(); };
    const handler = (a) => { if (a === 'act' || a === 'back' || a === 'help') close(); };
    panelEl.querySelector('.pbtn').addEventListener('click', close);
    AW.input.pushModal(handler);
  };

  ui.toggleMute = function () {
    AW.audio.setMuted(!AW.audio.muted);
    const b = hud.querySelector('[data-act="mute"]');
    if (b) b.classList.toggle('off', AW.audio.muted);
    ui.toast(AW.audio.muted ? 'Sound off' : 'Sound on', 900);
  };

  /* ================================================================ HUD */
  ui.showHud = (on) => hud.classList.toggle('hidden', !on);
  ui.setVersion = function (v) {
    stage.dataset.v = v;
    document.body.dataset.v = v;
    const V = AW.VERSIONS[v];
    $('#hud-ver').innerHTML = `<b>${v}</b> ${esc(V.name.toUpperCase())}`;
    hud.querySelectorAll('[data-act="v"]').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
    const lb = hud.querySelector('[data-act="lens"]');
    if (lb) lb.title = 'Lens: ' + V.lens + ' (L)';
    $('#lens-name').textContent = V.lens.toUpperCase();
    ui.updateObjective();
  };
  ui.setLens = function (on) {
    hud.querySelector('[data-act="lens"]').classList.toggle('on', on);
    if (on) ui.toast('Lens: **' + AW.VERSIONS[AW.game.version].lens + '**. ' + AW.VERSIONS[AW.game.version].lensHint, 3200);
  };
  ui.updateObjective = function () {
    const G = AW.game;
    const n = G.nextObjective();
    const el = $('#hud-obj');
    if (!n) { el.innerHTML = '<span class="code">✓</span> Field visit complete. Switch worlds or wander.'; return; }
    const note = AW.NOTES[n - 1];
    el.innerHTML = `<span class="code">CH.${n}</span> ${esc(note.title)}`;
  };
  ui.updateHud = function () {
    const G = AW.game;
    $('#cnt-h').textContent = G.counts.h;
    $('#cnt-a').textContent = G.counts.a + (G.counts.sub ? ' +' + G.counts.sub : '');
    const tot = Math.max(1, G.counts.h + G.counts.a + G.counts.sub);
    $('#ratio-h').style.width = Math.max(2, (100 * G.counts.h) / tot) + '%';
  };

  /* ================================================================ title */
  ui.title = function (save) {
    return new Promise((resolve) => {
      const vs = ['I', 'II', 'III'];
      let sel = save ? vs.indexOf(save.v) : 0;
      if (sel < 0) sel = 0;
      titleEl.classList.remove('hidden');
      ui.showHud(false);
      const draw = () => {
        titleEl.innerHTML = `
<div class="tbox">
  <div class="kicker">A PREEMPTIVE ANTHROPOLOGY OF OPEN-WORLD CENTAUR SOCIETIES</div>
  <h1>AGENTWORLD</h1>
  <div class="tsub">Parallax: a five-minute field visit</div>
  <p class="tintro">A town of 312 humans and 31,200 agents, built from the ten chapters of the Agentworld brief. The brief leaves room to interpret, so the town comes in three readings. Pick one to start; switch any time with <kbd>V</kbd>.</p>
  <div class="cards">${vs.map((v, i) => {
    const V = AW.VERSIONS[v];
    return `<button class="card ${i === sel ? 'sel' : ''}" data-i="${i}" data-v="${v}"><span class="rn">${v}</span><b>${esc(V.name)}</b><i>${esc(V.sub)}</i><span class="rd">${esc(V.reading)}</span><span class="ln">${esc(V.leans)}</span></button>`;
  }).join('')}</div>
  <div class="tfoot">
    ${save && save.done.length ? `<button class="tbtn" data-act="continue">Continue (${save.done.length}/10)</button><button class="tbtn ghost" data-act="new">Start over</button>` : `<button class="tbtn" data-act="new">Begin ▶</button>`}
    <span class="keys"><kbd>←</kbd><kbd>→</kbd> choose · <kbd>Space</kbd> begin · best with sound</span>
  </div>
  <div class="credit">An interactive reading of <i>Agentworld</i> by Benjamin Bratton (Antikythera). Original game; all art drawn in code.</div>
</div>`;
        titleEl.querySelectorAll('.card').forEach((el) => {
          el.addEventListener('pointerenter', () => { if (sel !== +el.dataset.i) { sel = +el.dataset.i; preview(); draw(); } });
          el.addEventListener('click', () => { sel = +el.dataset.i; go(save && save.done.length ? 'continue' : 'new'); });
        });
        titleEl.querySelectorAll('.tbtn').forEach((el) => el.addEventListener('click', () => go(el.dataset.act)));
      };
      const preview = () => {
        const G = AW.game;
        if (G.version !== vs[sel]) { G.version = vs[sel]; stage.dataset.v = vs[sel]; document.body.dataset.v = vs[sel]; G.nicheStage = AW.V.initialNiche(vs[sel]); G.buildMap(); }
      };
      const go = (act) => {
        AW.input.popModal(handler);
        titleEl.classList.add('hidden');
        AW.audio.unlock();
        AW.audio.confirm();
        resolve({ version: vs[sel], resume: act === 'continue' ? save : null });
      };
      const handler = (a) => {
        if (a === 'left' || a === 'up') { sel = (sel + 2) % 3; preview(); draw(); AW.audio.text(400); }
        else if (a === 'right' || a === 'down') { sel = (sel + 1) % 3; preview(); draw(); AW.audio.text(400); }
        else if (/^v[1-3]$/.test(a)) { sel = +a[1] - 1; preview(); draw(); }
        else if (a === 'act') go(save && save.done.length ? 'continue' : 'new');
      };
      AW.input.pushModal(handler);
      preview();
      draw();
    });
  };
})();
