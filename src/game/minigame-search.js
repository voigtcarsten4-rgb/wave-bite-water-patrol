/* Wave Bite – Water Patrol · game/minigame-search.js
 * Hafen-Suche: finde die versteckten Hinweise im Raster, bevor die Zeit abläuft.
 * WB.MiniSearch.play(cfg, onDone({success,score})). Overlay #minigame. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  WB.MiniSearch = {
    play: function (cfg, onDone) {
      var host = $('minigame');
      if (!host) { if (onDone) onDone({ success: true, score: 0 }); return; }
      cfg = cfg || {};
      var need = cfg.need || 3, cells = cfg.cells || 9, dur = cfg.duration || 13000;
      var found = 0, taps = 0, done = false, tickT, endT, t0 = Date.now();
      // verteile die Hinweise zufällig
      var clue = {}; var placed = 0;
      while (placed < need) { var k = Math.floor(Math.random()*cells); if (!clue[k]) { clue[k]=1; placed++; } }

      var grid = '';
      for (var i=0;i<cells;i++) grid += '<div class="search-cell" data-i="'+i+'">·</div>';
      host.innerHTML = '<div class="mg-panel">'
        + '<div class="mg-head"><span class="mg-title">🔍 HAFEN-SUCHE</span><span class="mg-score" id="mg-score">0 / ' + need + '</span></div>'
        + '<div class="mg-sub">Tippe die Felder ab und finde ' + need + ' Hinweise.</div>'
        + '<div class="search-grid" id="sc-grid">' + grid + '</div>'
        + '<div class="mg-timer"><span class="mg-timer-fill" id="mg-tf"></span></div>'
        + '</div>';
      host.classList.add('show');
      var scoreEl = $('mg-score'), tf = $('mg-tf'), gridEl = $('sc-grid');

      function finish(){
        if (done) return; done = true; clearInterval(tickT); clearTimeout(endT);
        host.classList.remove('show');
        setTimeout(function(){ host.innerHTML=''; }, 220);
        if (onDone) onDone({ success: found >= need, score: found });
      }
      if (gridEl) gridEl.addEventListener('pointerdown', function(e){
        var c = e.target.closest ? e.target.closest('.search-cell') : null;
        if (!c || c._done || done) return; e.preventDefault();
        c._done = true; taps++;
        var i = +c.getAttribute('data-i');
        if (clue[i]) { found++; c.classList.add('found'); c.textContent = '🔎'; if (WB.Audio) WB.Audio.coin();
          if (scoreEl) scoreEl.textContent = found + ' / ' + need;
          if (found >= need) setTimeout(finish, 320);
        } else { c.classList.add('empty'); c.textContent = '·'; if (WB.Audio) WB.Audio.hit(); }
      });
      tickT = setInterval(function(){ var p = 1 - (Date.now()-t0)/dur; if (tf) tf.style.width = Math.max(0,p)*100 + '%'; }, 100);
      endT = setTimeout(finish, dur);
      if (WB.Audio) WB.Audio.unlock();
    }
  };
})(window.WB = window.WB || {});
