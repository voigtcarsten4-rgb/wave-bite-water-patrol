/* Wave Bite – Water Patrol · game/minigame.js · Minispiel-Dispatcher (modernisierte Einsatzmodule).
 * Routet Typ -> Modul; unbekannt/null -> sofort weiter. Alt-Aliasse (search/lock) auf neue Module. */
(function (WB) {
  'use strict';
  WB.Minigame = {
    play: function (type, cfg, onDone) {
      var R = function (m, d) { return m ? m.play(cfg || d, onDone) : (onDone && onDone({ success: true, score: 0 })); };
      switch (type) {
        case 'radar':  case 'sonar':        return R(WB.MiniRadar,   { need: 4, duration: 14000 });
        case 'funk':                        return R(WB.MiniFunk,    { rounds: 4, duration: 20000 });
        case 'schleuse':                    return R(WB.MiniSchleuse,{ duration: 16000 });
        case 'hafenkontrolle': case 'search':return R(WB.MiniHafen,  { rounds: 4, duration: 22000 });
        case 'rettung': case 'lock':        return R(WB.MiniRettung, { duration: 20000 });
        default: if (onDone) onDone({ success: true, score: 0 });
      }
    }
  };
})(window.WB = window.WB || {});
