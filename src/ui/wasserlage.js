/* Wave Bite – Water Patrol · ui/wasserlage.js
 * RC4 Priorität 3: Cockpit-Instrumenten-Cluster (Armaturenbrett) statt externer Box.
 * Werte aus WB.LivingWorld (Revier-Lage-Simulation des Spiels) – als Bord-Instrumente dargestellt.
 * Ein einziger dezenter Zugang zur Wasserlage 2.0. Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var WL_URL = 'https://voigtcarsten4-rgb.github.io/wasserlage/index.html?from=game';
  var WIND = { klar:[8,'NW'], wolkig:[13,'W'], regen:[19,'SW'], nebel:[6,'N'], gewitter:[31,'NW'], sturm:[34,'W'] };

  function lage() {
    var d = null, stro = 50;
    try { d = WB.LivingWorld.day(); stro = WB.LivingWorld.stroemung(); } catch (e) {}
    var wId = d && d.weather ? d.weather.id : 'wolkig';
    var wLabel = d && d.weather ? (d.weather.label || wId) : 'wechselhaft';
    var wIcon = d && d.weather ? (d.weather.icon || '🌤️') : '🌤️';
    var spec = d && d.special ? d.special.label : null, specId = d && d.special ? d.special.id : null;
    var wind = WIND[wId] || [12, 'W']; var boen = Math.round(wind[0] * 1.45);
    var amp, ampTxt, hint;
    if (wId === 'gewitter' || wId === 'sturm') { amp = 'red'; ampTxt = 'WARNSTUFE ROT'; hint = 'Sturm/Gewitter – nur erfahrene Fahrten.'; }
    else if (wId === 'nebel' || stro >= 72) { amp = 'amber'; ampTxt = 'WARNSTUFE GELB'; hint = (wId === 'nebel' ? 'Dichter Nebel – Sicht beachten.' : 'Starke Strömung gemeldet.'); }
    else { amp = 'green'; ampTxt = 'REVIERE FREI'; hint = 'Gute Bedingungen auf den Revieren.'; }
    var schleuse = (specId === 'razzia' || wId === 'gewitter') ? ['red','✖ Störung'] : (stro >= 72 ? ['amber','⚠ Verzögerung'] : ['green','✓ Offen']);
    var windDir = { N:0, NW:-45, W:-90, SW:-135, S:180 }[wind[1]] || 0;
    return { amp:amp, ampTxt:ampTxt, wIcon:wIcon, wLabel:wLabel, stro:stro, spec:spec, hint:hint,
      wind:wind[0], windCard:wind[1], windDir:windDir, boen:boen, schleuse:schleuse };
  }

  function gauge(L) {
    // Wind-Instrument (Zeiger dreht nach Windrichtung), Strömung-Balken, Ampel, Schleuse
    return '<div class="wl-inst">'
      + '<div class="wl-i wl-wind"><div class="wl-dial"><span class="wl-needle" style="transform:rotate(' + L.windDir + 'deg)"></span></div>'
        + '<div class="wl-i-lbl">WIND</div><div class="wl-i-val">' + L.wind + ' km/h ' + L.windCard + '</div><div class="wl-i-sub">Böen ' + L.boen + '</div></div>'
      + '<div class="wl-i wl-stro"><div class="wl-i-lbl">STRÖMUNG</div><div class="wl-bar"><span style="width:' + L.stro + '%"></span></div>'
        + '<div class="wl-i-val">' + L.stro + '%</div></div>'
      + '<div class="wl-i"><div class="wl-i-lbl">REVIER</div><div class="wl-amp ' + L.amp + '">' + L.ampTxt + '</div>'
        + '<div class="wl-i-sub">' + L.wIcon + ' ' + L.wLabel + '</div></div>'
      + '<div class="wl-i"><div class="wl-i-lbl">SCHLEUSE</div><div class="wl-sch ' + L.schleuse[0] + '">' + L.schleuse[1] + '</div>'
        + (L.spec ? '<div class="wl-i-sub">' + L.spec + '</div>' : '<div class="wl-i-sub">Betrieb normal</div>') + '</div>'
      + '</div>';
  }

  var WL = {
    mount: function (id) {
      try {
        var host = document.getElementById(id || 'wasserlage-cockpit');
        if (!host) return;
        var L = lage();
        var fromWL = false; try { fromWL = /[?&]from=wasserlage/.test(location.search); } catch (e) {}
        host.innerHTML = (fromWL ? '<a class="wl-back" id="wl-back" href="https://voigtcarsten4-rgb.github.io/wasserlage/index.html" target="_blank" rel="noopener">← Zurück zur Wasserlage</a>' : '')
          + '<div class="wl-head"><span class="wl-title">⚓ REVIER-INSTRUMENTE</span><span class="wl-dot ' + L.amp + '"></span></div>'
          + gauge(L)
          + '<div class="wl-foot"><span class="wl-hint">' + L.hint + '</span><a class="wl-link" id="wl-open" href="' + WL_URL + '" target="_blank" rel="noopener">🌊 Revierdaten</a></div>';
        var bk = document.getElementById('wl-back'); if (bk) bk.onclick = function () { if (WB.Track) WB.Track.log('return_to_wasserlage'); };
        var op = document.getElementById('wl-open'); if (op) op.onclick = function () { if (WB.Track) WB.Track.log('wasserlage_cockpit_open'); };
      } catch (e) {}
    },
    refresh: function (id) { this.mount(id); },
    lage: lage
  };
  WB.Wasserlage = WL;
})(window.WB = window.WB || {});
