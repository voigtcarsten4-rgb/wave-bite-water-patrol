/* Wave Bite – Captain's Run · data/upgrades.js · Upgrade-Tracks */
(function (WB) {
  'use strict';
  var U = WB.models.Upgrade;
  WB.data = WB.data || {};
  WB.data.upgrades = [
    U({ id: 'motor',  name: 'Motor',      track: 'motor',  affects: 'speed',     perLevel: 0.6, maxLevel: 3, baseCost: 200 }),
    U({ id: 'rudder', name: 'Ruder',      track: 'rudder', affects: 'handling',  perLevel: 0.6, maxLevel: 3, baseCost: 200 }),
    U({ id: 'boost',  name: 'Boost-Zelle', track: 'boost', affects: 'boost',     perLevel: 0.6, maxLevel: 3, baseCost: 250 }),
    U({ id: 'hull',   name: 'Rumpf',      track: 'hull',   affects: 'stability', perLevel: 0.6, maxLevel: 3, baseCost: 250 })
  ];
  // Kosten steigen pro Stufe progressiv.
  WB.data.upgradeCost = function (upg, currentLevel) {
    return Math.round(upg.baseCost * Math.pow(1.8, currentLevel));
  };
})(window.WB = window.WB || {});
