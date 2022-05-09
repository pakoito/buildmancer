import GeneticAlgorithmConstructor, {
  GeneticAlgorithmConfig,
  ScoredPhenotype,
} from '../geneticalgorithm/geneticalgorithm';
import {
  handlePlayerEffect,
  makeGameNew,
  playerActions,
  setSelected,
} from './playGame';
import Chance from 'chance';
import {
  Enemies,
  EnemiesStats,
  EnemyInfo,
  MonsterTarget,
  Play,
  Player,
  Seed,
} from './types';
import { build, previousState } from './data';
import { Seq } from 'immutable';
import { rangeArr } from './zFunDump';
import { playerStatsDefault } from './makeGame';

export type TinkererOptions = typeof defaultTinkererOptions & {
  turns?: number;
};

export const defaultTinkererOptions = {
  playerSeed: 'Miau',
  weights: { monster: 0.7, player: 0.125, turn: 0.1, stamina: 0.075 },
  debug: false,
};

export function findBestPlay(
  play: Play,
  iter: number,
  optionsOverride?: Partial<TinkererOptions>
): ScoredPhenotype<Play>[] {
  const options: TinkererOptions = {
    ...defaultTinkererOptions,
    ...optionsOverride,
  };
  const rand = new Chance(options.playerSeed);
  const config: GeneticAlgorithmConfig<Play> = {
    mutationFunction: (oldPlay) => {
      const latestState = previousState(oldPlay);
      const monsterHealth = latestState.enemies.reduce(
        (acc, monster) => acc + monster.hp.current,
        0
      );
      const playerHealth = latestState.player.hp.current;
      if (playerHealth === 0 || monsterHealth === 0) {
        return oldPlay;
      }
      let newPlay = oldPlay;
      while (
        rand.d6() === 6 ||
        (previousState(newPlay).enemies[previousState(newPlay).target]?.hp ??
          0) <= 0
      ) {
        newPlay = setSelected(
          newPlay,
          rand.natural({
            min: 0,
            max: previousState(newPlay).enemies.length - 1,
          }) as MonsterTarget
        );
      }
      const latest = previousState(newPlay);
      const actions = playerActions(play.player, latest.inventory);
      const unavailable = actions
        .map((a, idx) => [a, idx] as const)
        .filter(([a, _]) => a.stamina > latest.player.stamina.current)
        .map(([_, idx]) => idx);
      newPlay = handlePlayerEffect(
        newPlay,
        rand.natural({ min: 0, max: actions.length - 1, exclude: unavailable })
      );
      return newPlay;
    },
    fitnessFunction: (play) => {
      const latestState = previousState(play);
      const monsterHealth = latestState.enemies.reduce(
        (acc, monster) => acc + monster.hp.current,
        0
      );
      const playerHealth = latestState.player.hp.current;
      const playerStamina = latestState.player.stamina.current;
      const startPlayerHealth = play.states[0].player.hp.max;
      const startPlayerStamina = play.states[0].player.stamina.max;
      const startMonsterHealth = play.states[0].enemies.reduce(
        (acc, monster) => acc + monster.hp.current,
        0
      );

      const monsterKillingFitness =
        (startMonsterHealth - monsterHealth) / startMonsterHealth;
      const playerAlivenessFitness = playerHealth / startPlayerHealth;
      const killSpeedFitness = (play.turns - play.states.length) / play.turns;
      const staminaFitness = playerStamina / startPlayerStamina;

      const fitness =
        monsterKillingFitness * options.weights.monster +
        playerAlivenessFitness * options.weights.player +
        killSpeedFitness * options.weights.turn +
        staminaFitness * options.weights.stamina;
      if (options.debug) {
        console.log(
          `MH: ${monsterHealth} | PH: ${playerHealth} | TR: ${
            play.states.length
          }\nFitness: ${fitness} | MF: ${monsterKillingFitness} | PF: ${playerAlivenessFitness} | SF: ${staminaFitness} | TF: ${killSpeedFitness}\nWeights: ${JSON.stringify(
            options.weights
          )}`
        );
      }
      return fitness;
    },
    population: rangeArr(iter).map((_) => play),
    populationSize: iter,
  };

  const turns = optionsOverride?.turns ?? play.turns;
  let gen = new GeneticAlgorithmConstructor<Play>(config);
  for (let i = 0; i < turns; i++) {
    gen = gen.evolve();
  }
  return Seq(gen.scoredPopulation())
    .sortBy((a) => 1000 / a.score)
    .toArray();
}

export const findBestBuild = (
  players: Player[],
  enemies: [Seed, EnemyInfo[]][],
  iter: number,
  gameIter: number,
  populationTotal?: number,
  optionsOverride?: Partial<TinkererOptions>
): ScoredPhenotype<Player>[] => {
  const options: TinkererOptions = {
    ...defaultTinkererOptions,
    ...optionsOverride,
  };
  const rng = new Chance(options.playerSeed);
  const config: GeneticAlgorithmConfig<Player> = {
    mutationFunction: (player: Player) => {
      const toChange = rng.pickone(
        Object.keys(player.build)
      ) as keyof typeof build;
      return {
        ...player,
        build: {
          ...player.build,
          [toChange]: rng.pickone(build[toChange]),
        },
      };
    },
    fitnessFunction: (player: Player) =>
      Seq(enemies)
        .flatMap((g) =>
          Seq(
            findBestPlay(
              makeGameNew(
                player,
                playerStatsDefault,
                g[1].map((a) => a[0]) as Enemies,
                g[1].map((a) => a[1]) as EnemiesStats,
                optionsOverride?.turns ?? 50,
                g[0]
              ),
              gameIter,
              optionsOverride
            )
          ).take(2)
        )
        .reduce((acc, v) => acc + v.score, 0),
    population: players,
    populationSize: populationTotal ?? players.length,
  };

  let gen = new GeneticAlgorithmConstructor<Player>(config);
  for (let i = 0; i < iter; i++) {
    gen = gen.evolve();
  }

  return Seq(gen.scoredPopulation())
    .sortBy((a) => 1000 / a.score)
    .toArray();
};
