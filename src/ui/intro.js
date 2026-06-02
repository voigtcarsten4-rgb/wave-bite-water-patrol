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


  /* Signature-Intro: waehlt je nach Living-World-Lage + Tageszeit + Spielerhistorie
     eine kurze, abwechslungsreiche Kino-Einblendung (vor dem Marken-Intro). */
  function signatureContext() {
    var LW = WB.LivingWorld, A = WB.Assets;
    var hour = new Date().getHours();
    var d = LW ? LW.day() : null, w = LW ? LW.week() : null;
    var weather = d && d.weather ? d.weather.id : 'wolkig';
    var special = w && w.special ? w.special.id : null;
    var stroe = LW && LW.stroemung ? LW.stroemung() : 40;
    var lotseLine = w && w.lotse ? w.lotse : '';
    var s = WB.Save && WB.Save.data ? WB.Save.data : {};
    var returning = !!WB._bootLastPlayed;
    var lvl = s.captainLevel || 1;
    var rankUnit = (WB.data && WB.data.rankUnit) || 'WATER PATROL';
    var tod = hour < 6 ? 'night' : hour < 11 ? 'morning' : hour < 17 ? 'day' : hour < 22 ? 'evening' : 'night';

    function has(id){ return A && A.has && A.has(id) ? id : null; }
    function pick(){ for (var i=0;i<arguments.length;i++){ var id=has(arguments[i]); if(id) return id; } return null; }

    var bg, kicker, title, lena, lucy;

    // Prioritaet 1: Wochen-Sonderlage
    var SP = {
      sturmwoche: { bg: pick('rescue_gewitter','chase_gewitter','loc_storm'), k:'⛈️ STURMWOCHE', t:'Schwere Böen über der Seenplatte', lena:'Lena: Sturm zieht auf, Kapitän. Heute zählt jede ruhige Hand.', lucy:'Lucy: Wind böig, Wellen hoch. Ich halte das Radar offen.' },
      razzia:     { bg: pick('chase_finale','myst_schmuggleruebergabe','loc_industriehafen'), k:'🚔 GROSSEINSATZ', t:'Razzia gegen die Strömung', lena:'Lena: Heute fahren wir gegen das Netzwerk. Bleib dran.', lucy:'Lucy: Mehrere Kontakte markiert. Verfolgung wahrscheinlich.' },
      vermisst:   { bg: pick('rescue_nebel','rescue_dlrg_koop','loc_dahme'), k:'🛟 GROSSSUCHAKTION', t:'Vermisstenmeldungen häufen sich', lena:'Lena: Menschen brauchen uns da draußen. Volle Konzentration.', lucy:'Lucy: Suchmuster vorbereitet. Scheinwerfer bereit.' },
      regatta:    { bg: pick('wow_regatta_grosseinsatz','im_regattastrecke_gruenau','loc_regatta'), k:'⛵ REGATTA-SICHERUNG', t:'Bootsrennen im Revier', lena:'Lena: Viel Verkehr heute. Sichere die Strecke, halt das Tempo im Blick.', lucy:'Lucy: Dichter Segelverkehr. Vorsicht an den Bojen.' },
      fest:       { bg: pick('wow_hafenfest_polizei','loc_hafenfest','im_strandbar_wasser'), k:'🎉 HAFENFEST', t:'Festbetrieb im Hafen', lena:'Lena: Festtag im Hafen – zeig Präsenz, bleib freundlich.', lucy:'Lucy: Hohe Aktivität an den Anlegern. Bonus-Lage aktiv.' },
      nebelwoche: { bg: pick('myst_geistersignal','rescue_nebel','im_fischer_seddinsee'), k:'🌫️ NEBELWOCHE', t:'Dichte Nebelbänke', lena:'Lena: Sicht ist schlecht. Fahr auf Sicht, vertrau dem Radar.', lucy:'Lucy: Nebel dicht. Ich übernehme die Kontaktverfolgung.' }
    };
    if (special && SP[special] && SP[special].bg) {
      var sp = SP[special]; bg = sp.bg; kicker = sp.k; title = sp.t; lena = sp.lena; lucy = sp.lucy;
    }
    // Prioritaet 2: hohe Stroemungs-/Lotse-Aktivitaet -> Mystery
    else if (stroe >= 68) {
      bg = pick('myst_lotse_distanz','myst_geheimer_hafen','myst_stroemung_hinweis','char_lotse');
      kicker = '🛰️ STRÖMUNGS-AKTIVITÄT ' + Math.round(stroe) + '%';
      title = 'Der Lotse ist aktiv';
      lena = 'Lena: Etwas liegt in der Luft, Kapitän. Augen offen.';
      lucy = 'Lucy: ' + (lotseLine || 'Strömungs-Aktivität erhöht. Erhöhte Wachsamkeit empfohlen.');
    }
    // Prioritaet 3: Tageszeit + Wetter
    else {
      if (weather === 'gewitter') { bg = pick('rescue_gewitter','chase_gewitter','loc_storm'); kicker='⛈️ GEWITTERFRONT'; title='Unruhiges Wasser'; lena='Lena: Wetter dreht. Vorsicht heute.'; lucy='Lucy: Böen gemeldet. Stabilität im Blick behalten.'; }
      else if (weather === 'nebel') { bg = pick('myst_geistersignal','im_fischer_seddinsee','rescue_nebel'); kicker='🌫️ NEBELBÄNKE'; title='Sicht unter zwei Kabellängen'; lena='Lena: Nebel auf dem Wasser. Fahr ruhig.'; lucy='Lucy: Radar ist jetzt dein bester Freund.'; }
      else if (tod === 'night') { bg = pick('ctrl_blaulicht_hafen','wow_blaulicht_nachtnebel','chase_nacht','loc_spree'); kicker='🌙 NACHTBETRIEB'; title='Blaulicht auf ruhigem Wasser'; lena='Lena: Nachtschicht, Kapitän. Ich bin auf dem Funk.'; lucy='Lucy: Nachtbetrieb aktiv. Scheinwerfer und Blaulicht bereit.'; }
      else if (tod === 'morning') { bg = pick('wow_sunrise_einsatz','im_steg_mueggelsee','loc_mueggelsee'); kicker='☀️ MORGENLAGE'; title='Sonnenaufgang über dem Müggelsee'; lena='Lena: Guten Morgen, Kapitän. Ruhiges Revier, gutes Licht.'; lucy='Lucy: Systeme bereit. ' + (d&&d.weather?d.weather.label+'.':'Sicht gut.'); }
      else if (tod === 'evening') { bg = pick('wow_berlin_skyline','im_strandbar_wasser','loc_spree_day'); kicker='🌇 GOLDENE STUNDE'; title='Berlin vom Wasser'; lena='Lena: Schöner Abend für eine Streife.'; lucy='Lucy: Hafenlichter gehen an. Alle Systeme online.'; }
      else { bg = pick('wow_hero_shot','wow_berlin_skyline','loc_spree'); kicker='● ' + rankUnit; title='Patrol One einsatzbereit'; lena='Lena: Zentrale an Patrol One – schön, dass du da bist.'; lucy='Lucy: Alle Systeme online, Kapitän.'; }
    }

    var greet = returning ? 'Willkommen zurück' : 'Willkommen an Bord';
    var sub = greet + (lvl >= 5 ? ', Kapitän (Lvl ' + lvl + ')' : ', Kapitän') + '. ' + lena.replace(/^Lena:\s*/,'');
    var VMAP = { // RC2.0: dynamisches Intro nutzt die neuen ATMOSPHÄRE-Clips je Lage
      wow_sunrise_einsatz:'vid_a4_sonnenaufgang', im_steg_mueggelsee:'vid_a4_sonnenaufgang', loc_mueggelsee:'vid_a4_sonnenaufgang',
      wow_berlin_skyline:'vid_a4_nachtfahrt_berlin', loc_spree:'vid_a4_nachtfahrt_berlin', loc_spree_day:'vid_a4_nachtfahrt_berlin',
      rescue_gewitter:'vid_a4_sturm_seenplatte', chase_gewitter:'vid_a4_sturm_seenplatte', loc_storm:'vid_a4_sturm_seenplatte',
      myst_lotse_distanz:'vid_m2_lotse_nebel', myst_geheimer_hafen:'vid_m2_geheimer_anleger', char_lotse:'vid_m2_lotse_nebel',
      myst_stroemung_hinweis:'vid_m2_stroemung_radar', myst_geistersignal:'vid_m2_funksignal',
      rescue_nebel:'vid_a4_nebel_mueggelsee', im_fischer_seddinsee:'vid_a4_nebel_mueggelsee',
      wow_regatta_grosseinsatz:'vid_a4_regatta', im_regattastrecke_gruenau:'vid_a4_regatta', loc_regatta:'vid_a4_regatta',
      wow_hafenfest_polizei:'vid_a4_hafenfest', loc_hafenfest:'vid_a4_hafenfest', im_strandbar_wasser:'vid_a4_hafenfest',
      ctrl_blaulicht_hafen:'vid_a4_blaulicht_wasser', wow_blaulicht_nachtnebel:'vid_a4_blaulicht_wasser',
      loc_glienicker:'vid_a4_wasserleben_potsdam', loc_havel:'vid_a4_wasserleben_potsdam', loc_wannsee:'vid_a4_wasserleben_potsdam',
      chase_finale:'vid_e2_verfolgung_spree', chase_nacht:'vid_m2_lotse_nebel', loc_dahme:'vid_a4_abendfahrt' };
    var vid = bg && VMAP[bg] && WB.Assets && WB.Assets.has(VMAP[bg]) ? WB.Assets.url(VMAP[bg]) : null;
    return { bg: bg ? (WB.Assets.url(bg)) : null, video: vid, kicker: kicker, title: title, subtitle: sub, lucy: lucy };
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
    },

    // Signature-Intro: dynamische Welt-Einblendung -> dann Marken-Intro.
    playSignature: function (onDone) {
      var self = this;
      var ctx = null;
      try { ctx = signatureContext(); } catch (e) { ctx = null; }
      var goWordmark = function () { self.play(onDone); };
      if (ctx && ctx.bg && WB.Cinematic) {
        if (WB.Audio) { WB.Audio.unlock(); WB.Audio.radio(); }
        WB.Cinematic.play({
          kicker: ctx.kicker, title: ctx.title, subtitle: ctx.subtitle,
          bgUrl: ctx.bg, videoUrl: ctx.video || null, duration: ctx.video ? 5600 : 5200
        }, function () {
          if (ctx.lucy && WB.LucyHUD && WB.LucyHUD.say) { try { WB.LucyHUD.mount(); WB.LucyHUD.say(ctx.lucy, 4200); } catch (e) {} }
          goWordmark();
        });
      } else { goWordmark(); }
    }
  };
})(window.WB = window.WB || {});
