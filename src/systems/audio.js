/* Wave Bite – Captain's Run · systems/audio.js
 * Dezente, synthetisierte Klänge über WebAudio (keine Asset-Dateien nötig). */
(function (WB) {
  'use strict';
  var ctx = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { ctx = null; }
    return ctx;
  }

  function on() { return WB.Save && WB.Save.data && WB.Save.data.settings.sound; }

  function tone(freq, dur, type, gain) {
    if (!on()) return;
    var c = ensure(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(c.destination);
    var t = c.currentTime;
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }

  WB.Audio = {
    unlock: function () { var c = ensure(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} } },
    click: function () { tone(420, 0.08, 'triangle', 0.08); },
    coin: function () { tone(880, 0.09, 'sine', 0.1); setTimeout(function(){ tone(1320, 0.09, 'sine', 0.08); }, 70); },
    boost: function () { tone(180, 0.25, 'sawtooth', 0.06); },
    hit: function () { tone(110, 0.18, 'square', 0.07); if (WB.Save.data.settings.vibration && navigator.vibrate) navigator.vibrate(40); },
    success: function () { tone(660, 0.12, 'sine', 0.1); setTimeout(function(){ tone(990, 0.16, 'sine', 0.1); }, 120); },
    fail: function () { tone(200, 0.3, 'sawtooth', 0.08); }
  };
})(window.WB = window.WB || {});
