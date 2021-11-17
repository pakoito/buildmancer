import play, { Play } from "../playGame";
import { Enemies, EnemiesStats } from "../types";
import { build, enemies } from "../utils/data";
import { TinkererOptions } from "./tinkerer";

export const makeGame = (gameConfig: GameConfig): Play => play(
  {
    id: "1",
    lore: {
      name: "XXX",
      age: 123,
    },
    build: {
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
    hp: gameConfig.player.hp,
    stamina: gameConfig.player.stamina,
    staminaPerTurn: gameConfig.player.staminaPerTurn,
  },
  gameConfig.enemies.map(v => enemies[v][0]) as Enemies,
  gameConfig.enemies.map(v => enemies[v][1]) as EnemiesStats,
  gameConfig.turns, gameConfig.seed);

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
  },
  turns: number,
  seed: string | number,
  gameOptions?: Partial<TinkererOptions>,
}