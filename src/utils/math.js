/* Wave Bite – Captain's Run · utils/math.js
 * Kleine, abhängigkeitsfreie Mathe-Helfer. */
(function (WB) {
  'use strict';
  WB.math = {
    clamp: function (v, min, max) { return v < min ? min : (v > max ? max : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    rand: function (min, max) { return min + Math.random() * (max - min); },
    randInt: function (min, max) { return Math.floor(min + Math.random() * (max - min + 1)); },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    dist: function (x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); },
    aabb: function (a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },
    roundRect: function (ctx, x, y, w, h, r) {
      if (r > w / 2) r = w / 2; if (r > h / 2) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  };
})(window.WB = window.WB || {});
