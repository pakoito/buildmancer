import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'fs';
import prettyjson from 'prettyjson';
import { enemies, randomEnemy, randomPlayer } from '../utils/data';
import tinker, { defaultTinkererOptions } from './tinkerer';
import { Build, Enemies, EnemiesStats, Enemy, EnemyStats, Play, safeEntries } from '../utils/types';
import { pipe, rangeArr } from '../utils/zFunDump';
import { makeGameNew } from '../utils/playGame';
import { ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { Seq } from 'immutable';
import { BuildConfig, makeBuild } from './tinkererTools';
import { type } from 'os';

type Seed = number | string;

const makeGame = (p: Build, e: [Enemy, EnemyStats][], seed: Seed) =>
  pipe(randomPlayer(undefined, p), ([player, playerStats]) =>
    makeGameNew(player, playerStats, e.map(([enemy, _]) => enemy) as Enemies, e.map(([_, enemyStats]) => enemyStats) as EnemiesStats, 50, seed)
  );

const playGauntlet = (iterations: number, playerSeed: string, p: Build, gauntlet: [Seed, [Enemy, EnemyStats][]][]): ScoredPhenotype<Play>[][] =>
  gauntlet.reduce((acc, [seed, enemies]) =>
    [...acc, tinker(makeGame(p, enemies, seed), iterations, { playerSeed })],
    [] as ScoredPhenotype<Play>[][]);

const start = async ({ builds, encounters, encounterCount, iterations, output, takeTop, seed }: minimist.ParsedArgs) => {
  const players = (JSON.parse(readFileSync(builds).toString()) as BuildConfig[]).map(b => makeBuild(b));
  if (encounters == null && encounterCount == null) {
    console.log(`Please pass one of encounters or encounterCount`);
    return;
  }
  const enc: number[][] | undefined = encounters;
  const gauntlet: [Seed, [Enemy, EnemyStats][]][] = enc != null
    ? enc.map(e => [Math.random(), e.map(ee => enemies[ee])])
    : rangeArr(encounterCount).map(_ =>
      pipe(Math.random() * 6, (roll) =>
        [Math.random(), [randomEnemy(), ...(roll > 3 ? [randomEnemy()] : []), ...(roll > 5 ? [randomEnemy()] : [])]]
      )
    );

  const playerSeed: string = seed ?? defaultTinkererOptions.playerSeed;
  const topScores: number = takeTop ?? 5;
  const config = { players: players.length, playerSeed, iterations, topScores };
  console.log(`\n==========\nCONFIG\n==========\n${prettyjson.render(config)}\n==========\n`);
  console.log(`\n==========\nPLAYERS\n==========\n${prettyjson.render(players.reduce((acc, player, idx) => ({ ...acc, [idx]: safeEntries(player).reduce((acc, [k, v]) => ({ ...acc, [k]: v.display }), {}) }), {}))}\n==========\n`);
  console.log(`\n==========\nGAUNTLET\n==========\n${prettyjson.render(gauntlet.reduce((acc, [_, e], idx) => ({ ...acc, [idx]: e.map(b => b[0].lore.name) }), {}))}\n==========\n`);


  const results = players.map(p => playGauntlet(iterations, playerSeed, p, gauntlet));
  const scores: number[] = results.map(ph => ph.reduce((acc, gaunlet) => acc + Seq(gaunlet).take(topScores).reduce((acc, result) => acc + result.score, 0), 0));
  const winner: [number, number] = scores.reduce(([lead, player], score, idx) => score > lead ? [score, idx] : [lead, player], [0, 0]);

  console.log(`\n==========\nWINNER\n==========\n${winner[1]} with score ${winner[0]}\n\n${prettyjson.render(safeEntries(players[winner[1]]).reduce((acc, [k, v]) => ({ ...acc, [k]: v.display }), {}))}\n==========\n`);
  console.log(`\n==========\nSCORES\n==========\n${prettyjson.render(scores)}\n==========\n`);

  if (output != null) {
    console.log(`Writing to ${output}...`);
    writeFileSync(output, JSON.stringify({ config, gauntlet, players, results }, null, 2));
  }
}

start(minimist(process.argv.slice(2)));
