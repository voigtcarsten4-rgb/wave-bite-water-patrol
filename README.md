# Wave Bite – Captain's Run ⚓

Ein maritimes **Premium-Mobile-Casual-Game** (HTML5 / Canvas / Vanilla JS, PWA-fähig).
Steuere dein Boot durch ruhige Reviere, erfülle Versorgungsmissionen für Wave Bite, sammle Coins & XP, schalte Boote, Upgrades und Häfen frei.

> Spielbares MVP – kein Mockup, keine Landingpage. Mobile-first, Touch-Steuerung, offline speicherbar.

---

## Schnellstart

**Lokal (sofort spielbar):**
Öffne `index.html` direkt im Browser (Doppelklick). Das Spiel läuft komplett ohne Server, da klassische Scripts statt ES-Module verwendet werden.

**Als installierbare PWA (empfohlen für Smartphone & Offline):**
Über einen lokalen Server starten, z. B.:

```bash
cd wave-bite-captains-run
python -m http.server 8080
# dann im Browser: http://localhost:8080
```

Auf dem Smartphone „Zum Startbildschirm hinzufügen" → läuft als App, offline spielbar.
(Der Service-Worker aktiviert sich nur über `http/https`, nicht über `file://` – das Spiel selbst läuft trotzdem lokal.)

---

## Steuerung

| Aktion | Mobile | Desktop |
|---|---|---|
| Links / Rechts | ◀ ▶ Buttons | Pfeiltasten / A, D |
| Gas | ⚡ Button | Pfeil ↑ / W |
| Boost | BOOST Button | Leertaste |
| Pause | ❚❚ Button | P |

**Ziel:** Liefere die Fracht rechtzeitig zum Zielhafen. Weiche Bojen, Felsen, Booten & Schleusen aus – Kollisionen beschädigen die Hülle. Wenig Schaden + Restzeit = mehr Sterne = mehr Belohnung.

---

## Projektstruktur

```
wave-bite-captains-run/
├─ index.html            App-Shell + alle Screens
├─ manifest.json         PWA-Manifest
├─ service-worker.js     Offline-Cache (App-Shell)
├─ KONZEPT.md            Phase 1: vollständige Spiel- & Produktarchitektur
├─ README.md
├─ styles/main.css       Maritime Premium-UI (Navy/Gold, Glas)
├─ assets/icons/icon.svg App-Icon
└─ src/
   ├─ core/    engine.js (Loop/Canvas) · water.js (Wasser-Renderer)
   ├─ game/    boat.js · obstacle.js · world.js · mission.js · game.js
   ├─ data/    models.js · boats.js · missions.js · regions.js · upgrades.js · achievements.js
   ├─ systems/ save.js · progression.js · input.js · audio.js
   ├─ ui/      screens.js · hud.js
   ├─ utils/   math.js · storage.js
   └─ main.js  Bootstrap
```

Alle Module hängen unter dem globalen Namespace `WB` und werden in `index.html` in Abhängigkeitsreihenfolge geladen.

---

## Features (MVP)

- 🎮 Echtes Canvas-Gameplay mit deltaTime-Loop (60 fps-Ziel, DPR-begrenzt für Performance)
- 🚤 5 Bootsklassen (2 direkt nutzbar, weitere freischaltbar) mit 6 wirkenden Werten
- 🔧 Upgrade-System (Motor, Ruder, Boost-Zelle, Rumpf) pro Boot
- 📋 4 Missionstypen (Kaffee, Essen, Eventmaterial, VIP mit Zeitlimit)
- 🗺 Reviere & Häfen mit eigenem Hindernismix und Schwierigkeitsprofil
- 📈 Captain-Level, XP-Kurve, Ränge, Coins, Sterne-Wertung
- 📅 Tägliche Aufgabe, Wochen-Challenge, Achievements
- 💾 Offline-Speicherung (localStorage, migrationsfähig → später IndexedDB/Backend)
- 📱 PWA: installierbar, offline spielbar, eigenes Icon
- 🔊 Dezenter synthetisierter Sound (WebAudio, an/aus)

## Vorbereitet (Erweiterungs-Hooks)

Echtes Online-Leaderboard · Wave-Bite-Club-Login · Hafenkarte · reale Reviere Berlin-Brandenburg · saisonale Events · Sponsorenmissionen · Partnerhäfen · QR-Code-Aktionen · Backend-Sync.

---

## Qualitätssicherung

- Syntaxprüfung aller 22 JS-Dateien + Service-Worker (`node --check`) — bestanden.
- Headless-Funktionstest: Module-Load, kompletter Missionsdurchlauf bis Ergebnis, Belohnungsverbuchung, Daily/Weekly, Datenkonsistenz — alle bestanden.
- Alle in JS referenzierten DOM-IDs sind in `index.html` vorhanden (keine toten Buttons, keine leeren Screens).

---

*Wave Bite – Captain's Run · v1.0 · MVP*
