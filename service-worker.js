/* Wave Bite – Captain's Run · service-worker.js
 * App-Shell-Precache → offline spielbar. Stale-While-Revalidate für Updates. */
var CACHE = 'wavebite-captainsrun-v69';

var ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'styles/main.css?v=30',
  'assets/icons/icon.svg',
  'src/utils/math.js',
  'src/utils/storage.js',
  'src/data/models.js',
  'src/data/boats.js',
  'src/data/upgrades.js',
  'src/data/regions.js',
  'src/data/missions.js',
  'src/data/achievements.js',
  'src/data/content.js',
  'src/data/legal.js',
  'src/data/story.js',
  'src/data/ranks.js',
  'src/data/asset-manifest.js',
  'src/systems/worldstate.js',
  'src/systems/save.js',
  'src/systems/progression.js',
  'src/systems/rank.js',
  'src/systems/assets.js',
  'src/systems/track.js',
  'src/systems/retention.js',
  'src/systems/captain-profile.js',
  'src/systems/variation.js',
  'src/systems/endless.js',
  'src/systems/story.js',
  'src/systems/audio.js',
  'src/systems/input.js',
  'src/core/water.js',
  'src/core/engine.js',
  'src/game/boat.js',
  'src/game/ai.js',
  'src/game/opponent.js',
  'src/game/minigame.js',
  'src/game/minigame-modules.js',
  'src/game/minigame-lock.js',
  'src/game/minigame-search.js',
  'src/game/obstacle.js',
  'src/game/world.js',
  'src/game/mission.js',
  'src/game/game.js',
  'src/game/minigame-radar.js',
  'src/ui/news.js',
  'src/ui/lucy.js',
  'src/ui/hud.js',
  'src/ui/wasserlage.js',
  'src/ui/navmap.js',
  'src/ui/screens.js',
  'src/ui/cinematic.js',
  'src/ui/dialogue.js',
  'src/ui/intro.js',
  'src/ui/rating.js',
  'src/main.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Resilient: ein einzelnes fehlgeschlagenes Asset darf den Offline-Cache nicht verhindern.
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () { /* einzelnes Asset übersprungen */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        if (res && res.status 