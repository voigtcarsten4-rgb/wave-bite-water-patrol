/* Wave Bite – Water Patrol · game/ai.js
 * Adaptive Schwierigkeits-KI ("Director"): schätzt das Können des Spielers aus dem
 * Speicherstand UND der Live-Performance und liefert eine Schwierigkeit 0..1.
 * Ziel: optimales Spannungs-Erlebnis – fordert starke Spieler, entlastet schwächere. */
(function (WB) {
  'use strict';
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  WB.AI = {
    // Grundkönnen aus Historie (0..1)
    skill: function () {
      var s = (WB.Save && WB.Save.data) || {};
      var st = s.stats || {};
      var runs = st.runs || 0, perf = st.perfectRuns || 0;
      var lvl = s.captainLevel || 1;
      if (runs < 2) return 0.28;                       // Anfänger sanft starten
      var hitRate = perf / Math.max(1, runs);          // Anteil perfekter Läufe
      var lvlPart = clamp(lvl / 20, 0, 1);
      var bias = 0; try { if (WB.Captain) bias = WB.Captain.difficultyBias(); } catch (e) {}
      return clamp(hitRate * 0.62 + lvlPart * 0.30 + 0.08 + bias, 0.12, 1);
    },

    // Live-Schwierigkeit für die aktuelle Welt: berücksichtigt Schaden & Kollisionen,
    // damit ein gerade kämpfender Spieler nicht überfordert wird (Rubber-Banding).
    difficulty: function (world) {
      var base = this.skill();
      var integ = (world && world.boat) ? world.boat.integrity : 1;
      var col = world ? (world.collisions || 0) : 0;
      var live = base - col * 0.045 - (1 - integ) * 0.22;
      return clamp(live, 0.1, 1);
    },

    label: function (d) {
      return d < 0.33 ? 'RUHIG' : (d < 0.6 ? 'STANDARD' : (d < 0.82 ? 'FORDERND' : 'EXTREM'));
    }
  };
})(window.WB = window.WB || {});
