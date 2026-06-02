/* Wave Bite – Water Patrol · ui/skipper.js
 * RS5: Persönliche Spieler-Identität (Funkname). Story-Onboarding beim ersten Start,
 * lokale Speicherung (DSGVO – nur localStorage), Nutzung in Begrüßung/Funk/Briefing/Ergebnis.
 * Bewusst getrennt von WB.Captain (KI-Fahrstil-Profil). Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var KEY = 'wavebite.skipper';
  var FALLBACK = 'Kapitän';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function store(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function clean(n) { return (n || '').replace(/[<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }

  var Skipper = {
    _greeted: false,
    name: function () { var d = load(); return d.name || null; },
    has: function () { return !!this.name(); },
    display: function () { return this.name() || FALLBACK; },
    esc: function (s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    set: function (n) { var c = clean(n), d = load(); if (c) d.name = c; else delete d.name; d.done = true; store(d); this.apply(); return c; },
    clear: function () { var d = load(); delete d.name; d.done = true; store(d); this.apply(); },
    done: function () { return !!load().done; },

    apply: function () { try { var el = document.getElementById('hc-name'); if (el) el.textContent = this.display(); } catch (e) {} },

    firstRun: function (cb) {
      var self = this;
      if (this.done()) { this.apply(); if (cb) cb(); return; }
      this._show(function () { self.apply(); if (cb) cb(); });
    },

    onStart: function () {
      this.apply();
      if (this._greeted) return; this._greeted = true;
      if (!this.has()) return;
      var n = this.esc(this.display());
      setTimeout(function () {
        try { if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Willkommen zurück, ' + n + '. Das Revier wartet.'); } catch (e) {}
      }, 900);
    },

    _show: function (done) {
      var ov = document.getElementById('overlay-skipper');
      if (!ov) { if (done) done(); return; }
      var self = this;
      try { if (WB.Audio) { WB.Audio.unlock(); if (WB.Audio.radio) WB.Audio.radio(); else if (WB.Audio.blaulicht) WB.Audio.blaulicht(); } } catch (e) {}
      var port = (WB.Assets && WB.data && WB.data.lucy) ? WB.Assets.url(WB.data.lucy.portrait) : null;
      ov.innerHTML =
        '<div class="skp-card">'
        + '<div class="skp-radio"><span></span><span></span><span></span> FUNK · LEITSTELLE</div>'
        + (port ? '<div class="skp-port" style="background-image:url(\'' + port + '\')"></div>' : '<div class="skp-port skp-port-fb">⚓</div>')
        + '<div class="skp-from">LENA · EINSATZLEITUNG</div>'
        + '<h3 class="skp-h">Neue Crew an Bord</h3>'
        + '<p class="skp-x">Leitstelle an neues Crewmitglied – willkommen bei der Wave-Bite-Wasserschutz. Wie sollen wir dich im Funkverkehr rufen?</p>'
        + '<input id="skp-input" class="skp-input" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="dein Name, z. B. Carsten" />'
        + '<div class="skp-actions"><button class="btn btn-gold" id="skp-go">⚓ An Bord gehen</button>'
        + '<button class="btn btn-line" id="skp-skip">Überspringen</button></div>'
        + '<div class="skp-note">🔒 Nur lokal auf deinem Gerät gespeichert · keine Anmeldung</div>'
        + '</div>';
      ov.classList.add('show');
      var inp = document.getElementById('skp-input');
      setTimeout(function () { try { if (inp) inp.focus(); } catch (e) {} }, 250);

      function finish(name) {
        self.set(name);
        var dn = self.esc(self.display());
        ov.innerHTML = '<div class="skp-card skp-confirm">'
          + '<div class="skp-from">LUCY · BORD-KI</div>'
          + '<div class="skp-check">✓</div>'
          + '<h3 class="skp-h">Willkommen an Bord, ' + dn + '.</h3>'
          + '<p class="skp-x">Eintrag im Bordcomputer gespeichert. Lucy hat dein Revier vorbereitet – bereit für den ersten Einsatz?</p>'
          + '<div class="skp-actions"><button class="btn btn-gold" id="skp-start">🚤 Einsatz übernehmen</button></div>'
          + '</div>';
        try { if (WB.Audio) { if (WB.Audio.success) WB.Audio.success(); else if (WB.Audio.coin) WB.Audio.coin(); } } catch (e) {}
        var b = document.getElementById('skp-start');
        if (b) b.onclick = function () { ov.classList.remove('show'); setTimeout(function () { ov.innerHTML = ''; }, 350); if (done) done(); };
      }
      var go = document.getElementById('skp-go');
      if (go) go.onclick = function () {
        var v = (inp && inp.value) || '';
        if (!v.trim()) { if (inp) { inp.classList.add('skp-shake'); setTimeout(function () { inp.classList.remove('skp-shake'); }, 500); inp.focus(); } return; }
        finish(v);
      };
      var sk = document.getElementById('skp-skip');
      if (sk) sk.onclick = function () { finish(''); };
      if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (go) go.click(); } });
    }
  };

  WB.Skipper = Skipper;
})(window.WB = window.WB || {});
