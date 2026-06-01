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
      this.region = WB.data.regionById(mission.regionId);
      this.boatStats = WB.Progression.effectiveStats(WB.Save.data.selectedBoatId);
      var boat = new WB.Boat(this.boatStats);
      this.world = new WB.World(boat, this.region, mission);
      this.world.layout(WB.Engine.w, WB.Engine.h);
      this.runtime = new WB.MissionRuntime(mission);
      this.t = 0;
      this.state = 'playing';
      WB.Input.reset();
      if (WB.Track) WB.Track.log('mission_start', { mode: this.mode, id: mission.id, type: mission.type });
      var self = this;
      var begin = function () {
        WB.Screens.showGame(mission);
        if (WB.Engine._resize) WB.Engine._resize();   // Canvas erst messen, wenn der Game-Screen sichtbar ist
        self.world.layout(WB.Engine.w, WB.Engine.h);   // Welt mit gültigen Maßen einrichten (Fix gegen 0×0-Schwarzbild)
        WB.Engine.start(function (dt) { self._tick(dt); });
      };
      // Kino-Einspieler vor dem Einsatz (kurz, per Tap überspringbar).
      var clip = WB.Game._missionClip(mission);
      var clipUrl = (WB.Assets && clip) ? WB.Assets.url(clip) : null;
      if (WB.Cinematic && clipUrl) {
        WB.Cinematic.play({
          kicker: '● EINSATZ · ' + (WB.data.rankUnit || 'WATER PATROL'),
          title: mission.title, subtitle: mission.objective || '',
          videoUrl: clipUrl, duration: 2600
        }, begin);
      } else { begin(); }
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
        chase: !!this.world.opp
      });
    },

    togglePause: function () {
      if (this.state === 'playing') { this.state = 'paused'; WB.Screens.showPause(); }
      else if (this.state === 'paused') { this.state = 'playing'; WB.Screens.hidePause(); }
    },

    resume: function () { if (this.state === 'paused') { this.state = 'playing'; WB.Screens.hidePause(); } },

    quit: function () {
      WB.Engine.stop();
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
          bgUrl: (WB.Assets && mission.briefStation) ? WB.Assets.url(mission.briefStation) : null,
          videoUrl: WB.Assets ? WB.Assets.url(promoted ? 'cine_boat_hero' : 'cine_reward') : null,
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
        var showFail = function () { WB.Screens.showResult({ success: false, reason: reasonF, mission: missionF, mode: modeF, event: missionF }); };
        if (WB.Cinematic) WB.Cinematic.play(failCfg, showFail); else { WB.Audio.fail(); showFail(); }
      }
    }
  };

  WB.Game = Game;
})(window.WB = window.WB || {});
