import { enemies, build } from './data';
import { Chance } from 'chance';
import names from './data/names';
import { globals } from './modding';
import {
  UpTo,
  Subtract,
  Distances,
  Ranges,
  Stat,
  Status,
  EnemyInfo,
  Build,
  PlayerStats,
  Player,
} from './types';

export const makeRange = (...number: UpTo<Subtract<Distances, 1>>[]) =>
  [...new Set(number)] as Ranges;
export const allRanges = makeRange(0, 1, 2, 3, 4);
export const selfRange = allRanges;

export const makeStat = (amount: number, max: number = amount + 5): Stat => ({
  current: amount,
  starting: amount,
  max,
});
export const defaultStatus: Status = {
  dodge: { active: false },
  armor: { amount: 0 },
  bleed: { turns: 0 },
  stun: { active: false },
};

export const randomEnemy = (): EnemyInfo => new Chance().pickone(enemies);
export const dummyEnemy = (): EnemyInfo => globals().trainingEnemy;

export const randomName = () => names[Math.floor(Math.random() * names.length)];

export const randomBuild = (
  rng: Chance.Chance,
  buildOverride?: Partial<Build>
) => ({
  debug: build.debug[globals().debug ? 1 : 0],
  basic: rng.pickone(build.basic),
  class: rng.pickone(build.class),
  skill: rng.pickone(build.skill),
  armor: rng.pickone(build.armor),
  weapon: rng.pickone(build.weapon),
  offhand: rng.pickone(build.offhand),
  footwear: rng.pickone(build.footwear),
  headgear: rng.pickone(build.headgear),
  charm: rng.pickone(build.charm),
  consumable: rng.pickone(build.consumable),
  ...buildOverride,
});

export const playerStatsDefault: PlayerStats = {
  hp: makeStat(10),
  stamina: makeStat(6),
  staminaPerTurn: makeStat(2),
  speed: makeStat(0),
  attack: makeStat(0),
  defence: makeStat(0),
  status: defaultStatus,
};

export const randomPlayer = (
  statsOverride?: PlayerStats,
  buildOverride?: Partial<Build>
): [Player, PlayerStats] => {
  const rng = new Chance();
  return [
    {
      id: rng.string(),
      lore: {
        name: randomName(),
        age: rng.age(),
      },
      build: randomBuild(rng, buildOverride),
    },
    {
      ...playerStatsDefault,
      ...statsOverride,
    },
  ];
};
