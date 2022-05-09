import {
  allRanges,
  defaultStatus,
  makeRange,
  makeStat,
  selfRange,
} from '../makeGame';
import { effectFunCall, EnemyRepository } from '../types';

const enemies: EnemyRepository = [
  [
    {
      lore: {
        name: 'Piripuru',
      },
      rolls: [[1], [1, 1, 1, 0], [1, 0], [0], [0]],
      effects: [
        {
          display: 'Bounce',
          tooltip: 'Floomp Floomp',
          priority: 1,
          dodgeable: false,
          effects: [effectFunCall(['Monster:Move', { amount: -2 }])],
          range: selfRange,
        },

        {
          display: 'Slam',
          tooltip: 'Throws itself at you',
          priority: 3,
          dodgeable: true,
          effects: [effectFunCall(['Monster:Attack', { amount: 5 }])],
          range: makeRange(0, 1),
        },
      ],
    },
    {
      hp: makeStat(7),
      distance: 4,
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    },
  ],

  [
    {
      lore: {
        name: 'Toros',
        description: 'Big, mean, strong and unclean',
      },
      rolls: [
        [1, 1, 1, 2, 2, 0],
        [1, 2, 2, 2, 2, 0],
        [2, 2, 3, 3, 4, 0],
        [2, 3, 3, 4, 0],
        [3, 3, 3, 4, 4, 0],
      ],
      effects: [
        {
          display: 'Rest',
          tooltip: "It won't be long until the massacre continues",
          priority: 1,
          dodgeable: false,
          effects: [
            effectFunCall(['Effect:Stat', { target: 'Monster', hp: 1 }]),
          ],
          range: selfRange,
        },

        {
          display: 'Chomp',
          tooltip: 'Toro attempts to eat you for massive damage!',
          priority: 4,
          dodgeable: true,
          effects: [effectFunCall(['Monster:Attack', { amount: 18 }])],
          range: makeRange(0),
        },

        {
          display: 'Swipe',
          tooltip: 'High damage attack that staggers',
          priority: 3,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 12 }]),
            effectFunCall(['Monster:Move', { amount: -1 }]),
            effectFunCall('Effect:Stun'),
          ],
          range: makeRange(0, 1, 2),
        },

        {
          display: 'Lunge',
          tooltip: 'Charges forward for a horn attack',
          priority: 4,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 10 }]),
            effectFunCall(['Monster:Move', { amount: -5 }]),
          ],
          range: makeRange(3, 4),
        },

        {
          display: 'Roar',
          tooltip: 'A terrifying howl!',
          priority: 3,
          dodgeable: false,
          effects: [effectFunCall(['Basic:Stamina', { amount: -5 }])],
          range: allRanges,
        },
      ],
    },
    {
      hp: makeStat(38),
      distance: 2,
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    },
  ],

  [
    {
      lore: {
        name: 'Mama Purupuri',
        description: 'Mama can always call one of its little ones to help',
      },
      rolls: [
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 2, 0],
        [1, 1, 1, 1, 2, 0],
        [2, 2, 0],
        [2, 2, 0],
      ],
      effects: [
        {
          display: 'Recover',
          tooltip: 'Mama needs its rest',
          priority: 1,
          dodgeable: false,
          effects: [
            effectFunCall(['Effect:Stat', { target: 'Monster', hp: 3 }]),
          ],
          range: selfRange,
        },

        {
          display: 'Stomp',
          tooltip: 'Quickly, out of the way!',
          priority: 3,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 8 }]),
            effectFunCall('Effect:Stun'),
          ],
          range: makeRange(0, 1),
        },

        {
          display: 'Call for Aid',
          tooltip: 'Calls for the litter to help',
          priority: 3,
          dodgeable: false,
          effects: [
            effectFunCall(['Monster:Summon', { enemy: 0 }]),
            effectFunCall(['Effect:Stat', { target: 'Monster', hp: -5 }]),
            effectFunCall(['Monster:Move', { amount: -2 }]),
          ],
          range: allRanges,
        },
      ],
    },
    {
      hp: makeStat(50),
      distance: 3,
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    },
  ],

  [
    {
      lore: {
        name: 'Ninkujorua',
        description: 'Just...stay...still...for...a...second',
      },
      rolls: [
        [1, 1, 1, 2, 2, 2, 0],
        [1, 1, 1, 2, 2, 2, 0],
        [1, 1, 2, 2, 2, 0],
        [1, 2, 3, 0],
        [2, 3, 0],
      ],
      effects: [
        {
          display: 'Meditate',
          tooltip: 'And not about good vibes',
          priority: 1,
          dodgeable: false,
          effects: [
            effectFunCall(['Effect:Stat', { target: 'Monster', attack: 1 }]),
            effectFunCall(['Monster:Move', { amount: 999 }]),
            effectFunCall('Effect:Dodge'),
          ],
          range: selfRange,
        },

        {
          display: 'Rapid Slash - Retreat!',
          tooltip: 'Deals several strikes then moves away from the player',
          priority: 2,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Move', { amount: -5 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall('Effect:Dodge'),
          ],
          range: allRanges,
        },

        {
          display: 'Rapid Slash - Advance!',
          tooltip: 'Moves close to the player then deals several strikes',
          priority: 2,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Move', { amount: -5 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
          ],
          range: allRanges,
        },

        {
          display: 'Back Spikes',
          tooltip: 'Jumps and shoots several needles that cause bleed',
          priority: 4,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 1 }]),
            effectFunCall(['Monster:Attack', { amount: 1 }]),
            effectFunCall(['Effect:Bleed', { target: 'Player', turns: 3 }]),
          ],
          range: makeRange(3, 4),
        },
      ],
    },
    {
      hp: makeStat(25),
      distance: 1,
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    },
  ],

  [
    {
      lore: {
        name: 'Tshopuritazios',
        description: 'A filth bird whose stench hits a mile away',
      },
      rolls: [
        [1, 1, 1, 2, 2, 2, 0],
        [1, 1, 1, 2, 2, 2, 0],
        [1, 1, 2, 2, 2, 0],
        [1, 2, 3, 0],
        [2, 3, 0],
      ],
      effects: [
        {
          display: 'Goad',
          tooltip: "Sounds like it's laughing at you",
          priority: 1,
          dodgeable: false,
          effects: [
            effectFunCall([
              'Effect:Stat',
              { target: 'Player', defence: -1, attack: -1 },
            ]),
            effectFunCall(['Monster:Move', { amount: 999 }]),
          ],
          range: selfRange,
        },

        {
          display: 'Peck',
          tooltip: 'What is worse, the force or the texture?',
          priority: 3,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 10 }]),
            effectFunCall('Effect:Stun'),
            effectFunCall(['Monster:Move', { amount: 2 }]),
          ],
          range: makeRange(0, 1),
        },

        {
          display: 'Fling Mud',
          tooltip: 'A large chunk coming right at you!',
          priority: 3,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 2 }]),
            effectFunCall(['Monster:Attack', { amount: 8 }]),
            effectFunCall(['Monster:Move', { amount: 1 }]),
          ],
          range: makeRange(1, 2, 3),
        },

        {
          display: 'Spit Bile',
          tooltip: 'This disgusting liquid corrodes your armor',
          priority: 3,
          dodgeable: true,
          effects: [
            effectFunCall(['Monster:Attack', { amount: 1 }]),
            effectFunCall(['Monster:Attack', { amount: 1 }]),
            effectFunCall(['Effect:Poison', { target: 'Player', turns: 3 }]),
            effectFunCall(['Effect:Stat', { target: 'Player', defence: -1 }]),
          ],
          range: makeRange(2, 3, 4),
        },
      ],
    },
    {
      hp: makeStat(32),
      distance: 4,
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    },
  ],
];

export default enemies;
