/* Wave Bite – Water Patrol · game/obstacle.js
 * FORWARD PATROL VIEW: Wasser-Verkehr & Gefahren in Tiefe (z). Welt projiziert sie perspektivisch.
 * Typen: buoy, rock, log, sail, motor, sup, houseboat, swimmer, ferry, gate.
 * z: 1 = fern am Horizont, 0 = an der Kamera. lane: -1..1 seitlich. */
(function (WB) {
  'use strict';
  var M = WB.math;

  // halbe Trefferbreite (in lane-Einheiten) je Typ – große Boote breiter
  var HIT = { buoy:0.10, rock:0.12, log:0.16, sail:0.16, motor:0.15, sup:0.10, houseboat:0.22, swimmer:0.09, ferry:0.26, gate:0.13 };

  function Obstacle(kind, lane, z) {
    this.kind = kind; this.lane = lane; this.z = (z == null ? 1 : z);
    this.drift = (kind === 'motor' || kind === 'sail') ? (Math.random() - 0.5) * 0.10 : (Math.random() - 0.5) * 0.03;
    this.phase = Math.random() * Math.PI * 2;
    this.counted = false; this.dead = false;
    this.hitW = HIT[kind] || 0.13;
  }

  Obstacle.prototype.update = function (dt, zRate) {
    this.z -= zRate * dt;
    this.lane += this.drift * dt;           // leichte Eigenbewegung
    this.phase += dt * 2;
    if (this.z <= -0.05) this.dead = true;
  };

  // Zeichnet das Objekt an Bildschirmposition (x,y) mit Skalierung s (1 ≈ nah).
  Obstacle.prototype.drawAt = function (ctx, x, y, s) {
    if (s <= 0.02) return;
    ctx.save();
    ctx.translate(x, y);
    // Kontaktschatten / Wasserkontakt
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#04101e';
    ctx.beginPath(); ctx.ellipse(0, 10 * s, 26 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    switch (this.kind) {
      case 'buoy':
        ctx.fillStyle = '#C9462F'; ctx.beginPath(); ctx.arc(0, 0, 9 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F5F0E1'; ctx.beginPath(); ctx.arc(0, 0, 4.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7A1E12'; ctx.fillRect(-1.5 * s, -16 * s, 3 * s, 8 * s); break;
      case 'rock':
        ctx.fillStyle = '#42525E'; ctx.beginPath();
        ctx.moveTo(-16 * s, 4 * s); ctx.lineTo(-7 * s, -10 * s); ctx.lineTo(6 * s, -7 * s); ctx.lineTo(16 * s, 6 * s); ctx.lineTo(0, 12 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(0, 11 * s, 16 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill(); break;
      case 'log':
        ctx.fillStyle = '#6B4A2E'; M.roundRect(ctx, -34 * s, -7 * s, 68 * s, 14 * s, 7 * s); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(-26 * s, 0); ctx.lineTo(26 * s, 0); ctx.stroke(); break;
      case 'sail':
        ctx.fillStyle = '#1E3A52'; M.roundRect(ctx, -16 * s, -2 * s, 32 * s, 12 * s, 4 * s); ctx.fill(); // hull
        ctx.fillStyle = '#F5F0E1'; ctx.beginPath(); ctx.moveTo(0, -42 * s); ctx.lineTo(0, -2 * s); ctx.lineTo(16 * s, -2 * s); ctx.closePath(); ctx.fill(); // sail
        ctx.fillStyle = 'rgba(201,162,75,.9)'; ctx.fillRect(-1 * s, -44 * s, 2 * s, 44 * s); break; // mast
      case 'motor':
        ctx.fillStyle = '#34506B'; M.roundRect(ctx, -20 * s, -8 * s, 40 * s, 22 * s, 8 * s); ctx.fill();
        ctx.fillStyle = 'rgba(245,240,225,.9)'; M.roundRect(ctx, -12 * s, -4 * s, 24 * s, 11 * s, 4 * s); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-20 * s, 12 * s, 40 * s, 3 * s); break; // bow wave
      case 'sup':
        ctx.fillStyle = '#E7CE8B'; M.roundRect(ctx, -22 * s, -4 * s, 44 * s, 9 * s, 4 * s); ctx.fill(); // board
        ctx.fillStyle = '#2A3B4A'; ctx.fillRect(-2 * s, -22 * s, 4 * s, 22 * s); // person
        ctx.beginPath(); ctx.arc(0, -26 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(6 * s, -30 * s); ctx.lineTo(6 * s, -2 * s); ctx.stroke(); break;
      case 'houseboat':
        ctx.fillStyle = '#5E7C8B'; M.roundRect(ctx, -34 * s, -4 * s, 68 * s, 22 * s, 6 * s); ctx.fill(); // hull
        ctx.fillStyle = '#F0EAD6'; M.roundRect(ctx, -26 * s, -26 * s, 52 * s, 24 * s, 4 * s); ctx.fill(); // cabin
        ctx.fillStyle = '#7A5A33'; ctx.fillRect(-30 * s, -32 * s, 60 * s, 8 * s); // roof
        ctx.fillStyle = '#2A3B4A'; for (var i=-1;i<=1;i++){ ctx.fillRect((i*14-3)*s, -20*s, 6*s, 8*s);} break; // windows
      case 'swimmer':
        ctx.fillStyle = '#E8B04B'; ctx.beginPath(); ctx.arc(0, 0, 6 * s, 0, Math.PI * 2); ctx.fill(); // cap
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.ellipse(0, 2 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2); ctx.stroke(); break;
      case 'ferry':
        ctx.fillStyle = '#2C4A63'; M.roundRect(ctx, -42 * s, -6 * s, 84 * s, 26 * s, 6 * s); ctx.fill();
        ctx.fillStyle = '#F0EAD6'; M.roundRect(ctx, -36 * s, -24 * s, 72 * s, 20 * s, 4 * s); ctx.fill();
        ctx.fillStyle = '#1E3A52'; for (var k=-2;k<=2;k++){ ctx.fillRect((k*14-4)*s, -19*s, 8*s, 9*s);} 
        ctx.fillStyle = '#C9A24B'; ctx.fillRect(-42 * s, 16 * s, 84 * s, 3 * s); break;
      case 'gate':
        ctx.fillStyle = '#1E3A52'; M.roundRect(ctx, -8 * s, -34 * s, 16 * s, 48 * s, 4 * s); ctx.fill();
        ctx.fillStyle = '#C9A24B'; M.roundRect(ctx, -8 * s, -34 * s, 16 * s, 6 * s, 3 * s); ctx.fill(); break;
      default:
        ctx.fillStyle = '#42525E'; ctx.beginPath(); ctx.arc(0, 0, 9 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  WB.Obstacle = Obstacle;
})(window.WB = window.WB || {});
