import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { build, enemies } from '../game/data';
import { findBestPlay } from '../game/tinkerer';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import { ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { GameConfig, makeGame } from './tinkererTools';
import hasher from 'object-hash';
import { Play } from '../game/types';
import { Seq } from 'immutable';
import { previousState } from '../game/playGame';

PouchDb.plugin(pouchFind);

export const paramsRender = (params: GameConfig): string => {
  const resolve = {
    ...params,
    enemies: params.enemies.map((a) => enemies[a][0].lore.name),
    basic: build.basic._.display,
    class: build.class[params.class].display,
    weapon: build.weapon[params.weapon].display,
    skill: build.skill[params.skill].display,
    offhand: build.offhand[params.offhand].display,
    consumable: build.consumable[params.consumable].display,
    armor: build.armor[params.armor].display,
    headgear: build.headgear[params.headgear].display,
    footwear: build.footwear[params.footwear].display,
    charm: build.charm[params.charm].display,
  };
  return prettyjson.render(resolve);
};

const writeToDb = async (db: string, results: ScoredPhenotype<Play>[]) => {
  const pouch = new PouchDb(db);
  await pouch.createIndex({
    index: { fields: ['score'] },
  });
  const docs = await Promise.all(
    results.flatMap(async (r) => {
      const lastState = previousState(r.phenotype);
      const playerHp = lastState.player.hp.current;
      const monsterHp = lastState.enemies.reduce(
        (acc, m) => m.hp.current + acc,
        0
      );
      const outcome = playerHp > 0 && monsterHp <= 0 ? 'W' : 'L';
      const res = await pouch.get(r.phenotype.id).catch(() => null);
      return res == null
        ? {
            _id: `##${r.phenotype.id}##${outcome}##${hasher(
              r.phenotype.states
            )}##`,
            ...r,
          }
        : [];
    })
  );
  await pouch.bulkDocs(docs).catch((e) => console.log(JSON.stringify(e)));
};

const start = async ({
  json,
  iterations,
  population,
  output,
  db,
}: minimist.ParsedArgs) => {
  const params = JSON.parse(readFileSync(json).toString()) as GameConfig;
  console.log(
    `\n==========\nCONFIG\n==========\n${prettyjson.render({
      seed: params.seed,
      iterations,
    })}\n${paramsRender(params)}\n==========\n`
  );
  const gameOptions = params.gameOptions || {};
  const results = findBestPlay(
    makeGame(params),
    iterations,
    population,
    gameOptions
  );
  console.log(
    `\n==========\nRESULT\n==========\n${gameRender(results)}\n==========\n`
  );
  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify(results, null, 2));
  }
  if (db != null) {
    console.log(`Storing in ${db}...`);
    await writeToDb(db, results);
  }
};

const gameRender = (results: ScoredPhenotype<Play>[]): string => {
  const best: ScoredPhenotype<Play> = Seq(results).maxBy((a) => a.score)!!;
  const lastState = previousState(best.phenotype);
  return (
    `BEST BY ${best.score} in ${best.phenotype.states.length - 1} turns\n` +
    prettyjson.render([
      lastState.lastAttacks.map(({ origin, display, phase }) => [
        origin === 'Player'
          ? 'Player'
          : `${best.phenotype.enemies[origin]!!.lore.name} [${origin}]`,
        display,
        phase,
      ]),
      Seq(best.phenotype.enemies)
        .zip(Seq(lastState.enemies))
        .flatMap(([enemy, stats], idx) => [
          `[${idx}] ${enemy.lore.name}`,
          stats,
        ])
        .toArray(),
      lastState.player,
    ])
  );
};

start(minimist(process.argv.slice(2)));
