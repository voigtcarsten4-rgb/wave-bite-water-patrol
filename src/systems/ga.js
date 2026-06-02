/* Wave Bite - Water Patrol · systems/ga.js
 * Google Analytics 4 (consent-gated). Mess-ID = Wave-Bite-Property.
 * Laedt gtag ERST nach Einwilligung (DSGVO). Spiegelt WB.Track-Events nach GA4.
 * Opt-out: Einstellungen -> Statistik aus (WB.Save.settings.tracking=false). Fehlergekapselt. */
(function (WB) {
  'use strict';
  var ID = 'G-7JNDG0B4KQ';
  var CK = 'wavebite.consent';     // 'granted' | 'denied' | null
  var loaded = false, queue = [];

  function consent() { try { return localStorage.getItem(CK); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CK, v); } catch (e) {} }
  function trackingOff() { try { return WB.Save && WB.Save.data && WB.Save.data.settings && WB.Save.data.settings.tracking === false; } catch (e) { return false; } }

  function loadGA() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID, { anonymize_ip: true });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
    // gepufferte Events nachsenden
    for (var i = 0; i < queue.length; i++) { try { window.gtag('event', queue[i].n, queue[i].p); } catch (e) {} }
    queue = [];
  }

  var GA = {
    init: function () {
      var c = consent();
      if (c === 'granted' && !trackingOff()) loadGA();
      if (c == null) this._scheduleBanner();
    },
    grant: function () {
      setConsent('granted');
      try { if (WB.Save && WB.Save.data) { WB.Save.data.settings.tracking = true; WB.Save.save(); } } catch (e) {}
      loadGA(); this._hideBanner();
      this.event('consent_granted', {});
    },
    deny: function () {
      setConsent('denied');
      try { if (WB.Save && WB.Save.data) { WB.Save.data.settings.tracking = false; WB.Save.save(); } } catch (e) {}
      queue = []; this._hideBanner();
    },
    // Von WB.Track gespiegelte Events
    event: function (n, p) {
      try {
        if (trackingOff()) return;
        p = p || {}; if (typeof p !== 'object') p = { value: p }; p.app = 'game';
        if (loaded && window.gtag) { window.gtag('event', n, p); }
        else if (consent() !== 'denied') { queue.push({ n: n, p: p }); if (queue.length > 80) queue.shift(); }
      } catch (e) {}
    },

    _scheduleBanner: function () {
      var self = this, tries = 0;
      var iv = setInterval(function () {
        tries++;
        var ss = document.getElementById('screen-start');
        var intro = document.getElementById('intro');
        var introOn = intro && intro.classList.contains('show');
        if (consent() != null) { clearInterval(iv); return; }
        if (ss && ss.classList.contains('active') && !introOn) { clearInterval(iv); self._showBanner(); }
        if (tries > 80) clearInterval(iv);
      }, 700);
    },
    _showBanner: function () {
      if (document.getElementById('ga-consent')) return;
      var host = document.getElementById('app') || document.body;
      var d = document.createElement('div'); d.id = 'ga-consent'; d.className = 'ga-consent';
      d.innerHTML = '<div class="ga-c-txt">🔒 Wir messen anonym mit <b>Google Analytics</b>, um Wave Bite zu verbessern – IP-anonymisiert, kein Verkauf von Daten, jederzeit in den Einstellungen abschaltbar.</div>'
        + '<div class="ga-c-btns"><button class="btn btn-line" id="ga-deny">Ablehnen</button>'
        + '<button class="btn btn-gold" id="ga-accept">Akzeptieren</button></div>';
      host.appendChild(d);
      requestAnimationFrame(function(){ d.classList.add('in'); });
      var a = document.getElementById('ga-accept'), n = document.getElementById('ga-deny'), self = this;
      if (a) a.onclick = function () { self.grant(); };
      if (n) n.onclick = function () { self.deny(); };
    },
    _hideBanner: function () {
      var d = document.getElementById('ga-consent');
      if (d) { d.classList.remove('in'); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 350); }
    },
    // Aus Einstellungen aufrufbar
    reopenConsent: function () { try { localStorage.removeItem(CK); } catch (e) {} this._showBanner(); }
  };

  WB.GA = GA;
  document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { try { GA.init(); } catch (e) {} }, 400); });
})(window.WB = window.WB || {});
