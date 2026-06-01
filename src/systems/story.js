/* Wave Bite - Water Patrol · systems/story.js
 * Kampagnen-Engine: Dialog -> (Minispiel) -> Fahrt -> Erfolgs-Cinematic -> Outro -> naechstes Kapitel.
 * Speichert Fortschritt (Save.story.chapter/completed). */
(function (WB) {
  'use strict';
  var Story = {
    idx: 0,
    start: function () { this.idx = (WB.Save.data.story && WB.Save.data.story.chapter) || 0; this.playChapter(this.idx); },
    stop: function () {},

    playChapter: function (i) {
      this.idx = i;
      var chs = WB.data.story.chapters;
      if (i >= chs.length) { this.complete(); return; }
      var ch = chs[i], seq = [], self = this;
      ch.intro.forEach(function (l) { seq.push({ type: 'line', who: l.who, portrait: l.portrait, text: l.text }); });
      if (ch.choice) seq.push({ type: 'choice', text: ch.choice.text, options: ch.choice.options });
      WB.Dialogue.play(seq, { station: ch.station }, function () { self.beginDrive(ch); });
    },

    missionFor: function (ch) {
      return { id: 'story_' + ch.idx, type: 'story', title: ch.title, icon: ch.icon,
        objective: 'Kapitel ' + (ch.idx + 1), regionId: ch.regionId, distance: ch.distance,
        timeLimit: ch.timeLimit, minigame: ch.minigame, briefChar: ch.intro[0].portrait,
        briefStation: ch.station, brief: '', rewardCoins: ch.rewardCoins, rewardXp: ch.rewardXp, difficulty: 1 };
    },

    beginDrive: function (ch) {
      var m = this.missionFor(ch);
      if (ch.minigame === 'radar' && WB.MiniRadar) WB.MiniRadar.play({ need: 5, duration: 12000 }, function () { WB.Game.startStory(m); });
      else WB.Game.startStory(m);
    },

    onChapterWin: function (data) {
      var ch = WB.data.story.chapters[this.idx], self = this;
      WB.Dialogue.play([{ type: 'line', who: ch.outro.who, portrait: ch.outro.portrait, text: ch.outro.text }],
        { station: ch.station }, function () {
          var s = WB.Save.data;
          s.story.chapter = Math.max(s.story.chapter || 0, self.idx + 1);
          if (s.story.completed.indexOf(ch.idx) < 0) s.story.completed.push(ch.idx);
          WB.Save.save();
          WB.Screens.showStoryProgress(self.idx, data);
        });
    },

    retry: function () { this.beginDrive(WB.data.story.chapters[this.idx]); },
    next: function () { this.playChapter(this.idx + 1); },
    complete: function () { WB.Screens.showStoryComplete(); }
  };
  WB.Story = Story;
})(window.WB = window.WB || {});
