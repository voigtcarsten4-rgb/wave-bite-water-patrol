/* Wave Bite – Captain's Run · systems/progression.js
 * XP-Kurve, Level, Ränge, effektive Bootswerte, Belohnungsverbuchung. */
(function (WB) {
  'use strict';

  var RANKS = [
    { level: 1, name: 'Deckhand' },
    { level: 5, name: 'Skipper' },
    { level: 10, name: 'Captain' },
    { level: 16, name: 'Commodore' },
    { level: 24, name: 'Fleet Admiral' }
  ];

  var P = {
    xpForLevel: function (n) { return Math.round(100 * Math.pow(n, 1.35)); },

    rankForLevel: function (level) {
      var r = RANKS[0].name;
      for (var i = 0; i < RANKS.length; i++) if (level >= RANKS[i].level) r = RANKS[i].name;
      return r;
    },

    // Effektive Werte = Basisboot + Upgrades (gespeichert pro Boot)
    effectiveStats: function (boatId) {
      var base = WB.data.boatById(boatId);
      var owned = WB.Save.data.ownedBoats[boatId];
      var up = (owned && owned.upgrades) || { motor: 0, rudder: 0, boost: 0, hull: 0 };
      var byTrack = {};
      for (var i = 0; i < WB.data.upgrades.length; i++) { var u = WB.data.upgrades[i]; byTrack[u.track] = u; }
      function add(stat, track) {
        var u = byTrack[track];
        return (u ? (up[track] || 0) * u.perLevel : 0);
      }
      return {
        id: base.id, name: base.name, color: base.color,
        speed: base.speed + add('speed', 'motor'),
        handling: base.handling + add('handling', 'rudder'),
        boost: base.boost + add('boost', 'boost'),
        stability: base.stability + add('stability', 'hull'),
        cargo: base.cargo,
        prestige: base.prestige
      };
    },

    // Verbucht Coins/XP, regelt Level-Ups, aktualisiert Rang. Gibt Info zurück.
    grant: function (coins, xp) {
      var s = WB.Save.data;
      s.coins += coins;
      s.stats.coinsEarned += coins;
      s.xp += xp;
      var leveledTo = null;
      while (s.xp >= P.xpForLevel(s.captainLevel)) {
        s.xp -= P.xpForLevel(s.captainLevel);
        s.captainLevel += 1;
        leveledTo = s.captainLevel;
      }
      s.captainName = s.captainName || 'Captain';
      var newRank = P.rankForLevel(s.captainLevel);
      if (leveledTo && WB.Track) WB.Track.log('level_up', { level: leveledTo });
      WB.Save.save();
      return { leveledTo: leveledTo, rank: newRank };
    }
  };

  WB.Progression = P;
})(window.WB = window.WB || {});
