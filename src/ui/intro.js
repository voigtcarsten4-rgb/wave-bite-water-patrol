/* Wave Bite - Water Patrol - ui/intro.js
 * Cinematic WOW-Intro: Letterbox + Patrol-Boot-Parallax + Wordmark + Mentor-Begruessung.
 * Skippable (Tap). WB.Intro.play(onDone). Laeuft offline (Gradient-Fallback ohne Bild). */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }

  function buildParticles(n) {
    var s = '';
    var count = Math.min(n, 24);
    for (var i = 0; i < count; i++) {
      var x = (Math.random() * 100).toFixed(1);
      var d = (Math.random() * 2.2).toFixed(2);
      var du = (2.6 + Math.random() * 2).toFixed(2);
      var sc = (0.45 + Math.random() * 0.9).toFixed(2);
      s += '<span class="cine-p" style="left:' + x + '%;animation-delay:' + d
        + 's;animation-duration:' + du + 's;--sc:' + sc + '"></span>';
    }
    return s;
  }

  function typeOut(el, text, speed) {
    if (!el) return;
    var i = 0;
    (function step() {
      if (i > text.length) return;
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    })();
  }

  function sweepUnderline(canvasEl, w, h, delay) {
    if (!canvasEl) return;
    var startTime = null;
    var dur = 700;
    function draw(ts) {
      if (!startTime) startTime = ts;
      var pct = Math.min((ts - startTime) / dur, 1);
      pct = 1 - (1 - pct) * (1 - pct);
      var ctx = canvasEl.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      if (pct > 0) {
        var grd = ctx.createLinearGradient(0, 0, w * pct, 0);
        grd.addColorStop(0, 'rgba(231,206,139,0.9)');
        grd.addColorStop(0.7, 'rgba(201,162,75,0.7)');
        grd.addColorStop(1, 'rgba(201,162,75,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w * pct, h);
      }
      if (pct < 1) requestAnimationFrame(draw);
    }
    setTimeout(function () { requestAnimationFrame(draw); }, delay);
  }

  function startBoatPushIn(imgEl) {
    if (!imgEl) return;
    imgEl.style.transition = 'none';
    imgEl.style.transform = 'scale(1.14) translateY(2%)';
    imgEl.style.opacity = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        imgEl.style.transition = 'transform 14s cubic-bezier(0.12,0,0.39,0), opacity 1.4s ease';
        imgEl.style.transform = 'scale(1.0) translateY(0%)';
        imgEl.style.opacity = '1';
      });
    });
  }

  function revealLogo(markEl, titleEl, subEl, lineCanvas, base) {
    base = base || 0;
    var CB = 'cubic-bezier(0.2,0.9,0.3,1.2)';
    if (markEl) {
      markEl.style.opacity = '0';
      markEl.style.transform = 'scale(0.4) rotate(-12deg)';
      markEl.style.transition = 'none';
      setTimeout(function () {
        markEl.style.transition = 'opacity 0.55s ' + CB + ', transform 0.55s ' + CB;
        markEl.style.opacity = '1';
        markEl.style.transform = 'scale(1) rotate(0deg)';
      }, base);
    }
    if (titleEl) {
      titleEl.style.opacity = '0';
      titleEl.style.transform = 'translateY(20px)';
      titleEl.style.letterSpacing = '16px';
      titleEl.style.transition = 'none';
      setTimeout(function () {
        titleEl.style.transition = 'opacity 0.7s ease, transform 0.7s ease, letter-spacing 0.9s ease';
        titleEl.style.opacity = '1';
        titleEl.style.transform = 'translateY(0)';
        titleEl.style.letterSpacing = '6px';
      }, base + 180);
    }
    if (subEl) {
      subEl.style.opacity = '0';
      subEl.style.transform = 'translateY(10px)';
      subEl.style.transition = 'none';
      setTimeout(function () {
        subEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        subEl.style.opacity = '1';
        subEl.style.transform = 'translateY(0)';
      }, base + 560);
    }
    if (lineCanvas) {
      sweepUnderline(lineCanvas, lineCanvas.width, lineCanvas.height, base + 820);
    }
  }

  WB.Intro = {
    play: function (onDone) {
      var el = $('intro');
      if (!el) { if (onDone) onDone(); return; }

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        el.onclick = null;
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
        setTimeout(function () {
          el.classList.remove('show');
          el.style.opacity = '';
          el.style.transition = '';
          el.innerHTML = '';
          if (onDone) onDone();
        }, 420);
      }

      var boatUrl = (WB.Assets && WB.Assets.url('boat_patrol_threequarter_1')) || null;
      var mentUrl = (WB.Assets && WB.Assets.url('char_harbor_master_1')) || null;
      var vidUrl  = (WB.Assets && WB.Assets.url('clip_intro')) || null;
      if (!vidUrl) vidUrl = (WB.Assets && WB.Assets.url('clip_patrol')) || null;

      var html = '<div class="intro-stage">';

      if (vidUrl) {
        html += '<video id="intro-vid-el" class="intro-vid" autoplay muted loop playsinline src="'
          + vidUrl + '"></video>';
      } else if (boatUrl) {
        html += '<div id="intro-boat-img" style="position:absolute;inset:-6%;background-image:url(\''
          + boatUrl + '\');background-size:cover;background-position:center 60%;'
          + 'will-change:transform,opacity;"></div>';
      } else {
        html += '<div class="intro-vid fallback"></div>';
      }

      if (boatUrl && vidUrl) {
        html += '<div id="intro-boat-parallax" style="position:absolute;bottom:0;left:0;right:0;height:55%;'
          + 'background-image:url(\'' + boatUrl + '\');background-size:cover;'
          + 'background-position:center top;will-change:transform,opacity;'
          + 'mask-image:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 100%);'
          + '-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,0.85) 0%,'
          + 'rgba(0,0,0,0) 100%);"></div>';
      }

      html += '<div class="intro-grade"></div>';
      html += '<div class="cine-bar top"></div><div class="cine-bar bottom"></div>';
      html += '<div class="cine-particles">' + buildParticles(22) + '</div>';

      html += '<div class="intro-logo" id="intro-logo-block">'
        + '<div class="il-mark" id="intro-mark" style="opacity:0;transform:scale(0.4) rotate(-12deg);">&#9875;</div>'
        + '<div class="il-title" id="intro-title" style="opacity:0;transform:translateY(20px);'
        + 'letter-spacing:16px;">WAVE BITE</div>'
        + '<canvas id="intro-line" width="220" height="4" style="display:block;'
        + 'margin:6px auto 0;opacity:0.9;"></canvas>'
        + '<div class="il-sub" id="intro-sub" style="opacity:0;transform:translateY(10px);">'
        + 'WATER PATROL</div>'
        + '</div>';

      html += '<div class="intro-mentor" id="intro-mentor" style="opacity:0;transform:translateY(16px);">'
        + (mentUrl ? '<div class="im-port" style="background-image:url(\'' + mentUrl + '\')"></div>' : '')
        + '<div class="im-box">'
        + '<div class="im-name">&#9679; Hafenmeister &middot; Maritime Patrol Unit</div>'
        + '<div class="im-text" id="intro-text"></div>'
        + '</div></div>';

      html += '<button class="btn btn-gold intro-go" id="intro-go" style="opacity:0;'
        + 'transform:translateY(12px);">Antreten, Kapit&auml;n</button>';
      html += '<div class="intro-skip" id="intro-skip">Tippen zum Fortfahren</div>';
      html += '</div>';

      el.innerHTML = html;
      el.classList.add('show');

      if (WB.Audio) { WB.Audio.unlock(); WB.Audio.success(); }

      var boatBg = $('intro-boat-img');
      if (boatBg) startBoatPushIn(boatBg);

      var boatPar = $('intro-boat-parallax');
      if (boatPar) {
        boatPar.style.opacity = '0';
        boatPar.style.transform = 'translateY(8px)';
        boatPar.style.transition = 'none';
        setTimeout(function () {
          boatPar.style.transition = 'opacity 1.8s ease 0.6s, transform 14s linear 0.6s';
          boatPar.style.opacity = '1';
          boatPar.style.transform = 'translateY(0)';
        }, 80);
      }

      revealLogo($('intro-mark'), $('intro-title'), $('intro-sub'), $('intro-line'), 300);

      var mentorEl = $('intro-mentor');
      if (mentorEl) {
        setTimeout(function () {
          mentorEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          mentorEl.style.opacity = '1';
          mentorEl.style.transform = 'translateY(0)';
        }, 1300);
      }

      setTimeout(function () {
        typeOut($('intro-text'),
          'Willkommen an Bord, Kapitän. Ich bin dein Hafenmeister – ich zeig dir die Reviere, '
          + 'du fängst die Halunken. Klingt fair? Dann Leinen los und immer schön Kurs halten.',
          24);
      }, 1600);

      var goBtn = $('intro-go');
      if (goBtn) {
        setTimeout(function () {
          goBtn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          goBtn.style.opacity = '1';
          goBtn.style.transform = 'translateY(0)';
        }, 2000);
        goBtn.addEventListener('click', function (ev) { ev.stopPropagation(); finish(); });
      }

      var skipBtn = $('intro-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', function (ev) { ev.stopPropagation(); finish(); });
      }

      el.onclick = function () { finish(); };
      setTimeout(finish, 18000);
    }
  };
})(window.WB = window.WB || {});
