/* Wave Bite – Water Patrol · ui/install.js
 * PWA-Installation: Android/Chrome-Prompt einfangen, iOS „Zum Home-Bildschirm"-Anleitung.
 * Spiegelt das Verfahren der Wasserlage-/CEO-Seiten. Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var deferred = null;
  function isStandalone(){ return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function isIos(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; try { mount(); } catch(x){} });
  window.addEventListener('appinstalled', function () { deferred = null; try { mount(); if (WB.Track) WB.Track.log('pwa_installed'); } catch(x){} });

  var Install = {
    available: function () { return !isStandalone() && (deferred || isIos()); },

    open: function () {
      if (WB.Track) WB.Track.log('install_click');
      if (deferred) {
        deferred.prompt();
        if (deferred.userChoice && deferred.userChoice.then) deferred.userChoice.then(function () { deferred = null; try { mount(); } catch(x){} });
        return;
      }
      this._ios();
    },

    _ios: function () {
      var ov = document.getElementById('overlay-install'); if (!ov) return;
      ov.innerHTML = '<div class="inst-card">'
        + '<div class="inst-badge"><img src="assets/icons/apple-touch-icon-180.png?v=91" alt="Wave Bite"/></div>'
        + '<h3 class="inst-h">Wave Bite aufs iPhone holen</h3>'
        + '<p class="inst-x">In wenigen Sekunden liegt das Spiel wie eine echte App auf deinem Home-Bildschirm – offline spielbar, ohne App Store.</p>'
        + '<div class="inst-step"><span class="inst-n">1</span><div>Tippe unten in Safari auf <b>Teilen</b> <span class="inst-share">⬆️</span></div></div>'
        + '<div class="inst-step"><span class="inst-n">2</span><div>Wähle <b>„Zum Home-Bildschirm"</b> ➕</div></div>'
        + '<div class="inst-step"><span class="inst-n">3</span><div>Tippe oben rechts auf <b>„Hinzufügen"</b> ✅</div></div>'
        + '<p class="inst-note">Apple lässt aus Sicherheitsgründen keinen automatischen Button zu – diese drei Schritte genügen.</p>'
        + '<button class="btn btn-gold" id="inst-close">Verstanden</button>'
        + '</div>';
      ov.classList.add('show');
      var c = document.getElementById('inst-close'); if (c) c.onclick = function () { ov.classList.remove('show'); setTimeout(function(){ ov.innerHTML=''; }, 300); };
      ov.onclick = function (e) { if (e.target === ov) { ov.classList.remove('show'); ov.innerHTML=''; } };
    }
  };

  function mount() {
    var menu = document.querySelector('#screen-start .menu'); if (!menu) return;
    var btn = document.getElementById('btn-install');
    if (isStandalone()) { if (btn) btn.style.display = 'none'; return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btn-install'; btn.className = 'btn btn-install';
      btn.onclick = function () { Install.open(); };
      menu.appendChild(btn);
    }
    btn.innerHTML = isIos() ? '📲 Aufs iPhone holen' : '📲 App installieren';
    btn.style.display = Install.available() ? '' : 'none';
  }

  WB.Install = Install;
  document.addEventListener('DOMContentLoaded', function () { setTimeout(function(){ try { mount(); } catch(x){} }, 300); });
})(window.WB = window.WB || {});
