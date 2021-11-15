import { Enemies, Player, Snapshot, MonsterTarget, Target, EnemyStats, InventoryEffect } from "./types";
import { Seq } from "immutable";
import { effectRepository, previousState } from "./utils/data";
import { Chance } from "chance";
import { Opaque } from "type-fest";
// @ts-ignore fails on scripts despite having a d.ts file
import { toIndexableString } from 'pouchdb-collate';

export type PlayHistory = [Snapshot, ...Snapshot[]];

type RNG = Opaque<number[][], 'RNG'>;

export type Play = Readonly<{
  states: PlayHistory;
  rng: RNG;
  turns: number;
  id: string;
  seed: string | number;
}>;

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

const updateMonster = (enemies: Enemies, target: Target, override: (stats: EnemyStats) => object): Enemies =>
  enemies.map((m, idx) =>
    (idx === target)
      ? { ...m, stats: { ...m.stats, ...override(m.stats) } }
      : m) as Enemies;

export const playerActions = (player: Player): InventoryEffect[] =>
  Object.values(player.build).flatMap((s) => s.effects);

export const actions = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, curr.target, ({ hp }) => ({ hp: clamp(hp - amount, 0, start.enemies[curr.target]!!/* enforced by UI */.stats.hp) })),
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
      stats: { ...curr.player.stats, hp: clamp(curr.player.stats.hp - amount, 0, start.player.stats.hp) },
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
      stats: {
        ...curr.player.stats,
        stamina: clamp(curr.player.stats.stamina + amount, 0, start.player.stats.stamina),
      },
    },
  }),
};

export default function play(player: Player, enemies: Enemies, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  return {
    states: [{
      player,
      enemies,
      target: 0,
      lastAttacks: []
    }],
    rng: turnDeterministicRng(turns, randPerTurn, seed),
    turns,
    id: toIndexableString([player, enemies, turns, seed]),
    seed,
  };
}

export const handlePlayerEffect = (play: Play, index: number): Play => {
  const { enemies, player } = previousState(play);
  const playerSkills = playerActions(player);
  const usedSkill = playerSkills[index];
  const rand = turnRng(play, play.states.length - 1);
  const functions = Seq(enemies)
    .map((e, idx) =>
      [idx as Target, e.effects[
        e.rolls[e.stats.distance - 1]
        [rand(0, e.rolls[e.stats.distance - 1].length)]
      ]] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const latestState: Snapshot =
    actions.modifyPlayerStamina(play.states[0], previousState(play), player.stats.staminaPerTurn - usedSkill.stamina);
  const [newState, lastAttacks] =
    functions.reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldState, lastAttacks] = acc;
      const target = origin === 'Player' ? latestState.target : origin;
      const isInRange = new Set([...effect.range]).has(latestState.enemies[target]?.stats.distance!!);
      return isInRange
        ? [effectRepository[effect.effect](origin, play, oldState), [...lastAttacks, [origin, effect.display] as [Target, string]]]
        : [oldState, [...lastAttacks, [origin, `${effect.display} ❌❌WHIFF❌❌`] as [Target, string]]];
    }, [latestState, [] as [Target, string][]]);
  newState.lastAttacks = lastAttacks;
  return {
    ...play,
    states: [...play.states, newState],
  };
};

export const setSelected = (play: Play, target: MonsterTarget): Play => {
  play.states[play.states.length - 1].target = target;
  return {
    ...play,
    states: [...play.states],
  };
}
