import { Enemies, Player, Snapshot, MonsterTarget, Target, EnemyStats, EffectFun, InventoryEffect } from "./types";
import { Seq } from "immutable";
import { effectRepository } from "./utils";

export type PlayHistory = [Snapshot, ...Snapshot[]];

export type Play = {
  states: PlayHistory;
};

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  // TODO check direction of the fold
  funs.reduce((acc, value) => (origin, play, newState) => value(origin, play, acc(origin, play, newState)));

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

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

export const handlePlayerEffect = (play: Play, index: number, select: Chance.Chance): Play => {
  const history = play.states;
  const { enemies, player } = history[history.length - 1];
  const playerSkills = playerActions(player);
  const usedSkill = playerSkills[index];
  const functions = Seq(enemies)
    .map((e, idx) =>
      [idx as Target, e.effects[e.rolls[e.stats.distance - 1][
        select.natural({
          min: 0, max: e.rolls[e.stats.distance - 1].length - 1
        })]]] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const latestState: Snapshot =
    actions.modifyPlayerStamina(history[0], history[history.length - 1], player.stats.staminaPerTurn - usedSkill.stamina);
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
