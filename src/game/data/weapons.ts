import { makeRange, allRanges } from '../makeGame';
import { Item, effectFunCall } from '../types';

export type WeaponsIndex = keyof typeof weapons;
export type Weapons = { [k in WeaponsIndex]: Item };
const weapons = {
  sword: {
    display: 'Sword',
    tooltip: 'All-rounder',
    effects: [
      {
        display: 'Slash',
        tooltip: 'Swings at the enemy',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 3,
        dodgeable: true,
        stamina: 2,
        range: makeRange(0, 1),
      },
      {
        display: 'Pommel Hit',
        tooltip: 'Deals a quick blow',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 2,
        dodgeable: true,
        stamina: 2,
        range: makeRange(0),
      },
      {
        display: 'Overhead Slice',
        tooltip: 'Moves into melee and deals a heavy blow',
        effects: [
          effectFunCall(['Basic:Move', { amount: -1 }]),
          effectFunCall(['Basic:Attack', { amount: 4 }]),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 3,
        range: makeRange(1),
      },
    ],
  },
  greatsword: {
    display: 'Greatsword',
    tooltip: 'Specialized in big damage',
    effects: [
      {
        display: 'Rend',
        tooltip: 'Swings at the enemy',
        effects: [effectFunCall(['Basic:Attack', { amount: 3 }])],
        priority: 4,
        dodgeable: true,
        stamina: 4,
        range: makeRange(0, 1),
      },
      {
        display: 'Feint',
        tooltip: 'Quick step backwards',
        effects: [effectFunCall(['Basic:Move', { amount: 1 }])],
        priority: 1,
        dodgeable: false,
        stamina: 1,
        range: makeRange(0, 1),
      },
      {
        display: 'Earth Flattener',
        tooltip: 'Charges a monstruous stunning blow',
        effects: [
          effectFunCall(['Basic:Move', { amount: 5 }]),
          effectFunCall('Effect:Stun'),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 6,
        range: makeRange(1),
      },
    ],
  },
  twinblades: {
    display: 'Twinblades',
    tooltip: 'Specialized in mobility',
    effects: [
      {
        display: 'Swoosh',
        tooltip: 'Deals a strike and moves back',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 2 }]),
          effectFunCall(['Basic:Move', { amount: 1 }]),
        ],
        priority: 2,
        dodgeable: true,
        stamina: 2,
        range: makeRange(0, 1),
      },
      {
        display: 'Fiuuum',
        tooltip: 'Jump attack',
        effects: [
          effectFunCall(['Basic:Move', { amount: -2 }]),
          effectFunCall(['Basic:Attack', { amount: 3 }]),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 3,
        range: makeRange(2, 3),
      },
      {
        display: 'SwishSwishSwishSwish',
        tooltip: 'Deals multiple low damage hits',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
        ],
        priority: 3,
        dodgeable: true,
        stamina: 4,
        range: makeRange(0),
      },
    ],
  },
  katana: {
    display: 'Katana',
    tooltip: 'Specialized in bleeding',
    effects: [
      {
        display: 'Slice & Dice',
        tooltip: 'Deals two swift strikes',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
        ],
        priority: 3,
        dodgeable: true,
        stamina: 2,
        range: makeRange(0, 1),
      },
      {
        display: 'Wakizashi',
        tooltip: 'Short sword with a quick attack causing bleeding',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Effect:Bleed', { target: 'Monster', turns: 2 }]),
        ],
        priority: 2,
        dodgeable: true,
        stamina: 4,
        range: makeRange(0, 1),
      },
      {
        display: 'Unsheathe',
        tooltip: 'Dodges the next attack and deals damage',
        effects: [
          effectFunCall('Effect:Dodge'),
          effectFunCall(['Basic:Attack', { amount: 3 }]),
        ],
        priority: 1,
        dodgeable: true,
        stamina: 4,
        range: makeRange(0),
      },
    ],
  },
  axe: {
    display: 'Axe',
    tooltip: 'Specialized in debuffs',
    effects: [
      {
        display: 'Chop',
        tooltip: 'A slow but reliable attack',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 4,
        dodgeable: true,
        stamina: 3,
        range: makeRange(0, 1),
      },
      {
        display: 'Aim for the head!',
        tooltip: 'Cripples the monster',
        effects: [
          effectFunCall(['Effect:Stat', { target: 'Monster', defence: -1 }]),
          effectFunCall(['Effect:Bleed', { target: 'Player', turns: 2 }]),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 5,
        range: makeRange(1),
      },
      {
        display: 'Target the limbs!',
        tooltip: 'Weakens the monster',
        effects: [
          effectFunCall(['Effect:Stat', { target: 'Monster', attack: -1 }]),
          effectFunCall(['Effect:Bleed', { target: 'Player', turns: 2 }]),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 5,
        range: makeRange(1),
      },
    ],
  },
  lance: {
    display: 'Lance',
    tooltip: 'Specialized in mid-range attacks',
    effects: [
      {
        display: 'Pierce',
        tooltip: 'Pokes the enemy',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 3,
        dodgeable: true,
        stamina: 2,
        range: makeRange(0, 1, 2),
      },
      {
        display: 'Charge!!',
        tooltip: 'Runs towards the enemy to deal a massive blow',
        effects: [
          effectFunCall(['Basic:Move', { amount: -5 }]),
          effectFunCall(['Basic:Attack', { amount: 4 }]),
        ],
        priority: 1,
        dodgeable: true,
        stamina: 3,
        range: makeRange(4),
      },
    ],
  },
  hammer: {
    display: 'Hammer',
    tooltip: 'Specialized in stunning',
    effects: [
      {
        display: 'Head Banger',
        tooltip: 'Hits the enemy in the head',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 2 }]),
          effectFunCall('Effect:Stun'),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 4,
        range: makeRange(0),
      },
      {
        display: 'Large swing',
        tooltip: 'Uses the inertia of the hammer to safely advance',
        effects: [
          effectFunCall(['Basic:Move', { amount: -3 }]),
          effectFunCall('Effect:Stun'),
        ],
        priority: 3,
        dodgeable: true,
        stamina: 3,
        range: makeRange(1, 2, 3),
      },
      {
        display: 'Go for the ankles',
        tooltip: 'Slows down the enemy',
        effects: [
          effectFunCall(['Effect:Stat', { target: 'Monster', speed: -1 }]),
          effectFunCall('Effect:Stun'),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 6,
        range: makeRange(1),
      },
    ],
  },
  claw: {
    display: 'Finger Claw',
    tooltip: 'Specialized in poison',
    effects: [
      {
        display: 'Caress',
        tooltip: 'Applies poison to the monster',
        effects: [
          effectFunCall(['Effect:Poison', { target: 'Monster', turns: 2 }]),
        ],
        priority: 3,
        dodgeable: false,
        stamina: 2,
        range: makeRange(0),
      },
      {
        display: 'Backflip',
        tooltip: 'Dodges an attack and moves backward',
        effects: [
          effectFunCall('Effect:Dodge'),
          effectFunCall(['Basic:Move', { amount: 2 }]),
        ],
        priority: 1,
        dodgeable: false,
        stamina: 4,
        range: makeRange(0, 1),
      },
    ],
  },
  bow: {
    display: 'Bow',
    tooltip: 'Specialized in ranged attacks',
    effects: [
      {
        display: 'Relaxed Shot',
        tooltip: 'Shoots an arrow',
        effects: [effectFunCall(['Basic:Attack', { amount: 2 }])],
        priority: 3,
        dodgeable: true,
        stamina: 2,
        range: makeRange(3, 4),
      },
      {
        display: 'Power Draw',
        tooltip: 'Shoots your strongest arrow and makes you weaker',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 6 }]),
          effectFunCall(['Effect:Stat', { target: 'Player', attack: -1 }]),
        ],
        priority: 3,
        dodgeable: true,
        stamina: 4,
        range: makeRange(4),
      },
    ],
  },
  staff: {
    display: 'Magic Staff',
    tooltip: 'Specialized in multiple attacks',
    effects: [
      {
        display: 'Bolt',
        tooltip: 'Shoots a low damage bolt',
        effects: [effectFunCall(['Basic:Attack', { amount: 1 }])],
        priority: 3,
        dodgeable: true,
        stamina: 3,
        range: allRanges,
      },
      {
        display: 'Pew Pew Pew',
        tooltip: 'Shoots a barrage of bolts',
        effects: [
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
          effectFunCall(['Basic:Attack', { amount: 1 }]),
        ],
        priority: 4,
        dodgeable: true,
        stamina: 8,
        range: makeRange(2, 3, 4),
      },
    ],
  },
};

export default weapons as Weapons;
