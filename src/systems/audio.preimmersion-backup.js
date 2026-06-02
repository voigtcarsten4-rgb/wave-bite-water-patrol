/* Wave Bite - Water Patrol · systems/audio.js
 * Vollständig synthetisierte Klangwelt über WebAudio (keine Asset-Dateien).
 * AAA-Finishing: Ambient-Motor + Wasser-Loop, Sirene, Blaulicht, Radar-Ping,
 * Funk-Squelch, Lucy-Chirp, Gefahr-Alarm, Möwen, plus UI-Töne. */
(function (WB) {
  'use strict';
  var ctx = null, master = null;
  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); }
    } catch (e) { ctx = null; }
    return ctx;
  }
  function on() { return WB.Save && WB.Save.data && WB.Save.data.settings && WB.Save.data.settings.sound; }
  function now() { return ctx ? ctx.currentTime : 0; }
  var noiseBuf = null;
  function noise() {
    var c = ensure(); if (!c) return null;
    if (noiseBuf) return noiseBuf;
    var len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = b; return b;
  }
  function tone(freq, dur, type, gain, when) {
    if (!on()) return;
    var c = ensure(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    var t = (when || now());
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.value = 0.0001; o.connect(g); g.connect(master);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.03);
    return { o: o, g: g };
  }
  function burst(dur, cutoff, gain, type) {
    if (!on()) return;
    var c = ensure(); if (!c || !noise()) return;
    var s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = cutoff || 1200; f.Q.value = 0.8;
    var g = c.createGain(); g.gain.value = 0.0001;
    s.connect(f); f.connect(g); g.connect(master);
    var t = now();
    g.gain.exponentialRampToValueAtTime(gain || 0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.start(t); s.stop(t + dur + 0.03);
  }
  var amb = null;
  function startAmbience() {
    var c = ensure(); if (!c || !on() || amb) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    var o1 = c.createOscillator(), o2 = c.createOscillator(), eg = c.createGain(), lp = c.createBiquadFilter();
    o1.type = 'sawtooth'; o2.type = 'triangle';
    o1.frequency.value = 58; o2.frequency.value = 87;
    lp.type = 'lowpass'; lp.frequency.value = 360; lp.Q.value = 0.6;
    eg.gain.value = 0.0001;
    o1.connect(lp); o2.connect(lp); lp.connect(eg); eg.connect(master);
    var ws = c.createBufferSource(); ws.buffer = noise(); ws.loop = true;
    var wf = c.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 700;
    var wg = c.createGain(); wg.gain.value = 0.0001;
    var lfo = c.createOscillator(), lfg = c.createGain();
    lfo.frequency.value = 0.18; lfg.gain.value = 90; lfo.connect(lfg); lfg.connect(wf.frequency);
    ws.connect(wf); wf.connect(wg); wg.connect(master);
    var t = now();
    eg.gain.exponentialRampToValueAtTime(0.05, t + 0.8);
    wg.gain.exponentialRampToValueAtTime(0.045, t + 1.2);
    o1.start(t); o2.start(t); ws.start(t); lfo.start(t);
    amb = { o1: o1, o2: o2, eg: eg, lp: lp, wg: wg, ws: ws, lfo: lfo, gull: 0 };
  }
  function setEngine(level) {
    if (!amb || !ctx) return;
    var l = Math.max(0, Math.min(1.4, level || 0));
    var base = 52 + l * 46;
    try {
      amb.o1.frequency.setTargetAtTime(base, ctx.currentTime, 0.15);
      amb.o2.frequency.setTargetAtTime(base * 1.5, ctx.currentTime, 0.15);
      amb.lp.frequency.setTargetAtTime(300 + l * 520, ctx.currentTime, 0.2);
      amb.eg.gain.setTargetAtTime(0.04 + l * 0.05, ctx.currentTime, 0.2);
      amb.wg.gain.setTargetAtTime(0.03 + l * 0.05, ctx.currentTime, 0.25);
    } catch (e) {}
    amb.gull = (amb.gull || 0) + 1;
    if (amb.gull > 240 && Math.random() < 0.01) { amb.gull = 0; WB.Audio.gull(); }
  }
  function stopAmbience() {
    if (!amb || !ctx) { amb = null; return; }
    var t = now(); var a = amb; amb = null;
    try {
      a.eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      a.wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      a.o1.stop(t + 0.45); a.o2.stop(t + 0.45); a.ws.stop(t + 0.45); a.lfo.stop(t + 0.45);
    } catch (e) {}
  }
  WB.Audio = {
    unlock: function () { var c = ensure(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} } },
    click: function () { tone(430, 0.07, 'triangle', 0.07); },
    coin: function () { tone(880, 0.08, 'sine', 0.09); setTimeout(function(){ tone(1320, 0.09, 'sine', 0.07); }, 70); },
    boost: function () { tone(150, 0.28, 'sawtooth', 0.06); tone(300, 0.28, 'triangle', 0.03); },
    hit: function () { tone(110, 0.18, 'square', 0.07); burst(0.16, 600, 0.07, 'lowpass'); if (WB.Save.data.settings.vibration && navigator.vibrate) navigator.vibrate(40); },
    success: function () { tone(660, 0.12, 'sine', 0.1); setTimeout(function(){ tone(990, 0.16, 'sine', 0.1); }, 120); setTimeout(function(){ tone(1320, 0.2, 'sine', 0.08); }, 240); },
    fail: function () { tone(220, 0.3, 'sawtooth', 0.08); setTimeout(function(){ tone(160, 0.4, 'sawtooth', 0.07); }, 160); },
    siren: function () { if (!on()) return; var c = ensure(); if (!c) return; for (var i = 0; i < 4; i++) { tone(640, 0.32, 'sawtooth', 0.05, now() + i * 0.6); tone(840, 0.30, 'sawtooth', 0.05, now() + i * 0.6 + 0.3); } },
    blaulicht: function () { tone(1000, 0.05, 'square', 0.05); setTimeout(function(){ tone(760, 0.06, 'square', 0.04); }, 60); },
    radar: function () { if (!on()) return; var c = ensure(); if (!c) return; var o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1400, now()); o.frequency.exponentialRampToValueAtTime(560, now() + 0.5); g.gain.value = 0.0001; o.connect(g); g.connect(master); g.gain.exponentialRampToValueAtTime(0.09, now() + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now() + 0.7); o.start(now()); o.stop(now() + 0.74); },
    radio: function () { burst(0.22, 1700, 0.06, 'bandpass'); setTimeout(function(){ tone(1200, 0.05, 'square', 0.025); }, 120); },
    lucy: function () { tone(1180, 0.06, 'sine', 0.05); setTimeout(function(){ tone(1560, 0.07, 'sine', 0.045); }, 75); },
    danger: function () { tone(520, 0.12, 'square', 0.06); setTimeout(function(){ tone(520, 0.12, 'square', 0.06); }, 180); },
    gull: function () { if (!on()) return; var c = ensure(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), m = c.createOscillator(), mg = c.createGain(); m.frequency.value = 16; mg.gain.value = 220; m.connect(mg); mg.connect(o.frequency); o.type = 'sawtooth'; o.frequency.value = 1500; g.gain.value = 0.0001; o.connect(g); g.connect(master); g.gain.exponentialRampToValueAtTime(0.03, now() + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, now() + 0.5); m.start(now()); o.start(now()); o.stop(now() + 0.52); m.stop(now() + 0.52); },
    startAmbience: startAmbience, setEngine: setEngine, stopAmbience: stopAmbience
  };
})(window.WB = window.WB || {});
