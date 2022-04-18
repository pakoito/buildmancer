import { allRanges, enemies, startState } from "./data";
import { EffectFun, ParametrizedFun, ReduceFun } from "./effectFunctions";
import { playerActions } from "./playGame";
import { Effect, effectFunCall, Enemies, EnemiesStats, Enemy, EnemyStats, MonsterTarget, Nel, Play, PlayerStats, Snapshot, Status, Target } from "./types";

export type EffectFunctionRepository = { [k in keyof EffectFunctionT]: (params: EffectFunctionT[k]) => ReduceFun };
export type EffectFunctionT = {
  'Target:Poison': { target: Target; lifespan: number };
  'Monster:Summon': { enemy: number };
  'Monster:Dead': undefined;
  'Basic:Rest': undefined;
  'Basic:Advance': undefined;
  'Basic:Retreat': undefined;
  'Effect:Dodge': undefined;
  'Effect:Armor': { amount: number };
  'Axe:Chop': undefined;
  'Axe:Cut': undefined;
  'Axe:Bleed': undefined;
  'Hook:GetHere': undefined;
  'Monster:Swipe': undefined;
  'Monster:Roar': undefined;
  'Monster:Jump': undefined;
  'BootsOfFlight:EOT': undefined;
  'Utility:UseStamina': { amount: number };
  'Utility:ResetArmor': undefined;
}

export type Op = '+' | '*';
export type StatsFun<T> = [Op, keyof T, T[keyof T]];
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
  'Target:Poison': effectFun(
    ({ target }) => (origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(currentState, origin as MonsterTarget, 1) : actions.attackMonster(currentState, target, 1)],
    (params) => (origin, play, currentState) => [play,
      (params.target !== 'Player' && currentState.enemies[params.target]!!.hp.current > 0)
        && (params.lifespan > 0)
        ? actions.addEotEffect(currentState, origin, { display: `Poison ${play.enemies[params.target]!!.lore.name} [${params.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Target:Poison', { ...params, lifespan: params.lifespan - 1 }])] })
        : currentState],
  ),
  'Monster:Summon': effectFun(
    ({ enemy }) => (_origin, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
  'Monster:Dead': effectFun(
    () => (_origin, play, currentState) => [play, currentState]
  ),
  'Utility:UseStamina': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.modifyPlayerStamina(startState(play), currentState, currentState.player.staminaPerTurn.current - amount)]
  ),
  'Utility:ResetArmor': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, armor: { amount: 0 } }))],
    () => (_origin, play, currentState) => [play, currentState.enemies.reduce((acc, v, idx) => actions.changeStatusMonster(acc, idx as MonsterTarget, (o) => ({ ...o, armor: { amount: 0 } })), currentState)],
  ),
  'Basic:Rest': effectFun(
    () => (_origin, play, currentState) => [play, currentState]
  ),
  'Basic:Advance': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -2)]
  ),
  'Basic:Retreat': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, 2)]
  ),
  'Effect:Dodge': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, dodge: { active: true } }))]
  ),
  'Axe:Chop': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)]
  ),
  'Axe:Cut': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)],
    () => (origin, play, currentState) => [play,
      actions.addEotEffect(currentState, origin, { display: `Poison ${play.enemies[currentState.target]!!.lore.name} [${currentState.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Target:Poison', { target: currentState.target, lifespan: 2 }])] })]
  ),
  'Axe:Bleed': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 2)],
    () => (_, play, currentState) => [play, actions.changeStatusMonster(currentState, currentState.target, (o) => ({ ...o, bleed: { turns: o.bleed.turns + 5 } }))]
  ),
  'Effect:Armor': effectFun(
    () => (_, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, armor: { amount: 3 } }))]
  ),
  'Hook:GetHere': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)],
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -1)]
  ),
  'Monster:Swipe': effectFun(
    () => (origin, play, currentState) => [play, actions.attackPlayer(currentState, origin as MonsterTarget, 2)]
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

const updatePlayer = (curr: Snapshot, override: (player: PlayerStats) => Partial<PlayerStats>): Snapshot => {
  return {
    ...curr,
    player: { ...curr.player, ...override(curr.player) }
  };
}

const updatePlayerStat = <T extends keyof PlayerStats>(curr: Snapshot, key: T, modify: (player: PlayerStats[T]) => Partial<PlayerStats[T]>): Snapshot => {
  const player = curr.player;
  player[key] = {
    ...player[key],
    ...modify(player[key])
  }
  return {
    ...curr,
    player
  };
}

const actions = {
  attackPlayer,
  attackMonster,
  changeStatusPlayer: (curr: Snapshot, updateStatus: (oldStatus: Status) => Status): Snapshot => ({
    ...curr,
    player: { ...curr.player, status: updateStatus(curr.player.status) }
  }),
  changeStatusMonster: (curr: Snapshot, target: MonsterTarget, updateStatus: (oldStatus: Status) => Status): Snapshot => ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ status }) => ({ status: updateStatus(status) })),
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

function attackMonster(curr: Snapshot, target: MonsterTarget, amount: number): Snapshot {
  const monster = curr.enemies[target]!!;
  const hasDodge = monster.status.dodge.active;
  if (hasDodge) {
    return ({
      ...curr,
      enemies: updateMonster(curr.enemies, target, ({ status }) => ({
        status: { ...status, dodge: { active: false } }
      })),
    });
  }

  const armor = monster.status.armor.amount;
  const damage = amount + curr.player.attack.current;
  const afterDefence = Math.max(damage - monster.defence.current, 0);
  const afterArmor = Math.max(afterDefence - armor, 0);
  const armorSpent = armor - (afterDefence - afterArmor);
  const afterBleed = afterArmor + (curr.player.status.bleed.turns > 0 ? 1 : 0);
  return ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ status, hp }) => ({
      hp: { max: hp.max, current: clamp(hp.current - afterBleed, 0, hp.max) },
      status:
        { ...status, armor: { amount: armorSpent } }
    })),
  });
}

function attackPlayer(curr: Snapshot, monster: MonsterTarget, amount: number): Snapshot {
  const hasDodge = curr.player.status.dodge.active;
  if (hasDodge) {
    return updatePlayerStat(curr, 'status', () => ({ dodge: { active: false } }));
  }

  const armor = curr.player.status.armor.amount;
  const damage = amount + curr.player.attack.current;
  const afterDefence = Math.max(damage - curr.player.defence.current, 0);
  const afterArmor = Math.max(afterDefence - armor, 0);
  const armorSpent = armor - (afterDefence - afterArmor);
  const afterBleed = afterArmor + (curr.player.status.bleed.turns > 0 ? 1 : 0);
  return updatePlayer(curr, ({ hp, status }) => ({
    hp: { max: hp.max, current: clamp(hp.current - afterBleed, 0, hp.max) },
    status: { ...status, armor: { amount: status.armor.amount - armorSpent } }
  }));
}

export default repo;
