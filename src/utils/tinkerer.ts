import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { handlePlayerEffect, makeGameNew, playerActions, setSelected } from './playGame';
import Chance from 'chance';
import { Enemies, EnemiesStats, Enemy, EnemyStats, MonsterTarget, Play, Player, Seed } from './types';
import { build, enemies, playerStatsDefault, previousState, randomEnemy, randomPlayer } from './data';
import { Seq } from 'immutable';
import { pipe, rangeArr } from './zFunDump';

export type TinkererOptions = typeof defaultTinkererOptions & { turns?: number };

export const defaultTinkererOptions = {
  playerSeed: "Miau",
  weights: { monster: 0.70, player: 0.125, turn: 0.1, stamina: 0.075 },
  debug: false,
};

export function findBestPlay(play: Play, iter: number, optionsOverride?: Partial<TinkererOptions>): ScoredPhenotype<Play>[] {
  const options: TinkererOptions = { ...defaultTinkererOptions, ...optionsOverride };
  const range = rangeArr(iter);
  const rand = new Chance(options.playerSeed);
  const config: GeneticAlgorithmConfig<Play> = {
    mutationFunction: (oldPlay) => {
      const latestState = previousState(oldPlay);
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.hp.current, 0);
      const playerHealth = latestState.player.hp.current;
      if (playerHealth === 0 || monsterHealth === 0) {
        return oldPlay;
      }
      let newPlay = oldPlay;
      while (rand.d6() === 6 || (previousState(newPlay).enemies[previousState(newPlay).target]?.hp ?? 0) <= 0) {
        newPlay = setSelected(newPlay, rand.natural({ min: 0, max: previousState(newPlay).enemies.length - 1 }) as MonsterTarget);
      }
      const latest = previousState(newPlay);
      const actions = playerActions(play.player, latest.inventory);
      const unavailable = actions.map((a, idx) => [a, idx] as const).filter(([a, _]) => a.stamina > latest.player.stamina.current).map(([_, idx]) => idx);
      newPlay = handlePlayerEffect(
        newPlay,
        rand.natural({ min: 0, max: actions.length - 1, exclude: unavailable })
      );
      return newPlay;
    },
    fitnessFunction: (play) => {
      const latestState = previousState(play);
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.hp.current, 0);
      const playerHealth = latestState.player.hp.current;
      const playerStamina = latestState.player.stamina.current;
      const startPlayerHealth = play.states[0].player.hp.max;
      const startPlayerStamina = play.states[0].player.stamina.max;
      const startMonsterHealth = play.states[0].enemies.reduce((acc, monster) => acc + monster.hp.current, 0);

      const monsterKillingFitness = ((startMonsterHealth - monsterHealth) / startMonsterHealth);
      const playerAlivenessFitness = (playerHealth / startPlayerHealth);
      const killSpeedFitness = (play.turns - play.states.length) / play.turns;
      const staminaFitness = (playerStamina / startPlayerStamina);

      const fitness = (monsterKillingFitness * options.weights.monster) + (playerAlivenessFitness * options.weights.player) + (killSpeedFitness * options.weights.turn) + (staminaFitness * options.weights.stamina);
      if (options.debug) {
        console.log(`MH: ${monsterHealth} | PH: ${playerHealth} | TR: ${play.states.length}\nFitness: ${fitness} | MF: ${monsterKillingFitness} | PF: ${playerAlivenessFitness} | SF: ${staminaFitness} | TF: ${killSpeedFitness}\nWeights: ${JSON.stringify(options.weights)}`);
      }
      return fitness;
    },
    population: range.map((_) => play),
    populationSize: iter,
  }

  const turns = optionsOverride?.turns ?? play.turns;
  let gen = new GeneticAlgorithmConstructor<Play>(config);
  for (let i = 0; i < turns; i++) {
    gen = gen.evolve();
  }
  return gen.scoredPopulation();
}

export const findBestBuild = (encounters: number[][] | number, initialPop: number, iter: number, gameIter: number, optionsOverride?: Partial<TinkererOptions>): ScoredPhenotype<Player>[] => {
  const options: TinkererOptions = { ...defaultTinkererOptions, ...optionsOverride };
  const rng = new Chance(options.playerSeed);
  const population = rangeArr(initialPop).map((_) => randomPlayer()[0]);
  const gauntlet: [Seed, [Enemy, EnemyStats][]][] = Array.isArray(encounters)
    ? encounters.map(e => [Math.random(), e.map(ee => enemies[ee])])
    : rangeArr(encounters).map(_ =>
      pipe(Math.random() * 6, (roll) =>
        [Math.random(), [randomEnemy(), ...(roll > 3 ? [randomEnemy()] : []), ...(roll > 5 ? [randomEnemy()] : [])]]
      )
    );
  const config: GeneticAlgorithmConfig<Player> = {
    mutationFunction: (player: Player) => {
      const toChange = rng.pickone(Object.keys(player)) as keyof typeof build;
      return {
        ...player,
        [toChange]: rng.pickone(build[toChange]),
      };
    },
    fitnessFunction: (player: Player) =>
      Seq(gauntlet).flatMap(g =>
        Seq(
          findBestPlay(makeGameNew(player, playerStatsDefault, g[1].map(a => a[0]) as Enemies, g[1].map(a => a[1]) as EnemiesStats, optionsOverride?.turns ?? 50, g[0]), gameIter, optionsOverride)
        ).take(2)
      ).reduce((acc, v) => acc + v.score, 0),
    population,
    populationSize: population.length,
  }

  let gen = new GeneticAlgorithmConstructor<Player>(config);
  for (let i = 0; i < iter; i++) {
    gen = gen.evolve();
  }

  return gen.scoredPopulation();
}
