/* Wave Bite – Water Patrol · game/boat.js
 * Spieler-Boot: Steuerung, Boost-Ökonomie, Hüllen-Integrität.
 * Render: cineastischer Premium-Look – lebendige Kielwasser-Spur, geschwindigkeits-
 * skalierte Bugwelle/Gischt, plastischer Rumpf mit Licht/Schatten, Boost-Abgasglühen. */
(function (WB) {
  'use strict';
  var M = WB.math;

  function Boat(stats) {
    this.stats = stats;
    this.w = 38; this.h = 64;
    this.x = 0; this.y = 0;       // wird von World gesetzt
    this.vx = 0;                  // laterale Geschwindigkeit
    this.tilt = 0;                // visuelle Neigung (Roll)
    this.pitch = 0;              // visuelles Stampfen (Pitch) nach Speed
    this.boostMeter = 1;          // 0..1
    this.boosting = false;
    this.integrity = 1;           // 0..1 (Hülle / Cargo-Zustand)
    this.fuel = 1;                // 0..1 (Treibstoff)
    this.cargoHits = 0;
    this.invuln = 0;              // kurze Unverwundbarkeit nach Treffer
    this.wake = [];              // Kielwasser-Partikel
    this._emit = 0;             // Emitter-Akkumulator
    this._spd = 0;              // geglättete Fahrt 0..1 (für Render)
  }

  Boat.prototype.reset = function (x, y) {
    this.x = x; this.y = y; this.vx = 0; this.tilt = 0; this.pitch = 0;
    this.boostMeter = 1; this.boosting = false; this.integrity = 1; this.fuel = 1;
    this.cargoHits = 0; this.invuln = 0; this.wake.length = 0; this._emit = 0; this._spd = 0;
  };

  // Forward-Speed (Scroll px/s) abhängig von Stats, Gas, Boost, Treibstoff.
  Boat.prototype.targetSpeed = function (input) {
    var cruise = 95 + this.stats.speed * 11;
    var t = cruise * 0.82;                       // Leerlauf-Gleiten (Trägheit)
    if (input.throttle && this.fuel > 0.02) t = cruise * 1.55;
    if (this.boosting) t *= 1.7;
    return t;
  };
  Boat.prototype.forwardSpeed = function () {
    if (this.speed == null) this.speed = 95 + this.stats.speed * 11;
    return this.speed;                            // geglättete Fahrt (siehe update)
  };

  Boat.prototype.update = function (dt, input, worldLeft, worldRight) {
    if (this.invuln > 0) this.invuln -= dt;

    // Boost-Logik: Verbrauch/Regeneration skaliert mit Boost-Stat.
    var drain = 0.55 - this.stats.boost * 0.022;
    var regen = 0.18 + this.stats.boost * 0.018;
    this.boosting = input.boost && this.boostMeter > 0.02 && this.fuel > 0.02;
    if (this.boosting) { this.boostMeter -= drain * dt; if (this.boostMeter < 0) this.boostMeter = 0; }
    else { this.boostMeter += regen * dt; if (this.boostMeter > 1) this.boostMeter = 1; }

    // Treibstoff
    var burn = 0; if (input.throttle) burn += 0.045; if (this.boosting) burn += 0.075;
    if (burn > 0) { this.fuel -= burn * dt; if (this.fuel < 0) this.fuel = 0; }
    else { this.fuel += 0.02 * dt; if (this.fuel > 1) this.fuel = 1; }

    // Beschleunigung / Bremsen mit Trägheit – Fahrtgefühl
    if (this.speed == null) this.speed = 95 + this.stats.speed * 11;
    var tgt = this.targetSpeed(input);
    var arate = (tgt > this.speed ? (1.5 + this.stats.boost * 0.08) : 2.8);
    this.speed += (tgt - this.speed) * Math.min(1, arate * dt);

    // Laterale Steuerung
    var maxLat = 95 + this.stats.handling * 15;
    var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    var targetVx = dir * maxLat * (this.boosting ? 1.25 : 1);
    var ease = 1 - Math.pow(0.0015, dt);
    this.vx = M.lerp(this.vx, targetVx, ease);
    this.x += this.vx * dt;
    this.x = M.clamp(this.x, worldLeft + this.w / 2, worldRight - this.w / 2);

    // Roll (Kurvenlage) + Pitch (Bug hebt bei Tempo)
    this.tilt = M.lerp(this.tilt, (this.vx / maxLat) * 0.4, 1 - Math.pow(0.001, dt));
    var spd = (input.throttle ? 0.7 : 0.4) + (this.boosting ? 0.45 : 0);
    this._spd = M.lerp(this._spd, M.clamp(spd, 0, 1), 1 - Math.pow(0.004, dt));
    this.pitch = M.lerp(this.pitch, this._spd * 0.10, 1 - Math.pow(0.002, dt));

    // --- Kielwasser-Emitter (lebendige Spur hinter dem Heck) ---
    var rate = 26 + this._spd * 70;        // Partikel/s
    this._emit += rate * dt;
    var stern = this.h / 2 - 4;
    while (this._emit >= 1) {
      this._emit -= 1;
      var side = (Math.random() - 0.5) * (this.w * 0.8);
      this.wake.push({
        x: this.x + side - this.vx * 0.05,
        y: this.y + stern,
        vx: side * 0.6 + (Math.random() - 0.5) * 14,
        vy: 36 + this._spd * 120 + Math.random() * 24,   // driftet nach unten (Heck) = Fahrtgefühl
        life: 0, max: 0.7 + Math.random() * 0.5,
        r: 2 + Math.random() * 3.2,
        foam: Math.random() < 0.5
      });
    }
    if (this.wake.length > 90) this.wake.splice(0, this.wake.length - 90);
    for (var i = this.wake.length - 1; i >= 0; i--) {
      var p = this.wake[i];
      p.life += dt;
      if (p.life >= p.max) { this.wake.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; p.r += 9 * dt;
    }
  };

  Boat.prototype.hit = function (kind) {
    if (this.invuln > 0) return false;
    var resist = this.stats.stability / 10;
    var dmg = (kind === 'boat' || kind === 'gate') ? 0.34 : 0.22;
    dmg *= (1.1 - resist * 0.7);
    this.integrity -= dmg;
    if (this.integrity < 0) this.integrity = 0;
    this.cargoHits += 1;
    this.vx *= -0.35;
    this.boostMeter = Math.max(0, this.boostMeter - 0.25);
    this.invuln = 0.7;
    if (WB.Audio && WB.Audio.hit) WB.Audio.hit();
    return true;
  };

  Boat.prototype.bounds = function () {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  };

  // Kielwasser separat VOR dem Rumpf zeichnen (Welt-Koordinaten, nicht rotiert).
  Boat.prototype.drawWake = function (ctx, t) {
    ctx.save();
    for (var i = 0; i < this.wake.length; i++) {
      var p = this.wake[i];
      var k = 1 - p.life / p.max;
      var a = (p.foam ? 0.42 : 0.22) * k;
      ctx.fillStyle = p.foam ? 'rgba(236,245,255,' + a.toFixed(3) + ')' : 'rgba(201,162,75,' + (a * 0.7).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  Boat.prototype.draw = function (ctx, t) {
    var x = this.x, y = this.y, w = this.w, h = this.h;
    var scale = 1 - this.pitch * 0.6;       // Pitch staucht die Silhouette minimal

    // Bug-Gischt + Boost-Abgas (vor dem Rumpf, Weltkoordinaten)
    var spd = this._spd;
    if (spd > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.10 + spd * 0.22;
      var spray = ctx.createRadialGradient(x, y - h / 2, 2, x, y - h / 2, 26 + spd * 26);
      spray.addColorStop(0, 'rgba(255,255,255,0.9)');
      spray.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = spray;
      ctx.beginPath();
      ctx.arc(x + Math.sin(t * 9) * 2, y - h / 2 - 4, 22 + spd * 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (this.boosting) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var ex = ctx.createRadialGradient(x, y + h / 2 + 6, 2, x, y + h / 2 + 6, 30);
      ex.addColorStop(0, 'rgba(201,162,75,0.55)');
      ex.addColorStop(0.5, 'rgba(231,206,139,0.22)');
      ex.addColorStop(1, 'rgba(201,162,75,0)');
      ctx.fillStyle = ex;
      ctx.beginPath();
      ctx.arc(x, y + h / 2 + 10 + Math.sin(t * 22) * 3, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.tilt);
    ctx.scale(1, scale);

    // Weicher Kontaktschatten unter dem Rumpf
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(2, h / 2 - 6, w / 2, h / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bugwelle / Kielwasser-Keil direkt am Heck (skaliert mit Tempo)
    ctx.save();
    ctx.globalAlpha = 0.5;
    var spread = 8 + spd * 14;
    var len = 46 + spd * 40;
    var bw = ctx.createLinearGradient(0, h / 2, 0, h / 2 + len);
    bw.addColorStop(0, 'rgba(255,255,255,0.34)');
    bw.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bw;
    ctx.beginPath();
    ctx.moveTo(-w / 2, h / 2 - 4);
    ctx.lineTo(w / 2, h / 2 - 4);
    ctx.lineTo(w / 2 + spread, h / 2 + len + Math.sin(t * 6) * 3);
    ctx.lineTo(-w / 2 - spread, h / 2 + len + Math.cos(t * 6) * 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = (this.invuln > 0 && Math.floor(t * 20) % 2 === 0) ? 0.4 : 1;

    // Rumpf mit plastischem Verlauf (Längslicht von links)
    var hull = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    hull.addColorStop(0, shade(this.stats.color, -0.30));
    hull.addColorStop(0.45, this.stats.color);
    hull.addColorStop(1, shade(this.stats.color, 0.18));
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 4, w / 2 - 3, h / 4);
    ctx.lineTo(w / 2 - 6, h / 2);
    ctx.lineTo(-w / 2 + 6, h / 2);
    ctx.quadraticCurveTo(-w / 2 + 3, h / 4, -w / 2, -h / 4);
    ctx.quadraticCurveTo(-w / 4, -h / 2, 0, -h / 2);
    ctx.closePath();
    ctx.fill();

    // Bug-Glanzkante (Kammlicht am Steven)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2 + 1);
    ctx.quadraticCurveTo(w / 2 - 4, -h / 4, w / 2 - 4, h / 8);
    ctx.stroke();

    // Deck (Glas/Creme) mit feinem Verlauf
    var deck = ctx.createLinearGradient(0, -h / 4, 0, h / 4);
    deck.addColorStop(0, 'rgba(250,246,235,0.96)');
    deck.addColorStop(1, 'rgba(225,218,200,0.92)');
    ctx.fillStyle = deck;
    M.roundRect(ctx, -w / 2 + 9, -h / 4, w - 18, h * 0.5, 6);
    ctx.fill();

    // Goldene Zierlinie (Mittelnaht)
    ctx.strokeStyle = '#C9A24B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2 + 4);
    ctx.lineTo(0, h / 2 - 6);
    ctx.stroke();

    // Cockpit-Kuppel (Glas mit Reflex)
    var dome = ctx.createRadialGradient(-2, -h / 8 - 2, 1, 0, -h / 8, 7);
    dome.addColorStop(0, '#15406b');
    dome.addColorStop(1, '#0B1E3B');
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.arc(0, -h / 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(-1.6, -h / 8 - 1.6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helligkeit eines Hex-/Named-Farbwerts verschieben (k in -1..1).
  function shade(col, k) {
    var c = parseHex(col);
    if (!c) return col;
    var f = k < 0 ? 0 : 255, p = k < 0 ? -k : k;
    var r = Math.round((f - c[0]) * p + c[0]);
    var g = Math.round((f - c[1]) * p + c[1]);
    var b = Math.round((f - c[2]) * p + c[2]);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function parseHex(col) {
    if (typeof col !== 'string') return null;
    var m = col.replace('#', '');
    if (m.length === 3) m = m[0] + m[0] + m[1] + m[1] + m[2] + m[2];
    if (m.length !== 6) return null;
    var n = parseInt(m, 16);
    if (isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  WB.Boat = Boat;
})(window.WB = window.WB || {});
