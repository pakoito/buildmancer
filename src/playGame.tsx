import { Enemies, Player, Snapshot, MonsterTarget, Target, EnemyStats, EffectFun, InventoryEffect } from "./types";
import { Seq } from "immutable";
import { effectRepository, previousState } from "./utils";
import { Chance } from "chance";

export type PlayHistory = [Snapshot, ...Snapshot[]];

export type Play = {
  states: PlayHistory;
};

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  // TODO check direction of the fold
  funs.reduce((acc, value) => (origin, play, newState) => value(origin, play, acc(origin, play, newState)));

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export function turnDeterministicRng(turns: number, randPerTurn: number, monsterSeed: string | number): (turn: number) => (min: number, max: number) => number {
  const monsterChance = new Chance(monsterSeed);
  const monsterRng =
    [...Array(turns).keys()]
      .map(_ => [...Array(randPerTurn).keys()]
        .map(_ => monsterChance.floating({ min: 0, max: 1, fixed: 2 })));
  return (turn) => {
    const turnRng = [...monsterRng[turn]];
    return (min, max) => ((max - min) * turnRng.pop()!!) + min;
  }
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

export default function play(player: Player, enemies: Enemies): Play {
  return {
    states: [{
      player,
      enemies,
      target: 0,
      lastAttacks: []
    }],
  };
}

export const handlePlayerEffect = (play: Play, index: number, select: (turn: number) => (min: number, max: number) => number): Play => {
  const { enemies, player } = previousState(play);
  const playerSkills = playerActions(player);
  const usedSkill = playerSkills[index];
  const rand = select(play.states.length - 1);
  const functions = Seq(enemies)
    .map((e, idx) =>
      [idx as Target, e.effects[
        e.rolls[e.stats.distance - 1]
        [rand(0, e.rolls[e.stats.distance - 1].length - 1)]
      ]] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const latestState: Snapshot =
    actions.modifyPlayerStamina(play.states[0], previousState(play), player.stats.staminaPerTurn - usedSkill.stamina);
  latestState.lastAttacks = functions.map(([origin, effect]) => [origin, effect.effect] as const).toArray();
  const newState =
    functions.reduce((accState, [origin, effect]) => effectRepository[effect.effect](origin, play, accState), latestState);
  return {
    ...play,
    states: [...play.states, newState],
  };
};

export const setSelected = (play: Play, target: MonsterTarget): Play => {
  play.states[play.states.length - 1].target = target;
  return {
    states: [...play.states],
  };
}
