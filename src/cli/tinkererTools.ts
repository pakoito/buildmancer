import { makeGameNew } from '../game/playGame';
import { Build, Enemies, EnemiesStats, Play } from '../game/types';
import { build, enemies } from '../game/data';
import { TinkererOptions } from '../game/tinkerer';
import { rangeArr } from '../game/zFunDump';
import { makeStat, defaultStatus } from '../game/makeGame';

export const makeBuild = (gameConfig: BuildConfig): Build => ({
  debug: build.debug[0],
  basic: build.basic[gameConfig.basic],
  class: build.class[gameConfig.class],
  weapon: build.weapon[gameConfig.weapon],
  skill: build.skill[gameConfig.skill],
  offhand: build.offhand[gameConfig.offhand],
  consumable: build.consumable[gameConfig.consumable],
  armor: build.armor[gameConfig.armor],
  headgear: build.headgear[gameConfig.headgear],
  footwear: build.footwear[gameConfig.footwear],
  charm: build.charm[gameConfig.charm],
});

export const randBuild = (rng: Chance.Chance) => ({
  basic: rng.pickone(rangeArr(build.basic.length)),
  class: rng.pickone(rangeArr(build.class.length)),
  weapon: rng.pickone(rangeArr(build.weapon.length)),
  skill: rng.pickone(rangeArr(build.skill.length)),
  offhand: rng.pickone(rangeArr(build.offhand.length)),
  consumable: rng.pickone(rangeArr(build.consumable.length)),
  armor: rng.pickone(rangeArr(build.armor.length)),
  headgear: rng.pickone(rangeArr(build.headgear.length)),
  footwear: rng.pickone(rangeArr(build.footwear.length)),
  charm: rng.pickone(rangeArr(build.charm.length)),
});

export const makeGame = (gameConfig: GameConfig): Play =>
  makeGameNew(
    {
      id: '1',
      lore: {
        name: 'XXX',
        age: 123,
      },
      build: makeBuild(gameConfig),
    },
    {
      hp: makeStat(gameConfig.player.hp),
      stamina: makeStat(gameConfig.player.stamina),
      staminaPerTurn: makeStat(gameConfig.player.staminaPerTurn),
      speed: makeStat(gameConfig.player.speed),
      attack: makeStat(gameConfig.player.attack),
      defence: makeStat(gameConfig.player.defence),
      status: defaultStatus,
    },
    gameConfig.enemies.map((v) => enemies[v][0]) as Enemies,
    gameConfig.enemies.map((v) => enemies[v][1]) as EnemiesStats,
    gameConfig.turns,
    gameConfig.seed
  );

export type BuildConfig = {
  basic: number;
  class: number;
  weapon: number;
  skill: number;
  offhand: number;
  consumable: number;
  armor: number;
  headgear: number;
  footwear: number;
  charm: number;
};

export type GameConfig = BuildConfig & {
  enemies: number[];
  basic: number;
  class: number;
  weapon: number;
  skill: number;
  offhand: number;
  consumable: number;
  armor: number;
  headgear: number;
  footwear: number;
  charm: number;
  player: {
    hp: number;
    stamina: number;
    staminaPerTurn: number;
    speed: number;
    attack: number;
    defence: number;
  };
  turns: number;
  seed: string | number;
  gameOptions?: Partial<TinkererOptions>;
};
