/* Wave Bite – Water Patrol · systems/variation.js
 * RC3.0 Phase C: Missions-Variationsgenerator. Derselbe Missionstyp wirkt jeden Lauf anders durch
 * Wetter, Tageszeit, Verkehr, Funkmeldung, Start-/Zielversatz, Distanz und Sonderereignis. */
(function (WB) {
  'use strict';
  var WEATHER = ['klar', 'wolkig', 'fog', 'storm', 'regen'];
  var TOD = ['morgen', 'tag', 'abend', 'nacht'];
  var RADIO = {
    patrol:  ['Zentrale: Routinestreife, Augen offen.', 'Lena: Ruhiges Revier gemeldet – trotzdem wachsam.', 'Funk: Kontrollfahrt bestätigt, Kanal 16.'],
    control: ['Lena: Verdächtiges Boot gemeldet – freundlich, aber bestimmt.', 'Zentrale: Kontrolle am Steg, Papiere prüfen.', 'Funk: Hinweis von Zeugin liegt vor.'],
    eco:     ['Lena: Ölfilm gesichtet – der Spur folgen.', 'Zentrale: Umweltlage im Kanal, Verursacher finden.', 'Funk: Treibgut gemeldet, Vorsicht.'],
    pursuit: ['Lena: Verfolgung! Abstand halten, dranbleiben.', 'Zentrale: Schnellboot flieht – Kanal frei machen.', 'Funk: Ziel in Bewegung, volle Konzentration.'],
    rescue:  ['Lena: Notruf! Jede Sekunde zählt.', 'Zentrale: Person im Wasser – ruhig heran.', 'Funk: DLRG ist informiert, du bist zuerst da.'],
    smuggler:['Lena: Schmuggelverdacht an der Schleuse.', 'Zentrale: Verdächtige Übergabe gemeldet.', 'Funk: Razzia-Lage, eng bleiben.']
  };
  var EVENTS = ['none', 'none', 'fog_roll', 'extra_traffic', 'funk_update', 'wind_up'];

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  WB.Variation = {
    roll: function (mission) {
      var runs = 0; try { runs = (WB.Save.data.stats && WB.Save.data.stats.runs) || 0; } catch (e) {}
      var seed = (runs * 2654435761) ^ (Date.now() & 0xffff) ^ hash(mission && mission.id || 'm');
      var r = rng(seed);
      var weather = WEATHER[(r() * WEATHER.length) | 0];
      var tod = TOD[(r() * TOD.length) | 0];
      var trafficMul = +(0.7 + r() * 1.1).toFixed(2);         // 0.7..1.8x Verkehr
      var startLane = +((r() - 0.5) * 0.9).toFixed(2);          // Startversatz -0.45..0.45
      var distMul = +(0.85 + r() * 0.4).toFixed(2);             // 0.85..1.25x Streckenlänge
      var pool = RADIO[mission && mission.type] || RADIO.patrol;
      var radio = pool[(r() * pool.length) | 0];
      var event = EVENTS[(r() * EVENTS.length) | 0];
      return { weather: weather, tod: tod, trafficMul: trafficMul, startLane: startLane, distMul: distMul, radio: radio, event: event, seed: seed };
    },
    label: function (v) {
      var w = { klar:'☀️ klar', wolkig:'⛅ wolkig', fog:'🌫️ Nebel', storm:'⛈️ Sturm', regen:'🌧️ Regen' }[v.weather] || v.weather;
      var t = { morgen:'Morgen', tag:'Tag', abend:'Abend', nacht:'Nacht' }[v.tod] || v.tod;
      return w + ' · ' + t + ' · Verkehr ' + (v.trafficMul >= 1.3 ? 'dicht' : v.trafficMul <= 0.85 ? 'ruhig' : 'normal');
    }
  };
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
})(window.WB = window.WB || {});
