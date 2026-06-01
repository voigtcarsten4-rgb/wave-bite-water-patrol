/* Wave Bite - Water Patrol · game/minigame-radar.js
 * Radar-Scan-Minispiel: tippe die goldenen Signale, meide Stoersignale, gegen die Zeit.
 * WB.MiniRadar.play(cfg, onDone({success, score})). Overlay #minigame, voll aufgeraeumt. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }

  WB.MiniRadar = {
    play: function (cfg, onDone) {
      var host = $('minigame');
      if (!host) { if (onDone) onDone({ success: true, score: 0 }); return; }
      cfg = cfg || {};
      var need = cfg.need || 5, dur = cfg.duration || 12000;
      var hits = 0, done = false, t0 = Date.now();

      host.innerHTML = '<div class="mg-panel">'
        + '<div class="mg-head"><span class="mg-title">📡 RADAR-SCAN</span><span class="mg-score" id="mg-score">0 / ' + need + '</span></div>'
        + '<div class="mg-sub">Tippe die goldenen Signale - meide die grauen Stoersignale.</div>'
        + '<div class="radar" id="mg-radar"><div class="radar-rings"></div><div class="radar-cross"></div><div class="radar-sweep"></div></div>'
        + '<div class="mg-timer"><span class="mg-timer-fill" id="mg-tf"></span></div>'
        + '</div>';
      host.classList.add('show');

      var radar = $('mg-radar'), scoreEl = $('mg-score'), tf = $('mg-tf');
      var spawnT, tickT, endT, blips = [];

      function cleanup() {
        clearInterval(spawnT); clearInterval(tickT); clearTimeout(endT);
        for (var i = 0; i < blips.length; i++) { var b = blips[i]; if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el); }
        blips = [];
      }
      function finish() {
        if (done) return; done = true; cleanup();
        host.classList.remove('show');
        setTimeout(function () { host.innerHTML = ''; }, 220);
        if (onDone) onDone({ success: hits >= need, score: hits });
      }
      function spawn() {
        var R = 122, cx = 140, cy = 140;
        var ang = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R;
        var x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
        var decoy = Math.random() < 0.36;
        var el = document.createElement('div');
        el.className = 'rad-blip' + (decoy ? ' decoy' : '');
        el.style.left = (x - 14) + 'px'; el.style.top = (y - 14) + 'px';
        var rec = { el: el, dead: false };
        el.addEventListener('pointerdown', function (e) {
          e.preventDefault(); if (rec.dead) return; rec.dead = true;
          if (decoy) { el.classList.add('miss'); if (WB.Audio) WB.Audio.hit(); }
          else {
            hits++; el.classList.add('hit'); if (WB.Audio) WB.Audio.coin();
            if (scoreEl) scoreEl.textContent = hits + ' / ' + need;
            if (hits >= need) { setTimeout(finish, 260); }
          }
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
        });
        radar.appendChild(el); blips.push(rec);
        setTimeout(function () { if (!rec.dead && el.parentNode) { el.classList.add('fade'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200); } }, 1500);
      }

      spawnT = setInterval(spawn, 640);
      tickT = setInterval(function () { var p = 1 - (Date.now() - t0) / dur; if (tf) tf.style.width = Math.max(0, p) * 100 + '%'; }, 100);
      endT = setTimeout(finish, dur);
      if (WB.Audio) { WB.Audio.unlock(); WB.Audio.radar(); }
    }
  };
})(window.WB = window.WB || {});
