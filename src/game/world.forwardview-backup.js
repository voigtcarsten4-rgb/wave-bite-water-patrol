/* Wave Bite – Water Patrol · game/world.js
 * FORWARD PATROL VIEW: Cockpit-Perspektive – der Spieler fährt IN die Berlin-Brandenburg-Welt hinein.
 * Master-Location als Horizont-Kulisse, Wasser perspektivisch, Verkehr kommt aus der Tiefe entgegen.
 * Lenken = Welt parallaktisch verschieben; ausweichen, bremsen, boosten. Lebendig: Wasser, Nebel, Möwen. */
(function (WB) {
  'use strict';
  var M = WB.math;

  var COCKPIT = 'cockpit_bridge';
  var BG = { bucht: 'loc_mueggelsee', kanal: 'loc_spree', seenplatte: 'loc_dahme', schleuse: 'loc_lock' };
  var TRAFFIC = ['buoy','sail','motor','sup','houseboat','swimmer','ferry','rock','log'];

  function World(boat, region, mission) {
    this.boat = boat; this.region = region; this.mission = mission;
    this.water = new WB.Water();
    this.obstacles = []; this.gulls = [];
    this.scroll = 0; this.progress = 0; this.spawnTimer = 0.7;
    this.harborActive = false; this.harborZ = 1.0;
    this.delivered = false; this.failed = false; this.collisions = 0;
    this.curSpeed = 120; this.playerLane = 0; this.shake = 0; this.flash = 0;
    this.isChase = !!({ control:1, eco:1, pursuit:1, rescue:1, smuggler:1 })[mission.type];
    this.failReason = null; this.opp = null;
    this.bgId = BG[region.id] || 'loc_mueggelsee';
    this.cockpitId = COCKPIT;
    this._parts = null; this._lucyT = 0; this._wasBoost = false; this._zone = null; this._zoneEnd = 0;
  }

  World.prototype.layout = function (w, h) {
    this.w = w; this.h = h;
    this.dashTop = Math.round(h * 0.62);
    this.horizonY = Math.round(this.dashTop * 0.17);
    this.boat.reset(w / 2, this.dashTop - 40);
    for (var i = 0; i < 4; i++) this.gulls.push({ x: M.rand(0, w), y: M.rand(this.horizonY * 0.3, this.horizonY * 1.2), s: M.rand(0.6, 1.2), v: M.rand(8, 20) * (Math.random() < 0.5 ? -1 : 1), ph: Math.random() * 6 });
    if (this.isChase && WB.Opponent) this.opp = new WB.Opponent(this, this.mission, this.region);
  };

  World.prototype.progressRatio = function () { return this.opp ? M.clamp(1 - this.opp.gap, 0, 1) : M.clamp(this.progress / this.mission.distance, 0, 1); };

  // Perspektiv-Projektion: z (1 fern .. 0 nah) -> Bildschirm
  World.prototype._t = function (z) { var tt = 1 - M.clamp(z, 0, 1); return tt * tt; };
  World.prototype._projY = function (z) { return this.horizonY + (this.dashTop - this.horizonY) * this._t(z); };
  World.prototype._laneHalf = function (z) { return M.lerp(this.w * 0.03, this.w * 0.60, this._t(z)); };
  World.prototype._scale = function (z) { return M.lerp(0.12, 1.5, this._t(z)); };
  World.prototype._projX = function (lane, z) {
    var t = this._t(z);
    var shift = this.playerLane * M.lerp(this.w * 0.04, this.w * 0.46, t);
    return this.w / 2 + lane * this._laneHalf(z) - shift;
  };

  World.prototype._spawn = function () {
    var pool = (this.region.difficulty >= 3) ? TRAFFIC : ['buoy','sail','motor','sup','swimmer','rock'];
    var kind = M.pick(pool);
    var lane = M.rand(-0.85, 0.85);
    this.obstacles.push(new WB.Obstacle(kind, lane, 1.02));
  };

  World.prototype.update = function (dt, input) {
    var speed = this.boat.forwardSpeed(input);
    this.curSpeed = speed;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.4);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3.2);
    this.scroll += speed * dt;

    // Spieler-Lenkung (boat.x -> lane -1..1)
    this.boat.update(dt, input, 0, this.w);
    var halfRange = (this.w / 2) - (this.boat.w / 2);
    this.playerLane = M.clamp((this.boat.x - this.w / 2) / (halfRange || 1), -1, 1);

    // Verkehr aus der Tiefe
    var zRate = speed / 520;
    this.spawnTimer -= dt;
    var base = 0.82 - this.region.difficulty * 0.08;
    if (this.spawnTimer <= 0) { this._spawn(); if (Math.random() < 0.35) this._spawn(); this.spawnTimer = M.clamp(base + M.rand(-0.18, 0.32), 0.32, 1.1); }

    for (var i = this.obstacles.length - 1; i >= 0; i--) {
      var o = this.obstacles[i];
      o.update(dt, zRate);
      if (!o.counted && o.z <= 0.14 && o.z > -0.02 && Math.abs(o.lane - this.playerLane) < (o.hitW + 0.05)) {
        o.counted = true;
        if (this.boat.hit(o.kind === 'swimmer' ? 'buoy' : o.kind)) {
          this.collisions += 1; this.shake = Math.min(1, this.shake + 0.85); this.flash = 0.6;
          if (this.boat.integrity <= 0) this.failed = true;
        }
      }
      if (o.dead) this.obstacles.splice(i, 1);
    }

    // --- Lucy Live-Ansagen (gedrosselt): Verkehrswarnung + Boost-Quip ---
    this._lucyT -= dt;
    if (this._lucyT <= 0 && WB.LucyHUD && WB.LucyHUD.say) {
      var near = null;
      for (var n = 0; n < this.obstacles.length; n++) { var oo = this.obstacles[n]; if (oo.z < 0.55 && oo.z > 0.18 && Math.abs(oo.lane - this.playerLane) < 0.3) { near = oo; break; } }
      if (near) { var NM = { buoy:'Boje', sail:'Segler', motor:'Motorboot', sup:'SUP-Fahrer', houseboat:'Hausboot', swimmer:'Schwimmer', ferry:'Fähre', rock:'Felsen', log:'Treibholz' };
        WB.LucyHUD.say((near.lane < this.playerLane ? '◀ ' : '▶ ') + (NM[near.kind] || 'Hindernis') + ' voraus – ausweichen!'); this._lucyT = 3.0; if (WB.Audio) WB.Audio.danger(); }
    }
    if (this.boat.boosting && !this._wasBoost && WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Boost! Achte auf den Verkehr.');
    this._wasBoost = this.boat.boosting;

    // --- Tempozonen / Learning by Playing (nur Nicht-Verfolgung) ---
    if (!this.opp) {
      if (!this._zone && this.progress > 200 && (this.progress % 950) < 9) {
        this._zone = { viol: false }; this._zoneEnd = this.progress + 380;
        if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('🐢 Schutzzone – bitte Tempo drosseln!');
      }
      if (this._zone) {
        if (input.boost || input.throttle) this._zone.viol = true;
        if (this.progress >= this._zoneEnd) {
          if (!this._zone.viol) { WB.Save.data.coins += 25; if (WB.Screens && WB.Screens.refreshTopbar) WB.Screens.refreshTopbar(); if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Vorbildlich gefahren. +25 🪙'); }
          else if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Zu schnell in der Schutzzone!');
          this._zone = null;
        }
      }
    }

    // Möwen
    for (var g = 0; g < this.gulls.length; g++) { var gu = this.gulls[g]; gu.x += gu.v * dt; gu.ph += dt * 6; if (gu.x < -20) gu.x = this.w + 20; if (gu.x > this.w + 20) gu.x = -20; }

    // Fortschritt / Ziel / Verfolgung
    if (this.opp) {
      this.progress += speed * dt;
      this.opp.update(dt, input, this.boat);
      if (this.opp.caught) this.delivered = true;
      else if (this.opp.escaped) { this.failed = true; this.failReason = 'escaped'; }
    } else if (!this.harborActive) {
      this.progress += speed * dt;
      if (this.progress >= this.mission.distance) { this.harborActive = true; this.harborZ = 1.0; }
    } else {
      this.harborZ -= zRate * dt;
      if (this.harborZ <= 0.05) this.delivered = true;
    }
  };

  World.prototype._waterAndSky = function (ctx, t) {
    var w = this.w, dt = this.dashTop, hy = this.horizonY;
    // Himmel/Kulisse (Master-Location), leichter Forward-Zoom + Lenk-Parallaxe
    var img = WB.Assets && WB.Assets.get(this.bgId);
    var zoom = 1.06 + 0.03 * Math.sin(t * 0.2);
    var px = -this.playerLane * w * 0.04;
    if (img && img.complete && img.naturalWidth) {
      var bandH = hy + 24;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, bandH); ctx.clip();
      var dw = w * zoom, dh = bandH * zoom;
      WB.Assets.drawCover(ctx, img, (w - dw) / 2 + px, (bandH - dh) / 2, dw, dh);
      ctx.restore();
      var hg = ctx.createLinearGradient(0, hy - 30, 0, hy + 20);
      hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(1, this.region.waterTop);
      ctx.fillStyle = hg; ctx.fillRect(0, hy - 30, w, 50);
    } else {
      var sky = ctx.createLinearGradient(0, 0, 0, hy); sky.addColorStop(0, '#1b3a5e'); sky.addColorStop(1, this.region.waterTop);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hy);
    }
    // Wasser (perspektivisch) unter dem Horizont
    var wg = ctx.createLinearGradient(0, hy, 0, dt);
    wg.addColorStop(0, this.region.waterTop); wg.addColorStop(1, this.region.waterBottom);
    ctx.fillStyle = wg; ctx.fillRect(0, hy, w, dt - hy);
    // animierte Tiefen-Linien zum Fluchtpunkt (Fahrtgefühl)
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1;
    var lanes = [-0.6,-0.3,0,0.3,0.6], i;
    for (i = 0; i < lanes.length; i++) {
      ctx.beginPath(); ctx.moveTo(w/2 + lanes[i]*this._laneHalf(0) - this.playerLane*w*0.46, dt);
      ctx.lineTo(w/2 + lanes[i]*this._laneHalf(1) - this.playerLane*w*0.04, hy); ctx.stroke();
    }
    // Quer-Wellenlinien (scrollen) für Tempo
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    for (i = 0; i < 7; i++) {
      var p = ((this.scroll * 0.004 + i / 7) % 1);
      var yy = hy + (dt - hy) * (p * p);
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke();
    }
    ctx.restore();
  };

  World.prototype._drawGulls = function (ctx) {
    ctx.save(); ctx.strokeStyle = 'rgba(20,30,45,0.5)'; ctx.lineWidth = 2;
    for (var i = 0; i < this.gulls.length; i++) {
      var g = this.gulls[i], wsp = 6 * g.s, fl = Math.sin(g.ph) * 3 * g.s;
      ctx.beginPath();
      ctx.moveTo(g.x - wsp, g.y + fl); ctx.lineTo(g.x, g.y); ctx.lineTo(g.x + wsp, g.y + fl);
      ctx.stroke();
    }
    ctx.restore();
  };

  World.prototype._waterGlints = function (ctx, t) {
    var w = this.w, hy = this.horizonY, dt = this.dashTop;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 5; i++) {
      var p = ((t * 0.05 + i * 0.21) % 1), y = hy + (dt - hy) * (p * p);
      var x = w / 2 + Math.sin(i * 2 + t * 0.3) * (this._laneHalf(1 - p) * 0.5) - this.playerLane * M.lerp(w * 0.04, w * 0.46, p * p);
      var r = 2 + p * 9, g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, 'rgba(255,238,190,' + (0.22 * (1 - p)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,238,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  World.prototype._airLight = function (ctx, t) {
    var w = this.w, dt = this.dashTop, hy = this.horizonY;
    if (!this._parts) { this._parts = []; for (var k = 0; k < 16; k++) this._parts.push({ x: Math.random() * w, y: Math.random() * dt, s: Math.random() * 1.4 + 0.5, vx: (Math.random() - 0.5) * 6, vy: -(Math.random() * 6 + 2) }); }
    ctx.save();
    for (var i = 0; i < this._parts.length; i++) { var pp = this._parts[i]; pp.x += pp.vx * 0.016; pp.y += pp.vy * 0.016; if (pp.y < 0) { pp.y = dt; pp.x = Math.random() * w; } ctx.fillStyle = 'rgba(255,245,210,0.22)'; ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.s, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    var bl = document.getElementById('bluelight');
    if (bl && bl.classList.contains('on')) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bg = ctx.createLinearGradient(0, hy, 0, dt); bg.addColorStop(0, 'rgba(60,140,255,' + (0.05 + pulse * 0.18).toFixed(2) + ')'); bg.addColorStop(1, 'rgba(60,140,255,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, hy, w, dt - hy); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var lg = ctx.createRadialGradient(w * 0.5, hy * 0.45, 2, w * 0.5, hy * 0.45, hy * 1.5);
    lg.addColorStop(0, 'rgba(255,225,160,0.16)'); lg.addColorStop(1, 'rgba(255,225,160,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, hy * 1.7); ctx.restore();
  };

  World.prototype.draw = function (ctx, t) {
    var w = this.w, h = this.h, dt = this.dashTop, hy = this.horizonY;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, dt); ctx.clip();
    var sx = this.shake * 6 * (Math.sin(t * 53) + Math.sin(t * 31)) * 0.5;
    var sy = this.shake * 4 * (Math.cos(t * 47)) * 0.5;
    var bob = Math.sin(t * 1.2) * 1.6 + Math.sin(t * 2.7) * 0.7;
    ctx.translate(sx, sy + bob);

    this._waterAndSky(ctx, t);
    this._waterGlints(ctx, t);
    this._drawGulls(ctx);

    // Nebel-Band am Horizont (leicht, nicht düster)
    var fog = ctx.createLinearGradient(0, hy - 18, 0, hy + 40);
    fog.addColorStop(0, 'rgba(220,232,245,0.18)'); fog.addColorStop(1, 'rgba(220,232,245,0)');
    ctx.fillStyle = fog; ctx.fillRect(0, hy - 18, w, 60);

    // Ziel-Hafen (kommt entgegen)
    if (this.harborActive) {
      var hyP = this._projY(this.harborZ), sc = this._scale(this.harborZ);
      ctx.fillStyle = 'rgba(201,162,75,0.9)'; ctx.fillRect(w/2 - 120*sc, hyP - 6*sc, 240*sc, 12*sc);
      ctx.fillStyle = '#F5F0E1'; ctx.font = (13*Math.max(sc,0.6)|0) + 'px system-ui,sans-serif'; ctx.textAlign='center';
      var hn = (this.region.harbors && this.region.harbors[0]) ? this.region.harbors[0].name : 'Zielpunkt';
      ctx.fillText('⚓ ' + hn, w/2, hyP - 12*sc);
    }

    // Verkehr: fern -> nah (Painter)
    var sorted = this.obstacles.slice().sort(function (a, b) { return b.z - a.z; });
    for (var i = 0; i < sorted.length; i++) {
      var o = sorted[i];
      o.drawAt(ctx, this._projX(o.lane, o.z), this._projY(o.z), this._scale(o.z));
    }

    if (this.opp) this.opp.draw(ctx, t);
    this._airLight(ctx, t);

    // POV: Bug + Bugspray unten mittig
    var bowY = dt - 4;
    ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.min(1, this.curSpeed/260);
    var spray = ctx.createRadialGradient(w/2, bowY, 4, w/2, bowY, 70);
    spray.addColorStop(0,'rgba(255,255,255,0.5)'); spray.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = spray; ctx.beginPath(); ctx.ellipse(w/2 + Math.sin(t*8)*4, bowY, 60, 22, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Boost-Tunnel
    if (this.boat.boosting) {
      var bv = ctx.createRadialGradient(w/2, dt*0.5, dt*0.2, w/2, dt*0.5, dt*0.9);
      bv.addColorStop(0,'rgba(201,162,75,0)'); bv.addColorStop(1,'rgba(201,162,75,0.2)');
      ctx.fillStyle = bv; ctx.fillRect(0,0,w,dt);
    }
    // Treffer-Blitz
    if (this.flash > 0) { ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(201,70,47,'+(this.flash*0.5).toFixed(3)+')'; ctx.fillRect(0,0,w,dt); ctx.restore(); }
    // Vignette + Windschutz-Reflex
    var vig = ctx.createRadialGradient(w/2, dt*0.42, dt*0.34, w/2, dt*0.42, dt*0.95);
    vig.addColorStop(0,'rgba(4,10,20,0)'); vig.addColorStop(0.7,'rgba(4,10,20,0)'); vig.addColorStop(1,'rgba(4,10,20,0.32)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,dt);
    var refl = ctx.createLinearGradient(0,0,0,dt); refl.addColorStop(0,'rgba(255,255,255,0.05)'); refl.addColorStop(0.16,'rgba(255,255,255,0)');
    ctx.fillStyle = refl; ctx.fillRect(0,0,w,dt);
    ctx.restore();

    // Verbindliche Tageszeit-Farbwelt (Tag: warm · Abend: gold · Nacht: blau – nie düster)
    var hr = new Date().getHours(), tint;
    if (hr < 7 || hr >= 21) tint = 'rgba(50,95,175,0.12)';
    else if (hr >= 18) tint = 'rgba(255,180,95,0.12)';
    else tint = 'rgba(255,228,150,0.07)';
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = tint; ctx.fillRect(0, 0, w, dt); ctx.restore();

    // Cockpit-Armaturenbrett (cockpit_bridge) unten
    var dash = WB.Assets && WB.Assets.get(this.cockpitId);
    if (dash && dash.complete && dash.naturalWidth) {
      var syc = dash.naturalHeight * 0.5, shc = dash.naturalHeight * 0.5;
      ctx.drawImage(dash, 0, syc, dash.naturalWidth, shc, 0, dt, w, h - dt);
    } else { ctx.fillStyle = '#0a1622'; ctx.fillRect(0, dt, w, h - dt); }
    ctx.fillStyle = 'rgba(201,162,75,0.55)'; ctx.fillRect(0, dt - 2, w, 3);
  };

  WB.World = World;
})(window.WB = window.WB || {});
