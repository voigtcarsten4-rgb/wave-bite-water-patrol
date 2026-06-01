/* Wave Bite – Water Patrol · ui/lucy.js
 * LUCY – Bord-KI als lebendiges Produktmerkmal: animierter Avatar, begrüßt, kommentiert Wetter,
 * gibt Strömungs-/Lotse-Hinweise (aus WB.LivingWorld), wechselnde Zeilen, anklickbar. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  var LucyHUD = {
    _i: 0, _lines: [], _t: null,
    mount: function () {
      var host = $('screen-start'); if (!host) return;
      if (!$('lucy-hud')) {
        var av = WB.Assets && WB.Assets.url('char_lucy');
        var el = document.createElement('div'); el.id = 'lucy-hud'; el.className = 'lucy-hud';
        el.innerHTML = '<div class="lucy-av"' + (av ? ' style="background-image:url(\'' + av + '\')"' : '') + '><span class="lucy-scan"></span><span class="lucy-ring"></span></div>'
          + '<div class="lucy-bubble"><div class="lucy-name">● LUCY · BORD-KI</div><div class="lucy-text" id="lucy-text"></div></div>';
        host.appendChild(el);
        var self = this; el.addEventListener('click', function () { self._i++; self.render(); });
      }
      this.refresh();
    },
    refresh: function () {
      this._lines = this.buildLines(); this._i = 0; this.render();
      if (this._t) clearInterval(this._t);
      var self = this; this._t = setInterval(function () { self._i++; self.render(); }, 6500);
    },
    render: function () {
      var t = $('lucy-text'); if (!t || !this._lines.length) return;
      t.textContent = this._lines[this._i % this._lines.length];
    },
    buildLines: function () {
      var L = [], h = new Date().getHours();
      L.push(h < 11 ? 'Systeme bereit. Guten Morgen, Kapitän.'
           : h < 17 ? 'Alle Systeme online, Kapitän.'
           : h < 22 ? 'Schichtbeginn. Ich bin bei dir.'
           : 'Nachtbetrieb aktiv. Bleib wachsam.');
      if (WB.LivingWorld) {
        var w = WB.LivingWorld.day().weather;
        var wc = { klar:'Klare Sicht – ideal fürs Revier.', wolkig:'Bewölkt, Sicht gut.',
          nebel:'Nebel – ich übernehme das Radar.', wind:'Frischer Wind, halte Kurs.',
          regen:'Regen – Vorsicht auf nassem Deck.', gewitter:'Gewitter gemeldet – höchste Vorsicht.',
          nacht:'Nacht – Blaulicht und Spotlight bereit.' };
        L.push(wc[w.id] || ('Wetterlage: ' + w.label));
        var akt = WB.LivingWorld.stroemung();
        L.push('Strömungs-Aktivität bei ' + akt + '%. ' + (akt > 70 ? 'Erhöhte Wachsamkeit empfohlen.' : 'Lage stabil.'));
        L.push('Hinweis: ' + WB.LivingWorld.week().lotse);
      }
      L.push('Radar, Navigation, Bedrohungen – ich behalte alles im Blick.');
      return L;
    }
  };
  WB.LucyHUD = LucyHUD;
})(window.WB = window.WB || {});
