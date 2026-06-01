/* Wave Bite - Water Patrol · systems/assets.js
 * Bild-Asset-Loader. Quelle: window.WB.assetManifest (per Skript-Tag, kein fetch noetig).
 * Graceful: fehlt ein Asset, liefert get() ein nicht-fertiges Image -> Aufrufer pruefen ready(). */
(function (WB) {
  'use strict';
  var manifest = WB.assetManifest || { assets: [] };
  var srcById = {};
  for (var i = 0; i < manifest.assets.length; i++) srcById[manifest.assets[i].id] = manifest.assets[i].src;
  WB.A = WB.A || {};
  function resolve(id){ return (WB.A && WB.A[id]) ? WB.A[id] : srcById[id]; }

  var cache = {};

  function makeImg(src) {
    var img = new Image();
    img.decoding = 'async';
    img.src = src;
    return img;
  }

  var Assets = {
    has: function (id) { return !!(WB.A[id] || srcById[id]); },
    url: function (id) { return resolve(id) || null; },

    // Liefert (und cached) ein Image-Objekt. Kann noch laden -> ready() pruefen.
    get: function (id) {
      if (cache[id]) return cache[id];
      var src = resolve(id);
      if (!src) return null;
      cache[id] = makeImg(src);
      return cache[id];
    },

    ready: function (id) {
      var img = this.get(id);
      return !!(img && img.complete && img.naturalWidth > 0);
    },

    // Mehrere vorladen; cb() wenn alle (geladen oder fehlgeschlagen) durch sind.
    preload: function (ids, cb) {
      var pending = 0, done = false;
      function fin() { if (!done && pending === 0) { done = true; if (cb) cb(); } }
      for (var k = 0; k < ids.length; k++) {
        var src = resolve(ids[k]);
        if (!src) continue;
        if (this.ready(ids[k])) continue;
        pending++;
        var img = this.get(ids[k]);
        img.addEventListener('load', function () { pending--; fin(); });
        img.addEventListener('error', function () { pending--; fin(); });
      }
      fin();
    }
  };

  // Cover-fit-Zeichnen eines Bildes in ein Rechteck (wie CSS object-fit: cover).
  Assets.drawCover = function (ctx, img, x, y, w, h) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    var ir = img.naturalWidth / img.naturalHeight, rr = w / h, sw, sh, sx, sy;
    if (ir > rr) { sh = img.naturalHeight; sw = sh * rr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / rr; sx = 0; sy = (img.naturalHeight - sh) / 2; }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    return true;
  };

  WB.Assets = Assets;
})(window.WB = window.WB || {});
