import { selfRange } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type ConsumablesIndex = keyof typeof consumables;
export type Consumables = { [k in ConsumablesIndex]: Item };
export const consumables = {
  healing: {
    display: 'Healing Potion',
    effects: [
      {
        display: 'Healing!',
        tooltip: 'Restores some HP',
        effects: [effectFunCall(['Basic:HP', { amount: 4 }])],
        priority: 4,
        interruptible: false,
        stamina: 5,
        amount: 3,
        range: selfRange,
      },
    ],
  },
  razors: {
    display: 'Pot of Razors',
    effects: [
      {
        display: 'Throw pot',
        tooltip: 'Causes bleeding',
        amount: 2,
        effects: [effectFunCall(['Effect:Bleed', { target: 'Monster', turns: 3 }])],
        priority: 4,
        interruptible: true,
        stamina: 5,
        range: selfRange,
      },
    ],
  },
  bubble: {
    display: 'Life Bubble',
    effects: [
      {
        display: 'Activate Bubble',
        tooltip: 'Protects against a single source of damage this turn',
        effects: [effectFunCall('Effect:Dodge')],
        priority: 1,
        interruptible: false,
        stamina: 1,
        amount: 1,
        range: selfRange,
      },
    ],
  },
  rock: {
    display: 'Pet Rock',
    effects: [
      {
        display: 'Rock, to me!',
        tooltip: 'Reduces damage',
        effects: [effectFunCall(['Effect:Armor', { amount: 3 }])],
        priority: 2,
        interruptible: false,
        stamina: 3,
        amount: 3,
        range: selfRange,
      },
    ],
  },
};

export default consumables as Consumables;
