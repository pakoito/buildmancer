/* eslint-disable no-empty-pattern */
import { allRanges, enemies, startState } from "./data";
import { EffectFun, ParametrizedFun } from "./effectFunctions";
import { Effect, Enemies, EnemiesStats, Enemy, EnemyStats, MonsterTarget, Nel, Play, Snapshot, Target } from "./types";

const effectFun = <T>(...funs: Nel<ParametrizedFun<T>>): EffectFun<T> =>
  // TODO check direction of the fold
  (funs.length > 1
    ? funs.reduce((acc, value) => (params) => (origin, play, oldState) => {
      const [newPlay, newState] = acc(params)(origin, play, oldState);
      return value(params)(origin, newPlay, newState);
    }) : funs[0]) as EffectFun<T>;

const EffectFunctionRepository = {
  'Player:SapStamina': effectFun<{ amount: number }>(
    ({ amount }) => (_origin, play, currentState) => [play, actions.modifyPlayerStamina(play.states[0], currentState, amount)],
  ),
  'Target:Bleed': effectFun<{ target: Target; lifespan: number }>(
    ({ target }) => (_origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(startState(play), currentState, 1) : actions.attackMonster(startState(play), currentState, target, 3)],
    (params) => (_origin, play, currentState) => [play, params.lifespan > 0 ? actions.addEotEffect(currentState, { display: "Bleed", range: allRanges, priority: 4, effect: 'Target:Bleed', parameters: { ...params, lifespan: params.lifespan - 1 } }) : currentState],
  ),
  'Monster:Summon': effectFun<{ enemy: number }>(
    ({ enemy }) => (_origin, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
  'Monster:Dead': effectFun<undefined>(
    () => (_origin, play, newState) => [play, newState]
  ),
  'Basic:Rest': effectFun<undefined>(
    () => (_origin, play, newState) => [play, newState]
  ),
  'Basic:Advance': effectFun<undefined>(
    () => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, -2)]
  ),
  'Basic:Retreat': effectFun<undefined>(
    () => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, 2)]
  ),
  'Axe:Chop': effectFun<undefined>(
    () => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)]
  ),
  'Axe:Cut': effectFun<undefined>(
    () => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)],
    () => (origin, play, currentState) => [play, actions.addEotEffect(currentState, { display: "Bleed", range: allRanges, priority: 4, effect: 'Target:Bleed', parameters: {} })]
  ),
  'Hook:GetHere': effectFun<undefined>(
    () => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)],
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -1)]
  ),
  'Monster:Swipe': effectFun<undefined>(
    () => (_, play, currentState) => [play, actions.attackPlayer(startState(play), currentState, 2)]
  ),
  'Monster:Roar': effectFun<undefined>(
    () => (_, play, currentState) => [play, actions.modifyPlayerStamina(startState(play), currentState, -5)]
  ),
  'Monster:Jump': effectFun<undefined>(
    () => (origin, play, currentState) => [play, actions.changeDistance(currentState, origin, -2)]
  ),
  'BootsOfFlight:EOT': effectFun<undefined>(
    () => (_, play, currentState) => [play, currentState.enemies.reduce((s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, -2), currentState)]
  ),
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const updateMonster = (enemies: EnemiesStats, target: Target, override: (stats: EnemyStats) => object): EnemiesStats =>
  enemies.map((m, idx) =>
    (idx === target)
      ? { ...m, ...override(m) }
      : m) as EnemiesStats;

const actions = {
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
    effect: Effect,
  ): Snapshot => ({
    ...curr,
    eot: [...(curr.eot ?? []), effect],
  }),
  addBotEffect: (
    curr: Snapshot,
    effect: Effect,
  ): Snapshot => ({
    ...curr,
    bot: [...(curr.eot ?? []), effect],
  }),

  addEnemy: (
    play: Play,
    curr: Snapshot,
    enemy: Enemy,
    enemyStats: EnemyStats,
  ): [Play, Snapshot] => {
    return play.enemies.length < 5
      ? [{
        ...play,
        enemies: [...play.enemies, enemy] as Enemies,
      }, {
        ...curr,
        enemies: [...curr.enemies, enemyStats] as EnemiesStats,
      }]
      : [play, curr];
  }
};

export default EffectFunctionRepository;
