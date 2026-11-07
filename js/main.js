/* Agentworld: Parallax — boot: title screen, then the field visit. */
'use strict';
(function () {
  const AW = window.AW;

  async function boot() {
    AW.ui.init();
    AW.game.init();
    const params = new URLSearchParams(location.search);
    const save = params.has('fresh') ? null : AW.game.load();
    const pick = await AW.ui.title(save);
    AW.game.start(pick.version, pick.resume, pick.day);
    if (pick.fresh2) {
      await AW.day2.enter({ fromTitle: true, fresh: true });
    } else if (pick.resume) {
      const g = AW.game;
      const n = g.nextObjective();
      AW.ui.toast(n ? `Welcome back. Next stop: ${AW.tour.stopName(n)}.`
        : g.day === 2 ? 'Welcome back. Tuesday is over: talk to Mira to go back to Day 1, or wander.'
          : 'Welcome back. All ten stops are in your notebook. Talk to Mira to start Day 2.', 3600);
    } else {
      await AW.tour.intro();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
