/* Wave Bite – Water Patrol · systems/worldstate.js
 * LIVING WORLD: deterministischer Weltzustand aus der echten Zeit (kein Backend).
 * Wetter/Hafen/Schleuse pro Tag, Sonderlage + Lotse-Bewegung pro Woche, Monats-Operation,
 * Strömungs-Aktivität, plus "Während du weg warst"-Rückblick. Gleiche Zeit -> gleicher Zustand. */
(function (WB) {
  'use strict';
  var DAY = 86400000;
  function m32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function pick(seed, arr){ return arr[Math.floor(m32(seed)() * arr.length)]; }
  function dayIndex(ts){ return Math.floor((ts||Date.now())/DAY); }
  function weekIndex(ts){ return Math.floor(dayIndex(ts)/7); }
  function monthIndex(ts){ var d=new Date(ts||Date.now()); return d.getFullYear()*12+d.getMonth(); }

  var WEATHER=[{id:'klar',label:'Klar & ruhig',icon:'☀️'},{id:'wolkig',label:'Bewölkt',icon:'⛅'},{id:'nebel',label:'Nebelbänke',icon:'🌫️'},{id:'wind',label:'Frischer Wind',icon:'💨'},{id:'regen',label:'Leichter Regen',icon:'🌧️'},{id:'gewitter',label:'Gewitterfront',icon:'⛈️'},{id:'nacht',label:'Klare Nacht',icon:'🌙'}];
  var HARBOR=[{id:'normal',label:'Normalbetrieb',icon:'⚓'},{id:'fest',label:'Hafenfest',icon:'🎉'},{id:'regatta',label:'Regatta',icon:'⛵'},{id:'kontrolle',label:'Polizeikontrolle',icon:'🚔'},{id:'andrang',label:'Hoher Andrang',icon:'🛥️'}];
  var LOCK=[{id:'offen',label:'Schleuse offen',icon:'🟢'},{id:'wartung',label:'Wartung',icon:'🛠️'},{id:'stau',label:'Schleusenstau',icon:'🟡'},{id:'stoerung',label:'Störung',icon:'🔴'}];
  var SPECIAL=[
    {id:'sturmwoche',label:'Sturmwoche',icon:'⛈️',text:'Schwere Böen über der Seenplatte – Hochrisiko-Einsätze, beste Belohnungen.'},
    {id:'razzia',label:'Schmuggler-Razzia',icon:'🚔',text:'Großeinsatz gegen die Strömung – mehr Verfolgungen, mehr Beute.'},
    {id:'vermisst',label:'Großsuchaktion',icon:'🛟',text:'Mehrere Vermisstenmeldungen – Rettungseinsätze häufen sich.'},
    {id:'regatta',label:'Regatta-Sicherung',icon:'⛵',text:'Bootsrennen im Revier – Verkehr sichern, Tempo kontrollieren.'},
    {id:'fest',label:'Hafenfest',icon:'🎉',text:'Festbetrieb im Hafen – Bonus-Coins, festliche Lage.'},
    {id:'nebelwoche',label:'Nebelwoche',icon:'🌫️',text:'Dichte Nebelbänke – das Radar wird dein bester Freund.'}
  ];
  var LOTSE=[
    'Der Lotse wurde am Nordkanal gesichtet – dann war er verschwunden.',
    'Neue manipulierte Seekarten tauchten auf. Die Strömung ändert ihre Routen.',
    'Ein Geistersignal störte den Funk. Die Handschrift des Lotsen.',
    'Eine offiziell gesperrte Wasserstraße wurde heimlich befahren.',
    'Der Lotse hinterließ eine Markierung – fast wie eine Botschaft an dich.',
    'Zwei Boote verschwanden kurz vom Radar. Kein Zufall.',
    'Die Strömung zog sich zurück – verdächtig ruhig.'
  ];
  var OPS=['Operation Tideworks','Operation Nordlicht','Operation Stromschnelle','Operation Leuchtfeuer','Operation Tiefenzug'];

  function dayState(ts){ var di=dayIndex(ts); return {
    di: di,
    weather: pick(di*7+1, WEATHER),
    harbor:  pick(di*13+2, HARBOR),
    lock:    pick(di*17+3, LOCK)
  }; }
  function weekState(ts){ var wi=weekIndex(ts); return {
    wi: wi,
    special: pick(wi*101+5, SPECIAL),
    lotse:   pick(wi*211+9, LOTSE)
  }; }
  function stroemung(ts){ var di=dayIndex(ts); var base=52+38*Math.sin(di/9); var j=(m32(di*23+4)()-0.5)*18; return Math.max(6, Math.min(98, Math.round(base+j))); }
  function monthlyOp(ts){ return OPS[Math.abs(monthIndex(ts)) % OPS.length]; }

  function awayDays(lastPlayed){ if(!lastPlayed) return 0; return Math.max(0, Math.floor((Date.now()-lastPlayed)/DAY)); }

  // Rückblick: was ist passiert, während der Spieler weg war (max. 7 Tage gezeigt, kein Verlust).
  function recap(lastPlayed){
    var n = awayDays(lastPlayed); if (n < 1) return null;
    var shown = Math.min(n, 7), items = [], seenWeeks = {};
    var today = dayIndex();
    for (var k = shown; k >= 1; k--) {
      var ts = (today - k) * DAY + 1;
      var d = dayState(ts);
      if (d.weather.id === 'gewitter') items.push(d.weather.icon + ' Gewitterfront zog über die Reviere.');
      else if (d.weather.id === 'nebel') items.push(d.weather.icon + ' Dichter Nebel lag auf dem Wasser.');
      if (d.harbor.id === 'fest') items.push('🎉 Im Hafen wurde gefeiert.');
      var wi = weekIndex(ts);
      if (!seenWeeks[wi]) { seenWeeks[wi] = 1; var w = weekState(ts); items.push(w.special.icon + ' Lage: ' + w.special.label + '.'); items.push('🛰️ ' + w.lotse); }
    }
    // dedupe + cap
    var out = [], seen = {};
    for (var i=0;i<items.length;i++){ if(!seen[items[i]]){ seen[items[i]]=1; out.push(items[i]); } }
    return { days: n, items: out.slice(0, 6) };
  }

  WB.LivingWorld = {
    day: dayState, week: weekState, stroemung: stroemung, monthlyOp: monthlyOp,
    awayDays: awayDays, recap: recap, dayIndex: dayIndex
  };
})(window.WB = window.WB || {});
