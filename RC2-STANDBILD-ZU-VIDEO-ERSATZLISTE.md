# RC 2.0 · Standbild → Video Ersatzliste (Immersion-Bonus, Welle 4)

> Ziel: mehr Bewegung/Leben ohne Performance-Probleme. Vorschlag — **noch nicht alles angewendet**, Review-Gate.
> Performance-Regel: Videos nur in Intro/Briefing/Belohnung/Übergang/Menü-Hero (nie im Gameplay-Loop), lazy-load, <300 KB/Clip.

## BEREITS ANGEWENDET (v55, dynamisches Intro)
| Lage / Standbild bisher | Jetzt Video |
|---|---|
| Morgen/Sonnenaufgang (wow_sunrise_einsatz, im_steg_mueggelsee, loc_mueggelsee) | vid_a4_sonnenaufgang |
| Berlin/Nacht (wow_berlin_skyline, loc_spree) | vid_a4_nachtfahrt_berlin |
| Sturm/Gewitter (rescue_gewitter, loc_storm) | vid_a4_sturm_seenplatte |
| Nebel (rescue_nebel, im_fischer_seddinsee) | vid_a4_nebel_mueggelsee |
| Regatta (wow_regatta_grosseinsatz, loc_regatta) | vid_a4_regatta |
| Hafenfest (wow_hafenfest_polizei, loc_hafenfest) | vid_a4_hafenfest |
| Blaulicht (ctrl_blaulicht_hafen, wow_blaulicht_nachtnebel) | vid_a4_blaulicht_wasser |
| Glienicke/Havel/Wannsee (loc_glienicker, loc_havel, loc_wannsee) | vid_a4_wasserleben_potsdam |
| Lotse/Mystery (myst_lotse_distanz, char_lotse) | vid_m2_lotse_nebel |

## VORGESCHLAGEN (noch nicht angewendet — Phase 6 Immersion)
| Verwendungsort | Standbild bisher | Vorschlag Video | Aufwand |
|---|---|---|---|
| Menü-Hero (Startscreen) | statischer Hero | vid_w3_heroshot / vid_a4_nachtfahrt_berlin | gering |
| Ladebildschirm | Farbverlauf/Logo | vid_a4_sonnenaufgang (kurz, leise) | gering |
| Login/Rückkehrer | News-Standbild | vid_a4_abendfahrt + Lena-Recap | gering |
| Region-Auswahl Müggelsee | loc_mueggelsee | vid_welt_mueggelsee / vid_a4_sonnenaufgang | gering |
| Region-Auswahl Dahme | loc_dahme | vid_a4_abendfahrt | gering |
| Region-Auswahl Potsdam/Havel | loc_glienicker | vid_a4_wasserleben_potsdam | gering |
| Wetter-Overlay „Regen" | (keins) | vid_a4_regenfront | mittel (Wetter-Hook nötig) |
| Kapitelübergänge | cine-Standbild | je Kapitel-Stimmung passender a4/m2-Clip | mittel |

## NICHT ERSETZEN (bewusst Standbild lassen)
- Gameplay-Cockpit & Welt-Hintergrund im Spiel (Performance: Loop bleibt clip-frei).
- Charakter-Portraits (Lena/Lucy/Wolff) — Standbild korrekt.
- HUD-/UI-Grafiken.
