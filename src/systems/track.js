/* Wave Bite - Water Patrol · systems/track.js
 * Lokale Tracking-Bridge. Speichert Nutzungs-Events NUR auf dem Geraet (localStorage),
 * keine Uebertragung, keine Cookies. Vollstaendig fehlergekapselt -> kann das Spiel nie beschaedigen.
 * Hooks fuer spaetere Server-/GA4-Synchronisierung sind vorbereitet (siehe flush()).
 * Opt-out: Save.settings.tracking === false schaltet das Logging ab. */
(function (WB) {
  'use strict';
  var KEY = 'wavebite.track.v1';

  function load() { try { return JSON.parse(window.localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function persist(d) { try { window.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function blank() { return { version: 1, firstSeen: Date.now(), lastSeen: Date.now(), sessions: 0, days: [], counters: {}, events: [], ratings: [] }; }
  function enabled() { try { return !(WB.Save && WB.Save.data && WB.Save.data.settings && WB.Save.data.settings.tracking === false); } catch (e) { return true; } }
  function today() { try { return new Date().toISOString().slice(0, 10); } catch (e) { return '0000-00-00'; } }

  var Track = {
    init: function () {
      try {
        var d = load() || blank();
        d.sessions = (d.sessions || 0) + 1;
        d.lastSeen = Date.now();
        var day = today(); if (d.days.indexOf(day) < 0) d.days.push(day);
        persist(d);
      } catch (e) {}
    },
    log: function (ev, props) {
      try {
        if (!enabled()) return;
        var d = load() || blank();
        d.counters[ev] = (d.counters[ev] || 0) + 1;
        d.lastSeen = Date.now();
        d.events.push({ e: ev, t: Date.now(), p: props || null });
        if (d.events.length > 600) d.events = d.events.slice(-600);
        persist(d);
        try { if (WB.GA && WB.GA.event) WB.GA.event(ev, props || {}); } catch (e) {}
      } catch (e) {}
    },
    rating: function (stars, comment) {
      try {
        var d = load() || blank();
        d.ratings.push({ s: stars, c: String(comment || '').slice(0, 240), t: Date.now() });
        d.counters['rating_submitted'] = (d.counters['rating_submitted'] || 0) + 1;
        persist(d);
        try { if (WB.GA && WB.GA.event) WB.GA.event('rating_submitted', { stars: stars }); } catch (e) {}
      } catch (e) {}
    },
    data: function () { return load() || blank(); },
    setConsent: function (on) { try { if (WB.Save && WB.Save.data) { WB.Save.data.settings.tracking = !!on; WB.Save.save(); } } catch (e) {} },
    // Platzhalter fuer spaetere Server-/GA4-Synchronisierung (additiv, optional).
    flush: function () { /* TODO: an Wasserlage-Endpoint / GA4 senden, sobald Consent + Endpoint vorhanden. */ }
  };

  WB.Track = Track;
})(window.WB = window.WB || {});
