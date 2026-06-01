/* Wave Bite - Water Patrol - ui/cinematic.js
 * Cinematische Belohnungs-Sequenz: Letterbox, Rang-Insignie, Sterne, Gold-Partikel-Canvas.
 * Eased timing, outcome-spezifische Farbschemata (Erfolg / Befoerderung / Fail / Alarm).
 * Optionaler Video-Hintergrund (cfg.videoUrl), sonst Ken-Burns über Standbild.
 * Skippable (Tap). onDone genau einmal. API-Signatur unveraendert. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }

  function buildParticles(n, fail) {
    var s = '';
    var count = Math.min(n, 40);
    for (var i = 0; i < count; i++) {
      var x   = (Math.random() * 100).toFixed(1);
      var d   = (Math.random() * 1.8).toFixed(2);
      var sc  = (0.45 + Math.random() * 0.95).toFixed(2);
      var dur = (2.1 + Math.random() * 2).toFixed(2);
      var extra = fail
        ? 'background:radial-gradient(circle,#F2B5A8,#C9462F);box-shadow:0 0 6px rgba(201,70,47,.7);'
        : '';
      s += '<span class="cine-p" style="left:' + x + '%;animation-delay:' + d
        + 's;animation-duration:' + dur + 's;--sc:' + sc + ';' + extra + '"></span>';
    }
    return s;
  }

  function startShimmerCanvas(canvas) {
    if (!canvas) return null;
    var W = canvas.width  = canvas.offsetWidth  || 320;
    var H = canvas.height = canvas.offsetHeight || 200;
    var ctx = canvas.getContext('2d');
    var sparks = [];
    var MAX = 28;

    function spawn() {
      sparks.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 1 + Math.random() * 2.5, a: 0,
        va: 0.03 + Math.random() * 0.04,
        peak: 0.6 + Math.random() * 0.4,
        rising: true
      });
    }
    for (var k = 0; k < 10; k++) spawn();

    var alive = true;
    function frame() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      if (sparks.length < MAX && Math.random() < 0.22) spawn();
      for (var i = sparks.length - 1; i >= 0; i--) {
        var sp = sparks[i];
        if (sp.rising) { sp.a += sp.va; if (sp.a >= sp.peak) sp.rising = false; }
        else { sp.a -= sp.va * 0.7; }
        if (sp.a <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        var grd = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.r * 2.5);
        grd.addColorStop(0, 'rgba(247,220,130,' + sp.a.toFixed(2) + ')');
        grd.addColorStop(1, 'rgba(201,162,75,0)');
        ctx.fillStyle = grd;
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return function () { alive = false; };
  }

  function starString(stars) {
    var o = '';
    for (var i = 0; i < 3; i++) o += (i < stars ? '&#9733;' : '&#9734;');
    return o;
  }

  function revealEl(el, delay, fromY) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(' + (fromY || 14) + 'px)';
    el.style.transition = 'none';
    setTimeout(function () {
      el.style.transition = 'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  }

  function revealBadge(el, delay) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.4) rotate(-10deg)';
    el.style.transition = 'none';
    setTimeout(function () {
      el.style.transition = 'opacity 0.65s cubic-bezier(0.2,0.9,0.3,1.25), transform 0.65s cubic-bezier(0.2,0.9,0.3,1.25)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1) rotate(0deg)';
    }, delay);
  }

  function revealTitle(el, delay, fail) {
    if (!el) return;
    var spacing = fail ? '2px' : '4px';
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.letterSpacing = fail ? '6px' : '14px';
    el.style.transition = 'none';
    setTimeout(function () {
      el.style.transition = 'opacity 0.65s ease, transform 0.65s ease, letter-spacing 0.85s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.letterSpacing = spacing;
    }, delay);
  }

  function animateBars(topBar, botBar) {
    if (!topBar || !botBar) return;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / 550, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      var h = (ease * 10).toFixed(2) + '%';
      topBar.style.height = h;
      botBar.style.height = h;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function kickerColor(cfg) {
    if (cfg.fail) return '#F2B5A8';
    if (cfg.insigniaSVG) return '#E7CE8B';
    return '#7CE0A3';
  }

  WB.Cinematic = {
    play: function (cfg, onDone) {
      var el = $('cinematic');
      if (!el) { if (onDone) onDone(); return; }
      cfg = cfg || {};

      var done = false;
      var stopShimmer = null;

      function finish() {
        if (done) return;
        done = true;
        if (stopShimmer) stopShimmer();
        el.onclick = null;
        el.style.transition = 'opacity 0.35s ease';
        el.style.opacity = '0';
        setTimeout(function () {
          el.classList.remove('show');
          el.style.opacity = '';
          el.style.transition = '';
          el.innerHTML = '';
          if (onDone) onDone();
        }, 360);
      }

      var fail    = !!cfg.fail;
      var isPromo = !fail && !!cfg.insigniaSVG;
      var dur     = cfg.duration || (isPromo ? 4600 : fail ? 3200 : 3800);

      var bgEl;
      if (cfg.videoUrl) {
        bgEl = '<video class="cine-bg cine-video" autoplay muted loop playsinline src="'
          + cfg.videoUrl + '"></video>';
      } else {
        var bgStyle = cfg.bgUrl
          ? 'background-image:url(\'' + cfg.bgUrl + '\')'
          : 'background:' + (fail
              ? 'radial-gradient(120% 100% at 50% 30%,#1a0408,#081218)'
              : 'radial-gradient(120% 100% at 50% 30%,#0d2340,#04080f)');
        bgEl = '<div class="cine-bg" style="' + bgStyle + '"></div>';
      }

      var shimmerHtml = fail ? '' :
        '<canvas id="cine-shimmer" style="position:absolute;inset:0;width:100%;height:100%;'
        + 'pointer-events:none;z-index:1;opacity:0.55;"></canvas>';

      var insigniaHtml = isPromo
        ? '<div id="cine-badge-el" class="cine-badge">' + cfg.insigniaSVG + '</div>'
        : '';

      var starsHtml = (cfg.stars != null && !fail)
        ? '<div id="cine-stars-el" class="cine-stars">' + starString(cfg.stars) + '</div>'
        : '';

      var kColor = kickerColor(cfg);
      var kickerHtml = cfg.kicker
        ? '<div id="cine-kicker-el" class="cine-kicker" style="color:' + kColor + ';opacity:0;">'
          + cfg.kicker + '</div>'
        : '';

      var titleHtml = '<div id="cine-title-el" class="cine-title" style="opacity:0;">'
        + (cfg.title || '') + '</div>';

      var subHtml = cfg.subtitle
        ? '<div id="cine-sub-el" class="cine-sub" style="opacity:0;">' + cfg.subtitle + '</div>'
        : '';

      el.innerHTML = '<div class="cine-stage' + (fail ? ' fail' : '') + '">'
        + bgEl
        + '<div class="cine-haze"></div>'
        + '<div class="cine-godray"></div>'
        + shimmerHtml
        + '<div class="cine-grade"></div>'
        + '<div class="cine-vignette"></div>'
        + '<div class="cine-grain"></div>'
        + '<div id="cine-top-bar" class="cine-bar top" style="height:0;"></div>'
        + '<div id="cine-bot-bar" class="cine-bar bottom" style="height:0;"></div>'
        + '<div class="cine-particles">' + buildParticles(fail ? 12 : 20, fail) + '</div>'
        + '<div class="cine-content">'
        + kickerHtml + insigniaHtml + titleHtml + starsHtml + subHtml
        + '</div>'
        + '<div class="cine-skip">Tippen zum Fortfahren</div>'
        + '</div>';

      el.classList.add('show');
      el.onclick = finish;

      if (WB.Audio) {
        WB.Audio.unlock();
        if (fail) WB.Audio.fail(); else WB.Audio.success();
      }
      if (cfg.stars && !fail && WB.Audio) {
        setTimeout(function () { WB.Audio.coin(); }, 920);
      }

      animateBars($('cine-top-bar'), $('cine-bot-bar'));

      var shimmerCanvas = $('cine-shimmer');
      if (shimmerCanvas) stopShimmer = startShimmerCanvas(shimmerCanvas);

      revealEl($('cine-kicker-el'), 200, 10);
      if (isPromo) revealBadge($('cine-badge-el'), 350);
      revealTitle($('cine-title-el'), isPromo ? 520 : 420, fail);
      if (cfg.stars && !fail) revealEl($('cine-stars-el'), 750, 12);
      if (cfg.subtitle) revealEl($('cine-sub-el'), isPromo ? 900 : 820, 10);

      setTimeout(finish, dur);
    }
  };
})(window.WB = window.WB || {});
