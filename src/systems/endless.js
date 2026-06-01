/* Wave Bite - Water Patrol · systems/endless.js
 * Live Water Region: Lucy (KI-Dispatch) generiert endlos abwechslungsreiche Einsaetze,
 * skaliert mit dem Rang, optional mit Radar-Minispiel. Streak-getrieben. */
(function (WB) {
  'use strict';
  var M = WB.math;
  var MINRANK = { patrol: 0, control: 0, ghost: 1, eco: 1, pursuit: 2, rescue: 2, smuggler: 3, storm: 3 };

  function rng(a) { return Array.isArray(a) ? M.randInt(a[0], a[1]) : a; }

  var Endless = {
    active: false, streak: 0, currentEvent: null,

    start: function () { this.active = true; this.streak = 0; this.next(); },
    stop: function () { this.active = false; },

    buildEvent: function () {
      var rankIdx = WB.Rank.current().index;
      var pool = WB.data.eventTemplates.filter(function (t) { return (MINRANK[t.type] || 0) <= rankIdx; });
      if (!pool.length) pool = WB.data.eventTemplates.slice();
      var tpl = M.pick(pool);
      var L = WB.data.lucy;
      var diff = 1 + rankIdx * 0.07;
      var dist = rng(tpl.distance);
      var brief = M.pick(L.openers) + ' ' + M.pick(tpl.brief) + ' ' + M.pick(L.signoffs);
      return {
        id: 'live_' + Date.now(), type: tpl.type, title: tpl.title, icon: tpl.icon,
        objective: tpl.objective, regionId: tpl.regionId, distance: dist,
        timeLimit: tpl.timeLimit ? rng(tpl.timeLimit) : 0, minigame: tpl.minigame,
        briefChar: tpl.char, briefStation: tpl.station, brief: brief, live: true,
        rewardCoins: Math.round((70 + dist * 0.05) * diff) + (tpl.timeLimit ? 40 : 0),
        rewardXp: Math.round((55 + dist * 0.035) * diff), difficulty: (MINRANK[tpl.type] || 0) + 1
      };
    },

    next: function () {
      if (!this.active) return;
      var ev = this.currentEvent = this.buildEvent();
      WB.Screens.showLucyBriefing(ev, function () {
        if (ev.minigame === 'radar' && WB.MiniRadar) {
          WB.MiniRadar.play({ need: 5, duration: 12000 }, function (r) {
            ev._miniBonus = (r && r.score ? r.score * 12 : 0);
            WB.Game.startEndless(ev);
          });
        } else {
          WB.Game.startEndless(ev);
        }
      });
    }
  };

  WB.Endless = Endless;
})(window.WB = window.WB || {});
