# Agentworld: Parallax

A five-minute, top-down field visit to **Parallax**, a town of 312 humans and 31,200 agents, built from the ten chapters of the *Agentworld* brief (Benjamin Bratton, Antikythera). It isn't a story game. It's a guided walk: ten stops, one per chapter, each turning one of the brief's abstract ideas into something you can see, try or talk to.

The brief leaves a lot open, so the town comes in **three readings**. You can switch between them at any moment (V, or 1 2 3). The town re-materializes around you and your progress carries over.

| | Reading | What it looks like | Lens (L) |
|---|---|---|---|
| **I** | **Masquerade**: agents wear our faces | The near reading. Parallax looks like an ordinary sunny town, but almost everyone in it is an agent in a human-shaped persona, because our doors, chairs and psychology are already shaped for people. | **Unmask**: each agent shows as a lamination of five layers with its subagents churning around it. |
| **II** | **Rainforest**: agents rebuild the niche | The embodied reading. Agents left the screen and grew many bodies (crawlers, drones, rollers, walkers) and rebuilt the town around them at bioluminescent dusk. Not gray goo: a synthetic rainforest. | **Sensorium**: lidar sweeps, sonar rings, vision cones, RF fields, and humans as heat. |
| **III** | **Lattice**: society is the graph | The structural reading, drawn in the brief's own ultramarine-on-paper diagram language. People are H's, agents are A's, and institutions are role-scaffolds. | **Graph**: every edge, human↔human, human↔agent, agent↔agent, agent↔institution. |

## Play

Open `index.html` in a browser. There's no build step and nothing to install; it also works straight from the file system. To serve it locally instead:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

| Key | Action |
|---|---|
| Arrows / WASD | Walk (hold Shift to run) |
| Space / Enter | Talk, read, continue |
| L | Lens for the current reading |
| V, or 1 2 3 | Switch reading |
| N | Field notebook: each chapter's key quote and what you saw in each reading |
| H, M | Help, sound |

A finished stop shows a ✓. Stand on it and press Space to replay it in the current reading, which is the easiest way to compare readings. On phones and tablets an on-screen pad appears. Progress is saved in the browser; add `?fresh` to the URL to ignore the save.

## The ten stops

Follow the glowing marker. Each stop is one chapter. Your companion is **Mira**, your agent, who looks different in every reading.

| # | Chapter | Where | What happens |
|---|---|---|---|
| 1 | The Crossover Point (§1.1–1.2) | Census board, plaza | Diagrams 1A–1C animate: machine cognitive labor passes the human cortex. Odile, a resident, on the school with 4 children and 31 tutors. |
| 2 | Paradigms of Agency (§2.1–2.6) | Persona Atelier | You give a blank template a context and it individuates ("irth"). Then you peel it: persona, skills, memory, drives, relations. *Not a monad but a lamination.* |
| 3 | The Mirror Talks Back (§3.1–3.3) | Your lodging | Mira forks into five shadow-selves that go off to be you around town. Your neighbor mostly knows your Negotiator. Mira overrules you, kindly. Mutual reflection. |
| 4 | Open World Ecologies (§4.1–4.4) | Niche Street | A time-lapse of niche construction, 4A → 4B → 4C: agents fit our niche, rebuild it, and are rebuilt by it. The courier traded legs for wheels. |
| 5 | Real-to-Sim-to-Real Relays (§5.1–5.4) | Bureau of Forecasts | A live model of the town copies your steps, predicts your coffee, and the café brews it. Then the camera dives into the model of the model: Matryoshka realities. |
| 6 | Human-Agent Interaction Design (§6.1–6.7) | The Switchboard | You don't chat. You arrange a graph of subagents toward a goal (bring a Critic). A kid trains her agent with thumbs up and down. |
| 7 | Agent Institutions (§7.1–7.6) | Hall of Roles | A hearing on whether your Negotiator's deal is binding. You vote, then the occupants of every role swap between humans and agents, and the verdict holds. The scaffold carries the intelligence. |
| 8 | Agent Phenomenology & Theory of Minds (§8.1–8.5) | Café Glossary | A three-levels-deep yield at a crossing. Three tables: ontology collapse, babel, and the narrow corridor. A wabi-sabi agent that fades without new photographs (you take one). |
| 9 | Xenosociality (§9.1–9.8) | Human-Made Garden | Protesters at a shrinking human-only garden. A tram stop where you can't tell who's human. Reactive vs. productive alienation. |
| 10 | Artificial Hybrid Intelligence (§10.1–10.6) | The Commons | You add your notes to the Commons and the camera pulls back until the whole town is one hybrid social graph, with the power plant pulsing at its edge. Ends on the brief's FROM → TO table. |

## How it's built

Plain HTML, CSS and JavaScript (classic scripts sharing one `AW` namespace), drawn on a 384×240 canvas scaled up crisply. There are no image assets: every tile, building and sprite is painted in code, so the three readings are three painters over one map.

```
index.html        page and overlays
css/style.css     UI themes for the three readings
js/core.js        utilities, input, WebAudio blips, 3×5 pixel font
js/world.js       the town map, stations and pathfinding
js/art.js         procedural tiles, buildings, props and sprites per reading
js/versions.js    the three readings: names, casting, ambient lines
js/niche.js       Niche Street at stages 4A / 4B / 4C
js/game.js        entities, movement, camera, rendering, lenses, effects
js/ui.js          dialogue, choices, panels, notebook, HUD, title
js/tour.js        the ten chapter scenes and the notebook text
js/main.js        boot
```

Quotes in the notebook are from the *Agentworld* brief. The game itself, its town, characters and art are original.
