import { makeRange, selfRange } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type OffhandsIndex = keyof typeof offhands;
export type Offhands = { [k in OffhandsIndex]: Item };
const offhands = {
  hook: {
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
        interruptible: true,
        stamina: 3,
        range: makeRange(2, 3, 4),
      },
    ],
  },
  parry: {
    display: 'Parry Dagger',
    passives: ['-Defence'],
    effects: [
      {
        display: 'Get over here!',
        tooltip: 'Avoids a melee attack',
        effects: [effectFunCall('Effect:Dodge')],
        priority: 2,
        interruptible: false,
        stamina: 2,
        range: makeRange(1),
      },
    ],
  },
  shield: {
    display: 'Shield',
    passives: ['+Defence', '-Speed'],
    effects: [
      {
        display: 'Not today!',
        tooltip: 'Blocks a lot of damage',
        effects: [effectFunCall(['Effect:Armor', { amount: 5 }])],
        priority: 2,
        interruptible: false,
        stamina: 4,
        range: selfRange,
      },
    ],
  },
  focus: {
    display: 'Focus',
    passives: ['+Speed', '+StaPerTurn'],
  },
  wand: {
    display: 'Wand',
    passives: ['-Defence', '-StaPerTurn'],
    effects: [
      {
        display: 'Magic Bolt',
        tooltip: 'Shoots mana bolts until the caster faints',
        effects: [effectFunCall('Wand:MagicBolt')],
        priority: 3,
        interruptible: true,
        stamina: 1,
        range: makeRange(3, 4),
      },
    ],
  },
};

export default offhands as Offhands;
