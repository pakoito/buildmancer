import GeneticAlgorithmConstructor, { GeneticAlgorithmConfig, ScoredPhenotype } from 'geneticalgorithm';
import { handlePlayerEffect, Play, playerActions, setSelected } from '../playGame';
import Chance from 'chance';
import { MonsterTarget, Subtract, UpTo } from '../types';
import { Seq } from 'immutable';

const rand = new Chance();

type N = 5;

type IndexPlay = [UpTo<Subtract<N, 1>>, Play];

const seed = 'paco';

// const play: Play = {
//   states: [{
//     player: {
//       id: "1",
//       lore: {
//         name: "XXX",
//         age: 123,
//       },
//       stats: {
//         hp: 10,
//         stamina: 8,
//         staminaPerTurn: 2,
//       },
//       build: {
//         basic: build.basic[0],
//         class: build.class[0],
//         weapon: build.weapon[0],
//         skill: build.skill[0],
//         offhand: build.offhand[0],
//         consumable: build.consumable[0],
//         armor: build.armor[0],
//         headgear: build.headgear[0],
//         footwear: build.footwear[0],
//         charm: build.charm[0],
//       }
//     },
//     enemies: [enemies[0]],
//     target: 0,
//     lastAttacks: [],
//   }]
// }

export const start = (play: Play, iter: number): ScoredPhenotype<Play> => {
  const rnd = [...Array(iter).keys()].map(() => new Chance(seed));
  const config: GeneticAlgorithmConfig<IndexPlay> = {
    mutationFunction: ([idx, oldPlay]) => {
      let newPlay = oldPlay;
      if (rand.d6() === 6) {
        newPlay = setSelected(newPlay, rand.natural({ min: 0, max: newPlay.states[newPlay.states.length - 1].enemies.length - 1 }) as MonsterTarget);
      }
      const latest = newPlay.states[newPlay.states.length - 1];
      const actions = playerActions(latest.player);
      const unavailable = actions.map((a, idx) => [a, idx] as const).filter(([a, _]) => a.stamina <= latest.player.stats.stamina).map(([_, idx]) => idx);
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
    population: [...Array(iter).keys()].map((_, idx) => [idx, play]) as IndexPlay[],
    populationSize: iter,
  }

  const genC = new GeneticAlgorithmConstructor<IndexPlay>(config);
  let gen = genC;
  for (const i in [...Array(iter).keys()]) {
    console.log(`Gen ${i}`);
    gen = gen.evolve();
    console.log(`Best: ${gen.bestScore()}`);
  }
  console.log(gen.best());
  return Seq(gen.scoredPopulation()).sortBy(({ score }) => score).first();
}
