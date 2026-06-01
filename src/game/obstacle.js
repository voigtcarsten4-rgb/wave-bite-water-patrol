/* Wave Bite – Captain's Run · game/obstacle.js
 * Hindernisse mit Recycling-fähiger Struktur. Typen: buoy, rock, boat, log, gate. */
(function (WB) {
  'use strict';
  var M = WB.math;

  var SIZES = {
    buoy: { w: 22, h: 22 },
    rock: { w: 40, h: 34 },
    boat: { w: 38, h: 60 },
    log:  { w: 90, h: 20 },
    gate: { w: 26, h: 30 }   // einzelne Säule; Gate spawnt paarweise
  };

  function Obstacle(kind, x, y) {
    this.kind = kind;
    var s = SIZES[kind] || SIZES.rock;
    this.w = s.w; this.h = s.h;
    this.x = x; this.y = y;
    this.drift = (kind === 'boat') ? 60 : (kind === 'log' ? 0 : M.rand(-12, 12));
    this.phase = Math.random() * Math.PI * 2;
    this.dead = false;
  }

  Obstacle.prototype.update = function (dt, scrollSpeed) {
    // Bewegt sich mit dem Wasser nach unten; "boat" kommt entgegen → schneller.
    this.y += (scrollSpeed + this.drift) * dt;
    this.phase += dt * 2;
  };

  Obstacle.prototype.bounds = function () {
    // Etwas verkleinerte Hitbox = fairer.
    var pad = 4;
    return { x: this.x - this.w / 2 + pad, y: this.y - this.h / 2 + pad, w: this.w - pad * 2, h: this.h - pad * 2 };
  };

  Obstacle.prototype.draw = function (ctx) {
    var x = this.x, y = this.y;
    ctx.save();
    ctx.translate(x, y);
    switch (this.kind) {
      case 'buoy':
        ctx.fillStyle = '#C9462F';
        ctx.beginPath(); ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F5F0E1';
        ctx.beginPath(); ctx.arc(0, 0, this.w / 4, 0, Math.PI * 2); ctx.fill();
        break;
      case 'rock':
        ctx.fillStyle = '#42525E';
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, 2);
        ctx.lineTo(-this.w / 4, -this.h / 2);
        ctx.lineTo(this.w / 5, -this.h / 3);
        ctx.lineTo(this.w / 2, this.h / 4);
        ctx.lineTo(0, this.h / 2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(0, this.h / 2, this.w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'boat':
        ctx.fillStyle = '#34506B';
        M.roundRect(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 10); ctx.fill();
        ctx.fillStyle = 'rgba(245,240,225,0.85)';
        M.roundRect(ctx, -this.w / 2 + 7, -this.h / 6, this.w - 14, this.h * 0.4, 5); ctx.fill();
        break;
      case 'log':
        ctx.fillStyle = '#6B4A2E';
        M.roundRect(ctx, -this.w / 2, -this.h / 2, this.w, this.h, this.h / 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-this.w / 2 + 8, 0); ctx.lineTo(this.w / 2 - 8, 0); ctx.stroke();
        break;
      case 'gate':
        ctx.fillStyle = '#1E3A52';
        M.roundRect(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 4); ctx.fill();
        ctx.fillStyle = '#C9A24B';
        M.roundRect(ctx, -this.w / 2, -this.h / 2, this.w, 6, 3); ctx.fill();
        break;
      default:
        ctx.fillStyle = '#42525E';
        ctx.beginPath(); ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  WB.Obstacle = Obstacle;
})(window.WB = window.WB || {});
