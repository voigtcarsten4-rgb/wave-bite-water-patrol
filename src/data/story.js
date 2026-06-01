/* Wave Bite - Water Patrol · data/story.js
 * Story-Kampagne "Die Spur auf dem Wasser" - 10 Kapitel, Dialog mit Entscheidungen.
 * Entscheidungen aendern Zwischendialoge, das Ziel bleibt gleich (planbarer Content).
 * who/portrait je Dialogzeile; mission-Parameter speisen die Fahrt-Engine. */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};
  var LUCY = 'char_radio_operator_1', HM = 'char_harbor_master_1', WI = 'char_witness_1',
      SK = 'char_suspect_skipper_1', TH = 'char_thief_1', CAP = 'char_captain_1';

  function ch(o){ return o; }
  WB.data.story = {
    title: 'Die Spur auf dem Wasser',
    chapters: [
      ch({ idx:0, title:'Der leere Anleger', icon:'🔦', regionId:'bucht', station:'station_abandoned_jetty_1',
        distance:1500, timeLimit:0, minigame:null, rewardCoins:90, rewardXp:70,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Patrol One, hier Lucy. Am Suedsteg fehlt eine komplette Ladung. Anleger ist leer - keiner will was gesehen haben.'},
                {who:'Hafenmeister',portrait:HM,text:'Ich schwoere, gestern lag da noch alles. Ueber Nacht weg. Das war kein Zufall.'} ],
        choice:{ text:'Wie gehst du es an?', options:[
          {label:'Erst Lage sichern', reply:{who:'Lucy',portrait:LUCY,text:'Vernuenftig. Fahr die Bucht ab, ich behalte den Funk im Auge.'}},
          {label:'Sofort Spur suchen', reply:{who:'Lucy',portrait:LUCY,text:'Forsch. Gut. Aber pass auf - wer das war, ist noch in der Naehe.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Sauber. Eine Schleifspur im Wasser fuehrt Richtung Hafen. Wir bleiben dran.'} }),

      ch({ idx:1, title:'Funkstoerung am Hafen', icon:'📡', regionId:'bucht', station:'station_radio_room_1',
        distance:1800, timeLimit:0, minigame:'radar', rewardCoins:120, rewardXp:90,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Mein Funk rauscht. Jemand stoert gezielt. Ich kriege das Echo nicht sauber.'},
                {who:'Lucy',portrait:LUCY,text:'Mach erst einen Radar-Scan, bevor du blind reinfaehrst.'} ],
        choice:{ text:'Lucy, was vermutest du?', options:[
          {label:'Ablenkungsmanoever?', reply:{who:'Lucy',portrait:LUCY,text:'Genau mein Gedanke. Sie wollen uns binden, waehrend woanders was laeuft.'}},
          {label:'Technischer Defekt?', reply:{who:'Lucy',portrait:LUCY,text:'Schoen waers. Das hier ist Absicht. Augen auf.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Signal lokalisiert. Es kam von einem Sportboot, das gerade ablegt. Notiert.'} }),

      ch({ idx:2, title:'Das verdaechtige Sportboot', icon:'🔍', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2000, timeLimit:0, minigame:'radar', rewardCoins:150, rewardXp:110,
        intro:[ {who:'Zeugin',portrait:WI,text:'Das Boot von gestern - es liegt jetzt im Kanal. Der Fahrer ist nervoes.'},
                {who:'Lucy',portrait:LUCY,text:'Scanne die Signale, dann faehrst du hin und kontrollierst.'} ],
        choice:{ text:'Wie trittst du auf?', options:[
          {label:'Ruhig & korrekt', reply:{who:'Lucy',portrait:LUCY,text:'Gut. Kein Grund, ihn zu spooken - noch nicht.'}},
          {label:'Bestimmt', reply:{who:'Lucy',portrait:LUCY,text:'Zeig Praesenz. Aber bleib sauber, wir wollen ihn, nicht eine Beschwerde.'}} ] },
        outro:{who:'Skipper',portrait:SK,text:'Ich hab nichts getan! ... Ich sag nichts mehr ohne... ach, vergiss es.'} }),

      ch({ idx:3, title:'Verfolgung durch den Nebel', icon:'🚨', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2200, timeLimit:46, minigame:null, rewardCoins:230, rewardXp:160,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Er flieht! Volle Fahrt Richtung Nordkanal - und es zieht Nebel auf.'},
                {who:'Lucy',portrait:LUCY,text:'Halt Abstand, aber verlier ihn nicht. Boost clever einsetzen.'} ],
        choice:{ text:'Strategie?', options:[
          {label:'Dranbleiben', reply:{who:'Lucy',portrait:LUCY,text:'Druck machen. Er macht Fehler, wenn er nervoes wird.'}},
          {label:'Abschneiden', reply:{who:'Lucy',portrait:LUCY,text:'Riskant im Nebel - aber wenn es klappt, haben wir ihn.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Er ist uns entwischt - aber er hat was abgeworfen. Markiert. Wir kommen naeher.'} }),

      ch({ idx:4, title:'Umweltspur im Kanal', icon:'🛢', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2300, timeLimit:0, minigame:null, rewardCoins:170, rewardXp:120,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Oelschimmer im Kanal. Die Spur passt zu unserem Boot von gestern.'},
                {who:'Hafenmeister',portrait:HM,text:'Die kippen was rein, um Verfolger abzuhaengen. Skrupellos.'} ],
        choice:{ text:'Prioritaet?', options:[
          {label:'Spur folgen', reply:{who:'Lucy',portrait:LUCY,text:'Ja. Die Spur fuehrt zu ihrem Umschlagplatz.'}},
          {label:'Beweise sichern', reply:{who:'Lucy',portrait:LUCY,text:'Auch wichtig - aber fahr trotzdem, sonst sind sie weg.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Die Spur endet an der Schleuse. Da laeuft ihr Umschlag. Treffer.'} }),

      ch({ idx:5, title:'Schleusenalarm', icon:'🚔', regionId:'schleuse', station:'station_event_deck_1',
        distance:2400, timeLimit:44, minigame:'radar', rewardCoins:280, rewardXp:200,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Schmugglerboot an der Schleuse! Erst Radar, dann abfangen - bevor es durch ist.'},
                {who:'Lucy',portrait:LUCY,text:'Das Zeitfenster ist klein. Konzentration.'} ],
        choice:{ text:'Letzte Worte vor dem Einsatz?', options:[
          {label:'Bin bereit', reply:{who:'Lucy',portrait:LUCY,text:'Das hoere ich gern. Los.'}},
          {label:'Deckung anfordern', reply:{who:'Lucy',portrait:LUCY,text:'Unterwegs - aber du bist zuerst da. Mach den Anfang.'}} ] },
        outro:{who:'Thief',portrait:TH,text:'Du ahnst nicht, fuer wen ich fahre. Das hier ist groesser als du denkst.'} }),

      ch({ idx:6, title:'Der Schatten unter der Bruecke', icon:'🌑', regionId:'kanal', station:'station_radio_room_1',
        distance:2100, timeLimit:48, minigame:null, rewardCoins:240, rewardXp:170,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Der Thief hat einen Hintermann erwaehnt. Heute Nacht ein Treffen unter der Bruecke.'},
                {who:'Lucy',portrait:LUCY,text:'Dunkel, eng, Gegenverkehr. Fahr vorsichtig - und schnell.'} ],
        choice:{ text:'Wie naeherst du dich?', options:[
          {label:'Lichter aus', reply:{who:'Lucy',portrait:LUCY,text:'Mutig. Ueberraschung ist alles.'}},
          {label:'Volle Beleuchtung', reply:{who:'Lucy',portrait:LUCY,text:'Praesenz zeigen. Vielleicht panikt jemand und macht einen Fehler.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Der Hintermann floh ueber den See. Wir haben sein Boot - und eine Spur zur Insel.'} }),

      ch({ idx:7, title:'Nachtfahrt zur Insel', icon:'🛟', regionId:'seenplatte', station:'station_abandoned_jetty_1',
        distance:2500, timeLimit:52, minigame:null, rewardCoins:300, rewardXp:210,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Notruf von der Inselroute! Jemand ging ueber Bord - moeglich einer von ihnen.'},
                {who:'Lucy',portrait:LUCY,text:'Egal wer - wir retten zuerst. Volle Fahrt, jede Sekunde zaehlt.'} ],
        choice:{ text:'Dein Grundsatz?', options:[
          {label:'Rettung zuerst', reply:{who:'Lucy',portrait:LUCY,text:'Deshalb traegst du das Steuer. Los.'}},
          {label:'Vorsicht, Falle?', reply:{who:'Lucy',portrait:LUCY,text:'Moeglich. Aber wir lassen niemanden ertrinken. Fahr.'}} ] },
        outro:{who:'Captain',portrait:CAP,text:'Du hast mich rausgezogen... ich rede. Ich sag dir, wer dahinter steckt.'} }),

      ch({ idx:8, title:'Gewittereinsatz', icon:'⛈', regionId:'seenplatte', station:'station_abandoned_jetty_1',
        distance:2400, timeLimit:50, minigame:null, rewardCoins:320, rewardXp:230,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Sturmwarnung! Und die Bande nutzt das Gewitter fuer den grossen Transport.'},
                {who:'Lucy',portrait:LUCY,text:'Boeen, Wellen, schlechte Sicht. Ruhige Hand. Du schaffst das.'} ],
        choice:{ text:'Bei dem Wetter?', options:[
          {label:'Jetzt erst recht', reply:{who:'Lucy',portrait:LUCY,text:'Das ist der Captain, den die Region braucht.'}},
          {label:'Riskant, aber ja', reply:{who:'Lucy',portrait:LUCY,text:'Respekt vor dem Sturm ist gut. Aber wir fahren.'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Durchgehalten! Sie sind fast am Ziel - die Schleuse, letzte Etappe. Finale.'} }),

      ch({ idx:9, title:'Finale: Jagd ueber den See', icon:'🏁', regionId:'schleuse', station:'station_event_deck_1',
        distance:2800, timeLimit:46, minigame:null, rewardCoins:500, rewardXp:360,
        intro:[ {who:'Lucy',portrait:LUCY,text:'Das ist es, Captain. Das gesamte Netzwerk auf einem Boot - und sie wollen durch die Schleuse.'},
                {who:'Lucy',portrait:LUCY,text:'Stell sie. Fuer den leeren Anleger, fuer alles. Ich bin bei dir auf dem Funk.'} ],
        choice:{ text:'Ein letztes Wort?', options:[
          {label:'Wir beenden das', reply:{who:'Lucy',portrait:LUCY,text:'Ja. Heute. Volle Fahrt!'}},
          {label:'Fuer die Region', reply:{who:'Lucy',portrait:LUCY,text:'Fuer die Region. Los, Captain!'}} ] },
        outro:{who:'Lucy',portrait:LUCY,text:'Gestellt. Netzwerk zerschlagen. Du hast die Wave Region sicher gemacht, Captain. Legende.'} })
    ]
  };
})(window.WB = window.WB || {});
