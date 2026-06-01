/* Wave Bite - Water Patrol · data/achievements.js · Achievements, Daily, Weekly (Polizei) */
(function (WB) {
  'use strict';
  var A = WB.models.Achievement, D = WB.models.DailyTask, W = WB.models.WeeklyChallenge;
  WB.data = WB.data || {};

  WB.data.achievements = [
    A({ id: 'first_delivery', name: 'Erster Einsatz', desc: 'Schliesse deinen ersten Einsatz ab.', icon: '⚓', goal: 1, stat: 'deliveries' }),
    A({ id: 'ten_deliveries', name: 'Erfahrene Crew', desc: 'Schliesse 10 Einsaetze ab.', icon: '🚔', goal: 10, stat: 'deliveries' }),
    A({ id: 'perfect_run', name: 'Saubere Fahrt', desc: 'Beende einen Einsatz mit 3 Sternen.', icon: '🌟', goal: 1, stat: 'perfectRuns' }),
    A({ id: 'rich_captain', name: 'Gut ausgeruestet', desc: 'Verdiene insgesamt 2.000 Coins.', icon: '🪙', goal: 2000, stat: 'coinsEarned' }),
    A({ id: 'level_five', name: 'Befoerdert', desc: 'Erreiche Captain-Level 5.', icon: '🎖', goal: 5, stat: 'captainLevel' })
  ];

  WB.data.dailyTasks = [
    D({ id: 'd_runs3', name: 'Drei Einsaetze heute', goal: 3, stat: 'runs', rewardCoins: 120, rewardXp: 80 }),
    D({ id: 'd_deliver2', name: 'Zwei saubere Einsaetze', goal: 2, stat: 'deliveries', rewardCoins: 140, rewardXp: 90 })
  ];

  WB.data.weeklyChallenges = [
    W({ id: 'w_deliver15', name: 'Wocheneinsatz: 15 Einsaetze', goal: 15, stat: 'deliveries', rewardCoins: 600, rewardXp: 400 }),
    W({ id: 'w_perfect5', name: 'Perfektionist: 5 Sterne-Fahrten', goal: 5, stat: 'perfectRuns', rewardCoins: 700, rewardXp: 480 })
  ];

  WB.data.achievementById = function (id) {
    for (var i = 0; i < WB.data.achievements.length; i++) if (WB.data.achievements[i].id === id) return WB.data.achievements[i];
    return null;
  };
})(window.WB = window.WB || {});
