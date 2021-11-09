import { Enemies, Player, Snapshot, MonsterTarget, Target, Enemy } from "./types";
import { Seq } from "immutable";

export type PlayHistory = [Snapshot, ...Snapshot[]];

export type Play = {
  states: PlayHistory;
  setSelected: (target: MonsterTarget) => Play;
  handlePlayerEffect: (index: number) => Play;
};

const snap = (player: Player, enemies: Enemies, target: MonsterTarget): Snapshot => ({
  player,
  enemies,
  target,
});

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const updateMonster = (enemies: Enemies, target: Target, override: (stats: Enemy) => object): Enemies =>
  enemies.map((m, idx) => (idx === target) ? { ...m, ...override(m) } : m) as Enemies;

export const actions = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(
      curr.player,
      updateMonster(curr.enemies, curr.target, ({ stats: { hp } }) => ({ hp: clamp(hp - amount, 0, start.enemies[curr.target]!!/* enforced by UI */.stats.hp) })),
      curr.target
    ),
  changeDistance: (curr: Snapshot, origin: Target, amount: number): Snapshot =>
    snap(
      curr.player,
      updateMonster(curr.enemies, origin, ({ stats: { distance } }) => ({ distance: clamp(distance + amount, 1, 5) })),
      curr.target,
    ),

  attackPlayer: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(
      {
        ...curr.player,
        stats: { ...curr.player.stats, hp: clamp(curr.player.stats.hp - amount, 0, start.player.stats.hp) },
      },
      curr.enemies,
      curr.target,
    ),
  reducePlayerStamina: (
    start: Snapshot,
    curr: Snapshot,
    amount: number,
  ): Snapshot =>
    snap(
      {
        ...curr.player,
        stats: {
          ...curr.player.stats,
          stamina: clamp(curr.player.stats.stamina - amount, 0, start.player.stats.stamina),
        },
      },
      curr.enemies,
      curr.target,
    ),
};

export default function play(player: Player, enemies: Enemies, select: Chance.Chance): Play {
  const startState: Snapshot = {
    player,
    enemies,
    target: 0,
  };

  const playerSkills = Object.values(player.build).flatMap((s) => s.effects);

  const handlePlayerEffectFn = (history: PlayHistory, index: number): Play => {
    const newState = Seq(enemies)
      .map((e, idx) => [idx as MonsterTarget, e.effects[e.rolls[e.stats.distance - 1][select.natural({ min: 0, max: e.rolls[e.stats.distance - 1].length - 1 })]]] as const)
      .concat([['Player', playerSkills[index]] as const])
      .sortBy(([_origin, effect]) => effect.priority)
      .reduce((state, [origin, effect]) => effect.effect(origin, startState, state), history[history.length - 1]);
    const states = [...history, newState] as PlayHistory;
    return {
      states,
      setSelected: (target: MonsterTarget) => setSelectedFn(states, target),
      handlePlayerEffect: (target: number) => handlePlayerEffectFn(states, target),
    };
  };

  const setSelectedFn = (history: PlayHistory, target: MonsterTarget): Play => {
    const newState: Snapshot = {
      ...history[history.length - 1],
      target,
    };
    const states = [...history, newState] as PlayHistory;
    return {
      states,
      setSelected: (target: MonsterTarget) => setSelectedFn(states, target),
      handlePlayerEffect: (target: number) => handlePlayerEffectFn(states, target),
    };
  }

  return {
    states: [startState],
    setSelected: (target: MonsterTarget) => setSelectedFn([startState], target),
    handlePlayerEffect: (target: number) => handlePlayerEffectFn([startState], target),
  };
}
