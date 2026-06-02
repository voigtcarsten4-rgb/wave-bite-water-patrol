/* Wave Bite – Captain's Run · ui/trailer.js
 * RS5 Trailer-Sequencer: echte Mehr-Clip-SEQUENZEN (harte Schnitte + Cross-Fade-Übergänge),
 * Funktext-Untertitel, HUD-Layer (Kicker + Fortschritts-Punkte), Letterbox. KEINE reinen Loops.
 * 10 zweckgebundene Trailer aus vorhandenem Videomaterial. Skip (Tap) / Schließen (×). */
(function (WB) {
  'use strict';
  function url(id){ return (WB.Assets && WB.Assets.url) ? WB.Assets.url(id) : ('assets/video/' + id + '.mp4'); }
  function has(id){ return (WB.Assets && WB.Assets.has) ? WB.Assets.has(id) : true; }

  // Jeder Trailer hat einen klaren Zweck. clips: v=Video-ID, d=Sekunden, s=Funktext/Untertitel.
  var TRAILERS = [
    { id:'alarm',  name:'🚨 Alarm-Intro', kicker:'● EINSATZALARM', theme:'#3aa0ff',
      clips:[ {v:'clip_alarm',d:2.4,s:'»Alle Einheiten – Lage am Hafen.«'},
              {v:'vid_a4_blaulicht_wasser',d:3.0,s:'Blaulicht an. Wir laufen aus.'},
              {v:'cine_pursuit',d:2.8,s:'WAVE BITE · WATER PATROL'} ] },
    { id:'mission', name:'📋 Mission-Intro', kicker:'● MISSION', theme:'#5fe39a',
      clips:[ {v:'cine_radio',d:2.6,s:'»Kanal 16 – Auftrag bestätigt.«'},
              {v:'vid_einsatz_kontrolle',d:3.0,s:'Kontrollfahrt im Revier.'},
              {v:'cine_boat_hero',d:2.6,s:'Kurs setzen, Kapitän.'} ] },
    { id:'reward', name:'🏅 Belohnung', kicker:'● EINSATZ ERFOLGREICH', theme:'#f0c24b',
      clips:[ {v:'cine_rankup',d:2.4,s:'Sauber gefahren.'},
              {v:'vid_bel_rettung',d:3.0,s:'Auftrag erfüllt.'},
              {v:'vid_w3_perfekt',d:2.6,s:'Beförderung in Sicht.'} ] },
    { id:'action', name:'⚡ Action', kicker:'● ACTION', theme:'#ff7a3d',
      clips:[ {v:'cine_pursuit',d:2.0,s:'Vollgas.'},
              {v:'vid_einsatz_verfolgung',d:2.4,s:'Dranbleiben!'},
              {v:'vid_einsatz_hafenstoerung',d:2.4,s:'Störung am Hafen.'},
              {v:'cine_boat_hero',d:2.2,s:'WAVE BITE'} ] },
    { id:'mystery', name:'🌫 Mystery', kicker:'● MYSTERY', theme:'#9a7bff',
      clips:[ {v:'vid_myst_lotse',d:3.0,s:'Wer war der Lotse?'},
              {v:'vid_myst_funksignal',d:2.8,s:'Ein Funksignal aus dem Nichts…'},
              {v:'vid_myst_verlassenes_boot',d:3.0,s:'Ein verlassenes Boot.'},
              {v:'vid_myst_uebergabe',d:2.8,s:'Die Übergabe.'} ] },
    { id:'night', name:'🌙 Nachtfahrt', kicker:'● NACHTFAHRT', theme:'#3a6fff',
      clips:[ {v:'cine_nightlake',d:3.0,s:'Stille auf dem See.'},
              {v:'vid_a4_nachtfahrt_berlin',d:3.2,s:'Berlin bei Nacht.'},
              {v:'vid_a4_blaulicht_wasser',d:2.6,s:'Nur das Blaulicht wacht.'} ] },
    { id:'storm', name:'⛈ Sturm', kicker:'● STURMEINSATZ', theme:'#5fb0c0',
      clips:[ {v:'vid_atm_sturm',d:3.0,s:'Sturm zieht auf.'},
              {v:'vid_a4_sturm_seenplatte',d:3.0,s:'Wellengang auf der Seenplatte.'},
              {v:'vid_einsatz_rettung',d:3.0,s:'Jemand braucht Hilfe.'} ] },
    { id:'rescue', name:'🛟 Rettungseinsatz', kicker:'● RETTUNG', theme:'#ff5d5d',
      clips:[ {v:'vid_einsatz_rettung',d:3.0,s:'Person im Wasser!'},
              {v:'vid_bel_rettung',d:2.8,s:'Langsam heran.'},
              {v:'vid_w3_rettung_erfolg',d:2.8,s:'Gerettet.'} ] },
    { id:'chase', name:'🚤 Verfolgungsfahrt', kicker:'● VERFOLGUNG', theme:'#ff9f1c',
      clips:[ {v:'vid_einsatz_verfolgung',d:2.8,s:'Verdächtiges Boot – Verfolgung.'},
              {v:'cine_pursuit',d:2.4,s:'Abstand verringern.'},
              {v:'vid_a4_blaulicht_wasser',d:2.6,s:'»Stoppen Sie Ihr Boot!«'} ] },
    { id:'berlin', name:'🏙 Berlin-Revier', kicker:'● REVIER BERLIN-BRANDENBURG', theme:'#c9a24b',
      clips:[ {v:'vid_welt_berlin',d:3.0,s:'Spree, Havel, Müggelsee.'},
              {v:'vid_welt_mueggelsee',d:3.0,s:'Dein Revier.'},
              {v:'vid_welt_glienicke',d:3.0,s:'WAVE BITE · WATER PATROL'} ] }
  ];

  var STYLE_ID = 'wb-trailer-style';
  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style'); st.id = STYLE_ID;
    st.textContent =
      '.wbt-ov{position:fixed;inset:0;z-index:9999;background:#040a12;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s;font-family:system-ui,sans-serif}'+
      '.wbt-ov.show{opacity:1}'+
      '.wbt-stage{position:absolute;inset:0;overflow:hidden;background:#000}'+
      '.wbt-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s ease}'+
      '.wbt-vid.on{opacity:1}'+
      '.wbt-bar{position:absolute;left:0;right:0;height:11%;background:#000;z-index:3}'+
      '.wbt-bar.top{top:0}.wbt-bar.bot{bottom:0}'+
      '.wbt-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(120% 80% at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}'+
      '.wbt-kick{position:absolute;top:12%;left:0;right:0;text-align:center;z-index:4;color:#fff;letter-spacing:.22em;font-size:13px;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.8)}'+
      '.wbt-sub{position:absolute;bottom:13.5%;left:8%;right:8%;text-align:center;z-index:4;color:#fff;font-size:clamp(15px,2.4vw,22px);font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,.9);opacity:0;transition:opacity .35s}'+
      '.wbt-sub.on{opacity:1}'+
      '.wbt-dots{position:absolute;top:12%;right:18px;z-index:5;display:flex;gap:6px}'+
      '.wbt-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.30)}'+
      '.wbt-dot.on{background:#fff}'+
      '.wbt-x{position:absolute;top:calc(11% + 8px);right:14px;z-index:6;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.4);color:#fff;font-size:18px;cursor:pointer}'+
      '.wbt-hint{position:absolute;bottom:calc(11% + 6px);right:16px;z-index:5;color:rgba(255,255,255,.6);font-size:11px}'+
      '.wbt-pick{position:relative;z-index:7;width:min(92%,520px);max-height:86vh;overflow:auto;background:linear-gradient(180deg,#0d2138,#081421);border:1px solid rgba(201,162,75,.4);border-radius:16px;padding:18px}'+
      '.wbt-pick h3{margin:2px 0 4px;color:#f5f0e1;font-size:18px;text-align:center}'+
      '.wbt-pick p{margin:0 0 14px;color:#9fb4c8;font-size:12px;text-align:center}'+
      '.wbt-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
      '.wbt-card{padding:13px 12px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#eaf2fb;font-size:14px;font-weight:600;cursor:pointer;text-align:left;transition:transform .1s,border-color .15s}'+
      '.wbt-card:hover{transform:translateY(-2px);border-color:rgba(201,162,75,.7)}'+
      '.wbt-card small{display:block;color:#8fa6bb;font-weight:500;font-size:11px;margin-top:3px}'+
      '.wbt-close{margin-top:14px;width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#cfe0f0;font-size:14px;cursor:pointer}';
    document.head.appendChild(st);
  }

  function el(tag, cls){ var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  // ---- Picker: Auswahl aus 10 Trailern --------------------------------------
  function openPicker(){
    ensureStyle();
    var ov = el('div','wbt-ov'); ov.id = 'wb-trailer-overlay';
    var box = el('div','wbt-pick');
    var h = el('h3'); h.textContent = '🎬 Wave Bite – Trailer'; box.appendChild(h);
    var p = el('p'); p.textContent = '10 Sequenzen aus echtem Material · Schnitte, Funktext, HUD'; box.appendChild(p);
    var grid = el('div','wbt-grid');
    TRAILERS.forEach(function (tr){
      var avail = tr.clips.filter(function(c){ return has(c.v); }).length;
      var b = el('button','wbt-card');
      b.innerHTML = tr.name + '<small>' + avail + ' Sequenzen · ' + tr.kicker.replace('● ','') + '</small>';
      b.onclick = function(){ document.body.removeChild(ov); play(tr); };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    var close = el('button','wbt-close'); close.textContent = 'Schließen';
    close.onclick = function(){ if (ov.parentNode) document.body.removeChild(ov); };
    box.appendChild(close);
    ov.appendChild(box);
    ov.addEventListener('click', function(e){ if (e.target === ov) { if (ov.parentNode) document.body.removeChild(ov); } });
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('show'); });
  }

  // ---- Player: echte Sequenz mit Cross-Fade zwischen zwei Video-Layern -------
  function play(tr, onDone){
    ensureStyle();
    var clips = tr.clips.filter(function(c){ return has(c.v); });
    if (!clips.length) { if (onDone) onDone(); return; }

    var ov = el('div','wbt-ov'); ov.id = 'wb-trailer-overlay';
    var stage = el('div','wbt-stage');
    var vA = el('video','wbt-vid'), vB = el('video','wbt-vid');
    [vA,vB].forEach(function(v){ v.muted = true; v.playsInline = true; v.setAttribute('playsinline',''); v.preload='auto'; stage.appendChild(v); });
    var vig = el('div','wbt-vig');
    var barT = el('div','wbt-bar top'), barB = el('div','wbt-bar bot');
    var kick = el('div','wbt-kick'); kick.textContent = tr.kicker; kick.style.color = tr.theme;
    var sub = el('div','wbt-sub');
    var dots = el('div','wbt-dots');
    clips.forEach(function(){ dots.appendChild(el('span','wbt-dot')); });
    var xbtn = el('button','wbt-x'); xbtn.innerHTML = '×';
    var hint = el('div','wbt-hint'); hint.textContent = 'Tippen = weiter · × = schließen';
    stage.appendChild(vig);
    ov.appendChild(stage); ov.appendChild(barT); ov.appendChild(barB);
    ov.appendChild(kick); ov.appendChild(sub); ov.appendChild(dots); ov.appendChild(xbtn); ov.appendChild(hint);
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('show'); });

    var layers = [vA, vB], curLayer = 0, idx = -1, timer = null, token = 0, done = false;

    function finish(){
      if (done) return; done = true;
      if (timer) clearTimeout(timer);
      try { vA.pause(); vB.pause(); } catch(e){}
      ov.classList.remove('show');
      setTimeout(function(){ if (ov.parentNode) document.body.removeChild(ov); }, 260);
      if (onDone) onDone();
    }

    function show(i){
      if (done) return;
      if (i >= clips.length) { finish(); return; }
      idx = i;
      var myToken = ++token;
      var clip = clips[i];
      var next = layers[(curLayer + 1) % 2], cur = layers[curLayer];
      next.src = url(clip.v);
      try { next.currentTime = 0; } catch(e){}
      var pr = next.play(); if (pr && pr.catch) pr.catch(function(){});
      // Cross-Fade-Übergang
      next.classList.add('on'); cur.classList.remove('on');
      curLayer = (curLayer + 1) % 2;
      // Untertitel/Funktext
      sub.classList.remove('on');
      setTimeout(function(){ if (token === myToken && !done) { sub.textContent = clip.s || ''; sub.classList.add('on'); } }, 220);
      // Fortschritts-Punkte
      for (var d = 0; d < dots.children.length; d++) dots.children[d].classList.toggle('on', d <= i);
      // nächster Schnitt nach d Sekunden (Fallback: video 'ended')
      if (timer) clearTimeout(timer);
      timer = setTimeout(function(){ if (token === myToken) show(i + 1); }, Math.round((clip.d || 3) * 1000));
      next.onended = function(){ if (token === myToken && !done) show(i + 1); };
    }

    // Steuerung: Tap = nächster Clip, × = schließen
    ov.addEventListener('click', function(e){ if (e.target === xbtn) { finish(); return; } show(idx + 1); });
    show(0);
  }

  WB.Trailer = { openPicker: openPicker, play: play, list: TRAILERS };

  // RS5: Trailer-Button selbst übernehmen (Capture-Phase) -> öffnet den Picker statt nur hero_trailer-Loop.
  function bindBtn(){
    var b = document.getElementById('btn-trailer');
    if (!b || b._wbtBound) return; b._wbtBound = true;
    b.addEventListener('click', function (e){
      e.stopImmediatePropagation();
      if (WB.Audio && WB.Audio.unlock) { try { WB.Audio.unlock(); } catch(x){} }
      openPicker();
    }, true);
  }
  if (document.readyState !== 'loading') bindBtn();
  else document.addEventListener('DOMContentLoaded', bindBtn);
})(window.WB = window.WB || {});
