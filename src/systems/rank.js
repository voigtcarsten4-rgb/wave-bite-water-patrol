/* Wave Bite - Captain's Run · systems/rank.js
 * Rangpunkte-Logik (kalkulatorisch aus Gameplay-Stats), Rang-Ermittlung,
 * Befoerderungserkennung und Premium-SVG-Insignien (Schulterklappen). */
(function (WB) {
  'use strict';

  // ---- Rangpunkte (RP) -----------------------------------------------------
  // Kalkulatorisch nachvollziehbar: Aufstieg + saubere Einsaetze + Wirtschaft.
  function computeRP() {
    var s = WB.Save.data, st = s.stats || {};
    var rp = (s.captainLevel || 1) * 100
      + (st.deliveries || 0) * 20
      + (st.perfectRuns || 0) * 50
      + Math.floor((st.coinsEarned || 0) / 50);
    return rp;
  }

  function indexForRP(rp) {
    var ranks = WB.data.ranks, idx = 0;
    for (var i = 0; i < ranks.length; i++) if (rp >= ranks[i].rp) idx = i;
    return idx;
  }

  var Rank = {
    computeRP: computeRP,

    current: function () { var rp = computeRP(); var i = indexForRP(rp); return { rank: WB.data.ranks[i], index: i, rp: rp }; },

    progress: function () {
      var rp = computeRP();
      var i = indexForRP(rp);
      var ranks = WB.data.ranks;
      var rank = ranks[i];
      var next = ranks[i + 1] || null;
      var into, span, toNext;
      if (next) { into = rp - rank.rp; span = next.rp - rank.rp; toNext = Math.max(0, Math.min(1, into / span)); }
      else { into = 0; span = 0; toNext = 1; }
      return { rp: rp, index: i, rank: rank, next: next, rpInto: into, rpSpan: span, toNext: toNext };
    },

    // Aktualisiert highestRankIndex und gibt neu erreichte Raenge zurueck (fuer Feier).
    syncAndDetectPromotion: function () {
      var s = WB.Save.data;
      if (s.highestRankIndex == null) s.highestRankIndex = 0;
      var i = indexForRP(computeRP());
      var promotions = [];
      while (s.highestRankIndex < i) { s.highestRankIndex += 1; promotions.push(WB.data.ranks[s.highestRankIndex]); }
      if (promotions.length) WB.Save.save();
      return promotions;
    }
  };

  // ---- SVG-Insignie (Schulterklappe) --------------------------------------
  function starPath(cx, cy, ro, ri) {
    var p = '', a = -Math.PI / 2;
    for (var k = 0; k < 10; k++) {
      var r = (k % 2 === 0) ? ro : ri;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      p += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      a += Math.PI / 5;
    }
    return p + 'Z';
  }

  function marksSVG(rank) {
    var t = rank.t, out = '';
    if (rank.marks <= 0) {
      // Anwaerter: schlichte Kordel-Litze
      return '<rect x="34" y="60" width="32" height="6" rx="3" fill="' + t.cord + '" opacity="0.7"/>';
    }
    if (rank.motif === 'bar') {
      var startY = 52 + (3 - rank.marks) * 9;
      for (var b = 0; b < rank.marks; b++) {
        var y = startY + b * 18;
        out += '<rect x="28" y="' + y + '" width="44" height="8" rx="4" fill="url(#mtl)" stroke="rgba(0,0,0,.25)" stroke-width="1"/>';
      }
      return out;
    }
    // Sterne (gehobener/hoeherer Dienst), zentriert gestapelt
    var fill = t.tier === 3 ? 'url(#au)' : 'url(#ag)';
    var n = rank.marks;
    var cx = 50, gap = 26, totalH = (n - 1) * gap, top = 70 - totalH / 2;
    for (var i = 0; i < n; i++) {
      var cy = top + i * gap;
      out += '<path d="' + starPath(cx, cy, 13, 5.6) + '" fill="' + fill + '" stroke="rgba(0,0,0,.28)" stroke-width="1"/>'
        + '<path d="' + starPath(cx - 3, cy - 3, 4, 1.8) + '" fill="rgba(255,255,255,.7)"/>';
    }
    return out;
  }

  // Liefert eine vollstaendige SVG-Schulterklappe als String.
  function insigniaSVG(rank, size, glow) {
    var t = rank.t;
    var w = size || 100, h = Math.round((size || 100) * 1.4);
    var braid = '';
    if (rank.braid) {
      braid = '<rect x="20" y="20" width="6" height="100" rx="3" fill="url(#au)" opacity=".9"/>'
        + '<rect x="74" y="20" width="6" height="100" rx="3" fill="url(#au)" opacity=".9"/>';
    }
    return '<svg viewBox="0 0 100 140" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" class="insignia">'
      + '<defs>'
      + '<linearGradient id="fld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.field + '"/><stop offset="1" stop-color="#0a1622"/></linearGradient>'
      + '<linearGradient id="au" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4DC9A"/><stop offset=".5" stop-color="#C9A24B"/><stop offset="1" stop-color="#8A6B23"/></linearGradient>'
      + '<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#C7D0DA"/><stop offset="1" stop-color="#8A95A2"/></linearGradient>'
      + '<linearGradient id="mtl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDF2F7"/><stop offset="1" stop-color="#9AA6B3"/></linearGradient>'
      + (glow ? '<filter id="gl"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' : '')
      + '</defs>'
      + '<g ' + (glow ? 'filter="url(#gl)"' : '') + '>'
      + '<rect x="14" y="12" width="72" height="116" rx="14" fill="url(#fld)" stroke="url(#au)" stroke-width="3"/>'
      + '<rect x="20" y="18" width="60" height="104" rx="10" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>'
      + braid
      + marksSVG(rank)
      + '<circle cx="50" cy="120" r="6" fill="url(#au)" stroke="rgba(0,0,0,.3)" stroke-width="1"/>'
      + '<rect x="14" y="12" width="72" height="40" rx="14" fill="rgba(255,255,255,.06)"/>'
      + '</g></svg>';
  }

  WB.Rank = Rank;
  WB.RankInsignia = { svg: insigniaSVG };
})(window.WB = window.WB || {});
