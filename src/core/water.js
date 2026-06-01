/* Wave Bite – Captain's Run · core/water.js
 * Cineastische, ruhige Premium-Wasserfläche:
 * Navy-Tiefenverlauf + Horizontschimmer + driftender Sonnen-Glint
 * + zwei Parallax-Wellenebenen mit Kammlicht + lebendige Glanzpartikel.
 * Reine Canvas-2D-Operationen, keine externen Abhängigkeiten, identische draw()-Signatur. */
(function (WB) {
  'use strict';

  function Water() {
    this.sparkles = [];
    this._w = 0; this._h = 0;
  }

  Water.prototype.ensureSparkles = function (w, h) {
    if (this.sparkles.length && this._w === w && this._h === h) return;
    this.sparkles.length = 0;
    this._w = w; this._h = h;
    var n = 34;
    for (var i = 0; i < n; i++) {
      this.sparkles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.7,
        p: Math.random() * Math.PI * 2,
        s: 0.35 + Math.random() * 0.9,
        gold: Math.random() < 0.55
      });
    }
  };

  // Eine Ebene sanfter, nach unten scrollender Wellenlinien mit Kammlicht.
  Water.prototype._waveLayer = function (ctx, w, h, t, scroll, spacing, speed, amp, baseAlpha) {
    var offset = (scroll * speed) % spacing;
    for (var y = -spacing; y < h + spacing; y += spacing) {
      var yy = y + offset;
      var depth = Math.sin((yy / h) * Math.PI);            // 0 am Rand, 1 in der Mitte
      var alpha = baseAlpha + baseAlpha * 0.8 * depth;
      // Wellenlinie
      ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 16) {
        var wave = Math.sin((x * 0.028) + (yy * 0.05) + t * 1.4) * amp;
        if (x === 0) ctx.moveTo(x, yy + wave); else ctx.lineTo(x, yy + wave);
      }
      ctx.stroke();
      // Kammlicht (heller Glanz knapp oberhalb der Linie) – gibt Volumen
      ctx.strokeStyle = 'rgba(220,235,255,' + (alpha * 0.5).toFixed(3) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (var x2 = 0; x2 <= w; x2 += 16) {
        var wave2 = Math.sin((x2 * 0.028) + (yy * 0.05) + t * 1.4) * amp;
        if (x2 === 0) ctx.moveTo(x2, yy + wave2 - 1.4); else ctx.lineTo(x2, yy + wave2 - 1.4);
      }
      ctx.stroke();
    }
  };

  // ctx, w, h logisch; t Sekunden; scroll = zurückgelegte Strecke; region für Farben
  Water.prototype.draw = function (ctx, w, h, t, scroll, region) {
    var top = region ? region.waterTop : '#0B1E3B';
    var bottom = region ? region.waterBottom : '#123A63';

    // 1) Tiefenverlauf (Navy oben → tieferes Blau unten)
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, top);
    grad.addColorStop(0.55, bottom);
    grad.addColorStop(1, top);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2) Horizontschimmer – weiches Licht im oberen Drittel (Himmel-Reflexion)
    ctx.save();
    var horiz = ctx.createLinearGradient(0, 0, 0, h * 0.42);
    horiz.addColorStop(0, 'rgba(180,205,235,0.10)');
    horiz.addColorStop(1, 'rgba(180,205,235,0)');
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 0, w, h * 0.42);
    ctx.restore();

    // 3) Driftender Sonnen-Glint – elongierter Lichtpfad, der sanft pendelt
    ctx.save();
    var gx = w * (0.5 + 0.16 * Math.sin(t * 0.18));
    var gy = h * 0.30;
    var glint = ctx.createRadialGradient(gx, gy, 2, gx, gy, w * 0.42);
    var gA = 0.10 + 0.04 * Math.sin(t * 0.9);
    glint.addColorStop(0, 'rgba(201,162,75,' + gA.toFixed(3) + ')');
    glint.addColorStop(0.4, 'rgba(201,162,75,' + (gA * 0.4).toFixed(3) + ')');
    glint.addColorStop(1, 'rgba(201,162,75,0)');
    ctx.fillStyle = glint;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 4) Zwei Parallax-Wellenebenen (fern: enger & langsamer · nah: weiter & schneller)
    ctx.save();
    this._waveLayer(ctx, w, h, t * 0.85, scroll, 58, 0.9, 2.2, 0.035); // ferne Ebene
    this._waveLayer(ctx, w, h, t,        scroll, 44, 1.25, 3.4, 0.05);  // nahe Ebene
    ctx.restore();

    // 5) Glanzpartikel – ruhiges Funkeln mit Größen-Puls (gold/weiß gemischt)
    this.ensureSparkles(w, h);
    ctx.save();
    for (var i = 0; i < this.sparkles.length; i++) {
      var sp = this.sparkles[i];
      sp.y += sp.s * 14 * 0.016;
      if (sp.y > h) { sp.y = -2; sp.x = Math.random() * w; }
      var tw = 0.5 + 0.5 * Math.sin(t * 1.6 + sp.p);   // Twinkle 0..1
      var a = 0.06 + 0.16 * tw;
      var rr = sp.r * (0.7 + 0.5 * tw);
      ctx.fillStyle = sp.gold
        ? 'rgba(201,162,75,' + a.toFixed(3) + ')'
        : 'rgba(225,238,255,' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  WB.Water = Water;
})(window.WB = window.WB || {});
