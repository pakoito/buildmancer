import { makeGameNew } from '../game/playGame';
import {
  Build,
  Enemies,
  EnemiesStats,
  Play,
  PlayerStats,
  safeKeys,
  safeValues,
} from '../game/types';
import { build, enemies } from '../game/data';
import { TinkererOptions } from '../game/tinkerer';
import { rangeArr } from '../game/zFunDump';
import { makeStat, defaultStatus, playerStatsDefault } from '../game/makeGame';
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
  debug: build.debug.disabled,
  basic: build.basic.basic,
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

export const randBuild = (rand: Chance.Chance): BuildConfig => ({
  class: rand.pickone(safeKeys(build.class)),
  weapon: rand.pickone(safeKeys(build.weapon)),
  skill: rand.pickone(safeKeys(build.skill)),
  offhand: rand.pickone(safeKeys(build.offhand)),
  consumable: rand.pickone(safeKeys(build.consumable)),
  armor: rand.pickone(safeKeys(build.armor)),
  headgear: rand.pickone(safeKeys(build.headgear)),
  footwear: rand.pickone(safeKeys(build.footwear)),
  charm: rand.pickone(safeKeys(build.charm)),
});

export const makeGame = (gameConfig: GameConfig): Play =>
  makeGameNew(
    {
      id: '1',
      lore: {
        name: 'XXX',
        age: 123,
      },
      build: makeBuild(gameConfig.player.build),
    },
    gameConfig.player.stats,
    gameConfig.enemies.map((v) => enemies[v][0]) as Enemies,
    gameConfig.enemies.map((v) => enemies[v][1]) as EnemiesStats,
    gameConfig.turns,
    gameConfig.seed
  );

export const randGame = (rand: Chance.Chance): GameConfig => ({
  enemies: [rand.pickone(safeKeys(enemies))],
  player: { stats: playerStatsDefault, build: randBuild(rand) },
  turns: 50,
  seed: rand.string(),
});

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

export type GameConfig = {
  enemies: EnemiesIndex[];
  player: {
    stats: PlayerStats;
    build: BuildConfig;
  };
  turns: number;
  seed: string | number;
  gameOptions?: Partial<TinkererOptions>;
};
