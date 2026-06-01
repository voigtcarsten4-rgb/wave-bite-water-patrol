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
      brief: 'Operation Schleuse: Schmugglerboot gesichtet. Abfangen vor der Durchfahrt - hartes Zeitfenster.' },

    { id: 'm_speed', type: 'control', title: 'Geschwindigkeitskontrolle', icon: '📟',
      objective: 'Raser stoppen', desc: 'Mehrere Boote fahren zu schnell durch die Schutzzone. Hol das schnellste ein und stoppe es.',
      regionId: 'bucht', distance: 1800, timeLimit: 0, rewardCoins: 110, rewardXp: 80,
      unlockLevel: 2, difficulty: 2, briefChar: 'char_harbor_master_1', briefStation: 'station_harbor_office_1',
      brief: 'Patrol One, Schutzzone Bucht: ein Boot fährt deutlich zu schnell. Einholen und stoppen.' },

    { id: 'm_diebstahl', type: 'pursuit', title: 'Bootsdieb auf der Flucht', icon: '🚨',
      objective: 'Dieb stellen', desc: 'Ein gestohlenes Boot flieht durch den Kanal. Bleib dran, lass dich nicht abhängen.',
      regionId: 'kanal', distance: 2100, timeLimit: 48, rewardCoins: 240, rewardXp: 170,
      unlockLevel: 4, difficulty: 3, briefChar: 'char_thief_1', briefStation: 'station_suspicious_boat_1',
      brief: 'Diebstahl gemeldet! Täter flieht mit dem Boot Richtung Kanal. Verfolgung aufnehmen!' },

    { id: 'm_vip', type: 'control', title: 'VIP-Eskorte Hafenkanal', icon: '🎖',
      objective: 'Eskorte sichern', desc: 'Begleite und sichere ein wichtiges Boot durch den belebten Kanal – bleib eng dran.',
      regionId: 'kanal', distance: 2000, timeLimit: 50, rewardCoins: 200, rewardXp: 150,
      unlockLevel: 5, difficulty: 3, briefChar: 'char_radio_operator_1', briefStation: 'station_radio_room_1',
      brief: 'Eskort-Auftrag: VIP-Boot im Kanal absichern. Dicht dran bleiben, Verkehr im Blick.' },

    { id: 'm_nacht', type: 'patrol', title: 'Nachtstreife Seenplatte', icon: '🌙',
      objective: 'Revier bei Nacht sichern', desc: 'Dunkelheit, schlechte Sicht. Patrouilliere die offene Seenplatte und halte Kurs.',
      regionId: 'seenplatte', distance: 2200, timeLimit: 0, rewardCoins: 180, rewardXp: 130,
      unlockLevel: 5, difficulty: 3, briefChar: 'char_harbor_master_1', briefStation: 'station_abandoned_jetty_1',
      brief: 'Nachtstreife angesetzt. Sicht ist mies – ruhige Hand, sauberer Kurs über die Seenplatte.' },

    { id: 'm_funk', type: 'control', title: 'Geistersignal im Funkraum', icon: '📡',
      objective: 'Signalquelle aufklären', desc: 'Ein unklares Radarecho geistert durch den Kanal. Spür die Quelle auf und kontrolliere sie.',
      regionId: 'kanal', distance: 2000, timeLimit: 0, rewardCoins: 160, rewardXp: 120,
      unlockLevel: 6, difficulty: 3, briefChar: 'char_radio_operator_1', briefStation: 'station_radio_room_1',
      brief: 'Phantom auf dem Schirm, Patrol One. Lucy kriegt es nicht sauber – fahr hin und klär das Signal.' },

    { id: 'm_beweis', type: 'eco', title: 'Beweissicherung am Wrack', icon: '🔍',
      objective: 'Spur zum Verursacher', desc: 'An einem alten Wrack tritt Treibstoff aus. Folge der frischen Spur zum Verursacher.',
      regionId: 'kanal', distance: 2300, timeLimit: 0, rewardCoins: 200, rewardXp: 150,
      unlockLevel: 7, difficulty: 3, briefChar: 'char_suspect_skipper_1', briefStation: 'station_suspicious_boat_1',
      brief: 'Frische Treibstoffspur am Wrack. Dranbleiben – die Spur führt direkt zum Verursacher.' },

    { id: 'm_vermisst', type: 'rescue', title: 'Vermisstes Boot', icon: '🛟',
      objective: 'Vermisste erreichen', desc: 'Ein Boot wird seit Stunden vermisst. Erreiche die letzte bekannte Position bei aufkommendem Wind.',
      regionId: 'seenplatte', distance: 2500, timeLimit: 52, rewardCoins: 280, rewardXp: 200,
      unlockLevel: 8, difficulty: 4, briefChar: 'char_radio_operator_1', briefStation: 'station_abandoned_jetty_1',
      brief: 'Vermisstenmeldung! Letzte Position auf der Seenplatte. Wind frischt auf – volle Fahrt, jede Minute zählt.' },

    { id: 'm_razzia', type: 'smuggler', title: 'Großrazzia Oberhafen', icon: '🚔',
      objective: 'Schmugglerring sprengen', desc: 'Der Schmugglerring schleust Ware durch die Schleuse. Fang das Leitboot ab – enges Zeitfenster.',
      regionId: 'schleuse', distance: 2800, timeLimit: 44, rewardCoins: 420, rewardXp: 300,
      unlockLevel: 9, difficulty: 4, briefChar: 'char_thief_1', briefStation: 'station_event_deck_1',
      brief: 'Großeinsatz Oberhafen: Leitboot des Rings gesichtet. Vor der Schleuse stellen – los, los, los!' },

    { id: 'm_sturm', type: 'rescue', title: 'Sturmrettung', icon: '⛈',
      objective: 'Person im Sturm bergen', desc: 'Mitten im Gewitter treibt eine Person ab. Härteste Bedingungen – erreiche sie rechtzeitig.',
      regionId: 'seenplatte', distance: 2700, timeLimit: 48, rewardCoins: 360, rewardXp: 260,
      unlockLevel: 11, difficulty: 5, briefChar: 'char_radio_operator_1', briefStation: 'station_abandoned_jetty_1',
      brief: 'Sturmrettung! Person treibt im Gewitter ab. Böen, Wellen, kaum Sicht – das wird hart. Fahr!' }
  ];

  WB.data.missionById = function (id) {
    for (var i = 0; i < WB.data.missions.length; i++) if (WB.data.missions[i].id === id) return WB.data.missions[i];
    return WB.data.missions[0];
  };
})(window.WB = window.WB || {});
