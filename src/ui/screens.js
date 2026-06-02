/* Wave Bite - Captain's Run * ui/screens.js
 * Screen-Navigation + dynamische Inhalte für alle Menüs und Overlays. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function on(id, fn) { var el = $(id); if (el) el.addEventListener('click', function (e) { WB.Audio.unlock(); WB.Audio.click(); fn(e); }); }
  function esc(s) { return String(s); }
  function stars(n) { var o = ''; for (var i = 0; i < 3; i++) o += (i < n ? '★' : '☆'); return o; }
  function statBar(label, val) {
    var pct = Math.max(0, Math.min(10, val)) * 10;
    return '<div class="stat"><span class="stat-l">' + label + '</span>'
      + '<span class="stat-track"><span class="stat-fill" style="width:' + pct + '%"></span></span></div>';
  }

  var SCREENS = ['screen-start', 'screen-missions', 'screen-boats', 'screen-progress', 'screen-settings', 'screen-game'];

  function show(name) {
    for (var i = 0; i < SCREENS.length; i++) { var el = $(SCREENS[i]); if (el) el.classList.toggle('active', SCREENS[i] === name); }
    var top = $('topbar'); if (top) top.classList.toggle('hidden', name === 'screen-game');
  }

  // ---- Reward Animation Utilities -----------------------------------------

  /** Animated count-up for a numeric element.
   *  @param {HTMLElement} el  - target element
   *  @param {number}      to  - target value
   *  @param {number}      ms  - total duration in ms
   *  @returns {number}        - RAF id (for cleanup)
   */
  function countUp(el, to, ms) {
    if (!el) return 0;
    var start = null, from = 0;
    ms = ms || 700;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / ms);
      // ease-out cubic
      var ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * ease);
      if (t < 1) { return requestAnimationFrame(step); }
      el.textContent = to;
      return 0;
    }
    return requestAnimationFrame(step);
  }

  /** Reveal three star elements with staggered pop animation.
   *  Expects a container with three children having data-star="0/1/2".
   *  @param {HTMLElement} container
   *  @param {number}      count  - how many stars filled (0-3)
   */
  function animateStars(container, count) {
    if (!container) return;
    var items = container.querySelectorAll('[data-star]');
    for (var i = 0; i < items.length; i++) {
      (function (el, idx) {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.3)';
        el.style.display = 'inline-block';
        el.style.transition = 'none';
        var delay = 120 + idx * 180;
        setTimeout(function () {
          var filled = idx < count;
          el.textContent = filled ? '★' : '☆';
          el.style.color = filled ? '#C9A24B' : 'rgba(201,162,75,0.35)';
          el.style.textShadow = filled ? '0 4px 18px rgba(201,162,75,0.7)' : 'none';
          el.style.transition = 'opacity 0.18s ease, transform 0.28s cubic-bezier(0.2,0.9,0.3,1.35)';
          el.style.opacity = '1';
          el.style.transform = 'scale(1.25)';
          setTimeout(function () {
            el.style.transform = 'scale(1)';
          }, 180);
        }, delay);
      })(items[i], i);
    }
  }

  /** Spawn a short-lived gold/cream confetti burst inside a container.
   *  Automatically removes itself after animation completes.
   *  @param {HTMLElement} container  - parent element
   *  @param {number}      count      - max particles (capped at 50)
   */
  function spawnConfetti(container, count) {
    if (!container) return;
    // Clean up any previous confetti layer
    var old = container.querySelector('.wb-confetti-layer');
    if (old) old.parentNode.removeChild(old);

    count = Math.min(count || 36, 50);
    var layer = document.createElement('div');
    layer.className = 'wb-confetti-layer';
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;';
    container.appendChild(layer);

    var colors = ['#C9A24B', '#E7CE8B', '#F5F0E1', '#E7CE8B', '#C9A24B'];
    var shapes = ['circle', 'rect', 'line'];
    var rids = [];

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var delay = Math.random() * 400;
        var t = setTimeout(function () {
          if (!layer.parentNode) return;
          var el = document.createElement('div');
          var shape = shapes[Math.floor(Math.random() * shapes.length)];
          var color = colors[Math.floor(Math.random() * colors.length)];
          var size = shape === 'line' ? 2 : (4 + Math.random() * 6);
          var w = shape === 'line' ? (8 + Math.random() * 10) : size;
          var h = shape === 'line' ? 2 : size;
          var left = 10 + Math.random() * 80; // percent
          var dur = 900 + Math.random() * 800;
          var xDrift = (Math.random() - 0.5) * 60;
          el.style.cssText = [
            'position:absolute',
            'left:' + left + '%',
            'top:0',
            'width:' + w + 'px',
            'height:' + h + 'px',
            'background:' + color,
            'border-radius:' + (shape === 'circle' ? '50%' : '2px'),
            'opacity:0',
            'transform:translateY(-10px) translateX(0)',
            'transition:none'
          ].join(';');
          layer.appendChild(el);

          var start = null;
          function frame(ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / dur);
            // ease-in fall
            var y = p * p * 340;
            var x = xDrift * p;
            var op = p < 0.1 ? p * 10 : p > 0.75 ? (1 - p) * 4 : 1;
            el.style.transform = 'translateY(' + y + 'px) translateX(' + x + 'px) rotate(' + (p * 360) + 'deg)';
            el.style.opacity = op;
            if (p < 1) {
              rids[idx] = requestAnimationFrame(frame);
            } else {
              el.style.opacity = '0';
            }
          }
          rids[idx] = requestAnimationFrame(frame);
        }, delay);
        rids[idx + 1000] = t; // store timer id with offset key
      })(i);
    }

    // Auto-cleanup after 2.2s
    var cleanTimer = setTimeout(function () {
      for (var k in rids) { if (rids[k]) { cancelAnimationFrame(rids[k]); clearTimeout(rids[k]); } }
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 2200);
    layer._cleanTimer = cleanTimer;
  }

  /** Render the rank-up "Beforderung" banner and sweep it in.
   *  @param {HTMLElement} container  - element to prepend the banner to
   *  @param {object}      rankObj    - rank data object with .name / .t.tierName / .short
   */
  function showRankUpBanner(container, rankObj) {
    if (!container || !rankObj) return;
    var old = container.querySelector('.wb-rankup-banner');
    if (old) old.parentNode.removeChild(old);

    var insig = (WB.RankInsignia && WB.RankInsignia.svg) ? WB.RankInsignia.svg(rankObj, 56, true) : '';
    var tierName = (rankObj.t && rankObj.t.tierName) ? rankObj.t.tierName : '';
    var unitName = (WB.data && WB.data.rankUnit) ? WB.data.rankUnit : 'Maritime Patrol Unit';

    var banner = document.createElement('div');
    banner.className = 'wb-rankup-banner';
    banner.style.cssText = [
      'position:relative',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'justify-content:center',
      'margin:14px auto 6px',
      'padding:13px 18px',
      'max-width:320px',
      'border-radius:18px',
      'border:1px solid #C9A24B',
      'background:linear-gradient(135deg,rgba(201,162,75,0.22),rgba(201,162,75,0.06))',
      'box-shadow:0 8px 32px rgba(201,162,75,0.38)',
      'overflow:hidden',
      'opacity:0',
      'transform:translateY(-18px) scale(0.92)'
    ].join(';');

    // Shimmer overlay
    var shimmer = document.createElement('div');
    shimmer.style.cssText = [
      'position:absolute',
      'inset:0',
      'background:linear-gradient(105deg,transparent 35%,rgba(231,206,139,0.28) 50%,transparent 65%)',
      'background-size:200% 100%',
      'border-radius:inherit',
      'pointer-events:none',
      'animation:wb-shimmer 1.6s ease 0.3s 3'
    ].join(';');

    // Inject shimmer keyframes once
    if (!document.getElementById('wb-shimmer-kf')) {
      var style = document.createElement('style');
      style.id = 'wb-shimmer-kf';
      style.textContent = '@keyframes wb-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
      document.head.appendChild(style);
    }

    banner.innerHTML = [
      '<div style="flex:0 0 auto;filter:drop-shadow(0 6px 14px rgba(201,162,75,0.65))">' + insig + '</div>',
      '<div style="text-align:left">',
      '<div style="font-size:11px;letter-spacing:2px;color:#E7CE8B;text-transform:uppercase;font-weight:700">',
      'Beförderung</div>',
      '<div style="font-size:17px;font-weight:800;color:#E7CE8B;margin-top:2px">' + esc(rankObj.name) + '</div>',
      tierName ? '<div style="font-size:11px;color:#9DB0C4;margin-top:1px">' + esc(tierName) + ' · ' + esc(unitName) + '</div>' : '',
      '</div>'
    ].join('');

    banner.appendChild(shimmer);
    container.insertBefore(banner, container.firstChild);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.style.transition = 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.2,0.9,0.3,1.15)';
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  /** Build the animated star row HTML (placeholders; call animateStars after inject).
   *  @param {number} n  - star count
   *  @returns {string}  - HTML string
   */
  function starsAnimated(n) {
    var o = '<span class="wb-stars-row" style="font-size:34px;letter-spacing:6px;display:block">';
    for (var i = 0; i < 3; i++) {
      o += '<span data-star="' + i + '" style="display:inline-block;opacity:0">'
        + (i < n ? '★' : '☆') + '</span>';
    }
    o += '</span>';
    return o;
  }

  /** Build an animated reward span.
   *  Returns an outer wrapper HTML string; call countUp on the inner .wb-count element.
   */
  function rewardSpan(prefix, value, suffix) {
    suffix = suffix || '';
    return '<span>' + esc(prefix) + '<span class="wb-count" data-target="' + value + '">0</span>' + esc(suffix) + '</span>';
  }

  /** After injecting result HTML, wire up count-up animations.
   *  @param {HTMLElement} card  - result card container
   *  @param {number}      coins
   *  @param {number}      xp
   *  @param {number}      starCount
   */
  function wireRewardAnimations(card, coins, xp, starCount) {
    if (!card) return;

    // Count-up
    var counts = card.querySelectorAll('.wb-count');
    for (var i = 0; i < counts.length; i++) {
      var target = parseInt(counts[i].getAttribute('data-target'), 10) || 0;
      countUp(counts[i], target, 700 + i * 80);
    }

    // Animated stars
    var starsRow = card.querySelector('.wb-stars-row');
    if (starsRow) animateStars(starsRow, starCount);

    // Confetti (brief burst, auto-cleanup)
    var overlay = $('overlay-result');
    if (overlay) spawnConfetti(overlay, 38);
  }

  var Screens = {
    init: function () {
      // Startscreen-Navigation
      on('btn-quickstart', function () { Screens.quickStart(); });
      on('btn-trailer', function () { if (WB.Cinematic && WB.Assets && WB.Assets.has('hero_trailer')) { if(WB.Audio){WB.Audio.unlock();} WB.Cinematic.play({ kicker:'● TRAILER', title:'', subtitle:'', videoUrl: WB.Assets.url('hero_trailer'), duration: 30000 }, function(){}); } });
      on('btn-live', function () { if (WB.Endless) WB.Endless.start(); });
      on('btn-story', function () { if (WB.Story) WB.Story.start(); });
      on('btn-goto-missions', function () { Screens.showMissions(); });
      on('btn-goto-boats', function () { Screens.showBoats(); });
      on('btn-goto-progress', function () { Screens.showProgress(); });
      on('btn-goto-settings', function () { Screens.showSettings(); });

      // Zurueck-Buttons
      ['back-missions', 'back-boats', 'back-progress', 'back-settings'].forEach(function (id) {
        on(id, function () { Screens.showStart(); });
      });

      // In-Game-Steuerung
      on('btn-pause', function () { WB.Game.togglePause(); });
      on('btn-resume', function () { WB.Game.resume(); });
      on('btn-quit', function () { WB.Game.quit(); });

      // Polizei-Aktionen (Blaulicht/Sirene/Funk/Spotlight)
      on('act-blaulicht', function () { var b = $('bluelight'); if (b) b.classList.toggle('on'); if (WB.Audio) WB.Audio.blaulicht(); });
      on('act-sirene', function () { if (WB.Audio) WB.Audio.siren(); });
      on('act-funk', function () { if (WB.Audio) WB.Audio.radio(); });
      on('act-spotlight', function () { var g = document.querySelector('.game-wrap'); if (g) g.classList.toggle('spot'); if (WB.Audio) WB.Audio.blaulicht(); });

      this.refreshTopbar();
    },

    refreshTopbar: function () {
      var s = WB.Save.data;
      var c = $('top-coins'); if (c) c.textContent = s.coins;
      var l = $('top-level'); if (l) l.textContent = 'Lvl ' + s.captainLevel + ' · ' + WB.Rank.current().rank.short;
    },

    // Kuratierter Welt-Pool fürs Menü (Immersion + Hero-Locations) – lässt die Welt leben.
    _ambientPool: function () {
      var byRegion = {
        bucht: ['im_steg_mueggelsee', 'im_marina_wannsee', 'im_bootshaus_verein', 'im_strandbad_mueggelsee', 'im_wasserrettung_dlrg', 'im_seebruecke_promenade', 'im_strandbar_wasser', 'loc_mueggelsee'],
        kanal: ['im_sup_spree', 'im_wasserrestaurant_rummelsburg', 'im_werft_koepenick', 'im_anleger_treptow_molecule', 'im_fahrgastschiff_anleger', 'loc_spree'],
        seenplatte: ['im_segelverein_dahme', 'im_fischer_seddinsee', 'im_ankerplatz_werder', 'im_regattastrecke_gruenau', 'im_yachthafen_zeuthen', 'im_camping_wasser', 'im_wasserwanderer_rast', 'im_bootsservice_slip', 'im_flossverleih', 'im_spreewaldkahn', 'im_winterlager_kran', 'im_hafenmeisterei', 'loc_dahme'],
        schleuse: ['im_schleusenbetrieb_wernsdorf', 'im_hausboot_havel', 'im_marina_potsdam', 'im_wassertankstelle_havel', 'im_strandbad_wannsee', 'im_tankstelle_nacht', 'loc_lock']
      };
      var last = WB._bootLastPlayed && WB._bootLastPlayed.regionId;
      var pool = [];
      if (last && byRegion[last]) pool = pool.concat(byRegion[last]);
      var all = ['im_marina_wannsee','im_steg_mueggelsee','im_sup_spree','im_hausboot_havel','im_segelverein_dahme','im_wasserrestaurant_rummelsburg','im_schleusenbetrieb_wernsdorf','im_fischer_seddinsee','im_ankerplatz_werder','im_werft_koepenick','im_marina_potsdam','im_regattastrecke_gruenau','im_yachthafen_zeuthen','im_wassertankstelle_havel','im_anleger_treptow_molecule','im_fahrgastschiff_anleger','im_bootshaus_verein','im_camping_wasser','im_wasserwanderer_rast','im_bootsservice_slip','im_strandbad_mueggelsee','im_strandbad_wannsee','im_wasserrettung_dlrg','im_hafenmeisterei','im_tankstelle_nacht','im_winterlager_kran','im_seebruecke_promenade','im_flossverleih','im_spreewaldkahn','im_strandbar_wasser','wow_hero_shot','wow_berlin_skyline','wow_sunrise_einsatz','wow_blaulicht_nachtnebel'];
      for (var i = 0; i < all.length; i++) if (pool.indexOf(all[i]) < 0) pool.push(all[i]);
      var avail = [];
      for (var k = 0; k < pool.length; k++) if (WB.Assets && WB.Assets.url(pool[k])) avail.push(pool[k]);
      return avail.length ? avail : ['loc_mueggelsee'];
    },

    showStart: function () {
      this.refreshTopbar();
      var hero = document.getElementById('start-hero-bg');
      if (hero && WB.Assets) {
        var pool = this._ambientPool();
        // täglich wechselnd + leichte Rotation pro Aufruf -> Menü wirkt lebendig
        var day = (WB.LivingWorld && WB.LivingWorld.dayIndex) ? WB.LivingWorld.dayIndex() : Math.floor(Date.now() / 864e5);
        this._heroIdx = (this._heroIdx == null) ? (day % pool.length) : (this._heroIdx + 1) % pool.length;
        var url = WB.Assets.url(pool[this._heroIdx]) || WB.Assets.url('loc_mueggelsee') || WB.Assets.url('cockpit_day_1');
        if (url) {
          hero.style.backgroundImage = "url('" + url + "')";
          hero.classList.add('on');
        }
      }
      // RC2.0: Menü-Hero-Video je Tageszeit/Wetter (Standbild bleibt Fallback darunter)
      try {
        var vEl = document.getElementById('start-hero-vid');
        if (vEl && WB.Assets) {
          var hr = new Date().getHours();
          var lw = WB.LivingWorld, wx = (lw && lw.today && lw.today().weather) ? lw.today().weather.id : null;
          var vid = (wx === 'gewitter') ? 'vid_a4_sturm_seenplatte' : (wx === 'nebel') ? 'vid_a4_nebel_mueggelsee'
                  : (hr < 8) ? 'vid_a4_sonnenaufgang' : (hr >= 21 || hr < 6) ? 'vid_a4_nachtfahrt_berlin'
                  : (hr >= 18) ? 'vid_a4_abendfahrt' : 'vid_a4_wasserleben_potsdam';
          var vurl = WB.Assets.has(vid) ? WB.Assets.url(vid) : null;
          if (vurl) { vEl.src = vurl; vEl.classList.add('on'); var pp = vEl.play(); if (pp && pp.catch) pp.catch(function(){}); }
          else { vEl.classList.remove('on'); vEl.removeAttribute('src'); }
        }
      } catch (e) {}
      var strip = document.getElementById('world-strip');
      if (strip && WB.News) { strip.innerHTML = WB.News.statusStrip(); strip.onclick = function () { WB.News.showBriefing(null); }; }
      if (WB.Wasserlage) WB.Wasserlage.mount('wasserlage-cockpit');
      if (WB.LucyHUD) WB.LucyHUD.mount();
      if (WB.Skipper && WB.Skipper.onStart) WB.Skipper.onStart();
      show('screen-start');
    },

    quickStart: function () {
      // Erste freigeschaltete Mission starten.
      var s = WB.Save.data, m = null;
      for (var i = 0; i < WB.data.missions.length; i++) { if (s.captainLevel >= WB.data.missions[i].unlockLevel) { m = WB.data.missions[i]; break; } }
      if (!m) m = WB.data.missions[0];
      WB.Game.start(m.id);
    },

    // ---- Missionen ----------------------------------------------------------
    showMissions: function () {
      var s = WB.Save.data, html = '';
      for (var i = 0; i < WB.data.missions.length; i++) {
        var m = WB.data.missions[i];
        var locked = s.captainLevel < m.unlockLevel;
        var region = WB.data.regionById(m.regionId);
        html += '<div class="card mission' + (locked ? ' locked' : '') + '">'
          + '<div class="card-icon">' + m.icon + '</div>'
          + '<div class="card-body">'
          + '<h3>' + esc(m.title) + '</h3>'
          + '<p>' + esc(m.desc) + '</p>'
          + '<div class="tags"><span>📍 ' + esc(region.name) + '</span>'
          + '<span>🪙 ' + m.rewardCoins + '</span><span>✶ ' + m.rewardXp + ' XP</span>'
          + (m.timeLimit > 0 ? '<span>⏱ ' + m.timeLimit + 's</span>' : '') + '</div>'
          + '</div>'
          + (locked
            ? '<div class="card-action"><span class="lock">ab Lvl ' + m.unlockLevel + '</span></div>'
            : '<div class="card-action"><button class="btn btn-gold" data-mission="' + m.id + '">Start</button></div>')
          + '</div>';
      }
      $('missions-list').innerHTML = html;
      var btns = $('missions-list').querySelectorAll('button[data-mission]');
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener('click', function () { WB.Audio.click(); WB.Game.start(b.getAttribute('data-mission')); });
      });
      show('screen-missions');
    },

    // ---- Boote --------------------------------------------------------------
    showBoats: function () {
      var s = WB.Save.data, html = '';
      for (var i = 0; i < WB.data.boats.length; i++) {
        var b = WB.data.boats[i];
        var owned = WB.Save.ownsBoat(b.id);
        var selected = s.selectedBoatId === b.id;
        var lockedByLevel = s.captainLevel < b.unlockLevel;
        var eff = owned ? WB.Progression.effectiveStats(b.id) : b;

        var action;
        if (selected) action = '<span class="badge badge-on">Ausgewählt</span>';
        else if (owned) action = '<button class="btn btn-line" data-select="' + b.id + '">Auswählen</button>';
        else if (lockedByLevel) action = '<span class="lock">ab Lvl ' + b.unlockLevel + '</span>';
        else if (s.coins >= b.price) action = '<button class="btn btn-gold" data-buy="' + b.id + '">Kaufen · ' + b.price + ' 🪙</button>';
        else action = '<span class="lock">' + b.price + ' 🪙 nötig</span>';

        html += '<div class="card boat' + (selected ? ' sel' : '') + '">'
          + '<div class="boat-head"><h3>' + esc(b.name) + '</h3>' + action + '</div>'
          + '<p>' + esc(b.desc) + '</p>'
          + '<div class="stats">'
          + statBar('Speed', eff.speed) + statBar('Handling', eff.handling) + statBar('Boost', eff.boost)
          + statBar('Stabilität', eff.stability) + statBar('Cargo', eff.cargo) + statBar('Prestige', eff.prestige)
          + '</div>';

        if (owned) html += this._upgradeBlock(b.id);
        html += '</div>';
      }
      $('boats-list').innerHTML = html;

      var sel = $('boats-list').querySelectorAll('button[data-select]');
      Array.prototype.forEach.call(sel, function (btn) {
        btn.addEventListener('click', function () { WB.Audio.click(); WB.Save.data.selectedBoatId = btn.getAttribute('data-select'); WB.Save.save(); Screens.showBoats(); Screens.refreshTopbar(); });
      });
      var buy = $('boats-list').querySelectorAll('button[data-buy]');
      Array.prototype.forEach.call(buy, function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-buy'), boat = WB.data.boatById(id);
          if (WB.Save.data.coins >= boat.price) {
            WB.Save.data.coins -= boat.price; WB.Save.addBoat(id);
            WB.Save.data.selectedBoatId = id; WB.Save.save();
            WB.Audio.coin(); Screens.showBoats(); Screens.refreshTopbar();
          }
        });
      });
      this._wireUpgrades();
      show('screen-boats');
    },

    _upgradeBlock: function (boatId) {
      var up = WB.Save.data.ownedBoats[boatId].upgrades, html = '<div class="upgrades">';
      for (var i = 0; i < WB.data.upgrades.length; i++) {
        var u = WB.data.upgrades[i], lvl = up[u.track] || 0;
        var dots = '';
        for (var d = 0; d < u.maxLevel; d++) dots += '<span class="dot' + (d < lvl ? ' on' : '') + '"></span>';
        var maxed = lvl >= u.maxLevel;
        var cost = WB.data.upgradeCost(u, lvl);
        var can = !maxed && WB.Save.data.coins >= cost;
        html += '<div class="upg">'
          + '<span class="upg-name">' + u.name + '</span>'
          + '<span class="upg-dots">' + dots + '</span>'
          + (maxed ? '<span class="badge badge-on">MAX</span>'
            : '<button class="btn btn-mini' + (can ? '' : ' off') + '" data-upg="' + boatId + ':' + u.track + '"' + (can ? '' : ' disabled') + '>' + cost + ' 🪙</button>')
          + '</div>';
      }
      return html + '</div>';
    },

    _wireUpgrades: function () {
      var btns = $('boats-list').querySelectorAll('button[data-upg]');
      Array.prototype.forEach.call(btns, function (btn) {
        btn.addEventListener('click', function () {
          var parts = btn.getAttribute('data-upg').split(':'), boatId = parts[0], track = parts[1];
          var up = WB.Save.data.ownedBoats[boatId].upgrades, lvl = up[track] || 0;
          var udef = null; for (var i = 0; i < WB.data.upgrades.length; i++) if (WB.data.upgrades[i].track === track) udef = WB.data.upgrades[i];
          if (!udef || lvl >= udef.maxLevel) return;
          var cost = WB.data.upgradeCost(udef, lvl);
          if (WB.Save.data.coins >= cost) {
            WB.Save.data.coins -= cost; up[track] = lvl + 1; WB.Save.save();
            WB.Audio.coin(); Screens.showBoats(); Screens.refreshTopbar();
          }
        });
      });
    },

    // ---- Karriere / WSP-Laufbahn -------------------------------------------
    _careerCard: function () {
      var prog = WB.Rank.progress(), r = prog.rank;
      var nextTxt = prog.next ? ('Noch ' + (prog.next.rp - prog.rp) + ' RP bis ' + prog.next.name)
        : 'Höchster Rang erreicht – Kommando der Flotte.';
      var ladder = '';
      for (var i = 0; i < WB.data.ranks.length; i++) {
        var rr = WB.data.ranks[i];
        ladder += '<div class="ladder-item' + (i === prog.index ? ' cur' : '') + (i > prog.index ? ' lock' : '') + '">'
          + WB.RankInsignia.svg(rr, 40, i === prog.index)
          + '<span class="li-name">' + rr.short + '</span><span class="li-rp">' + rr.rp + '</span></div>';
      }
      return '<div class="card career glow">'
        + '<div class="career-top">'
        + '<div class="insig-wrap">' + WB.RankInsignia.svg(r, 84, true) + '</div>'
        + '<div class="career-meta"><div class="ribbon">' + WB.data.rankUnit + '</div>'
        + '<h3>' + r.name + '</h3><div class="muted">' + r.t.tierName + ' · ' + r.short + '</div>'
        + '<div class="rp">' + prog.rp + ' <span>RP</span></div></div></div>'
        + '<div class="xp-track"><div class="xp-fill" style="width:' + (prog.toNext * 100) + '%"></div></div>'
        + '<div class="muted">' + nextTxt + '</div>'
        + '<div class="ladder-title">Laufbahn · ' + (prog.index + 1) + '/' + WB.data.ranks.length + '</div>'
        + '<div class="ladder">' + ladder + '</div></div>';
    },

    // ---- Fortschritt --------------------------------------------------------
    showProgress: function () {
      var s = WB.Save.data;
      WB.Meta.ensureDaily(); WB.Meta.ensureWeekly();
      var need = WB.Progression.xpForLevel(s.captainLevel);
      var xpPct = Math.min(100, (s.xp / need) * 100);

      var html = '<div class="card glow">'
        + '<div class="prog-top"><div><div class="big">Lvl ' + s.captainLevel + '</div>'
        + '<div class="rank">' + WB.Rank.current().rank.name + '</div></div>'
        + '<div class="coins-big">🪙 ' + s.coins + '</div></div>'
        + '<div class="xp-track"><div class="xp-fill" style="width:' + xpPct + '%"></div></div>'
        + '<div class="muted">' + Math.floor(s.xp) + ' / ' + need + ' XP</div></div>';

      html += this._careerCard();

      // Statistik
      html += '<div class="card"><h3>Statistik</h3><div class="grid2">'
        + '<div><span class="muted">Fahrten</span><b>' + s.stats.runs + '</b></div>'
        + '<div><span class="muted">Lieferungen</span><b>' + s.stats.deliveries + '</b></div>'
        + '<div><span class="muted">3★-Fahrten</span><b>' + s.stats.perfectRuns + '</b></div>'
        + '<div><span class="muted">Coins gesamt</span><b>' + s.stats.coinsEarned + '</b></div>'
        + '</div></div>';

      // Daily
      var dt = WB.Meta.dailyTask();
      var dprog = Math.min(s.daily.progress, dt.goal);
      html += '<div class="card"><h3>Tägliche Aufgabe</h3><p>' + dt.name + '</p>'
        + '<div class="xp-track"><div class="xp-fill" style="width:' + (dprog / dt.goal * 100) + '%"></div></div>'
        + '<div class="row-between"><span class="muted">' + dprog + ' / ' + dt.goal + '</span>'
        + (s.daily.claimed ? '<span class="badge badge-on">Erhalten</span>'
          : (dprog >= dt.goal ? '<button class="btn btn-gold btn-mini" id="claim-daily">' + dt.rewardCoins + ' 🪙 abholen</button>'
            : '<span class="muted">+' + dt.rewardCoins + ' 🪙 / +' + dt.rewardXp + ' XP</span>')) + '</div></div>';

      // Weekly
      var wk = WB.Meta.weeklyChallenge();
      var wprog = Math.min(s.weekly.progress, wk.goal);
      html += '<div class="card"><h3>Wochen-Challenge</h3><p>' + wk.name + '</p>'
        + '<div class="xp-track"><div class="xp-fill" style="width:' + (wprog / wk.goal * 100) + '%"></div></div>'
        + '<div class="row-between"><span class="muted">' + wprog + ' / ' + wk.goal + '</span>'
        + (s.weekly.claimed ? '<span class="badge badge-on">Erhalten</span>'
          : (wprog >= wk.goal ? '<button class="btn btn-gold btn-mini" id="claim-weekly">' + wk.rewardCoins + ' 🪙 abholen</button>'
            : '<span class="muted">+' + wk.rewardCoins + ' 🪙 / +' + wk.rewardXp + ' XP</span>')) + '</div></div>';

      // Achievements
      html += '<div class="card"><h3>Achievements</h3><div class="ach-list">';
      for (var i = 0; i < WB.data.achievements.length; i++) {
        var a = WB.data.achievements[i], rec = s.achievements[a.id] || { unlocked: false, progress: 0 };
        var p = Math.min(rec.progress || 0, a.goal);
        html += '<div class="ach' + (rec.unlocked ? ' on' : '') + '">'
          + '<span class="ach-ic">' + a.icon + '</span>'
          + '<div class="ach-b"><b>' + a.name + '</b><span class="muted">' + a.desc + '</span>'
          + '<div class="xp-track sm"><div class="xp-fill" style="width:' + (p / a.goal * 100) + '%"></div></div></div>'
          + (rec.unlocked ? '<span class="badge badge-on">✓</span>' : '<span class="muted">' + p + '/' + a.goal + '</span>')
          + '</div>';
      }
      html += '</div></div>';

      $('progress-content').innerHTML = html;

      on('claim-daily', function () {
        var s = WB.Save.data, dt = WB.Meta.dailyTask();
        if (!s.daily.claimed && s.daily.progress >= dt.goal) {
          s.daily.claimed = true; WB.Progression.grant(dt.rewardCoins, dt.rewardXp); WB.Audio.coin();
          Screens.showProgress(); Screens.refreshTopbar();
        }
      });
      on('claim-weekly', function () {
        var s = WB.Save.data, wk = WB.Meta.weeklyChallenge();
        if (!s.weekly.claimed && s.weekly.progress >= wk.goal) {
          s.weekly.claimed = true; WB.Progression.grant(wk.rewardCoins, wk.rewardXp); WB.Audio.coin();
          Screens.showProgress(); Screens.refreshTopbar();
        }
      });
      show('screen-progress');
    },

    // ---- Einstellungen ------------------------------------------------------
    showSettings: function () {
      var s = WB.Save.data;
      var html = '<div class="card">'
        + '<div class="row-between toggle-row"><span>🔊 Sound</span>'
        + '<button class="switch' + (s.settings.sound ? ' on' : '') + '" id="t-sound"><span></span></button></div>'
        + '<div class="row-between toggle-row"><span>📳 Vibration</span>'
        + '<button class="switch' + (s.settings.vibration ? ' on' : '') + '" id="t-vib"><span></span></button></div>'
        + '<div class="row-between toggle-row"><span>📊 Anonyme Statistik (Google Analytics)</span>'
        + '<button class="switch' + (s.settings.tracking !== false ? ' on' : '') + '" id="t-track"><span></span></button></div>'
        + '</div>'
        + '<div class="card"><h3>Kapitän</h3>'
        + '<div class="row-between"><span class="muted">Dein Funkname</span><b>' + (WB.Skipper ? WB.Skipper.esc(WB.Skipper.display()) : 'Kapitän') + '</b></div>'
        + '<div style="display:flex;gap:9px;margin-top:10px"><button class="btn btn-line" id="skp-name-edit">✎ Name ändern</button>'
        + '<button class="btn btn-line" id="skp-name-reset">Zurücksetzen</button></div></div>'
        + '<div class="card"><h3>Präsentation</h3><p class="muted">Spiele die Eröffnungssequenz erneut.</p>'
        + '<button class="btn btn-line" id="btn-intro">🎬 Intro ansehen</button></div>'
        + '<div class="card"><h3>Rechtliches</h3><p class="muted">Impressum, Datenschutz und Hinweise zum fiktiven Spiel.</p>'
        + '<button class="btn btn-line" id="btn-legal">⚖ Impressum &amp; Datenschutz</button></div>'
        + '<div class="card"><h3>Daten</h3><p class="muted">Setzt den gesamten Fortschritt unwiderruflich zurück.</p>'
        + '<button class="btn btn-danger" id="btn-reset">Fortschritt zurücksetzen</button></div>'
        + '<div class="muted center">Wave Bite – Water Patrol · v1.0</div>';
      $('settings-content').innerHTML = html;

      on('t-sound', function () { s.settings.sound = !s.settings.sound; WB.Save.save(); Screens.showSettings(); });
      on('t-vib', function () { s.settings.vibration = !s.settings.vibration; WB.Save.save(); Screens.showSettings(); });
      on('t-track', function () {
        var turnOn = (s.settings.tracking === false);
        if (turnOn) { if (WB.GA && WB.GA.grant) WB.GA.grant(); else { s.settings.tracking = true; WB.Save.save(); } }
        else { if (WB.GA && WB.GA.deny) WB.GA.deny(); else { s.settings.tracking = false; WB.Save.save(); } }
        Screens.showSettings();
      });
      on('btn-reset', function () {
        if (window.confirm('Wirklich den gesamten Fortschritt zurücksetzen?')) {
          WB.Save.reset(); Screens.refreshTopbar(); Screens.showSettings();
        }
      });
      on('btn-legal', function () { Screens.showLegal(); });
      on('btn-intro', function () { if (WB.Intro) WB.Intro.play(null); });
      on('skp-name-edit', function () { if (WB.Skipper) WB.Skipper._show(function () { Screens.showSettings(); }); });
      on('skp-name-reset', function () { if (WB.Skipper) { WB.Skipper.clear(); Screens.showSettings(); } });
      show('screen-settings');
    },

    // ---- Rechtliches / Onboarding / Hinweis --------------------------------
    showLegal: function () {
      var L = WB.data.legal;
      $('overlay-legal').innerHTML = '<div class="panel legal-panel">'
        + '<div class="legal-scroll">' + L.disclaimer + L.datenschutz + L.impressum + '</div>'
        + '<button class="btn btn-gold" id="legal-close">Schließen</button></div>';
      $('overlay-legal').classList.add('show');
      on('legal-close', function () { $('overlay-legal').classList.remove('show'); });
    },

    showLegalNotice: function (onOk) {
      $('overlay-legal').innerHTML = '<div class="panel"><h3>Willkommen an Bord</h3>'
        + '<p class="muted">Dieses Spiel speichert deinen Fortschritt nur lokal auf deinem Gerät – keine Tracking-Cookies, keine Datenweitergabe. '
        + 'Es ist ein fiktives Spiel ohne Bezug zu realen Behörden.</p>'
        + '<div class="row"><button class="btn btn-gold" id="notice-ok">Verstanden</button>'
        + '<button class="btn btn-line" id="notice-more">Mehr lesen</button></div></div>';
      $('overlay-legal').classList.add('show');
      on('notice-ok', function () { $('overlay-legal').classList.remove('show'); if (onOk) onOk(); });
      on('notice-more', function () { Screens.showLegal(); });
    },

    showOnboarding: function (onDone) {
      var L = WB.data.lucy, portrait = WB.Assets ? WB.Assets.url(L.portrait) : null;
      $('overlay-legal').innerHTML = '<div class="panel onb">'
        + (portrait ? '<div class="onb-port" style="background-image:url(\'' + portrait + '\')"></div>' : '')
        + '<span class="bf-funk">● ' + L.name + ' · KI-Dispatch</span>'
        + '<h3>Willkommen an Bord, ' + (WB.Skipper ? WB.Skipper.esc(WB.Skipper.display()) : 'Captain') + '.</h3>'
        + '<p class="muted">Du steuerst dein Patrouillenboot aus der Brücke. <b>◄ ►</b> lenken, <b>⚡ Gas</b> beschleunigt, <b>Boost</b> gibt den Extra-Schub. Weiche Hindernissen aus und erreiche dein Ziel – bei Zeiteinsätzen tickt die Uhr.</p>'
        + '<p class="muted">Starte mit einem <b>Einzeleinsatz</b> oder geh direkt in die <b>Live Water Region</b> – Lena funkt dir laufend neue Lagen.</p>'
        + '<button class="btn btn-gold" id="onb-go">Los geht\'s</button></div>';
      $('overlay-legal').classList.add('show');
      WB.Audio.unlock(); WB.Audio.boost();
      on('onb-go', function () { $('overlay-legal').classList.remove('show'); if (onDone) onDone(); });
    },

    // ---- Story-Kampagne: Kapitel-Abschluss & Finale ------------------------
    showStoryProgress: function (idx, data) {
      var ch = WB.data.story.chapters[idx], total = WB.data.story.chapters.length, last = idx + 1 >= total, r = data.res;
      var html = '<div class="result-card win" style="position:relative">'
        + '<div class="streak-badge">📖 Kapitel ' + (idx + 1) + '/' + total + ' abgeschlossen</div>'
        + '<div class="result-icon">' + ch.icon + '</div><h2>' + esc(ch.title) + '</h2>'
        + starsAnimated(r.stars)
        + '<div class="rewards">'
        + rewardSpan('🪙 +', r.coins)
        + rewardSpan('✶ +', r.xp, ' XP')
        + '</div>'
        + '<div class="result-actions">'
        + (last ? '<button class="btn btn-gold" id="st-finish">Finale ansehen</button>'
                : '<button class="btn btn-gold" id="st-next">Nächstes Kapitel</button>')
        + '<button class="btn btn-line" id="st-menu">Menü</button></div></div>';
      var overlay = $('overlay-result');
      if (overlay) {
        overlay.innerHTML = html;
        overlay.classList.add('show');
        var card = overlay.querySelector('.result-card');
        wireRewardAnimations(card, r.coins, r.xp, r.stars);
      }
      Screens.refreshTopbar();
      on('st-next', function () { var ov = $('overlay-result'); if (ov) ov.classList.remove('show'); WB.Story.next(); });
      on('st-finish', function () { var ov = $('overlay-result'); if (ov) ov.classList.remove('show'); WB.Story.next(); });
      on('st-menu', function () { var ov = $('overlay-result'); if (ov) ov.classList.remove('show'); WB.Game.quit(); });
    },

    showStoryComplete: function () {
      var html = '<div class="result-card win" style="position:relative">'
        + '<div class="streak-badge">🏁 Kampagne abgeschlossen</div>'
        + '<div class="result-icon">🏆</div><h2>Die Spur endet hier.</h2>'
        + '<p class="muted">Du hast das Schmugglernetzwerk zerschlagen und die Wave Region sicher gemacht. '
        + 'Die Live Water Region laeuft weiter – Lena hat immer neue Lagen für dich.</p>'
        + '<div class="result-actions"><button class="btn btn-gold" id="sc-live">🌊 Live Water Region</button>'
        + '<button class="btn btn-line" id="sc-menu">Menü</button></div></div>';
      var overlay = $('overlay-result');
      if (overlay) {
        overlay.innerHTML = html;
        overlay.classList.add('show');
        // Campaign complete: special gold confetti burst
        spawnConfetti(overlay, 50);
      }
      Screens.refreshTopbar();
      on('sc-live', function () { var ov = $('overlay-result'); if (ov) ov.classList.remove('show'); if (WB.Endless) WB.Endless.start(); });
      on('sc-menu', function () { var ov = $('overlay-result'); if (ov) ov.classList.remove('show'); WB.Game.quit(); });
    },

    // ---- Lena KI-Dispatch (Live Water Region) ------------------------------
    showLenaBriefing: function (ev, onStart) {
      var L = WB.data.lucy;
      var portrait = WB.Assets ? WB.Assets.url(L.portrait) : null;
      var station = (WB.Assets && ev.briefStation) ? WB.Assets.url(ev.briefStation) : null;
      var rank = WB.Rank.current().rank;
      var region = WB.data.regionById(ev.regionId);
      var timeTag = ev.timeLimit > 0 ? '<span class="bf-tag warn">⏱ ' + ev.timeLimit + 's</span>' : '';
      var mgLabels = { radar: '📡 Radar-Scan', lock: '🎚 Schleusen-Timing', search: '🔍 Hafen-Suche' };
      var mgTag = ev.minigame ? '<span class="bf-tag">' + (mgLabels[ev.minigame] || '🎮 Minispiel') + '</span>' : '';
      var html = '<div class="briefing">'
        + (station ? '<div class="bf-bg" style="background-image:url(\'' + station + '\')"></div>' : '')
        + '<div class="bf-scrim"></div>'
        + '<div class="bf-panel">'
        + '<div class="bf-head"><span class="bf-funk">● LIVE · ' + L.name + ' · KI-Dispatch</span><span class="bf-rank">' + rank.short + ' · ' + (WB.Skipper ? WB.Skipper.esc(WB.Skipper.display()) : 'Kapitän') + '</span></div>'
        + '<div class="bf-row">'
        + (portrait ? '<div class="bf-port" style="background-image:url(\'' + portrait + '\')"></div>' : '')
        + '<div class="bf-msg"><div class="bf-title">' + ev.icon + ' ' + esc(ev.title) + '</div>'
        + '<p class="bf-brief">&bdquo;' + esc(ev.brief) + '&ldquo;</p></div>'
        + '</div>'
        + '<div class="bf-tags"><span class="bf-tag">🎯 ' + esc(ev.objective) + '</span>'
        + '<span class="bf-tag">📍 ' + esc(region.name) + '</span>'
        + '<span class="bf-tag">🪙 ' + ev.rewardCoins + '</span><span class="bf-tag">✶ ' + ev.rewardXp + '</span>' + timeTag + mgTag + '</div>'
        + '<div class="bf-actions"><button class="btn btn-gold" id="bf-go">▶ Funk annehmen</button>'
        + '<button class="btn btn-line" id="bf-cancel">Beenden</button></div>'
        + '</div></div>';
      $('overlay-briefing').innerHTML = html;
      $('overlay-briefing').classList.add('show');
      WB.Audio.unlock(); WB.Audio.boost();
      on('bf-go', function () { $('overlay-briefing').classList.remove('show'); if (onStart) onStart(); });
      on('bf-cancel', function () { $('overlay-briefing').classList.remove('show'); if (WB.Endless) WB.Endless.stop(); Screens.showStart(); });
    },

    showEndlessResult: function (data) {
      var L = WB.data.lucy, line = L.streakLines[Math.floor(Math.random() * L.streakLines.length)];
      var r = data.res;

      // Build promo rank object
      var promoRankObj = null;
      if (data.promotions && data.promotions.length) {
        promoRankObj = data.promotions[data.promotions.length - 1];
      }

      var html = '<div class="result-card win" style="position:relative">'
        + '<div class="streak-badge">🌊 LIVE · Streak ' + data.streak + '</div>'
        + '<div class="result-icon">' + data.mission.icon + '</div>'
        + '<h2>' + line + '</h2>'
        + starsAnimated(r.stars)
        + '<div class="rewards">'
        + rewardSpan('🪙 +', r.coins)
        + rewardSpan('✶ +', r.xp, ' XP')
        + '</div>'
        + '<div class="wb-promo-slot"></div>'
        + '<div class="result-actions"><button class="btn btn-gold" id="el-next">Nächster Einsatz</button>'
        + '<button class="btn btn-line" id="el-stop">Beenden</button></div></div>';

      var overlay = $('overlay-result');
      if (overlay) {
        overlay.innerHTML = html;
        overlay.classList.add('show');
        var card = overlay.querySelector('.result-card');
        wireRewardAnimations(card, r.coins, r.xp, r.stars);
        if (promoRankObj && card) {
          var slot = card.querySelector('.wb-promo-slot');
          if (slot) {
            setTimeout(function () { showRankUpBanner(slot, promoRankObj); }, 700);
          }
        }
      }

      on('el-next', function () {
        var ov = $('overlay-result'); if (ov) ov.classList.remove('show');
        Screens.refreshTopbar();
        if (WB.Endless) WB.Endless.next();
      });
      on('el-stop', function () {
        var ov = $('overlay-result'); if (ov) ov.classList.remove('show');
        if (WB.Endless) WB.Endless.stop();
        WB.Game.quit();
        Screens.refreshTopbar();
      });
    },

    // ---- Einsatz-Briefing (Funk + Portrait) --------------------------------
    showBriefing: function (mission, missionId) {
      var portrait = (WB.Assets && mission.briefChar) ? WB.Assets.url(mission.briefChar) : null;
      var station = (WB.Assets && mission.briefStation) ? WB.Assets.url(mission.briefStation) : null;
      var rank = WB.Rank.current().rank;
      var region = WB.data.regionById(mission.regionId);
      var timeTag = mission.timeLimit > 0 ? '<span class="bf-tag warn">⏱ ' + mission.timeLimit + 's</span>' : '';
      var html = '<div class="briefing">'
        + (station ? '<div class="bf-bg" style="background-image:url(\'' + station + '\')"></div>' : '')
        + '<div class="bf-scrim"></div>'
        + '<div class="bf-panel">'
        + '<div class="bf-head"><span class="bf-funk">● FUNK · ' + WB.data.rankUnit + '</span><span class="bf-rank">' + rank.short + ' · ' + (WB.Skipper ? WB.Skipper.esc(WB.Skipper.display()) : 'Kapitän') + '</span></div>'
        + '<div class="bf-row">'
        + (portrait ? '<div class="bf-port" style="background-image:url(\'' + portrait + '\')"></div>' : '')
        + '<div class="bf-msg"><div class="bf-title">' + mission.icon + ' ' + esc(mission.title) + '</div>'
        + '<p class="bf-brief">&bdquo;' + esc(mission.brief) + '&ldquo;</p></div>'
        + '</div>'
        + '<div class="bf-tags"><span class="bf-tag">🎯 ' + esc(mission.objective) + '</span>'
        + '<span class="bf-tag">📍 ' + esc(region.name) + '</span>'
        + '<span class="bf-tag">🪙 ' + mission.rewardCoins + '</span><span class="bf-tag">✶ ' + mission.rewardXp + '</span>' + timeTag + '</div>'
        + '<div class="bf-actions"><button class="btn btn-gold" id="bf-go">▶ Einsatz starten</button>'
        + '<button class="btn btn-line" id="bf-cancel">Abbrechen</button></div>'
        + '</div></div>';
      $('overlay-briefing').innerHTML = html;
      $('overlay-briefing').classList.add('show');
      WB.Audio.unlock(); WB.Audio.boost();
      on('bf-go', function () { $('overlay-briefing').classList.remove('show'); WB.Game._launch(missionId); });
      on('bf-cancel', function () { $('overlay-briefing').classList.remove('show'); Screens.showStart(); });
    },

    // ---- Gameplay-View ------------------------------------------------------
    showGame: function (mission) {
      WB.HUD.setMission(mission);
      this.hidePause();
      var ov = $('overlay-result'); if (ov) ov.classList.remove('show');
      show('screen-game');
      WB.Engine._resize();
    },

    showPause: function () { $('overlay-pause').classList.add('show'); },
    hidePause: function () { var el = $('overlay-pause'); if (el) el.classList.remove('show'); },

    showResult: function (data) {
      var html;
      if (data.success) {
        var r = data.res, a = data.applied;
        var lvlNote = (a && a.level && a.level.leveledTo)
          ? '<div class="lvlup">⬆ Level ' + a.level.leveledTo + ' erreicht!</div>' : '';
        var ach = '';
        if (a && a.unlockedAchievements && a.unlockedAchievements.length) {
          ach = '<div class="ach-pop">';
          for (var i = 0; i < a.unlockedAchievements.length; i++) ach += '<div>🎖 ' + a.unlockedAchievements[i].name + '</div>';
          ach += '</div>';
        }

        var promoRankObj = null;
        if (data.promotions && data.promotions.length) {
          promoRankObj = data.promotions[data.promotions.length - 1];
        }

        html = '<div class="result-card win" style="position:relative">'
          + '<div class="result-icon">' + data.mission.icon + '</div>'
          + '<h2>Sauber gefahren, ' + (WB.Skipper ? WB.Skipper.esc(WB.Skipper.display()) : 'Kapitän') + '!</h2>'
          + starsAnimated(r.stars)
          + '<div class="rewards">'
          + rewardSpan('🪙 +', r.coins)
          + rewardSpan('✶ +', r.xp, ' XP')
          + '</div>'
          + '<div class="wb-promo-slot"></div>'
          + lvlNote + ach
          + '<div class="result-actions"><button class="btn btn-gold" id="res-again">Nochmal</button>'
          + '<button class="btn btn-line" id="res-menu">Menü</button></div></div>';

        var overlay = $('overlay-result');
        if (overlay) {
          overlay.innerHTML = html;
          overlay.classList.add('show');
          var card = overlay.querySelector('.result-card');
          wireRewardAnimations(card, r.coins, r.xp, r.stars);
          if (promoRankObj && card) {
            var slot = card.querySelector('.wb-promo-slot');
            if (slot) {
              setTimeout(function () { showRankUpBanner(slot, promoRankObj); }, 680);
            }
          }
        }
      } else {
        var msg = data.reason === 'time'
          ? 'Zeit abgelaufen – der Auftrag ist geplatzt.'
          : (data.reason === 'escaped' ? 'Zu viel Abstand – das Boot ist entkommen.' : 'Boot zu stark beschaedigt!');
        var c = data.close, headTxt = c ? c.head : 'Mission gescheitert';
        var motiv = c ? ('<div class="lose-motiv"><div class="lose-prog"><span style="width:' + Math.max(6, c.pct) + '%"></span></div>'
              + '<p class="muted">' + c.sub + '</p>'
              + '<div class="comeback">🌬️ Beim nächsten Versuch: <b>+' + c.bonus + ' 🪙 Rückenwind-Bonus</b></div></div>')
            : ('<p class="muted">' + msg + '</p>');
        html = '<div class="result-card lose">'
          + '<div class="result-icon">🌊</div>'
          + '<h2>' + headTxt + '</h2>' + motiv
          + '<div class="result-actions"><button class="btn btn-gold" id="res-again">Nochmal – jetzt klappt\'s</button>'
          + '<button class="btn btn-line" id="res-menu">Menü</button></div></div>';
        var overlay2 = $('overlay-result');
        if (overlay2) {
          overlay2.innerHTML = html;
          overlay2.classList.add('show');
        }
      }

      var mid = data.mission.id;
      on('res-again', function () {
        var ov = $('overlay-result'); if (ov) ov.classList.remove('show');
        if (data.mode === 'endless' && WB.Endless) WB.Game.startEndless(data.event);
        else if (data.mode === 'story' && WB.Story) WB.Story.retry();
        else WB.Game.start(mid);
      });
      on('res-menu', function () {
        var ov = $('overlay-result'); if (ov) ov.classList.remove('show');
        if (WB.Endless) WB.Endless.stop();
        WB.Game.quit();
        Screens.refreshTopbar();
      });
    }
  };

  WB.Screens = Screens;
})(window.WB = window.WB || {});