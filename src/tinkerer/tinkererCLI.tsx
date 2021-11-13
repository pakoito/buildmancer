import minimist from 'minimist';
import { readFileSync } from 'fs';
import { Play } from '../playGame';
import { build, enemies } from '../utils/data.js';
import { Enemies } from '../types';
import tinker, { gameRender } from './tinkerer.js'
import prettyjson from 'prettyjson';

const makeGame = (gameConfig: GameConfig): Play => ({
  states: [{
    player: {
      id: "1",
      lore: {
        name: "XXX",
        age: 123,
      },
      stats: {
        hp: gameConfig.player.hp,
        stamina: gameConfig.player.stamina,
        staminaPerTurn: gameConfig.player.staminaPerTurn,
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
    enemies: gameConfig.enemies.map(v => enemies[v]) as Enemies,
    target: 0,
    lastAttacks: [],
  }]
});

type GameConfig = {
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
  }
  gameOptions?: any,
}

const start = ({ json, iterations, seed }: minimist.ParsedArgs) => {
  const params = JSON.parse(readFileSync(json).toString()) as GameConfig;
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(params)}\n==========\n`);
  const gameOptions = params.gameOptions || {};
  const results = tinker(makeGame(params), iterations, seed, gameOptions);
  console.log(`\n==========\nRESULT\n==========\n${gameRender(results)}\n==========\n`);
}

start(minimist(process.argv.slice(2)));
