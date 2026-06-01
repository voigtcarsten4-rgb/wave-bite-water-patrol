# WAVE BITE – CAPTAIN'S RUN
### Produkt- & Spielarchitektur · Phase 1

> Premium-Mobile-Casual-Game für Bootsfahrer, Hausbooturlauber, Wassersportler, Touristen und die Wave-Bite-Community.
> Maritim. Hochwertig. Ruhig. Motivierend. Kein Browser-Test, sondern ein edles Mini-Mobile-Game.

---

## 1. Game Vision

Wave Bite – Captain's Run ist ein **maritimes Liefer-Runner-Game** mit ruhiger Premium-Wasseroptik. Der Spieler übernimmt das Steuer eines Bootes und erfüllt Versorgungsmissionen für Wave Bite: Kaffee, Essen, Gäste, Eventmaterial, VIP-Aufträge. Jede Fahrt ist eine kurze, fokussierte Session (45–120 Sekunden), die sich edel anfühlt – weiche Wasserbewegung, goldene Highlights, klare Typografie, ruhige Mikroanimationen.

Die Vision: Ein Spiel, das wie ein hochwertiger maritimer Lifestyle wirkt. Es soll Entspannung und Stolz vermitteln – nicht Hektik. „Einfach zu spielen, schwer zu meistern": Wer nur liefern will, kann das. Wer Bestzeiten, Achievements und Premium-Ränge jagt, findet Tiefe.

Das Spiel ist von Tag eins **markengetrieben**: Es ist nicht „irgendein Bootsspiel mit Logo", sondern die spielbare Wave-Bite-Welt – Häfen, Crew, Versorgung, Events. Es bereitet die Brücke zur realen Community (Club, Partnerhäfen, Events Berlin-Brandenburg) technisch vor.

---

## 2. Zielgruppe

| Segment | Motivation | Spiel-Hook |
|---|---|---|
| **Bootsfahrer & Hausbooturlauber** | Identifikation, Wasser-Lifestyle | realistische Reviere, Bootsklassen, Häfen |
| **Wassersportler** | Skill, Bestzeiten, Wetter | progressive Schwierigkeit, Boost-Timing |
| **Touristen / Gelegenheitsspieler** | kurze Entspannung, schöne Optik | 60-Sek-Sessions, sofort verständlich |
| **Wave-Bite-Community / Club** | Zugehörigkeit, Belohnung | Club-Aufträge, Ränge, QR-/Event-Freischaltung |
| **Markenkontakt am POS** | Wartezeit überbrücken, Marke erleben | QR-Code → sofort spielbar, Sponsorenmissionen |

Primär: 25–55 Jahre, naturverbunden, affin für maritimen Lifestyle, Smartphone-first.
Sekundär: jüngere Eventbesucher, die über QR-Aktionen einsteigen.

---

## 3. USP (Alleinstellung)

1. **Markenwelt statt Werbebanner** – Wave Bite ist das Spiel, nicht ein Logo darin.
2. **Premium-Maritim-Ästhetik** – Navy/Gold, Glas-UI, ruhiges Wasser; bewusst kein Arcade-Chaos, keine Comicgrafik.
3. **Echte Reviere als Fernziel** – Berlin-Brandenburg-Wassergebiete als spielbare Karte vorbereitet.
4. **Community-Brücke** – Club-Login, echtes Leaderboard, Partnerhäfen, QR-Event-Freischaltungen technisch vorbereitet.
5. **„Calm-Skill"-Gameplay** – entspannt steuerbar, aber mit Mastery-Tiefe (Boost-Ökonomie, Wetter, Schleusen).

---

## 4. Core Gameplay Loop (Sekunden bis Minuten)

```
Mission wählen ▸ Boot & Revier laden ▸ Fahren (steuern · Boost · Hindernisse meiden ·
Wetter lesen) ▸ Rechtzeitig am Zielhafen anlegen ▸ Coins + XP + Bewertung ▸ zurück ins Menü
```

**Steuerung im Kern:** Boot fährt vorwärts (Wasser scrollt). Spieler steuert links/rechts, reguliert Gas (Geschwindigkeit/Energieverbrauch) und setzt Boost gezielt ein. Hindernisse und enge Durchfahrten kosten bei Kollision Hüllen-Integrität und Zeit. Ein Zielentfernungs-/Kompass-Indikator zeigt den Fortschritt zur Lieferung. Am Ende: Anlegen am Hafen = Mission erfüllt.

**Bewertung pro Lauf:** Restzeit, vermiedene Kollisionen, Cargo-Zustand → 1–3 Sterne → Coin-/XP-Bonus.

---

## 5. Meta Progression Loop (Sessions bis Wochen)

