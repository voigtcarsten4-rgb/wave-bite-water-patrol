/* Wave Bite – Water Patrol · ui/navmap.js
 * RC3.0: Holografisches Revier-Radar (Wasserlage-Nav). Leichtgewichtiges Canvas-Bordinstrument:
 * Wasserstraßen-Linie, Start/Ziel, simulierte Position, Checkpoints, Distanz, Reviername, Ampel.
 * Keine Map-Library. Mobil einklappbar. Tracking-Events. Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }
  var WL_URL = 'https://voigtcarsten4-rgb.github.io/wasserlage/index.html?from=game-nav';
  // stilisierte Wasserstraßen-Pfade je Revier (normiert 0..1), Start unten -> Ziel oben
  var PATHS = {
    bucht:      [[0.5,0.92],[0.42,0.74],[0.56,0.58],[0.46,0.40],[0.54,0.22],[0.5,0.08]],
    kanal:      [[0.5,0.92],[0.6,0.76],[0.4,0.62],[0.62,0.46],[0.42,0.30],[0.5,0.10]],
    seenplatte: [[0.5,0.92],[0.36,0.72],[0.58,0.56],[0.40,0.38],[0.60,0.20],[0.5,0.08]],
    schleuse:   [[0.5,0.92],[0.5,0.74],[0.44,0.58],[0.56,0.42],[0.5,0.26],[0.5,0.09]]
  };
  function pathFor(id) { return PATHS[id] || PATHS.bucht; }
  function lerpPt(path, t) {
    t = Math.max(0, Math.min(1, t)); var n = path.length - 1, f = t * n, i = Math.min(n - 1, f | 0), k = f - i;
    return [path[i][0] + (path[i+1][0]-path[i][0])*k, path[i][1] + (path[i+1][1]-path[i][1])*k];
  }

  var state = { open: true, lastCp: 0, completed: false, devT: 0, opened: false };

  var NavMap = {
    toggle: function () { state.open = !state.open; var p = $('navmap'); if (p) p.classList.toggle('collapsed', !state.open); },
    reset: function () { state.lastCp = 0; state.completed = false; state.devT = 0; },
    openWasserlage: function () {
      try { if (WB.Track) WB.Track.log('nav_map_wasserlage_click'); } catch (e) {}
      try { if (WB.Game && WB.Game.togglePause && WB.Game.state === 'playing') WB.Game.togglePause(); } catch (e) {}
      try { window.open(WL_URL, '_blank', 'noopener'); } catch (e) { location.href = WL_URL; }
    },
    draw: function (world, t) {
      try {
        var cv = $('navmap-cv'); if (!cv || !world) return;
        if (!state.opened) { state.opened = true; if (WB.Track) WB.Track.log('nav_map_open'); }
        var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
        ctx.clearRect(0, 0, W, H);
        var pad = 10, gw = W - pad * 2, gh = H - pad * 2;
        function PX(p) { return [pad + p[0] * gw, pad + p[1] * gh]; }
        // Glas/Grid
        ctx.fillStyle = 'rgba(8,24,40,0.55)'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(91,185,160,0.16)'; ctx.lineWidth = 1;
        for (var gx = 0; gx <= 4; gx++) { ctx.beginPath(); ctx.moveTo(pad + gx/4*gw, pad); ctx.lineTo(pad + gx/4*gw, pad+gh); ctx.stroke(); }
        for (var gy = 0; gy <= 4; gy++) { ctx.beginPath(); ctx.moveTo(pad, pad + gy/4*gh); ctx.lineTo(pad+gw, pad + gy/4*gh); ctx.stroke(); }
        var path = pathFor(world.region && world.region.id);
        // Wasserstraße
        ctx.strokeStyle = 'rgba(120,210,235,0.7)'; ctx.lineWidth = 2.4; ctx.beginPath();
        for (var i = 0; i < path.length; i++) { var p = PX(path[i]); if (i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); }
        ctx.stroke();
        // Checkpoints
        var n = world.checkpointN || 5, done = world.cpDone || 0;
        for (var c = 1; c <= n; c++) { var cp = PX(lerpPt(path, c / n));
          ctx.fillStyle = c <= done ? '#6fe0a3' : 'rgba(231,206,139,0.55)';
          ctx.beginPath(); ctx.arc(cp[0], cp[1], 3, 0, Math.PI*2); ctx.fill(); }
        // Start
        var st = PX(path[0]); ctx.fillStyle = '#9DB0C4'; ctx.beginPath(); ctx.arc(st[0], st[1], 3.5, 0, Math.PI*2); ctx.fill();
        // Ziel (blinkt)
        var gl = PX(path[path.length-1]); var bl = 0.5 + 0.5*Math.sin(t*4);
        ctx.fillStyle = 'rgba(201,162,75,' + (0.5+0.5*bl).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(gl[0], gl[1], 4.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(231,206,139,'+(0.3+0.5*bl).toFixed(2)+')'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(gl[0],gl[1],7*bl+3,0,Math.PI*2); ctx.stroke();
        // Position (entlang Route nach progressRatio)
        var pr = 0; try { pr = world.progressRatio(); } catch (e) {}
        var pos = PX(lerpPt(path, pr));
        var off = (world.inChannel === false);
        ctx.fillStyle = off ? '#ff7a66' : '#E7CE8B';
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = off ? 'rgba(255,122,102,0.8)' : 'rgba(231,206,139,0.7)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 7, 0, Math.PI*2); ctx.stroke();
        // Tracking-Events
        if (done > state.lastCp) { state.lastCp = done; if (WB.Track) WB.Track.log('route_checkpoint_reached', { cp: done }); }
        if (!state.completed && pr >= 0.999) { state.completed = true; if (WB.Track) WB.Track.log('route_completed'); }
        if (off) { state.devT += 0.016; if (state.devT > 1.6) { state.devT = 0; if (WB.Track) WB.Track.log('route_deviation'); } } else state.devT = 0;
        // Texte (HTML-Overlay aktualisieren)
        var reg = world.region || {}, m = Math.max(0, Math.round((1-pr) * (world.distance||world.mission.distance||1) / 12));
        setT('nav-revier', reg.name || 'Revier');
        setT('nav-dist', m + ' m · KP ' + done + '/' + n);
        setT('nav-coord', reg.coord || '');
        var amp = $('nav-amp'); if (amp) { amp.className = 'nav-amp ' + (world.storm ? 'red' : (world._fog ? 'amber' : 'green')); amp.textContent = world.storm ? 'WARNUNG' : (world._fog ? 'SICHT' : 'FREI'); }
      } catch (e) {}
    }
  };
  function setT(id, v) { var e = $(id); if (e && e.textContent !== v) e.textContent = v; }
  WB.NavMap = NavMap;
})(window.WB = window.WB || {});
