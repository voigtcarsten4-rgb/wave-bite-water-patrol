/* Wave Bite – Captain's Run · systems/input.js
 * Touch- (On-Screen-Buttons) und Tastatursteuerung. */
(function (WB) {
  'use strict';
  var state = { left: false, right: false, throttle: false, boost: false };

  function bindButton(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    var set = function (v) { return function (e) { e.preventDefault(); state[key] = v; if (v) WB.Audio.unlock(); }; };
    el.addEventListener('pointerdown', set(true));
    el.addEventListener('pointerup', set(false));
    el.addEventListener('pointerleave', set(false));
    el.addEventListener('pointercancel', set(false));
    // Verhindert ungewolltes Text-Markieren / Scrollen
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function onKey(down) {
    return function (e) {
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': state.left = down; break;
        case 'ArrowRight': case 'd': case 'D': state.right = down; break;
        case 'ArrowUp': case 'w': case 'W': state.throttle = down; break;
        case ' ': case 'Spacebar': state.boost = down; e.preventDefault(); break;
        case 'p': case 'P': if (down && WB.Game) WB.Game.togglePause(); break;
        default: return;
      }
    };
  }

  WB.Input = {
    state: state,
    init: function () {
      bindButton('btn-left', 'left');
      bindButton('btn-right', 'right');
      bindButton('btn-throttle', 'throttle');
      bindButton('btn-boost', 'boost');
      window.addEventListener('keydown', onKey(true));
      window.addEventListener('keyup', onKey(false));
    },
    reset: function () { state.left = state.right = state.throttle = state.boost = false; }
  };
})(window.WB = window.WB || {});
