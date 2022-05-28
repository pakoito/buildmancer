import { makeRange, selfRange } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type ClassesIndex = keyof typeof classes;
export type Classes = { [k in ClassesIndex]: Item };
const classes = {
  warrior: {
    display: 'Warrior',
    passives: ['+Attack', '+Defence', '+Stamina'],
    effects: [
      {
        display: 'Well placed kick',
        tooltip: 'Last resource attack',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 2,
        interruptible: true,
        stamina: 1,
        range: makeRange(0, 1),
      },
    ],
  },
  rogue: {
    display: 'Rogue',
    passives: ['+Speed', '+Speed', '-Attack', '-Stamina'],
    effects: [
      {
        display: 'Strategic Retreat',
        tooltip: 'Jump backwards',
        effects: [effectFunCall(['Basic:Move', { amount: 999 }])],
        priority: 2,
        interruptible: false,
        stamina: 1,
        range: selfRange,
      },
    ],
  },
  berserk: {
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
        interruptible: true,
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
  mage: {
    display: 'Mage',
    passives: ['+StaPerTurn', '+Stamina', '-Health', '-Speed'],
    effects: [
      {
        display: 'Just having a thought',
        tooltip: 'Restores stamina for the next action',
        priority: 4,
        interruptible: false,
        amount: 2,
        stamina: 0,
        range: selfRange,
        effects: [effectFunCall(['Basic:Stamina', { amount: 999 }])],
      },
    ],
  },
  cleric: {
    display: 'Cleric',
    passives: ['+Defence', '+Stamina'],
    effects: [
      {
        display: 'Minor Healing',
        tooltip: 'Restores some HP',
        amount: 3,
        effects: [effectFunCall(['Basic:HP', { amount: 5 }])],
        priority: 3,
        interruptible: false,
        stamina: 3,
        range: selfRange,
      },
    ],
  },
};

export default classes as Classes;
