import { allRanges, selfRange, makeRange } from '../makeGame';
import { BuildRepository, effectFunCall } from '../types';
import armors from './armors';
import charms from './charms';
import classes from './classes';
import consumables from './consumables';
import footwears from './footwears';
import headgears from './headgears';
import offhands from './offhand';
import skills from './skills';
import weapons from './weapons';

const build: BuildRepository = {
  debug: {
    disabled: {
      display: 'None',
    },
    enabled: {
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
  },
  basic: {
    basic: {
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
  },
  class: classes,
  skill: skills,
  weapon: weapons,
  offhand: offhands,
  armor: armors,
  headgear: headgears,
  footwear: footwears,
  charm: charms,
  consumable: consumables,
};

export default build;
