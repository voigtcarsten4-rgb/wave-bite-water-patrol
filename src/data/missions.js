/* Wave Bite - Water Patrol · data/missions.js
 * Polizei-Einsaetze (Maritime Patrol Unit) - KEIN Food. Mit Funk-Briefing + Portraits.
 * Felder: id,type,title,icon,objective,desc,regionId,distance,timeLimit,
 *         rewardCoins,rewardXp,unlockLevel,difficulty,briefChar,briefStation,brief
 */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};

  WB.data.missions = [
    { id: 'm_streife', type: 'patrol', title: 'Streifenfahrt Bucht', icon: '⚓',
      objective: 'Revier sichern', desc: 'Routine-Patrouille. Halte die Fahrrinne sauber und erreiche den Kontrollpunkt.',
      regionId: 'bucht', distance: 1600, timeLimit: 0, rewardCoins: 70, rewardXp: 50,
      unlockLevel: 1, difficulty: 1, briefChar: 'char_harbor_master_1', briefStation: 'station_harbor_office_1',
      brief: 'Zentrale an Patrol One: Routinekontrolle in der Bucht. Augen offen halten, Kurs sauber fahren.' },

    { id: 'm_kontrolle', type: 'control', title: 'Bootskontrolle Nordsteg', icon: '🔦',
      objective: 'Verdaechtiges Boot kontrollieren', desc: 'Ein gemeldetes Boot liegt am Nordsteg. Fahr hin und sichere die Kontrolle.',
      regionId: 'bucht', distance: 1900, timeLimit: 0, rewardCoins: 100, rewardXp: 70,
      unlockLevel: 1, difficulty: 1, briefChar: 'char_witness_1', briefStation: 'station_witness_pier_1',
      brief: 'Zeugin meldet ein verdaechtiges Boot am Nordsteg. Hinfahren, Lage checken, kontrollieren.' },

    { id: 'm_umwelt', type: 'eco', title: 'Umweltverstoss im Kanal', icon: '🛢',
      objective: 'Verursacher aufspueren', desc: 'Oelspur im Hafenkanal. Folge der Spur durch den Verkehr zum Verursacher.',
      regionId: 'kanal', distance: 2300, timeLimit: 0, rewardCoins: 150, rewardXp: 105,
      unlockLevel: 2, difficulty: 2, briefChar: 'char_suspect_skipper_1', briefStation: 'station_suspicious_boat_1',
      brief: 'Achtung: Oelspur im Kanal gemeldet. Verursacher aufspueren - dichter Bootsverkehr voraus.' },

    { id: 'm_verfolgung', type: 'pursuit', title: 'Verfolgung: Schnellboot', icon: '🚨',
      objective: 'Schnellboot stellen', desc: 'Ein Schnellboot flieht Richtung Nordkanal. Dranbleiben - enge Durchfahrten, Zeit laeuft!',
      regionId: 'kanal', distance: 2200, timeLimit: 45, rewardCoins: 230, rewardXp: 160,
      unlockLevel: 3, difficulty: 3, briefChar: 'char_suspect_skipper_1', briefStation: 'station_suspicious_boat_1',
      brief: 'Patrol One, Verfolgung! Verdaechtiges Schnellboot Richtung Nordkanal. Abstand halten, dranbleiben.' },

    { id: 'm_rettung', type: 'rescue', title: 'Rettungseinsatz Seenplatte', icon: '🛟',
      objective: 'Person erreichen', desc: 'Person im Wasser gemeldet. Bei Wind und Wellen so schnell wie moeglich zur Position.',
      regionId: 'seenplatte', distance: 2400, timeLimit: 50, rewardCoins: 260, rewardXp: 185,
      unlockLevel: 4, difficulty: 3, briefChar: 'char_radio_operator_1', briefStation: 'station_abandoned_jetty_1',
      brief: 'Notruf! Person im Wasser auf der Seenplatte. Jede Sekunde zaehlt - volle Fahrt, Kurs halten.' },

    { id: 'm_schmuggler', type: 'smuggler', title: 'Schmuggler an der Schleuse', icon: '🚔',
      objective: 'Schmuggler abfangen', desc: 'Das Schmugglernetzwerk ist an der Schleuse aktiv. Fang das Boot ab, bevor es durch ist.',
      regionId: 'schleuse', distance: 2600, timeLimit: 42, rewardCoins: 360, rewardXp: 250,
      unlockLevel: 6, difficulty: 4, briefChar: 'char_thief_1', briefStation: 'station_event_deck_1',
      brief: 'Operation Schleuse: Schmugglerboot gesichtet. Abfangen vor der Durchfahrt - hartes Zeitfenster.' }
  ];

  WB.data.missionById = function (id) {
    for (var i = 0; i < WB.data.missions.length; i++) if (WB.data.missions[i].id === id) return WB.data.missions[i];
    return WB.data.missions[0];
  };
})(window.WB = window.WB || {});
