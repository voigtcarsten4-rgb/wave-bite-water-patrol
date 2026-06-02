/* Wave Bite – Water Patrol · game/world.js
 * ONBOARD COCKPIT VIEW: Der Spieler schaut durch die Frontscheibe des Polizeiboots.
 * Die Welt füllt den GESAMTEN Bildschirm (Himmel→Horizont→Wasser bis fast zum unteren Rand),
 * davor liegt das Cockpit als fixer Vordergrund-Rahmen (Scheibenrahmen, A-Säulen, Armatur, Glasreflex).
 * Bootsbewegung: Rollen (Lenken), Nicken (Tempo/Boost), Schaukeln, Sturm-Wellengang. Welt neigt sich, Cockpit bleibt fix. */
(function (WB) {
  'use strict';
  var M = WB.math;
  function escFromSave(){ try { var s = WB.Save.data, runs = (s.stats && s.stats.runs) || 0, lvl = s.captainLevel || 1; return Math.min(1, runs / 25 * 0.6 + (lvl - 1) / 20 * 0.4); } catch (e) { return 0; } }

  var COCKPIT = 'cockpit_bridge';
  var BG = { bucht: 'loc_mueggelsee', kanal: 'loc_spree', seenplatte: 'loc_dahme', schleuse: 'loc_lock' };
  var TRAFFIC = ['buoy','sail','motor','sup','houseboat','swimmer','ferry','rock','log'];
  // Pro Missionstyp ein klares Ziel + Fahrhinweis (Learning by Playing / UX-Klarheit)
  var OBJ = {
    patrol:   'Streife fahren – im Fahrwasser bleiben, alle Kontrollpunkte abfahren.',
    control:  'Zum Kontrollpunkt fahren und LANGSAM längsseits anlegen.',
    eco:      'Der Verschmutzungsspur folgen – im Fahrwasser bis zur Quelle.',
    pursuit:  'Zielboot verfolgen – Sichtkontakt halten, Abstand verringern.',
    rescue:   'Zur Position navigieren und LANGSAM an die Person heranfahren.',
    smuggler: 'Verdächtigen stellen – an der Schleuse Abstand schließen.'
  };
  var HINT = {
    patrol:'Tonnen: rot links, grün rechts – dazwischen fahren.',
    control:'Beim Anlegen Boost loslassen – langsam andocken.',
    eco:'Bleib in der Gasse, folge den Markern.',
    pursuit:'Nicht rammen – sauber dranbleiben.',
    rescue:'Im Zielbereich Tempo raus – sonst Gefahr für die Person.',
    smuggler:'Eng bleiben, Abstand Schritt für Schritt schließen.'
  };

  function World(boat, region, mission, variant) {
    this.boat = boat; this.region = region; this.mission = mission;
    this.water = new WB.Water();
    this.obstacles = []; this.gulls = [];
    this.scroll = 0; this.progress = 0; this.spawnTimer = 0.7;
    this.harborActive = false; this.harborZ = 1.0;
    this.delivered = false; this.failed = false; this.collisions = 0;
    this.curSpeed = 120; this.playerLane = 0; this.shake = 0; this.flash = 0;
    this.isChase = !!({ pursuit:1, smuggler:1 })[mission.type]; // v45: nur Verfolgung/Schmuggler = Jagd; control/eco/rescue/patrol = Routen-Ziel
    this.failReason = null; this.opp = null;
    this.bgId = BG[region.id] || 'loc_mueggelsee';
    this.cockpitId = COCKPIT;
    this._parts = null; this._lucyT = 0; this._wasBoost = false; this._zone = null; this._zoneEnd = 0;
    this.roll = 0; this.pitch = 0;
    this.storm = !!(mission && (mission.type === 'rescue' || (region && region.id === 'seenplatte'))) ;
    // v45: Route/Checkpoints + Fahrwasser-Lernlogik + Missionsziel
    this.checkpointN = mission.checkpoints || 5;
    this.cpDone = 0;
    this.totalT = 0; this.cleanT = 0; this.offT = 0; this._offWarn = 0; this._dockWarn = 0;
    this.isEscort = (mission.id === 'm_vip' || mission.escort === true);
    this.escortHoldT = 0; this.escortProgress = 0; this._escWarn = 0;
    this.objective = this.isEscort ? 'VIP-Jacht eskortieren – Sicherheitsabstand halten (nicht zu nah, nicht abreißen lassen).' : (OBJ[mission.type] || 'Erreiche den Zielpunkt.');
    this.objectiveHint = this.isEscort ? 'Tempo so anpassen, dass der Abstand im grünen Band bleibt.' : (HINT[mission.type] || '');
    // RC3.0 Phase C: Missions-Variation
    this.variant = variant || (WB.Variation ? WB.Variation.roll(mission) : null);
    var V = this.variant;
    var E = (mission.escalation != null) ? mission.escalation : escFromSave();
    this.escalation = E;
    this.distance = mission.distance * ((V && V.distMul) || 1) * (1 + E * 0.22);
    this._trafficMul = ((V && V.trafficMul) || 1) * (1 + E * 0.6);
    this._curveAmp = 0.52 * (1 + E * 0.30); this._curveAmp2 = 0.20 * (1 + E * 0.30); // RS5: deutlichere Kurven
    this._startLane = (V && V.startLane) || 0;
    this._fog = !!(V && V.weather === 'fog');
    if (V && (V.weather === 'storm')) this.storm = true;
    this._tod = V && V.tod;
  }

  World.prototype.layout = function (w, h) {
    this.w = w; this.h = h;
    this.left = 0; this.right = w;   // v45-Fix: Begrenzung fuer Gegner-AI (lane = right-left, sonst NaN -> Jagd unloesbar)
    // Welt füllt den ganzen Bildschirm; Cockpit-Konsole liegt als Vordergrund über dem unteren Teil.
    this.viewBottom = Math.round(h * 0.965);   // Wasser reicht fast bis zum unteren Rand
    this.horizonY  = Math.round(h * 0.27);     // Horizont weiter oben -> mehr Welt/Tiefe
    this.dashTop   = Math.round(h * 0.76);     // RS5: tiefer -> mehr Fenster (Panorama-Gefühl)
    this.boat.reset(w / 2 + (this._startLane || 0) * w * 0.30, this.viewBottom - 40);
    this.gulls = [];
    for (var i = 0; i < 4; i++) this.gulls.push({ x: M.rand(0, w), y: M.rand(this.horizonY * 0.3, this.horizonY * 1.2), s: M.rand(0.6, 1.2), v: M.rand(8, 20) * (Math.random() < 0.5 ? -1 : 1), ph: Math.random() * 6 });
    if ((this.isChase || this.isEscort) && WB.Opponent) { this.opp = new WB.Opponent(this, this.mission, this.region); if (this.isEscort) this.opp.label = 'VIP-Jacht'; }
  };

  World.prototype.progressRatio = function () { if (this.isEscort) return M.clamp(this.escortProgress, 0, 1); return this.opp ? M.clamp(1 - this.opp.gap, 0, 1) : M.clamp(this.progress / (this.distance || this.mission.distance), 0, 1); };

  // Perspektiv-Projektion: z (1 fern .. 0 nah) -> Bildschirm. Nahebene = viewBottom (unterer Rand).
  World.prototype._t = function (z) { var tt = 1 - M.clamp(z, 0, 1); return tt * tt; };
  World.prototype._projY = function (z) { return this.horizonY + (this.viewBottom - this.horizonY) * this._t(z); };
  World.prototype._laneHalf = function (z) { return M.lerp(this.w * 0.03, this.w * 0.62, this._t(z)); };
  World.prototype._scale = function (z) { return M.lerp(0.18, 2.4, this._t(z)); };
  World.prototype._projX = function (lane, z) {
    var t = this._t(z);
    var shift = this.playerLane * M.lerp(this.w * 0.04, this.w * 0.46, t);
    return this.w / 2 + lane * this._laneHalf(z) - shift;
  };

  World.prototype._spawn = function () {
    // Autonomer Wasserverkehr: Verhalten + passende Bootsklasse, relativ zum Fahrwasser.
    var cc = this._chCenter || 0, hard = this.region.difficulty >= 3;
    var r = Math.random(), behavior, kind, lane, side = (Math.random() < 0.5 ? -1 : 1);
    if (r < 0.34) {                       // Freizeitverkehr NEBEN der Fahrrinne (Rinne bleibt befahrbar)
      behavior = 'cruise'; kind = M.pick(['sup','sail','motor','log','swimmer']);
      lane = M.clamp(cc + side * M.rand(0.5, 0.98), -1.1, 1.1);
    } else if (r < 0.56) {                // querender Verkehr (fährt durch die Rinne -> reagieren!)
      behavior = 'cross'; kind = M.pick(['motor','sail','sup']);
      lane = side * M.rand(0.8, 1.05);
    } else if (r < 0.71) {                // läuft aus einem Hafen aus
      behavior = 'harbor'; kind = M.pick(['motor','sail','sup']);
      lane = side * M.rand(0.85, 1.08);
    } else if (r < 0.82 && hard) {        // langsame Fähre (man überholt sie)
      behavior = 'ferry'; kind = 'ferry'; lane = M.clamp(cc + side * M.rand(0.3, 0.7), -1, 1);
    } else if (r < 0.92) {                // wendendes Boot
      behavior = 'turn'; kind = M.pick(['motor','sail']);
      lane = M.clamp(cc + side * M.rand(0.4, 0.85), -1, 1);
    } else {                              // ankerndes Boot / Hausboot am Rand
      behavior = 'anchor'; kind = M.pick(['houseboat','sail','buoy']);
      lane = M.clamp(cc + side * M.rand(0.6, 1.0), -1.1, 1.1);
    }
    if (!hard && (kind === 'ferry' || kind === 'houseboat')) kind = 'motor';
    this.obstacles.push(new WB.Obstacle(kind, lane, 1.02, behavior));
  };

  World.prototype.update = function (dt, input) {
    var speed = this.boat.forwardSpeed(input);
    this._elapsed = (this._elapsed || 0) + dt;
    var _ramp = Math.min(1, 0.55 + this._elapsed / 7 * 0.45);   // faires Start-Tempo: 55% -> 100% in 7s
    speed *= _ramp;
    this.curSpeed = speed;
    this.boostT = (this.boostT||0) + (this.boat.boosting?dt:0);
    this._spdSum = (this._spdSum||0) + speed*dt;  // fuer Kapitaensprofil (Ø-Tempo)
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.4);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3.2);
    this.scroll += speed * dt;

    this.boat.update(dt, input, 0, this.w);
    var halfRange = (this.w / 2) - (this.boat.w / 2);
    this.playerLane = M.clamp((this.boat.x - this.w / 2) / (halfRange || 1), -1, 1);

    // Bootsbewegung: Rollen (Lenken) + Nicken (Tempo/Boost) – sanft gedämpft, nicht seekrank.
    var stormAmp = this.storm ? 1.0 : 0.45;
    var targetRoll = -this.playerLane * 0.045 + Math.sin(this._lt = (this._lt||0) + dt) * 0 ; // base from steer
    this.roll += (targetRoll - this.roll) * Math.min(1, dt * 4);
    var targetPitch = (this.boat.boosting ? -0.012 : 0) + (speed/2600);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, dt * 3);

    var zRate = speed / 520;
    // FAHRWASSER: rot/grün-Bojengasse, deren Mitte mäandert (Kurven). Spieler faehrt DAZWISCHEN.
    this._chCenter = (this._curveAmp||0.40) * Math.sin(this.scroll * 0.0011) + (this._curveAmp2||0.16) * Math.sin(this.scroll * 0.0029 + 1.3);
    // FAHRWASSER-LERNLOGIK: zwischen den Tonnen (|lane-Mitte|<0.40) = sauberer Kurs.
    this.totalT += dt;
    var _off = Math.abs(this.playerLane - this._chCenter);
    this.inChannel = _off < 0.56;
    if (this.inChannel) { this.cleanT += dt; this.offT = Math.max(0, this.offT - dt * 0.6); }
    else {
      this.offT += dt; this._offWarn -= dt;
      if (this.offT > 1.1 && this._offWarn <= 0) {
        if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('⚠ Zurück ins Fahrwasser – zwischen rot und grün bleiben!');
        if (WB.Audio && WB.Audio.danger) WB.Audio.danger();
        this._offWarn = 2.6;
      }
    }
    this._chT = (this._chT == null ? 0 : this._chT) - dt;
    if (this._chT <= 0) {
      var c = this._chCenter, half = 0.56;
      this.obstacles.push(new WB.Obstacle('buoy',  M.clamp(c - half, -0.9, 0.9), 1.04));   // Backbord rot links
      this.obstacles.push(new WB.Obstacle('buoy_g', M.clamp(c + half, -0.9, 0.9), 1.04));  // Steuerbord grün rechts
      this._chT = M.clamp(1.5 - this.region.difficulty * 0.05, 1.0, 1.6);
    }
    // RS5: KEINE Objektflut. Nur SELTENE, bewusste Einzel-Hindernisse – erst nach Eingewöhnung.
    this.hazardT = (this.hazardT == null ? 9999 : this.hazardT) - dt;
    var hazardStart = 16, hazGap = Math.max(8, 14 - this.region.difficulty * 1.2);
    if (this._elapsed > hazardStart) {
      if (this.hazardT > 9000) this.hazardT = hazGap;            // erstes Hindernis erst nach Eingewöhnung
      if (this.hazardT <= 0) {
        var hk = M.pick(['log','rock','motor']);                 // klar erkennbares Einzelhindernis
        var hSide = (Math.random() < 0.5 ? -1 : 1);
        var inLane = Math.random() < 0.55;                       // bewusste Ausweichaufgabe ODER am Rand
        var hl = inLane ? M.clamp(this._chCenter + M.rand(-0.18, 0.18), -0.8, 0.8)
                        : M.clamp(this._chCenter + hSide * M.rand(0.6, 0.95), -1.0, 1.0);
        this.obstacles.push(new WB.Obstacle(hk, hl, 1.06));
        this.hazardT = hazGap + M.rand(-2, 4);
      }
    }

    // Kollision: Kreuzen der Kamera-Ebene (z passiert Zhit) -> KEIN Durchtunneln bei Tempo/Boost/niedriger FPS.
    var Zhit = 0.10;
    for (var i = this.obstacles.length - 1; i >= 0; i--) {
      var o = this.obstacles[i];
      var pz = o.z;
      o.update(dt, zRate);
      if (!o.counted && pz > Zhit && o.z <= Zhit) {
        o.counted = true;
        var isMarker = (o.kind === 'buoy' || o.kind === 'buoy_g');   // Fahrwasser-Tonnen = Navigation, kein Crash
        if (!isMarker && Math.abs(o.lane - this.playerLane) < (o.hitW + 0.06)) {
          if (this.boat.hit(o.kind === 'swimmer' ? 'log' : o.kind)) {
            this.collisions += 1; this.shake = Math.min(1, this.shake + 0.85); this.flash = 0.6;
            if (this.boat.integrity <= 0) this.failed = true;
          }
        }
      }
      if (o.dead) this.obstacles.splice(i, 1);
    }

    this._lucyT -= dt;
    if (this._lucyT <= 0 && WB.LucyHUD && WB.LucyHUD.say) {
      var near = null;
      for (var n = 0; n < this.obstacles.length; n++) { var oo = this.obstacles[n]; if (oo.z < 0.55 && oo.z > 0.18 && Math.abs(oo.lane - this.playerLane) < 0.3) { near = oo; break; } }
      if (near) { var NM = { buoy:'Boje', sail:'Segler', motor:'Motorboot', sup:'SUP-Fahrer', houseboat:'Hausboot', swimmer:'Schwimmer', ferry:'Fähre', rock:'Felsen', log:'Treibholz' };
        WB.LucyHUD.say((near.lane < this.playerLane ? '◀ ' : '▶ ') + (NM[near.kind] || 'Hindernis') + ' voraus – ausweichen!'); this._lucyT = 3.0; if (WB.Audio) WB.Audio.danger(); }
    }
    if (this.boat.boosting && !this._wasBoost && WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Boost! Achte auf den Verkehr.');
    this._wasBoost = this.boat.boosting;

    if (!this.opp) {
      if (!this._zone && this.progress > 200 && (this.progress % 950) < 9) {
        this._zone = { viol: false }; this._zoneEnd = this.progress + 380;
        if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('🐢 Schutzzone – bitte Tempo drosseln!');
      }
      if (this._zone) {
        if (input.boost || input.throttle) this._zone.viol = true;
        if (this.progress >= this._zoneEnd) {
          if (!this._zone.viol) { WB.Save.data.coins += 25; if (WB.Screens && WB.Screens.refreshTopbar) WB.Screens.refreshTopbar(); if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Vorbildlich gefahren. +25 🪙'); }
          else if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('Zu schnell in der Schutzzone!');
          this._zone = null;
        }
      }
    }

    for (var g = 0; g < this.gulls.length; g++) { var gu = this.gulls[g]; gu.x += gu.v * dt; gu.ph += dt * 6; if (gu.x < -20) gu.x = this.w + 20; if (gu.x > this.w + 20) gu.x = -20; }

    if (this.opp) {
      this.progress += speed * dt;
      this.opp.update(dt, input, this.boat);
      if (this.isEscort) {
        // ESKORTE: Abstandsband halten (nicht jagen). VIP-Jacht faehrt eigenes Tempo:
        // Rueckstellkraft zur Band-Mitte (0.45) -> neutrales Tempo haelt das Band; Boost schliesst auf, Leerlauf reisst ab.
        this.opp.caught = false; this.opp.escaped = false;
        var rel = input.boost ? 1.0 : (input.throttle ? 0.42 : -0.55);
        this.opp.gap = M.clamp(this.opp.gap - rel * 0.16 * dt + (0.45 - this.opp.gap) * 0.30 * dt, 0.05, 0.95);
        var g = this.opp.gap; this._escWarn -= dt;
        if (g > 0.30 && g < 0.62) { this.escortHoldT += dt; this._escBand = 'ok'; }
        else {
          this._escBand = (g <= 0.30) ? 'near' : 'far';
          if (this._escWarn <= 0) {
            if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say(g <= 0.30 ? '⚠ Zu dicht auf die VIP-Jacht – Sicherheitsabstand!' : '⚠ Anschluss verloren – wieder aufschließen!');
            if (WB.Audio && WB.Audio.danger) WB.Audio.danger(); this._escWarn = 2.4;
          }
        }
        var target = this.mission.escortHold || 12;
        this.escortProgress = M.clamp(this.escortHoldT / target, 0, 1);
        if (this.escortHoldT >= target) this.delivered = true;
      } else {
        if (this.opp.caught) this.delivered = true;
        else if (this.opp.escaped) { this.failed = true; this.failReason = 'escaped'; }
      }
    } else if (!this.harborActive) {
      this.progress += speed * dt;
      if (this.progress >= this.distance) { this.harborActive = true; this.harborZ = 1.0;
        if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say(this.mission.type==='rescue' ? '🛟 Zielbereich – jetzt LANGSAM heran!' : (this.mission.type==='control'||this.mission.type==='smuggler') ? '🔦 Anlegen – Boost loslassen, langsam längsseits!' : '⚓ Zielpunkt voraus.');
      }
    } else {
      // Anlegen/Annähern: bei control/rescue/smuggler muss LANGSAM gefahren werden (kein Boost) – sonst Strafe.
      var slowMiss = (this.mission.type==='control'||this.mission.type==='rescue'||this.mission.type==='smuggler');
      var tooFast = slowMiss && this.boat.boosting;
      this._dockWarn -= dt;
      if (tooFast) {
        this.harborZ -= zRate * dt * 0.25;
        if (this._dockWarn <= 0) { if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say(this.mission.type==='rescue' ? '🐢 Zu schnell – die Person nicht gefährden!' : '🐢 Zu schnell zum Anlegen – Tempo raus!'); this._dockWarn = 1.8; this.dockPenalty = true; }
      } else {
        this.harborZ -= zRate * dt;
      }
      if (this.harborZ <= 0.05) this.delivered = true;
    }
    this._updateCheckpoints();
  };

  // v45: Checkpoint-Fortschritt aus progressRatio; Belohnung steigt mit sauberem Kurs.
  World.prototype._updateCheckpoints = function () {
    var r = this.progressRatio();
    var target = Math.floor(r * this.checkpointN);
    if (target > this.cpDone && this.cpDone < this.checkpointN) {
      this.cpDone = Math.min(target, this.checkpointN);
      var cleanRatio = this.totalT > 1 ? (this.cleanT / this.totalT) : 1;
      var bonus = 10 + Math.round(cleanRatio * 18);
      try { WB.Save.data.coins += bonus; if (WB.Screens && WB.Screens.refreshTopbar) WB.Screens.refreshTopbar(); } catch (e) {}
      if (WB.LucyHUD && WB.LucyHUD.say) WB.LucyHUD.say('✓ Kontrollpunkt ' + this.cpDone + '/' + this.checkpointN + ' · +' + bonus + ' 🪙');
      if (WB.Audio && WB.Audio.radar) WB.Audio.radar();
    }
  };

  World.prototype._waterAndSky = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, dt = this.dashTop, oh = h0(this);
    var img = WB.Assets && WB.Assets.get(this.bgId);
    var zoom = 1.04 + 0.03 * Math.sin(t * 0.2);
    var px = -this.playerLane * w * 0.06;
    // Berlin-Brandenburg-Kulisse füllt die GANZE Scheibe (man fährt darauf zu)
    if (img && img.complete && img.naturalWidth) {
      ctx.save(); ctx.beginPath(); ctx.rect(-w*0.2, -oh, w*1.4, vb + oh); ctx.clip();
      var dw = w * zoom * 1.22, dh = (vb) * zoom * 1.0;
      WB.Assets.drawCover(ctx, img, (w - dw) / 2 + px, -oh*0.4, dw, dh);
      ctx.restore();
    } else {
      var sky = ctx.createLinearGradient(0, 0, 0, vb); sky.addColorStop(0, '#2b557e'); sky.addColorStop(0.5, '#1b3a5e'); sky.addColorStop(1, this.region.waterBottom);
      ctx.fillStyle = sky; ctx.fillRect(-w*0.2, -oh, w*1.4, vb + oh);
    }
    // Wasser blendet über der Kulisse ein: am Horizont durchsichtig -> unten voll (Fahrwasser)
    var wg = ctx.createLinearGradient(0, hy, 0, vb);
    wg.addColorStop(0, 'rgba(22,64,100,0.0)');
    wg.addColorStop(0.30, 'rgba(18,56,90,0.55)');
    wg.addColorStop(0.65, 'rgba(13,42,70,0.92)');
    wg.addColorStop(1, 'rgba(8,26,44,1)');
    ctx.fillStyle = wg; ctx.fillRect(-w*0.2, hy, w*1.4, vb - hy + oh);
    // sanftes Glanzband direkt unter dem Horizont (Sonnen-/Lichtspiegelung)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var gl = ctx.createLinearGradient(0, hy - 6, 0, hy + 70);
    gl.addColorStop(0, 'rgba(255,236,190,0.0)'); gl.addColorStop(0.4, 'rgba(255,236,190,0.16)'); gl.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, hy - 6, w, 76); ctx.restore();
    // Tiefen-/Fahrlinien zum Fluchtpunkt (nur im unteren, voll deckenden Wasserbereich)
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1;
    var lanes = [-0.6,-0.3,0,0.3,0.6], i, midY = hy + (vb - hy) * 0.34;
    for (i = 0; i < lanes.length; i++) {
      ctx.beginPath(); ctx.moveTo(w/2 + lanes[i]*this._laneHalf(0) - this.playerLane*w*0.46, vb);
      ctx.lineTo(w/2 + lanes[i]*0.28*this._laneHalf(1) - this.playerLane*w*0.12, midY); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (i = 0; i < 7; i++) {
      var p = ((this.scroll * 0.004 + i / 7) % 1);
      var yy = midY + (vb - midY) * (p * p);
      ctx.beginPath(); ctx.moveTo(-w*0.2, yy); ctx.lineTo(w*1.2, yy); ctx.stroke();
    }
    ctx.restore();
  };
  // kleine Überzeichnung nach unten/oben, damit beim Rollen keine Kanten sichtbar werden
  function h0(self){ return Math.round(self.h * 0.12); }

  World.prototype._drawGulls = function (ctx) {
    ctx.save(); ctx.strokeStyle = 'rgba(20,30,45,0.5)'; ctx.lineWidth = 2;
    for (var i = 0; i < this.gulls.length; i++) {
      var g = this.gulls[i], wsp = 6 * g.s, fl = Math.sin(g.ph) * 3 * g.s;
      ctx.beginPath();
      ctx.moveTo(g.x - wsp, g.y + fl); ctx.lineTo(g.x, g.y); ctx.lineTo(g.x + wsp, g.y + fl);
      ctx.stroke();
    }
    ctx.restore();
  };

  World.prototype._waterGlints = function (ctx, t) {
    var w = this.w, hy = this.horizonY, vb = this.viewBottom;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 6; i++) {
      var p = ((t * 0.05 + i * 0.18) % 1), y = hy + (vb - hy) * (p * p);
      var x = w / 2 + Math.sin(i * 2 + t * 0.3) * (this._laneHalf(1 - p) * 0.5) - this.playerLane * M.lerp(w * 0.04, w * 0.46, p * p);
      var r = 2 + p * 10, g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, 'rgba(255,238,190,' + (0.22 * (1 - p)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,238,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  World.prototype._airLight = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY;
    if (!this._parts) { this._parts = []; for (var k = 0; k < 18; k++) this._parts.push({ x: Math.random() * w, y: Math.random() * vb, s: Math.random() * 1.4 + 0.5, vx: (Math.random() - 0.5) * 6, vy: -(Math.random() * 6 + 2) }); }
    ctx.save();
    for (var i = 0; i < this._parts.length; i++) { var pp = this._parts[i]; pp.x += pp.vx * 0.016; pp.y += pp.vy * 0.016; if (pp.y < 0) { pp.y = vb; pp.x = Math.random() * w; } ctx.fillStyle = 'rgba(255,245,210,0.20)'; ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.s, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    var bl = document.getElementById('bluelight');
    if (bl && bl.classList.contains('on')) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bg = ctx.createLinearGradient(0, hy, 0, vb); bg.addColorStop(0, 'rgba(60,140,255,' + (0.05 + pulse * 0.20).toFixed(2) + ')'); bg.addColorStop(1, 'rgba(60,140,255,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, hy, w, vb - hy); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var lg = ctx.createRadialGradient(w * 0.5, hy * 0.5, 2, w * 0.5, hy * 0.5, hy * 1.6);
    lg.addColorStop(0, 'rgba(255,225,160,0.16)'); lg.addColorStop(1, 'rgba(255,225,160,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, hy * 1.8); ctx.restore();
  };

  // ---------- Cockpit-Vordergrund: FESTE Frontscheibe (3 Scheiben, A-Holme, Mittelstege, Dach) + Armatur ----------
  World.prototype._drawCockpit = function (ctx, t) {
    var w = this.w, h = this.h, dt = this.dashTop, hy = this.horizonY;
    var roofH = Math.round(h * 0.05);
    var yTop = roofH, yBot = dt;
    var pOut = Math.round(w * 0.10);     // A-Holm-Breite (unten)
    var mW   = Math.round(w * 0.030);    // Mittelsteg-Breite
    var rake = Math.round(w * 0.030);    // Einzug nach oben (geneigter Rahmen)
    var steel = '#1d3a58';
    var innerL = pOut, innerR = w - pOut, innerW = innerR - innerL;
    var b1 = innerL + innerW * 0.30, b2 = innerL + innerW * 0.70;  // 3 Scheiben: links 30% / mitte 40% / rechts 30%

    // tubuläre Rahmen-Säule als Trapez mit Quergradient (3D) + Gold-Kanten
    function pillar(botCx, botHalf, topCx, topHalf) {
      var g = ctx.createLinearGradient(botCx - botHalf, 0, botCx + botHalf, 0);
      g.addColorStop(0, '#050d18'); g.addColorStop(0.5, steel); g.addColorStop(1, '#050d18');
      ctx.beginPath();
      ctx.moveTo(botCx - botHalf, yBot); ctx.lineTo(botCx + botHalf, yBot);
      ctx.lineTo(topCx + topHalf, yTop); ctx.lineTo(topCx - topHalf, yTop); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(201,162,75,0.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(botCx - botHalf, yBot); ctx.lineTo(topCx - topHalf, yTop);
      ctx.moveTo(botCx + botHalf, yBot); ctx.lineTo(topCx + topHalf, yTop); ctx.stroke();
    }
    // Glasreflex je Scheibe (diagonaler Schein, nur in der Fensterfläche)
    function paneGlare(x0, x1) {
      if (x1 <= x0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, yTop, x1 - x0, yBot - yTop); ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      var g = ctx.createLinearGradient(x0, yTop, x1, yBot);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.46, 'rgba(200,225,255,0.05)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.10)'); g.addColorStop(0.55, 'rgba(200,225,255,0.03)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);
      ctx.restore();
    }
    paneGlare(innerL, b1 - mW/2); paneGlare(b1 + mW/2, b2 - mW/2); paneGlare(b2 + mW/2, innerR);

    // Blaulicht-Reflexion auf der Scheibe
    var bl = document.getElementById('bluelight');
    if (bl && bl.classList.contains('on')) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bgGlass = ctx.createLinearGradient(0, yTop, 0, dt * 0.7);
      bgGlass.addColorStop(0, 'rgba(70,150,255,' + (0.05 + pulse * 0.10).toFixed(2) + ')'); bgGlass.addColorStop(1, 'rgba(70,150,255,0)');
      ctx.fillStyle = bgGlass; ctx.fillRect(innerL, yTop, innerW, dt * 0.7); ctx.restore();
    }

    // Dachholm
    var rg = ctx.createLinearGradient(0, 0, 0, roofH);
    rg.addColorStop(0, '#06101c'); rg.addColorStop(1, steel);
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, roofH);
    ctx.strokeStyle = 'rgba(201,162,75,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, roofH); ctx.lineTo(w, roofH); ctx.stroke();
    // A-Holme (außen) + Mittelstege (nach oben leicht eingezogen)
    pillar(pOut/2, pOut/2, pOut/2 + rake, pOut/2 * 0.78);
    pillar(w - pOut/2, pOut/2, w - pOut/2 - rake, pOut/2 * 0.78);
    pillar(b1, mW/2, b1 + rake * 0.35, mW/2 * 0.85);
    pillar(b2, mW/2, b2 - rake * 0.35, mW/2 * 0.85);
    // unterer Scheiben-Abschluss (Cowl-Kante)
    var cowl = ctx.createLinearGradient(0, dt - 18, 0, dt + 4);
    cowl.addColorStop(0, 'rgba(6,14,24,0)'); cowl.addColorStop(1, 'rgba(6,14,24,0.7)');
    ctx.fillStyle = cowl; ctx.fillRect(0, dt - 18, w, 22);

    // Armaturenbrett (cockpit_bridge) als Vordergrund-Konsole unten
    var dash = WB.Assets && WB.Assets.get(this.cockpitId);
    if (dash && dash.complete && dash.naturalWidth) {
      var syc = dash.naturalHeight * 0.40, shc = dash.naturalHeight * 0.60;
      ctx.drawImage(dash, 0, syc, dash.naturalWidth, shc, 0, dt, w, h - dt);
      // Armatur sichtbar aufhellen (Vorlage bleibt, nur Belichtung angehoben)
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var lift = ctx.createLinearGradient(0, dt, 0, h);
      lift.addColorStop(0, 'rgba(70,110,150,0.22)'); lift.addColorStop(0.5, 'rgba(40,70,105,0.16)'); lift.addColorStop(1, 'rgba(20,40,65,0.10)');
      ctx.fillStyle = lift; ctx.fillRect(0, dt, w, h - dt);
      // Instrumenten-Glow (Mitte: Displays/Kompass)
      var ig = ctx.createRadialGradient(w*0.5, dt + (h-dt)*0.42, 4, w*0.5, dt + (h-dt)*0.42, (h-dt)*0.9);
      ig.addColorStop(0, 'rgba(90,170,210,0.18)'); ig.addColorStop(1, 'rgba(90,170,210,0)');
      ctx.fillStyle = ig; ctx.fillRect(0, dt, w, h - dt);
      ctx.restore();
    } else {
      var cg = ctx.createLinearGradient(0, dt, 0, h); cg.addColorStop(0, '#1c3450'); cg.addColorStop(1, '#0b1828');
      ctx.fillStyle = cg; ctx.fillRect(0, dt, w, h - dt);
    }
    // weicher Übergang Scheibe->Armatur + Gold-Kante
    var em = ctx.createLinearGradient(0, dt - 26, 0, dt + 8);
    em.addColorStop(0, 'rgba(7,15,26,0)'); em.addColorStop(1, 'rgba(7,15,26,0.55)');
    ctx.fillStyle = em; ctx.fillRect(0, dt - 26, w, 34);
    // Lebendige Instrumente (subtil): Radar-Sweep links, Funk-Blink rechts
    var cyc = dt + (h-dt)*0.5, rx = w*0.30, rr = (h-dt)*0.30;
    ctx.save();
    ctx.globalAlpha=0.5; ctx.strokeStyle='rgba(90,200,160,0.5)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(rx, cyc, rr, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(rx, cyc, rr*0.6, 0, Math.PI*2); ctx.stroke();
    var ang=(t*1.6)%(Math.PI*2);
    var sweep=ctx.createConicGradient ? null : null;
    ctx.globalAlpha=0.55; ctx.strokeStyle='rgba(120,235,180,0.8)';
    ctx.beginPath(); ctx.moveTo(rx,cyc); ctx.lineTo(rx+Math.cos(ang)*rr, cyc+Math.sin(ang)*rr); ctx.stroke();
    // ein „Kontakt"-Punkt
    var cpt=ang+1.1; ctx.fillStyle='rgba(120,235,180,'+(0.3+0.5*Math.abs(Math.sin(t))).toFixed(2)+')';
    ctx.beginPath(); ctx.arc(rx+Math.cos(cpt)*rr*0.7, cyc+Math.sin(cpt)*rr*0.7, 2.5, 0, Math.PI*2); ctx.fill();
    // Funk-Blink rechts
    var blink=(Math.sin(t*4)>0.6)?1:0; ctx.globalAlpha=0.3+0.6*blink; ctx.fillStyle='#ffcaa0';
    ctx.beginPath(); ctx.arc(w*0.74, dt+(h-dt)*0.32, 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(201,162,75,0.45)'; ctx.fillRect(0, dt - 2, w, 2);
  };

  // EIGENES BOOT als fester Vordergrund: Bug/Vorschiff (Deck, Reling, Mittelnaht, Navlicht) + Bugwelle/Gischt.
  World.prototype._drawBow = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, dt = this.dashTop;
    var spd = Math.min(1, this.curSpeed / 240);
    var cx = w / 2 - this.playerLane * w * 0.05 + Math.sin(t * 1.1) * 2;
    var baseY = dt + 2;
    var tipY = dt - (dt - hy) * 0.34;
    var halfB = w * 0.30;
    var deckTipY = tipY + (baseY - tipY) * 0.16;

    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4 + spd * 0.45;
    var spray = ctx.createRadialGradient(cx, tipY + 6, 3, cx, tipY + 6, 70 + spd * 50);
    spray.addColorStop(0, 'rgba(255,255,255,0.6)'); spray.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spray; ctx.beginPath(); ctx.ellipse(cx + Math.sin(t*8)*3, tipY + 8, 70 + spd*44, 22 + spd*14, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.3 + spd * 0.4;
    [-1, 1].forEach(function (d) {
      var g = ctx.createLinearGradient(cx, tipY, cx + d * (halfB + 60), baseY + 10);
      g.addColorStop(0, 'rgba(230,245,255,0)'); g.addColorStop(0.5, 'rgba(230,245,255,0.5)'); g.addColorStop(1, 'rgba(230,245,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 3 + spd * 5;
      ctx.beginPath(); ctx.moveTo(cx, tipY + 4); ctx.quadraticCurveTo(cx + d * halfB * 0.8, baseY - 30, cx + d * (halfB + 50), baseY + 8); ctx.stroke();
    });
    ctx.restore();

    ctx.save();
    var hull = ctx.createLinearGradient(0, tipY, 0, baseY);
    hull.addColorStop(0, '#0c2238'); hull.addColorStop(1, '#05101d');
    ctx.fillStyle = hull;
    ctx.beginPath(); ctx.moveTo(cx - halfB, baseY); ctx.lineTo(cx, tipY); ctx.lineTo(cx + halfB, baseY); ctx.closePath(); ctx.fill();
    var inset = halfB * 0.74;
    var deck = ctx.createLinearGradient(0, deckTipY, 0, baseY);
    deck.addColorStop(0, 'rgba(238,232,214,0.96)'); deck.addColorStop(1, 'rgba(206,198,178,0.95)');
    ctx.fillStyle = deck;
    ctx.beginPath(); ctx.moveTo(cx - inset, baseY); ctx.lineTo(cx, deckTipY); ctx.lineTo(cx + inset, baseY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#C9A24B'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, deckTipY); ctx.lineTo(cx, baseY); ctx.stroke();
    ctx.strokeStyle = 'rgba(201,162,75,0.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - halfB, baseY); ctx.lineTo(cx, tipY); ctx.lineTo(cx + halfB, baseY); ctx.stroke();
    ctx.strokeStyle = 'rgba(245,240,225,0.5)'; ctx.lineWidth = 1.5;
    [-0.55, 0.55].forEach(function (f) {
      ctx.beginPath(); ctx.moveTo(cx + f * inset, baseY - (baseY - deckTipY) * 0.30); ctx.lineTo(cx + f * inset * 0.55, deckTipY + (baseY - deckTipY) * 0.10); ctx.stroke();
    });
    var nav = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.fillStyle = 'rgba(120,235,180,' + (0.5 + nav * 0.5).toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(cx, deckTipY + 2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  // RS5: Ufer links/rechts – bewegen sich perspektivisch + verschieben mit der Kurve (cc) -> Kurve sichtbar.
  World.prototype._drawBanks = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, cc = this._chCenter || 0, lane = this.playerLane, self = this;
    function px(ln, near){ return near ? (w/2 + ln*self._laneHalf(0) - lane*w*0.46) : (w/2 + ln*0.30*self._laneHalf(1) - lane*w*0.12); }
    var topY = hy + (vb - hy) * 0.05;
    function bank(nearLn, farLn, dir){
      var nearX = px(nearLn, true), farX = px(farLn, false), edge = (dir < 0 ? -w*0.25 : w*1.25);
      ctx.beginPath();
      ctx.moveTo(edge, vb); ctx.lineTo(nearX, vb); ctx.lineTo(farX, topY); ctx.lineTo(edge, topY); ctx.closePath();
      var g = ctx.createLinearGradient(0, topY, 0, vb);
      g.addColorStop(0, 'rgba(36,54,42,0.50)'); g.addColorStop(0.5, 'rgba(26,44,34,0.80)'); g.addColorStop(1, 'rgba(16,30,24,0.94)');
      ctx.fillStyle = g; ctx.fill();
      // Uferlinie (heller Schaum-Saum an der Wasserkante)
      ctx.strokeStyle = 'rgba(150,195,175,0.40)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(nearX, vb); ctx.lineTo(farX, topY); ctx.stroke();
    }
    ctx.save();
    bank(cc - 1.15, cc - 0.62, -1);   // linkes Ufer
    bank(cc + 1.15, cc + 0.62, 1);    // rechtes Ufer
    ctx.restore();
  };

  // Sicherer Fahrkorridor: zwei dezente grüne Linien + kleine Pfeile entlang der aktuellen Spur.
  World.prototype._drawSafeLane = function (ctx, t) {
    var w = this.w, vb = this.viewBottom, hy = this.horizonY, mid = hy + (vb - hy) * 0.34;
    var lane = this.playerLane; var cc = this._chCenter || 0;
    function projX(self, ln, near){ return near ? (w/2 + ln*self._laneHalf(0) - lane*w*0.46) : (w/2 + ln*0.28*self._laneHalf(1) - lane*w*0.12); }
    ctx.save();
    // breiter Korridor passend zur Fahrrinne (Tonnen bei cc±0.56)
    var grd = ctx.createLinearGradient(0, mid, 0, vb);
    grd.addColorStop(0, 'rgba(90,220,170,0.0)'); grd.addColorStop(1, 'rgba(90,220,170,0.40)');
    ctx.strokeStyle = grd; ctx.lineWidth = 3;
    [cc-0.34, cc+0.34].forEach(function(off){
      ctx.beginPath(); ctx.moveTo(projX(this, off, true), vb); ctx.lineTo(projX(this, off, false), mid); ctx.stroke();
    }, this);
    // dezente Neon-Leitlinie in der Mitte (gestrichelt, HUD-Stil) -> "hier fahren"
    ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -(this.scroll * 0.05) % 22;
    var ng = ctx.createLinearGradient(0, mid, 0, vb);
    ng.addColorStop(0, 'rgba(120,235,200,0.0)'); ng.addColorStop(1, 'rgba(150,245,210,0.55)');
    ctx.strokeStyle = ng; ctx.lineWidth = 2.2; ctx.shadowColor = 'rgba(120,235,200,0.8)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(projX(this, cc, true), vb); ctx.lineTo(projX(this, cc, false), mid); ctx.stroke();
    ctx.restore();
    // Richtungspfeile (scrollen nach unten = Fahrtgefühl)
    ctx.fillStyle = 'rgba(120,235,180,0.5)';
    for (var i = 0; i < 3; i++) {
      var p = ((this.scroll * 0.0016 + i / 3) % 1);
      var yy = mid + (vb - mid) * (p * p);
      var cx = w/2 + (cc - lane) * M.lerp(w*0.12, w*0.46, p*p);
      var aw = M.lerp(5, 16, p), ah = M.lerp(4, 12, p);
      ctx.globalAlpha = 0.18 + 0.5 * p;
      ctx.beginPath(); ctx.moveTo(cx - aw, yy - ah); ctx.lineTo(cx, yy); ctx.lineTo(cx + aw, yy - ah); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  // Gefahr-Marker + Label (Typ · Distanz) für die nächsten Objekte – Klarheit statt Überladung.
  World.prototype._drawObstacleMarkers = function (ctx) {
    var near = [];
    for (var i = 0; i < this.obstacles.length; i++) { var o = this.obstacles[i]; if (o.z < 0.82 && o.z > 0.02) near.push(o); }
    near.sort(function (a, b) { return a.z - b.z; });
    var NAME = WB.Obstacle.NAME || {};
    var shown = 0;
    for (var k = 0; k < near.length && shown < 4; k++) {
      var ob = near[k];
      if (ob.kind === 'buoy' || ob.kind === 'buoy_g') continue;   // RS5: Tonnen sind Navigation, keine Gefahr-Marker
      var dlane = Math.abs(ob.lane - this.playerLane);
      var collide = dlane < (ob.hitW + 0.12);
      var risk = (collide && ob.z < 0.6) ? 'red' : (dlane < 0.36 ? 'amber' : 'safe');
      var col = risk === 'red' ? '#ff4d3d' : risk === 'amber' ? '#ffc23d' : '#6fe0a3';
      var x = this._projX(ob.lane, ob.z), y = this._projY(ob.z), sc = this._scale(ob.z);
      var topY = y - 30 * sc - 14;
      // Chevron über dem Objekt
      ctx.save();
      ctx.fillStyle = col; ctx.globalAlpha = 0.92;
      if (risk === 'red') { var pl = 0.6 + 0.4 * Math.sin(ob.phase * 3); ctx.globalAlpha = 0.6 + 0.4 * pl; }
      ctx.beginPath(); ctx.moveTo(x - 8, topY); ctx.lineTo(x + 8, topY); ctx.lineTo(x, topY + 9); ctx.closePath(); ctx.fill();
      // roter Kollisions-Ring direkt am Objekt
      if (risk === 'red') { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(ob.phase * 3);
        ctx.beginPath(); ctx.arc(x, y, 22 * sc, 0, Math.PI * 2); ctx.stroke(); }
      // Label nur bei näheren Objekten (z<0.62)
      if (ob.z < 0.62) {
        var m = Math.max(0, Math.round(ob.z * 110));
        var label = (NAME[ob.kind] || 'Objekt') + ' · ' + m + ' m';
        ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center';
        var tw = ctx.measureText(label).width, bx = x - tw/2 - 7, by = topY - 21, bw = tw + 14, bh = 18;
        ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(6,16,28,0.82)';
        if (M.roundRect) { M.roundRect(ctx, bx, by, bw, bh, 6); ctx.fill(); } else ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9;
        if (M.roundRect) { M.roundRect(ctx, bx, by, bw, bh, 6); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.fillText(label, x, by + 13);
      }
      ctx.restore();
      shown++;
    }
    // Ausweich-Assistent: bei akuter Kollision Richtungs-Pfeile + Kollisionslinie (nur echte Hindernisse)
    var danger=null;
    for (var d=0; d<this.obstacles.length; d++){ var ob2=this.obstacles[d];
      if (ob2.kind === 'buoy' || ob2.kind === 'buoy_g') continue;
      if (ob2.z<0.5 && ob2.z>0.05 && Math.abs(ob2.lane-this.playerLane)<(ob2.hitW+0.14)){ if(!danger||ob2.z<danger.z) danger=ob2; } }
    if (danger){
      var w2=this.w, vb2=this.viewBottom, cy=vb2-(vb2-this.horizonY)*0.30;
      var safeLeft = danger.lane >= this.playerLane;       // Objekt rechts -> links ausweichen
      var sgn = safeLeft ? -1 : 1, dx = w2/2 + sgn*w2*0.20, ddx = w2/2 - sgn*w2*0.16;
      var pulse=0.55+0.45*Math.sin(danger.phase*3);
      ctx.save();
      // grüner Sicher-Pfeil
      ctx.globalAlpha=0.85; ctx.fillStyle='#5fe39a';
      ctx.beginPath(); ctx.moveTo(dx-sgn*16, cy-13); ctx.lineTo(dx+sgn*16, cy); ctx.lineTo(dx-sgn*16, cy+13); ctx.closePath(); ctx.fill();
      // rote Gefahrenseite + Kollisionslinie zum Objekt
      ctx.globalAlpha=0.4+0.4*pulse; ctx.strokeStyle='#ff4d3d'; ctx.lineWidth=3;
      var ox=this._projX(danger.lane,danger.z), oy=this._projY(danger.z);
      ctx.beginPath(); ctx.moveTo(w2/2 - this.playerLane*0, vb2); ctx.lineTo(ox, oy); ctx.stroke();
      ctx.fillStyle='#ff4d3d'; ctx.globalAlpha=0.5+0.4*pulse;
      ctx.beginPath(); ctx.moveTo(ddx+sgn*16, cy-12); ctx.lineTo(ddx-sgn*16, cy); ctx.lineTo(ddx+sgn*16, cy+12); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };

  World.prototype.draw = function (ctx, t) {
    var w = this.w, h = this.h, vb = this.viewBottom, hy = this.horizonY;

    // ---------- WELT (durch die Scheibe) – neigt/rollt mit dem Boot ----------
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, vb); ctx.clip();
    var sx = this.shake * 6 * (Math.sin(t * 53) + Math.sin(t * 31)) * 0.5;
    var sy = this.shake * 4 * (Math.cos(t * 47)) * 0.5;
    var stormAmp = this.storm ? 1.0 : 0.5;
    var bob = (Math.sin(t * 1.1) * 2.2 + Math.sin(t * 2.6) * 1.0) * stormAmp;
    var rollA = this.roll + Math.sin(t * 0.9) * 0.006 * stormAmp;   // Rollen ums untere Zentrum
    var pitchY = this.pitch * h;                                    // Nicken
    // Rotation um (w/2, vb), damit der Horizont kippt, das Cockpit aber fix bleibt
    ctx.translate(w / 2 + sx, vb + sy + bob + pitchY);
    ctx.rotate(rollA);
    ctx.translate(-w / 2, -vb);

    this._waterAndSky(ctx, t);
    this._drawBanks(ctx, t);
    this._waterGlints(ctx, t);
    this._drawGulls(ctx);

    var fog = ctx.createLinearGradient(0, hy - 18, 0, hy + 44);
    fog.addColorStop(0, 'rgba(220,232,245,0.18)'); fog.addColorStop(1, 'rgba(220,232,245,0)');
    ctx.fillStyle = fog; ctx.fillRect(-w*0.2, hy - 18, w*1.4, 64);

    if (this.harborActive) {
      var hyP = this._projY(this.harborZ), sc = this._scale(this.harborZ);
      ctx.fillStyle = 'rgba(201,162,75,0.9)'; ctx.fillRect(w/2 - 120*sc, hyP - 6*sc, 240*sc, 12*sc);
      ctx.fillStyle = '#F5F0E1'; ctx.font = (13*Math.max(sc,0.6)|0) + 'px system-ui,sans-serif'; ctx.textAlign='center';
      var hn = (this.region.harbors && this.region.harbors[0]) ? this.region.harbors[0].name : 'Zielpunkt';
      ctx.fillText('⚓ ' + hn, w/2, hyP - 12*sc);
    }

    // Safe-Lane / Navigationskorridor (dezent, grün) – zeigt den sicheren Kurs
    this._drawSafeLane(ctx, t);

    var sorted = this.obstacles.slice().sort(function (a, b) { return b.z - a.z; });
    for (var i = 0; i < sorted.length; i++) {
      var o = sorted[i];
      o.drawAt(ctx, this._projX(o.lane, o.z), this._projY(o.z), this._scale(o.z));
    }
    // Gefahr-Marker + Distanz-Labels für die nächsten relevanten Objekte (max 4)
    this._drawObstacleMarkers(ctx);
    if (this.opp) this.opp.draw(ctx, t);
    this._airLight(ctx, t);

    // (Eigenes Boot / Bug wird als FIXER Vordergrund nach dem Welt-Restore gezeichnet -> _drawBow)
    if (this.boat.boosting) {
      var bv = ctx.createRadialGradient(w/2, vb*0.5, vb*0.2, w/2, vb*0.5, vb*0.95);
      bv.addColorStop(0,'rgba(201,162,75,0)'); bv.addColorStop(1,'rgba(201,162,75,0.2)');
      ctx.fillStyle = bv; ctx.fillRect(-w*0.2,-h*0.12,w*1.4,vb+h*0.24);
    }
    if (this.flash > 0) { ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(201,70,47,'+(this.flash*0.5).toFixed(3)+')'; ctx.fillRect(-w*0.2,-h*0.12,w*1.4,vb+h*0.24); ctx.restore(); }
    ctx.restore(); // Ende Welt-Rotation/Clip

    // ---------- EIGENES BOOT (fixer Vordergrund – rollt NICHT mit der Welt) ----------
    this._drawBow(ctx, t);

    // ---------- Tageszeit-Farbwelt über der Welt ----------
    var hr = new Date().getHours(), tint;
    if (this._tod === 'morgen') hr = 7; else if (this._tod === 'tag') hr = 13; else if (this._tod === 'abend') hr = 19; else if (this._tod === 'nacht') hr = 23;
    if (hr < 7 || hr >= 21) tint = 'rgba(50,95,175,0.12)';
    else if (hr >= 18) tint = 'rgba(255,180,95,0.12)';
    else tint = 'rgba(255,228,150,0.07)';
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = tint; ctx.fillRect(0, 0, w, vb); ctx.restore();

    // Vignette über der ganzen Sicht (Tiefe)
    var vig = ctx.createRadialGradient(w/2, vb*0.45, vb*0.36, w/2, vb*0.45, vb*1.02);
    vig.addColorStop(0,'rgba(4,10,20,0)'); vig.addColorStop(0.7,'rgba(4,10,20,0)'); vig.addColorStop(1,'rgba(4,10,20,0.34)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,vb);

    // ---------- Cockpit-Vordergrund (fix, bewegt sich NICHT mit der Welt) ----------
    this._drawCockpit(ctx, t);
  };

  WB.World = World;
})(window.WB = window.WB || {});
