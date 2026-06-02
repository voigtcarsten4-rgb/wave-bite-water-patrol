/* Wave Bite – Water Patrol · systems/captain-profile.js
 * RC3.0 Phase D: KI-Kapitänsprofil. Lernt den Fahrstil aus Live-Metriken (Tempo, Kollisionen,
 * Fahrwasser-Treue, Boost-Nutzung, Fehler) und leitet ein Profil ab. Lucy/Lena reagieren,
 * Schwierigkeit passt sich sanft an. Eigener localStorage-Key, vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var KEY = 'wavebite.captain.v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function blank() { return { runs: 0, coll: 0, cleanSum: 0, boostSum: 0, speedSum: 0, fails: 0 }; }

  var LABEL = { 'praezise':'Präziser Kapitän', 'aggressiv':'Aggressiver Fahrstil', 'risikofreudig':'Risikofreudiger Kapitän',
    'vorsichtig':'Vorsichtiger Kapitän', 'schnell':'Schneller Kapitän', 'lernend':'Lernender Kapitän',
    'erfahren':'Erfahrener Kapitän', 'ausgewogen':'Ausgewogener Kapitän', 'neu':'Neuer Kapitän' };
  var LINE = {
    'praezise':'Saubere Linie wie immer, Kapitän.',
    'aggressiv':'Du fährst hart – Auge auf die Hülle.',
    'risikofreudig':'Mutig unterwegs – Vorsicht an den Engstellen.',
    'vorsichtig':'Ruhige Hand. Heute ruhig etwas mehr Tempo wagen.',
    'schnell':'Schneller Kurs – bleib sauber im Fahrwasser.',
    'erfahren':'Routiniert wie ein Profi. Zeig’s ihnen.',
    'lernend':'Wir wachsen mit jedem Einsatz, Kapitän.',
    'ausgewogen':'Ausgewogener Kurs. Solide Arbeit.'
  };

  WB.Captain = {
    recordMission: function (world, res) {
      try {
        var d = load() || blank(); d.runs += 1;
        var tot = (world && world.totalT) || 1;
        d.coll += (world && world.collisions) || 0;
        d.cleanSum += ((world && world.cleanT) || 0) / tot;
        d.boostSum += ((world && world.boostT) || 0) / tot;
        d.speedSum += ((world && world._spdSum) || 0) / tot;   // Ø-Tempo
        if (res && res.failed) d.fails += 1;
        save(d);
      } catch (e) {}
    },
    profile: function () {
      var d = load();
      if (!d || d.runs < 1) return { style: 'neu', label: LABEL.neu, confidence: 0, traits: [] };
      var n = d.runs, coll = d.coll / n, clean = d.cleanSum / n, boost = d.boostSum / n, spd = d.speedSum / n, failR = d.fails / n;
      var traits = [];
      if (boost > 0.45) traits.push('aggressiv');
      if (coll > 3 || boost > 0.55) traits.push('risikofreudig');
      if (coll < 0.9 && clean > 0.7) traits.push('praezise');
      if (boost < 0.22 && coll < 1.5) traits.push('vorsichtig');
      if (spd > 185) traits.push('schnell');
      if (n >= 6 && coll < 1.5 && clean > 0.65) traits.push('erfahren');
      if (n < 3 || failR > 0.5) traits.push('lernend');
      var style = traits[0] || 'ausgewogen';
      return { style: style, label: LABEL[style] || LABEL.ausgewogen, confidence: Math.min(1, n / 6),
        traits: traits, coll: +coll.toFixed(2), clean: +clean.toFixed(2), boost: +boost.toFixed(2), avgSpeed: Math.round(spd) };
    },
    // sanfte Schwierigkeits-Verschiebung (-0.12..+0.12), erst ab genug Daten
    difficultyBias: function () {
      var p = this.profile(); if (p.confidence < 0.4) return 0;
      var b = 0;
      if (p.traits.indexOf('erfahren') >= 0 || p.traits.indexOf('praezise') >= 0) b += 0.08;
      if (p.traits.indexOf('lernend') >= 0 || p.traits.indexOf('vorsichtig') >= 0) b -= 0.08;
      return Math.max(-0.12, Math.min(0.12, b));
    },
    // Lucy kommentiert den Fahrstil (nur mit genug Vertrauen)
    greet: function () {
      try {
        var p = this.profile(); if (p.confidence < 0.34) return;
        var line = LINE[p.style];
        if (line && WB.LucyHUD && WB.LucyHUD.say) setTimeout(function () { WB.LucyHUD.say('💬 Lucy: ' + line); }, 1300);
      } catch (e) {}
    }
  };
})(window.WB = window.WB || {});
