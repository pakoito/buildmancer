import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from 'geneticalgorithm';
import { handlePlayerEffect, Play, playerActions, setSelected } from '../playGame';
import Chance from 'chance';
import { MonsterTarget } from '../types';
import { Seq } from 'immutable';

type IndexPlay = [number, Play];

export default function tinkerer(play: Play, iter: number, monsterSeed: any, options: { playerSeed: any; turns: number } = { globalSeed: "Miau", turns: 50 }): ScoredPhenotype<Play>[] {
  const range = [...Array(iter).keys()];
  const rand = new Chance(options.playerSeed);
  const rnd = range.map(() => new Chance(monsterSeed));
  const config: GeneticAlgorithmConfig<IndexPlay> = {
    mutationFunction: ([idx, oldPlay]) => {
      const latestState = play.states[play.states.length - 1];
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.stats.hp, 0);
      const playerHealth = latestState.player.stats.hp;
      if (playerHealth === 0 || monsterHealth === 0) {
        return [idx, oldPlay];
      }
      let newPlay = oldPlay;
      if (rand.d6() === 6) {
        newPlay = setSelected(newPlay, rand.natural({ min: 0, max: newPlay.states[newPlay.states.length - 1].enemies.length - 1 }) as MonsterTarget);
      }
      const latest = newPlay.states[newPlay.states.length - 1];
      const actions = playerActions(latest.player);
      const unavailable = actions.map((a, idx) => [a, idx] as const).filter(([a, _]) => a.stamina > latest.player.stats.stamina).map(([_, idx]) => idx);
      newPlay = handlePlayerEffect(newPlay, rand.natural({ min: 0, max: actions.length - 1, exclude: unavailable }), rnd[idx]);
      return [idx, newPlay];
    },
    fitnessFunction: ([_, play]) => {
      const latestState = play.states[play.states.length - 1];
      const monsterHealth = latestState.enemies.reduce((acc, monster) => acc + monster.stats.hp, 0);
      const playerHealth = latestState.player.stats.hp;
      const startHealth = play.states[0].player.stats.hp;
      return (1 / (monsterHealth + 0.001)) + (playerHealth / startHealth) + (1 / play.states.length);
    },
    population: range.map((_, idx) => [idx, play]) as IndexPlay[],
    populationSize: iter,
  }

  const genC = new GeneticAlgorithmConstructor<IndexPlay>(config);
  let gen = genC;
  for (let i = options.turns; i > 0; i--) {
    gen = gen.evolve();
  }
  return Seq(gen.scoredPopulation()).sortBy(({ score }) => score).toArray();
}
