/* Wave Bite - Water Patrol · data/content.js
 * KI-kuratierte Content-Bibliothek fuer Lucy (KI-Dispatch) + Live Water Region.
 * Endless-Engine rekombiniert diese Bausteine -> unendliche, abwechslungsreiche Einsaetze.
 * (Architektur-Hook: spaeter live von einem Lucy-Backend generierbar - siehe WATER-PATROL-UNIVERSE.md) */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};

  WB.data.lucy = {
    name: 'Lucy',
    role: 'KI-Dispatch · Maritime Patrol Unit',
    portrait: 'char_radio_operator_1',
    openers: [
      'Lucy an Patrol One.', 'Hier Lucy, Lagezentrum.', 'Patrol One, Lucy auf dem Kanal.',
      'Lucy hier - neue Lage.', 'Zentrale Lucy an Bord.', 'Patrol One, kommen. Lucy spricht.'
    ],
    signoffs: [
      'Lucy out.', 'Halt die Spur. Lucy out.', 'Ich bleib auf Funk. Lucy.',
      'Viel Erfolg da draussen. Lucy out.', 'Melde dich bei Sichtkontakt. Lucy.'
    ],
    streakLines: [
      'Sauber gefahren!', 'Stark - die Region ist ruhiger dank dir.', 'Beeindruckend, Captain.',
      'Das war Praezision.', 'Weiter so, die Crew ist stolz.'
    ]
  };

  // Event-Templates fuer den Endlosmodus. brief: mehrere Varianten -> Abwechslung.
  WB.data.eventTemplates = [
    { id: 'e_patrol', type: 'patrol', title: 'Streifenfahrt', icon: '⚓', regionId: 'bucht',
      objective: 'Revier sichern', distance: [1500, 2000], timeLimit: 0, minigame: null,
      char: 'char_harbor_master_1', station: 'station_harbor_office_1',
      brief: ['Routinelage in der Bucht. Fahr die Linie sauber ab.',
              'Nichts Konkretes - aber zeig Praesenz auf dem Wasser.',
              'Streife angesetzt. Augen offen, Kurs ruhig.'] },

    { id: 'e_control', type: 'control', title: 'Bootskontrolle', icon: '🔦', regionId: 'bucht',
      objective: 'Boot kontrollieren', distance: [1700, 2200], timeLimit: 0, minigame: 'radar',
      char: 'char_witness_1', station: 'station_witness_pier_1',
      brief: ['Gemeldetes Boot am Steg - erst Radar-Scan, dann hinfahren.',
              'Verdaechtige Bewegung. Scanne die Signale, dann Kontrolle.',
              'Zeugin ist nervoes. Pruef das Radar und sieh nach.'] },

    { id: 'e_eco', type: 'eco', title: 'Umweltverstoss', icon: '🛢', regionId: 'kanal',
      objective: 'Verursacher finden', distance: [2000, 2600], timeLimit: 0, minigame: null,
      char: 'char_suspect_skipper_1', station: 'station_suspicious_boat_1',
      brief: ['Oelschimmer im Kanal. Folge der Spur durch den Verkehr.',
              'Jemand kippt was rein. Find den Verursacher.',
              'Umweltalarm Kanal. Dicht dran bleiben, nicht abdr"angen lassen.'] },

    { id: 'e_pursuit', type: 'pursuit', title: 'Verfolgung', icon: '🚨', regionId: 'kanal',
      objective: 'Schnellboot stellen', distance: [2000, 2500], timeLimit: [40, 48], minigame: null,
      char: 'char_suspect_skipper_1', station: 'station_suspicious_boat_1',
      brief: ['Es flieht! Schnellboot Richtung Nordkanal - dranbleiben!',
              'Verfolgung laeuft. Enge Durchfahrten, halt die Zeit.',
              'Er hat Vorsprung. Boost clever einsetzen, nicht verlieren!'] },

    { id: 'e_rescue', type: 'rescue', title: 'Rettungseinsatz', icon: '🛟', regionId: 'seenplatte',
      objective: 'Person erreichen', distance: [2200, 2800], timeLimit: [46, 54], minigame: null,
      char: 'char_radio_operator_1', station: 'station_abandoned_jetty_1',
      brief: ['Notruf! Person im Wasser - volle Fahrt, jede Sekunde zaehlt.',
              'Wind frischt auf, Sicht schlecht. Schnell zur Position!',
              'Rettung Prioritaet. Kurs halten, Wellen nicht unterschaetzen.'] },

    { id: 'e_smuggler', type: 'smuggler', title: 'Schmuggler abfangen', icon: '🚔', regionId: 'schleuse',
      objective: 'Boot abfangen', distance: [2300, 2800], timeLimit: [40, 46], minigame: 'radar',
      char: 'char_thief_1', station: 'station_event_deck_1',
      brief: ['Schmugglerboot an der Schleuse. Erst Radar, dann abfangen!',
              'Sie wollen durch die Schleuse. Stell sie vorher.',
              'Operation Schleuse - hartes Zeitfenster. Los!'] },

    { id: 'e_storm', type: 'storm', title: 'Sturmlage', icon: '⛈', regionId: 'seenplatte',
      objective: 'Lage absichern', distance: [2000, 2600], timeLimit: [44, 52], minigame: null,
      char: 'char_harbor_master_1', station: 'station_abandoned_jetty_1',
      brief: ['Sturmwarnung! Sichere die offene Seenplatte.',
              'Gewitter zieht auf. Halt das Revier, bevor es kippt.',
              'Boeen und Wellen - ruhige Hand, klare Linie.'] },

    { id: 'e_ghost', type: 'ghost', title: 'Geistersignal', icon: '📡', regionId: 'kanal',
      objective: 'Signal aufklaeren', distance: [1800, 2300], timeLimit: 0, minigame: 'radar',
      char: 'char_radio_operator_1', station: 'station_radio_room_1',
      brief: ['Unklares Radarecho. Scanne es - irgendwas stimmt nicht.',
              'Geistersignal im Kanal. Lucy kriegt es nicht sauber - sieh nach.',
              'Phantom auf dem Schirm. Erst Radar pruefen, dann hin.'] }
  ];
})(window.WB = window.WB || {});
