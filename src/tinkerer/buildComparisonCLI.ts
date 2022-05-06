import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { enemies, randomEnemy, randomPlayer } from '../utils/data';
import tinker from './tinkerer';
import { Build, Enemy, EnemyStats, Play } from '../utils/types';
import { pipe, rangeArr } from 'src/utils/zFunDump';
import { makeGameNew } from 'src/utils/playGame';
import { ScoredPhenotype } from 'src/geneticalgorithm/geneticalgorithm';
import { Seq } from 'immutable';

const makeGame = (p: Build, e: Enemy, s: EnemyStats) =>
  pipe(randomPlayer(undefined, p), ([player, playerStats]) =>
    makeGameNew(player, playerStats, [e], [s], 50, Math.random())
  );


const playGauntlet = (p: Build, iterations: number, gauntlet: [Enemy, EnemyStats][]): ScoredPhenotype<Play>[][] =>
  gauntlet.reduce((acc, current) => {
    const [enemies, enemiesStats] = current;
    const results = tinker(makeGame(p, enemies, enemiesStats), iterations);
    return [...acc, results];
  }, [] as ScoredPhenotype<Play>[][]);

const start = async ({ builds, encounters, encounterCount, iterations, output }: minimist.ParsedArgs) => {
  const players = JSON.parse(readFileSync(builds).toString()) as Build[];
  if (encounters == null && encounterCount == null) {
    console.log(`Please pass one of encounters or encounterCount`);
    return;
  }
  const gauntlet: [Enemy, EnemyStats][] = encounters != null
    ? encounters.map((e: number) => [enemies[e]])
    : rangeArr(encounterCount).map(a => [randomEnemy()]);
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render({ iterations })}\n\n==========\nPLAYERS\n==========\n${prettyjson.render(players)}\n==========\nGAUNTLET\n==========\n${prettyjson.render(gauntlet)}\n==========\n`);

  const results = players.map(p => playGauntlet(p, iterations, gauntlet));

  const scores = results.map(ph => ph.reduce((acc, encounter) => acc + Seq(encounter).take(5).reduce((acc, result) => acc + result.score, 0), 0))

  console.log(`\n==========\nBESTO\n==========\n${prettyjson.render(scores)}\n==========\n`);

  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify(results, null, 2));
  }
}

//start(minimist(process.argv.slice(2)));


console.log(JSON.stringify([randomPlayer(), randomPlayer(), randomPlayer()]));
