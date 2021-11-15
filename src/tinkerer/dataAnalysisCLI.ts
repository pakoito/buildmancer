import minimist from 'minimist';
import { readFileSync } from 'fs';
import prettyjson from 'prettyjson';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import { assert } from 'console';
import { GameConfig, makeGame } from './tinkererTools';
// @ts-ignore
import { toIndexableString } from 'pouchdb-collate';

PouchDb.plugin(pouchFind);

const start = async ({ json, db }: minimist.ParsedArgs) => {
  assert(db, 'Plase specify a db');
  const params = JSON.parse(readFileSync(json).toString()) as GameConfig;
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(params)}\n==========\n`);
  const pouch = new PouchDb(db);
  const game = makeGame(params);
  const q1 = await pouch.query('game_analysis/victory', {
    key: `${game.id}-VICTORY`
  });
  const q2 = await pouch.query('game_analysis/victory', {
    key: `${game.id}-LOSS`
  });
  const q3 = await pouch.query('game_analysis/victory');
  console.log(`Victory: ${(q1.rows.length / q1.total_rows * 100).toFixed(2)}%`);
  console.log(`Loss: ${(q2.rows.length / q1.total_rows * 100).toFixed(2)}%`);
  console.log(`Count: ${q3.rows.filter(a => a.key.includes(toIndexableString([game.states]))).length}`);
}

start(minimist(process.argv.slice(2)));
