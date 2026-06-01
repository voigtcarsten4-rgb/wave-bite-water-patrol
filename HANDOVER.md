# HANDOVER — Wave Bite: Water Patrol (kompakt, zum autonomen Abschluss nach VM-Neustart)

**Stand:** 31.05.2026. Datei-Arbeit vollständig; **VM/Bash war offline** → Tests, `npm run build`, Git, Asset-Generierung ausstehend. Nach Neustart der Cowork-Session/Desktop-App läuft Bash wieder — dann diesen Plan abarbeiten.

## Orte / Repos
- **Spiel:** `C:\Users\Startklar\Documents\Claude\Projects\Wave Bite Game\wave-bite-captains-run` (Vanilla JS PWA, Namespace `WB`, klassische Scripts).
- **Wasserlage-Site (lokal):** `C:\Users\Startklar\Desktop\Wave-Bite-Website\wave-bite-app` (Next.js) → GitHub `voigtcarsten4-rgb/wasserlage`.
- **CEO:** `C:\Users\Startklar\Desktop\CEO` (Markdown-System) → GitHub `voigtcarsten4-rgb/wave-bite-ceo-office`.
- **Leonardo-Key:** kommt aus ENV `LEONARDO_API_KEY`, **nicht im Code/Repo**. (Der vom User genannte Key kann rotiert sein.)

## Spiel — fertig (alle additiv, defensiv gekapselt)
Onboard-Cockpit (Bild als Armaturenbrett), F1-Feeling, Polizei-Einsätze (kein Food), Funk-Briefings, Story-Kampagne (10 Kapitel, Dialog+Entscheidungen), Live-Water-Region-Endlosmodus mit Lucy, Radar-Minispiel, 10-Rang-System + SVG-Insignien, WOW-Intro (Patrouillenboot-Clip), Cinematics + 7 AI-Clips (Erfolg/Crash/Escape/Intro), Treibstoff, Polizei-Aktionen (Blaulicht/Sirene/Funk/Spotlight), Kapitäns-Karte, lokales Tracking (`src/systems/track.js`) + subtile Bewertung (`src/ui/rating.js`), Consent + Datenschutz, PWA (SW v9), 41 Assets (34 Bilder + 7 mp4). Tracking-Dashboard: `dashboard.html`.

## Wasserlage-Site — fertig (additiv, dezent)
`components/marketing/SimulatorPromo.tsx` (kompakte Karte: Icon + Kurz-Install-Anleitung + CTA), `app/wsp-simulator/page.tsx` (Embed/Install/Slogan), `app/page.tsx` (+1 Zeile `<SimulatorPromo/>`). Game-URL via `NEXT_PUBLIC_WSP_GAME_URL`.

## CEO — fertig (additiv)
`14_Reporting_KPIs/CEO_KPI_SYSTEM.md` Block „3b. WAVE BITE GAME"; `04_App_Plattform/WAVE_BITE_GAME_TRACKING.md` (Handover/Backend-Schritt).

## OFFENE PUNKTE (nach VM-Neustart autonom abarbeiten)
1. **Game-QA:** `cd wave-bite-captains-run && node --check $(find src -name "*.js")` → alle grün. Headless-Harness (siehe frühere /tmp-Tests) erneut: Module laden, Mission-Run, Rang/Bewertung/Tracking. 0 Fehler erwartet.
2. **Site-Build:** `cd Wave-Bite-Website/wave-bite-app && npm install && npm run build` → muss fehlerfrei sein (additive Dateien). Bei Fehler: Imports/Klassen in `SimulatorPromo.tsx` / `app/wsp-simulator/page.tsx` prüfen (nutzen nur vorhandene Idiome: `@/components/ui/button`, lucide-react, `bg-ocean-deep`, `wb-headline`).
3. **Game deployen:** GitHub Pages oder Vercel (siehe `DEPLOY.md`). Danach **`NEXT_PUBLIC_WSP_GAME_URL`** in der Site setzen.
4. **Push:** Site → `wasserlage`, CEO → `wave-bite-ceo-office` (nur additive Dateien). Erst nach erfolgreichem Build.
5. **Backup:** `wavebite-waterlage-game-tracking-final-2026-05-31` (Zip/Commit).
6. **Aufräumen:** Stray-Testdateien `assets/_writetest_new.txt`, `assets/cockpit/_t.png` löschen (Shell konnte nicht; nach Neustart `rm`).

## RISIKEN
- **Datei-Tool↔Bash-Sync:** editierte Dateien erscheinen in Bash teils verzögert/abgeschnitten — **echte Datei (Browser/Build) ist korrekt**; bei „Unexpected end of input" in node erst `Read`-Verifikation, nicht Datei „reparieren".
- **Voll-Write über kürzere Datei** kann im Mount Null-Bytes hinterlassen → bei Bedarf via Shell `cat >` neu schreiben.
- **Site-Build ungetestet** (VM-Ausfall): vor Live-Deploy zwingend `npm run build`.
- **CEO-weite Aggregation** braucht Backend (Events sind geräte-lokal) — bewusst später.
- **Leonardo-Tokens/Key:** ggf. rotiert; Pipeline `tools/leonardo-generate.js` / `leonardo-motion.js` ist resume-fähig.

## DESIGN-LEITPLANKE
Wasserlage bleibt „Google Maps der Bootsfahrer" — Game dezent, aber präsent. Fiktive „Maritime Patrol Unit", keine echten Hoheitszeichen. Navy/Gold/Glas. Kein Food-Bezug.
