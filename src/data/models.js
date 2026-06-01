/* Wave Bite – Captain's Run · data/models.js
 * Datenmodelle als Factory-Funktionen mit Defaults.
 * Modelle: PlayerProfile, Boat, Mission, Harbor, Region, Upgrade,
 *          Achievement, DailyTask, WeeklyChallenge, SaveGame, LeaderboardEntry. */
(function (WB) {
  'use strict';

  var SCHEMA_VERSION = 1;

  WB.models = {
    SCHEMA_VERSION: SCHEMA_VERSION,

    PlayerProfile: function (o) {
      o = o || {};
      return {
        name: o.name || 'Captain',
        captainLevel: o.captainLevel || 1,
        xp: o.xp || 0,
        coins: o.coins || 0,
        rank: o.rank || 'Deckhand'
      };
    },

    Boat: function (o) {
      o = o || {};
      return {
        id: o.id, name: o.name || 'Boot', desc: o.desc || '',
        // Werte 1..10
        speed: o.speed || 5, handling: o.handling || 5, boost: o.boost || 5,
        stability: o.stability || 5, cargo: o.cargo || 5, prestige: o.prestige || 5,
        price: o.price || 0, unlockLevel: o.unlockLevel || 1,
        color: o.color || '#C9A24B'
      };
    },

    Upgrade: function (o) {
      o = o || {};
      return {
        id: o.id, name: o.name, track: o.track,           // 'motor'|'rudder'|'boost'|'hull'
        affects: o.affects, perLevel: o.perLevel || 1,
        maxLevel: o.maxLevel || 3, baseCost: o.baseCost || 150
      };
    },

    Harbor: function (o) {
      o = o || {};
      return { id: o.id, name: o.name || 'Hafen', regionId: o.regionId, icon: o.icon || '⚓' };
    },

    Region: function (o) {
      o = o || {};
      return {
        id: o.id, name: o.name, mood: o.mood || '',
        waterTop: o.waterTop || '#0B1E3B', waterBottom: o.waterBottom || '#123A63',
        difficulty: o.difficulty || 1, unlockLevel: o.unlockLevel || 1,
        obstacleMix: o.obstacleMix || ['buoy', 'rock'], harbors: o.harbors || []
      };
    },

    Mission: function (o) {
      o = o || {};
      return {
        id: o.id, type: o.type, title: o.title, icon: o.icon || '📦',
        cargo: o.cargo || 'Fracht', desc: o.desc || '',
        regionId: o.regionId, distance: o.distance || 1600,    // virtuelle Streckenlänge
        timeLimit: o.timeLimit || 0,                            // 0 = kein Limit
        rewardCoins: o.rewardCoins || 50, rewardXp: o.rewardXp || 40,
        unlockLevel: o.unlockLevel || 1, difficulty: o.difficulty || 1
      };
    },

    Achievement: function (o) {
      o = o || {};
      return {
        id: o.id, name: o.name, desc: o.desc, icon: o.icon || '🏅',
        goal: o.goal || 1, stat: o.stat || 'deliveries'
      };
    },

    DailyTask: function (o) {
      o = o || {};
      return { id: o.id, name: o.name, goal: o.goal || 3, stat: o.stat || 'runs',
        rewardCoins: o.rewardCoins || 120, rewardXp: o.rewardXp || 80 };
    },

    WeeklyChallenge: function (o) {
      o = o || {};
      return { id: o.id, name: o.name, goal: o.goal || 15, stat: o.stat || 'deliveries',
        rewardCoins: o.rewardCoins || 600, rewardXp: o.rewardXp || 400 };
    },

    LeaderboardEntry: function (o) {
      o = o || {};
      return { name: o.name || 'Captain', score: o.score || 0, level: o.level || 1,
        date: o.date || Date.now() };
    },

    SaveGame: function (o) {
      o = o || {};
      return {
        version: SCHEMA_VERSION,
        captainName: o.captainName || 'Captain',
        captainLevel: o.captainLevel || 1,
        xp: o.xp || 0,
        coins: o.coins != null ? o.coins : 150,
        highestRankIndex: o.highestRankIndex || 0,
        selectedBoatId: o.selectedBoatId || 'angelboot',
        ownedBoats: o.ownedBoats || { angelboot: { upgrades: { motor: 0, rudder: 0, boost: 0, hull: 0 } } },
        completedMissions: o.completedMissions || [],
        story: o.story || { chapter: 0, completed: [] },
        stats: o.stats || { runs: 0, deliveries: 0, perfectRuns: 0, coinsEarned: 0, bestScore: 0 },
        daily: o.daily || { date: null, taskId: null, progress: 0, claimed: false },
        weekly: o.weekly || { week: null, challengeId: null, progress: 0, claimed: false },
        achievements: o.achievements || {},
        settings: o.settings || { sound: true, vibration: true },
        leaderboardLocal: o.leaderboardLocal || [],
        lastPlayed: o.lastPlayed || Date.now()
      };
    }
  };
})(window.WB = window.WB || {});
