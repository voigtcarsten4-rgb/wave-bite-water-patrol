/* Wave Bite – Captain's Run · main.js · Bootstrap */
(function (WB) {
  'use strict';

  function boot() {
    WB.Save.load();
    WB.Meta.ensureDaily();
    WB.Meta.ensureWeekly();
    if (WB.Track) { WB.Track.init(); WB.Track.log('game_open'); }

    WB.Engine.init('game-canvas');
    WB.Input.init();
    WB.Screens.init();
    if (WB.Assets) WB.Assets.preload(['cockpit_day_1', 'bg_calm_bay_1', 'bg_harbor_marina_1', 'bg_night_lake_1', 'bg_lock_1'], null);
    WB.Screens.showStart();

    // Erststart: Datenschutz-Notiz -> Lucy-Onboarding (einmalig)
    var st = WB.Save.data.settings;
    if (!st.legalAck) {
      WB.Screens.showLegalNotice(function () {
        st.legalAck = true; WB.Save.save();
        var afterIntro = function () {
          if (!st.onboarded) WB.Screens.showOnboarding(function () { st.onboarded = true; WB.Save.save(); });
        };
        if (WB.Intro && !st.introSeen) { st.introSeen = true; WB.Save.save(); WB.Intro.play(afterIntro); }
        else afterIntro();
      });
    }

    // Audio bei erster Interaktion freischalten (mobile Autoplay-Policy)
    var unlock = function () { WB.Audio.unlock(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);

    // PWA Service Worker (nur über http/https aktiv; lokal per file:// wird übersprungen)
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('service-worker.js').catch(function () {});
    }

    // PWA-Install-Tracking (lokal)
    window.addEventListener('beforeinstallprompt', function () { if (WB.Track) WB.Track.log('pwa_prompt'); });
    window.addEventListener('appinstalled', function () { if (WB.Track) WB.Track.log('pwa_installed'); });

    // Versteckt die Lade-Anzeige
    var loader = document.getElementById('boot-loader');
    if (loader) loader.style.display = 'none';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.WB = window.WB || {});
