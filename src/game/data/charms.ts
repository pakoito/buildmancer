import { Item } from '../types';

export type CharmsIndex = keyof typeof charms;
export type Charms = { [k in CharmsIndex]: Item };
export const charms = {
  health: {
    display: 'of Health',
    passives: ['+Health', '-Speed'],
    tooltip: 'Increases your maximum health',
  },
  haste: {
    display: 'of Haste',
    passives: ['+StaPerTurn', '-Stamina'],
    tooltip: 'Increases your maximum stamina regeneration',
  },
  resilience: {
    display: 'of Resilience',
    passives: ['+Stamina', '-StaPerTurn'],
    tooltip: 'Increases your maximum stamina',
  },
  strength: {
    display: 'of Strength',
    passives: ['+Attack', '-Health', '-StaPerTurn'],
    tooltip: 'Increases your maximum attack',
  },
  swiftness: {
    display: 'of Swiftness',
    passives: ['+Speed', '-Attack'],
    tooltip: 'Increases your maximum speed',
  },
  defence: {
    display: 'of Defence',
    passives: ['+Defence', '-Stamina', '-Speed'],
    tooltip: 'Increases your maximum defence',
  },
};

export default charms as Charms;
