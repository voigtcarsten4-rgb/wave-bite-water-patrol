/* Wave Bite – Captain's Run · ui/revier-lage.js
 * Macht die bisher funktionslosen Wasserlage-Chips + "Lage übernehmen" + "Lagebericht" wirksam:
 * Der Spieler wählt die REVIER-LAGE seines nächsten Einsatzes (Wetter/Verkehr) → echtes Risiko/Belohnungs-Spiel.
 * Hooks: WB.Variation.roll (Wetter/Verkehr) + MissionRuntime.result (Belohnungs-Multiplikator). Persistiert in localStorage. */
(function (WB) {
  'use strict';
  var LAGEN = {
    klar:     { id:'klar',     label:'Klar & ruhig', icon:'☀️', weather:null,    trafficMul:0.7, rewardMul:0.9, tod:'tag', funk:'Leitstelle: Ruhiges Revier, klare Sicht. Entspannte Fahrt, Kapitän.' },
    andrang:  { id:'andrang',  label:'Hoher Andrang', icon:'🚢', weather:null,    trafficMul:1.6, rewardMul:1.15, tod:null, funk:'Leitstelle: Hoher Bootsandrang – aufmerksam navigieren.' },
    stoerung: { id:'stoerung', label:'Störung',      icon:'🔴', weather:'fog',   trafficMul:1.2, rewardMul:1.25, tod:null, funk:'Dispatcher: Störung im Revier gemeldet – mit Hindernissen rechnen.' },
    sturm:    { id:'sturm',    label:'Sturmwoche',   icon:'⛈', weather:'storm', trafficMul:1.1, rewardMul:1.4, tod:null, funk:'Einsatzleitung: Sturmwoche – schwerer Seegang. Höchste Belohnung.' }
  };
  function labelToId(t){ t=(t||'').toLowerCase(); if(/klar|ruhig/.test(t))return'klar'; if(/andrang|hoch/.test(t))return'andrang'; if(/störung|stoerung/.test(t))return'stoerung'; if(/sturm/.test(t))return'sturm'; return null; }
  var selected=null;
  try{ var s=localStorage.getItem('wb_revierlage'); if(s&&LAGEN[s]) WB.RevierLage=LAGEN[s]; }catch(e){}

  function toast(msg,color){ var t=document.createElement('div'); t.textContent=msg; t.style.cssText='position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:10001;background:rgba(6,16,28,.93);color:#fff;border-left:4px solid '+(color||'#c9a24b')+';padding:12px 18px;border-radius:10px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.55);max-width:88%;text-align:center'; document.body.appendChild(t); setTimeout(function(){t.style.transition='opacity .4s';t.style.opacity='0';},2800); setTimeout(function(){if(t.parentNode)t.remove();},3300); }
  function effectText(L){ var p=[]; if(L.weather==='storm')p.push('Sturm & Wellen'); else if(L.weather==='fog')p.push('Nebel & Hindernisse'); if(L.trafficMul>=1.3)p.push('viel Verkehr'); else if(L.trafficMul<=0.8)p.push('wenig Verkehr'); if(!p.length)p.push('normale Bedingungen'); return p.join(', '); }
  function commit(id){ var L=LAGEN[id]||LAGEN.klar; WB.RevierLage=L; selected=L.id; try{localStorage.setItem('wb_revierlage',L.id);}catch(e){} if(WB.Audio&&WB.Audio.radar){try{WB.Audio.radar();}catch(e){}} toast('Lage übernommen: '+L.icon+' '+L.label+' · '+effectText(L), '#c9a24b'); }

  function lagebericht(){
    var L=WB.RevierLage||LAGEN[selected]||LAGEN.sturm;
    var ov=document.createElement('div'); ov.style.cssText='position:fixed;inset:0;z-index:10002;background:rgba(3,7,14,.9);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif';
    var rmul=Math.round((L.rewardMul-1)*100), rtxt=(rmul>=0?'+':'')+rmul+'% Belohnung';
    var box=document.createElement('div'); box.style.cssText='width:min(92%,460px);background:linear-gradient(180deg,#0d2138,#081421);border:1px solid rgba(201,162,75,.45);border-radius:16px;padding:20px;color:#eaf2fb;text-align:center';
    var chips=Object.keys(LAGEN).map(function(k){var x=LAGEN[k];return '<button data-l="'+k+'" class="rl-chip" style="margin:3px;padding:7px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.18);background:'+(x.id===L.id?'rgba(201,162,75,.22)':'rgba(255,255,255,.04)')+';color:#eaf2fb;font-size:12px;font-weight:600;cursor:pointer">'+x.icon+' '+x.label+'</button>';}).join('');
    box.innerHTML='<div style="color:#3aa0ff;letter-spacing:.2em;font-size:12px;font-weight:700">📡 LAGEBERICHT · LEITSTELLE</div><h2 style="margin:8px 0 2px;color:#f5f0e1">'+L.icon+' '+L.label+'</h2><p style="color:#cfe0f0;font-size:14px;line-height:1.5;margin:10px 0">'+L.funk+'</p><div style="color:#9fb4c8;font-size:13px;margin-bottom:12px">Nächster Einsatz: '+effectText(L)+' · '+rtxt+'</div><div style="margin-bottom:14px">'+chips+'</div>';
    var go=document.createElement('button'); go.textContent='✓ Lage übernehmen'; go.style.cssText='width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(180deg,#d8b25a,#b9892f);color:#1a1205;font-weight:800;cursor:pointer;margin-bottom:8px';
    var cl=document.createElement('button'); cl.textContent='Schließen'; cl.style.cssText='width:100%;padding:10px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:transparent;color:#cfe0f0;cursor:pointer';
    box.appendChild(go); box.appendChild(cl); ov.appendChild(box);
    var chosen=L.id;
    box.querySelectorAll('.rl-chip').forEach(function(b){ b.onclick=function(){ chosen=b.getAttribute('data-l'); box.querySelectorAll('.rl-chip').forEach(function(x){x.style.background='rgba(255,255,255,.04)';}); b.style.background='rgba(201,162,75,.22)'; }; });
    go.onclick=function(){ commit(chosen); ov.remove(); };
    cl.onclick=function(){ ov.remove(); };
    ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
    document.body.appendChild(ov);
  }

  // Delegation: macht bestehende (handlerlose) Buttons wirksam, ohne Re-Render zu stören.
  document.addEventListener('click', function(e){
    var el=e.target.closest('button, .ws-chip, .ws-more'); if(!el) return;
    var id=el.id||'', txt=(el.textContent||'').trim();
    if(id==='nw-go' || /lage übernehmen/i.test(txt)){ if(selected||WB.RevierLage){ commit(selected||WB.RevierLage.id); } else { lagebericht(); } return; }
    if((el.classList&&el.classList.contains('ws-more')) || /lagebericht/i.test(txt)){ lagebericht(); return; }
    if(el.classList&&el.classList.contains('ws-chip')){ var lid=labelToId(txt); if(lid){ selected=lid; toast('Gewählt: '+LAGEN[lid].icon+' '+LAGEN[lid].label+' — mit „Lage übernehmen" bestätigen.', '#3aa0ff'); } }
  }, false);

  // HOOK 1: Wetter/Verkehr in den Missions-Variant einspeisen
  if (WB.Variation && WB.Variation.roll) {
    var _roll = WB.Variation.roll;
    WB.Variation.roll = function(m){ var v=_roll.call(this,m)||{}; var L=WB.RevierLage; if(L){ if(L.weather)v.weather=L.weather; if(L.trafficMul)v.trafficMul=(v.trafficMul||1)*L.trafficMul; if(L.tod)v.tod=L.tod; } return v; };
  }
  // HOOK 2: Belohnungs-Multiplikator
  if (WB.MissionRuntime && WB.MissionRuntime.prototype.result) {
    var _res = WB.MissionRuntime.prototype.result;
    WB.MissionRuntime.prototype.result = function(world, bs){ var r=_res.call(this,world,bs); var L=WB.RevierLage; if(L&&L.rewardMul&&L.rewardMul!==1){ r.coins=Math.round(r.coins*L.rewardMul); r.xp=Math.round(r.xp*L.rewardMul); } return r; };
  }

  WB.RevierLageMenu = { lagen:LAGEN, commit:commit, report:lagebericht, get:function(){return WB.RevierLage||null;} };
})(window.WB = window.WB || {});
