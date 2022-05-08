import minimist from 'minimist';
import { writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { findBestBuild } from '../utils/tinkerer';
import { safeEntries } from '../utils/types';
import { Seq } from 'immutable';

const start = async (args: minimist.ParsedArgs) => {

  const { encounters, population, output, iter, iterPergame, top } = args;

  const encountersFinal = encounters ?? 100;
  const populationFinal = population ?? 100;
  const iterFinal = iter ?? 100;
  const iterPergameFinal = iterPergame ?? 100;
  const topFinal = top ?? 10;

  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render({ encounters: encountersFinal, population: populationFinal, iter: iterFinal, iterPergame: iterFinal, top: topFinal })}\n==========\n`);

  const results = findBestBuild(encountersFinal, populationFinal, iterFinal, iterPergameFinal)

  console.log(`\n==========\nPLAYERS\n==========\n${prettyjson.render(Seq(results).take(topFinal).reduce((acc, { score, phenotype: player }, idx) => ({ ...acc, [idx]: safeEntries(player.build).reduce((acc, [k, v]) => ({ ...acc, [k]: v.display }), { score }) }), {}))}\n==========\n`);

  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify({ args, results }, null, 2));
  }
}

start(minimist(process.argv.slice(2)));
