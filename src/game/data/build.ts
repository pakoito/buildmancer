import { allRanges, selfRange, makeRange } from '../makeGame';
import { BuildRepository, effectFunCall } from '../types';
import weapons from './weapons';

const build: BuildRepository = {
  debug: [
    {
      display: 'None',
    },
    {
      display: 'Debug',
      effects: [
        {
          display: 'GGWP',
          tooltip: 'Wins the game',
          priority: 1,
          dodgeable: false,
          stamina: 0,
          range: allRanges,
          effects: [effectFunCall('Debug:GGWP')],
        },
        {
          display: 'SUDOKU',
          tooltip: 'Loses the game',
          priority: 1,
          dodgeable: false,
          stamina: 0,
          range: allRanges,
          effects: [effectFunCall('Debug:Sudoku')],
        },
      ],
    },
  ],
  basic: [
    {
      display: 'Basic',
      effects: [
        {
          display: 'Rest',
          tooltip: 'Skip the turn and restore stamina',
          priority: 4,
          dodgeable: false,
          stamina: 0,
          range: selfRange,
          effects: [effectFunCall('Basic:Rest')],
        },
        {
          display: 'Advance',
          tooltip: 'Move closer',
          priority: 4,
          dodgeable: false,
          stamina: 1,
          range: selfRange,
          effects: [effectFunCall(['Basic:Move', { amount: -1 }])],
        },
        {
          display: 'Retreat',
          tooltip: 'Move farther',
          effects: [effectFunCall(['Basic:Move', { amount: 1 }])],
          priority: 4,
          dodgeable: false,
          stamina: 1,
          range: selfRange,
        },
      ],
    },
  ],
  class: [
    {
      display: 'Warrior',
      passives: ['+Attack', '+Defence', '+Stamina'],
      effects: [
        {
          display: 'Well placed kick',
          tooltip: 'Last resource attack',
          effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
          priority: 2,
          dodgeable: true,
          stamina: 1,
          range: makeRange(0, 1),
        },
      ],
    },
    {
      display: 'Rogue',
      passives: ['+Speed', '+Speed', '-Attack', '-Stamina'],
      effects: [
        {
          display: 'Strategic Retreat',
          tooltip: 'Jump backwards',
          effects: [effectFunCall(['Basic:Move', { amount: 999 }])],
          priority: 2,
          dodgeable: false,
          stamina: 1,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Berserk',
      passives: [
        '+Attack',
        '+Attack',
        '+Attack',
        '-Defence',
        '-Defence',
        '-Health',
      ],
      effects: [
        {
          display: 'All or Nothing!',
          tooltip: 'Deals massive damage and leaves you weakened',
          priority: 2,
          dodgeable: true,
          stamina: 0,
          range: makeRange(0, 1, 2),
          amount: 1,
          effects: [
            effectFunCall(['Basic:Move', { amount: -5 }]),
            effectFunCall(['Basic:Attack', { amount: 2 }]),
            effectFunCall(['Basic:Attack', { amount: 2 }]),
            effectFunCall(['Basic:Attack', { amount: 2 }]),
            effectFunCall(['Basic:Attack', { amount: 2 }]),
            effectFunCall([
              'Effect:Stat',
              { target: 'Player', defence: -3, speed: -1 },
            ]),
          ],
        },
      ],
    },
    {
      display: 'Mage',
      passives: ['+StaPerTurn', '+Stamina', '-Health', '-Speed'],
      effects: [
        {
          display: 'Just having a thought',
          tooltip: 'Restores stamina for the next action',
          priority: 4,
          dodgeable: false,
          amount: 2,
          stamina: 0,
          range: selfRange,
          effects: [effectFunCall(['Basic:Stamina', { amount: 999 }])],
        },
      ],
    },
    {
      display: 'Cleric',
      passives: ['+Defence', '+Stamina'],
      effects: [
        {
          display: 'Minor Healing',
          tooltip: 'Restores some HP',
          amount: 3,
          effects: [effectFunCall(['Basic:HP', { amount: 5 }])],
          priority: 3,
          dodgeable: false,
          stamina: 3,
          range: selfRange,
        },
      ],
    },
  ],
  skill: [
    {
      display: 'Sturdy',
      bot: [
        {
          display: 'Endure the pain',
          tooltip: 'Blocks some damage each turn at the cost of stamina',
          effects: [
            effectFunCall(['Effect:Armor', { amount: 4 }]),
            effectFunCall(['Effect:Stat', { target: 'Player', stamina: -2 }]),
          ],
          priority: 1,
          dodgeable: false,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Nimble',
      effects: [
        {
          display: 'Dodge',
          tooltip: 'Avoid one enemy attack',
          effects: [effectFunCall('Effect:Dodge')],
          priority: 2,
          dodgeable: false,
          stamina: 4,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Resourceful',
      effects: [
        {
          display: 'Dodge this!',
          tooltip: 'Throws a stone',
          effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
          priority: 3,
          dodgeable: true,
          stamina: 3,
          range: makeRange(3, 4),
        },
      ],
    },
  ],
  weapon: weapons,
  offhand: [
    {
      display: 'Hook',
      passives: ['-Stamina'],
      effects: [
        {
          display: 'Get over here!',
          tooltip: 'Moves enemy closer',
          effects: [
            effectFunCall(['Basic:Attack', { amount: 3 }]),
            effectFunCall(['Basic:Move', { amount: -2 }]),
          ],
          priority: 4,
          dodgeable: true,
          stamina: 3,
          range: makeRange(2, 3, 4),
        },
      ],
    },
    {
      display: 'Parry Dagger',
      passives: ['-Defence'],
      effects: [
        {
          display: 'Get over here!',
          tooltip: 'Avoids a melee attack',
          effects: [effectFunCall('Effect:Dodge')],
          priority: 2,
          dodgeable: false,
          stamina: 2,
          range: makeRange(1),
        },
      ],
    },
    {
      display: 'Shield',
      passives: ['+Defence', '-Speed'],
      effects: [
        {
          display: 'Not today!',
          tooltip: 'Blocks a lot of damage',
          effects: [effectFunCall(['Effect:Armor', { amount: 5 }])],
          priority: 2,
          dodgeable: false,
          stamina: 4,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Focus',
      passives: ['+Speed', '+StaPerTurn'],
    },
    {
      display: 'Wand',
      passives: ['-Defence', '-StaPerTurn'],
      effects: [
        {
          display: 'Magic Bolt',
          tooltip: 'Shoots mana bolts until the caster faints',
          effects: [effectFunCall('Wand:MagicBolt')],
          priority: 3,
          dodgeable: true,
          stamina: 1,
          range: makeRange(3, 4),
        },
      ],
    },
  ],
  armor: [
    {
      display: 'Heavy',
      passives: [
        '+Defence',
        '+Defence',
        '+Defence',
        '+Defence',
        '-Speed',
        '-Speed',
        '-StaPerTurn',
      ],
    },
    {
      display: 'Medium',
      passives: ['+Defence', '+Defence', '-StaPerTurn'],
    },
    {
      display: 'Light',
      passives: ['+Defence'],
    },
    {
      display: 'None',
      passives: ['+Speed'],
    },
  ],
  headgear: [
    {
      display: 'Helm',
      passives: ['+Defence', '+Defence', '-Speed', '-StaPerTurn'],
      tooltip: 'Big protection for slow combatants',
    },
    {
      display: 'Feather Cap',
      passives: ['+StaPerTurn', '+Stamina'],
      tooltip: "Makes you feel energized, doesn't it?",
    },
    {
      display: 'Mage Hat',
      passives: ['-StaPerTurn'],
      tooltip: 'Small tricks for big plays',
      effects: [
        {
          display: 'Flash!',
          tooltip: 'Blinks you to a better position',
          effects: [
            effectFunCall(['Basic:Attack', { amount: 1 }]),
            effectFunCall(['Basic:Move', { amount: 2 }]),
          ],
          priority: 3,
          dodgeable: true,
          stamina: 4,
          range: makeRange(1, 2),
        },
      ],
    },
  ],
  footwear: [
    {
      display: 'Slippers of Dooooodge!',
      tooltip: 'Allows you to dodge attacks',
      passives: ['-Stamina'],
      effects: [
        {
          display: 'Advanced Dodge',
          tooltip: 'Avoid 1 attack',
          effects: [effectFunCall('Effect:Dodge')],
          priority: 1,
          dodgeable: false,
          stamina: 3,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Boots of Flight',
      tooltip: 'Avoid your enemies',
      passives: ['-Defence'],
      eot: [
        {
          display: 'Flight!',
          tooltip: 'Increases distance at the end of the turn',
          priority: 0,
          dodgeable: false,
          range: allRanges,
          effects: [
            effectFunCall('BootsOfFlight:EOT'),
            effectFunCall(['Effect:Stat', { target: 'Player', stamina: -2 }]),
          ],
        },
      ],
    },
    {
      display: 'Greaves of Stability',
      tooltip: 'Extra resilient',
      passives: ['+Defence', '-Speed'],
      effects: [
        {
          display: 'Dig your heels',
          tooltip: 'Resists damage',
          effects: [effectFunCall(['Effect:Armor', { amount: 3 }])],
          priority: 1,
          dodgeable: false,
          stamina: 4,
          range: selfRange,
        },
      ],
    },
  ],
  charm: [
    {
      display: 'of Health',
      passives: ['+Health', '-Speed'],
      tooltip: 'Increases your maximum health',
    },
    {
      display: 'of Haste',
      passives: ['+StaPerTurn', '-Stamina'],
      tooltip: 'Increases your maximum stamina regeneration',
    },
    {
      display: 'of Resilience',
      passives: ['+Stamina', '-StaPerTurn'],
      tooltip: 'Increases your maximum stamina',
    },
    {
      display: 'of Strength',
      passives: ['+Attack', '-Health', '-StaPerTurn'],
      tooltip: 'Increases your maximum attack',
    },
    {
      display: 'of Swiftness',
      passives: ['+Speed', '-Attack'],
      tooltip: 'Increases your maximum speed',
    },
    {
      display: 'of Defence',
      passives: ['+Defence', '-Stamina', '-Speed'],
      tooltip: 'Increases your maximum defence',
    },
  ],
  consumable: [
    {
      display: 'Healing Potion',
      effects: [
        {
          display: 'Healing!',
          tooltip: 'Restores some HP',
          effects: [effectFunCall(['Basic:HP', { amount: 4 }])],
          priority: 4,
          dodgeable: false,
          stamina: 5,
          amount: 3,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Pot of Razors',
      effects: [
        {
          display: 'Throw pot',
          tooltip: 'Causes bleeding',
          amount: 2,
          effects: [
            effectFunCall(['Effect:Bleed', { target: 'Monster', turns: 3 }]),
          ],
          priority: 4,
          dodgeable: true,
          stamina: 5,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Life Bubble',
      effects: [
        {
          display: 'Activate Bubble',
          tooltip: 'Protects against a single source of damage this turn',
          effects: [effectFunCall('Effect:Dodge')],
          priority: 1,
          dodgeable: false,
          stamina: 1,
          amount: 1,
          range: selfRange,
        },
      ],
    },
    {
      display: 'Pet Rock',
      effects: [
        {
          display: 'Rock, to me!',
          tooltip: 'Reduces damage',
          effects: [effectFunCall(['Effect:Armor', { amount: 3 }])],
          priority: 2,
          dodgeable: false,
          stamina: 3,
          amount: 3,
          range: selfRange,
        },
      ],
    },
  ],
};

export default build;
