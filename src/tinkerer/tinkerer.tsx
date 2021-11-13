import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { handlePlayerEffect, Play, playerActions, turnDeterministicRng, setSelected } from '../playGame';
import Chance from 'chance';
import { MonsterTarget } from '../types';
import { previousState } from '../utils';
import prettyjson from 'prettyjson';
import { Seq } from 'immutable';

export type IndexPlay = readonly [number, Play];

export type TinkererOptions = typeof defaultTinkererOptions;

export const defaultTinkererOptions = { playerSeed: "Miau", turns: 50, weights: { monster: 0.8, player: 0.15, turn: 0.05 }, debug: false, randPerTurn: 10 };

export const gameRender = (results: ScoredPhenotype<IndexPlay>[]): string => {
  const best: ScoredPhenotype<IndexPlay> = Seq(results).maxBy(a => a.score)!!;
  const lastState = previousState(best.phenotype[1]);
  return `BEST BY ${best.score} in ${best.phenotype[1].states.length - 1} turns\n` +
    prettyjson.render([
      lastState.lastAttacks.flatMap(([target, id]) => [target === 'Player' ? 'Player' : `[${target}] ${lastState.enemies[target]!!.lore.name}`, id]),
      lastState.enemies.flatMap((a, idx) => [`[${idx}] ${a.lore.name}`, a.stats]),
      lastState.player.stats
    ]);
}

export default function tinkerer(play: Play, iter: number, monsterSeed: any, options_?: TinkererOptions): ScoredPhenotype<IndexPlay>[] {
  const options = { ...defaultTinkererOptions, ...options_ };
  const range = [...Array(iter).keys()];
  const rand = new Chance(options.playerSeed);
  const config: GeneticAlgorithmConfig<IndexPlay> = {
    mutationFunction: ([idx, oldPlay]) => {
      const latestState = previousState(oldPlay);
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.stats.hp, 0);
      const playerHealth = latestState.player.stats.hp;
      if (playerHealth === 0 || monsterHealth === 0) {
        return [idx, oldPlay];
      }
      let newPlay = oldPlay;
      if (rand.d6() === 6) {
        newPlay = setSelected(newPlay, rand.natural({ min: 0, max: previousState(newPlay).enemies.length - 1 }) as MonsterTarget);
      }
      const latest = previousState(newPlay);
      const actions = playerActions(latest.player);
      const unavailable = actions.map((a, idx) => [a, idx] as const).filter(([a, _]) => a.stamina > latest.player.stats.stamina).map(([_, idx]) => idx);
      newPlay = handlePlayerEffect(
        newPlay,
        rand.natural({ min: 0, max: actions.length - 1, exclude: unavailable }),
        turnDeterministicRng(options.turns, options.randPerTurn, monsterSeed)
      );
      return [idx, newPlay];
    },
    fitnessFunction: ([idx, play]) => {
      const latestState = previousState(play);
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.stats.hp, 0);
      const playerHealth = latestState.player.stats.hp;
      const startPlayerHealth = play.states[0].player.stats.hp;
      const startMonsterHealth = play.states[0].enemies.reduce((acc, monster) => acc + monster.stats.hp, 0);

      const monsterKillingFitness = ((startMonsterHealth - monsterHealth) / startMonsterHealth);
      const playerAlivenessFitness = (playerHealth / startPlayerHealth);
      const killSpeedFitness = (options.turns - play.states.length) / options.turns;

      const fitness = (monsterKillingFitness * options.weights.monster) + (playerAlivenessFitness * options.weights.player) + (killSpeedFitness * options.weights.turn);
      if (options.debug) {
        console.log(`[${idx}] MH: ${monsterHealth} | PH: ${playerHealth} | TR: ${play.states.length}\nFitness: ${fitness} | MF: ${monsterKillingFitness} | PF: ${playerAlivenessFitness} | TF: ${killSpeedFitness}`);
      }
      return fitness;
    },
    population: range.map((_, idx) => [idx, play]) as IndexPlay[],
    populationSize: iter,
  }

  let gen = new GeneticAlgorithmConstructor<IndexPlay>(config);
  for (let i = 0; i < options.turns; i++) {
    gen = gen.evolve();
  }
  return gen.scoredPopulation();
}
