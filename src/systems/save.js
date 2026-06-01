/* Wave Bite – Captain's Run · systems/save.js
 * Lädt/speichert SaveGame, kapselt Migration und Defaults. */
(function (WB) {
  'use strict';
  var KEY = 'wavebite.captainsrun.save';

  function migrate(data) {
    if (!data || typeof data !== 'object') return WB.models.SaveGame();
    // Schema-Migrationen nach Version – aktuell nur v1.
    if (data.version !== WB.models.SCHEMA_VERSION) {
      data = WB.models.SaveGame(data); // füllt fehlende Felder mit Defaults
    }
    // Rang-Fortschritt sicherstellen (Migration).
    if (data.highestRankIndex == null) data.highestRankIndex = 0;
    if (!data.story) data.story = { chapter: 0, completed: [] };
    // Sicherstellen, dass das Startboot besessen ist.
    if (!data.ownedBoats || !data.ownedBoats[data.selectedBoatId]) {
      data.ownedBoats = data.ownedBoats || {};
      if (!data.ownedBoats.angelboot) data.ownedBoats.angelboot = { upgrades: { motor: 0, rudder: 0, boost: 0, hull: 0 } };
      data.selectedBoatId = data.selectedBoatId || 'angelboot';
    }
    return data;
  }

  var Save = {
    data: null,
    load: function () {
      var raw = WB.storage.get(KEY, null);
      this.data = migrate(raw || WB.models.SaveGame());
      return this.data;
    },
    save: function () {
      if (!this.data) return;
      this.data.lastPlayed = Date.now();
      WB.storage.set(KEY, this.data);
    },
    reset: function () {
      WB.storage.remove(KEY);
      this.data = WB.models.SaveGame();
      this.save();
      return this.data;
    },
    ownsBoat: function (id) { return !!(this.data.ownedBoats && this.data.ownedBoats[id]); },
    addBoat: function (id) {
      if (!this.ownsBoat(id)) {
        this.data.ownedBoats[id] = { upgrades: { motor: 0, rudder: 0, boost: 0, hull: 0 } };
        this.save();
      }
    }
  };

  WB.Save = Save;
})(window.WB = window.WB || {});
