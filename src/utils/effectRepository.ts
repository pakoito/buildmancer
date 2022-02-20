import { allRanges, enemies, startState } from "./data";
import { EffectFun, ParametrizedFun, ReduceFun } from "./effectFunctions";
import { Effect, effectFunCall, Enemies, EnemiesStats, Enemy, EnemyStats, MonsterTarget, Nel, Play, PlayerStats, Snapshot, Target } from "./types";

export type EffectFunctionRepository = { [k in keyof EffectFunctionT]: (params: EffectFunctionT[k]) => ReduceFun };
export type Op = '+' | '*';
export type StatsFun<T> = [Op, keyof T, T[keyof T]];
export type EffectFunctionT = {
  'Target:Bleed': { target: Target; lifespan: number };
  'Monster:Summon': { enemy: number };
  'Monster:Dead': undefined;
  'Basic:RecoverStamina': undefined;
  'Basic:Rest': undefined;
  'Basic:Advance': undefined;
  'Basic:Retreat': undefined;
  'Axe:Chop': undefined;
  'Axe:Cut': undefined;
  'Hook:GetHere': undefined;
  'Monster:Swipe': undefined;
  'Monster:Roar': undefined;
  'Monster:Jump': undefined;
  'BootsOfFlight:EOT': undefined;
}

const applyObject = <T extends { [k: string]: number }>(op: Op, obj: T, apply: Partial<T>): T =>
  Object.entries(apply).reduce((acc, [k, v]) => {
    if (v == null) {
      return acc;
    }
    return applyKvp(op, acc, k, v);
  }, obj);

const applyKvp = <T extends { [k: string]: number }>(op: Op, obj: T, k: keyof T, v: T[keyof T]): T => {
  const copy = { ...obj };
  op === '+'
    ? copy[k] = copy[k] + v as T[keyof T]
    : op === '*'
      ? copy[k] = copy[k] * v as T[keyof T]
      : void 0;
  return copy;
};

const effectFun = <T>(...funs: Nel<ParametrizedFun<T>>): EffectFun<T> =>
  // TODO check direction of the fold
  (funs.length > 1
    ? funs.reduce((acc, value) => (params) => (origin, play, oldState) => {
      const [newPlay, newState] = acc(params)(origin, play, oldState);
      return value(params)(origin, newPlay, newState);
    }) : funs[0]) as EffectFun<T>;

const repo: EffectFunctionRepository = {
  'Target:Bleed': effectFun(
    ({ target }) => (_origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(currentState, -1) : actions.attackMonster(currentState, target, -1)],
    (params) => (origin, play, currentState) => [play,
      (params.target !== 'Player' && currentState.enemies[params.target]!!.hp.current > 0)
        && (params.lifespan > 0)
        ? actions.addEotEffect(currentState, origin, { display: `Bleed ${play.enemies[params.target]!!.lore.name} [${params.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Target:Bleed', { ...params, lifespan: params.lifespan - 1 }])] })
        : currentState],
  ),
  'Monster:Summon': effectFun(
    ({ enemy }) => (_origin, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
  'Monster:Dead': effectFun(
    () => (_origin, play, currentState) => [play, currentState]
  ),
  'Basic:RecoverStamina': effectFun(
    () => (_origin, play, currentState) => [play, actions.modifyPlayerStamina(startState(play), currentState, currentState.player.staminaPerTurn.current)]
  ),
  'Basic:Rest': effectFun(
    () => (_origin, play, newState) => [play, newState]
  ),
  'Basic:Advance': effectFun(
    () => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, -2)]
  ),
  'Basic:Retreat': effectFun(
    () => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, 2)]
  ),
  'Axe:Chop': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, -3)]
  ),
  'Axe:Cut': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, -3)],
    () => (origin, play, currentState) => [play,
      actions.addEotEffect(currentState, origin, { display: `Bleed ${play.enemies[currentState.target]!!.lore.name} [${currentState.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Target:Bleed', { target: currentState.target, lifespan: 2 }])] })]
  ),
  'Hook:GetHere': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, -3)],
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -1)]
  ),
  'Monster:Swipe': effectFun(
    () => (_, play, currentState) => [play, actions.attackPlayer(currentState, -2)]
  ),
  'Monster:Roar': effectFun(
    () => (_, play, currentState) => [play, actions.modifyPlayerStamina(startState(play), currentState, -5)]
  ),
  'Monster:Jump': effectFun(
    () => (origin, play, currentState) => [play, actions.changeDistance(currentState, origin, -2)]
  ),
  'BootsOfFlight:EOT': effectFun(
    () => (_, play, currentState) => [play, currentState.enemies.reduce((s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, -2), currentState)]
  ),
};

const clamp = (num: number, min: number, max: number = Infinity) =>
  Math.min(Math.max(num, min), max);

const updateMonster = (enemies: EnemiesStats, target: Target, override: (stats: EnemyStats) => Partial<EnemyStats>): EnemiesStats =>
  enemies.map((m, idx) =>
    (idx === target)
      ? { ...m, ...override(m) }
      : m) as EnemiesStats;

const updatePlayerStat = <T extends keyof PlayerStats>(curr: Snapshot, key: T, modify: (player: PlayerStats[T]) => Partial<PlayerStats[T]>): Snapshot => {
  const player = curr.player;
  player[key] = {
    ...player[key],
    ...modify(player[key])
  }
  return {
    ...curr,
    player: {
      ...curr.player,
    },
  };
}

const actions = {
  attackMonster: (curr: Snapshot, target: MonsterTarget, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ hp }) => ({ hp: { max: hp.max, current: clamp(hp.current + amount, 0, hp.max) } })),
  }),
  changeDistance: (curr: Snapshot, origin: Target, amount: number): Snapshot =>
  ({
    ...curr,
    enemies: updateMonster(curr.enemies, origin, ({ distance }) => ({ distance: clamp(distance + amount, 0, 4) as MonsterTarget })),
  }),
  removeMonster: (currPlay: Play, currSnap: Snapshot, target: MonsterTarget): [Play, Snapshot] =>
    [
      { ...currPlay, enemies: currPlay.enemies.filter((_, idx) => idx === target) as Enemies },
      { ...currSnap, target: 0, enemies: currSnap.enemies.filter((_, idx) => idx === target) as EnemiesStats }
    ],
  attackPlayer: (curr: Snapshot, amount: number): Snapshot =>
    updatePlayerStat(curr, 'hp', hp => ({
      current: clamp(hp.current + amount, 0, hp.max)
    })),
  modifyPlayerStamina: (
    start: Snapshot,
    curr: Snapshot,
    amount: number,
  ): Snapshot =>
    updatePlayerStat(curr, 'stamina', stamina => ({
      current: clamp(stamina.current + amount, 0, stamina.max)
    })),
  addEotEffect: (
    curr: Snapshot,
    origin: Target,
    effect: Effect,
  ): Snapshot => ({
    ...curr,
    eot: [...(curr.eot ?? []), [origin, effect]],
  }),
  addBotEffect: (
    curr: Snapshot,
    origin: Target,
    effect: Effect,
  ): Snapshot => ({
    ...curr,
    bot: [...(curr.eot ?? []), [origin, effect]],
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

export default repo;
