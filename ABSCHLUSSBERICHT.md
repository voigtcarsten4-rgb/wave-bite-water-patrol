# Wave Bite: Water Patrol — Statusbericht (Tracking · Bewertung · Wasserlage-Integration)

**Stand:** 31. Mai 2026. **Wichtig:** Dies ist ein **Zwischenstand**, kein finaler Abschluss — die Test-/Build-Sandbox (VM) war während dieser Phase offline, daher konnten **automatisierte Tests, `npm run build` und ein Backup nicht ausgeführt** werden. Dein Release-Gate (getestet, bugfrei, Backup) ist erst nach Verifikation erfüllt.

## Umgesetzt (additiv, bestehende Funktionen nicht verändert)
**Spiel (`wave-bite-captains-run`):**
- `src/systems/track.js` — lokale, fehlergekapselte Tracking-Bridge (localStorage, keine Übertragung, abschaltbar).
- Instrumentierung (gekapselt): `game_open` (main), `mission_start`/`mission_complete`/`mission_fail` (game), `level_up` (progression), `rank_up` (game), `pwa_prompt`/`pwa_installed` (main), Bewertungs-Events.
- `src/ui/rating.js` + Overlay + CSS — subtiles „Zwischenfunk"-Bewertungsgespräch, **einmalig bei Beförderung** (ab ≥2 Einsätzen), 1–5 Sterne + Kommentar + Später/Nie.
- Einstellungen: Schalter „Nutzungsstatistik (nur lokal)"; Datenschutztext ergänzt.
- `dashboard.html` — eigenständiges Premium-Tracking-Dashboard (KPI-Karten, Funnel, Einsatztypen, Aktivität/Tag, Feedback, Event-Log, Datenschutz-Status, JSON-Export).

**Wasserlage-Site (`Wave-Bite-Website`, Next.js):**
- `components/marketing/SimulatorPromo.tsx` (neu, additiv).
- `app/wsp-simulator/page.tsx` (neue Route: Slogan, Spiel-Embed, Install-Anleitung, CTA).
- `app/page.tsx`: eine additive Zeile (`<SimulatorPromo />`).
- Game-URL über `NEXT_PUBLIC_WSP_GAME_URL` konfigurierbar.

**CEO (`Desktop\CEO`):**
- `14_Reporting_KPIs/CEO_KPI_SYSTEM.md`: Block „3b. WAVE BITE GAME" (additiv).
- `04_App_Plattform/WAVE_BITE_GAME_TRACKING.md`: Handover/Architektur.

## Geänderte/neue Dateien
Spiel: + track.js, + rating.js, + dashboard.html; geändert: index.html, main.js, game.js, progression.js, screens.js, legal.js, styles/main.css.
Site: + SimulatorPromo.tsx, + app/wsp-simulator/page.tsx; geändert: app/page.tsx.
CEO: geändert CEO_KPI_SYSTEM.md; + WAVE_BITE_GAME_TRACKING.md.

## Aktive Tracking-Events
game_open, mission_start, mission_complete, mission_fail, level_up, rank_up, pwa_prompt, pwa_installed, rating_submitted, rating_later, rating_never.

## Datenschutz / Recht
Lokales Tracking (keine Übertragung, keine Cookies) → kein Consent-Banner nötig; Opt-out vorhanden; Datenschutztext + Impressum im Spiel; fiktive Behörde. Server-Aggregation nur mit Consent + Endpoint (dokumentiert).

## Offene Restrisiken / nächste Schritte
1. **Verifikation ausstehend (VM offline):** Spiel im Browser prüfen (Tracking/Bewertung), Site `npm run build` ausführen — **vor Deploy**.
2. **Game deployen** (GitHub Pages/Vercel) → URL in `NEXT_PUBLIC_WSP_GAME_URL` der Site setzen.
3. **Push** in `voigtcarsten4-rgb/wasserlage` (Site) + `wave-bite-ceo-office` (CEO) — nach deiner Freigabe.
4. **Backup** anlegen (sobald VM/git verfügbar): `wavebite-waterlage-game-tracking-final-2026-05-31`.
5. Optional: CEO-weite Aggregation via Backend (Supabase) — Architektur im Handover.