```
Coins/XP sammeln ▸ Captain-Level steigt ▸ neue Missionstypen & Reviere schalten frei ▸
Boote kaufen/upgraden ▸ schwerere Aufträge ▸ tägliche & wöchentliche Challenges ▸
Achievements & Ränge ▸ Club-Integration (vorbereitet)
```

Antreiber: **Captain-Level** (Gesamtprofil), **Bootssammlung & Upgrades** (optisch + Werte), **Revier-Entdeckung**, **Daily/Weekly**, **Achievements**, **Premium-Ränge**. Die Rangliste ist lokal vorbereitet und API-fähig für echtes Online-Leaderboard.

---

## 6. Missionstypen

| Typ | Auftrag | Besonderheit |
|---|---|---|
| ☕ **Kaffee-Lieferung** | Kaffee an Hafen liefern | Einsteiger, ruhig |
| 🍽 **Essens-Lieferung** | Essen an Hausboot bringen | Cargo darf nicht beschädigt werden |
| 📦 **Eventmaterial** | Material zum Anleger | längere Strecke, mehr Hindernisse |
| ⭐ **VIP-Auftrag** | Gast termingerecht bringen | hartes Zeitlimit, hoher Reward |
| 🚑 **Notfallversorgung** | schnelle Lieferung | Dauer-Boost-Druck, Wetter |
| 🏝 **Hafenversorgung** | mehrere Stopps | Multi-Ziel (Erweiterung) |
| 👑 **Club-Member-Spezial** | exklusiv | Club-Login nötig (vorbereitet) |
| 🤝 **Sponsorenmission** | Partner-Auftrag | Event-/QR-Freischaltung (vorbereitet) |

MVP enthält: Kaffee, Essen, Eventmaterial, VIP.

---

## 7. Progressionssystem

- **XP** aus jeder Mission (Basis + Sterne-Bonus). XP-Kurve: `xpFürLevel(n) = 100 · n^1.35` (progressiv, planbar).
- **Captain-Level** schaltet Reviere, Missionstypen und Bootskäufe frei.
- **Coins** als Soft-Currency für Boote & Upgrades.
- **Sterne-Rating** pro Lauf treibt Wiederholungen.
- **Daily Task** (1×/Tag) und **Weekly Challenge** (1×/Woche) mit Bonus-Coins/XP.
- **Achievements** als langfristige Sammelziele.
- **Premium-Ränge** (Deckhand → Skipper → Captain → Commodore → Fleet Admiral) an Level gekoppelt.

---

## 8. Bootssystem (freischaltbar)

Jedes Boot hat sechs Werte: **Speed, Handling, Boost, Stabilität, Cargo, Prestige**.

| # | Boot | Charakter | Freischaltung |
|---|---|---|---|
| 1 | **Angelboot** | langsam, robust, viel Cargo | Start |
| 2 | **Sportboot** | schnell, agil, wenig Cargo | Level 3 / Coins |
| 3 | **Hausboot** | träge, sehr stabil, viel Cargo | Level 6 / Coins |
| 4 | **Wave Bite Versorgungskatamaran** | ausgewogen, Marken-Boot | Level 10 / Coins |
| 5 | **Premium Eventschiff** | High-End, Prestige | Level 16 / Coins |

Werte beeinflussen Gameplay real: Speed→Grundtempo, Handling→Lenkschärfe, Boost→Boost-Kraft/Regeneration, Stabilität→Kollisionsresistenz, Cargo→Toleranz für Frachtschäden, Prestige→Coin-Multiplikator.

---

## 9. Upgrade-System

Pro Boot vier Upgrade-Tracks mit je Stufen (Lvl 0–3), Coins-Kosten progressiv:

- **Motor** → Speed
- **Ruder** → Handling
- **Boost-Zelle** → Boost-Kapazität & Regeneration
- **Rumpf** → Stabilität / Schadensresistenz

Upgrades sind sowohl Werte- als auch optische Verbesserung (Rumpf-Akzent, goldene Details). Sie sind pro Boot gespeichert.

---

## 10. Level- & Gebietssystem (Reviere & Häfen)

Reviere sind Themenwelten mit eigener Wasserfarbe, Hindernismix und Wetterprofil. Jeder Hafen ist ein Zielpunkt mit Name, Position und Mission-Anbindung.

| Revier | Stimmung | Schaltet bei |
|---|---|---|
| **Ruhige Bucht** | Einsteiger, klar, wenig Verkehr | Start |
| **Hafenkanal** | enge Durchfahrten, Gegenverkehr | Level 4 |
| **Seenplatte** | offen, Wind & Wellen | Level 8 |
| **Schleusenrevier** | Schleusen, Zeitdruck | Level 12 |
| **Berlin-Brandenburg (real)** | echte Wassergebiete (Erweiterung) | später / Event |

