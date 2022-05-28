import minimist from 'minimist';
import { readFileSync } from 'fs';
import prettyjson from 'prettyjson';
import PouchDb from 'pouchdb';
import pouchFind from 'pouchdb-find';
import { assert } from 'console';
import { GameConfig, makeGame } from './tinkererTools';

PouchDb.plugin(pouchFind);

const start = async ({ json, db }: minimist.ParsedArgs) => {
  assert(db, 'Plase specify a db');
  const params = JSON.parse(readFileSync(json).toString()) as GameConfig;
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(params)}\n==========\n`);
  const pouch = new PouchDb(db);
  const game = makeGame(params);
  const w = await pouch.find({
    selector: {
      _id: { $regex: `##${game.id}##W##` },
    },
  });
  const l = await pouch.find({
    selector: {
      _id: { $regex: `##${game.id}##L##` },
    },
  });
  console.log(`Victory ${((100 * w.docs.length) / (w.docs.length + l.docs.length)).toFixed(2)}%`);
  console.log(
    `Totals ${w.docs.length} of ${l.docs.length} [${(w.docs.length / l.docs.length).toFixed(2)}%]`
  );
};

start(minimist(process.argv.slice(2)));
