# Deployment – Live‑URL für Wave Bite: Water Patrol

Das Spiel ist eine statische PWA (HTML/CSS/JS + Assets) → läuft auf jedem Static‑Host. Empfohlen: **GitHub Pages** (kostenlos, eigene URL).

## Variante A · GitHub Pages (empfohlen, bringt ALLE Assets live)
Im Projektordner `wave-bite-captains-run` ausführen (Git installiert):

```bash
cd "C:\Users\Startklar\Documents\Claude\Projects\Wave Bite Game\wave-bite-captains-run"
git init
git add .
git commit -m "Wave Bite: Water Patrol – Vollversion"
git branch -M main
# Repo vorher auf github.com anlegen (z. B. wave-bite-water-patrol), dann:
git remote add origin https://github.com/<DEIN-USER>/wave-bite-water-patrol.git
git push -u origin main
```
Danach auf GitHub: **Settings → Pages → Branch: main / (root) → Save**.
Live‑URL erscheint nach ~1 Min: `https://<DEIN-USER>.github.io/wave-bite-water-patrol/`

> Die ~35 MB Bilder/Videos in `assets/` werden mit hochgeladen (Git/GitHub‑Pages‑Limit 1 GB – problemlos).

## Variante B · Vercel / Netlify (Drag & Drop)
Ordner `wave-bite-captains-run` auf **vercel.com** oder **netlify.com/drop** ziehen → sofort eine Live‑URL inkl. HTTPS. Kein Git nötig.

## Hinweis Service‑Worker
Offline/Installierbar (PWA) funktioniert nur über **https** (also auf der Live‑URL), nicht über `file://`. Lokal zum Testen:
```bash
python -m http.server 8080   # dann http://localhost:8080
```

## Soll ich das Repo anlegen?
Den **Code** kann ich über den GitHub‑Connector in ein neues Repo pushen. Die ~35 MB **Medien** (KI‑Bilder/Videos) lädst du am besten per `git push` (Variante A) oder GitHub‑Web‑Upload nach – der API‑Connector ist für so große Binärmengen nicht ideal. Sag **„GitHub‑Repo anlegen"**, dann richte ich Code‑Repo + Pages‑Konfiguration ein und du schiebst die Assets in einem Schritt nach.
