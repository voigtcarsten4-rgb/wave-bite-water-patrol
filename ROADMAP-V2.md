# ROADMAP V2 — Wave Bite: Water Patrol → AAA-CGI-Niveau (umsetzungsreif)

> Datei-basiert vorbereitet (VM war offline). Reihenfolge = Priorität. Jeder Block ist additiv & einzeln baubar, sobald Bash/Node/npm/Leonardo wieder laufen.

## 0. Sofort nach VM-Rückkehr (Gate)
1. `node --check $(find src -name "*.js")` → 0 Fehler. Headless-Harness erneut (Module-Load, Mission-Run, Rang/Tracking/Bewertung).
2. Site: `cd Wave-Bite-Website/wave-bite-app && npm install && npm run build` → grün.
3. Stray-Files löschen: `assets/_writetest_new.txt`, `assets/cockpit/_t.png`.
4. Backup: `wavebite-final-2026-05-31`.

## 1. Custom-Skill statt npx
`npx skills add` läuft hier nicht. Stattdessen **skill-creator** → Skill `wave-bite-game-design`:
kodifiziert Navy/Gold/Glas, Wasser-Layer-Regeln, Kamera-/Motion-Standards, Minispiel-Schnittstelle, Belohnungskurven. So bleibt jede Erweiterung stilkonsistent.

## 2. Fahr-Szene auf Screenshot-Niveau (CGI-Wasser & Motion)
**Engine (Canvas, file-only baubar):**
- Parallax-Wasser in 3 Layern: Fern-Horizont (Reviere-Bild) · Mittelwasser (animierte Normal-/Glanz-Map) · Nah-Gischt/Bugwelle.
- Boots-Eigenbewegung: Roll/Pitch nach Geschwindigkeit + Kurven-Lean; **Steuerrad dreht sichtbar** (Sprite-Rotation an `boat.vx`).
- Kamera: leichtes Shake bei Boost/Aufprall, sanftes Nachführen in Kurven, „Drohnen-Establishing-Shot" beim Missionsstart (Kamerafahrt übers Wasser → Cockpit).
- Verfolgungs-Motiv: Zielboot mit Abstands-/Skalierungslogik (näher = größer), Wake-Trail.
**Leonardo-Assets (generieren, wenn VM da):** water_normal_loop, foam_wake_sheet (Sprite-Sheet), horizon_dawn/day/dusk/night/fog/storm (6), pursuit_boat_3q (Sheet), drohne_establish_clips (Motion) je Revier.

## 3. Minispiel-Framework + Katalog (≥20, rang-skaliert)
**Framework:** `WB.MiniGame.register(id, {tier, mechanic, render, onResult})` + `play(id,cfg,cb)`. Gemeinsame Overlay-Hülle, Timer, Score→Reward. Rang-Gate: Minispiel-Pool je Rang erweitert; höhere Ränge = mehr aktive Aktionen/Schritte.
**Katalog (Mechanik · Rang-Tier):**
1 Radar-Scan (tap) · Crew
2 Funk-Decoding (zuordnen) · Crew
3 Hafen-Suche (wimmel-tap) · Crew
4 Schleusen-Timing (hold/release) · Crew
5 Zielverfolgung (Fadenkreuz halten) · Officer
6 Rettungsring werfen (Zielwurf-Timing) · Officer
7 Mann-über-Bord (Kurs+Stopp-Manöver) · Officer
8 Ölsperre bauen (Segmente platzieren) · Officer
9 Bergekran (Last balancieren) · Officer
10 Motor-Quickfix (Kabel verbinden) · Officer
11 GPS-Kalibrieren (Drehregler) · Officer
12 Sonar-Ping (Tiefe/Echo lesen) · Command
13 Drohnen-Recon (Gebiet abscannen) · Command
14 Nachtsicht-Suche (Kontrast/Hotspots) · Command
15 Personenkontrolle (Dialog-Entscheidung) · Command
16 Beweissicherung (Foto-Framing) · Command
17 Schlepp-Manöver (Zugkraft dosieren) · Command
18 Sturm-Stabilisierung (Gegensteuern) · Command
19 Funkpeilung (Richtung triangulieren) · Command
20 Konvoi-Eskorte (Formation halten) · Command
21 Schmuggel-Durchsuchung (Verstecke finden) · Command
22 Schleusen-Konvoi (Multi-Timing) · Legend
**Templates (Leonardo):** je Minispiel 1 Hintergrund + 1–2 Icon/Prop-Sheets (Liste in `tools/shotlist.minigames.json` anlegen).

## 4. WSP-Aktionen je Herausforderung (interaktiv)
Aktionsleiste kontextabhängig: Patrouille→Blaulicht/Sirene/Funk · Verfolgung→Stopp-Signal/Funk/Drohne · Rettung→Rettungsring/Bergekran/MOB · Umwelt→Ölsperre/Beweissicherung · Kontrolle→Spotlight/Personenkontrolle. Jede Aktion: kurze visuelle Sequenz + Effekt + Tracking-Event.

## 5. Belohnungs-/Endlos-Logik (mit User wachsen)
- RP/Coins/XP skaliert mit Rang & Schwierigkeit; Minispiel-Bonus additiv.
- Endless-Generator zieht Minispiele rang-gewichtet; Schwierigkeit steigt auch im Top-Rang (mehr Schritte, kürzere Fenster, mehr Gegenverkehr/Wetter).
- Prestige nach „Legend": Saison-Reset mit Multiplikator + exklusive Skins.

## 6. Konkurrenz-Schwachstellen → Wave-Bite-USP
- **Ship/Boat-Sims (Ship Sim, Fishing Barents Sea, Sailaway):** steile Lernkurve, träge, kein Story-Sog, schwache Mobile-UX. → Wave Bite: sofort spielbar, kurze Sessions, Story+Endless, Mobile-first.
- **Police-Sims:** meist Land/Auto, kein maritimes Setting, generisch. → Wave Bite: einzigartiges Wasserschutz-Thema + reale Reviere (Wasserlage).
- **Casual-Runner:** hübsch, aber seicht/repetitiv. → Wave Bite: Premium-Look + echte Einsatz-Tiefe + Rang-Progression.
- **USP:** „Das Google-Maps-der-Bootsfahrer als spielbares Einsatzabenteuer" — Wasserlage-Daten als Gameplay (Wetter/Pegel/Strömung), Community/Events, Club-Anbindung.

## 7. Finalisieren (Live)
Game deployen (GitHub Pages/Vercel) → `NEXT_PUBLIC_WSP_GAME_URL` setzen → Site/CEO pushen → Tracking/Bewertung/Consent live prüfen → Backup. Cookie/Consent: weiterhin nur lokal nötig; bei späterem Server-Tracking Consent-Banner ergänzen.
