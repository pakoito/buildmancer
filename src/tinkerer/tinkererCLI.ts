import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import play, { Play } from '../playGame';
import { Enemies } from '../types';
import prettyjson from 'prettyjson';
import { build, enemies } from '../utils/data';
import tinker, { gameRender, TinkererOptions } from './tinkerer';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import hasher from 'object-hash';

PouchDb.plugin(pouchFind);

const makeGame = (gameConfig: GameConfig): Play => play(
  {
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
  }, gameConfig.enemies.map(v => enemies[v]) as Enemies, gameConfig.turns, gameConfig.seed);

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

export const paramsRender = (params: GameConfig): string => {
  const resolve = {
    ...params,
    enemies: params.enemies.map(a => enemies[a].lore.name),
    basic: build.basic[params.basic].display,
    class: build.class[params.class].display,
    weapon: build.weapon[params.weapon].display,
    skill: build.skill[params.skill].display,
    offhand: build.offhand[params.offhand].display,
    consumable: build.consumable[params.consumable].display,
    armor: build.armor[params.armor].display,
    headgear: build.headgear[params.headgear].display,
    footwear: build.footwear[params.footwear].display,
    charm: build.charm[params.charm].display,
  }
  return prettyjson.render(resolve);
}

const start = async ({ json, iterations, seed, output, db }: minimist.ParsedArgs) => {
  const params = JSON.parse(readFileSync(json).toString()) as GameConfig;
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render({ seed, iterations })}\n${paramsRender(params)}\n==========\n`);
  const gameOptions = params.gameOptions || {};
  const results = tinker(makeGame(params), iterations, gameOptions);
  console.log(`\n==========\nRESULT\n==========\n${gameRender(results)}\n==========\n`);
  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify(results, null, 2));
  }
  if (db != null) {
    console.log(`Storing in ${db}...`);
    const pouch = new PouchDb(db);
    await pouch.createIndex({
      index: { fields: ['score'] }
    });
    for (const r of results) {
      const hash = hasher(r);
      const res = await pouch.get(hash).catch(() => null);
      if (res == null) {
        await pouch.put({ _id: hash, ...r }).catch((e) => { });
      }
    }
  }
}

start(minimist(process.argv.slice(2)));
