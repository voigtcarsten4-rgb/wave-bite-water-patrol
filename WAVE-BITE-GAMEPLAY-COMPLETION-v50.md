# Wave Bite – Water Patrol · GAMEPLAY COMPLETION BUILD v50

**Stand:** 2. Juni 2026 · **Version:** v50 · **Commit:** 314f87e · **Branch:** main
**Live:** https://voigtcarsten4-rgb.github.io/wave-bite-water-patrol/
**Service-Worker-Cache:** wavebite-captainsrun-v50

## 1. Grundstatus
- Scripts (Cache-Busting v50): ~44 Module · 0 fehlend (alle HTTP 200)
- Missionen: 15 (6 Typen) · Story-Kapitel: 10 · Minispiele: 5 (modernisiert)
- Assets: 154 WebP · Videos: 41 MP4 · Audio: prozedural (30 Funktionen, Immersion-Pass)
- Console: 0 Errors · 404: 0 · NaN/undefined im Gameplay: 0

## 2. In diesem Build umgesetzt (v45–v50)
**Route & Checkpoints (P1/P2):** 5 Kontrollpunkte je Mission, Fortschritt im HUD („Kontrollpunkte 3/5"), Belohnung pro Punkt (steigt mit sauberem Kurs).
**Fahrwasser-Lernlogik (P6):** rot/grün-Tonnengasse; zwischen den Tonnen = „🟢 im Fahrwasser" + Bonus, raus = „🔴 raus aus der Gasse" + Warnung.
**Missionsdifferenzierung (P3):** Verfolgung/Schmuggler = Jagd (Abstand schließen); Kontrolle/Umwelt/Rettung/Streife = Routen-Ziel mit langsamem Anlegen/Annähern. Eigene Ziel-/Hinweistexte.
**Bugfix:** `world.left/right` gesetzt → Gegner-KI `gap` nicht mehr NaN (Verfolgung/Schmuggler waren vorher unlösbar).
**Minispiele modernisiert (P4):** Radar/Sonar (Sweep, bewegte Kontakte, Störsignale, Kurs/Distanz), Funk (Kanal 16, Rufzeichen, richtige Antwort, Squelch, Lena), Schleuse (Ampel, Tempo/Abstand, Einfahrt-Timing), Hafenkontrolle (Papiere/Verhalten/Ladegut, Augenmaß), Rettung (orten → sacht annähern → Rettungszone halten). Teal/Gold, Lucy/Lena, mobil, klares Erfolgs-/Fehlerfeedback.
**Autonomer KI-Verkehr (P5):** querende Boote, Hafenauslauf, wendende Boote, ankernde Boote/Hausboote, langsame Fähren (man überholt), variable Annäherungsgeschwindigkeit — platziert relativ zum Fahrwasser (Rinne bleibt befahrbar, Querverkehr als Reaktionsanlass).
**Audio Immersion Pass:** Wasser als Basis-Layer, Wind tempoabhängig, Motor nur dezenter, wandernder Unterbau (kein Dauerbrummen), sporadisch Wellen/Möwe/Horn/Funk/Stadt/Donner, Szenen-Stimmung.

## 3. Live-getestet (in dieser Umgebung verifizierbar)
- Alle 15 Missionen / 6 Typen → WIN, je 5/5 Checkpoints, 0 NaN
- 5 Minispiele öffnen mit korrektem Modul; Gewinn-Pfade Funk (4/4) & Hafenkontrolle (3/3) bestätigt
- KI-Verkehr: Verhaltensmix + laterale Bewegung bestätigt, Rinne befahrbar
- 47 Script-/Core-Ressourcen HTTP 200, Console 0 Errors

## 4. Ehrlich offen (gerätseitige Abnahme nötig — hier nicht prüfbar)
- Subjektiver Audio-Hörtest (30 Min, „nervt etwas?") — kein Tonausgang in der Testumgebung
- Echtes Smartphone / Touch / FPS — Automations-Tab kann Viewport/rAF nicht real abbilden (mobil ist strukturell umgesetzt: kompaktes HUD, große Touch-Zonen, Media-Queries)
- Frame-genaue Sicht von Intro-/Video-Wiedergabe — rAF im Hintergrund-Tab gedrosselt

## 5. Backup
- Git-Tag: `v50-gameplay-completion`
- ZIP: `backups/wave-bite-water-patrol_v50_gameplay-completion_314f87e.zip`
