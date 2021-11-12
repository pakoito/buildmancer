import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { handlePlayerEffect, Play, playerActions, setSelected } from '../playGame';
import Chance from 'chance';
import { MonsterTarget } from '../types';
import { previousState } from '../utils';

export type IndexPlay = readonly [number, Play];

export type TinkererOptions = { playerSeed: any; turns: number; monsterWeight: number, playerWeight: number, turnWeight: number, debug: boolean };

export const defaultTinkererOptions: TinkererOptions = { playerSeed: "Miau", turns: 50, monsterWeight: 0.8, playerWeight: 0.15, turnWeight: 0.05, debug: false };

export default function tinkerer(play: Play, iter: number, monsterSeed: any, options_?: TinkererOptions): ScoredPhenotype<IndexPlay>[] {
  const options = { ...defaultTinkererOptions, ...options_ };
  const range = [...Array(iter).keys()];
  const rand = new Chance(options.playerSeed);
  const rnd = range.map(() => new Chance(monsterSeed));
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
      newPlay = handlePlayerEffect(newPlay, rand.natural({ min: 0, max: actions.length - 1, exclude: unavailable }), rnd[idx]);
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

      const fitness = (monsterKillingFitness * options.monsterWeight) + (playerAlivenessFitness * options.playerWeight) + (killSpeedFitness * options.turnWeight);
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
