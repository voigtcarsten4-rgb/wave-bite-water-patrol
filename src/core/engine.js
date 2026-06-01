/* Wave Bite – Captain's Run · core/engine.js
 * Canvas-Setup (DPR-aware, responsiv) + Game-Loop mit deltaTime. */
(function (WB) {
  'use strict';

  var Engine = {
    canvas: null, ctx: null, w: 0, h: 0, dpr: 1,
    _raf: null, _last: 0, _tick: null, _running: false,

    init: function (canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      var self = this;
      this._resize();
      window.addEventListener('resize', function () { self._resize(); });
      window.addEventListener('orientationchange', function () { setTimeout(function () { self._resize(); }, 200); });
    },

    _resize: function () {
      var parent = this.canvas.parentElement;
      var cssW = parent.clientWidth;
      var cssH = parent.clientHeight;
      // DPR auf 2 begrenzen → Performance auf High-DPI-Smartphones.
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = cssW; this.h = cssH;
      this.canvas.width = Math.round(cssW * this.dpr);
      this.canvas.height = Math.round(cssH * this.dpr);
      this.canvas.style.width = cssW + 'px';
      this.canvas.style.height = cssH + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },

    start: function (tickFn) {
      this._tick = tickFn;
      this._running = true;
      this._last = 0;
      var self = this;
      function loop(ts) {
        if (!self._running) return;
        if (!self._last) self._last = ts;
        var dt = (ts - self._last) / 1000;
        self._last = ts;
        if (dt > 0.05) dt = 0.05; // Cap gegen Sprünge nach Tab-Wechsel
        if (self._tick) self._tick(dt);
        self._raf = requestAnimationFrame(loop);
      }
      this._raf = requestAnimationFrame(loop);
    },

    stop: function () {
      this._running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null; this._last = 0;
    }
  };

  WB.Engine = Engine;
})(window.WB = window.WB || {});
