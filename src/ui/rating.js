/* Wave Bite - Water Patrol · ui/rating.js
 * Subtiles Bewertungssystem, getarnt als maritimes "Zwischenfunk-Feedbackgespraech".
 * Erscheint hoechstens EINMAL (an Befoerderung gekoppelt, ab >=2 Einsaetzen), nie beim ersten Start.
 * Buttons: Spaeter erinnern / Nicht mehr fragen. Speichert + trackt lokal. Vollstaendig gekapselt. */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }

  function rec() {
    var s = WB.Save.data;
    if (!s.rating) s.rating = { done: false, never: false, stars: 0 };
    return s.rating;
  }

  var Rating = {
    _shownThisSession: false,

    maybePrompt: function (context) {
      try {
        if (this._shownThisSession) return;
        var r = rec();
        if (r.done || r.never) return;
        var runs = (WB.Save.data.stats && WB.Save.data.stats.runs) || 0;
        if (context !== 'promotion' && runs < 3) return;
        if (runs < 2) return;
        this._shownThisSession = true;
        setTimeout(this.show.bind(this), 600);
      } catch (e) {}
    },

    show: function () {
      var host = $('overlay-rating');
      if (!host) return;
      var port = WB.Assets ? WB.Assets.url('char_radio_operator_1') : null;
      var picked = 0;

      host.innerHTML = '<div class="panel rate-panel">'
        + '<div class="rate-head">'
        + (port ? '<div class="rate-port" style="background-image:url(\'' + port + '\')"></div>' : '')
        + '<div><div class="bf-funk">● Zwischenfunk · Lucy</div>'
        + '<h3>Wie schlägt sich unser Simulator?</h3></div></div>'
        + '<p class="muted">Kurzer Funkcheck, Kapitän – deine ehrliche Einschätzung hilft der Crew.</p>'
        + '<div class="rate-stars" id="rate-stars">'
        + '<button data-s="1">☆</button><button data-s="2">☆</button><button data-s="3">☆</button><button data-s="4">☆</button><button data-s="5">☆</button>'
        + '</div>'
        + '<textarea id="rate-comment" class="rate-comment" rows="2" placeholder="Optional: kurzer Kommentar an die Zentrale…"></textarea>'
        + '<button class="btn btn-gold" id="rate-send" disabled>Funkspruch absenden</button>'
        + '<div class="rate-secondary"><button class="rate-link" id="rate-later">Später erinnern</button>'
        + '<button class="rate-link" id="rate-never">Nicht mehr fragen</button></div>'
        + '</div>';
      host.classList.add('show');
      if (WB.Audio) { WB.Audio.unlock(); WB.Audio.click(); }

      var starBtns = host.querySelectorAll('#rate-stars button');
      function paint() { for (var i = 0; i < starBtns.length; i++) starBtns[i].textContent = (i < picked) ? '★' : '☆'; }
      Array.prototype.forEach.call(starBtns, function (b) {
        b.addEventListener('click', function () {
          picked = parseInt(b.getAttribute('data-s'), 10);
          paint();
          var send = $('rate-send'); if (send) send.disabled = false;
          if (WB.Audio) WB.Audio.coin();
        });
      });

      function close() { host.classList.remove('show'); setTimeout(function () { host.innerHTML = ''; }, 220); }

      var send = $('rate-send');
      if (send) send.addEventListener('click', function () {
        if (!picked) return;
        var c = $('rate-comment'); var comment = c ? c.value : '';
        var r = rec(); r.done = true; r.stars = picked; r.comment = String(comment).slice(0, 240);
        WB.Save.save();
        if (WB.Track) { WB.Track.rating(picked, comment); WB.Track.log('rating_submitted', { stars: picked }); }
        host.innerHTML = '<div class="panel rate-panel"><div class="result-icon">📡</div>'
          + '<h3>Danke, Kapitän!</h3><p class="muted">Funkspruch erhalten – die Zentrale freut sich über ' + picked + '/5.</p>'
          + '<button class="btn btn-gold" id="rate-ok">Weiter</button></div>';
        var ok = $('rate-ok'); if (ok) ok.addEventListener('click', close);
        if (WB.Audio) WB.Audio.success();
      });

      var later = $('rate-later'); if (later) later.addEventListener('click', function () { if (WB.Track) WB.Track.log('rating_later'); close(); });
      var never = $('rate-never'); if (never) never.addEventListener('click', function () { var r = rec(); r.never = true; WB.Save.save(); if (WB.Track) WB.Track.log('rating_never'); close(); });
    }
  };

  WB.Rating = Rating;
})(window.WB = window.WB || {});
