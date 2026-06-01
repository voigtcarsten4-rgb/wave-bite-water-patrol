/* Wave Bite – Water Patrol · ui/intro.js
 * MARVEL-ACTION-INTRO: CGI-Patrouillenboot als Held – Push-In, God-Rays, Nebel,
 * pulsierendes Blaulicht + Blue-Wash, Wasser-Schimmer, Title-Slam mit Gold-Shine,
 * Funk-Dispatch (Lucy). Skippable (Tap). WB.Intro.play(onDone). Offline-Fallback. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }

  function buildParticles(n) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var x = (Math.random() * 100).toFixed(1);
      var d = (Math.random() * 3.2).toFixed(2);
      var du = (3.0 + Math.random() * 2.6).toFixed(2);
      var sc = (0.4 + Math.random() * 1.0).toFixed(2);
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
      el.textContent = text.slice(0, i); i++;
      setTimeout(step, speed);
    })();
  }

  WB.Intro = {
    play: function (onDone) {
      var el = $('intro');
      if (!el) { if (onDone) onDone(); return; }

      var done = false, timers = [];
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function finish() {
        if (done) return; done = true;
        for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
        el.onclick = null;
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '0';
        setTimeout(function () {
          el.classList.remove('show'); el.style.opacity = ''; el.style.transition = '';
          el.innerHTML = ''; if (onDone) onDone();
        }, 500);
      }

      var boatUrl = (WB.Assets && WB.Assets.url('boat_patrol_threequarter_1')) || null;
      var portUrl = (WB.Assets && (WB.Assets.url('char_radio_operator_1') || WB.Assets.url('char_harbor_master_1'))) || null;

      var html = '<div class="intro-stage mv">';
      // Held: CGI-Patrouillenboot (Ken-Burns Push-In)
      if (boatUrl) {
        html += '<div id="intro-boat" class="mv-boat" style="background-image:url(\'' + boatUrl + '\')"></div>';
      } else {
        html += '<div class="mv-boat fallback"></div>';
      }
      // Atmosphäre
      html += '<div class="mv-rays"></div>';
      html += '<div class="mv-fog f1"></div><div class="mv-fog f2"></div>';
      html += '<div class="mv-grade"></div>';
      html += '<div class="mv-beacon"></div>';        // pulsierendes Blaulicht am Boot
      html += '<div class="mv-bluewash"></div>';      // Blaulicht-Flackern über den Screen
      html += '<div class="mv-water"></div>';
      html += '<div class="cine-bar top"></div><div class="cine-bar bottom"></div>';
      html += '<div class="cine-particles">' + buildParticles(26) + '</div>';
      html += '<div class="mv-scan"></div>';          // horizontaler Licht-Scan

      // Title-Block
      html += '<div class="mv-titles">';
      html += '<div class="mv-kicker" id="mv-kicker">MARITIME PATROL UNIT</div>';
      html += '<div class="mv-title" id="mv-title"><span class="mv-shine">WAVE BITE</span></div>';
      html += '<div class="mv-rule" id="mv-rule"></div>';
      html += '<div class="mv-sub" id="mv-sub">WATER PATROL</div>';
      html += '<div class="mv-tag" id="mv-tag">SCH&Uuml;TZE &middot; DIENE &middot; ENTDECKE</div>';
      html += '</div>';

      // Funk-Dispatch
      html += '<div class="intro-mentor mv-disp" id="mv-disp">'
        + (portUrl ? '<div class="im-port" style="background-image:url(\'' + portUrl + '\')"></div>' : '')
        + '<div class="im-box"><div class="im-name">&#9679; FUNK &middot; LUCY &middot; KI-DISPATCH</div>'
        + '<div class="im-text" id="mv-text"></div></div></div>';

      html += '<button class="btn btn-gold intro-go" id="mv-go">Antreten, Kapit&auml;n</button>';
      html += '<div class="intro-skip" id="mv-skip">Tippen zum Fortfahren</div>';
      html += '</div>';

      el.innerHTML = html; el.classList.add('show');
      if (WB.Audio) { WB.Audio.unlock(); WB.Audio.success(); }

      // Title-Slam
      var titleEl = $('mv-title');
      later(function () { if (titleEl) titleEl.classList.add('in'); }, 700);
      later(function () { var s = el.querySelector('.mv-shine'); if (s) s.classList.add('go'); }, 1300);
      later(function () { var r = $('mv-rule'); if (r) r.classList.add('in'); }, 1500);
      later(function () { var s = $('mv-sub'); if (s) s.classList.add('in'); }, 1700);
      later(function () { var t = $('mv-tag'); if (t) t.classList.add('in'); }, 2200);
      later(function () { var k = $('mv-kicker'); if (k) k.classList.add('in'); }, 500);

      // Funk + Button
      later(function () { var d = $('mv-disp'); if (d) d.classList.add('in'); }, 3000);
      later(function () {
        typeOut($('mv-text'),
          'Patrol One, hier Zentrale. Revier ist deins, Kapitän – Augen offen, Kurs sauber. Lucy out.', 22);
      }, 3300);
      later(function () { var g = $('mv-go'); if (g) g.classList.add('in'); }, 4200);

      var goBtn = $('mv-go');
      if (goBtn) goBtn.addEventListener('click', function (ev) { ev.stopPropagation(); finish(); });
      var skipBtn = $('mv-skip');
      if (skipBtn) skipBtn.addEventListener('click', function (ev) { ev.stopPropagation(); finish(); });
      el.onclick = function () { finish(); };
      later(finish, 13000);
    }
  };
})(window.WB = window.WB || {});
