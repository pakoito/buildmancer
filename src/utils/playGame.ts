import { Enemies, Player, Snapshot, MonsterTarget, Target, EnemyStats, InventoryEffect, EnemiesStats, PlayerStats, Play, RNG, EffectFun, StatsFun, MultiTurnEffect, Enemy } from "./types";
import { Seq } from "immutable";
import { effectDead, effectRepository, multiTurnEffectRepository, previousState, statsRepository } from "./data";
import { Chance } from "chance";
// @ts-ignore fails on scripts despite having a d.ts file
import { toIndexableString } from 'pouchdb-collate';

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

/**
 * @returns min inclusive, max exclusive rand
 */
function turnDeterministicRng(turns: number, randPerTurn: number, monsterSeed: string | number): RNG {
  const monsterChance = new Chance(monsterSeed);
  const monsterRng =
    [...Array(turns).keys()]
      .map(_ => [...Array(randPerTurn).keys()]
        .map(_ => monsterChance.floating({ min: 0, max: 1, fixed: 2 })));
  return monsterRng as RNG;
}

export const turnRng = (play: Play, turn: number) => (min: number, max: number): number => {
  const turnRng = [...play.rng[turn]];
  return Math.floor(((max - min) * turnRng.pop()!!) + min);
}

const updateMonster = (enemies: EnemiesStats, target: Target, override: (stats: EnemyStats) => object): EnemiesStats =>
  enemies.map((m, idx) =>
    (idx === target)
      ? { ...m, ...override(m) }
      : m) as EnemiesStats;

export const playerPassives = (player: Player): StatsFun[] =>
  Object.values(player.build).flatMap((s) => s.passive ?? []).map(i => statsRepository[i]);

export const playerActions = (player: Player): InventoryEffect[] =>
  Object.values(player.build).flatMap((s) => s.effects ?? []);

export const playerBotEffects = (player: Player): EffectFun[] =>
  Object.values(player.build).flatMap((s) => s.bot ?? []).map((i) => effectRepository[i]);

export const playerEotEffects = (player: Player): EffectFun[] =>
  Object.values(player.build).flatMap((s) => s.eot ?? []).map((i) => effectRepository[i]);

export const actions = {
  attackMonster: (start: Snapshot, curr: Snapshot, target: MonsterTarget, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ hp }) => ({ hp: clamp(hp - amount, 0, start.enemies[target]!!/* enforced by UI */.hp) })),
  }),
  changeDistance: (curr: Snapshot, origin: Target, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, origin, ({ distance }) => ({ distance: clamp(distance + amount, 1, 5) })),
  }),

  attackPlayer: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
  ({
    ...curr,
    player: {
      ...curr.player,
      hp: clamp(curr.player.hp - amount, 0, start.player.hp)
    },
  }),
  modifyPlayerStamina: (
    start: Snapshot,
    curr: Snapshot,
    amount: number,
  ): Snapshot =>
  ({
    ...curr,
    player: {
      ...curr.player,
      stamina: clamp(curr.player.stamina + amount, 0, start.player.stamina),
    },
  }),

  addEotEffect: (
    curr: Snapshot,
    effect: MultiTurnEffect,
  ): Snapshot => ({
    ...curr,
    eot: [...(curr.eot ?? []), effect],
  }),
  addBotEffect: (
    curr: Snapshot,
    effect: MultiTurnEffect,
  ): Snapshot => ({
    ...curr,
    bot: [...(curr.eot ?? []), effect],
  }),

  addEnemy: (
    curr: Snapshot,
    play: Play,
    enemy: Enemy,
    enemyStats: EnemyStats,
  ): [Snapshot, Play] => {
    return play.enemies.length < 5
      ? [{
        ...curr,
        enemies: [...curr.enemies, enemyStats] as EnemiesStats
      },
      {
        ...play,
        enemies: [...play.enemies, enemy] as Enemies,
      }]
      : [curr, play];
  }
};

export default function play(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  const [playerGameStats, enemyGameStats] = playerPassives(player).reduce(([p, e], fun) => fun(p, e), [playerStats, enemiesStats] as const);
  return {
    player,
    enemies,
    states: [{
      player: playerGameStats,
      enemies: enemyGameStats,
      target: 0,
      lastAttacks: []
    }],
    rng: turnDeterministicRng(turns, randPerTurn, seed),
    turns,
    id: toIndexableString([player, enemies, turns, seed]),
    seed,
  };
}

const reducePlayerFuns = (play: Play, funs: EffectFun[], s: Snapshot): Snapshot =>
  funs.reduce((acc, f) => f('Player', play, acc), s);

const reduceMultiTurnFuns = (funs: MultiTurnEffect[], p: Play, s: Snapshot): [Snapshot, Play] =>
  funs.reduce(
    ([snap, play], { effect, origin, parameters }) =>
      multiTurnEffectRepository[effect](parameters)(origin, play, snap),
    [s, p]);

export const handlePlayerEffect = (play: Play, index: number): Play => {
  const { enemies, player, bot, eot } = previousState(play);
  const playerSkills = playerActions(play.player);
  const usedSkill = playerSkills[index];

  // BOT
  const playerBot = playerBotEffects(play.player);
  const preBotState: Snapshot =
    actions.modifyPlayerStamina(play.states[0], previousState(play), player.staminaPerTurn - usedSkill.stamina);
  const [postBotState, postBotPlay] = reduceMultiTurnFuns(bot ?? [], play, preBotState);
  const postPlayerBotState = reducePlayerFuns(postBotPlay, playerBot, postBotState);

  // Turn
  const rand = turnRng(play, play.states.length - 1);
  const functions = Seq(play.enemies).zip(Seq(enemies))
    .map(([e, stats], idx) =>
      [idx as Target,
      stats.hp > 0
        ? e.effects[e.rolls[stats.distance - 1][rand(0, e.rolls[stats.distance - 1].length)]]
        : effectDead] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const [newState, lastAttacks] =
    functions.reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldState, lastAttacks] = acc;
      const target = origin === 'Player' ? postPlayerBotState.target : origin;
      const isInRange = new Set([...effect.range]).has(postPlayerBotState.enemies[target]?.distance!!);
      return isInRange
        ? [effectRepository[effect.effect](origin, postBotPlay, oldState), [...lastAttacks, [origin, effect.display] as [Target, string]]]
        : [oldState, [...lastAttacks, [origin, `${effect.display} ❌❌WHIFF❌❌`] as [Target, string]]];
    }, [postPlayerBotState, [] as [Target, string][]]);

  // EOT
  const preEotState = { ...newState, lastAttacks };
  const playerEot = playerEotEffects(play.player);
  const postPlayerEotState = reducePlayerFuns(postBotPlay, playerEot, preEotState);
  const [postEotState, postEotPlay] = reduceMultiTurnFuns(eot ?? [], postBotPlay, postPlayerEotState);

  return {
    ...postEotPlay,
    states: [...postEotPlay.states, postEotState],
  };
};

export const setSelected = (play: Play, target: MonsterTarget): Play => {
  play.states[play.states.length - 1].target = target;
  return {
    ...play,
    states: [...play.states],
  };
}
