/* Wave Bite – Captain's Run · service-worker.js
 * App-Shell-Precache -> offline spielbar. Stale-While-Revalidate fuer Updates.
 * (Hinweis: interne Kommentare bewusst ASCII; alle SICHTBAREN Texte liegen in den HTML/JS-Dateien.) */
var CACHE = 'wavebite-captainsrun-v97';

var ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'assets/icons/icon.svg',
  'assets/icons/apple-touch-icon-180.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/wave-bite-badge.png',
  'styles/main.css',
  'styles/mg-premium.css',
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
  'src/data/voices.js',
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
  'src/game/obstacle.js',
  'src/game/world.js',
  'src/game/mission.js',
  'src/game/game.js',
  'src/ui/news.js',
  'src/ui/lucy.js',
  'src/ui/hud.js',
  'src/ui/wasserlage.js',
  'src/ui/navmap.js',
  'src/ui/screens.js',
  'src/ui/cinematic.js',
  'src/ui/trailer.js',
  'src/ui/mission-cinematic.js',
  'src/ui/revier-lage.js',
  'src/game/minigame-extra.js',
  'src/ui/dialogue.js',
  'src/ui/intro.js',
  'src/ui/rating.js',
  'src/ui/skipper.js',
  'src/main.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () { /* einzelnes Asset uebersprungen */ });
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
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'default')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
