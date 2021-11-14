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
  const result = await pouch.find({
    selector: {
      score: { $gte: 0.8 }
    }
  });
  console.log(`End ${result.docs.length}`);
}

start(minimist(process.argv.slice(2)));
