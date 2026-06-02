/* Wave Bite – Captain's Run · ui/mission-cinematic.js
 * Phase 5 Mission-Cinematic-System (wiederverwendbar für alle Missionen):
 *   Alarmphase → Leitstellen-Funk (Mehrrollen-Voice) → Einsatzvideo (echte Schnitte/Cross-Fade)
 *   → Mission-Briefing → Gameplay-Handoff.  KEINE Slideshow: harte Schnitte + Funk-Timing + Impact.
 * Nutzt vorhandene 81 Clips (Asset-Audit-Mapping). Tap = weiter, × = abbrechen. */
(function (WB) {
  'use strict';
  function url(id){ return (WB.Assets && WB.Assets.url) ? WB.Assets.url(id) : ('assets/video/' + id + '.mp4'); }
  function has(id){ return (WB.Assets && WB.Assets.has) ? WB.Assets.has(id) : true; }
  function V(role){ return (WB.Voices && WB.Voices[role]) || { label: role.toUpperCase(), color: '#9fb4c8' }; }

  // Mission-Definitionen (Clip-Mapping aus Phase-0-Asset-Audit). 09 Winter = Fallback (echte Lücke).
  var MISSIONS = [
    { id:1, name:'Sturmfront', region:'Seenplatte',
      funk:[['leitstelle','Wave Bite 1 – Sturmwarnung auf der Seenplatte.'],['leitung','Bootsführer in Not gemeldet. Höchste Priorität.'],['kapitaen','Verstanden. Wir laufen aus.']],
      einsatz:[['vid_atm_sturm',2.6,'Sturm zieht auf.'],['vid_a4_sturm_seenplatte',2.8,'Wellengang nimmt zu.'],['vid_e2_rettung_wetter',2.8,'Kurs auf die Notposition.']],
      obj:'Erreiche die Notposition im Sturm – im Fahrwasser bleiben.' },
    { id:2, name:'Rettungseinsatz', region:'Müggelsee',
      funk:[['leitstelle','Person im Wasser, Höhe Steg Müggelsee.'],['lena','Sie treiben ab – wir müssen schnell ran.'],['lucy','Ich führe uns sicher zur Position.']],
      einsatz:[['vid_einsatz_rettung',2.8,'Notruf empfangen.'],['vid_e2_rettung_sup',2.6,'Person gesichtet.'],['vid_bel_rettung',2.6,'Langsam heran.']],
      obj:'Navigiere zur Person und nähere dich LANGSAM.' },
    { id:3, name:'Verfolgung', region:'Spree',
      funk:[['leitstelle','Verdächtiges Boot flüchtet spreeabwärts.'],['dispatch','Geschwindigkeit steigt – dranbleiben.'],['junior','Ich hab sie im Radar!']],
      einsatz:[['vid_einsatz_verfolgung',2.4,'Verfolgung aufgenommen.'],['vid_e2_verfolgung_spree',2.6,'Abstand verringern.'],['cine_pursuit',2.4,'Nicht abreißen lassen.']],
      obj:'Halte Sichtkontakt und verringere den Abstand.' },
    { id:4, name:'Nachtfahrt Berlin', region:'Berlin',
      funk:[['leitstelle','Nachtstreife im Regierungsviertel.'],['lena','Berlin schläft – wir nicht.'],['kapitaen','Blaulicht an.']],
      einsatz:[['vid_a4_nachtfahrt_berlin',2.8,'Berlin bei Nacht.'],['cine_nightlake',2.6,'Stille auf dem Wasser.'],['vid_a4_blaulicht_wasser',2.6,'Nur das Blaulicht wacht.']],
      obj:'Streife durch das nächtliche Berliner Revier.' },
    { id:5, name:'Schleuse im Nebel', region:'Wernsdorf',
      funk:[['leitstelle','Dichter Nebel an der Schleuse Wernsdorf.'],['dispatch','Sicht unter 50 Meter.'],['lucy','Ich halte uns mittig in der Rinne.']],
      einsatz:[['vid_a4_nebel_mueggelsee',2.8,'Nebel über dem Wasser.'],['vid_einsatz_schleuse',2.6,'Schleuse voraus.'],['cine_lock',2.6,'Vorsichtig einfahren.']],
      obj:'Navigiere durch den Nebel sicher in die Schleuse.' },
    { id:6, name:'Regatta', region:'Grünau',
      funk:[['leitstelle','Regatta-Absicherung Grünau.'],['junior','So viele Segel!'],['lena','Halte die Rennstrecke frei.']],
      einsatz:[['vid_a4_regatta',2.8,'Regatta-Tag.'],['vid_e2_regatta',2.8,'Felder in Bewegung.'],['cine_event',2.4,'Sicherheit zuerst.']],
      obj:'Sichere die Regattastrecke – weiche den Booten aus.' },
    { id:7, name:'Industriehafen', region:'Industriehafen',
      funk:[['leitstelle','Störung im Industriehafen gemeldet.'],['leitung','Lage unklar – Vorsicht.'],['kapitaen','Wir prüfen das.']],
      einsatz:[['vid_einsatz_hafenstoerung',2.6,'Hafen voraus.'],['vid_e2_hafenstoerung',2.6,'Etwas stimmt nicht.'],['cine_harbor2',2.6,'Längsseits gehen.']],
      obj:'Untersuche die Störung – langsam anlegen.' },
    { id:8, name:'Hidden Harbor', region:'Geheimer Anleger',
      funk:[['leitstelle','Hinweis auf einen versteckten Anleger.'],['lena','Niemand sollte hier sein …'],['lucy','Schwaches Signal voraus.']],
      einsatz:[['vid_m2_geheimer_anleger',2.8,'Ein versteckter Anleger.'],['vid_m2_schatten_bruecke',2.6,'Schatten unter der Brücke.'],['cine_bay',2.4,'Leise heran.']],
      obj:'Finde den versteckten Anleger – bleib unauffällig.' },
    { id:9, name:'Winterfahrt', region:'Winterrevier',
      funk:[['leitstelle','Wintereinsatz – Eisgefahr im Revier.'],['dispatch','Wassertemperatur kritisch.'],['kapitaen','Wir fahren auf Sicht.']],
      einsatz:[['cine_fog',2.6,'Kalter Dunst über dem Wasser.'],['vid_welt_schleuse',2.6,'Stilles Winterrevier.'],['cine_nightlake',2.4,'Vorsicht – Eis.']],
      obj:'Fahre vorsichtig durch das winterliche Revier.', gap:true },
    { id:10, name:'Wave Bite Origins', region:'Berlin-Brandenburg',
      funk:[['leitung','Die Geschichte der Wave Bite Patrol beginnt.'],['lena','Wie alles anfing …'],['kapitaen','Leinen los.']],
      einsatz:[['vid_welt_berlin',2.8,'Spree, Havel, Müggelsee.'],['cine_boat_hero',2.6,'Eine neue Flotte.'],['vid_w3_heroshot',2.6,'WAVE BITE · WATER PATROL']],
      obj:'Erlebe den Ursprung der Wave-Bite-Flotte.' }
  ];

  var SID='wb-mc-style';
  function ensureStyle(){
    if (document.getElementById(SID)) return;
    var st=document.createElement('style'); st.id=SID;
    st.textContent=
      '.mc-ov{position:fixed;inset:0;z-index:10000;background:#03070e;opacity:0;transition:opacity .25s;font-family:system-ui,sans-serif;overflow:hidden}'+
      '.mc-ov.show{opacity:1}'+
      '.mc-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s}'+
      '.mc-vid.on{opacity:1}'+
      '.mc-bar{position:absolute;left:0;right:0;height:10%;background:#000;z-index:3}.mc-bar.t{top:0}.mc-bar.b{bottom:0}'+
      '.mc-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(120% 80% at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.6) 100%)}'+
      '.mc-alarm{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px}'+
      '.mc-alarm .ring{position:absolute;inset:0;animation:mcpulse 1s infinite}'+
      '@keyframes mcpulse{0%,100%{background:radial-gradient(circle at 50% 45%,rgba(255,40,40,0) 45%,rgba(255,40,40,0) 60%)}50%{background:radial-gradient(circle at 50% 45%,rgba(255,40,40,0) 38%,rgba(255,40,40,.28) 70%)}}'+
      '.mc-alarm h2{color:#ff5d5d;font-size:clamp(22px,5vw,40px);letter-spacing:.18em;margin:0;text-shadow:0 2px 14px rgba(255,40,40,.6)}'+
      '.mc-alarm .rev{color:#eaf2fb;font-size:14px;letter-spacing:.2em;opacity:.85}'+
      '.mc-kick{position:absolute;top:11%;left:0;right:0;text-align:center;z-index:5;color:#fff;letter-spacing:.22em;font-size:12px;font-weight:700;text-shadow:0 1px 6px #000}'+
      '.mc-funk{position:absolute;left:7%;right:7%;bottom:13%;z-index:6;display:flex;flex-direction:column;gap:8px;align-items:center}'+
      '.mc-line{max-width:90%;background:rgba(6,16,28,.78);border-left:3px solid #3aa0ff;border-radius:8px;padding:8px 12px;color:#fff;font-size:clamp(13px,2.3vw,18px);box-shadow:0 4px 16px rgba(0,0,0,.5);opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s}'+
      '.mc-line.on{opacity:1;transform:none}'+
      '.mc-line b{display:block;font-size:10px;letter-spacing:.16em;margin-bottom:2px;opacity:.9}'+
      '.mc-brief{position:absolute;inset:0;z-index:7;display:flex;align-items:center;justify-content:center}'+
      '.mc-card{width:min(90%,460px);background:linear-gradient(180deg,#0d2138,#081421);border:1px solid rgba(201,162,75,.45);border-radius:16px;padding:20px;text-align:center;color:#eaf2fb}'+
      '.mc-card .mk{color:#c9a24b;letter-spacing:.2em;font-size:12px;font-weight:700}'+
      '.mc-card h2{margin:6px 0 2px;font-size:22px;color:#f5f0e1}'+
      '.mc-card .rg{color:#9fb4c8;font-size:12px;margin-bottom:12px}'+
      '.mc-card .ob{font-size:15px;margin:12px 0 16px;line-height:1.45}'+
      '.mc-go{width:100%;padding:13px;border:none;border-radius:11px;background:linear-gradient(180deg,#d8b25a,#b9892f);color:#1a1205;font-size:16px;font-weight:800;cursor:pointer}'+
      '.mc-x{position:absolute;top:calc(10% + 8px);right:14px;z-index:8;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.4);color:#fff;font-size:18px;cursor:pointer}'+
      '.mc-pick{position:fixed;inset:0;z-index:10000;background:rgba(3,7,14,.96);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}'+
      '.mc-pbox{width:min(94%,560px);max-height:88vh;overflow:auto;background:linear-gradient(180deg,#0d2138,#081421);border:1px solid rgba(201,162,75,.4);border-radius:16px;padding:18px}'+
      '.mc-pbox h3{margin:2px 0 4px;color:#f5f0e1;text-align:center}.mc-pbox p{margin:0 0 14px;color:#9fb4c8;font-size:12px;text-align:center}'+
      '.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
      '.mc-mcard{padding:13px 12px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#eaf2fb;font-weight:600;cursor:pointer;text-align:left}'+
      '.mc-mcard:hover{border-color:rgba(201,162,75,.7)}'+
      '.mc-mcard small{display:block;color:#8fa6bb;font-weight:500;font-size:11px;margin-top:3px}'+
      '.mc-close{margin-top:14px;width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#cfe0f0;cursor:pointer}';
    document.head.appendChild(st);
  }
  function el(t,c){ var e=document.createElement(t); if(c) e.className=c; return e; }

  // Spielt die volle Einsatz-Cinematic für eine Mission, ruft onStart() beim "Einsatz starten".
  function playIntro(m, onStart){
    ensureStyle();
    if (WB.Audio && WB.Audio.unlock) { try { WB.Audio.unlock(); } catch(e){} }
    var ov=el('div','mc-ov');
    var vA=el('video','mc-vid'), vB=el('video','mc-vid');
    [vA,vB].forEach(function(v){ v.muted=true; v.playsInline=true; v.setAttribute('playsinline',''); v.preload='auto'; ov.appendChild(v); });
    ov.appendChild(el('div','mc-vig'));
    ov.appendChild(el('div','mc-bar t')); ov.appendChild(el('div','mc-bar b'));
    var kick=el('div','mc-kick'); kick.textContent='EINSATZ '+(m.id<10?'0':'')+m.id+' · '+m.region.toUpperCase(); ov.appendChild(kick);
    var x=el('button','mc-x'); x.innerHTML='×'; ov.appendChild(x);
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('show'); });

    var layers=[vA,vB], cur=0, done=false, timers=[];
    function clr(){ timers.forEach(clearTimeout); timers=[]; }
    function after(ms,fn){ var id=setTimeout(fn,ms); timers.push(id); return id; }
    function setClip(id){ var nx=layers[(cur+1)%2], cr=layers[cur]; if(has(id)){ nx.src=url(id); var p=nx.play(); if(p&&p.catch)p.catch(function(){}); } nx.classList.add('on'); cr.classList.remove('on'); cur=(cur+1)%2; }
    function finish(go){ if(done)return; done=true; clr(); try{vA.pause();vB.pause();}catch(e){} ov.classList.remove('show'); setTimeout(function(){ if(ov.parentNode) document.body.removeChild(ov); }, 260); if(go && onStart) onStart(); }
    x.onclick=function(){ finish(false); };

    // PHASE 1: ALARM
    var alarm=el('div','mc-alarm'); alarm.innerHTML='<div class="ring"></div><h2>🚨 EINSATZALARM</h2><div class="rev">REVIER '+m.region.toUpperCase()+'</div>';
    ov.appendChild(alarm);
    if (WB.Audio && WB.Audio.danger) { try{ WB.Audio.danger(); }catch(e){} }
    after(1900, phaseFunk);

    // PHASE 2: LEITSTELLEN-FUNK (Mehrrollen)
    function phaseFunk(){
      if(done) return;
      if(alarm.parentNode) alarm.remove();
      setClip(m.einsatz[0] ? m.einsatz[0][0] : 'clip_alarm');
      var box=el('div','mc-funk'); ov.appendChild(box);
      var i=0;
      (function next(){
        if(done) return;
        if(i>=m.funk.length){ after(700, function(){ if(box.parentNode) box.remove(); phaseVideo(); }); return; }
        var role=V(m.funk[i][0]), txt=m.funk[i][1];
        var line=el('div','mc-line'); line.style.borderLeftColor=role.color;
        line.innerHTML='<b style="color:'+role.color+'">📻 '+role.label+'</b>'+txt;
        box.appendChild(line); requestAnimationFrame(function(){ line.classList.add('on'); });
        if (WB.Audio && WB.Audio.radar) { try{ WB.Audio.radar(); }catch(e){} }
        i++; after(2200, next);
      })();
    }

    // PHASE 3: EINSATZVIDEO (echte Schnitte + Untertitel)
    function phaseVideo(){
      if(done) return;
      var sub=el('div','mc-funk'); var line=el('div','mc-line on'); line.style.borderLeftColor='#c9a24b'; sub.appendChild(line); ov.appendChild(sub);
      var i=0;
      (function next(){
        if(done) return;
        if(i>=m.einsatz.length){ if(sub.parentNode) sub.remove(); phaseBrief(); return; }
        var c=m.einsatz[i]; setClip(c[0]);
        line.innerHTML='<b style="color:#c9a24b">▶ EINSATZ</b>'+(c[2]||'');
        i++; after(Math.round((c[1]||2.6)*1000), next);
      })();
    }

    // PHASE 4: BRIEFING + Handoff
    function phaseBrief(){
      if(done) return;
      var b=el('div','mc-brief'); var card=el('div','mc-card');
      card.innerHTML='<div class="mk">MISSION '+(m.id<10?'0':'')+m.id+(m.gap?' · (Video-Lücke: Platzhalter)':'')+'</div><h2>'+m.name+'</h2><div class="rg">Revier '+m.region+'</div><div class="ob">'+m.obj+'</div>';
      var go=el('button','mc-go'); go.textContent='▶ Einsatz starten';
      go.onclick=function(){ finish(true); };
      card.appendChild(go); b.appendChild(card); ov.appendChild(b);
    }
  }

  // Cinematic-Mission -> echte Spiel-Mission (IDs aus WB.data.missions)
  var REAL_ID={1:'m_sturm',2:'m_rettung',3:'m_verfolgung',4:'m_nacht',5:'m_schmuggler',6:'m_speed',7:'m_razzia',8:'m_beweis',9:'m_vermisst',10:'m_streife'};
  function startGameplay(m){
    var rid = m && REAL_ID[m.id];
    if (rid && WB.Game) {
      try { WB.Game._skipCinemaOnce = true;   // Kino hat Cinematic+Briefing schon gezeigt -> kein Doppel
            if (WB.Game._launch) { WB.Game._launch(rid); return; }
            if (WB.Game.start) { WB.Game.start(rid); return; } } catch(e){ WB.Game._skipCinemaOnce=false; }
    }
    var qs=document.getElementById('btn-quickstart'); if(qs) qs.click();
  }

  function openPicker(){
    ensureStyle();
    var ov=el('div','mc-pick');
    var box=el('div','mc-pbox');
    box.innerHTML='<h3>🎬 Einsatz-Kino</h3><p>Cineastischer Missionseinstieg · Alarm → Leitstelle → Einsatzvideo → Briefing</p>';
    var grid=el('div','mc-grid');
    MISSIONS.forEach(function(m){
      var btn=el('button','mc-mcard');
      btn.innerHTML='Mission '+(m.id<10?'0':'')+m.id+' · '+m.name+'<small>Revier '+m.region+(m.gap?' · Video-Lücke':'')+'</small>';
      btn.onclick=function(){ document.body.removeChild(ov); playIntro(m, function(){ startGameplay(m); }); };
      grid.appendChild(btn);
    });
    box.appendChild(grid);
    var c=el('button','mc-close'); c.textContent='Schließen'; c.onclick=function(){ if(ov.parentNode) document.body.removeChild(ov); };
    box.appendChild(c); ov.appendChild(box);
    ov.addEventListener('click', function(e){ if(e.target===ov && ov.parentNode) document.body.removeChild(ov); });
    document.body.appendChild(ov);
  }

  // KINO-HUB: ein Menüpunkt mit Tabs (Promo-Trailer / Einsätze) – bündelt Trailer + Einsatz-Kino.
  function openHub(tab){
    ensureStyle();
    var ov=el('div','mc-pick'), box=el('div','mc-pbox');
    var h=el('h3'); h.textContent='🎬 Wave Bite Kino'; box.appendChild(h);
    var tabs=el('div'); tabs.style.cssText='display:flex;gap:8px;justify-content:center;margin:6px 0 12px';
    var tA=el('button'), tB=el('button'); tA.textContent='Promo-Trailer'; tB.textContent='Einsätze';
    function styleTab(b,on){ b.style.cssText='padding:8px 16px;border-radius:9px;border:1px solid rgba(201,162,75,'+(on?'0.8':'0.25')+');background:'+(on?'rgba(201,162,75,.18)':'transparent')+';color:#eaf2fb;font-weight:700;cursor:pointer'; }
    tabs.appendChild(tA); tabs.appendChild(tB); box.appendChild(tabs);
    var body=el('div'); box.appendChild(body);
    function render(t){
      styleTab(tA,t==='trailer'); styleTab(tB,t!=='trailer');
      body.innerHTML=''; var grid=el('div','mc-grid');
      if(t==='trailer' && WB.Trailer && WB.Trailer.list){
        WB.Trailer.list.forEach(function(tr){ var b=el('button','mc-mcard'); b.innerHTML=tr.name+'<small>Promo-Sequenz · Schnitte/Funktext</small>'; b.onclick=function(){ if(ov.parentNode)document.body.removeChild(ov); WB.Trailer.play(tr); }; grid.appendChild(b); });
      } else {
        MISSIONS.forEach(function(m){ var b=el('button','mc-mcard'); b.innerHTML='Mission '+(m.id<10?'0':'')+m.id+' · '+m.name+'<small>Revier '+m.region+(m.gap?' · Video-Lücke':'')+'</small>'; b.onclick=function(){ if(ov.parentNode)document.body.removeChild(ov); playIntro(m, function(){ startGameplay(m); }); }; grid.appendChild(b); });
      }
      body.appendChild(grid);
    }
    tA.onclick=function(){ render('trailer'); }; tB.onclick=function(){ render('missionen'); };
    var c=el('button','mc-close'); c.textContent='Schließen'; c.onclick=function(){ if(ov.parentNode)document.body.removeChild(ov); }; box.appendChild(c);
    ov.appendChild(box); ov.addEventListener('click',function(e){ if(e.target===ov&&ov.parentNode)document.body.removeChild(ov); });
    document.body.appendChild(ov); render(tab||'missionen');
  }

  WB.MissionCinematic = { playIntro: playIntro, openPicker: openPicker, openHub: openHub, missions: MISSIONS };

  // Ein Menü-Button "🎬 Kino"; alten separaten Trailer-Button ausblenden (jetzt im Hub).
  function injectBtn(){
    var grid=document.querySelector('.menu-grid'); if(!grid) return;
    var tb=document.getElementById('btn-trailer'); if(tb) tb.style.display='none';
    if(document.getElementById('btn-kino')) return;
    var b=document.createElement('button'); b.id='btn-kino'; b.className='btn btn-line'; b.textContent='🎬 Kino';
    b.addEventListener('click', function(){ openHub('missionen'); });
    grid.appendChild(b);
  }
  if (document.readyState!=='loading') injectBtn();
  else document.addEventListener('DOMContentLoaded', injectBtn);
})(window.WB = window.WB || {});
