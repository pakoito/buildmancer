import { selfRange, allRanges } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type FootwearsIndex = keyof typeof footwears;
export type Footwears = { [k in FootwearsIndex]: Item };
export const footwears = {
  slippers: {
    display: 'Slippers of Dooooodge!',
    tooltip: 'Allows you to dodge attacks',
    passives: ['-Stamina'],
    effects: [
      {
        display: 'Advanced Dodge',
        tooltip: 'Avoid 1 attack',
        effects: [effectFunCall('Effect:Dodge')],
        priority: 1,
        interruptible: false,
        stamina: 3,
        range: selfRange,
      },
    ],
  },
  boots: {
    display: 'Boots of Flight',
    tooltip: 'Avoid your enemies',
    passives: ['-Defence'],
    eot: [
      {
        display: 'Flight!',
        tooltip: 'Increases distance at the end of the turn',
        priority: 0,
        interruptible: false,
        range: allRanges,
        effects: [
          effectFunCall('BootsOfFlight:EOT'),
          effectFunCall(['Effect:Stat', { target: 'Player', stamina: -2 }]),
        ],
      },
    ],
  },
  greaves: {
    display: 'Greaves of Stability',
    tooltip: 'Extra resilient',
    passives: ['+Defence', '-Speed'],
    effects: [
      {
        display: 'Dig your heels',
        tooltip: 'Resists damage',
        effects: [effectFunCall(['Effect:Armor', { amount: 3 }])],
        priority: 1,
        interruptible: false,
        stamina: 4,
        range: selfRange,
      },
    ],
  },
};

export default footwears as Footwears;
