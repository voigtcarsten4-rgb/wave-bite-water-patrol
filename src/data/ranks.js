/* Wave Bite - Water Patrol · data/ranks.js
 * Rangsystem "Wave Region Water Patrol": 10 Stufen Deckhand -> Legend of the Waters.
 * Drei Laufbahngruppen steuern die SVG-Schulterklappe (systems/rank.js):
 *   motif 'bar' (Crew) | 'star' (Officer/Command) · braid = goldene Kordel (Command).
 */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};

  var T1 = { tier: 1, tierName: 'Crew', field: '#1f3b2e', cord: '#9fb7a6', mark: '#D7DEE6' };
  var T2 = { tier: 2, tierName: 'Officer', field: '#15314f', cord: '#9fb0c4', mark: '#E9EEF5' };
  var T3 = { tier: 3, tierName: 'Command', field: '#2a2034', cord: '#E7CE8B', mark: '#F2D98A' };

  function R(o) { return o; }

  WB.data.ranks = [
    R({ id: 'deckhand',  name: 'Deckhand',            short: 'DKH', t: T1, motif: 'bar',  marks: 0, braid: false, rp: 0 }),
    R({ id: 'junior',    name: 'Junior Patrol',       short: 'JPT', t: T1, motif: 'bar',  marks: 1, braid: false, rp: 250 }),
    R({ id: 'scout',     name: 'Harbor Scout',        short: 'HSC', t: T1, motif: 'bar',  marks: 2, braid: false, rp: 600 }),
    R({ id: 'officer',   name: 'Patrol Officer',      short: 'PO',  t: T1, motif: 'bar',  marks: 3, braid: false, rp: 1100 }),

    R({ id: 'senior',    name: 'Senior Officer',      short: 'SO',  t: T2, motif: 'star', marks: 1, braid: false, rp: 1900 }),
    R({ id: 'captain',   name: 'Patrol Captain',      short: 'CPT', t: T2, motif: 'star', marks: 2, braid: false, rp: 3000 }),
    R({ id: 'commander', name: 'Commander',           short: 'CMD', t: T2, motif: 'star', marks: 3, braid: false, rp: 4500 }),

    R({ id: 'regional',  name: 'Regional Commander',  short: 'RCM', t: T3, motif: 'star', marks: 1, braid: true, rp: 6500 }),
    R({ id: 'admiral',   name: 'Admiral',             short: 'ADM', t: T3, motif: 'star', marks: 2, braid: true, rp: 9000 }),
    R({ id: 'legend',    name: 'Legend of the Waters', short: 'LGD', t: T3, motif: 'star', marks: 3, braid: true, rp: 13000 })
  ];

  WB.data.rankUnit = 'Wave Region Water Patrol';
})(window.WB = window.WB || {});
