import { makeGameNew } from '../game/playGame';
import { Build, Enemies, EnemiesStats, Play, safeValues } from '../game/types';
import { build, enemies } from '../game/data';
import { TinkererOptions } from '../game/tinkerer';
import { rangeArr } from '../game/zFunDump';
import { makeStat, defaultStatus } from '../game/makeGame';
import { ArmorsIndex } from 'src/game/data/armors';
import { CharmsIndex } from 'src/game/data/charms';
import { ConsumablesIndex } from 'src/game/data/consumables';
import { FootwearsIndex } from 'src/game/data/footwears';
import { HeadgearsIndex } from 'src/game/data/headgears';
import { OffhandsIndex } from 'src/game/data/offhand';
import { SkillsIndex } from 'src/game/data/skills';
import { WeaponsIndex } from 'src/game/data/weapons';
import { ClassesIndex } from 'src/game/data/classes';
import { EnemiesIndex } from 'src/game/data/enemies';

export const makeBuild = (gameConfig: BuildConfig): Build => ({
  debug: build.debug[0],
  basic: build.basic._,
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
  basic: rng.pickone(rangeArr(safeValues(build.basic).length)),
  class: rng.pickone(rangeArr(safeValues(build.class).length)),
  weapon: rng.pickone(rangeArr(safeValues(build.weapon).length)),
  skill: rng.pickone(rangeArr(safeValues(build.skill).length)),
  offhand: rng.pickone(rangeArr(safeValues(build.offhand).length)),
  consumable: rng.pickone(rangeArr(safeValues(build.consumable).length)),
  armor: rng.pickone(rangeArr(safeValues(build.armor).length)),
  headgear: rng.pickone(rangeArr(safeValues(build.headgear).length)),
  footwear: rng.pickone(rangeArr(safeValues(build.footwear).length)),
  charm: rng.pickone(rangeArr(safeValues(build.charm).length)),
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
  class: ClassesIndex;
  weapon: WeaponsIndex;
  skill: SkillsIndex;
  offhand: OffhandsIndex;
  consumable: ConsumablesIndex;
  armor: ArmorsIndex;
  headgear: HeadgearsIndex;
  footwear: FootwearsIndex;
  charm: CharmsIndex;
};

export type GameConfig = BuildConfig & {
  enemies: EnemiesIndex[];
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
