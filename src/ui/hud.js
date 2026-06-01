/* Wave Bite - Water Patrol · ui/hud.js · In-Game-HUD-Aktualisierung */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function setW(id, ratio) { var el = $(id); if (el) el.style.width = Math.max(0, Math.min(1, ratio || 0)) * 100 + '%'; }
  function setT(id, txt) { var el = $(id); if (el && el.textContent !== txt) el.textContent = txt; }

  WB.HUD = {
    update: function (d) {
      setT('hud-coins', String(d.coins));
      setT('hud-level', 'Lvl ' + d.level);
      setW('hud-xpbar', d.xpRatio);
      setW('hud-boost-fill', d.boost);
      setW('hud-integrity-fill', d.integrity);
      setW('hud-fuel-fill', d.fuel);
      setW('hud-progress-fill', d.progress);
      var plbl = $('hud-progress-lbl');
      if (plbl) plbl.textContent = d.chase ? '🎯 Sichtkontakt · Abstand' : '🧭 Zielentfernung';
      var pFill = $('hud-progress-fill');
      if (pFill) pFill.style.background = d.chase ? 'linear-gradient(90deg,#C9462F,#E7CE8B)' : 'linear-gradient(90deg,#C9A24B,#E7CE8B)';

      var boostFill = $('hud-boost-fill');
      if (boostFill) boostFill.style.background = d.boost < 0.2 ? '#C9462F' : 'linear-gradient(90deg,#C9A24B,#E7CE8B)';
      var intFill = $('hud-integrity-fill');
      if (intFill) intFill.style.background = d.integrity < 0.34 ? '#C9462F' : (d.integrity < 0.67 ? '#D8A24B' : '#5BB98B');
      var fuelFill = $('hud-fuel-fill');
      if (fuelFill) fuelFill.style.background = d.fuel < 0.2 ? '#C9462F' : 'linear-gradient(90deg,#5BB98B,#9CE3BE)';

      var timer = $('hud-timer');
      if (timer) {
        if (d.timeLeft != null) { timer.style.display = ''; setT('hud-timer-val', Math.ceil(d.timeLeft) + 's'); }
        else timer.style.display = 'none';
      }
    },
    setMission: function (m) {
      setT('hud-mission-icon', m.icon);
      setT('hud-mission-title', m.title);
      var port = $('hc-port');
      if (port && WB.Assets && WB.Assets.url('char_captain_1')) port.style.backgroundImage = "url('" + WB.Assets.url('char_captain_1') + "')";
      setT('hc-name', 'Kpt. ' + ((WB.Save && WB.Save.data.captainName) || 'Captain'));
      setT('hc-rank', WB.Rank ? WB.Rank.current().rank.name : '');
      var reg = (WB.data && WB.data.regionById) ? WB.data.regionById(m.regionId) : null;
      var chart = $('hud-chart');
      if (chart && reg) chart.innerHTML = '<span>📡 KANAL ' + (reg.channel || 16) + '</span><span>⚓ ' + reg.name + '</span><span>📍 ' + (reg.coord || '') + '</span>';
    }
  };
})(window.WB = window.WB || {});