Datenstruktur erlaubt beliebig viele Reviere & Häfen (siehe Datenmodelle, `regions.js`).

---

## 11. UI-Konzept

**Designsprache:** dunkler maritimer Hintergrund, animierte Wasserfläche, goldene Highlights, weiche Schatten, Glas-/Frosted-Flächen (`backdrop-filter`), klare Typografie, ruhige Mikroanimationen. Mobile-first, Hochformat, Touch-Targets ≥ 48 px.

**Screens:**
- **Startscreen** – Wave-Bite-Branding, Buttons: Start, Missionen, Boote, Fortschritt, Einstellungen.
- **Missionsauswahl** – Liste der freigeschalteten Missionstypen mit Reward-Vorschau.
- **Boote** – Bootskarten mit Werte-Balken, Kaufen/Auswählen/Upgraden.
- **Fortschritt** – Captain-Level, XP-Balken, Coins, Statistiken, Daily/Weekly, Achievements.
- **Einstellungen** – Sound an/aus, Vibration, Fortschritt zurücksetzen, Version, (Club-Login vorbereitet).
- **Gameplay-HUD** – Coins, XP, Level, aktuelle Mission, Timer, Boost-Anzeige, Zielentfernung/Kompass, Pause.
- **Pause- & Ergebnis-Overlay** – Fortsetzen/Abbrechen; Sterne, Coins, XP, Weiter.

**Navigationsprinzip:** ein aktiver Screen, Stack-frei, jeder Button führt zu echtem Inhalt. Keine leeren Screens, keine toten Buttons.

---

## 12. Sound- & Animationskonzept

- **Audio:** dezent, über WebAudio synthetisiert (keine schweren Assets im MVP) – sanftes Wasser-Ambiente, weiche UI-Klicks, Coin-/Erfolgs-Ton, Kollisions-Dämpfer. Global an/aus.
- **Mikroanimationen:** Wasser als animierte Sinus-Wellenlinien + Glanzpartikel, Boots-Neigung beim Lenken, Bugwelle/Kielwasser, sanftes Panel-Fade, Coin-Count-Up, Boost-Glow. Ziel: edel & ruhig, 60 fps, keine ruckelnden Sprünge.

---

## 13. Datenmodelle

Vollständig definiert in `src/data/models.js` (Factory-Funktionen mit Defaults). Kernmodelle:

`PlayerProfile`, `Boat`, `Mission`, `Harbor`, `Region`, `Upgrade`, `Achievement`, `DailyTask`, `WeeklyChallenge`, `SaveGame`, `LeaderboardEntry`.

Beispiel (gekürzt):

```js
SaveGame = {
  version, captainLevel, xp, coins,
  selectedBoatId, ownedBoats: { [boatId]: { upgrades:{motor,rudder,boost,hull} } },
  completedMissions: [], stats: { runs, deliveries, perfectRuns, coinsEarned },
  daily: { date, taskId, progress, claimed },
  weekly: { week, challengeId, progress, claimed },
  achievements: { [id]: { unlocked, progress } },
  settings: { sound, vibration }, leaderboardLocal: [], lastPlayed
}
```

Schema-Versionierung (`version`) erlaubt Migrationen ohne Datenverlust.

---

## 14. Speicherlogik

- **Primär:** `localStorage` (JSON, synchron, ausreichend für MVP-Größe).
- **Abstraktion:** `src/systems/save.js` kapselt Lesen/Schreiben/Migrieren → später ohne UI-Änderung auf **IndexedDB** oder Backend umstellbar.
- **Autosave** nach jeder Mission, jedem Kauf, jeder Einstellung.
- **Robustheit:** Try/Catch + Default-Save bei Korruption; Schema-Migration über `version`.

---

## 15. PWA-Konzept

