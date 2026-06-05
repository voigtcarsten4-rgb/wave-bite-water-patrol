/* Wave Bite – Captain's Run · game/mission.js
 * Missions-Runtime: Timer, Sterne-Wertung, Belohnung, Statistik/Achievements/Daily/Weekly. */
(function (WB) {
  'use strict';
  var M = WB.math;

  // ---- Daily / Weekly Verwaltung -------------------------------------------
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function weekKey() {
    var d = new Date();
    var onejan = new Date(d.getFullYear(), 0, 1);
    var week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + week;
  }

  WB.Meta = {
    ensureDaily: function () {
      var s = WB.Save.data, k = todayKey();
      if (s.daily.date !== k) {
        var task = M.pick(WB.data.dailyTasks);
        s.daily = { date: k, taskId: task.id, progress: 0, claimed: false };
        WB.Save.save();
      }
      return s.daily;
    },
    ensureWeekly: function () {
      var s = WB.Save.data, k = weekKey();
      if (s.weekly.week !== k) {
        var ch = M.pick(WB.data.weeklyChallenges);
        s.weekly = { week: k, challengeId: ch.id, progress: 0, claimed: false };
        WB.Save.save();
      }
      return s.weekly;
    },
    dailyTask: function () { var id = WB.Save.data.daily.taskId; for (var i=0;i<WB.data.dailyTasks.length;i++) if (WB.data.dailyTasks[i].id===id) return WB.data.dailyTasks[i]; return WB.data.dailyTasks[0]; },
    weeklyChallenge: function () { var id = WB.Save.data.weekly.challengeId; for (var i=0;i<WB.data.weeklyChallenges.length;i++) if (WB.data.weeklyChallenges[i].id===id) return WB.data.weeklyChallenges[i]; return WB.data.weeklyChallenges[0]; }
  };

  WB.checkAchievements = function () {
    var s = WB.Save.data, unlocked = [];
    for (var i = 0; i < WB.data.achievements.length; i++) {
      var a = WB.data.achievements[i];
      var rec = s.achievements[a.id] || { unlocked: false, progress: 0 };
      var val = (a.stat === 'captainLevel') ? s.captainLevel : (s.stats[a.stat] || 0);
      rec.progress = val;
      if (!rec.unlocked && val >= a.goal) { rec.unlocked = true; unlocked.push(a); }
      s.achievements[a.id] = rec;
    }
    WB.Save.save();
    return unlocked;
  };

  // ---- Missions-Runtime ----------------------------------------------------
  function MissionRuntime(mission) {
    this.mission = mission;
    this.elapsed = 0;
    this.timeLeft = mission.timeLimit || 0;
    this.timeUp = false;
  }

  MissionRuntime.prototype.tick = function (dt) {
    this.elapsed += dt;
    if (this.mission.timeLimit > 0) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.timeUp = true; }
    }
    return this.timeUp;
  };

  // Berechnet Sterne + Belohnung (ohne zu verbuchen).
  MissionRuntime.prototype.result = function (world, boatStats) {
    // RS5: Bewertung primär über Fahrwasser-Präzision + Kontrollpunkte (Hindernisse sind jetzt selten).
    var clean = (world.totalT > 1) ? (world.cleanT / world.totalT) : 1;          // Zeitanteil im Fahrwasser
    var cpRatio = world.checkpointN ? (world.cpDone / world.checkpointN) : 1;     // erreichte Kontrollpunkte
    var stars = 3;
    if (clean < 0.80) stars -= 1;                       // unsauberer Kurs
    if (clean < 0.55) stars -= 1;
    if (cpRatio < 0.8 && stars > 2) stars = 2;          // Kontrollpunkte verpasst
    if (world.collisions >= 2) stars -= 1;              // Kollisionen bleiben spürbar
    if (boat_integrity(world) < 0.35 && stars > 1) stars = 1;
    // RS9: Strafzeit (Fahrrinne verlassen / Kollisionen) drückt die Wertung
    var pen = world.penaltyT || 0;
    if (pen > 6 && stars > 1) stars -= 1;
    if (pen > 15 && stars > 1) stars -= 1;
    if (stars < 1) stars = 1;
    if (stars > 3) stars = 3;

    var starMult = stars === 3 ? 1.1 : (stars === 2 ? 0.85 : 0.6);
    var prestigeMult = 1 + boatStats.prestige * 0.03;
    var coins = Math.round(this.mission.rewardCoins * starMult * prestigeMult);
    // RS9: AAA-Zeit-Belohnung – zügige, strafarme Fahrt gibt bis zu +35% Bonus-Coins.
    var timeBonus = Math.max(0, Math.round((1 - Math.min(1, pen / 18)) * this.mission.rewardCoins * 0.35 * starMult));
    coins += timeBonus;
    var xp = Math.round(this.mission.rewardXp * starMult);
    return { stars: stars, coins: coins, xp: xp, collisions: world.collisions, perfect: stars === 3, penaltyT: Math.round(pen), timeBonus: timeBonus, raceT: Math.round(world.raceT || 0) };
  };

  function boat_integrity(world) { return world.boat.integrity; }

  // Verbucht das Ergebnis in den Speicherstand.
  MissionRuntime.prototype.apply = function (res) {
    var s = WB.Save.data;
    s.stats.runs += 1;
    s.stats.deliveries += 1;
    if (res.perfect) s.stats.perfectRuns += 1;
    if (s.completedMissions.indexOf(this.mission.id) < 0) s.completedMissions.push(this.mission.id);

    // Daily / Weekly fortschreiben
    WB.Meta.ensureDaily(); WB.Meta.ensureWeekly();
    var dt = WB.Meta.dailyTask(), wk = WB.Meta.weeklyChallenge();
    s.daily.progress += progressDelta(dt.stat, res);
    s.weekly.progress += progressDelta(wk.stat, res);

    var lvl = WB.Progression.grant(res.coins, res.xp); // speichert + Level-Up
    if (res.coins + 0 > 0 && (s.stats.bestScore || 0) < res.coins) s.stats.bestScore = res.coins;

    var unlocked = WB.checkAchievements();
    return { level: lvl, unlockedAchievements: unlocked };
  };

  function progressDelta(stat, res) {
    if (stat === 'runs') return 1;
    if (stat === 'deliveries') return 1;
    if (stat === 'perfectRuns') return res.perfect ? 1 : 0;
    return 0;
  }

  WB.MissionRuntime = MissionRuntime;
})(window.WB = window.WB || {});
