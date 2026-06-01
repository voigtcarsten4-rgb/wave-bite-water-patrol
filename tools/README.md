# Asset-Pipeline (Leonardo AI)

Erzeugt die Premium-Bildbibliothek fuer Wave Bite - Captain's Run ueber die Leonardo-API.

## Nutzung
```bash
export LEONARDO_API_KEY="dein_key"        # wird nicht gespeichert, danach rotierbar
node tools/leonardo-generate.js tools/shotlist.mvp.json
```
Mehrfach aufrufen, bis "ALLE ASSETS FERTIG" gemeldet wird (Submit -> Collect, etappenfaehig).
Ergebnisse landen in assets/<kategorie>/, Manifest in src/data/asset-manifest.json.

## Dateien
- leonardo-generate.js  - Pipeline (Phoenix-Modell, Premium-Stil + Negativ-Prompt automatisch)
- shotlist.mvp.json     - MVP-Motivliste (~34)
- LEONARDO-PROMPTS.md   - vollstaendige Prompt-Bibliothek / Rotations-Motive (bis ~192)
