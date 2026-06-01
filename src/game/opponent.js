/* Wave Bite – Water Patrol · game/opponent.js
 * Animierter KI-Gegner (fliehendes/ausweichendes Boot) für Verfolgungs-Einsätze.
 * Webt seitlich übers Wasser, flieht abhängig von der adaptiven Schwierigkeit (WB.AI).
 * Der Spieler holt auf, indem er Gas/Boost gibt UND seitlich auf einer Linie bleibt.
 * gap: 1 = weit weg / kurz vorm Entkommen, 0 = gestellt. */
(function (WB) {
  'use strict';
  var M = WB.math;

  var CFG = {
    pursuit:  { gap: 0.80, flee: 0.118, weave: 1.00, freq: 1.05, label: 'Verdächtiges Schnellboot' },
    smuggler: { gap: 0.82, flee: 0.122, weave: 1.00, freq: 1.15, label: 'Schmugglerboot' },
    eco:      { gap: 0.70, flee: 0.076, weave: 0.70, freq: 0.85, label: 'Verursacher' },
    control:  { gap: 0.55, flee: 0.050, weave: 0.45, freq: 0.60, label: 'Zielboot' },
    rescue:   { gap: 0.62, flee: 0.044, weave: 0.50, freq: 0.55, label: 'Person im Wasser' }
  };

  function Opponent(world, mission, region) {
    this.world = world;
    var c = CFG[mission.type] || { gap: 0.7, flee: 0.08, weave: 0.8, freq: 0.9, label: 'Ziel' };
    this.cfg = c;
    this.gap = c.gap;
    this.phase = Math.random() * Math.PI * 2;
    this.x = (world.left + world.right) / 2;
    this.spriteId = (mission.type === 'rescue') ? null : 'boat_speedboat_side_1';
    this.caught = false; this.escaped = false; this.d = 0.4;
    this.label = c.label;
  }

  Opponent.prototype.update = function (dt, input, boat) {
    var d = (WB.AI ? WB.AI.difficulty(this.world) : 0.4);
    this.d = d;
    var lane = (this.world.right - this.world.left);
    var cx = (this.world.left + this.world.right) / 2;
    // Ausweich-Manöver: Hauptschwung + feiner Gegenschwung (wirkt "lebendig")
    var amp = lane * 0.42 * this.cfg.weave * (0.5 + d * 0.6);
    this.phase += dt * (this.cfg.freq * (0.7 + d * 1.1));
    this.x = cx + Math.sin(this.phase) * amp + Math.sin(this.phase * 2.3) * amp * 0.16;
    this.x = M.clamp(this.x, this.world.left + 24, this.world.right - 24);
    // Abstand: Gegner zieht weg (flee), Spieler holt auf (Schub × Ausrichtung)
    var flee = this.cfg.flee * (0.6 + d * 0.9);
    var thrust = (input.throttle ? 1 : 0.4) + (boat.boosting ? 0.9 : 0);
    var align = 1 - Math.min(1, Math.abs(this.x - boat.x) / (lane * 0.5));
    var close = thrust * 0.17 * (0.4 + align * 0.85);
    this.gap += (flee - close) * dt;
    if (this.gap <= 0) { this.gap = 0; this.caught = true; }
    else if (this.gap >= 1) { this.gap = 1; this.escaped = true; }
  };

  Opponent.prototype.draw = function (ctx, t) {
    var top = this.world.dashTop;
    var y = top * 0.30 + (1 - this.gap) * (top * 0.50);   // näher = weiter unten
    var scale = 0.5 + (1 - this.gap) * 1.05;
    var x = this.x;

    // Wasserspur unter dem Gegner
    ctx.save(); ctx.globalAlpha = 0.30; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x, y + 24 * scale, 24 * scale, 6 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Boot (Sprite oder prozedural)
    var spr = (this.spriteId && WB.Assets) ? WB.Assets.get(this.spriteId) : null;
    if (spr && spr.complete && spr.naturalWidth) {
      var bw = 70 * scale, bh = bw * (spr.naturalHeight / spr.naturalWidth);
      ctx.save(); ctx.globalAlpha = 0.97; ctx.drawImage(spr, x - bw / 2, y - bh / 2, bw, bh); ctx.restore();
    } else {
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = this.spriteId ? '#34506B' : '#C9462F';
      M.roundRect(ctx, -18 * scale, -25 * scale, 36 * scale, 50 * scale, 9 * scale); ctx.fill();
      ctx.fillStyle = 'rgba(245,240,225,0.85)';
      M.roundRect(ctx, -12 * scale, -7 * scale, 24 * scale, 16 * scale, 4 * scale); ctx.fill();
      ctx.restore();
    }

    // Ziel-Reticle (rot) + Distanz-Label – wie im Cockpit-Referenzbild
    var rw = 52 * scale, rh = 40 * scale, rx = x - rw / 2, ry = y - rh / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(201,70,47,0.92)'; ctx.lineWidth = 2;
    var k = 9;
    // vier Eck-Winkel
    ctx.beginPath();
    ctx.moveTo(rx, ry + k); ctx.lineTo(rx, ry); ctx.lineTo(rx + k, ry);
    ctx.moveTo(rx + rw - k, ry); ctx.lineTo(rx + rw, ry); ctx.lineTo(rx + rw, ry + k);
    ctx.moveTo(rx + rw, ry + rh - k); ctx.lineTo(rx + rw, ry + rh); ctx.lineTo(rx + rw - k, ry + rh);
    ctx.moveTo(rx + k, ry + rh); ctx.lineTo(rx, ry + rh); ctx.lineTo(rx, ry + rh - k);
    ctx.stroke();
    ctx.fillStyle = '#F5F0E1';
    ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('▲ ' + Math.round(this.gap * 300) + ' m', x, ry - 6);
    ctx.restore();
  };

  WB.Opponent = Opponent;
})(window.WB = window.WB || {});
