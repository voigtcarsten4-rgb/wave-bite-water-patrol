/* Wave Bite – Captain's Run · game/game.js
 * Spiel-Orchestrierung: Zustände, Missionsstart, Loop, Ende & Ergebnis. */
(function (WB) {
  'use strict';

  var Game = {
    state: 'menu',     // menu | playing | paused | result
    t: 0,
    mode: 'single',   // single | endless | story
    mission: null, region: null, world: null, runtime: null, boatStats: null,

    start: function (missionId) {
      WB.Screens.showBriefing(WB.data.missionById(missionId), missionId);
    },

    _launch: function (missionId) { this.mode = 'single'; this._launchObj(WB.data.missionById(missionId)); },

    startEndless: function (ev) { this.mode = 'endless'; this._launchObj(ev); },

    startStory: function (m) { this.mode = 'story'; this._launchObj(m); },

    _launchObj: function (mission) {
      this.mission = mission;
      if (WB.Retention) WB.Retention.grantComeback(mission);
      this.region = WB.data.regionById(mission.regionId);
      this.boatStats = WB.Progression.effectiveStats(WB.Save.data.selectedBoatId);
      var boat = new WB.Boat(this.boatStats);
      this.variant = (WB.Variation ? WB.Variation.roll(mission) : null);
      this.world = new WB.World(boat, this.region, mission, this.variant);
      this.world.layout(WB.Engine.w, WB.Engine.h);
      this.runtime = new WB.MissionRuntime(mission);
      this.t = 0;
      this.state = 'playing';
      WB.Input.reset();
      if (WB.Track) WB.Track.log('mission_start', { mode: this.mode, id: mission.id, type: mission.type });
      var self = this;
      var begin = function () {
        WB.Screens.showGame(mission);
        try { if (WB.Captain) WB.Captain.greet(); } catch (e) {}
        try { if (WB.Game.variant && WB.LucyHUD) { var v=WB.Game.variant; setTimeout(function(){ WB.LucyHUD.say('📻 '+v.radio); },600); } } catch (e) {}
        if (WB.Engine._resize) WB.Engine._resize();   // Canvas erst messen, wenn der Game-Screen sichtbar ist
        self.world.layout(WB.Engine.w, WB.Engine.h);   // Welt mit gültigen Maßen einrichten (Fix gegen 0×0-Schwarzbild)
        if (WB.Audio) { WB.Audio.unlock(); WB.Audio.startAmbience(); }
        WB.Engine.start(function (dt) { self._tick(dt); });
      };
      // Kino-Einspieler vor dem Einsatz (kurz, per Tap überspringbar).
      // Premium-Still (Asset-4-Niveau) hat Vorrang; sonst Kurz-Clip.
      var hero = WB.Game._missionHero(mission);
      var heroUrl = (WB.Assets && hero) ? WB.Assets.url(hero) : null;
      var mvid = WB.Game._missionVideo(mission);
      var mvidUrl = (WB.Assets && mvid) ? WB.Assets.url(mvid) : null;
      var clip = WB.Game._missionClip(mission);
      var clipUrl = (WB.Assets && clip) ? WB.Assets.url(clip) : null;
      if (WB.Cinematic && (mvidUrl || heroUrl || clipUrl)) {
        WB.Cinematic.play({
          kicker: '● EINSATZ · ' + (WB.data.rankUnit || 'WATER PATROL'),
          title: mission.title, subtitle: mission.objective || '',
          bgUrl: heroUrl,                                   // Fallback-Standbild
          videoUrl: mvidUrl || (heroUrl ? null : clipUrl),  // echtes Video hat Vorrang
          duration: mvidUrl ? 3600 : (heroUrl ? 3000 : 2600)
        }, begin);
      } else { begin(); }
    },

    // Premium-Cinematic-Still je Einsatz (Wave-3). Spezifisch per ID, sonst per Typ.
    _missionHero: function (mission) {
      var byId = {
        m_streife: 'wow_sunrise_einsatz', m_kontrolle: 'ctrl_marina_docs', m_umwelt: 'myst_stroemung_hinweis',
        m_verfolgung: 'chase_dahme', m_rettung: 'rescue_dlrg_koop', m_schmuggler: 'ctrl_schleuse',
        m_speed: 'ctrl_tempo', m_diebstahl: 'chase_schnellboot', m_vip: 'wow_glienicker',
        m_nacht: 'ctrl_funk_nacht', m_funk: 'myst_funksignal', m_beweis: 'myst_geheimtreffen_steg',
        m_vermisst: 'rescue_nebel', m_razzia: 'chase_finale', m_sturm: 'rescue_gewitter'
      };
      var byType = { pursuit: 'chase_highspeed', rescue: 'rescue_sup', smuggler: 'myst_schmuggleruebergabe',
        eco: 'myst_stroemung_hinweis', control: 'ctrl_motorboot', patrol: 'wow_sunrise_einsatz' };
      var id = byId[mission.id] || byType[mission.type] || null;
      return (id && WB.Assets && WB.Assets.has(id)) ? id : null;
    },

    // Echtes Mission-Video je Einsatz (Wave-Video-Phase). null => Standbild-Hero nutzen.
    _missionVideo: function (mission) {
      var byId = { // RC2.0 Welle-1 EINSATZ-Clips je Einsatz (Trigger=Mission-Start, Fallback=Hero-Standbild)
        m_verfolgung:'vid_e2_verfolgung_spree', m_diebstahl:'vid_e2_verfolgung_dahme',
        m_kontrolle:'vid_e2_kontrolle_hausboot', m_speed:'vid_e2_kontrolle_marina', m_vip:'vid_welt_glienicke',
        m_rettung:'vid_e2_rettung_sup', m_sturm:'vid_e2_rettung_wetter',
        m_schmuggler:'vid_e2_schleuse_wernsdorf', m_razzia:'vid_e2_hafenstoerung',
        m_umwelt:'vid_e2_umwelt_oelspur', m_beweis:'vid_myst_uebergabe',
        m_funk:'vid_m2_boje', m_beweis:'vid_m2_uebergabe', m_vermisst:'vid_m2_geheimer_anleger', m_nacht:'vid_m2_lotse_verschwindet', m_streife:'vid_e2_regatta' };
      var byType = { pursuit:'vid_e2_verfolgung_spree', rescue:'vid_e2_rettung_sup', control:'vid_e2_kontrolle_hausboot',
        smuggler:'vid_e2_schleuse_wernsdorf', eco:'vid_e2_umwelt_oelspur', patrol:'vid_welt_berlin' };
      var id = byId[mission.id] || byType[mission.type] || null;
      return (id && WB.Assets && WB.Assets.has(id)) ? id : null;
    },

    // Belohnungs-/Beförderungs-Hero (Wow). Rotierend für Abwechslung.
    _rewardHero: function (promoted) {
      var pool = promoted ? ['wow_elite_aufstieg', 'wow_auszeichnung_wolff', 'wow_hero_shot']
                          : ['wow_hero_shot', 'wow_berlin_skyline', 'wow_abschlussoperation'];
      var lvl = (WB.Save.data && WB.Save.data.captainLevel) || 0;
      var id = pool[lvl % pool.length];
      return (WB.Assets && WB.Assets.has(id)) ? id : null;
    },

    // Wählt einen Kino-Clip passend zu Missionstyp/Revier.
    _missionClip: function (mission) {
      var byType = { pursuit: 'cine_pursuit', smuggler: 'cine_lock', rescue: 'cine_nightlake',
        eco: 'cine_fog', control: 'cine_radio', patrol: 'cine_bay', story: 'cine_boat_hero' };
      var byRegion = { bucht: 'cine_bay', kanal: 'cine_canal', seenplatte: 'cine_nightlake', schleuse: 'cine_lock' };
      var id = byType[mission.type] || byRegion[mission.regionId] || 'cine_boat_hero';
      if (WB.Assets && WB.Assets.has(id)) return id;
      return null;
    },

    _tick: function (dt) {
      this.t += dt;
      var ctx = WB.Engine.ctx;

      if (this.state === 'playing') {
        this.world.update(dt, WB.Input.state);
        this.runtime.tick(dt);
        if (WB.Audio && WB.Audio.setEngine && this.world.boat && this.world.boat.forwardSpeed) WB.Audio.setEngine(this.world.boat.forwardSpeed() / 130);

        if (this.world.delivered) { this._end(true); }
        else if (this.world.failed) { this._end(false, this.world.failReason || 'wrecked'); }
        else if (this.runtime.timeUp && !this.world.delivered) { this._end(false, 'time'); }
      }

      // Zeichnen (auch bei Pause: statisches Bild)
      ctx.clearRect(0, 0, WB.Engine.w, WB.Engine.h);
      this.world.draw(ctx, this.t);

      WB.HUD.update({
        coins: WB.Save.data.coins,
        level: WB.Save.data.captainLevel,
        xpRatio: WB.Save.data.xp / WB.Progression.xpForLevel(WB.Save.data.captainLevel),
        mission: this.mission,
        timeLeft: this.mission.timeLimit > 0 ? this.runtime.timeLeft : null,
        boost: this.world.boat.boostMeter,
        integrity: this.world.boat.integrity,
        fuel: this.world.boat.fuel,
        progress: this.world.progressRatio(),
        chase: !!this.world.opp,
        objective: this.world.objective,
        cpDone: this.world.cpDone,
        cpN: this.world.checkpointN,
        inChannel: this.world.inChannel,
        escort: this.world.isEscort,
        escBand: this.world._escBand,
        escProg: this.world.escortProgress
      });
    },

    togglePause: function () {
      if (this.state === 'playing') { this.state = 'paused'; WB.Screens.showPause(); }
      else if (this.state === 'paused') { this.state = 'playing'; WB.Screens.hidePause(); }
    },

    resume: function () { if (this.state === 'paused') { this.state = 'playing'; WB.Screens.hidePause(); } },

    quit: function () {
      WB.Engine.stop();
      if (WB.Audio) WB.Audio.stopAmbience();
      WB.Input.reset();
      this.mode = 'single';
      if (WB.Endless) WB.Endless.active = false;
      this.state = 'menu';
      WB.Screens.hidePause();
      WB.Screens.showStart();
      var rp = this._ratingPending; this._ratingPending = false;
      if (rp && WB.Rating) WB.Rating.maybePrompt('promotion');
    },

    _end: function (success, reason) {
      WB.Engine.stop();
      try { if (WB.Captain) WB.Captain.recordMission(this.world, { failed: !success }); } catch (e) {}
      if (WB.Audio) WB.Audio.stopAmbience();
      WB.Input.reset();
      this.state = 'result';
      if (success) {
        var res = this.runtime.result(this.world, this.boatStats);
        var applied = this.runtime.apply(res);
        var promotions = WB.Rank.syncAndDetectPromotion();
        var mission = this.mission;
        var promoted = (promotions && promotions.length) ? promotions[promotions.length - 1] : null;
        if (WB.Track) WB.Track.log('mission_complete', { stars: res.stars, mode: this.mode, id: mission.id });
        if (promoted && WB.Track) WB.Track.log('rank_up', { rank: promoted.short });
        this._ratingPending = !!promoted;
        var cfg = {
          kicker: '● FUNK · ' + WB.data.rankUnit,
          bgUrl: (function(){ var h=WB.Game._rewardHero(promoted); return (h&&WB.Assets)?WB.Assets.url(h):((WB.Assets&&mission.briefStation)?WB.Assets.url(mission.briefStation):null); })(),
          videoUrl: (function(){ var pool = promoted ? ['vid_w3_rangaufstieg','vid_w3_wolff','vid_w3_elite','vid_w3_neues_boot'] : (res.perfect ? ['vid_w3_perfekt','vid_w3_heroshot','vid_w3_rettung_erfolg'] : ['vid_w3_heroshot','vid_w3_comeback','vid_w3_neues_revier','vid_w3_story_hinweis']);
            var lvl=(WB.Save.data&&WB.Save.data.captainLevel)||0; var id=pool[lvl%pool.length];
            return (WB.Assets&&WB.Assets.has(id))?WB.Assets.url(id):(WB.Assets?WB.Assets.url(promoted?'cine_boat_hero':'cine_reward'):null); })(),
          title: promoted ? 'BEFÖRDERT' : 'EINSATZ ERFOLGREICH',
          subtitle: promoted ? promoted.name : ('🪙 +' + res.coins + '   ✦ +' + res.xp + ' XP'),
          stars: res.stars,
          insigniaSVG: promoted ? WB.RankInsignia.svg(promoted, 92, true) : null,
          duration: promoted ? 4400 : 3600
        };
        var mode = this.mode;
        var showRes = function () {
          if (mode === 'endless' && WB.Endless) {
            WB.Endless.streak += 1;
            WB.Screens.showEndlessResult({ res: res, applied: applied, promotions: promotions, mission: mission, streak: WB.Endless.streak });
          } else if (mode === 'story' && WB.Story) {
            WB.Story.onChapterWin({ res: res, applied: applied, promotions: promotions, mission: mission });
          } else {
            WB.Screens.showResult({ success: true, res: res, applied: applied, promotions: promotions, mission: mission });
          }
        };
        if (WB.Cinematic) WB.Cinematic.play(cfg, showRes); else { WB.Audio.success(); showRes(); }
      } else {
        var reasonF = reason, missionF = this.mission, modeF = this.mode;
        if (WB.Track) WB.Track.log('mission_fail', { reason: reason, mode: this.mode });
        var failCfg = {
          fail: true, kicker: '● FUNK · ' + WB.data.rankUnit,
          videoUrl: WB.Assets ? WB.Assets.url((reason === 'time' || reason === 'escaped') ? 'clip_alarm' : 'clip_crash') : null,
          bgUrl: (WB.Assets && missionF.briefStation) ? WB.Assets.url(missionF.briefStation) : null,
          title: (reason === 'time' || reason === 'escaped') ? 'ZIEL ENTKOMMEN' : 'KOLLISION',
          subtitle: reason === 'time' ? 'Zeit abgelaufen – der Verdächtige ist weg.' : (reason === 'escaped' ? 'Zu viel Abstand – das Boot ist entkommen.' : 'Boot zu stark beschädigt.'),
          duration: 3000
        };
        var closeF = (WB.Retention) ? WB.Retention.onFail(this.world, missionF, reason) : null;
        var showFail = function () { WB.Screens.showResult({ success: false, reason: reasonF, mission: missionF, mode: modeF, event: missionF, close: closeF }); };
        if (WB.Cinematic) WB.Cinematic.play(failCfg, showFail); else { WB.Audio.fail(); showFail(); }
      }
    }
  };

  WB.Game = Game;
})(window.WB = window.WB || {});
