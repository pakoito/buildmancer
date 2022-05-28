import { makeRange } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type HeadgearsIndex = keyof typeof headgears;
export type Headgears = { [k in HeadgearsIndex]: Item };
export const headgears = {
  helm: {
    display: 'Helm',
    passives: ['+Defence', '+Defence', '-Speed', '-StaPerTurn'],
    tooltip: 'Big protection for slow combatants',
  },
  cap: {
    display: 'Feather Cap',
    passives: ['+StaPerTurn', '+Stamina'],
    tooltip: "Makes you feel energized, doesn't it?",
  },
  magehat: {
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
        interruptible: true,
        stamina: 4,
        range: makeRange(1, 2),
      },
    ],
  },
};

export default headgears as Headgears;
