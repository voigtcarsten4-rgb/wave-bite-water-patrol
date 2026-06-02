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
  // =================== LEBENDIGE MARITIME KLANGWELT (Audio Immersion Pass) ===================
  // Schichten: WASSER (Basis, dominanter Layer) · WIND (mit Tempo) · MOTOR (nur Unterbau, wandert, kein Dauerbrummen)
  // + sporadische Ereignisse: Wellen-Schwall, Moewe, fernes Bootshorn, Funkverkehr, Donner (Sturm).
  var amb = null;

  function startAmbience() {
    var c = ensure(); if (!c || !on() || amb) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    var t = now();
    amb = { sched: {}, scene: 'cruise', region: 'bucht', storm: false, level: 0.7 };

    // --- WASSER (Basis, breitbandig, sanft bewegt) ---
    var ws = c.createBufferSource(); ws.buffer = noise(); ws.loop = true;
    var wf = c.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 640; wf.Q.value = 0.5;
    var wg = c.createGain(); wg.gain.value = 0.0001;
    ws.connect(wf); wf.connect(wg); wg.connect(master);
    var wlfo = c.createOscillator(), wlg = c.createGain(); wlfo.frequency.value = 0.13; wlg.gain.value = 130; wlfo.connect(wlg); wlg.connect(wf.frequency);

    // --- WIND (hochpass, leise; steigt mit Tempo, Boeen per LFO) ---
    var wi = c.createBufferSource(); wi.buffer = noise(); wi.loop = true;
    var wif = c.createBiquadFilter(); wif.type = 'highpass'; wif.frequency.value = 1100; wif.Q.value = 0.4;
    var wig = c.createGain(); wig.gain.value = 0.0001;
    wi.connect(wif); wif.connect(wig); wig.connect(master);
    var gust = c.createOscillator(), gg = c.createGain(); gust.frequency.value = 0.07; gg.gain.value = 0.012; gust.connect(gg); gg.connect(wig.gain);

    // --- MOTOR (nur Unterbau: leise, Pitch wandert, atmet/lopt – KEIN konstantes Brummen) ---
    var o1 = c.createOscillator(), o2 = c.createOscillator(), mlp = c.createBiquadFilter();
    o1.type = 'sawtooth'; o2.type = 'triangle'; o1.frequency.value = 44; o2.frequency.value = 66;
    mlp.type = 'lowpass'; mlp.frequency.value = 300; mlp.Q.value = 0.5;
    var trem = c.createGain(); trem.gain.value = 0.02;            // Grundpegel Motor (deutlich unter Wasser)
    var tlfo = c.createOscillator(), tlg = c.createGain();         // Tremolo: Motor "lopt"/atmet
    tlfo.type = 'sine'; tlfo.frequency.value = 0.9; tlg.gain.value = 0.009; tlfo.connect(tlg); tlg.connect(trem.gain);
    var wander = c.createOscillator(), wag = c.createGain();       // Pitch-Wander: nie konstante Frequenz
    wander.frequency.value = 0.075; wag.gain.value = 4.2; wander.connect(wag); wag.connect(o1.frequency);
    o1.connect(mlp); o2.connect(mlp); mlp.connect(trem); trem.connect(master);

    // sanftes Einblenden – Wasser fuehrt
    wg.gain.exponentialRampToValueAtTime(0.07, t + 1.4);
    wig.gain.exponentialRampToValueAtTime(0.004, t + 1.6);
    o1.start(t); o2.start(t); ws.start(t); wi.start(t); wlfo.start(t); gust.start(t); tlfo.start(t); wander.start(t);
    amb.o1 = o1; amb.o2 = o2; amb.mlp = mlp; amb.trem = trem; amb.tlg = tlg; amb.tlfo = tlfo; amb.wander = wander;
    amb.wg = wg; amb.wf = wf; amb.ws = ws; amb.wlfo = wlfo; amb.wig = wig; amb.wi = wi; amb.gust = gust;
    amb.t0 = t; amb.last = t;
    // Scheduler-Timer (s bis zum naechsten Ereignis)
    amb.sched = { gull: 14 + Math.random()*14, horn: 38 + Math.random()*30, radio: 20 + Math.random()*22, wave: 9 + Math.random()*9, thunder: 16 + Math.random()*16, city: 6 + Math.random()*8 };
  }

  // Pro Frame aus game.js: level ~ forwardSpeed/130 (Leerlauf ~0.7, Boost ~1.3)
  function setEngine(level) {
    if (!amb || !ctx) return;
    var l = Math.max(0, Math.min(1.5, level || 0)); amb.level = l;
    // Szene/Region aus dem laufenden Spiel ableiten (defensiv)
    try {
      var W = WB.Game && WB.Game.world;
      if (W) {
        amb.region = (W.region && W.region.id) || 'bucht';
        amb.storm = !!W.storm;
        amb.scene = W.opp ? 'pursuit' : (W.storm ? 'storm' : (W.mission && (W.mission.type==='rescue'?'rescue':(W.mission.type==='eco'?'mystery':'cruise'))));
      }
    } catch (e) {}
    var tc = ctx.currentTime;
    var stormBoost = amb.storm ? 0.05 : 0, fast = Math.max(0, l - 0.7);
    try {
      // WASSER fuehrt: Pegel mit Tempo + Sturm; Cutoff bei Nebel/Mystery gedaempft
      var waterG = 0.06 + fast * 0.06 + stormBoost;
      amb.wg.gain.setTargetAtTime(waterG, tc, 0.4);
      amb.wf.frequency.setTargetAtTime((amb.scene==='mystery'?420:680) + l*120, tc, 0.5);
      // WIND nur bei Fahrt hoerbar, nie dominant
      amb.wig.gain.setTargetAtTime(Math.max(0.0008, fast * 0.05 + stormBoost*0.4), tc, 0.5);
      // MOTOR Unterbau: Pitch mit Tempo, Pegel klar unter Wasser, leichte Schwankung
      var mBase = 40 + l * 30;
      amb.o1.frequency.setTargetAtTime(mBase, tc, 0.25);
      amb.o2.frequency.setTargetAtTime(mBase * 1.5, tc, 0.25);
      amb.mlp.frequency.setTargetAtTime(260 + l * 360, tc, 0.3);
      amb.trem.gain.setTargetAtTime(0.014 + l * 0.02 + (amb.scene==='pursuit'?0.008:0), tc, 0.3);
      amb.tlg.gain.setTargetAtTime(amb.scene==='pursuit'?0.012:0.008, tc, 0.4); // Tremolo etwas tiefer bei Jagd
    } catch (e) {}
    // ---- Scheduler: sporadische, sich veraendernde Ereignisse ----
    var dt = Math.max(0, Math.min(0.1, tc - (amb.last||tc))); amb.last = tc;
    var S = amb.sched, city = (amb.region==='kanal');
    S.wave -= dt; if (S.wave <= 0) { S.wave = (amb.storm?6:11) + Math.random()*10; waveSwell(amb.storm?0.06:0.04); }
    S.gull -= dt; if (S.gull <= 0) { S.gull = 16 + Math.random()*20; if (!city && Math.random()<0.85) WB.Audio.gull(); }
    S.horn -= dt; if (S.horn <= 0) { S.horn = 40 + Math.random()*34; if (Math.random()<0.7) horn(); }
    S.radio -= dt; if (S.radio <= 0) { S.radio = 22 + Math.random()*26; if (Math.random()<0.75) radioChatter(); }
    if (city) { S.city -= dt; if (S.city <= 0) { S.city = 7 + Math.random()*9; cityMurmur(); } }
    if (amb.storm) { S.thunder -= dt; if (S.thunder <= 0) { S.thunder = 18 + Math.random()*20; if (Math.random()<0.6) thunder(); } }
  }

  function stopAmbience() {
    if (!amb || !ctx) { amb = null; return; }
    var t = now(); var a = amb; amb = null;
    try {
      a.wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      a.wig.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      a.trem.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      var st = t + 0.55;
      a.o1.stop(st); a.o2.stop(st); a.ws.stop(st); a.wi.stop(st);
      a.wlfo.stop(st); a.gust.stop(st); a.tlfo.stop(st); a.wander.stop(st);
    } catch (e) {}
  }

  // ---- sporadische Atmosphaere-Ereignisse ----
  function waveSwell(gain) {
    var c = ensure(); if (!c || !on() || !noiseBuf) return;
    var s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 0.4;
    var g = c.createGain(); g.gain.value = 0.0001; s.connect(f); f.connect(g); g.connect(master);
    var t = now();
    g.gain.linearRampToValueAtTime(gain || 0.04, t + 0.9);          // anschwellen
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);           // abklingen
    s.start(t); s.stop(t + 2.7);
  }
  function horn() { // fernes Bootshorn (weich, tief, zweistufig)
    var c = ensure(); if (!c || !on()) return; var t = now();
    [150, 150*1.5].forEach(function(fq, i){
      var o = c.createOscillator(), g = c.createGain(); o.type='sine'; o.frequency.value=fq;
      g.gain.value=0.0001; o.connect(g); g.connect(master);
      g.gain.linearRampToValueAtTime(i? 0.012:0.03, t+0.25); g.gain.setTargetAtTime(0.0001, t+0.9, 0.4);
      o.start(t); o.stop(t+1.8);
    });
  }
  function thunder() { // Sturm: tiefes Grollen
    var c = ensure(); if (!c || !on() || !noiseBuf) return;
    var s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=160; f.Q.value=0.3;
    var g = c.createGain(); g.gain.value=0.0001; s.connect(f); f.connect(g); g.connect(master);
    var t = now();
    g.gain.linearRampToValueAtTime(0.05, t+0.4); g.gain.exponentialRampToValueAtTime(0.0001, t+2.2);
    f.frequency.setTargetAtTime(70, t, 1.0);
    s.start(t); s.stop(t+2.4);
  }
  function cityMurmur() { // Berlin-Mitte: sehr dezentes fernes Stadtrauschen
    var c = ensure(); if (!c || !on() || !noiseBuf) return;
    var s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=420; f.Q.value=0.7;
    var g = c.createGain(); g.gain.value=0.0001; s.connect(f); f.connect(g); g.connect(master);
    var t = now();
    g.gain.linearRampToValueAtTime(0.018, t+1.2); g.gain.exponentialRampToValueAtTime(0.0001, t+4.0);
    s.start(t); s.stop(t+4.2);
  }
  function radioChatter() { // Funk: Squelch + kurzer "sprechender" Formant-Blip (kein echtes Wort)
    var c = ensure(); if (!c || !on()) return;
    burst(0.16, 1700, 0.045, 'bandpass');
    var t = now() + 0.16, syll = 2 + (Math.random()*3|0);
    for (var i=0;i<syll;i++){
      var o=c.createOscillator(), g=c.createGain(), bp=c.createBiquadFilter();
      o.type='sawtooth'; o.frequency.value = 110 + Math.random()*60;
      bp.type='bandpass'; bp.frequency.value = 900 + Math.random()*700; bp.Q.value=6;
      g.gain.value=0.0001; o.connect(bp); bp.connect(g); g.connect(master);
      var st=t+i*0.14;
      g.gain.linearRampToValueAtTime(0.03, st+0.03); g.gain.exponentialRampToValueAtTime(0.0001, st+0.12);
      o.start(st); o.stop(st+0.16);
    }
    setTimeout(function(){ burst(0.1, 1500, 0.03, 'bandpass'); }, (0.16+syll*0.14+0.05)*1000);
  }

  function setScene(name) { if (amb) amb.scene = name || amb.scene; }

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
    startAmbience: startAmbience, setEngine: setEngine, stopAmbience: stopAmbience,
    setScene: setScene, horn: horn, thunder: thunder, waveSwell: waveSwell, radioChatter: radioChatter
  };
})(window.WB = window.WB || {});