- `manifest.json` – Name, Icons, Theme/Background (#0B1E3B / Gold), `display: standalone`, Hochformat.
- `service-worker.js` – Precache aller Kern-Assets (App-Shell) → **offline spielbar**, Stale-While-Revalidate für Updates.
- **Installierbar** auf Smartphone (Add to Home Screen), eigenes App-Icon (SVG, schlank).
- Kein App-Store nötig; spätere Distribution via QR/Link am POS.

---

## 16. Technische Architektur

- **HTML5 + Canvas** fürs Gameplay, **Vanilla JavaScript** (kein Framework – maximale Smartphone-Performance, kein Build-Tooling).
- **Modulare Schichten** unter globalem Namespace `WB` (klassische Scripts in Abhängigkeitsreihenfolge → läuft auch lokal per Doppelklick, ohne Server):
  - `core` – Engine, Game-Loop (requestAnimationFrame, deltaTime), Wasser-Renderer.
  - `game` – Boot, Hindernisse, Welt/Scrolling, Missions-Runtime, Game-State.
  - `systems` – Save, Progression, Input (Touch+Tastatur), Audio.
  - `data` – Modelle + Definitionen (Boote, Missionen, Reviere, Upgrades, Achievements).
  - `ui` – Screen-Navigation, HUD.
  - `utils` – Mathe, Storage-Helper.
- **Performance:** fixe Logik-Updates per dt, Objekt-Recycling für Hindernisse, kein DOM im Hot-Path, CSS-Transforms für UI.
- **Responsiv:** Canvas skaliert auf Viewport (DPR-aware), UI per CSS-Clamp/Flex.

---

## 17. Ordnerstruktur

```
/wave-bite-captains-run
  /assets
    /icons        (App-Icon SVG)
    /images /audio /boats /ui   (für spätere Assets vorbereitet)
  /src
    /core         engine.js · water.js
    /game         boat.js · obstacle.js · world.js · mission.js · game.js
    /data         models.js · boats.js · missions.js · regions.js · upgrades.js · achievements.js
    /systems      save.js · progression.js · input.js · audio.js
    /ui           screens.js · hud.js
    /utils        math.js · storage.js
    main.js
  /styles         main.css
  /pwa            (Platzhalter für PWA-Assets)
  index.html
  manifest.json
  service-worker.js
  README.md
  KONZEPT.md
```

---

## 18. MVP-Scope

**Drin (spielbar, vollständig):**
- Startscreen mit funktionierendem Branding & 5 Buttons.
- Echtes Canvas-Gameplay: Boot, Touch+Tastatur, links/rechts, Gas, Boost, Hindernisse, Zielhafen.
- 4 Missionstypen (Kaffee, Essen, Eventmaterial, VIP mit Zeitlimit).
- HUD: Coins, XP, Level, Mission, Timer, Boost, Zielentfernung, Pause.
- Progression: XP/Coins/Level, Sterne-Rating, Ergebnis-Overlay.
- Boote: mind. 2 spielbar im MVP (Angelboot frei, Sportboot kaufbar), Werte wirken; weitere vorbereitet.
- Speicherung: localStorage (XP, Coins, Level, Boot, Missionen, Settings).
- PWA: manifest + service-worker + Icon, offline & installierbar.
- Daily-Task & Achievements-Grundlauf.

**Bewusst (noch) draußen:** Online-Leaderboard-Backend, Club-Login-Server, reale Kartendaten, Multi-Stopp-Missionen, gerenderte 3D-Boote.

---

## 19. Spätere Erweiterungen (vorbereitet)

Strukturen/Hooks bereits angelegt: echtes **Online-Leaderboard** (`LeaderboardEntry` + lokaler Cache, API-Stub), **Wave-Bite-Club-Login**, **Hafenkarte**, **reale Reviere Berlin-Brandenburg**, **saisonale Events**, **Sponsorenmissionen**, **Partnerhäfen**, **In-App-Belohnungen**, **QR-Code-Aktionen**, **Event-Freischaltungen**, **Backend-Sync** (Save-Abstraktion macht den Umstieg ohne UI-Bruch möglich).

---

## 20. Risikoanalyse & Prioritäten

| Risiko | Wirkung | Gegenmaßnahme | Prio |
|---|---|---|---|
| Performance auf Low-End-Smartphones | Ruckeln zerstört Premium-Gefühl | dt-Loop, Objekt-Recycling, kein schweres Asset, DPR-cap | **Hoch** |
| „Wirkt billig" trotz Anspruch | Markenschaden | strikte Navy/Gold-Designsprache, Glas-UI, ruhige Animationen | **Hoch** |
| Lokaler Start (file://) bricht ES-Module/SW | nicht lauffähig | klassische Scripts + Namespace; SW nur bei Server aktiv, Spiel läuft trotzdem | **Hoch** |
| Schwierigkeitskurve zu hart/zu lasch | Churn | parametrisierte Difficulty pro Revier/Level, Playtest-Tuning | Mittel |
| localStorage-Limit/Korruption | Fortschrittsverlust | Save-Abstraktion, Migration, Default-Fallback, später IndexedDB | Mittel |
| Scope-Creep (Backend/Club zu früh) | Verzögerung | MVP klar gekapselt, Erweiterungen nur als Hooks | Mittel |
| Marken-Assets fehlen | Optik unfertig | reine CSS/Canvas-Optik + SVG-Icon, asset-Ordner vorbereitet | Niedrig |

**Prioritäten-Reihenfolge:** (1) lauffähige Engine + Steuerung, (2) Premium-Optik, (3) Progression/Save, (4) Screens vollständig, (5) PWA/Offline, (6) Erweiterungs-Hooks.

---

*Ende Phase 1. Folgt: Phase 2 (Struktur) · Phase 3 (Datenmodelle) · Phase 4 (spielbares MVP).*
