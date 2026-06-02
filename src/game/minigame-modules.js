/* Wave Bite – Water Patrol · game/minigame-modules.js
 * Modernisierte Einsatzmodule der Wasserschutzpolizei (Teal/Gold, Wasserkarten-DNA, Lucy/Lena).
 * Module: Radar/Sonar · Funk · Schleuse · Hafenkontrolle · Rettung.
 * Jedes Modul: WB.MiniX.play(cfg, onDone({success,score})). Overlay #minigame, sauber aufgeraeumt, mobil. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  function lucy(t){ if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say(t); }
  function lena(t){ if (WB.Dialogue && WB.Dialogue.flash) WB.Dialogue.flash(t); else lucy(t); }

  // gemeinsames Geruest
  function Frame(icon, title, sub){
    var host = $('minigame');
    host.innerHTML = '<div class="mg-panel mg2">'
      + '<div class="mg-head"><span class="mg-title">'+icon+' '+title+'</span><span class="mg-score" id="mg-score"></span></div>'
      + '<div class="mg-sub" id="mg-sub">'+sub+'</div>'
      + '<div id="mg-body"></div>'
      + '<div class="mg-feedback" id="mg-fb"></div>'
      + '<div class="mg-timer"><span class="mg-timer-fill" id="mg-tf"></span></div>'
      + '</div>';
    host.classList.add('show');
    return { host: host, body: $('mg-body'), score: $('mg-score'), sub: $('mg-sub'), fb: $('mg-fb'), tf: $('mg-tf') };
  }
  function feedback(el, ok, msg){ if(!el) return; el.textContent = msg; el.className = 'mg-feedback ' + (ok?'good':'bad') + ' show'; }
  function close(host, res, onDone){
    host.classList.remove('show');
    setTimeout(function(){ host.innerHTML=''; }, 220);
    if (onDone) onDone(res);
  }

  // ============================ RADAR / SONAR ============================
  WB.MiniRadar = { play: function(cfg, onDone){
    cfg=cfg||{}; var need=cfg.need||4, dur=cfg.duration||14000, t0=Date.now(), done=false, hits=0, miss=0; var decoyRatio=(cfg.decoyRatio!=null?cfg.decoyRatio:0.4), life=cfg.signalLifetime||1700;
    var ui=Frame('📡','RADAR / SONAR','Identifiziere die echten Funksignale (gold). Meide Störsignale (grau).');
    ui.body.innerHTML='<div class="radar2" id="rd"><div class="radar-rings"></div><div class="radar-cross"></div><div class="rd-sweep" id="rdsw"></div><div class="rd-read" id="rdr">—</div></div>';
    ui.score.textContent='0 / '+need;
    var rd=$('rd'), sweep=$('rdsw'), read=$('rdr'); var blips=[], ang=0, raf, spawnT, endT;
    lucy('Sonar aktiv. Echte Signale pulsieren golden – Kurs & Distanz im Blick.');
    if (WB.Audio) { WB.Audio.unlock(); WB.Audio.radar && WB.Audio.radar(); }
    function bearing(x,y){ var a=Math.atan2(y-140,x-140)*180/Math.PI+90; if(a<0)a+=360; return (a|0); }
    function spawn(){
      var R=120, a=Math.random()*Math.PI*2, r=30+Math.sqrt(Math.random())*R;
      var x=140+Math.cos(a)*r, y=140+Math.sin(a)*r, decoy=Math.random()<decoyRatio;
      var el=document.createElement('div'); el.className='rd-blip'+(decoy?' decoy':'');
      el.style.left=(x-13)+'px'; el.style.top=(y-13)+'px';
      var rec={el:el,dead:false,x:x,y:y};
      el.addEventListener('pointerdown',function(e){ e.preventDefault(); if(rec.dead||done)return; rec.dead=true;
        if(decoy){ miss++; el.classList.add('miss'); feedback(ui.fb,false,'Störsignal! Genauer hinsehen.'); if(WB.Audio)WB.Audio.danger&&WB.Audio.danger(); }
        else { hits++; el.classList.add('hit'); ui.score.textContent=hits+' / '+need; feedback(ui.fb,true,'Kontakt bestätigt · Kurs '+bearing(x,y)+'° · '+((R-r+40)|0)+'m'); if(WB.Audio)WB.Audio.coin&&WB.Audio.coin();
          if(hits>=need){ done=true; setTimeout(function(){ lucy('Alle Kontakte identifiziert. Sauber gearbeitet.'); fin(true); },300); } }
        setTimeout(function(){ if(el.parentNode)el.parentNode.removeChild(el); },170);
      });
      rd.appendChild(el); blips.push(rec);
      setTimeout(function(){ if(!rec.dead&&el.parentNode){ el.classList.add('fade'); setTimeout(function(){ if(el.parentNode)el.parentNode.removeChild(el); },200);} },life);
    }
    function loop(){ if(done)return; ang=(ang+2.2)%360; sweep.style.transform='rotate('+ang+'deg)';
      // Lese-Anzeige folgt dem nächsten echten Kontakt
      var near=null; for(var i=0;i<blips.length;i++){ var b=blips[i]; if(!b.dead && !b.el.classList.contains('decoy')){ near=b; break; } }
      read.textContent = near? ('KURS '+bearing(near.x,near.y)+'°') : 'SCANNE…';
      raf=requestAnimationFrame(loop); }
    function fin(ok){ if(raf)cancelAnimationFrame(raf); clearInterval(spawnT); clearTimeout(endT);
      for(var i=0;i<blips.length;i++){ if(blips[i].el.parentNode) blips[i].el.parentNode.removeChild(blips[i].el); }
      close(ui.host,{success:ok&&hits>=need,score:hits},onDone); }
    spawnT=setInterval(spawn,650); raf=requestAnimationFrame(loop);
    (function tick(){ if(done)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ done=true; lucy(hits>=need?'Geschafft.':'Zeit abgelaufen.'); fin(hits>=need); return;} setTimeout(tick,90); })();
  }};

  // ============================ FUNK ============================
  WB.MiniFunk = { play: function(cfg, onDone){
    cfg=cfg||{}; var rounds=cfg.rounds||4, dur=cfg.duration||20000, t0=Date.now(), idx=0, ok=0, done=false; var penalty=cfg.penaltyMs||2500;
    var calls=cfg.calls||[
      { from:'Hafenmeister Grünau', say:'WSP Patrol 3, Lage am Steg?', right:'„Verstanden, Position wird kontrolliert."', wrong:['„Kanal 9, bitte wechseln."','„Keine Zeit, Ende."'] },
      { from:'Zentrale Spree', say:'Patrol 3, bestätigen Sie Kanal 16.', right:'„Bestätige Kanal 16, empfangsbereit."', wrong:['„Negativ, Feierabend."','„Welcher Kanal?"'] },
      { from:'DLRG Müggelsee', say:'Benötigen Sie Unterstützung?', right:'„Bitte Bereitschaft halten, melde mich."', wrong:['„Ignorieren."','„Später vielleicht."'] },
      { from:'Schleuse Wernsdorf', say:'Patrol 3, Einfahrt frei?', right:'„Warte auf grünes Signal, halte Abstand."', wrong:['„Fahre einfach rein."','„Egal, durch."'] },
      { from:'Wave Bite Leitstelle', say:'Status Ihres Einsatzes?', right:'„Kontrolle läuft, alles im Griff."', wrong:['„Keine Angabe."','„Frag später."'] }
    ];
    var ui=Frame('📻','FUNK · KANAL 16','Wähle die korrekte Funkantwort. Rufzeichen beachten.');
    function shuffle(a){ return a.slice().sort(function(){return Math.random()-0.5;}); }
    function round(){
      if(done)return;
      if(idx>=rounds){ done=true; lena(ok>=Math.ceil(rounds*0.6)?'Funkdisziplin vorbildlich, Patrol 3.':'Üben Sie die Funkverfahren, Patrol 3.'); close(ui.host,{success:ok>=Math.ceil(rounds*0.6),score:ok},onDone); return; }
      var c=calls[idx%calls.length]; ui.score.textContent='Funk '+(idx+1)+' / '+rounds;
      if(WB.Audio) WB.Audio.radio&&WB.Audio.radio();
      var opts=shuffle([{t:c.right,ok:true},{t:c.wrong[0],ok:false},{t:c.wrong[1],ok:false}]);
      var h='<div class="funk-call"><div class="funk-rz">📡 '+c.from+'</div><div class="funk-say">'+c.say+'</div></div>';
      opts.forEach(function(o,i){ h+='<button class="mg-btn funk-opt" data-ok="'+(o.ok?1:0)+'">'+o.t+'</button>'; });
      ui.body.innerHTML=h;
      ui.body.querySelectorAll('.funk-opt').forEach(function(b){ b.addEventListener('pointerdown',function(e){ e.preventDefault();
        var good=b.getAttribute('data-ok')==='1';
        if(good){ ok++; feedback(ui.fb,true,'Korrekt quittiert.'); if(WB.Audio)WB.Audio.success&&WB.Audio.success(); }
        else { t0-=penalty; feedback(ui.fb,false,'Falsche Antwort – Zeitverlust.'); if(WB.Audio)WB.Audio.fail&&WB.Audio.fail(); }
        idx++; setTimeout(round,650);
      }); });
    }
    lena('Patrol 3, Funkverkehr auf Kanal 16. Antworten Sie korrekt.');
    round();
    (function tick(){ if(done)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ done=true; close(ui.host,{success:ok>=Math.ceil(rounds*0.6),score:ok},onDone); return;} setTimeout(tick,90); })();
  }};

  // ============================ SCHLEUSE ============================
  WB.MiniSchleuse = { play: function(cfg, onDone){
    cfg=cfg||{}; var done=false; var dur=cfg.duration||16000, t0=Date.now(); var greenWin=cfg.greenWindow||4.5;
    var ui=Frame('🚦','SCHLEUSE WERNSDORF','Halte Tempo in der grünen Zone. Fahre erst bei GRÜN ein.');
    ui.body.innerHTML='<div class="schl"><div class="schl-lights" id="slz"><span class="sl r on"></span><span class="sl y"></span><span class="sl g"></span></div>'
      +'<div class="schl-meter"><div class="schl-green"></div><div class="schl-needle" id="sln"></div></div>'
      +'<div class="schl-lbl" id="slbl">Signal: ROT – Abstand halten</div>'
      +'<button class="mg-btn" id="sl-thr">▲ Schub halten</button>'
      +'<button class="mg-btn ghost" id="sl-go">⚓ Einfahren</button></div>';
    var needle=$('sln'), lbl=$('slbl'), lz=$('slz');
    var pos=0.5, vel=0, thr=false, phase='red', phaseT=2.2+Math.random()*2, warned=false, raf;
    lucy('Schleuse voraus. Tempo in der grünen Zone halten – Geduld bis Grün.');
    var thrBtn=$('sl-thr'), goBtn=$('sl-go');
    function press(e){ e.preventDefault(); thr=true; } function rel(){ thr=false; }
    thrBtn.addEventListener('pointerdown',press); thrBtn.addEventListener('pointerup',rel); thrBtn.addEventListener('pointerleave',rel);
    function setLights(){ lz.innerHTML='<span class="sl r'+(phase==='red'?' on':'')+'"></span><span class="sl y'+(phase==='yellow'?' on':'')+'"></span><span class="sl g'+(phase==='green'?' on':'')+'"></span>';
      lbl.textContent = phase==='green'?'Signal: GRÜN – jetzt einfahren!':phase==='yellow'?'Signal: GELB – bereithalten':'Signal: ROT – Abstand halten'; }
    goBtn.addEventListener('pointerdown',function(e){ e.preventDefault(); if(done)return;
      var inZone = pos>0.34 && pos<0.66;
      if(phase==='green' && inZone){ done=true; feedback(ui.fb,true,'Perfekte Einfahrt – Bonus!'); if(WB.Audio)WB.Audio.success&&WB.Audio.success(); lucy('Sauber eingefädelt, Kapitän.'); end(true); }
      else if(phase!=='green'){ feedback(ui.fb,false,'Verwarnung – Einfahrt bei Rot/Gelb!'); if(WB.Audio)WB.Audio.fail&&WB.Audio.fail(); t0-=2000; }
      else { feedback(ui.fb,false,'Zu schnell – Tempo erst in die grüne Zone!'); if(WB.Audio)WB.Audio.danger&&WB.Audio.danger(); }
    });
    function end(ok){ if(raf)cancelAnimationFrame(raf); close(ui.host,{success:ok,score:ok?1:0},onDone); }
    var last=Date.now();
    function loop(){ if(done)return; var dt=Math.min(0.05,(Date.now()-last)/1000); last=Date.now();
      vel += (thr?0.9:-0.7)*dt; vel*=0.92; pos=Math.max(0,Math.min(1,pos+vel*dt));
      needle.style.left=(pos*100)+'%';
      var inZone=pos>0.34&&pos<0.66; needle.className='schl-needle'+(inZone?' ok':' bad');
      phaseT-=dt; if(phaseT<=0){ phase = phase==='red'?'yellow':phase==='yellow'?'green':'red'; phaseT = phase==='green'?greenWin:phase==='yellow'?1.4:3.0; setLights(); }
      raf=requestAnimationFrame(loop);
    }
    setLights(); raf=requestAnimationFrame(loop);
    (function tick(){ if(done)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ done=true; lucy('Zeit abgelaufen an der Schleuse.'); end(false); return;} setTimeout(tick,90); })();
  }};

  // ============================ HAFENKONTROLLE ============================
  WB.MiniHafen = { play: function(cfg, onDone){
    cfg=cfg||{}; var rounds=cfg.rounds||4, dur=cfg.duration||22000, t0=Date.now(), idx=0, ok=0, done=false; var suspectRatio=cfg.suspectRatio;
    var pool=[
      { name:'Sportboot „Seeadler"', clues:['Papiere vollständig','ruhiges Verhalten','keine Ladung'], suspect:false },
      { name:'Motoryacht „Nordwind"', clues:['Registrierung abgelaufen','nervöser Skipper','abgedeckte Ladung'], suspect:true },
      { name:'Hausboot „Libelle"', clues:['Papiere ok','Familie an Bord','Proviant'], suspect:false },
      { name:'Schnellboot „Phantom"', clues:['keine Kennung','flieht Blickkontakt','schwere Kanister'], suspect:true },
      { name:'Segler „Brise"', clues:['Papiere ok','kooperativ','Angelausrüstung'], suspect:false },
      { name:'Frachtkahn „Otter"', clues:['Frachtpapiere fehlen','ausweichende Antworten','unbekanntes Ladegut'], suspect:true }
    ];
    var ui=Frame('🔦','HAFENKONTROLLE','Prüfe Papiere · Verhalten · Ladegut. Kontrolliere mit Augenmaß.');
    function shuffle(a){ return a.slice().sort(function(){return Math.random()-0.5;}); }
    var order; if(suspectRatio!=null){ var sus=pool.filter(function(b){return b.suspect;}), cle=pool.filter(function(b){return !b.suspect;}); order=[]; for(var oi=0;oi<rounds;oi++){ var useS=Math.random()<suspectRatio; var src=useS?sus:cle; if(!src.length)src=useS?cle:sus; order.push(src[Math.floor(Math.random()*src.length)]); } } else { order=shuffle(pool); }
    lucy('Augenmaß, Kapitän: nicht jeder ist verdächtig. Hinweise abwägen.');
    function round(){
      if(done)return;
      if(idx>=rounds){ done=true; lena(ok>=Math.ceil(rounds*0.6)?'Gute Lageeinschätzung.':'Verdachtsmomente besser abwägen.'); close(ui.host,{success:ok>=Math.ceil(rounds*0.6),score:ok},onDone); return; }
      var b=order[idx%order.length]; ui.score.textContent='Boot '+(idx+1)+' / '+rounds;
      var h='<div class="hk-card"><div class="hk-name">🚤 '+b.name+'</div><ul class="hk-clues">';
      b.clues.forEach(function(c){ h+='<li>• '+c+'</li>'; }); h+='</ul></div>';
      h+='<button class="mg-btn" id="hk-pass">✅ Durchwinken</button><button class="mg-btn alarm" id="hk-stop">🛑 Kontrollieren</button>';
      ui.body.innerHTML=h;
      function decide(stop){ if(done)return; var correct = (stop===b.suspect);
        if(correct){ ok++; feedback(ui.fb,true, stop?'Richtig – berechtigter Verdacht.':'Richtig – sauber, durchgewunken.'); if(WB.Audio)WB.Audio.coin&&WB.Audio.coin(); }
        else { feedback(ui.fb,false, stop?'Fehlverdacht – unnötige Kontrolle.':'Verdächtiges Boot durchgelassen!'); if(WB.Audio)WB.Audio.fail&&WB.Audio.fail(); t0-=1500; }
        idx++; setTimeout(round,700);
      }
      $('hk-pass').addEventListener('pointerdown',function(e){e.preventDefault();decide(false);});
      $('hk-stop').addEventListener('pointerdown',function(e){e.preventDefault();decide(true);});
    }
    round();
    (function tick(){ if(done)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ done=true; close(ui.host,{success:ok>=Math.ceil(rounds*0.6),score:ok},onDone); return;} setTimeout(tick,90); })();
  }};

  // ============================ RETTUNG ============================
  WB.MiniRettung = { play: function(cfg, onDone){
    cfg=cfg||{}; var dur=cfg.duration||20000, t0=Date.now(), done=false, stage='locate'; var holdNeed=cfg.holdTime||2.0, drift=(cfg.driftSpeed!=null?cfg.driftSpeed:0.10);
    var ui=Frame('🛟','RETTUNGSEINSATZ','Person orten, ruhig annähern, Rettungszone halten.');
    // Stage 1: orten (Richtungssuche), Stage 2: annähern (Tempo), Stage 3: Ring werfen
    var target=Math.random()*360, holdT=0, raf;
    ui.body.innerHTML='<div class="ret"><div class="ret-radar" id="rr"><div class="radar-rings"></div><div class="ret-arrow" id="ra">▲</div><div class="ret-read" id="rdr2">Peilen…</div></div>'
      +'<div class="ret-actions"><button class="mg-btn ghost" id="ret-left">◀</button><button class="mg-btn ghost" id="ret-right">▶</button></div>'
      +'<button class="mg-btn" id="ret-act">📍 Position bestätigen</button></div>';
    var arrow=$('ra'), read=$('rdr2'), act=$('ret-act');
    var heading=0;
    lucy('Notfall! Erst die Person peilen – Pfeil auf die Quelle ausrichten.');
    $('ret-left').addEventListener('pointerdown',function(e){e.preventDefault();heading=(heading-12+360)%360;});
    $('ret-right').addEventListener('pointerdown',function(e){e.preventDefault();heading=(heading+12)%360;});
    function diff(){ var d=Math.abs(((heading-target+540)%360)-180); return d; }
    var approach=1.0, thr=false, last=Date.now();
    function startApproach(){ stage='approach'; ui.sub.textContent='LANGSAM annähern – in der grünen Zone halten (nicht zu schnell!).';
      ui.body.innerHTML='<div class="ret"><div class="ret-bar"><div class="ret-zone"></div><div class="ret-mark" id="rm"></div></div>'
        +'<div class="ret-lbl" id="rl">Distanz: <b>weit</b></div><button class="mg-btn" id="ret-slow">🐢 Sacht heran (halten)</button></div>';
      var slow=$('ret-slow'); slow.addEventListener('pointerdown',function(e){e.preventDefault();thr=true;}); slow.addEventListener('pointerup',function(){thr=false;}); slow.addEventListener('pointerleave',function(){thr=false;});
      lucy('Tempo raus. Zu schnell gefährdet die Person.');
      raf=requestAnimationFrame(appLoop);
    }
    function appLoop(){ if(done)return; var dt=Math.min(0.05,(Date.now()-last)/1000); last=Date.now();
      approach += (thr?-0.22:drift)*dt*1.6; approach=Math.max(0,Math.min(1,approach));
      var mark=$('rm'), rl=$('rl'); if(mark) mark.style.left=((1-approach)*100)+'%';
      var inZone = approach>0.12 && approach<0.30; if(mark) mark.className='ret-mark'+(inZone?' ok':'');
      if(rl) rl.innerHTML='Distanz: <b>'+(approach>0.5?'weit':approach>0.30?'mittel':inZone?'RETTUNGSZONE':'zu nah!')+'</b>';
      if(inZone){ holdT+=dt; feedbackHold(holdT); if(holdT>=holdNeed){ done=true; if(raf)cancelAnimationFrame(raf); feedback(ui.fb,true,'Person gesichert – saubere Rettung!'); if(WB.Audio)WB.Audio.success&&WB.Audio.success(); lucy('Person an Bord. Stark gemacht.'); close(ui.host,{success:true,score:1},onDone); return; } }
      else { if(approach<=0.10){ feedback(ui.fb,false,'Zu nah/zu schnell – Abbruch droht!'); holdT=Math.max(0,holdT-dt); } }
      raf=requestAnimationFrame(appLoop);
    }
    function feedbackHold(h){ if(ui.fb && stage==='approach'){ ui.fb.className='mg-feedback good show'; ui.fb.textContent='In der Rettungszone… halten ('+h.toFixed(1)+'s / '+holdNeed.toFixed(1)+'s)'; } }
    act.addEventListener('pointerdown',function(e){ e.preventDefault(); if(stage!=='locate'||done)return;
      if(diff()<22){ feedback(ui.fb,true,'Position bestätigt – jetzt annähern.'); if(WB.Audio)WB.Audio.coin&&WB.Audio.coin(); if(raf)cancelAnimationFrame(raf); startApproach(); }
      else { feedback(ui.fb,false,'Falsche Peilung – Pfeil nachführen.'); if(WB.Audio)WB.Audio.danger&&WB.Audio.danger(); }
    });
    function locLoop(){ if(done||stage!=='locate')return; arrow.style.transform='rotate('+heading+'deg)';
      var d=diff(); read.textContent = d<22?'SIGNAL STARK':d<60?'wärmer…':'peilen…'; arrow.style.color = d<22?'#6fe0a3':d<60?'#E7CE8B':'#9AA6B3';
      raf=requestAnimationFrame(locLoop); }
    raf=requestAnimationFrame(locLoop);
    (function tick(){ if(done)return; var p=1-(Date.now()-t0)/dur; ui.tf.style.width=Math.max(0,p)*100+'%'; if(p<=0){ done=true; if(raf)cancelAnimationFrame(raf); lucy('Zeit abgelaufen.'); close(ui.host,{success:false,score:0},onDone); return;} setTimeout(tick,90); })();
  }};

})(window.WB = window.WB || {});
