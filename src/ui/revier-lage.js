/* Wave Bite – Captain's Run · ui/revier-lage.js  (v77)
 * "Lage übernehmen" erzeugt eine SPIELBARE Mini-Mission (21 Einsätze, Mission-Bibel V2):
 *   Lage wählen → Lage übernehmen → Mini-Mission-Karte (Name/Beschreibung/Ziel/Risiko/Belohnung/Start)
 *   → echtes Mini-Spiel (WB.Minigame.play, parametriert) → Ergebnis/Belohnung → zurück zum Hub.
 * Variation echt über Modul-Parameter (decoyRatio/signalLifetime/penaltyMs/calls/greenWindow/suspectRatio/holdTime/driftSpeed).
 * Lage speichert zusätzlich Wetter/Verkehr/Belohnung für die Renn-Einsätze (Racing bleibt separat).
 * Hooks: WB.Variation.roll + MissionRuntime.result. Persistenz: localStorage 'wb_revierlage'. */
(function (WB) {
  'use strict';

  var LAGEN = {
    klar:     { id:'klar',     label:'Klar & ruhig', icon:'☀️', weather:null,    trafficMul:0.7, rewardMul:0.9,  tod:'tag', risiko:'Gering',  funk:'Leitstelle: Ruhiges Revier, klare Sicht. Entspannte Fahrt, Kapitän.' },
    andrang:  { id:'andrang',  label:'Hoher Andrang', icon:'🚢', weather:null,    trafficMul:1.6, rewardMul:1.15, tod:null,  risiko:'Mittel',  funk:'Leitstelle: Hoher Bootsandrang – aufmerksam navigieren.' },
    stoerung: { id:'stoerung', label:'Störung',      icon:'🔴', weather:'fog',   trafficMul:1.2, rewardMul:1.25, tod:null,  risiko:'Erhöht',  funk:'Dispatcher: Störung im Revier gemeldet – mit Hindernissen rechnen.' },
    sturm:    { id:'sturm',    label:'Sturmwoche',   icon:'⛈', weather:'storm', trafficMul:1.1, rewardMul:1.4,  tod:null,  risiko:'Hoch',    funk:'Einsatzleitung: Sturmwoche – schwerer Seegang. Höchste Belohnung.' }
  };

  // Eigene Funk-Spruchsaetze fuer Stoerungs-Missionen (anderes Erlebnis, gleiche Mechanik).
  var CALLS_F2=[
    { from:'Kanal 9 (gestört)', say:'…rol 3 …örst du …ich?', right:'„Empfang schwach – bitte wiederholen."', wrong:['„Alles klar, Ende."','„Kanal 16 frei."'] },
    { from:'Relais Spree', say:'Patrol 3, Frequenz wechseln auf 72?', right:'„Bestätige Wechsel auf Kanal 72."', wrong:['„Bleibe auf 9."','„Negativ, kein Wechsel."'] },
    { from:'Leitstelle (verrauscht)', say:'…position …durchgeben…', right:'„Gebe Position langsam und deutlich durch."', wrong:['„Später."','„Verstehe nichts, Ende."'] },
    { from:'DLRG Müggelsee', say:'Empfangen Sie uns noch?', right:'„Empfang wieder besser, bleibe dran."', wrong:['„Nein."','„Schluss jetzt."'] }
  ];
  var CALLS_F3=[
    { from:'Unbekannt', say:'…hier ist niemand …und doch …', right:'„Identifizieren Sie sich, bitte."', wrong:['„Hallo zurück!"','„Egal, ignorieren."'] },
    { from:'Lotse (?)', say:'Folgen Sie dem Licht an der Brücke.', right:'„Negativ – ich halte Kurs und melde Sichtung."', wrong:['„Folge sofort."','„Welches Licht?"'] },
    { from:'Leitstelle', say:'Patrol 3, wir hören ein zweites Signal.', right:'„Verstanden, peile die Quelle an."', wrong:['„Da ist nichts."','„Ende."'] },
    { from:'Echo', say:'…3 …3 …3…', right:'„Wiederholtes Echo – protokolliere und prüfe."', wrong:['„Antworte mit Echo."','„Abschalten."'] },
    { from:'Nachtfunk', say:'Können Sie die Koordinaten bestätigen?', right:'„Bestätige nach Prüfung."', wrong:['„Blind bestätigt."','„Keine Zeit."'] }
  ];

  // Mini-Spiel-Pools je Lage (Mission-Bibel V2: 21 Einsätze auf 5 Mechaniken, variiert via Parameter).
  // base = Basis-Belohnung (wird mit rewardMul der Lage skaliert).
  var POOLS = {
    klar: [
      { id:'R1', name:'Bojenkurs', type:'radar', cfg:{need:4,duration:15000,decoyRatio:0.3,signalLifetime:1900}, desc:'Ruhiges Wasser, perfekte Sicht – fahre den markierten Bojenkurs sauber ab.', ziel:'4 echte Kontakte bestätigen, Störsignale meiden.', base:80 },
      { id:'S1', name:'Präzisionsfahrt', type:'schleuse', cfg:{duration:17000,greenWindow:4.8}, desc:'Übungseinfahrt an der Schleuse – Tempo & Timing zeigen.', ziel:'Bei Grün in der grünen Tempo-Zone einfahren.', base:90 },
      { id:'H1', name:'Hafenrunde', type:'hafenkontrolle', cfg:{rounds:4,duration:24000,suspectRatio:0.4}, desc:'Routine-Streife im Hafen. Prüfe Boote mit Augenmaß.', ziel:'4 Boote korrekt durchwinken oder kontrollieren.', base:85 },
      { id:'RE1', name:'Person über Bord', type:'rettung', cfg:{duration:22000,holdTime:2.0,driftSpeed:0.08}, desc:'Person im Wasser bei ruhiger See – peilen, sacht heran, halten.', ziel:'Orten, langsam annähern, Rettungszone halten.', base:120 },
      { id:'F1', name:'Funkdisziplin Kanal 16', type:'funk', cfg:{rounds:4,duration:22000,penaltyMs:2000}, desc:'Routine-Funkverkehr – quittiere korrekt auf Kanal 16.', ziel:'Funksprüche korrekt beantworten.', base:85 }
    ],
    andrang: [
      { id:'H2', name:'Verkehrslücke', type:'hafenkontrolle', cfg:{rounds:5,duration:24000,suspectRatio:0.5}, desc:'Dichter Bootsverkehr – schnelle, richtige Entscheidungen sind gefragt.', ziel:'5 Boote im Andrang korrekt einschätzen.', base:120 },
      { id:'H3', name:'Engstellen-Kontrolle', type:'hafenkontrolle', cfg:{rounds:5,duration:22000,suspectRatio:0.55}, desc:'Enge Durchfahrt mit hohem Aufkommen – Kontrolle behalten.', ziel:'5 Kontakte korrekt abfertigen.', base:125 },
      { id:'S3', name:'Schleuse im Gedränge', type:'schleuse', cfg:{duration:13000,greenWindow:3.2}, desc:'Viel Betrieb, enges Zeitfenster – nur bei Grün rein.', ziel:'Im knappen Fenster sauber einfahren.', base:150 },
      { id:'RE4', name:'Vermisstes Boot', type:'rettung', cfg:{duration:22000,holdTime:2.2,driftSpeed:0.14}, desc:'Boot überfällig im Verkehr – orten, annähern, sichern.', ziel:'Position trotz Abdrift halten.', base:165 },
      { id:'R5', name:'Spotlight-Suche', type:'radar', cfg:{need:5,duration:16000,decoyRatio:0.45,signalLifetime:1500}, desc:'Suchscheinwerfer an – Kontakte im Getümmel aufspüren.', ziel:'5 echte Kontakte bestätigen.', base:155 }
    ],
    stoerung: [
      { id:'R3', name:'Radar-Suche', type:'radar', cfg:{need:5,duration:15000,decoyRatio:0.55,signalLifetime:1400}, desc:'Störquelle im Revier – filtere die echten Signale heraus.', ziel:'5 echte Kontakte, viele Störsignale.', base:150 },
      { id:'F2', name:'Verlorenes Funksignal', type:'funk', cfg:{rounds:4,duration:18000,penaltyMs:3500,calls:CALLS_F2}, desc:'Signal bricht ab – andere Frequenz, weniger Zeit.', ziel:'Auf gestörtem Kanal korrekt antworten.', base:150 },
      { id:'F3', name:'Geistersignal', type:'funk', cfg:{rounds:5,duration:18000,penaltyMs:3000,calls:CALLS_F3}, desc:'Unbekanntes Signal aus dem Nebel – prüf jede Antwort.', ziel:'Mehrheit korrekt quittieren.', base:175 },
      { id:'S2', name:'Schleusung bei Nebel', type:'schleuse', cfg:{duration:15000,greenWindow:3.8}, desc:'Dichter Nebel an der Schleuse – ruhig & exakt.', ziel:'Bei Grün im engeren Fenster einfahren.', base:150 },
      { id:'H4', name:'Großrazzia', type:'hafenkontrolle', cfg:{rounds:6,duration:22000,suspectRatio:0.6}, desc:'Schmuggel vermutet – viele Verdächtige, scharf entscheiden.', ziel:'6 Boote, jeder Fehlverdacht zählt.', base:180 },
      { id:'RE3', name:'Notfallkurs im Nebel', type:'rettung', cfg:{duration:20000,holdTime:2.2,driftSpeed:0.12}, desc:'Notruf im Nebel – Kurs auf die Notposition.', ziel:'Orten, annähern, sichern.', base:160 }
    ],
    sturm: [
      { id:'R4', name:'Sichtverlust', type:'radar', cfg:{need:5,duration:16000,decoyRatio:0.5,signalLifetime:1200}, desc:'Sturm nimmt die Sicht – verlass dich nur aufs Radar.', ziel:'5 Kontakte, Signale verblassen schnell.', base:190 },
      { id:'F4', name:'Sturm-Funkverkehr', type:'funk', cfg:{rounds:5,duration:16000,penaltyMs:3000}, desc:'Chaos auf dem Kanal – Disziplin trotz Sturm.', ziel:'Korrekt quittieren unter Druck.', base:195 },
      { id:'RE2', name:'Sturmrettung', type:'rettung', cfg:{duration:22000,holdTime:2.5,driftSpeed:0.18}, desc:'Schwerer Seegang – Bergung unter Höchstlast.', ziel:'Starke Abdrift ausgleichen, lange halten.', base:205 },
      { id:'S3s', name:'Schleuse im Sturm', type:'schleuse', cfg:{duration:13000,greenWindow:3.0}, desc:'Sturmböen an der Schleuse – enges Fenster, ruhige Hand.', ziel:'Im knappen Fenster sauber einfahren.', base:200 },
      { id:'R2', name:'Seenotboje orten', type:'radar', cfg:{need:3,duration:13000,decoyRatio:0.35,signalLifetime:1200}, desc:'Notboje treibt – schwaches, kurzes Signal anpeilen.', ziel:'3 schwache Kontakte rasch bestätigen.', base:130 }
    ]
  };

  var selected=null, lastPick={};
  try{ var s=localStorage.getItem('wb_revierlage'); if(s&&LAGEN[s]) WB.RevierLage=LAGEN[s]; }catch(e){}

  function labelToId(t){ t=(t||'').toLowerCase(); if(/klar|ruhig/.test(t))return'klar'; if(/andrang|hoch/.test(t))return'andrang'; if(/störung|stoerung/.test(t))return'stoerung'; if(/sturm/.test(t))return'sturm'; return null; }
  function effectText(L){ var p=[]; if(L.weather==='storm')p.push('Sturm & Wellen'); else if(L.weather==='fog')p.push('Nebel & Hindernisse'); if(L.trafficMul>=1.3)p.push('viel Verkehr'); else if(L.trafficMul<=0.8)p.push('wenig Verkehr'); if(!p.length)p.push('normale Bedingungen'); return p.join(', '); }
  function toast(msg,color){ var t=document.createElement('div'); t.textContent=msg; t.style.cssText='position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:10001;background:rgba(6,16,28,.93);color:#fff;border-left:4px solid '+(color||'#c9a24b')+';padding:12px 18px;border-radius:10px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.55);max-width:88%;text-align:center'; document.body.appendChild(t); setTimeout(function(){t.style.transition='opacity .4s';t.style.opacity='0';},2600); setTimeout(function(){if(t.parentNode)t.remove();},3100); }

  // Lage speichern (Wetter/Verkehr/Belohnung für die Renn-Einsätze).
  function saveLage(id){ var L=LAGEN[id]||LAGEN.klar; WB.RevierLage=L; selected=L.id; try{localStorage.setItem('wb_revierlage',L.id);}catch(e){} if(WB.Audio&&WB.Audio.radar){try{WB.Audio.radar();}catch(e){}} return L; }

  function pickMission(id){ var pool=POOLS[id]||POOLS.klar; var i=Math.floor(Math.random()*pool.length); if(pool.length>1 && i===lastPick[id]){ i=(i+1)%pool.length; } lastPick[id]=i; return pool[i]; }
  function rewardOf(L,m){ return { coins:Math.round(m.base*L.rewardMul), xp:Math.round(m.base*0.5*L.rewardMul) }; }

  function el(tag,css,html){ var e=document.createElement(tag); if(css)e.style.cssText=css; if(html!=null)e.innerHTML=html; return e; }
  function overlay(){ var ov=el('div','position:fixed;inset:0;z-index:10002;background:rgba(3,7,14,.92);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:14px'); return ov; }
  var CARD='width:min(94%,460px);background:linear-gradient(180deg,#0d2138,#081421);border:1px solid rgba(201,162,75,.45);border-radius:16px;padding:20px;color:#eaf2fb;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.6)';
  var BTN_GO='width:100%;padding:14px;border:none;border-radius:11px;background:linear-gradient(180deg,#d8b25a,#b9892f);color:#1a1205;font-size:16px;font-weight:800;cursor:pointer;margin-top:4px';
  var BTN_LINE='width:100%;padding:11px;border:1px solid rgba(255,255,255,.22);border-radius:10px;background:transparent;color:#cfe0f0;cursor:pointer;margin-top:8px;font-weight:600';

  // Mini-Mission-Karte (das, was nach "Lage übernehmen" sofort erscheint).
  function showMissionCard(L, mission){
    var rw=rewardOf(L,mission);
    var ov=overlay(); var box=el('div',CARD);
    box.innerHTML=
      '<div style="color:#3aa0ff;letter-spacing:.2em;font-size:12px;font-weight:700">'+L.icon+' LAGE: '+L.label.toUpperCase()+' · MINI-MISSION</div>'+
      '<h2 style="margin:8px 0 2px;color:#f5f0e1;font-size:22px">'+mission.name+'</h2>'+
      '<p style="color:#cfe0f0;font-size:14px;line-height:1.5;margin:10px 0">'+mission.desc+'</p>'+
      '<div style="text-align:left;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px 14px;margin:6px 0 14px;font-size:13.5px;line-height:1.7">'+
        '<div>🎯 <b>Ziel:</b> '+mission.ziel+'</div>'+
        '<div>⚠️ <b>Risiko:</b> '+L.risiko+' · '+effectText(L)+'</div>'+
        '<div>🏆 <b>Belohnung:</b> 🪙 '+rw.coins+'  ·  ✦ '+rw.xp+' XP</div>'+
      '</div>';
    var go=el('button',BTN_GO,'▶ Mini-Mission starten');
    var alt=el('button',BTN_LINE,'🎲 Andere Mini-Mission');
    var cl=el('button',BTN_LINE,'Schließen');
    go.onclick=function(){ ov.remove(); runMission(L,mission); };
    alt.onclick=function(){ ov.remove(); showMissionCard(L, pickMission(L.id)); };
    cl.onclick=function(){ ov.remove(); };
    box.appendChild(go); box.appendChild(alt); box.appendChild(cl); ov.appendChild(box);
    document.body.appendChild(ov);
  }

  // Mini-Spiel ausführen → Ergebnis.
  function runMission(L, mission){
    if (!(WB.Minigame && WB.Minigame.play)) { toast('Mini-Spiel-Modul nicht geladen.', '#ff5d5d'); return; }
    try {
      WB.Minigame.play(mission.type, mission.cfg, function(res){ showResult(L, mission, res||{success:false,score:0}); });
    } catch(e){ toast('Mini-Spiel-Fehler: '+e.message, '#ff5d5d'); }
  }

  // Ergebnis + Belohnung + Rückkehr zum Hub.
  function showResult(L, mission, res){
    var ok = !!res.success;
    var rw=rewardOf(L,mission);
    var gained={coins:0,xp:0};
    if (ok && WB.Progression && WB.Progression.grant){ try{ WB.Progression.grant(rw.coins, rw.xp); gained=rw; }catch(e){} }
    else if (ok && WB.Save && WB.Save.data){ WB.Save.data.coins=(WB.Save.data.coins||0)+rw.coins; if(WB.Save.save)WB.Save.save(); gained=rw; }
    try{ var tc=document.getElementById('top-coins'); if(tc&&WB.Save&&WB.Save.data) tc.textContent=WB.Save.data.coins; }catch(e){}
    try{ if(WB.Audio){ ok?(WB.Audio.success&&WB.Audio.success()):(WB.Audio.fail&&WB.Audio.fail()); } }catch(e){}

    var ov=overlay(); var box=el('div',CARD);
    box.innerHTML=
      '<div style="font-size:42px;margin-bottom:4px">'+(ok?'✅':'❌')+'</div>'+
      '<h2 style="margin:2px 0 2px;color:'+(ok?'#6fe0a3':'#ff8d8d')+';font-size:22px">'+(ok?'Mini-Mission geschafft!':'Mini-Mission gescheitert')+'</h2>'+
      '<div style="color:#9fb4c8;font-size:13px;margin-bottom:10px">'+L.icon+' '+L.label+' · '+mission.name+'</div>'+
      '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px 14px;margin:6px 0 14px;font-size:14px;line-height:1.7">'+
        (ok? '🏆 Belohnung erhalten: <b>🪙 '+gained.coins+' · ✦ '+gained.xp+' XP</b>' : 'Keine Belohnung – versuch es erneut, Kapitän.')+
        (typeof res.score!=='undefined'? '<div style="color:#9fb4c8;font-size:12px;margin-top:4px">Punktzahl: '+res.score+'</div>':'')+
      '</div>';
    var again=el('button',BTN_GO, ok?'🔁 Nächste Mini-Mission':'🔁 Nochmal versuchen');
    var hub=el('button',BTN_LINE,'⚓ Zurück zum Hub');
    again.onclick=function(){ ov.remove(); showMissionCard(L, pickMission(L.id)); };
    hub.onclick=function(){ ov.remove(); try{ if(WB.Screens&&WB.Screens.showStart) WB.Screens.showStart(); }catch(e){} };
    box.appendChild(again); box.appendChild(hub); ov.appendChild(box);
    document.body.appendChild(ov);
  }

  // Zentrale Aktion für "Lage übernehmen": Lage speichern + sofort Mini-Mission anbieten.
  function commitAndOffer(id){ var L=saveLage(id); toast('Lage übernommen: '+L.icon+' '+L.label, '#c9a24b'); showMissionCard(L, pickMission(L.id)); }

  function lagebericht(){
    var L=WB.RevierLage||LAGEN[selected]||LAGEN.sturm;
    var ov=overlay(); var box=el('div',CARD);
    var rmul=Math.round((L.rewardMul-1)*100), rtxt=(rmul>=0?'+':'')+rmul+'% Belohnung';
    var chips=Object.keys(LAGEN).map(function(k){var x=LAGEN[k];return '<button data-l="'+k+'" class="rl-chip" style="margin:3px;padding:7px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.18);background:'+(x.id===L.id?'rgba(201,162,75,.22)':'rgba(255,255,255,.04)')+';color:#eaf2fb;font-size:12px;font-weight:600;cursor:pointer">'+x.icon+' '+x.label+'</button>';}).join('');
    box.innerHTML='<div style="color:#3aa0ff;letter-spacing:.2em;font-size:12px;font-weight:700">📡 LAGEBERICHT · LEITSTELLE</div><h2 style="margin:8px 0 2px;color:#f5f0e1">'+L.icon+' '+L.label+'</h2><p style="color:#cfe0f0;font-size:14px;line-height:1.5;margin:10px 0">'+L.funk+'</p><div style="color:#9fb4c8;font-size:13px;margin-bottom:12px">Nächster Einsatz: '+effectText(L)+' · '+rtxt+'</div><div style="margin-bottom:6px">'+chips+'</div>';
    var go=el('button',BTN_GO,'✓ Lage übernehmen & Mini-Mission'); var cl=el('button',BTN_LINE,'Schließen');
    box.appendChild(go); box.appendChild(cl); ov.appendChild(box);
    var chosen=L.id;
    box.querySelectorAll('.rl-chip').forEach(function(b){ b.onclick=function(){ chosen=b.getAttribute('data-l'); box.querySelectorAll('.rl-chip').forEach(function(x){x.style.background='rgba(255,255,255,.04)';}); b.style.background='rgba(201,162,75,.22)'; }; });
    go.onclick=function(){ ov.remove(); commitAndOffer(chosen); };
    cl.onclick=function(){ ov.remove(); };
    ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
    document.body.appendChild(ov);
  }

  // Delegation: bestehende Buttons wirksam machen.
  document.addEventListener('click', function(e){
    var el2=e.target.closest('button, .ws-chip, .ws-more'); if(!el2) return;
    var id=el2.id||'', txt=(el2.textContent||'').trim();
    if(id==='nw-go' || /lage übernehmen/i.test(txt)){ e.preventDefault(); commitAndOffer(selected || (WB.RevierLage&&WB.RevierLage.id) || 'klar'); return; }
    if((el2.classList&&el2.classList.contains('ws-more')) || /lagebericht/i.test(txt)){ lagebericht(); return; }
    if(el2.classList&&el2.classList.contains('ws-chip')){ var lid=labelToId(txt); if(lid){ selected=lid; toast('Gewählt: '+LAGEN[lid].icon+' '+LAGEN[lid].label+' — mit „Lage übernehmen" starten.', '#3aa0ff'); } }
  }, false);

  // HOOK 1: Wetter/Verkehr in den Missions-Variant (Renn-Einsätze) einspeisen.
  if (WB.Variation && WB.Variation.roll) {
    var _roll = WB.Variation.roll;
    WB.Variation.roll = function(m){ var v=_roll.call(this,m)||{}; var L=WB.RevierLage; if(L){ if(L.weather)v.weather=L.weather; if(L.trafficMul)v.trafficMul=(v.trafficMul||1)*L.trafficMul; if(L.tod)v.tod=L.tod; } return v; };
  }
  // HOOK 2: Belohnungs-Multiplikator (Renn-Einsätze).
  if (WB.MissionRuntime && WB.MissionRuntime.prototype.result) {
    var _res = WB.MissionRuntime.prototype.result;
    WB.MissionRuntime.prototype.result = function(world, bs){ var r=_res.call(this,world,bs); var L=WB.RevierLage; if(L&&L.rewardMul&&L.rewardMul!==1){ r.coins=Math.round(r.coins*L.rewardMul); r.xp=Math.round(r.xp*L.rewardMul); } return r; };
  }

  WB.RevierLageMenu = { lagen:LAGEN, pools:POOLS, commit:commitAndOffer, offer:commitAndOffer, report:lagebericht, get:function(){return WB.RevierLage||null;} };
})(window.WB = window.WB || {});
