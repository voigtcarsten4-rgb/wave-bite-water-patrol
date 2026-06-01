/* Wave Bite – Water Patrol · game/minigame.js · Minispiel-Dispatcher.
 * Routet einen Minispiel-Typ auf das passende Modul; unbekannt/null -> sofort weiter. */
(function (WB) {
  'use strict';
  WB.Minigame = {
    play: function (type, cfg, onDone) {
      if (type === 'radar'  && WB.MiniRadar)  return WB.MiniRadar.play(cfg || { need: 5, duration: 12000 }, onDone);
      if (type === 'lock'   && WB.MiniLock)   return WB.MiniLock.play(cfg || { need: 3, duration: 15000 }, onDone);
      if (type === 'search' && WB.MiniSearch) return WB.MiniSearch.play(cfg || { need: 3, cells: 9, duration: 13000 }, onDone);
      if (onDone) onDone({ success: true, score: 0 });
    }
  };
})(window.WB = window.WB || {});
