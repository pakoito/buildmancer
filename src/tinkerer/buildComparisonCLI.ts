import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { build, enemies, randomBuild, randomEnemy, randomPlayer } from '../utils/data';
import tinker, { defaultTinkererOptions } from './tinkerer';
import { Build, Enemy, EnemyStats, Play } from '../utils/types';
import { pipe, rangeArr } from '../utils/zFunDump';
import { makeGameNew } from '../utils/playGame';
import { ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { Seq } from 'immutable';
import { Chance } from 'chance';
import { BuildConfig, makeBuild, randBuild } from './tinkererTools';

const makeGame = (p: Build, e: Enemy, s: EnemyStats) =>
  pipe(randomPlayer(undefined, p), ([player, playerStats]) =>
    makeGameNew(player, playerStats, [e], [s], 50, Math.random())
  );


const playGauntlet = (iterations: number, seed: string, p: Build, gauntlet: [Enemy, EnemyStats][]): ScoredPhenotype<Play>[][] =>
  gauntlet.reduce((acc, [enemies, enemiesStats]) =>
    [...acc, tinker(makeGame(p, enemies, enemiesStats), iterations, { playerSeed: seed })],
    [] as ScoredPhenotype<Play>[][]);

const start = async ({ builds, encounters, encounterCount, iterations, output, takeTop, seed }: minimist.ParsedArgs) => {
  const players = (JSON.parse(readFileSync(builds).toString()) as BuildConfig[]).map(b => makeBuild(b));
  if (encounters == null && encounterCount == null) {
    console.log(`Please pass one of encounters or encounterCount`);
    return;
  }
  const enc: number[][] | undefined = encounters;
  const gauntlet: [Enemy, EnemyStats][][] = enc != null
    ? enc.map(e => e.map(ee => enemies[ee]))
    : rangeArr(encounterCount).map(_ =>
      pipe(Math.random() * 6, (roll) =>
        [randomEnemy(), ...(roll > 3 ? [randomEnemy()] : []), ...(roll > 5 ? [randomEnemy()] : [])]
      )
    );

  const playerSeed = seed ?? defaultTinkererOptions.playerSeed;
  const topScores = takeTop ?? 5;
  const config = { players: players.length, playerSeed, iterations, topScores };
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(config)}\n\n==========\nGAUNTLET\n==========\n${prettyjson.render(gauntlet.map((a, idx) => [idx, a.map(b => b[0].lore.name)]))}\n==========\n`);

  const results = players.map(p => gauntlet.map(encounter => playGauntlet(iterations, playerSeed, p, encounter)));
  const scores = results.map(ph => ph.reduce((acc, gaunlet) => acc + gaunlet.reduce((acc, encounter) => acc + Seq(encounter).take(topScores).reduce((acc, result) => acc + result.score, 0), 0), 0));
  const winner = scores.reduce(([lead, player], score, idx) => score > lead ? [score, idx] : [lead, player], [0, 0]);

  console.log(`\n==========\nSCORES\n==========\n${prettyjson.render(scores)}\n==========\n`);
  console.log(`\n==========\nWINNER\n==========\n${winner[1]} with score ${winner[0]}\n\n${prettyjson.render(players[winner[1]])}\n==========\n`);

  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify({ config, gauntlet, players, results }, null, 2));
  }
}

start(minimist(process.argv.slice(2)));
