/* Wave Bite – game/minigame-extra.js  (v81)
 * NEUE, eigenständige Premium-Minispiele – additiv, kein Umbau:
 *   🎣 MiniAngeln  : Auswerfen (Power-Timing) → Biss (Reaktion) → Einholen (Spannungs-Rhythmus)
 *   🦈 MiniSharkBite: Ausweichen (3 Lanes, Reaktion) → Reel-Kampf (Spannung, dramatisch)
 * Registriert sich in WB.Minigame.play (Wrap), injiziert eigene Lage-Pool-Missionen + CSS + Achievements. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  function lucy(t){ if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say(t); }

  // ---- eigene Premium-Optik (nur für die neuen Module) ----
  (function injectCSS(){
    if (document.getElementById('wb-xg-css')) return;
    var st=document.createElement('style'); st.id='wb-xg-css';
    st.textContent=
      '.xg-stage{position:relative;height:240px;border-radius:16px;overflow:hidden;margin:6px 0 4px;border:1px solid rgba(120,200,235,.18);box-shadow:inset 0 0 40px rgba(0,0,0,.45)}'+
      '.xg-water{position:absolute;inset:0;background:linear-gradient(180deg,#0c3550 0%,#0a2236 55%,#071726 100%)}'+
      '.xg-water.danger{background:linear-gradient(180deg,#3a0e12 0%,#1c0a12 55%,#0a0610 100%)}'+
      '.xg-sky{position:absolute;left:0;right:0;top:0;height:38%;background:linear-gradient(180deg,#16344c,#0c3550);opacity:.85}'+
      '.xg-glint{position:absolute;left:0;right:0;top:36%;height:3px;background:linear-gradient(90deg,transparent,rgba(231,206,139,.5),transparent);filter:blur(1px);animation:xgGlint 3.4s ease-in-out infinite}'+
      '@keyframes xgGlint{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:.7;transform:translateY(6px)}}'+
      '.xg-fish{position:absolute;font-size:30px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6));transition:left .12s linear, top .12s linear}'+
      '.xg-line{position:absolute;top:0;width:2px;background:linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,0));left:50%}'+
      '.xg-bob{position:absolute;font-size:20px;transform:transl(-50%,-50%)}'+
      '.xg-power{position:relative;height:22px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.4)}'+
      '.xg-power .zone{position:absolute;top:0;bottom:0;left:60%;width:24%;background:rgba(91,185,139,.4);border-left:2px solid #5BB98B;border-right:2px solid #5BB98B}'+
      '.xg-power .ind{position:absolute;top:-3px;width:6px;height:28px;border-radius:3px;background:#E7CE8B;box-shadow:0 0 10px rgba(231,206,139,.8);left:0}'+
      '.xg-meter{position:relative;height:16px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:8px;box-shadow:inset 0 2px 6px rgba(0,0,0,.4)}'+
      '.xg-meter .fill{position:absolute;left:0;top:0;bottom:0;width:0%;border-radius:99px;transition:width .08s linear}'+
      '.xg-fill-prog{background:linear-gradient(90deg,#5BB98B,#9CE3BE);box-shadow:0 0 12px rgba(91,185,139,.5)}'+
      '.xg-fill-tens{background:linear-gradient(90deg,#E2C268,#D6543B)}'+
      '.xg-lbl{font:700 11px ui-monospace,monospace;color:#cfe6ff;margin-top:6px;letter-spacing:.3px}'+
      '.xg-fin{position:absolute;font-size:34px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.7));transition:left .25s linear}'+
      '.xg-lane{position:absolute;left:0;right:0;height:33.3%;border-top:1px dashed rgba(255,255,255,.08)}'+
      '.xg-boat{position:absolute;left:8%;font-size:26px;transition:top .18s cubic-bezier(.3,.9,.3,1.2);filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))}'+
      '.xg-warn{position:absolute;right:8%;font:800 13px system-ui;color:#ff8d6a;text-shadow:0 0 10px rgba(214,84,59,.7);opacity:0;transition:opacity .15s}'+
      '.xg-warn.on{opacity:1}'+
      '.xg-row{display:flex;gap:10px;margin-top:10px}.xg-row .mg-btn{margin-top:0;flex:1}'+
      '.xg-ach{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:10003;background:linear-gradient(180deg,#13243a,#0a1726);border:1px solid rgba(201,162,75,.6);border-radius:14px;padding:12px 18px;color:#f5f0e1;font:700 14px system-ui;box-shadow:0 14px 40px rgba(0,0,0,.6);opacity:0;transition:opacity .4s,transform .4s}'+
      '.xg-ach.on{opacity:1;transform:translateX(-50%) translateY(6px)}';
    document.head.appendChild(st);
  })();

  // Leichtgewichtige, persistente Achievements für die neuen Module.
  function achieve(id, label){
    try{ var k='wb_xg_ach'; var s=JSON.parse(localStorage.getItem(k)||'{}'); if(s[id]) return; s[id]=1; localStorage.setItem(k,JSON.stringify(s)); }catch(e){}
    var t=document.createElement('div'); t.className='xg-ach'; t.innerHTML='🏆 Erfolg freigeschaltet<br><span style="color:#E7CE8B">'+label+'</span>';
    document.body.appendChild(t); requestAnimationFrame(function(){ t.classList.add('on'); });
    setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){ if(t.parentNode)t.remove(); },450); }, 2600);
  }

  function host(icon,title,sub){
    var h=$('minigame');
    h.innerHTML='<div class="mg-panel mg2"><div class="mg-head"><span class="mg-title">'+icon+' '+title+'</span><span class="mg-score" id="xg-score"></span></div>'
      +'<div class="mg-sub" id="xg-sub">'+sub+'</div><div id="xg-body"></div><div class="mg-feedback" id="xg-fb"></div>'
      +'<div class="mg-timer"><span class="mg-timer-fill" id="xg-tf"></span></div></div>';
    h.classList.add('show');
    return { host:h, body:$('xg-body'), score:$('xg-score'), sub:$('xg-sub'), fb:$('xg-fb'), tf:$('xg-tf') };
  }
  function fb(el,ok,msg){ if(!el)return; el.textContent=msg; el.className='mg-feedback '+(ok?'good':'bad')+' show'; }
  function done(h,res,cb){ h.classList.remove('show'); setTimeout(function(){h.innerHTML='';},220); if(cb)cb(res); }

  // ============================ 🎣 ANGELN ============================
  WB.MiniAngeln = { play:function(cfg,onDone){
    cfg=cfg||{}; var need=cfg.catches||3, dur=cfg.duration||26000, snapSpeed=cfg.tension||0.85, fishSpeed=cfg.fishSpeed||1;
    var t0=Date.now(), caught=0, over=false;
    var ui=host('🎣','ANGEL-PATROUILLE','Wirf aus · warte auf den Biss · halte die Leine, ohne sie zu reißen.');
    ui.score.textContent='0 / '+need;
    function tick(){ if(over)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ over=true; lucy(caught>=need?'Sauber gefischt.':'Zeit abgelaufen.'); done(ui.host,{success:caught>=need,score:caught},onDone); return;} setTimeout(tick,90);} 
    tick();
    function round(){
      if(over)return;
      ui.body.innerHTML='<div class="xg-stage"><div class="xg-water"></div><div class="xg-sky"></div><div class="xg-glint"></div></div>'
        +'<div class="xg-lbl">Kraft setzen – im grünen Bereich auswerfen</div>'
        +'<div class="xg-power" id="ag-pw"><div class="zone"></div><div class="ind" id="ag-ind"></div></div>'
        +'<button class="mg-btn" id="ag-cast">🎣 Auswerfen</button>';
      var ind=$('ag-ind'), pw=$('ag-pw'); var x=0,dir=1,raf;
      function loop(){ if(over)return; x+=dir*1.7; if(x>=100){x=100;dir=-1;} if(x<=0){x=0;dir=1;} ind.style.left=x+'%'; raf=requestAnimationFrame(loop);} loop();
      $('ag-cast').addEventListener('pointerdown',function(e){ e.preventDefault(); cancelAnimationFrame(raf);
        var good = x>=60 && x<=84; fb(ui.fb,good,good?'Perfekter Wurf!':'Wurf sitzt – mal sehen.'); bite(good); });
    }
    function bite(good){
      if(over)return;
      ui.body.innerHTML='<div class="xg-stage"><div class="xg-water"></div><div class="xg-sky"></div><div class="xg-glint"></div>'
        +'<div class="xg-line" id="ag-line" style="height:62%"></div><div class="xg-bob" id="ag-bob" style="left:50%;top:60%">🟠</div></div>'
        +'<div class="xg-lbl" id="ag-w">Warte auf den Biss…</div>';
      var wait = (good?700:1400) + Math.random()*1800;
      var bit=false;
      var to=setTimeout(function(){ if(over)return; bit=true; var b=$('ag-bob'); if(b)b.textContent='❗'; var w=$('ag-w'); if(w){w.textContent='BISS! Anschlagen!';w.style.color='#ffd36a';}
        var win=setTimeout(function(){ if(!over&&bit){ fb(ui.fb,false,'Zu langsam – Fisch entwischt.'); setTimeout(round,650);} }, cfg.strike||900);
        ui.host.querySelector('.xg-stage').onpointerdown=function(){ if(over||!bit)return; bit=false; clearTimeout(win); reel(); };
      }, wait);
      ui.host.querySelector('.xg-stage').onpointerdown=function(){ if(over||bit)return; };
    }
    function reel(){
      if(over)return;
      ui.body.innerHTML='<div class="xg-stage"><div class="xg-water"></div><div class="xg-sky"></div>'
        +'<div class="xg-fish" id="ag-fish" style="left:46%;top:55%">🐟</div></div>'
        +'<div class="xg-lbl">Halten zum Einholen – aber die Spannung darf nicht reißen!</div>'
        +'<div class="xg-meter"><span class="fill xg-fill-prog" id="ag-prog"></span></div>'
        +'<div class="xg-lbl">Leinenspannung</div><div class="xg-meter"><span class="fill xg-fill-tens" id="ag-tens"></span></div>'
        +'<button class="mg-btn" id="ag-reel">🎣 Einholen (halten)</button>';
      var prog=0,tens=0,reeling=false,raf,fin=false;
      var btn=$('ag-reel');
      btn.addEventListener('pointerdown',function(e){e.preventDefault();reeling=true;});
      btn.addEventListener('pointerup',function(){reeling=false;}); btn.addEventListener('pointerleave',function(){reeling=false;});
      var fish=$('ag-fish'), fx=46;
      (function loop(){ if(over||fin)return;
        prog += reeling?0.7*fishSpeed:-0.12; prog=Math.max(0,Math.min(100,prog));
        tens += reeling?(0.9*snapSpeed):-1.3; tens=Math.max(0,Math.min(100,tens));
        $('ag-prog').style.width=prog+'%'; $('ag-tens').style.width=tens+'%';
        fx += (reeling?-0.5:0.35); fx=Math.max(8,Math.min(70,fx)); if(fish){fish.style.left=fx+'%'; fish.style.transform='scaleX('+(reeling?-1:1)+')';}
        if(tens>=100){ fin=true; fb(ui.fb,false,'Leine gerissen!'); if(WB.Audio)WB.Audio.fail&&WB.Audio.fail(); setTimeout(round,700); return; }
        if(prog>=100){ fin=true; caught++; ui.score.textContent=caught+' / '+need; fb(ui.fb,true,'Fisch gelandet! 🐟'); if(WB.Audio)WB.Audio.coin&&WB.Audio.coin();
          if(caught===1) achieve('first_fish','Erster Fang');
          if(caught>=need){ achieve('angler','Meister-Angler'); over=true; lucy('Starke Beute, Kapitän.'); setTimeout(function(){done(ui.host,{success:true,score:caught},onDone);},500); }
          else setTimeout(round,700);
          return; }
        raf=requestAnimationFrame(loop);
      })();
    }
    lucy('Ruhiges Wasser – Zeit zum Angeln. Wirf im grünen Bereich aus.');
    round();
  }};

  // ============================ 🦈 SHARK BITE ============================
  WB.MiniSharkBite = { play:function(cfg,onDone){
    cfg=cfg||{}; var rounds=cfg.dodges||5, dur=cfg.duration||24000, react=cfg.react||1100, snapSpeed=cfg.tension||1.25;
    var t0=Date.now(), ok=0, over=false, idx=0;
    var ui=host('🦈','SHARK BITE','Weiche den Angriffen aus – dann hol den Hai im Kampf ein!');
    ui.score.textContent='0 / '+rounds;
    function tick(){ if(over)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ over=true; done(ui.host,{success:false,score:ok},onDone); return;} setTimeout(tick,90);} tick();
    function dodge(){
      if(over)return;
      if(idx>=rounds){ return reel(); }
      ui.score.textContent=ok+' / '+rounds;
      var target=Math.floor(Math.random()*3);
      ui.body.innerHTML='<div class="xg-stage"><div class="xg-water danger"></div>'
        +'<div class="xg-lane" style="top:0"></div><div class="xg-lane" style="top:33.3%"></div><div class="xg-lane" style="top:66.6%"></div>'
        +'<div class="xg-boat" id="sk-boat" style="top:42%">🚤</div>'
        +'<div class="xg-fin" id="sk-fin" style="right:-12%;top:'+(target*33.3+9)+'%">🦈</div>'
        +'<div class="xg-warn on" id="sk-warn" style="top:'+(target*33.3+9)+'%">⚠ ANGRIFF</div></div>'
        +'<div class="xg-lbl">Lenke das Boot aus der Angriffslinie!</div>'
        +'<div class="xg-row"><button class="mg-btn ghost" id="sk-up">▲ Oben</button><button class="mg-btn ghost" id="sk-mid">● Mitte</button><button class="mg-btn ghost" id="sk-dn">▼ Unten</button></div>';
      var boat=$('sk-boat'), fin=$('sk-fin'); var boatLane=1; boat.style.top='42%';
      function setLane(l){ boatLane=l; boat.style.top=(l*33.3+9)+'%'; }
      $('sk-up').onpointerdown=function(e){e.preventDefault();setLane(0);}; $('sk-mid').onpointerdown=function(e){e.preventDefault();setLane(1);}; $('sk-dn').onpointerdown=function(e){e.preventDefault();setLane(2);};
      requestAnimationFrame(function(){ fin.style.transition='left '+(react/1000)+'s linear, right '+(react/1000)+'s linear'; fin.style.right='78%'; });
      var resolved=false;
      var to=setTimeout(function(){ if(over||resolved)return; resolved=true;
        if(boatLane!==target){ ok++; fb(ui.fb,true,'Ausgewichen!'); if(WB.Audio)WB.Audio.coin&&WB.Audio.coin(); }
        else { fb(ui.fb,false,'Biss abbekommen!'); if(WB.Audio)WB.Audio.danger&&WB.Audio.danger(); }
        idx++; setTimeout(dodge,520);
      }, react+60);
    }
    function reel(){
      if(over)return;
      ui.sub.textContent='Der Hai ist am Haken – hol ihn ein, ohne dass die Leine reißt!';
      ui.body.innerHTML='<div class="xg-stage"><div class="xg-water danger"></div><div class="xg-fish" id="sk-shark" style="left:48%;top:52%;font-size:40px">🦈</div></div>'
        +'<div class="xg-lbl">Einholen</div><div class="xg-meter"><span class="fill xg-fill-prog" id="sk-prog"></span></div>'
        +'<div class="xg-lbl">Leinenspannung</div><div class="xg-meter"><span class="fill xg-fill-tens" id="sk-tens"></span></div>'
        +'<button class="mg-btn alarm" id="sk-reel">🦈 Einholen (halten)</button>';
      var prog=0,tens=0,reeling=false,fin=false; var btn=$('sk-reel');
      btn.addEventListener('pointerdown',function(e){e.preventDefault();reeling=true;});
      btn.addEventListener('pointerup',function(){reeling=false;}); btn.addEventListener('pointerleave',function(){reeling=false;});
      var sh=$('sk-shark'),fx=48;
      (function loop(){ if(over||fin)return;
        prog += reeling?0.55:-0.14; prog=Math.max(0,Math.min(100,prog));
        tens += reeling?(1.15*snapSpeed):-1.5; tens=Math.max(0,Math.min(100,tens));
        $('sk-prog').style.width=prog+'%'; $('sk-tens').style.width=tens+'%';
        fx += reeling?-0.45:0.4; fx=Math.max(8,Math.min(72,fx)); if(sh)sh.style.left=fx+'%';
        if(tens>=100){ fin=true; fb(ui.fb,false,'Leine gerissen – der Hai entkommt!'); if(WB.Audio)WB.Audio.fail&&WB.Audio.fail(); over=true; setTimeout(function(){done(ui.host,{success:false,score:ok},onDone);},800); return; }
        if(prog>=100){ fin=true; over=true; fb(ui.fb,true,'Hai bezwungen! 🦈🏆'); if(WB.Audio)WB.Audio.success&&WB.Audio.success(); achieve('shark_slayer','Hai bezwungen'); lucy('Unglaublich, Kapitän!'); setTimeout(function(){done(ui.host,{success:true,score:ok+1},onDone);},700); return; }
        requestAnimationFrame(loop);
      })();
    }
    lucy('Achtung – Hai im Revier! Bleib aus der Angriffslinie.');
    dodge();
  }};

  // ---- in den Dispatcher einklinken (additiv) ----
  if (WB.Minigame && WB.Minigame.play){
    var _orig = WB.Minigame.play;
    WB.Minigame.play = function(type,cfg,onDone){
      if (type==='angeln'||type==='fishing') return WB.MiniAngeln.play(cfg,onDone);
      if (type==='shark'||type==='sharkbite') return WB.MiniSharkBite.play(cfg,onDone);
      return _orig.call(WB.Minigame,type,cfg,onDone);
    };
  }

  // ---- neue Lage-Missionen in die bestehenden Pools einspeisen ----
  function injectMissions(){
    var M = WB.RevierLageMenu && WB.RevierLageMenu.pools; if(!M) return false;
    function add(pool,m){ if(M[pool] && !M[pool].some(function(x){return x.id===m.id;})) M[pool].push(m); }
    add('klar', { id:'FISH1', name:'Angel-Patrouille', type:'angeln', cfg:{catches:3,duration:28000,fishSpeed:1,tension:0.8}, desc:'Ruhiges Revier – kontrolliere Angler und lande selbst ein paar Fische.', ziel:'3 Fische sicher landen, ohne die Leine zu reißen.', base:110 });
    add('andrang', { id:'FISH2', name:'Fang im Getümmel', type:'angeln', cfg:{catches:4,duration:28000,fishSpeed:1.15,tension:0.95}, desc:'Viel Betrieb – schnelle, präzise Würfe sind gefragt.', ziel:'4 Fische landen, Leinenspannung im Griff.', base:150 });
    add('stoerung', { id:'SHARK2', name:'Hai-Sichtung', type:'shark', cfg:{dodges:5,duration:24000,react:1050,tension:1.2}, desc:'Ein Hai stört das Revier – ausweichen und einfangen.', ziel:'5 Angriffen ausweichen, dann den Hai einholen.', base:200 });
    add('sturm', { id:'SHARK1', name:'Shark Bite!', type:'shark', cfg:{dodges:6,duration:24000,react:850,tension:1.45}, desc:'Sturm & Raubfisch – der härteste Kampf auf dem Wasser.', ziel:'6 blitzschnellen Angriffen ausweichen, dann bezwingen.', base:240 });
    return true;
  }
  if(!injectMissions()){ document.addEventListener('DOMContentLoaded', injectMissions); setTimeout(injectMissions, 1500); }

  WB.MinigameExtra = { achieve:achieve };
})(window.WB = window.WB || {});
