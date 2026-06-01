/* Wave Bite – Captain's Run · data/regions.js · Reviere & Häfen */
(function (WB) {
  'use strict';
  var R = WB.models.Region, H = WB.models.Harbor;
  WB.data = WB.data || {};
  WB.data.regions = [
    R({ id: 'bucht', name: 'Müggelsee', area: 'Köpenick · Friedrichshagen', coord: '52.438°N 13.645°E', channel: 16, mood: 'Berlins größter See · ruhig, weit, einsteigerfreundlich',
        waterTop: '#0B2138', waterBottom: '#15497A', difficulty: 1, unlockLevel: 1,
        obstacleMix: ['buoy', 'rock'],
        harbors: [ H({ id: 'h_steg', name: 'Marina Friedrichshagen', regionId: 'bucht', icon: '⚓' }) ] }),
    R({ id: 'kanal', name: 'Spree · Berlin-Mitte', area: 'Oberbaumbrücke · Osthafen', coord: '52.502°N 13.445°E', channel: 16, mood: 'Oberbaumbrücke, Fernsehturm, enge City-Fahrt',
        waterTop: '#0A1E33', waterBottom: '#123E63', difficulty: 2, unlockLevel: 4,
        obstacleMix: ['buoy', 'rock', 'boat'],
        harbors: [ H({ id: 'h_pier', name: 'Osthafen', regionId: 'kanal', icon: '⚓' }) ] }),
    R({ id: 'seenplatte', name: 'Dahme-Seenkette', area: 'Zeuthener See · Seddinsee', coord: '52.355°N 13.630°E', channel: 71, mood: 'Zeuthener & Seddinsee · offen, Wind & Wellen',
        waterTop: '#0B2540', waterBottom: '#1A5C84', difficulty: 3, unlockLevel: 8,
        obstacleMix: ['buoy', 'rock', 'boat', 'log'],
        harbors: [ H({ id: 'h_insel', name: 'Zeuthen-Anleger', regionId: 'seenplatte', icon: '⚓' }) ] }),
    R({ id: 'schleuse', name: 'Schleuse Wernsdorf', area: 'Oder-Spree-Kanal', coord: '52.378°N 13.700°E', channel: 20, mood: 'Dahme-Schleusen · Timing & Zeitdruck',
        waterTop: '#091B2E', waterBottom: '#103652', difficulty: 4, unlockLevel: 12,
        obstacleMix: ['buoy', 'rock', 'boat', 'log', 'gate'],
        harbors: [ H({ id: 'h_schleuse', name: 'Oberhafen Wernsdorf', regionId: 'schleuse', icon: '⚓' }) ] })
    // Reale Reviere Berlin-Brandenburg. Erweiterbar: Seddinsee, Wolziger See, Langer See, Rummelsburger Bucht.
  ];
  WB.data.regionById = function (id) {
    for (var i = 0; i < WB.data.regions.length; i++) if (WB.data.regions[i].id === id) return WB.data.regions[i];
    return WB.data.regions[0];
  };
})(window.WB = window.WB || {});
