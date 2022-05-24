import GeneticAlgorithmConstructor, {
  GeneticAlgorithmConfig,
  ScoredPhenotype,
} from '../geneticalgorithm/geneticalgorithm';
import prettyjson from 'prettyjson';
import {
  handlePlayerEffect,
  initialState,
  makeGameNew,
  playerActions,
  previousState,
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
import { build } from './data';
import { Seq } from 'immutable';
import { playerStatsDefault } from './makeGame';

export type TinkererOptions = typeof defaultTinkererOptions;

export const defaultTinkererOptions = {
  playerSeed: 'Miau',
  weights: { monster: 1000, player: 0, turn: -0.1, stamina: 0 },
  debug: false,
};

interface StartStats {
  startPlayerHealth: number;
  startMonsterHealth: number;
  startPlayerStamina: number;
}
const scorePlay = (
  options: TinkererOptions,
  play: Play,
  { startPlayerHealth, startMonsterHealth, startPlayerStamina }: StartStats
) => {
  const latestState = previousState(play);
  const monsterHealth = latestState.enemies.reduce(
    (acc, monster) => acc + monster.hp.current,
    0
  );
  const playerHealth = latestState.player.hp.current;
  const playerStamina = latestState.player.stamina.current;

  const monsterKillingFitness = Math.max(
    0,
    (startMonsterHealth - monsterHealth) / startMonsterHealth
  );
  const playerAlivenessFitness = playerHealth / startPlayerHealth;
  const killSpeedFitness = (play.turns - play.states.length) / play.turns;
  const staminaFitness = playerStamina / startPlayerStamina;

  const fitness =
    monsterKillingFitness * options.weights.monster +
    playerAlivenessFitness * options.weights.player +
    killSpeedFitness * options.weights.turn +
    staminaFitness * options.weights.stamina;

  if (options.debug || fitness < 0) {
    console.log(
      prettyjson.render({
        player: play.player.lore.name,
        encounter: JSON.stringify(play.enemies.map((e) => e.lore.name)),
        monsterHealth,
        playerHealth,
        turns: play.states.length,
        fitness,
        monsterKillingFitness,
        playerAlivenessFitness,
        staminaFitness,
        killSpeedFitness,
        weights: options.weights,
      })
    );
  }

  return fitness;
};

const startStats = (play: Play): StartStats => {
  const startState = initialState(play);
  const startPlayerHealth = startState.player.hp.max;
  const startPlayerStamina = startState.player.stamina.max;
  const startMonsterHealth = startState.enemies.reduce(
    (acc, monster) => acc + monster.hp.max,
    0
  );
  return {
    startPlayerHealth,
    startMonsterHealth,
    startPlayerStamina,
  };
};

export function findBestPlay(
  play: Play,
  iter: number,
  population: number,
  optionsOverride?: Partial<TinkererOptions>
): ScoredPhenotype<Play>[] {
  const options: TinkererOptions = {
    ...defaultTinkererOptions,
    ...optionsOverride,
  };
  const rand = new Chance(options.playerSeed);
  const initStats = startStats(play);
  const config: GeneticAlgorithmConfig<Play> = {
    mutationFunction: (oldPlay) => {
      const latestState = previousState(oldPlay);
      const monsterHealth = latestState.enemies.reduce(
        (acc, monster) => acc + monster.hp.current,
        0
      );
      const playerHealth = latestState.player.hp.current;

      // Won or loss, we bail
      if (
        playerHealth === 0 ||
        monsterHealth === 0 ||
        oldPlay.states.length >= oldPlay.turns
      ) {
        return oldPlay;
      }

      // Maybe change monster
      let newPlay = oldPlay;
      while (
        rand.d6() === 6 ||
        (latestState.enemies[latestState.target]?.hp.current ?? 0) <= 0
      ) {
        newPlay = setSelected(
          newPlay,
          rand.natural({
            min: 0,
            max: latestState.enemies.length - 1,
          }) as MonsterTarget
        );
      }

      // Use an action
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
    fitnessFunction: (play) => scorePlay(options, play, initStats),
    population: [play],
    populationSize: population,
  };

  let gen = new GeneticAlgorithmConstructor<Play>(config);
  for (let i = 0; i < iter; i++) {
    gen = gen.evolve();
  }

  return Seq(gen.scoredPopulation())
    .sortBy((a) => 1000 / a.score)
    .toArray();
}

const nonMutableProperties = new Set(['debug', 'basic']);
export const findBestBuild = (
  players: Player[],
  enemies: [Seed, EnemyInfo[]][],
  iter: number,
  gameIter: number,
  population: number,
  gamePopulation: number,
  optionsOverride?: Partial<TinkererOptions & { turns: number }>
): ScoredPhenotype<Player>[] => {
  const options: TinkererOptions = {
    ...defaultTinkererOptions,
    ...optionsOverride,
  };
  const rng = new Chance(options.playerSeed);
  const config: GeneticAlgorithmConfig<Player> = {
    mutationFunction: (player: Player) => {
      const toChange = rng.pickone(
        Object.keys(player.build).filter((k) => !nonMutableProperties.has(k))
      ) as keyof typeof build;
      const newItem = rng.pickone(
        build[toChange].filter(
          (a) => a.display !== player.build[toChange].display
        )
      );
      return {
        ...player,
        build: {
          ...player.build,
          [toChange]: newItem,
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
              gamePopulation,
              optionsOverride
            )
          ).take(2)
        )
        .reduce((acc, v) => acc + v.score, 0),
    population: players,
    populationSize: population,
  };

  let gen = new GeneticAlgorithmConstructor<Player>(config);
  for (let i = 0; i < iter; i++) {
    gen = gen.evolve();
  }

  return Seq(gen.scoredPopulation())
    .sortBy((a) => 1000 / a.score)
    .toArray();
};
