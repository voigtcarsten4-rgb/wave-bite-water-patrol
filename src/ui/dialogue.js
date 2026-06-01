/* Wave Bite - Water Patrol · ui/dialogue.js
 * Filmischer Dialog-Runner: Szenenbild + Portrait + Sprechername + Text, Tap weiter,
 * Entscheidungs-Knoten mit Antwort-Verzweigung. WB.Dialogue.play(seq, ctx, onDone). */
(function (WB) {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s); }

  WB.Dialogue = {
    play: function (seq, ctx, onDone) {
      var host = $('overlay-dialogue');
      if (!host) { if (onDone) onDone(); return; }
      ctx = ctx || {};
      seq = (seq || []).slice();
      var i = 0;
      var bg = (ctx.station && WB.Assets) ? WB.Assets.url(ctx.station) : null;
      if (WB.Audio) { WB.Audio.unlock(); WB.Audio.radio(); }

      function done() { host.onclick = null; host.classList.remove('show'); setTimeout(function () { host.innerHTML = ''; if (onDone) onDone(); }, 220); }

      function render() {
        if (i >= seq.length) { done(); return; }
        var node = seq[i];
        var html = '<div class="dlg">'
          + (bg ? '<div class="dlg-bg" style="background-image:url(\'' + bg + '\')"></div>' : '')
          + '<div class="dlg-scrim"></div>';
        if (node.type === 'choice') {
          html += '<div class="dlg-box choice"><div class="dlg-q">' + esc(node.text) + '</div><div class="dlg-opts">';
          for (var k = 0; k < node.options.length; k++) html += '<button class="btn btn-line dlg-opt" data-i="' + k + '">' + esc(node.options[k].label) + '</button>';
          html += '</div></div></div>';
          host.innerHTML = html; host.classList.add('show'); host.onclick = null;
          var btns = host.querySelectorAll('.dlg-opt');
          Array.prototype.forEach.call(btns, function (b) {
            b.addEventListener('click', function (e) {
              e.stopPropagation();
              if (WB.Audio) WB.Audio.click();
              var opt = node.options[+b.getAttribute('data-i')];
              if (opt && opt.reply) seq.splice(i + 1, 0, { type: 'line', who: opt.reply.who, portrait: opt.reply.portrait, text: opt.reply.text });
              i++; render();
            });
          });
        } else {
          var portrait = (node.portrait && WB.Assets) ? WB.Assets.url(node.portrait) : null;
          html += (portrait ? '<div class="dlg-port" style="background-image:url(\'' + portrait + '\')"></div>' : '')
            + '<div class="dlg-box"><div class="dlg-name">' + esc(node.who) + '</div>'
            + '<div class="dlg-text">' + esc(node.text) + '</div><div class="dlg-next">&#9662; weiter</div></div></div>';
          host.innerHTML = html; host.classList.add('show');
          host.onclick = function () { host.onclick = null; i++; render(); };
        }
      }
      render();
    }
  };
})(window.WB = window.WB || {});
