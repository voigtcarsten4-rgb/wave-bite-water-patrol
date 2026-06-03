/* Wave Bite - Water Patrol · data/content.js
 * KI-kuratierte Content-Bibliothek für Lena (KI-Dispatch) + Live Water Region.
 * Endless-Engine rekombiniert diese Bausteine -> unendliche, abwechslungsreiche Einsätze.
 * (Architektur-Hook: später live von einem Lena-Backend generierbar - siehe WATER-PATROL-UNIVERSE.md) */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};

  WB.data.lucy = {
    name: 'Lena',
    role: 'KI-Dispatch · Maritime Patrol Unit',
    portrait: 'char_radio_operator_1',
    openers: [
      'Lena an Patrol One.', 'Hier Lena, Lagezentrum.', 'Patrol One, Lena auf dem Kanal.',
      'Lena hier - neue Lage.', 'Zentrale Lena an Bord.', 'Patrol One, kommen. Lena spricht.'
    ],
    signoffs: [
      'Lena out.', 'Halt die Spur. Lena out.', 'Ich bleib auf Funk. Lena.',
      'Viel Erfolg da draußen. Lena out.', 'Melde dich bei Sichtkontakt. Lena.'
    ],
    streakLines: [
      'Sauber gefahren!', 'Stark - die Region ist ruhiger dank dir.', 'Beeindruckend, Captain.',
      'Das war Präzision.', 'Weiter so, die Crew ist stolz.'
    ]
  };

  // Event-Templates für den Endlosmodus. brief: mehrere Varianten -> Abwechslung.
  WB.data.eventTemplates = [
    { id: 'e_patrol', type: 'patrol', title: 'Streifenfahrt', icon: '⚓', regionId: 'bucht',
      objective: 'Revier sichern', distance: [1500, 2000], timeLimit: 0, minigame: null,
      char: 'char_harbor_master_1', station: 'station_harbor_office_1',
      brief: ['Routinelage in der Bucht. Fahr die Linie sauber ab.',
              'Nichts Konkretes - aber zeig Präsenz auf dem Wasser.',
              'Streife angesetzt. Augen offen, Kurs ruhig.'] },

    { id: 'e_control', type: 'control', title: 'Bootskontrolle', icon: '🔦', regionId: 'bucht',
      objective: 'Boot kontrollieren', distance: [1700, 2200], timeLimit: 0, minigame: 'hafenkontrolle',
      char: 'char_witness_1', station: 'station_witness_pier_1',
      brief: ['Gemeldetes Boot am Steg - erst Radar-Scan, dann hinfahren.',
              'Verdächtige Bewegung. Scanne die Signale, dann Kontrolle.',
              'Zeugin ist nervös. Prüf das Radar und sieh nach.'] },

    { id: 'e_eco', type: 'eco', title: 'Umweltverstoß', icon: '🛢', regionId: 'kanal',
      objective: 'Verursacher finden', distance: [2000, 2600], timeLimit: 0, minigame: 'funk',
      char: 'char_suspect_skipper_1', station: 'station_suspicious_boat_1',
      brief: ['Ölschimmer im Kanal. Folge der Spur durch den Verkehr.',
              'Jemand kippt was rein. Find den Verursacher.',
              'Umweltalarm Kanal. Dicht dran bleiben, nicht abdr"angen lassen.'] },

    { id: 'e_pursuit', type: 'pursuit', title: 'Verfolgung', icon: '🚨', regionId: 'kanal',
      objective: 'Schnellboot stellen', distance: [2000, 2500], timeLimit: [40, 48], minigame: null,
      char: 'char_suspect_skipper_1', station: 'station_suspicious_boat_1',
      brief: ['Es flieht! Schnellboot Richtung Nordkanal - dranbleiben!',
              'Verfolgung läuft. Enge Durchfahrten, halt die Zeit.',
              'Er hat Vorsprung. Boost clever einsetzen, nicht verlieren!'] },

    { id: 'e_rescue', type: 'rescue', title: 'Rettungseinsatz', icon: '🛟', regionId: 'seenplatte',
      objective: 'Person erreichen', distance: [2200, 2800], timeLimit: [46, 54], minigame: 'rettung',
      char: 'char_radio_operator_1', station: 'station_abandoned_jetty_1',
      brief: ['Notruf! Person im Wasser - volle Fahrt, jede Sekunde zählt.',
              'Wind frischt auf, Sicht schlecht. Schnell zur Position!',
              'Rettung Priorität. Kurs halten, Wellen nicht unterschätzen.'] },

    { id: 'e_smuggler', type: 'smuggler', title: 'Schmuggler abfangen', icon: '🚔', regionId: 'schleuse',
      objective: 'Boot abfangen', distance: [2300, 2800], timeLimit: [40, 46], minigame: 'schleuse',
      char: 'char_thief_1', station: 'station_event_deck_1',
      brief: ['Schmugglerboot an der Schleuse. Erst Radar, dann abfangen!',
              'Sie wollen durch die Schleuse. Stell sie vorher.',
              'Operation Schleuse - hartes Zeitfenster. Los!'] },

    { id: 'e_storm', type: 'storm', title: 'Sturmlage', icon: '⛈', regionId: 'seenplatte',
      objective: 'Lage absichern', distance: [2000, 2600], timeLimit: [44, 52], minigame: null,
      char: 'char_harbor_master_1', station: 'station_abandoned_jetty_1',
      brief: ['Sturmwarnung! Sichere die offene Seenplatte.',
              'Gewitter zieht auf. Halt das Revier, bevor es kippt.',
              'Böen und Wellen - ruhige Hand, klare Linie.'] },

    { id: 'e_ghost', type: 'ghost', title: 'Geistersignal', icon: '📡', regionId: 'kanal',
      objective: 'Signal aufklären', distance: [1800, 2300], timeLimit: 0, minigame: 'radar',
      char: 'char_radio_operator_1', station: 'station_radio_room_1',
      brief: ['Unklares Radarecho. Scanne es - irgendwas stimmt nicht.',
              'Geistersignal im Kanal. Lena kriegt es nicht sauber - sieh nach.',
              'Phantom auf dem Schirm. Erst Radar prüfen, dann hin.'] }
  ];
})(window.WB = window.WB || {});
