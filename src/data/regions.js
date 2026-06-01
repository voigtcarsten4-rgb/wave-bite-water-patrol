/* Wave Bite – Captain's Run · data/regions.js · Reviere & Häfen */
(function (WB) {
  'use strict';
  var R = WB.models.Region, H = WB.models.Harbor;
  WB.data = WB.data || {};
  WB.data.regions = [
    R({ id: 'bucht', name: 'Ruhige Bucht', mood: 'Klar & einsteigerfreundlich',
        waterTop: '#0B2138', waterBottom: '#15497A', difficulty: 1, unlockLevel: 1,
        obstacleMix: ['buoy', 'rock'],
        harbors: [ H({ id: 'h_steg', name: 'Sonnensteg', regionId: 'bucht', icon: '⚓' }) ] }),
    R({ id: 'kanal', name: 'Hafenkanal', mood: 'Enge Durchfahrten, Gegenverkehr',
        waterTop: '#0A1E33', waterBottom: '#123E63', difficulty: 2, unlockLevel: 4,
        obstacleMix: ['buoy', 'rock', 'boat'],
        harbors: [ H({ id: 'h_pier', name: 'Nordpier', regionId: 'kanal', icon: '⚓' }) ] }),
    R({ id: 'seenplatte', name: 'Seenplatte', mood: 'Offen, Wind & Wellen',
        waterTop: '#0B2540', waterBottom: '#1A5C84', difficulty: 3, unlockLevel: 8,
        obstacleMix: ['buoy', 'rock', 'boat', 'log'],
        harbors: [ H({ id: 'h_insel', name: 'Inselanleger', regionId: 'seenplatte', icon: '⚓' }) ] }),
    R({ id: 'schleuse', name: 'Schleusenrevier', mood: 'Schleusen & Zeitdruck',
        waterTop: '#091B2E', waterBottom: '#103652', difficulty: 4, unlockLevel: 12,
        obstacleMix: ['buoy', 'rock', 'boat', 'log', 'gate'],
        harbors: [ H({ id: 'h_schleuse', name: 'Oberhafen', regionId: 'schleuse', icon: '⚓' }) ] })
    // Erweiterung: reale Reviere Berlin-Brandenburg werden hier ergänzt.
  ];
  WB.data.regionById = function (id) {
    for (var i = 0; i < WB.data.regions.length; i++) if (WB.data.regions[i].id === id) return WB.data.regions[i];
    return WB.data.regions[0];
  };
})(window.WB = window.WB || {});
