/* Wave Bite – Water Patrol · ui/wasserlage.js
 * RC3.0: Wasserlage-Cockpit-Instrument. Kompakte Live-Lage (Ampel/Wetter/Revier/Hinweis) als Bord-Display,
 * verlinkt zur Wasserlage 2.0. Datengetrieben aus WB.LivingWorld. Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var WL_URL = 'https://voigtcarsten4-rgb.github.io/wasserlage/index.html?from=game';

  function lage() {
    var d = null, stro = 50;
    try { d = WB.LivingWorld.day(); stro = WB.LivingWorld.stroemung(); } catch (e) {}
    var wId = d && d.weather ? d.weather.id : 'wolkig';
    var wLabel = d && d.weather ? (d.weather.label || d.weather.id) : 'wechselhaft';
    var wIcon = d && d.weather ? (d.weather.icon || '🌤️') : '🌤️';
    var spec = d && d.special ? d.special.label : null;
    var amp, ampTxt, hint;
    if (wId === 'gewitter') { amp = 'red'; ampTxt = 'WARNSTUFE ROT'; hint = 'Sturm/Gewitter – nur erfahrene Fahrten.'; }
    else if (wId === 'nebel' || stro >= 72) { amp = 'amber'; ampTxt = 'WARNSTUFE GELB'; hint = (wId === 'nebel' ? 'Dichter Nebel – Sicht beachten.' : 'Starke Strömung gemeldet.'); }
    else { amp = 'green'; ampTxt = 'REVIERE FREI'; hint = 'Gute Bedingungen auf den Revieren.'; }
    return { amp: amp, ampTxt: ampTxt, wIcon: wIcon, wLabel: wLabel, stro: stro, spec: spec, hint: hint };
  }

  function html() {
    var L = lage();
    var dot = '<span class="wl-dot ' + L.amp + '"></span>';
    return '<div class="wl-head"><span class="wl-title">🌊 WASSERLAGE · LIVE</span>' + dot + '</div>'
      + '<div class="wl-amp ' + L.amp + '">' + L.ampTxt + '</div>'
      + '<div class="wl-rows">'
      + '<div class="wl-row"><span>Wetter</span><b>' + L.wIcon + ' ' + L.wLabel + '</b></div>'
      + '<div class="wl-row"><span>Strömung</span><b>' + L.stro + '%</b></div>'
      + (L.spec ? '<div class="wl-row"><span>Lage</span><b>' + L.spec + '</b></div>' : '')
      + '</div>'
      + '<div class="wl-hint">' + L.hint + '</div>'
      + '<button class="wl-btn" id="wl-open">🔗 Wasserlage öffnen</button>';
  }

  var WL = {
    mount: function (id) {
      try {
        var host = document.getElementById(id || 'wasserlage-cockpit');
        if (!host) return;
        var fromWL = false; try { fromWL = /[?&]from=wasserlage/.test(location.search); } catch(e){}
        host.innerHTML = (fromWL ? '<a class="wl-back" id="wl-back" href="https://voigtcarsten4-rgb.github.io/wasserlage/index.html" target="_blank" rel="noopener">← Zurück zur Wasserlage</a>' : '') + html();
        var bk = document.getElementById('wl-back'); if (bk) bk.onclick = function(){ if (WB.Track) WB.Track.log('return_to_wasserlage'); };
        var btn = document.getElementById('wl-open');
        if (btn) btn.onclick = function () {
          if (WB.Track) WB.Track.log('wasserlage_cockpit_open');
          try { window.open(WL_URL, '_blank', 'noopener'); } catch (e) { location.href = WL_URL; }
        };
      } catch (e) {}
    },
    refresh: function (id) { this.mount(id); }
  };
  WB.Wasserlage = WL;
})(window.WB = window.WB || {});
