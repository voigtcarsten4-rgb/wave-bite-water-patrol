/* Wave Bite – Captain's Run · main.js · Bootstrap */
(function (WB) {
  'use strict';

  function boot() {
    WB.Save.load();
    WB._bootLastPlayed = WB.Save.data.lastPlayed;
    WB.Meta.ensureDaily();
    WB.Meta.ensureWeekly();
    if (WB.Track) { WB.Track.init(); WB.Track.log('game_open'); try { if (/[?&]from=wasserlage/.test(location.search)) WB.Track.log('arrival_from_wasserlage'); } catch(e){} }

    WB.Engine.init('game-canvas');
    WB.Input.init();
    WB.Screens.init();

    // --- PROFESSIONELLES ASSET-MANAGEMENT: kein Schwarzbild beim Start ---
    var CRITICAL = [
      'cockpit_day_1', 'cockpit_night_1', 'cockpit_fog_1',
      'bg_calm_bay_1', 'bg_harbor_marina_1', 'bg_night_lake_1', 'bg_lock_1', 'bg_foggy_channel_1',
      'boat_patrol_threequarter_1', 'boat_speedboat_side_1',
      'char_harbor_master_1', 'char_radio_operator_1', 'char_captain_1',
      'ui_radar_dial_1', 'ui_compass_1', 'station_harbor_office_1'
    ];
    var loaderEl = document.getElementById('boot-loader');
    var barEl = document.getElementById('boot-bar');
    var pctEl = document.getElementById('boot-pct');

    function proceed() {
      if (loaderEl) { loaderEl.classList.add('done'); setTimeout(function () { loaderEl.style.display = 'none'; }, 420); }
      WB.Screens.showStart();
      var st = WB.Save.data.settings;
      var afterIntro = function () {
        if (!st.onboarded) WB.Screens.showOnboarding(function () { st.onboarded = true; WB.Save.save(); if (WB.News) WB.News.maybeShow(); });
        else if (WB.News) WB.News.maybeShow();
        if (WB.Retention) WB.Retention.greetReturn();
      };
      // Intro bei JEDEM Spielstart abspielen (skippbar per Tap).
      var playIntroThen = function () { if (WB.Intro && WB.Intro.playSignature) WB.Intro.playSignature(afterIntro); else if (WB.Intro) WB.Intro.play(afterIntro); else afterIntro(); };
      if (!st.legalAck) {
        WB.Screens.showLegalNotice(function () { st.legalAck = true; WB.Save.save(); playIntroThen(); });
      } else {
        playIntroThen();
      }
    }

    var started = false;
    function go() { if (started) return; started = true; proceed(); }

    if (WB.Assets) {
      WB.Assets.preload(CRITICAL, go, function (l, t) {
        var p = t ? Math.round(l / t * 100) : 100;
        if (barEl) barEl.style.width = p + '%';
        if (pctEl) pctEl.textContent = p + '%';
      });
      setTimeout(go, 9000); // Sicherheitsnetz
    } else { go(); }

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

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.WB = window.WB || {});
