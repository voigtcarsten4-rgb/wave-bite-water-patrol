/* Wave Bite – Captain's Run · data/boats.js · Bootsdefinitionen */
(function (WB) {
  'use strict';
  var B = WB.models.Boat;
  WB.data = WB.data || {};
  WB.data.boats = [
    B({ id: 'angelboot', name: 'Angelboot', desc: 'Robuster Einstieg. Langsam, aber zuverlässig mit viel Stauraum.',
        speed: 4, handling: 5, boost: 4, stability: 8, cargo: 8, prestige: 3,
        price: 0, unlockLevel: 1, color: '#7E8B96' }),
    B({ id: 'sportboot', name: 'Sportboot', desc: 'Schnell und wendig. Wenig Cargo, viel Adrenalin.',
        speed: 9, handling: 9, boost: 8, stability: 4, cargo: 3, prestige: 6,
        price: 900, unlockLevel: 3, color: '#C9A24B' }),
    B({ id: 'hausboot', name: 'Hausboot', desc: 'Träge, aber extrem stabil. Bringt jede Fracht heil ans Ziel.',
        speed: 3, handling: 4, boost: 5, stability: 10, cargo: 10, prestige: 5,
        price: 1800, unlockLevel: 6, color: '#5E7C8B' }),
    B({ id: 'katamaran', name: 'Wave Bite Versorgungskatamaran', desc: 'Das Marken-Boot. Ausgewogen in allem.',
        speed: 7, handling: 7, boost: 7, stability: 7, cargo: 8, prestige: 8,
        price: 3600, unlockLevel: 10, color: '#1E5F8C' }),
    B({ id: 'eventschiff', name: 'Premium Eventschiff', desc: 'High-End. Höchstes Prestige, bester Coin-Bonus.',
        speed: 8, handling: 8, boost: 9, stability: 9, cargo: 9, prestige: 10,
        price: 7200, unlockLevel: 16, color: '#D8B25A' })
  ];
  WB.data.boatById = function (id) {
    for (var i = 0; i < WB.data.boats.length; i++) if (WB.data.boats[i].id === id) return WB.data.boats[i];
    return WB.data.boats[0];
  };
})(window.WB = window.WB || {});
