import minimist from 'minimist';
import { writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { findBestBuild } from '../game/tinkerer';
import { Enemy, EnemyInfo, EnemyStats, safeEntries, Seed } from '../game/types';
import { Seq } from 'immutable';
import { enemies, randomEnemy, randomPlayer } from '../game/data';
import { pipe, rangeArr } from '../game/zFunDump';

const start = async (args: minimist.ParsedArgs) => {

  const { encounters, population, output, iter, iterPergame, top } = args;

  const encountersFinal: number | number[][] = encounters ?? 100;
  const populationFinal: number = population ?? 100;
  const iterFinal: number = iter ?? 100;
  const iterPergameFinal: number = iterPergame ?? 100;
  const topFinal: number = top ?? 10;

  const playerPop = rangeArr(populationFinal).map((_) => randomPlayer()[0]);
  const gauntlet: [Seed, EnemyInfo[]][] = Array.isArray(encountersFinal)
    ? encountersFinal.map(e => [Math.random(), e.map(ee => enemies[ee])])
    : rangeArr(encounters).map(_ =>
      pipe(Math.random() * 6, (roll) =>
        [Math.random(), [randomEnemy(), ...(roll > 3 ? [randomEnemy()] : []), ...(roll > 5 ? [randomEnemy()] : [])]]
      )
    );

  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render({ encounters: encountersFinal, population: populationFinal, iter: iterFinal, iterPergame: iterFinal, top: topFinal })}\n==========\n`);

  const results = findBestBuild(playerPop, gauntlet, iterFinal, iterPergameFinal);

  console.log(`\n==========\nPLAYERS\n==========\n${prettyjson.render(Seq(results).take(topFinal).reduce((acc, { score, phenotype: player }, idx) => ({ ...acc, [idx]: safeEntries(player.build).reduce((acc, [k, v]) => ({ ...acc, [k]: v.display }), { score }) }), {}))}\n==========\n`);

  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify({ args, results }, null, 2));
  }
}

start(minimist(process.argv.slice(2)));
