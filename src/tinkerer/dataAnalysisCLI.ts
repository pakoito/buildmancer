import minimist from 'minimist';
import { readFileSync } from 'fs';
import prettyjson from 'prettyjson';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import { GameConfig } from './tinkererCLI';
import { assert } from 'console';

PouchDb.plugin(pouchFind);

const start = async ({ json, db }: minimist.ParsedArgs) => {
  assert(db, 'Plase specify a db');
  const params = JSON.parse(readFileSync(json).toString()) as Partial<GameConfig>;
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(params)}\n==========\n`);
  const pouch = new PouchDb(db);
  const q1 = await pouch.query('game_analysis/victory', {
    key: 'VICTORY',
    include_docs: true,
  });
  console.log(`Victory: ${q1.rows.length / q1.total_rows * 100}%`);
}

start(minimist(process.argv.slice(2)));
