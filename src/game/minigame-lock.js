/* Wave Bite – Water Patrol · game/minigame-lock.js
 * Schleusen-Timing: stoppe den Zeiger in der grünen Zone (mehrere Runden). Adaptive Zonenbreite.
 * WB.MiniLock.play(cfg, onDone({success,score})). Overlay #minigame. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  WB.MiniLock = {
    play: function (cfg, onDone) {
      var host = $('minigame');
      if (!host) { if (onDone) onDone({ success: true, score: 0 }); return; }
      cfg = cfg || {};
      var need = cfg.need || 3, dur = cfg.duration || 15000;
      var skill = (WB.AI ? WB.AI.skill() : 0.4);
      var hits = 0, round = 0, done = false, raf = 0, t0 = Date.now();
      var pos = 0, dir = 1, zoneC = 0.5, zoneW = 0.26;

      host.innerHTML = '<div class="mg-panel">'
        + '<div class="mg-head"><span class="mg-title">🎚 SCHLEUSEN-TIMING</span><span class="mg-score" id="mg-score">0 / ' + need + '</span></div>'
        + '<div class="mg-sub">Stoppe den Zeiger in der grünen Zone – ' + need + '× sauber treffen.</div>'
        + '<div class="lock-track"><span class="lock-zone" id="lk-zone"></span><span class="lock-marker" id="lk-mark"></span></div>'
        + '<div class="lock-flash" id="lk-flash"></div>'
        + '<button class="mg-btn" id="lk-stop">STOPP</button>'
        + '<div class="mg-timer"><span class="mg-timer-fill" id="mg-tf"></span></div>'
        + '</div>';
      host.classList.add('show');
      var mark = $('lk-mark'), zone = $('lk-zone'), scoreEl = $('mg-score'), tf = $('mg-tf'), flash = $('lk-flash'), stop = $('lk-stop');

      function newRound(){
        zoneW = Math.max(0.10, 0.28 - skill * 0.12 - round * 0.02);
        zoneC = 0.18 + Math.random() * 0.64;
        var spd = 0.8 + skill * 0.5 + round * 0.12;
        dir = Math.random() < 0.5 ? spd : -spd;
        if (zone){ zone.style.left = ((zoneC - zoneW/2) * 100) + '%'; zone.style.width = (zoneW * 100) + '%'; }
      }
      function loop(){
        if (done) return;
        var now = Date.now(), p = 1 - (now - t0) / dur;
        if (tf) tf.style.width = Math.max(0, p) * 100 + '%';
        if (p <= 0) { finish(); return; }
        pos += dir * 0.016;
        if (pos > 1) { pos = 1; dir = -Math.abs(dir); }
        if (pos < 0) { pos = 0; dir = Math.abs(dir); }
        if (mark) mark.style.left = (pos * 100) + '%';
        raf = requestAnimationFrame(loop);
      }
      function tap(){
        if (done) return;
        var inZone = Math.abs(pos - zoneC) <= zoneW/2;
        if (inZone) { hits++; if (flash){ flash.textContent = 'PERFEKT!'; flash.style.color = '#9CE3BE'; } if (WB.Audio) WB.Audio.coin(); }
        else { if (flash){ flash.textContent = 'daneben'; flash.style.color = '#E08A78'; } if (WB.Audio) WB.Audio.hit(); }
        if (scoreEl) scoreEl.textContent = hits + ' / ' + need;
        round++;
        if (hits >= need) { setTimeout(finish, 360); return; }
        newRound();
      }
      function finish(){
        if (done) return; done = true; cancelAnimationFrame(raf);
        host.classList.remove('show');
        setTimeout(function(){ host.innerHTML=''; }, 220);
        if (onDone) onDone({ success: hits >= need, score: hits });
      }
      if (stop) stop.addEventListener('pointerdown', function(e){ e.preventDefault(); tap(); });
      newRound(); if (WB.Audio) WB.Audio.unlock(); raf = requestAnimationFrame(loop);
    }
  };
})(window.WB = window.WB || {});
