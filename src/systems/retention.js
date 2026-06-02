/* Wave Bite – Water Patrol · systems/retention.js
 * RC2.0 Retention: nach Niederlage motivieren (nicht frustrieren), Comeback-Bonus beim neuen Versuch,
 * kurze Rückkehrer-Begrüßung. Vollständig fehlergekapselt. */
(function (WB) {
  'use strict';
  var KEY = 'wavebite.comeback.v1';
  function pct(world){ try{ if(world && world.checkpointN) return Math.round((world.cpDone/world.checkpointN)*100); return Math.round((world.progressRatio()||0)*100); }catch(e){ return 0; } }

  WB.Retention = {
    // Bei Fehlschlag: Motivationstext liefern + Comeback-Bonus vormerken.
    onFail: function (world, mission, reason) {
      var p = pct(world), cp = (world && world.cpDone) || 0, n = (world && world.checkpointN) || 5, head, sub, line;
      if (p >= 80) { head = 'Fast geschafft!'; sub = 'Kontrollpunkt ' + cp + '/' + n + ' – nur ein kleines Stück hat gefehlt.'; line = 'So nah dran! Beim nächsten Anlauf sitzt das, Kapitän.'; }
      else if (p >= 45) { head = 'Starker Lauf.'; sub = 'Du warst bei ' + cp + '/' + n + '. Bleib sauber in der Fahrrinne – dann klappt es.'; line = 'Ordentlich gefahren. Achte auf die Tonnen, dann schaffst du es.'; }
      else { head = 'Kopf hoch, Kapitän.'; sub = 'Jeder Kapitän übt. Ruhig zwischen Rot und Grün halten.'; line = 'Locker bleiben – wir nehmen die Strecke gemeinsam.'; }
      try { window.localStorage.setItem(KEY, JSON.stringify({ id: mission.id, t: Date.now() })); } catch (e) {}
      if (WB.LucyHUD && WB.LucyHUD.say) setTimeout(function(){ WB.LucyHUD.say('💬 ' + line); }, 450);
      return { head: head, sub: sub, pct: p, cp: cp, n: n, bonus: 18 };
    },
    // Beim (Wieder-)Start: Bonus gewähren, wenn dieselbe Mission zuvor scheiterte.
    grantComeback: function (mission) {
      var raw = null; try { raw = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch (e) {}
      if (raw && mission && raw.id === mission.id) {
        try { window.localStorage.removeItem(KEY); } catch (e) {}
        try { WB.Save.data.coins += 18; WB.Save.save(); if (WB.Screens && WB.Screens.refreshTopbar) WB.Screens.refreshTopbar(); } catch (e) {}
        if (WB.LucyHUD && WB.LucyHUD.say) setTimeout(function(){ WB.LucyHUD.say('🌬️ Rückenwind-Bonus +18 🪙 – neuer Versuch, neue Chance!'); }, 950);
        return true;
      }
      return false;
    },
    // Kurze Rückkehrer-Begrüßung (ergänzt das News-Recap, nur bei längerer Pause).
    greetReturn: function () {
      try {
        var last = WB._bootLastPlayed; if (!last) return;
        var hrs = (Date.now() - last) / 3600000; if (hrs < 8) return;
        var msg = hrs > 72 ? 'Willkommen zurück! Das Revier hat sich verändert – neue Lage wartet.'
               : hrs > 24 ? 'Schön, dass Sie wieder da sind – über Nacht gab es neue Meldungen.'
               : 'Zurück an Bord! Das Revier blieb in Bewegung.';
        if (WB.LucyHUD && WB.LucyHUD.say) setTimeout(function(){ WB.LucyHUD.say('📻 Lena: ' + msg); }, 1600);
      } catch (e) {}
    }
  };
})(window.WB = window.WB || {});
