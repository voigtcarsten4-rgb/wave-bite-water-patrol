/* Wave Bite - Water Patrol · game/world.js
 * Onboard-Cockpit-Spielwelt aus Kapitaenssicht: Reviere-Horizont, F1-Speed-Feeling,
 * Cockpit-Armaturenbrett (generiertes Bild), Hindernisse, Fortschritt & Zielpunkt. */
(function (WB) {
  'use strict';
  var M = WB.math;

  var COCKPIT = { bucht: 'cockpit_bridge', kanal: 'cockpit_bridge', seenplatte: 'cockpit_bridge', schleuse: 'cockpit_bridge' };
  var BG = { bucht: 'loc_mueggelsee', kanal: 'loc_spree', seenplatte: 'loc_mueggelsee', schleuse: 'loc_lock' };

  function World(boat, region, mission) {
    this.boat = boat; this.region = region; this.mission = mission;
    this.water = new WB.Water();
    this.margin = 16; this.obstacles = [];
    this.scroll = 0; this.progress = 0; this.spawnTimer = 0.8;
    this.harborActive = false; this.harborY = -160;
    this.delivered = false; this.failed = false; this.collisions = 0;
    this.isChase = !!({ control:1, eco:1, pursuit:1, rescue:1, smuggler:1 })[mission.type];
    this.failReason = null; this.opp = null;
    this.curSpeed = 120; this.sway = 0; this.shake = 0; this.flash = 0;
    this.cockpitId = COCKPIT[region.id] || 'cockpit_day_1';
    this.bgId = BG[region.id] || 'bg_calm_bay_1';
  }

  World.prototype.layout = function (w, h) {
    this.w = w; this.h = h;
    this.dashTop = Math.round(h * 0.64);
    this.left = this.margin; this.right = w - this.margin;
    this.boat.reset(w / 2, this.dashTop - 54);
    if (this.isChase && WB.Opponent) this.opp = new WB.Opponent(this, this.mission, this.region);
  };

  World.prototype.progressRatio = function () { return this.opp ? M.clamp(1 - this.opp.gap, 0, 1) : M.clamp(this.progress / this.mission.distance, 0, 1); };

  World.prototype._spawn = function () {
    var kind = M.pick(this.region.obstacleMix);
    if (kind === 'gate') {
      var gap = M.clamp(150 - this.region.difficulty * 12, 86, 150);
      var c = M.rand(this.left + gap / 2 + 20, this.right - gap / 2 - 20);
      this.obstacles.push(new WB.Obstacle('gate', c - gap / 2 - 13, -40));
      this.obstacles.push(new WB.Obstacle('gate', c + gap / 2 + 13, -40));
    } else {
      this.obstacles.push(new WB.Obstacle(kind, M.rand(this.left + 24, this.right - 24), -40));
    }
  };

  World.prototype.update = function (dt, input) {
    var speed = this.boat.forwardSpeed(input);
    this.curSpeed = speed;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.4);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3.2);
    this.scroll += speed * dt;
    this.sway = M.lerp(this.sway, (this.boat.vx || 0) * 0.06, 1 - Math.pow(0.001, dt));

    // Hindernisse spawnen immer – auch während einer Verfolgung.
    this.spawnTimer -= dt;
    var base = 1.25 - this.region.difficulty * 0.12;
    if (this.spawnTimer <= 0) { this._spawn(); this.spawnTimer = M.clamp(base + M.rand(-0.25, 0.35), 0.45, 1.6); }

    if (this.opp) {
      this.progress += speed * dt;
      this.opp.update(dt, input, this.boat);
      if (this.opp.caught) this.delivered = true;
      else if (this.opp.escaped) { this.failed = true; this.failReason = 'escaped'; }
    } else if (!this.harborActive) {
      this.progress += speed * dt;
      if (this.progress >= this.mission.distance) { this.harborActive = true; this.harborY = -160; }
    } else {
      this.harborY += speed * dt;
      if (this.harborY >= this.boat.y - 28) this.delivered = true;
    }

    var bb = this.boat.bounds();
    for (var i = this.obstacles.length - 1; i >= 0; i--) {
      var o = this.obstacles[i];
      o.update(dt, speed);
      if (o.y < this.dashTop && M.aabb(bb, o.bounds())) {
        if (this.boat.hit(o.kind)) { this.collisions += 1; this.shake = Math.min(1, this.shake + 0.85); this.flash = 0.6; if (this.boat.integrity <= 0) this.failed = true; }
      }
      if (o.y - o.h > this.dashTop + 30) this.obstacles.splice(i, 1);
    }
    this.boat.update(dt, input, this.left, this.right);
  };

  // Vanishing-Point-Speed-Lines fuer F1-Onboard-Gefuehl.
  World.prototype._speedLines = function (ctx, t) {
    var w = this.w, dt = this.dashTop;
    var intensity = (this.boat.boosting ? 1 : 0.55) * M.clamp(this.curSpeed / 280, 0.2, 1);
    var cx = w / 2, vy = dt * 0.30;
    ctx.save();
    ctx.globalAlpha = 0.06 + intensity * 0.16;
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
    var n = 14;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2;
      var phase = ((t * (0.8 + intensity * 1.6) + i * 0.13) % 1);
      var r0 = 30 + phase * (w * 0.7), r1 = r0 + 26 + intensity * 40;
      var dx = Math.cos(ang), dy = Math.sin(ang) * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx + dx * r0, vy + dy * r0);
      ctx.lineTo(cx + dx * r1, vy + dy * r1);
      ctx.stroke();
    }
    ctx.restore();
  };

  World.prototype.draw = function (ctx, t) {
    var w = this.w, h = this.h, dt = this.dashTop;

    // --- Spielfeld (oberhalb des Armaturenbretts) ---
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, dt); ctx.clip();
    // Kamera: Sway + Impact-Shake + feines Boost-Rütteln (cineastisch)
    var shakeAmp = this.shake * 7 + (this.boat.boosting ? 1.1 : 0);
    var sx = (Math.sin(t * 53.0) + Math.sin(t * 31.7)) * 0.5 * shakeAmp;
    var sy = (Math.cos(t * 47.0) + Math.sin(t * 29.3)) * 0.5 * shakeAmp * 0.7;
    ctx.translate(this.sway * -1 + sx, sy);

    this.water.draw(ctx, w, dt, t, this.scroll, this.region);

    // Horizont: Reviere-Bild als ferne Kulisse
    if (WB.Assets && WB.Assets.ready(this.bgId)) {
      var bandH = Math.round(dt * 0.34);
      WB.Assets.drawCover(ctx, WB.Assets.get(this.bgId), -10, 0, w + 20, bandH);
      var hg = ctx.createLinearGradient(0, bandH - 80, 0, bandH);
      hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(1, this.region.waterTop);
      ctx.fillStyle = hg; ctx.fillRect(-10, bandH - 80, w + 20, 80);
    }

    // Fahrrinnen-Kanten
    ctx.strokeStyle = 'rgba(201,162,75,0.22)'; ctx.lineWidth = 2;
    ctx.setLineDash([10, 14]); ctx.lineDashOffset = -(this.scroll % 24);
    ctx.beginPath(); ctx.moveTo(this.left, 0); ctx.lineTo(this.left, dt); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.right, 0); ctx.lineTo(this.right, dt); ctx.stroke();
    ctx.setLineDash([]);

    for (var i = 0; i < this.obstacles.length; i++) this.obstacles[i].draw(ctx);

    if (this.harborActive) {
      var hy = this.harborY;
      var g = ctx.createLinearGradient(0, hy - 60, 0, hy + 40);
      g.addColorStop(0, 'rgba(201,162,75,0)'); g.addColorStop(1, 'rgba(201,162,75,0.85)');
      ctx.fillStyle = g; ctx.fillRect(this.left, hy - 60, this.right - this.left, 100);
      ctx.fillStyle = '#7A5A33'; ctx.fillRect(this.left, hy, this.right - this.left, 14);
      ctx.fillStyle = '#F5F0E1'; ctx.font = '600 16px system-ui, sans-serif'; ctx.textAlign = 'center';
      var harbor = (this.region.harbors && this.region.harbors[0]) ? this.region.harbors[0].name : 'Zielpunkt';
      ctx.fillText('⚓ ' + harbor, w / 2, hy - 10);
    }

    if (this.opp) this.opp.draw(ctx, t);
    this.boat.drawWake(ctx, t);
    this.boat.draw(ctx, t);
    this._speedLines(ctx, t);

    // Filmischer Farb-Grade (kühle Tiefen, warme Lichter) – „teal & gold"
    if (typeof ctx.globalCompositeOperation === 'string') {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      var grade = ctx.createLinearGradient(0, 0, 0, dt);
      grade.addColorStop(0, 'rgba(231,206,139,0.18)');   // Himmel/Licht: warm
      grade.addColorStop(0.5, 'rgba(255,255,255,0)');
      grade.addColorStop(1, 'rgba(11,30,59,0.28)');      // Tiefe: kühl navy
      ctx.fillStyle = grade; ctx.fillRect(-40, 0, w + 80, dt);
      ctx.restore();
    }
    // Treffer-Blitz (kurzer roter Impact)
    if (this.flash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(201,70,47,' + (this.flash * 0.5).toFixed(3) + ')';
      ctx.fillRect(-40, 0, w + 80, dt);
      ctx.restore();
    }

    // Cineastische Rahmen-Vignette über dem Spielfeld (filmischer Look, weiche Ecken)
    var vig = ctx.createRadialGradient(w / 2, dt * 0.42, dt * 0.34, w / 2, dt * 0.42, dt * 0.95);
    vig.addColorStop(0, 'rgba(4,10,20,0)');
    vig.addColorStop(0.7, 'rgba(4,10,20,0)');
    vig.addColorStop(1, 'rgba(4,10,20,0.32)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, dt);
    ctx.restore();

    // Windschutzscheiben-Reflexe + A-Saeulen-Vignette
    var refl = ctx.createLinearGradient(0, 0, 0, dt);
    refl.addColorStop(0, 'rgba(255,255,255,0.05)'); refl.addColorStop(0.18, 'rgba(255,255,255,0)');
    ctx.fillStyle = refl; ctx.fillRect(0, 0, w, dt);
    var sideL = ctx.createLinearGradient(0, 0, w * 0.16, 0);
    sideL.addColorStop(0, 'rgba(5,12,22,0.55)'); sideL.addColorStop(1, 'rgba(5,12,22,0)');
    ctx.fillStyle = sideL; ctx.fillRect(0, 0, w * 0.16, dt);
    var sideR = ctx.createLinearGradient(w, 0, w * 0.84, 0);
    sideR.addColorStop(0, 'rgba(5,12,22,0.55)'); sideR.addColorStop(1, 'rgba(5,12,22,0)');
    ctx.fillStyle = sideR; ctx.fillRect(w * 0.84, 0, w * 0.16, dt);

    if (this.boat.boosting) {
      var bv = ctx.createRadialGradient(w / 2, dt * 0.4, dt * 0.2, w / 2, dt * 0.4, dt * 0.9);
      bv.addColorStop(0, 'rgba(201,162,75,0)'); bv.addColorStop(1, 'rgba(201,162,75,0.18)');
      ctx.fillStyle = bv; ctx.fillRect(0, 0, w, dt);
    }

    // --- Cockpit-Armaturenbrett (generiertes Bild) ---
    var dash = WB.Assets && WB.Assets.get(this.cockpitId);
    if (dash && dash.complete && dash.naturalWidth) {
      var sy = dash.naturalHeight * 0.55, sh = dash.naturalHeight * 0.45;
      ctx.drawImage(dash, 0, sy, dash.naturalWidth, sh, 0, dt, w, h - dt);
      var dg = ctx.createLinearGradient(0, dt, 0, dt + 50);
      dg.addColorStop(0, 'rgba(8,18,30,0.55)'); dg.addColorStop(1, 'rgba(8,18,30,0)');
      ctx.fillStyle = dg; ctx.fillRect(0, dt, w, 50);
    } else {
      ctx.fillStyle = '#0a1622'; ctx.fillRect(0, dt, w, h - dt);
      ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, dt, w, 30);
    }
    ctx.fillStyle = 'rgba(201,162,75,0.55)'; ctx.fillRect(0, dt - 2, w, 3);
  };

  WB.World = World;
})(window.WB = window.WB || {});
