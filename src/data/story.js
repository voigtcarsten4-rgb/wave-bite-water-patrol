/* Wave Bite - Water Patrol · data/story.js
 * Story-Kampagne "Die Spur auf dem Wasser" - 10 Kapitel, Dialog mit Entscheidungen.
 * Entscheidungen ändern Zwischendialoge, das Ziel bleibt gleich (planbarer Content).
 * who/portrait je Dialogzeile; mission-Parameter speisen die Fahrt-Engine. */
(function (WB) {
  'use strict';
  WB.data = WB.data || {};
  var LENA = 'char_radio_operator_1', HM = 'char_harbor_master_1', WI = 'char_witness_1',
      SK = 'char_suspect_skipper_1', TH = 'char_thief_1', CAP = 'char_captain_1';

  function ch(o){ return o; }
  WB.data.story = {
    title: 'Die Spur auf dem Wasser',
    chapters: [
      ch({ idx:0, cineVid:'vid_m2_verlassenes_boot', cine:'myst_verlassenes_boot', title:'Der leere Anleger', icon:'🔦', regionId:'bucht', station:'station_abandoned_jetty_1',
        distance:1500, timeLimit:0, minigame:null, rewardCoins:90, rewardXp:70,
        intro:[ {who:'Lena',portrait:LENA,text:'Patrol One, hier Lena. Am Südsteg fehlt eine komplette Ladung. Anleger ist leer - keiner will was gesehen haben.'},
                {who:'Hafenmeister',portrait:HM,text:'Ich schwöre, gestern lag da noch alles. Über Nacht weg. Das war kein Zufall.'} ],
        choice:{ text:'Wie gehst du es an?', options:[
          {label:'Erst Lage sichern', reply:{who:'Lena',portrait:LENA,text:'Vernünftig. Fahr die Bucht ab, ich behalte den Funk im Auge.'}},
          {label:'Sofort Spur suchen', reply:{who:'Lena',portrait:LENA,text:'Forsch. Gut. Aber pass auf - wer das war, ist noch in der Nähe.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Sauber. Eine Schleifspur im Wasser führt Richtung Hafen. Wir bleiben dran.'} }),

      ch({ idx:1, cineVid:'vid_m2_funksignal', cine:'myst_funksignal', title:'Funkstörung am Hafen', icon:'📡', regionId:'bucht', station:'station_radio_room_1',
        distance:1800, timeLimit:0, minigame:'radar', rewardCoins:120, rewardXp:90,
        intro:[ {who:'Lena',portrait:LENA,text:'Mein Funk rauscht. Jemand stört gezielt. Ich kriege das Echo nicht sauber.'},
                {who:'Lena',portrait:LENA,text:'Mach erst einen Radar-Scan, bevor du blind reinfährst.'} ],
        choice:{ text:'Lena, was vermutest du?', options:[
          {label:'Ablenkungsmanöver?', reply:{who:'Lena',portrait:LENA,text:'Genau mein Gedanke. Sie wollen uns binden, während woanders was läuft.'}},
          {label:'Technischer Defekt?', reply:{who:'Lena',portrait:LENA,text:'Schön wär’s. Das hier ist Absicht. Augen auf.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Signal lokalisiert. Es kam von einem Sportboot, das gerade ablegt. Notiert.'} }),

      ch({ idx:2, cine:'myst_versteckter_anleger', title:'Das verdächtige Sportboot', icon:'🔍', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2000, timeLimit:0, minigame:'radar', rewardCoins:150, rewardXp:110,
        intro:[ {who:'Zeugin',portrait:WI,text:'Das Boot von gestern - es liegt jetzt im Kanal. Der Fahrer ist nervös.'},
                {who:'Lena',portrait:LENA,text:'Scanne die Signale, dann fährst du hin und kontrollierst.'} ],
        choice:{ text:'Wie trittst du auf?', options:[
          {label:'Ruhig & korrekt', reply:{who:'Lena',portrait:LENA,text:'Gut. Kein Grund, ihn zu spooken - noch nicht.'}},
          {label:'Bestimmt', reply:{who:'Lena',portrait:LENA,text:'Zeig Präsenz. Aber bleib sauber, wir wollen ihn, nicht eine Beschwerde.'}} ] },
        outro:{who:'Skipper',portrait:SK,text:'Ich hab nichts getan! ... Ich sag nichts mehr ohne... ach, vergiss es.'} }),

      ch({ idx:3, cineVid:'vid_m2_lotse_nebel', cine:'chase_nacht', title:'Verfolgung durch den Nebel', icon:'🚨', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2200, timeLimit:46, minigame:null, rewardCoins:230, rewardXp:160,
        intro:[ {who:'Lena',portrait:LENA,text:'Er flieht! Volle Fahrt Richtung Nordkanal - und es zieht Nebel auf.'},
                {who:'Lena',portrait:LENA,text:'Halt Abstand, aber verlier ihn nicht. Boost clever einsetzen.'} ],
        choice:{ text:'Strategie?', options:[
          {label:'Dranbleiben', reply:{who:'Lena',portrait:LENA,text:'Druck machen. Er macht Fehler, wenn er nervös wird.'}},
          {label:'Abschneiden', reply:{who:'Lena',portrait:LENA,text:'Riskant im Nebel - aber wenn es klappt, haben wir ihn.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Er ist uns entwischt - aber er hat was abgeworfen. Markiert. Wir kommen näher.'} }),

      ch({ idx:4, cineVid:'vid_m2_stroemung_radar', cine:'myst_stroemung_hinweis', title:'Umweltspur im Kanal', icon:'🛢', regionId:'kanal', station:'station_suspicious_boat_1',
        distance:2300, timeLimit:0, minigame:null, rewardCoins:170, rewardXp:120,
        intro:[ {who:'Lena',portrait:LENA,text:'Ölschimmer im Kanal. Die Spur passt zu unserem Boot von gestern.'},
                {who:'Hafenmeister',portrait:HM,text:'Die kippen was rein, um Verfolger abzuhängen. Skrupellos.'} ],
        choice:{ text:'Priorität?', options:[
          {label:'Spur folgen', reply:{who:'Lena',portrait:LENA,text:'Ja. Die Spur führt zu ihrem Umschlagplatz.'}},
          {label:'Beweise sichern', reply:{who:'Lena',portrait:LENA,text:'Auch wichtig - aber fahr trotzdem, sonst sind sie weg.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Die Spur endet an der Schleuse. Da läuft ihr Umschlag. Treffer.'} }),

      ch({ idx:5, cine:'ctrl_schleuse', title:'Schleusenalarm', icon:'🚔', regionId:'schleuse', station:'station_event_deck_1',
        distance:2400, timeLimit:44, minigame:'radar', rewardCoins:280, rewardXp:200,
        intro:[ {who:'Lena',portrait:LENA,text:'Schmugglerboot an der Schleuse! Erst Radar, dann abfangen - bevor es durch ist.'},
                {who:'Lena',portrait:LENA,text:'Das Zeitfenster ist klein. Konzentration.'} ],
        choice:{ text:'Letzte Worte vor dem Einsatz?', options:[
          {label:'Bin bereit', reply:{who:'Lena',portrait:LENA,text:'Das höre ich gern. Los.'}},
          {label:'Deckung anfordern', reply:{who:'Lena',portrait:LENA,text:'Unterwegs - aber du bist zuerst da. Mach den Anfang.'}} ] },
        outro:{who:'Thief',portrait:TH,text:'Du ahnst nicht, für wen ich fahre. Das hier ist größer als du denkst.'} }),

      ch({ idx:6, cineVid:'vid_m2_schatten_bruecke', cine:'myst_geheimtreffen_steg', title:'Der Schatten unter der Brücke', icon:'🌑', regionId:'kanal', station:'station_radio_room_1',
        distance:2100, timeLimit:48, minigame:null, rewardCoins:240, rewardXp:170,
        intro:[ {who:'Lena',portrait:LENA,text:'Der Thief hat einen Hintermann erwähnt. Heute Nacht ein Treffen unter der Brücke.'},
                {who:'Lena',portrait:LENA,text:'Dunkel, eng, Gegenverkehr. Fahr vorsichtig - und schnell.'} ],
        choice:{ text:'Wie näherst du dich?', options:[
          {label:'Lichter aus', reply:{who:'Lena',portrait:LENA,text:'Mutig. Ueberraschung ist alles.'}},
          {label:'Volle Beleuchtung', reply:{who:'Lena',portrait:LENA,text:'Präsenz zeigen. Vielleicht panikt jemand und macht einen Fehler.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Der Hintermann floh über den See. Wir haben sein Boot - und eine Spur zur Insel.'} }),

      ch({ idx:7, cineVid:'vid_einsatz_rettung', cine:'rescue_nebel', title:'Nachtfahrt zur Insel', icon:'🛟', regionId:'seenplatte', station:'station_abandoned_jetty_1',
        distance:2500, timeLimit:52, minigame:null, rewardCoins:300, rewardXp:210,
        intro:[ {who:'Lena',portrait:LENA,text:'Notruf von der Inselroute! Jemand ging über Bord - möglich einer von ihnen.'},
                {who:'Lena',portrait:LENA,text:'Egal wer - wir retten zuerst. Volle Fahrt, jede Sekunde zählt.'} ],
        choice:{ text:'Dein Grundsatz?', options:[
          {label:'Rettung zuerst', reply:{who:'Lena',portrait:LENA,text:'Deshalb trägst du das Steuer. Los.'}},
          {label:'Vorsicht, Falle?', reply:{who:'Lena',portrait:LENA,text:'Möglich. Aber wir lassen niemanden ertrinken. Fahr.'}} ] },
        outro:{who:'Captain',portrait:CAP,text:'Du hast mich rausgezogen... ich rede. Ich sag dir, wer dahinter steckt.'} }),

      ch({ idx:8, cineVid:'vid_atm_sturm', cine:'chase_gewitter', title:'Gewittereinsatz', icon:'⛈', regionId:'seenplatte', station:'station_abandoned_jetty_1',
        distance:2400, timeLimit:50, minigame:null, rewardCoins:320, rewardXp:230,
        intro:[ {who:'Lena',portrait:LENA,text:'Sturmwarnung! Und die Bande nutzt das Gewitter für den großen Transport.'},
                {who:'Lena',portrait:LENA,text:'Böen, Wellen, schlechte Sicht. Ruhige Hand. Du schaffst das.'} ],
        choice:{ text:'Bei dem Wetter?', options:[
          {label:'Jetzt erst recht', reply:{who:'Lena',portrait:LENA,text:'Das ist der Captain, den die Region braucht.'}},
          {label:'Riskant, aber ja', reply:{who:'Lena',portrait:LENA,text:'Respekt vor dem Sturm ist gut. Aber wir fahren.'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Durchgehalten! Sie sind fast am Ziel - die Schleuse, letzte Etappe. Finale.'} }),

      ch({ idx:9, cineVid:'vid_m2_finale_spur', cine:'myst_enthuellung', title:'Finale: Jagd über den See', icon:'🏁', regionId:'schleuse', station:'station_event_deck_1',
        distance:2800, timeLimit:46, minigame:null, rewardCoins:500, rewardXp:360,
        intro:[ {who:'Lena',portrait:LENA,text:'Das ist es, Captain. Das gesamte Netzwerk auf einem Boot - und sie wollen durch die Schleuse.'},
                {who:'Lena',portrait:LENA,text:'Stell sie. Für den leeren Anleger, für alles. Ich bin bei dir auf dem Funk.'} ],
        choice:{ text:'Ein letztes Wort?', options:[
          {label:'Wir beenden das', reply:{who:'Lena',portrait:LENA,text:'Ja. Heute. Volle Fahrt!'}},
          {label:'Für die Region', reply:{who:'Lena',portrait:LENA,text:'Für die Region. Los, Captain!'}} ] },
        outro:{who:'Lena',portrait:LENA,text:'Gestellt. Netzwerk zerschlagen. Du hast die Wave Region sicher gemacht, Captain. Legende.'} })
    ]
  };
})(window.WB = window.WB || {});
