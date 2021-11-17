import { Enemies, Player, Snapshot, MonsterTarget, Target, EnemyStats, InventoryEffect, EnemiesStats, PlayerStats } from "./types";
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
  player: Player;
  enemies: Enemies,
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

const updateMonster = (enemies: EnemiesStats, target: Target, override: (stats: EnemyStats) => object): EnemiesStats =>
  enemies.map((m, idx) =>
    (idx === target)
      ? { ...m, ...override(m) }
      : m) as EnemiesStats;

export const playerActions = (player: Player): InventoryEffect[] =>
  Object.values(player.build).flatMap((s) => s.effects);

export const actions = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, curr.target, ({ hp }) => ({ hp: clamp(hp - amount, 0, start.enemies[curr.target]!!/* enforced by UI */.hp) })),
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
};

export default function play(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  return {
    player,
    enemies,
    states: [{
      player: playerStats,
      enemies: enemiesStats,
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
  const playerSkills = playerActions(play.player);
  const usedSkill = playerSkills[index];
  const rand = turnRng(play, play.states.length - 1);
  const functions = Seq(play.enemies).zip(Seq(enemies))
    .map(([e, stats], idx) =>
      [idx as Target, e.effects[
        e.rolls[stats.distance - 1]
        [rand(0, e.rolls[stats.distance - 1].length)]
      ]] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const latestState: Snapshot =
    actions.modifyPlayerStamina(play.states[0], previousState(play), player.staminaPerTurn - usedSkill.stamina);
  const [newState, lastAttacks] =
    functions.reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldState, lastAttacks] = acc;
      const target = origin === 'Player' ? latestState.target : origin;
      const isInRange = new Set([...effect.range]).has(latestState.enemies[target]?.distance!!);
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
