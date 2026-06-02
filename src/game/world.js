/* Wave Bite – Water Patrol · game/world.js
 * ONBOARD COCKPIT VIEW: Der Spieler schaut durch die Frontscheibe des Polizeiboots.
 * Die Welt füllt den GESAMTEN Bildschirm (Himmel→Horizont→Wasser bis fast zum unteren Rand),
 * davor liegt das Cockpit als fixer Vordergrund-Rahmen (Scheibenrahmen, A-Säulen, Armatur, Glasreflex).
 * Bootsbewegung: Rollen (Lenken), Nicken (Tempo/Boost), Schaukeln, Sturm-Wellengang. Welt neigt sich, Cockpit bleibt fix. */
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
    this.roll = 0; this.pitch = 0;
    this.storm = !!(mission && (mission.type === 'rescue' || (region && region.id === 'seenplatte'))) ;
  }

  World.prototype.layout = function (w, h) {
    this.w = w; this.h = h;
    // Welt füllt den ganzen Bildschirm; Cockpit-Konsole liegt als Vordergrund über dem unteren Teil.
    this.viewBottom = Math.round(h * 0.965);   // Wasser reicht fast bis zum unteren Rand
    this.horizonY  = Math.round(h * 0.27);     // Horizont weiter oben -> mehr Welt/Tiefe
    this.dashTop   = Math.round(h * 0.72);     // Oberkante der Cockpit-Konsole (Armaturen)
    this.boat.reset(w / 2, this.viewBottom - 40);
    this.gulls = [];
    for (var i = 0; i < 4; i++) this.gulls.push({ x: M.rand(0, w), y: M.rand(this.horizonY * 0.3, this.horizonY * 1.2), s: M.rand(0.6, 1.2), v: M.rand(8, 20) * (Math.random() < 0.5 ? -1 : 1), ph: Math.random() * 6 });
    if (this.isChase && WB.Opponent) this.opp = new WB.Opponent(this, this.mission, this.region);
  };

  World.prototype.progressRatio = function () { return this.opp ? M.clamp(1 - this.opp.gap, 0, 1) : M.clamp(this.progress / this.mission.distance, 0, 1); };

  // Perspektiv-Projektion: z (1 fern .. 0 nah) -> Bildschirm. Nahebene = viewBottom (unterer Rand).
  World.prototype._t = function (z) { var tt = 1 - M.clamp(z, 0, 1); return tt * tt; };
  World.prototype._projY = function (z) { return this.horizonY + (this.viewBottom - this.horizonY) * this._t(z); };
  World.prototype._laneHalf = function (z) { return M.lerp(this.w * 0.03, this.w * 0.62, this._t(z)); };
  World.prototype._scale = function (z) { return M.lerp(0.18, 2.4, this._t(z)); };
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

    this.boat.update(dt, input, 0, this.w);
    var halfRange = (this.w / 2) - (this.boat.w / 2);
    this.playerLane = M.clamp((this.boat.x - this.w / 2) / (halfRange || 1), -1, 1);

    // Bootsbewegung: Rollen (Lenken) + Nicken (Tempo/Boost) – sanft gedämpft, nicht seekrank.
    var stormAmp = this.storm ? 1.0 : 0.45;
    var targetRoll = -this.playerLane * 0.045 + Math.sin(this._lt = (this._lt||0) + dt) * 0 ; // base from steer
    this.roll += (targetRoll - this.roll) * Math.min(1, dt * 4);
    var targetPitch = (this.boat.boosting ? -0.012 : 0) + (speed/2600);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, dt * 3);

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

    this._lucyT -= dt;
    if (this._lucyT <= 0 && WB.LucyHUD && WB.LucyHUD.say) {
      var near = null;
      for (var n = 0; n < this.obstacles.length; n++) { var oo = this.obstacles[n]; if (oo.z < 0.55 && oo.z > 0.18 && Math.abs(oo.lane - this.playerLane) < 0.3) { near = oo; break; } }
      if (near) { var NM = { buoy:'Boje', sail:'Segler', motor:'Motorboot', sup:'SUP-Fahrer', houseboat:'Hausboot', swimmer:'Schwimmer', ferry:'Fähre', rock:'Felsen', log:'Treibholz' };
        WB.LucyHUD.say((near.lane < this.playerLane ? '◀ ' : '▶ ') + (NM[near.kind] || 'Hindernis') + ' voraus – ausweichen!'); this._lucyT = 3.0; if (WB.Audio) WB.Audio.danger(); }
    }
    if (this.boat.boosting && !this._wasBoost && WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Boost! Achte auf den Verkehr.');
    this._wasBoost = this.boat.boosting;

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

    for (var g = 0; g < this.gulls.length; g++) { var gu = this.gulls[g]; gu.x += gu.v * dt; gu.ph += dt * 6; if (gu.x < -20) gu.x = this.w + 20; if (gu.x > this.w + 20) gu.x = -20; }

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
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, dt = this.dashTop, oh = h0(this);
    var img = WB.Assets && WB.Assets.get(this.bgId);
    var zoom = 1.04 + 0.03 * Math.sin(t * 0.2);
    var px = -this.playerLane * w * 0.06;
    // Berlin-Brandenburg-Kulisse füllt die GANZE Scheibe (man fährt darauf zu)
    if (img && img.complete && img.naturalWidth) {
      ctx.save(); ctx.beginPath(); ctx.rect(-w*0.2, -oh, w*1.4, vb + oh); ctx.clip();
      var dw = w * zoom * 1.22, dh = (vb) * zoom * 1.0;
      WB.Assets.drawCover(ctx, img, (w - dw) / 2 + px, -oh*0.4, dw, dh);
      ctx.restore();
    } else {
      var sky = ctx.createLinearGradient(0, 0, 0, vb); sky.addColorStop(0, '#2b557e'); sky.addColorStop(0.5, '#1b3a5e'); sky.addColorStop(1, this.region.waterBottom);
      ctx.fillStyle = sky; ctx.fillRect(-w*0.2, -oh, w*1.4, vb + oh);
    }
    // Wasser blendet über der Kulisse ein: am Horizont durchsichtig -> unten voll (Fahrwasser)
    var wg = ctx.createLinearGradient(0, hy, 0, vb);
    wg.addColorStop(0, 'rgba(22,64,100,0.0)');
    wg.addColorStop(0.30, 'rgba(18,56,90,0.55)');
    wg.addColorStop(0.65, 'rgba(13,42,70,0.92)');
    wg.addColorStop(1, 'rgba(8,26,44,1)');
    ctx.fillStyle = wg; ctx.fillRect(-w*0.2, hy, w*1.4, vb - hy + oh);
    // sanftes Glanzband direkt unter dem Horizont (Sonnen-/Lichtspiegelung)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var gl = ctx.createLinearGradient(0, hy - 6, 0, hy + 70);
    gl.addColorStop(0, 'rgba(255,236,190,0.0)'); gl.addColorStop(0.4, 'rgba(255,236,190,0.16)'); gl.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, hy - 6, w, 76); ctx.restore();
    // Tiefen-/Fahrlinien zum Fluchtpunkt (nur im unteren, voll deckenden Wasserbereich)
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1;
    var lanes = [-0.6,-0.3,0,0.3,0.6], i, midY = hy + (vb - hy) * 0.34;
    for (i = 0; i < lanes.length; i++) {
      ctx.beginPath(); ctx.moveTo(w/2 + lanes[i]*this._laneHalf(0) - this.playerLane*w*0.46, vb);
      ctx.lineTo(w/2 + lanes[i]*0.28*this._laneHalf(1) - this.playerLane*w*0.12, midY); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (i = 0; i < 7; i++) {
      var p = ((this.scroll * 0.004 + i / 7) % 1);
      var yy = midY + (vb - midY) * (p * p);
      ctx.beginPath(); ctx.moveTo(-w*0.2, yy); ctx.lineTo(w*1.2, yy); ctx.stroke();
    }
    ctx.restore();
  };
  // kleine Überzeichnung nach unten/oben, damit beim Rollen keine Kanten sichtbar werden
  function h0(self){ return Math.round(self.h * 0.12); }

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
    var w = this.w, hy = this.horizonY, vb = this.viewBottom;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 6; i++) {
      var p = ((t * 0.05 + i * 0.18) % 1), y = hy + (vb - hy) * (p * p);
      var x = w / 2 + Math.sin(i * 2 + t * 0.3) * (this._laneHalf(1 - p) * 0.5) - this.playerLane * M.lerp(w * 0.04, w * 0.46, p * p);
      var r = 2 + p * 10, g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, 'rgba(255,238,190,' + (0.22 * (1 - p)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,238,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  World.prototype._airLight = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY;
    if (!this._parts) { this._parts = []; for (var k = 0; k < 18; k++) this._parts.push({ x: Math.random() * w, y: Math.random() * vb, s: Math.random() * 1.4 + 0.5, vx: (Math.random() - 0.5) * 6, vy: -(Math.random() * 6 + 2) }); }
    ctx.save();
    for (var i = 0; i < this._parts.length; i++) { var pp = this._parts[i]; pp.x += pp.vx * 0.016; pp.y += pp.vy * 0.016; if (pp.y < 0) { pp.y = vb; pp.x = Math.random() * w; } ctx.fillStyle = 'rgba(255,245,210,0.20)'; ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.s, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    var bl = document.getElementById('bluelight');
    if (bl && bl.classList.contains('on')) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bg = ctx.createLinearGradient(0, hy, 0, vb); bg.addColorStop(0, 'rgba(60,140,255,' + (0.05 + pulse * 0.20).toFixed(2) + ')'); bg.addColorStop(1, 'rgba(60,140,255,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, hy, w, vb - hy); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var lg = ctx.createRadialGradient(w * 0.5, hy * 0.5, 2, w * 0.5, hy * 0.5, hy * 1.6);
    lg.addColorStop(0, 'rgba(255,225,160,0.16)'); lg.addColorStop(1, 'rgba(255,225,160,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, hy * 1.8); ctx.restore();
  };

  // ---------- Cockpit-Vordergrund (Scheibenrahmen, A-Säulen, Armatur, Glasreflex) ----------
  World.prototype._drawCockpit = function (ctx, t) {
    var w = this.w, h = this.h, dt = this.dashTop, hy = this.horizonY;
    var headerH = Math.round(h * 0.055);
    var pillarW = Math.round(w * 0.075);
    var navy = '#0a1726';

    // A-Säulen links/rechts (Scheibenrahmen)
    var pl = ctx.createLinearGradient(0, 0, pillarW, 0);
    pl.addColorStop(0, navy); pl.addColorStop(0.7, 'rgba(12,26,42,0.92)'); pl.addColorStop(1, 'rgba(12,26,42,0)');
    ctx.fillStyle = pl; ctx.fillRect(0, 0, pillarW, dt);
    var pr = ctx.createLinearGradient(w, 0, w - pillarW, 0);
    pr.addColorStop(0, navy); pr.addColorStop(0.7, 'rgba(12,26,42,0.92)'); pr.addColorStop(1, 'rgba(12,26,42,0)');
    ctx.fillStyle = pr; ctx.fillRect(w - pillarW, 0, pillarW, dt);
    // Dachholm oben
    var hd = ctx.createLinearGradient(0, 0, 0, headerH);
    hd.addColorStop(0, navy); hd.addColorStop(0.6, 'rgba(12,26,42,0.9)'); hd.addColorStop(1, 'rgba(12,26,42,0)');
    ctx.fillStyle = hd; ctx.fillRect(0, 0, w, headerH);
    // dünne Gold-Kante am Scheibenrahmen
    ctx.strokeStyle = 'rgba(201,162,75,0.30)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pillarW, headerH); ctx.lineTo(pillarW, dt); ctx.moveTo(w - pillarW, headerH); ctx.lineTo(w - pillarW, dt); ctx.moveTo(pillarW, headerH); ctx.lineTo(w - pillarW, headerH); ctx.stroke();

    // Glasreflex (diagonaler Schein über der Scheibe)
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    var gl = ctx.createLinearGradient(0, headerH, w * 0.8, dt);
    gl.addColorStop(0, 'rgba(255,255,255,0.0)'); gl.addColorStop(0.45, 'rgba(200,225,255,0.06)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.56, 'rgba(200,225,255,0.04)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(pillarW, headerH, w - 2 * pillarW, dt - headerH);
    ctx.restore();

    // Blaulicht-Reflexion auf der Scheibe
    var bl = document.getElementById('bluelight');
    if (bl && bl.classList.contains('on')) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bgGlass = ctx.createLinearGradient(0, headerH, 0, dt * 0.7);
      bgGlass.addColorStop(0, 'rgba(70,150,255,' + (0.06 + pulse * 0.10).toFixed(2) + ')'); bgGlass.addColorStop(1, 'rgba(70,150,255,0)');
      ctx.fillStyle = bgGlass; ctx.fillRect(pillarW, headerH, w - 2 * pillarW, dt * 0.7); ctx.restore();
    }

    // Armaturenbrett (cockpit_bridge) als Vordergrund-Konsole unten
    var dash = WB.Assets && WB.Assets.get(this.cockpitId);
    if (dash && dash.complete && dash.naturalWidth) {
      var syc = dash.naturalHeight * 0.40, shc = dash.naturalHeight * 0.60;
      ctx.drawImage(dash, 0, syc, dash.naturalWidth, shc, 0, dt, w, h - dt);
      // Armatur sichtbar aufhellen (Vorlage bleibt, nur Belichtung angehoben)
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var lift = ctx.createLinearGradient(0, dt, 0, h);
      lift.addColorStop(0, 'rgba(70,110,150,0.22)'); lift.addColorStop(0.5, 'rgba(40,70,105,0.16)'); lift.addColorStop(1, 'rgba(20,40,65,0.10)');
      ctx.fillStyle = lift; ctx.fillRect(0, dt, w, h - dt);
      // Instrumenten-Glow (Mitte: Displays/Kompass)
      var ig = ctx.createRadialGradient(w*0.5, dt + (h-dt)*0.42, 4, w*0.5, dt + (h-dt)*0.42, (h-dt)*0.9);
      ig.addColorStop(0, 'rgba(90,170,210,0.18)'); ig.addColorStop(1, 'rgba(90,170,210,0)');
      ctx.fillStyle = ig; ctx.fillRect(0, dt, w, h - dt);
      ctx.restore();
    } else {
      var cg = ctx.createLinearGradient(0, dt, 0, h); cg.addColorStop(0, '#1c3450'); cg.addColorStop(1, '#0b1828');
      ctx.fillStyle = cg; ctx.fillRect(0, dt, w, h - dt);
    }
    // weicher Übergang Scheibe->Armatur + Gold-Kante
    var em = ctx.createLinearGradient(0, dt - 26, 0, dt + 8);
    em.addColorStop(0, 'rgba(7,15,26,0)'); em.addColorStop(1, 'rgba(7,15,26,0.55)');
    ctx.fillStyle = em; ctx.fillRect(0, dt - 26, w, 34);
    // Lebendige Instrumente (subtil): Radar-Sweep links, Funk-Blink rechts
    var cyc = dt + (h-dt)*0.5, rx = w*0.30, rr = (h-dt)*0.30;
    ctx.save();
    ctx.globalAlpha=0.5; ctx.strokeStyle='rgba(90,200,160,0.5)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(rx, cyc, rr, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(rx, cyc, rr*0.6, 0, Math.PI*2); ctx.stroke();
    var ang=(t*1.6)%(Math.PI*2);
    var sweep=ctx.createConicGradient ? null : null;
    ctx.globalAlpha=0.55; ctx.strokeStyle='rgba(120,235,180,0.8)';
    ctx.beginPath(); ctx.moveTo(rx,cyc); ctx.lineTo(rx+Math.cos(ang)*rr, cyc+Math.sin(ang)*rr); ctx.stroke();
    // ein „Kontakt"-Punkt
    var cpt=ang+1.1; ctx.fillStyle='rgba(120,235,180,'+(0.3+0.5*Math.abs(Math.sin(t))).toFixed(2)+')';
    ctx.beginPath(); ctx.arc(rx+Math.cos(cpt)*rr*0.7, cyc+Math.sin(cpt)*rr*0.7, 2.5, 0, Math.PI*2); ctx.fill();
    // Funk-Blink rechts
    var blink=(Math.sin(t*4)>0.6)?1:0; ctx.globalAlpha=0.3+0.6*blink; ctx.fillStyle='#ffcaa0';
    ctx.beginPath(); ctx.arc(w*0.74, dt+(h-dt)*0.32, 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(201,162,75,0.45)'; ctx.fillRect(0, dt - 2, w, 2);
  };

  // Sicherer Fahrkorridor: zwei dezente grüne Linien + kleine Pfeile entlang der aktuellen Spur.
  World.prototype._drawSafeLane = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, mid = hy + (vb - hy) * 0.34;
    var lane = this.playerLane;
    function projX(self, ln, near){ return near ? (w/2 + ln*self._laneHalf(0) - lane*w*0.46) : (w/2 + ln*0.28*self._laneHalf(1) - lane*w*0.12); }
    ctx.save();
    var grd = ctx.createLinearGradient(0, mid, 0, vb);
    grd.addColorStop(0, 'rgba(90,220,160,0.0)'); grd.addColorStop(1, 'rgba(90,220,160,0.30)');
    ctx.strokeStyle = grd; ctx.lineWidth = 2.5;
    [-0.20, 0.20].forEach(function(off){
      ctx.beginPath(); ctx.moveTo(projX(this, off, true), vb); ctx.lineTo(projX(this, off, false), mid); ctx.stroke();
    }, this);
    // Richtungspfeile (scrollen nach unten = Fahrtgefühl)
    ctx.fillStyle = 'rgba(120,235,180,0.5)';
    for (var i = 0; i < 3; i++) {
      var p = ((this.scroll * 0.0016 + i / 3) % 1);
      var yy = mid + (vb - mid) * (p * p);
      var cx = w/2 - lane * M.lerp(w*0.12, w*0.46, p*p);
      var aw = M.lerp(5, 16, p), ah = M.lerp(4, 12, p);
      ctx.globalAlpha = 0.18 + 0.5 * p;
      ctx.beginPath(); ctx.moveTo(cx - aw, yy - ah); ctx.lineTo(cx, yy); ctx.lineTo(cx + aw, yy - ah); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  // Gefahr-Marker + Label (Typ · Distanz) für die nächsten Objekte – Klarheit statt Überladung.
  World.prototype._drawObstacleMarkers = function (ctx) {
    var near = [];
    for (var i = 0; i < this.obstacles.length; i++) { var o = this.obstacles[i]; if (o.z < 0.82 && o.z > 0.02) near.push(o); }
    near.sort(function (a, b) { return a.z - b.z; });
    var NAME = WB.Obstacle.NAME || {};
    var shown = 0;
    for (var k = 0; k < near.length && shown < 4; k++) {
      var ob = near[k];
      var dlane = Math.abs(ob.lane - this.playerLane);
      var collide = dlane < (ob.hitW + 0.12);
      var risk = (collide && ob.z < 0.6) ? 'red' : (dlane < 0.36 ? 'amber' : 'safe');
      var col = risk === 'red' ? '#ff4d3d' : risk === 'amber' ? '#ffc23d' : '#6fe0a3';
      var x = this._projX(ob.lane, ob.z), y = this._projY(ob.z), sc = this._scale(ob.z);
      var topY = y - 30 * sc - 14;
      // Chevron über dem Objekt
      ctx.save();
      ctx.fillStyle = col; ctx.globalAlpha = 0.92;
      if (risk === 'red') { var pl = 0.6 + 0.4 * Math.sin(ob.phase * 3); ctx.globalAlpha = 0.6 + 0.4 * pl; }
      ctx.beginPath(); ctx.moveTo(x - 8, topY); ctx.lineTo(x + 8, topY); ctx.lineTo(x, topY + 9); ctx.closePath(); ctx.fill();
      // roter Kollisions-Ring direkt am Objekt
      if (risk === 'red') { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(ob.phase * 3);
        ctx.beginPath(); ctx.arc(x, y, 22 * sc, 0, Math.PI * 2); ctx.stroke(); }
      // Label nur bei näheren Objekten (z<0.62)
      if (ob.z < 0.62) {
        var m = Math.max(0, Math.round(ob.z * 110));
        var label = (NAME[ob.kind] || 'Objekt') + ' · ' + m + ' m';
        ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center';
        var tw = ctx.measureText(label).width, bx = x - tw/2 - 7, by = topY - 21, bw = tw + 14, bh = 18;
        ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(6,16,28,0.82)';
        if (M.roundRect) { M.roundRect(ctx, bx, by, bw, bh, 6); ctx.fill(); } else ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9;
        if (M.roundRect) { M.roundRect(ctx, bx, by, bw, bh, 6); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.fillText(label, x, by + 13);
      }
      ctx.restore();
      shown++;
    }
    // Ausweich-Assistent: bei akuter Kollision Richtungs-Pfeile + Kollisionslinie
    var danger=null;
    for (var d=0; d<this.obstacles.length; d++){ var ob2=this.obstacles[d];
      if (ob2.z<0.5 && ob2.z>0.05 && Math.abs(ob2.lane-this.playerLane)<(ob2.hitW+0.14)){ if(!danger||ob2.z<danger.z) danger=ob2; } }
    if (danger){
      var w2=this.w, vb2=this.viewBottom, cy=vb2-(vb2-this.horizonY)*0.30;
      var safeLeft = danger.lane >= this.playerLane;       // Objekt rechts -> links ausweichen
      var sgn = safeLeft ? -1 : 1, dx = w2/2 + sgn*w2*0.20, ddx = w2/2 - sgn*w2*0.16;
      var pulse=0.55+0.45*Math.sin(danger.phase*3);
      ctx.save();
      // grüner Sicher-Pfeil
      ctx.globalAlpha=0.85; ctx.fillStyle='#5fe39a';
      ctx.beginPath(); ctx.moveTo(dx-sgn*16, cy-13); ctx.lineTo(dx+sgn*16, cy); ctx.lineTo(dx-sgn*16, cy+13); ctx.closePath(); ctx.fill();
      // rote Gefahrenseite + Kollisionslinie zum Objekt
      ctx.globalAlpha=0.4+0.4*pulse; ctx.strokeStyle='#ff4d3d'; ctx.lineWidth=3;
      var ox=this._projX(danger.lane,danger.z), oy=this._projY(danger.z);
      ctx.beginPath(); ctx.moveTo(w2/2 - this.playerLane*0, vb2); ctx.lineTo(ox, oy); ctx.stroke();
      ctx.fillStyle='#ff4d3d'; ctx.globalAlpha=0.5+0.4*pulse;
      ctx.beginPath(); ctx.moveTo(ddx+sgn*16, cy-12); ctx.lineTo(ddx-sgn*16, cy); ctx.lineTo(ddx+sgn*16, cy+12); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };

  World.prototype.draw = function (ctx, t) {
    var w = this.w, h = this.h, vb = this.viewBottom, hy = this.horizonY;

    // ---------- WELT (durch die Scheibe) – neigt/rollt mit dem Boot ----------
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, vb); ctx.clip();
    var sx = this.shake * 6 * (Math.sin(t * 53) + Math.sin(t * 31)) * 0.5;
    var sy = this.shake * 4 * (Math.cos(t * 47)) * 0.5;
    var stormAmp = this.storm ? 1.0 : 0.5;
    var bob = (Math.sin(t * 1.1) * 2.2 + Math.sin(t * 2.6) * 1.0) * stormAmp;
    var rollA = this.roll + Math.sin(t * 0.9) * 0.006 * stormAmp;   // Rollen ums untere Zentrum
    var pitchY = this.pitch * h;                                    // Nicken
    // Rotation um (w/2, vb), damit der Horizont kippt, das Cockpit aber fix bleibt
    ctx.translate(w / 2 + sx, vb + sy + bob + pitchY);
    ctx.rotate(rollA);
    ctx.translate(-w / 2, -vb);

    this._waterAndSky(ctx, t);
    this._waterGlints(ctx, t);
    this._drawGulls(ctx);

    var fog = ctx.createLinearGradient(0, hy - 18, 0, hy + 44);
    fog.addColorStop(0, 'rgba(220,232,245,0.18)'); fog.addColorStop(1, 'rgba(220,232,245,0)');
    ctx.fillStyle = fog; ctx.fillRect(-w*0.2, hy - 18, w*1.4, 64);

    if (this.harborActive) {
      var hyP = this._projY(this.harborZ), sc = this._scale(this.harborZ);
      ctx.fillStyle = 'rgba(201,162,75,0.9)'; ctx.fillRect(w/2 - 120*sc, hyP - 6*sc, 240*sc, 12*sc);
      ctx.fillStyle = '#F5F0E1'; ctx.font = (13*Math.max(sc,0.6)|0) + 'px system-ui,sans-serif'; ctx.textAlign='center';
      var hn = (this.region.harbors && this.region.harbors[0]) ? this.region.harbors[0].name : 'Zielpunkt';
      ctx.fillText('⚓ ' + hn, w/2, hyP - 12*sc);
    }

    // Safe-Lane / Navigationskorridor (dezent, grün) – zeigt den sicheren Kurs
    this._drawSafeLane(ctx, t);

    var sorted = this.obstacles.slice().sort(function (a, b) { return b.z - a.z; });
    for (var i = 0; i < sorted.length; i++) {
      var o = sorted[i];
      o.drawAt(ctx, this._projX(o.lane, o.z), this._projY(o.z), this._scale(o.z));
    }
    // Gefahr-Marker + Distanz-Labels für die nächsten relevanten Objekte (max 4)
    this._drawObstacleMarkers(ctx);
    if (this.opp) this.opp.draw(ctx, t);
    this._airLight(ctx, t);

    // EIGENES BOOT: sichtbarer Bug-Keil + Doppel-Bugwelle (Präsenz/Wasserverdrängung)
    (function(self){
      var bx = w/2 - self.playerLane * w * 0.06, by = vb + 6, bw = w * 0.30, bh = (vb-hy) * 0.16;
      ctx.save();
      // Rumpf-Bug (dunkler Keil von unten)
      var hull = ctx.createLinearGradient(0, by-bh, 0, by);
      hull.addColorStop(0,'rgba(10,22,38,0.0)'); hull.addColorStop(0.5,'rgba(10,22,38,0.55)'); hull.addColorStop(1,'rgba(6,14,26,0.95)');
      ctx.fillStyle=hull; ctx.beginPath(); ctx.moveTo(bx-bw, by); ctx.lineTo(bx, by-bh); ctx.lineTo(bx+bw, by); ctx.closePath(); ctx.fill();
      // Gold-Bugstreifen
      ctx.strokeStyle='rgba(201,162,75,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bx-bw*0.5, by-bh*0.5); ctx.lineTo(bx, by-bh); ctx.lineTo(bx+bw*0.5, by-bh*0.5); ctx.stroke();
      // Doppel-Bugwelle (Wasserverdrängung), Stärke nach Tempo
      var spd = Math.min(1, self.curSpeed/240), ww = bw*(0.7+spd*0.5);
      ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.35+spd*0.4;
      [-1,1].forEach(function(dir){ var g=ctx.createLinearGradient(bx,by-bh*0.4,bx+dir*ww,by+10);
        g.addColorStop(0,'rgba(255,255,255,0.0)'); g.addColorStop(0.6,'rgba(230,245,255,0.5)'); g.addColorStop(1,'rgba(230,245,255,0)');
        ctx.strokeStyle=g; ctx.lineWidth=3+spd*4; ctx.beginPath(); ctx.moveTo(bx,by-bh*0.35); ctx.quadraticCurveTo(bx+dir*ww*0.6, by-bh*0.1, bx+dir*ww, by+8+spd*10); ctx.stroke(); });
      ctx.restore();
    })(this);
    // Bug-Spray unten mittig
    var bowY = vb - 4;
    ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.min(1, this.curSpeed/260);
    var spray = ctx.createRadialGradient(w/2, bowY, 4, w/2, bowY, 80);
    spray.addColorStop(0,'rgba(255,255,255,0.5)'); spray.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = spray; ctx.beginPath(); ctx.ellipse(w/2 + Math.sin(t*8)*4, bowY, 72, 26, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    if (this.boat.boosting) {
      var bv = ctx.createRadialGradient(w/2, vb*0.5, vb*0.2, w/2, vb*0.5, vb*0.95);
      bv.addColorStop(0,'rgba(201,162,75,0)'); bv.addColorStop(1,'rgba(201,162,75,0.2)');
      ctx.fillStyle = bv; ctx.fillRect(-w*0.2,-h*0.12,w*1.4,vb+h*0.24);
    }
    if (this.flash > 0) { ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(201,70,47,'+(this.flash*0.5).toFixed(3)+')'; ctx.fillRect(-w*0.2,-h*0.12,w*1.4,vb+h*0.24); ctx.restore(); }
    ctx.restore(); // Ende Welt-Rotation/Clip

    // ---------- Tageszeit-Farbwelt über der Welt ----------
    var hr = new Date().getHours(), tint;
    if (hr < 7 || hr >= 21) tint = 'rgba(50,95,175,0.12)';
    else if (hr >= 18) tint = 'rgba(255,180,95,0.12)';
    else tint = 'rgba(255,228,150,0.07)';
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = tint; ctx.fillRect(0, 0, w, vb); ctx.restore();

    // Vignette über der ganzen Sicht (Tiefe)
    var vig = ctx.createRadialGradient(w/2, vb*0.45, vb*0.36, w/2, vb*0.45, vb*1.02);
    vig.addColorStop(0,'rgba(4,10,20,0)'); vig.addColorStop(0.7,'rgba(4,10,20,0)'); vig.addColorStop(1,'rgba(4,10,20,0.34)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,vb);

    // ---------- Cockpit-Vordergrund (fix, bewegt sich NICHT mit der Welt) ----------
    this._drawCockpit(ctx, t);
  };

  WB.World = World;
})(window.WB = window.WB || {});
