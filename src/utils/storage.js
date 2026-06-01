/* Wave Bite – Captain's Run · utils/storage.js
 * Robuste localStorage-Kapselung (später leicht auf IndexedDB/Backend umstellbar). */
(function (WB) {
  'use strict';
  var available = (function () {
    try {
      var k = '__wb_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  var mem = {}; // Fallback, falls localStorage gesperrt ist

  WB.storage = {
    available: available,
    get: function (key, fallback) {
      try {
        var raw = available ? window.localStorage.getItem(key) : mem[key];
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try {
        var raw = JSON.stringify(value);
        if (available) window.localStorage.setItem(key, raw); else mem[key] = raw;
        return true;
      } catch (e) { return false; }
    },
    remove: function (key) {
      try {
        if (available) window.localStorage.removeItem(key); else delete mem[key];
      } catch (e) {}
    }
  };
})(window.WB = window.WB || {});
