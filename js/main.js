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
    AW.game.start(pick.version, pick.resume);
    if (pick.resume) {
      const n = AW.game.nextObjective();
      AW.ui.toast(n ? `Welcome back. Next stop: Ch.${n}, ${AW.NOTES[n - 1].title}.` : 'Welcome back. All ten stops are in your notebook.', 3600);
    } else {
      await AW.tour.intro();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
