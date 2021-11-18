import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { build, enemies } from '../utils/data';
import tinker, { gameRender } from './tinkerer';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import { ScoredPhenotype } from 'src/geneticalgorithm/geneticalgorithm';
import { GameConfig, makeGame } from './tinkererTools';
import hasher from 'object-hash';
import { Play } from 'src/utils/types';

PouchDb.plugin(pouchFind);

export const paramsRender = (params: GameConfig): string => {
  const resolve = {
    ...params,
    enemies: params.enemies.map(a => enemies[a][0].lore.name),
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

const writeToDb = async (db: string, results: ScoredPhenotype<Play>[]) => {
  const pouch = new PouchDb(db);
  await pouch.createIndex({
    index: { fields: ['score'] }
  });
  const docs = await Promise.all(results.flatMap(async (r) => {
    const lastState = r.phenotype.states[r.phenotype.states.length - 1];
    const playerHp = lastState.player.hp;
    const monsterHp = lastState.enemies.reduce((acc, m) => m.hp + acc, 0);
    const outcome = playerHp > 0 && monsterHp <= 0 ? 'W' : 'L';
    const res = await pouch.get(r.phenotype.id).catch(() => null);
    return (res == null)
      ? { _id: `##${r.phenotype.id}##${outcome}##${hasher(r.phenotype.states)}##`, ...r }
      : [];
  }));
  await pouch.bulkDocs(docs).catch(e => console.log(JSON.stringify(e)));
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
    await writeToDb(db, results);
  }
}

start(minimist(process.argv.slice(2)));
