/* Wave Bite – Captain's Run · data/voices.js
 * RS5/Phase5 Voice- & Funk-Rollen: mehrere Stimmen mit Stil, Persönlichkeit, Einsatzgebiet.
 * Wird vom Mission-Cinematic-System (Funk-Bar) und später von Descript (Voice-Clones) genutzt. */
(function (WB) {
  'use strict';
  WB.Voices = {
    leitstelle: { label: 'LEITSTELLE',  color: '#3aa0ff', persona: 'sachlich, ruhig, autoritativ', scope: 'Einsatzvergabe, Lagemeldung', sample: '»Wave Bite 1, Einsatz im Revier Müggelsee.«' },
    dispatch:   { label: 'DISPATCHER',  color: '#5fb0c0', persona: 'schnell, präzise, faktisch',   scope: 'Koordination, Updates',     sample: '»Position bestätigt, Kanal 16 frei.«' },
    lucy:       { label: 'LUCY · BORD-KI', color: '#7be3b0', persona: 'warm, hilfsbereit, motivierend', scope: 'Navigation, Hinweise an Bord', sample: '»Ich halte uns im Fahrwasser, Kapitän.«' },
    lena:       { label: 'LENA · FUNK',  color: '#f0c24b', persona: 'menschlich, erzählend, nah',  scope: 'Story, Briefings, Recap',   sample: '»Da draußen braucht jemand unsere Hilfe.«' },
    kapitaen:   { label: 'KAPITÄN',      color: '#eaf2fb', persona: 'ruhig, erfahren, knapp',      scope: 'Spieler-Stimme/Bestätigung', sample: '»Verstanden. Wir laufen aus.«' },
    junior:     { label: 'JUNIOR PATROL',color: '#ff9f1c', persona: 'jung, eifrig, lernend',       scope: 'Nebenrolle, Auflockerung',  sample: '»Erster Einsatz – ich bin bereit!«' },
    leitung:    { label: 'EINSATZLEITUNG', color: '#ff5d5d', persona: 'bestimmt, dringlich',       scope: 'Großlagen, Eskalation',     sample: '»Alle Einheiten – höchste Priorität.«' }
  };
})(window.WB = window.WB || {});
