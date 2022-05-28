import { Item } from '../types';

export type ArmorsIndex = keyof typeof armors;
export type Armors = { [k in ArmorsIndex]: Item };
const armors = {
  heavy: {
    display: 'Heavy',
    passives: [
      '+Defence',
      '+Defence',
      '+Defence',
      '+Defence',
      '-Speed',
      '-Speed',
      '-StaPerTurn',
    ],
  },
  medium: {
    display: 'Medium',
    passives: ['+Defence', '+Defence', '-StaPerTurn'],
  },
  light: {
    display: 'Light',
    passives: ['+Defence'],
  },
  none: {
    display: 'None',
    passives: ['+Speed'],
  },
};

export default armors as Armors;
