import { Item } from '../types';

export type CharmsIndex = keyof typeof charms;
export type Charms = { [k in CharmsIndex]: Item };
export const charms = {
  health: {
    display: 'of Health',
    passives: ['+Health'],
    tooltip: 'Increases your maximum health',
  },
  haste: {
    display: 'of Haste',
    passives: ['+StaPerTurn'],
    tooltip: 'Increases your maximum stamina regeneration',
  },
  resilience: {
    display: 'of Resilience',
    passives: ['+Stamina'],
    tooltip: 'Increases your maximum stamina',
  },
  strength: {
    display: 'of Strength',
    passives: ['+Attack', '-Defence'],
    tooltip: 'Increases your maximum attack',
  },
  swiftness: {
    display: 'of Swiftness',
    passives: ['+Speed', '-Attack'],
    tooltip: 'Increases your maximum speed',
  },
  defence: {
    display: 'of Defence',
    passives: ['+Defence', '-Speed'],
    tooltip: 'Increases your maximum defence',
  },
};

export default charms as Charms;
