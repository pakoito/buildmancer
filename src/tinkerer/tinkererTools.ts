import play from "../utils/playGame";
import { Enemies, EnemiesStats, Play } from "../utils/types";
import { build, defaultStatus, enemies, makeStat } from "../utils/data";
import { TinkererOptions } from "./tinkerer";

export const makeGame = (gameConfig: GameConfig): Play => play(
  {
    id: "1",
    lore: {
      name: "XXX",
      age: 123,
    },
    build: {
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
    }
  },
  {
    hp: makeStat(gameConfig.player.hp),
    stamina: makeStat(gameConfig.player.stamina),
    staminaPerTurn: makeStat(gameConfig.player.staminaPerTurn),
    speed: makeStat(gameConfig.player.speed),
    attack: makeStat(gameConfig.player.attack),
    defence: makeStat(gameConfig.player.defence),
    status: defaultStatus
  },
  gameConfig.enemies.map(v => enemies[v][0]) as Enemies,
  gameConfig.enemies.map(v => enemies[v][1]) as EnemiesStats,
  gameConfig.turns,
  gameConfig.seed);

export type GameConfig = {
  enemies: number[],
  basic: number,
  class: number,
  weapon: number,
  skill: number,
  offhand: number,
  consumable: number,
  armor: number,
  headgear: number,
  footwear: number,
  charm: number,
  player: {
    hp: number,
    stamina: number,
    staminaPerTurn: number,
    speed: number,
    attack: number,
    defence: number
  },
  turns: number,
  seed: string | number,
  gameOptions?: Partial<TinkererOptions>,
}