import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';
import { handlePlayerEffect, playerActions, setSelected } from '../utils/playGame';
import Chance from 'chance';
import { MonsterTarget, Play } from '../utils/types';
import { previousState } from '../utils/data';
import prettyjson from 'prettyjson';
import { Seq } from 'immutable';

export type TinkererOptions = typeof defaultTinkererOptions & { turns?: number };

export const defaultTinkererOptions = {
  playerSeed: "Miau",
  weights: { monster: 0.70, player: 0.125, turn: 0.05, stamina: 0.075 },
  debug: false,
};

export const gameRender = (results: ScoredPhenotype<Play>[]): string => {
  const best: ScoredPhenotype<Play> = Seq(results).maxBy(a => a.score)!!;
  const lastState = previousState(best.phenotype);
  return `BEST BY ${best.score} in ${best.phenotype.states.length - 1} turns\n` +
    prettyjson.render([
      lastState.lastAttacks.map(({ origin, display, phase }) => [origin === 'Player' ? 'Player' : `${best.phenotype.enemies[origin]!!.lore.name} [${origin}]`, display, phase]),
      Seq(best.phenotype.enemies).zip(Seq(lastState.enemies)).flatMap(([enemy, stats], idx) => [`[${idx}] ${enemy.lore.name}`, stats]).toArray(),
      lastState.player,
    ]);
}

export default function tinkerer(play: Play, iter: number, optionsOverride?: Partial<TinkererOptions>): ScoredPhenotype<Play>[] {
  const options: TinkererOptions = { ...defaultTinkererOptions, ...optionsOverride };
  const range = [...Array(iter).keys()];
  const rand = new Chance(options.playerSeed);
  const actions = playerActions(play.player);
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

  const turns = optionsOverride?.turns ? optionsOverride?.turns : play.turns;
  let gen = new GeneticAlgorithmConstructor<Play>(config);
  for (let i = 0; i < turns; i++) {
    gen = gen.evolve();
  }
  return gen.scoredPopulation();
}
