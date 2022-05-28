import { selfRange, makeRange } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type SkillsIndex = keyof typeof skills;
export type Skills = { [k in SkillsIndex]: Item };
const skills = {
  sturdy: {
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
        interruptible: false,
        range: selfRange,
      },
    ],
  },
  nimble: {
    display: 'Nimble',
    effects: [
      {
        display: 'Dodge',
        tooltip: 'Avoid one enemy attack',
        effects: [effectFunCall('Effect:Dodge')],
        priority: 2,
        interruptible: false,
        stamina: 4,
        range: selfRange,
      },
    ],
  },
  resourceful: {
    display: 'Resourceful',
    effects: [
      {
        display: 'Dodge this!',
        tooltip: 'Throws a stone',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 3,
        interruptible: true,
        stamina: 3,
        range: makeRange(3, 4),
      },
    ],
  },
};

export default skills as Skills;
