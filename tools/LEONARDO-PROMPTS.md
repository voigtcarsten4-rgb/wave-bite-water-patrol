# Leonardo-AI Prompt-Bibliothek · Wave Bite – Captain's Run (Phase 4)

Vollständige Prompt-Strategie für die Asset-Pipeline. Der Generator (`tools/leonardo-generate.js`)
hängt Basisstil & Negativ-Prompt automatisch an jeden Eintrag der Shotlist an – die Prompts hier
sind die **Motiv-Kerne** zum Rotieren.

## Realismus-Einstellungen (für Premium-Look)
- **Modell:** Leonardo **Phoenix 1.0** (`de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3`) – photoreal/cinematic, gute Textlesbarkeit.
- **Alchemy:** an · **Contrast:** 3.5 · **Dimensionen:** Szenen 1536×864, Portraits 832×1216, UI/Boote 1024×1024.
- **Transparenz:** `transparency: foreground` für UI-Elemente, Boots-Sprites, FX-Overlays (freigestellt).
- Konsistenz: pro Kategorie eine **Seed-Familie** wählen (gleiche Lichtstimmung), dann nur Motiv variieren.

## Globaler Basisstil (automatisch angehängt)
> Premium maritime mobile game asset, realistic cinematic look, dark navy and gold color palette, elegant water reflections, high detail, atmospheric lighting, professional concept art, clean composition, mobile game ready, no cartoon, no childish style.

## Globaler Negativ-Prompt (automatisch)
> cartoon, childish, low quality, blurry, distorted, ugly, oversaturated, cheap mobile game, fantasy, sci-fi spaceship, anime, comic, plastic look, unreadable text, watermark, logo artifacts, bad perspective, extra limbs, deformed faces

## UI-Zusatz (für Kategorie „ui")
> transparent background, clean vector-like premium interface, dark navy glassmorphism, gold accents, high readability, no text unless specified

**Markenrecht:** keine realen Polizei-Hoheitszeichen/Logos. Fiktive Behörde **„Maritime Patrol Unit / Wasserpatrouille Wave Region"** mit eigenem Wave-Bite-Gold-Emblem.

---

## Kategorie-Templates (Variablen in [ ])

- **Cockpit:** `first-person view from the bridge of a modern maritime patrol boat, dashboard with steering wheel, throttle, radar and radio, looking through windshield at [SZENE], [LICHT], subtle blue light reflections on wet glass, navy and gold instruments`
- **Wasserlandschaft:** `wide cinematic view of [REVIER], [TAGESZEIT/WETTER], calm water reflections`
- **Story-Station:** `[ORT-BESCHREIBUNG], maritime setting, [LICHT], cinematic mood`
- **Charakter:** `semi-realistic portrait of [ROLLE], maritime setting, neutral background, cinematic lighting`
- **Boot:** `[BOOTSTYP] on calm water, [PERSPEKTIVE: front / side / three-quarter top / top-down map icon], clean studio maritime lighting, transparent background`
- **UI:** `maritime game [ELEMENT], dark navy glassmorphism, gold accents, transparent background, no text`

---

## Rotations-Motive (Vollausbau ~192 Bilder)

### A) Cockpit / Brücke (12) — [LICHT]/[SZENE] variieren
day · sunset · night · fog · thunderstorm · rain · blue-light active · radar active · radio active · high-speed wake · lock ahead · pursuit mode

### B) Wasserlandschaften (30) — [REVIER] × [TAGESZEIT/WETTER]
calm lake · narrow canal · harbor · marina · lock · under a bridge · island route · forest waterway · sunset water · night water · fog · thunderstorm · rain · event zone · Wave-Bite jetty · houseboat area · boat dock · tourism harbor · industrial harbor · natural shoreline (× Tageszeiten für Varianten)

### C) Story-Zwischenstationen (40)
harbor master office · pier with witness · suspicious boat · abandoned jetty · Wave-Bite station · club member at dock · event deck · boat workshop · lock keeper hut · police radio room · night dock · VIP jetty · storm harbor · missing delivery scene · coffee crates · event material stack · suspicious captain · witness with binoculars · crew member · thief in background (× Tag/Nacht-Varianten)

### D) Charakterportraits (25)
patrol captain · radio operator · harbor master · Wave-Bite crew · club member · tourist · houseboat owner · suspicious boater · supplier · event manager · VIP guest · lock keeper · mechanic · female witness · old captain · child with a clue · photographer · security guard · thief/culprit · false witness (+ Varianten)

### E) Boote (25) — [PERSPEKTIVE] front/side/three-quarter/top-map-icon
patrol boat · fishing boat · sportboat · houseboat · delivery boat · event boat · Wave Bite supply catamaran · premium event ship · suspicious speedboat · old wooden boat · jetski · harbor service boat · rescue boat (× Perspektiven, freigestellt)

### F) UI-Assets (50)
radar · compass · radio · mission map · dialogue box · buttons · warning symbols · weather icons (clear/fog/rain/storm/night) · boost gauge · XP bar · coins · achievement badges · rank insignia (7 Ränge) · harbor markers · destination markers · patrol seal · Wave-Bite gold badges (alle freigestellt, no text)

---

## MVP-Batch (sofort)
Die priorisierten ~34 Motive liegen ausführlich in `tools/shotlist.mvp.json` und werden mit
`node tools/leonardo-generate.js tools/shotlist.mvp.json` erzeugt. Erweiterungs-Batches
(`shotlist.v1.json`, `shotlist.v2.json`) folgen demselben Schema.
