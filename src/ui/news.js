/* Wave Bite – Water Patrol · ui/news.js
 * LENA als Nachrichtenkanal: Tagesbrief, "Während du weg warst", Sonderlagen, Lotse-Updates.
 * Status-Strip für den Startscreen. Nutzt WB.LivingWorld (deterministisch). Kein FOMO-Verlust. */
(function (WB) {
  'use strict';
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }
  function greeting(){ var h=new Date().getHours(); if(h<11) return 'Guten Morgen, Kapitän.'; if(h<17) return 'Lagebericht, Kapitän.'; if(h<22) return 'Guten Abend, Kapitän.'; return 'Nachtschicht, Kapitän?'; }

  var News = {
    statusStrip: function () {
      if (!WB.LivingWorld) return '';
      var d = WB.LivingWorld.day(), w = WB.LivingWorld.week();
      function chip(o){ return '<span class="ws-chip">' + o.icon + ' ' + esc(o.label) + '</span>'; }
      return '<div class="ws-strip" id="ws-strip-inner">'
        + chip(d.weather) + chip(d.harbor) + chip(d.lock)
        + '<span class="ws-chip gold">' + w.special.icon + ' ' + esc(w.special.label) + '</span>'
        + '<span class="ws-more">📡 Lagebericht</span></div>';
    },

    maybeShow: function () {
      if (!WB.LivingWorld) return;
      var s = WB.Save.data; s.settings = s.settings || {};
      var today = WB.LivingWorld.dayIndex();
      var rec = WB.LivingWorld.recap(WB._bootLastPlayed || s.lastPlayed);
      if (s.settings.lastBriefingDay === today && !rec) return;
      this.showBriefing(rec);
      s.settings.lastBriefingDay = today; WB.Save.save();
    },

    showBriefing: function (rec) {
      var host = $('overlay-news'); if (!host) return;
      var d = WB.LivingWorld.day(), w = WB.LivingWorld.week();
      var akt = WB.LivingWorld.stroemung(), op = WB.LivingWorld.monthlyOp();
      var port = WB.Assets ? WB.Assets.url('char_radio_operator_1') : null;

      var recHtml = '';
      if (rec && rec.items.length) {
        recHtml = '<div class="nw-sec"><div class="nw-h">📰 Während du weg warst · ' + rec.days + (rec.days===1?' Tag':' Tage') + '</div><ul class="nw-list">'
          + rec.items.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'
          + '<div class="nw-note">Keine Sorge – du hast nichts verloren. Die Welt ist nur weitergelaufen.</div></div>';
      }

      host.innerHTML = '<div class="panel nw-panel">'
        + '<div class="nw-top">' + (port ? '<div class="nw-port" style="background-image:url(\'' + port + '\')"></div>' : '')
        + '<div><div class="nw-name">● LENA · LAGEZENTRUM</div><div class="nw-greet">' + esc(greeting()) + '</div></div></div>'
        + recHtml
        + '<div class="nw-sec"><div class="nw-h">🌊 Aktuelle Lage</div>'
        + '<div class="nw-chips"><span class="ws-chip">' + d.weather.icon + ' ' + esc(d.weather.label) + '</span>'
        + '<span class="ws-chip">' + d.harbor.icon + ' ' + esc(d.harbor.label) + '</span>'
        + '<span class="ws-chip">' + d.lock.icon + ' Schleuse: ' + esc(d.lock.label) + '</span></div></div>'
        + '<div class="nw-sec"><div class="nw-h">' + w.special.icon + ' Sonderlage der Woche: ' + esc(w.special.label) + '</div>'
        + '<div class="nw-text">' + esc(w.special.text) + '</div></div>'
        + '<div class="nw-sec"><div class="nw-h">🛰️ Strömung &amp; Lotse</div>'
        + '<div class="nw-bar"><span class="nw-bar-fill" style="width:' + akt + '%"></span></div>'
        + '<div class="nw-text"><b>Aktivität der Strömung: ' + akt + '%</b><br>' + esc(w.lotse) + '</div></div>'
        + '<div class="nw-sec nw-op">🎯 Laufende Operation: <b>' + esc(op) + '</b></div>'
        + '<button class="btn btn-gold" id="nw-go">Lage übernehmen</button>'
        + '</div>';
      host.classList.add('show');
      var go = $('nw-go'); var close = function(){ host.classList.remove('show'); setTimeout(function(){ host.innerHTML=''; }, 200); };
      if (go) go.addEventListener('click', close);
      host.onclick = function(e){ if (e.target === host) close(); };
    }
  };
  WB.News = News;
})(window.WB = window.WB || {});
