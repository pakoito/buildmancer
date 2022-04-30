import { Opaque } from "type-fest";
import { allRanges, enemies, makeStat } from "./data";
import { callEffectFun, Effect, effectFunCall, Enemies, EnemiesStats, Enemy, EnemyStats, FunIndex, MonsterTarget, Nel, Play, PlayerStats, Snapshot, Status, Target } from "./types";

// #region Effect funs

export function extractFunction({ effects }: Effect): ReduceFun {
  return (origin, play, startState) => effects.reduce((acc, { index, parameters }) =>
    callEffectFun(effectFunRepo, index, parameters)(origin, ...acc), [play, startState]);
}

const effectFun = <T>(...funs: Nel<ParametrizedFun<T>>): EffectFun<T> =>
  // TODO check direction of the fold
  (funs.length > 1
    ? funs.reduce((acc, value) => (params) => (origin, play, oldState) => {
      const [newPlay, newState] = acc(params)(origin, play, oldState);
      return value(params)(origin, newPlay, newState);
    }) : funs[0]) as EffectFun<T>;

export type ReduceFun = (origin: Target, play: Play, newState: Snapshot) => [Play, Snapshot];
export type ParametrizedFun<T> = (params: T) => ReduceFun;
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;

export type EffectFunRepo = EffectFunctionRepository;
export type EffectFunRepoIndex = keyof EffectFunctionT & FunIndex;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<EffectFunRepo[T]>[0];

export type EffectFunctionRepository = { [k in keyof EffectFunctionT]: (params: EffectFunctionT[k]) => ReduceFun };
export type EffectFunctionT = {
  'Monster:Summon': { enemy: number };
  'Monster:Dead': undefined;
  'Monster:Attack': { amount: number };
  'Basic:Rest': undefined;
  'Basic:Advance': { amount: number };
  'Basic:Retreat': { amount: number };
  'Basic:Attack': { amount: number };
  'Basic:Stamina': { amount: number };
  'Effect:Poison': { target: Target; lifespan: number };
  'Effect:Dodge': undefined;
  'Effect:Armor': { amount: number };
  'Wand:MagicBolt': undefined;
  'Axe:Chop': undefined;
  'Axe:Cut': undefined;
  'Axe:Bleed': undefined;
  'Hook:GetHere': undefined;
  'Monster:Swipe': undefined;
  'Monster:Roar': undefined;
  'Monster:Jump': undefined;
  'BootsOfFlight:EOT': undefined;
  'Utility:Cleanup': undefined;
  'Debug:GGWP': undefined;
  'Debug:Sudoku': undefined;
}

const engineFunctions = {
  'Debug:GGWP': effectFun(
    () => (_, play, currentState) => [play, { ...currentState, enemies: currentState.enemies.map(m => ({ ...m, hp: { ...m.hp, current: 0 } })) as EnemiesStats }]
  ),
  'Debug:Sudoku': effectFun(
    () => (_, play, currentState) => [play, { ...currentState, player: { ...currentState.player, hp: { ...currentState.player.hp, current: 0 } } }]
  ),
  'Utility:Cleanup': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, armor: { amount: 0 }, bleed: { turns: Math.max(o.bleed.turns - 1, 0) }, dodge: { active: false } }))],
    () => (_origin, play, currentState) => [play, currentState.enemies.reduce((acc, v, idx) => actions.changeStatusMonster(acc, idx as MonsterTarget, (o) => ({ ...o, armor: { amount: 0 }, bleed: { turns: Math.max(o.bleed.turns - 1, 0) }, dodge: { active: false } })), currentState)],
  ),
}

const effectFunRepo: EffectFunctionRepository = {
  ...engineFunctions,
  // #region BASIC
  'Basic:Rest': effectFun(
    () => (_origin, play, currentState) => [play, currentState]
  ),
  'Basic:Advance': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -amount)]
  ),
  'Basic:Retreat': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, amount)]
  ),
  'Basic:Attack': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, amount)]
  ),
  'Basic:Stamina': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.modifyPlayerStamina(currentState, amount)]
  ),
  // #endregion BASIC
  // #region EFFECTS
  'Effect:Dodge': effectFun(
    () => (_origin, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, dodge: { active: true } }))]
  ),
  'Effect:Armor': effectFun(
    () => (_, play, currentState) => [play, actions.changeStatusPlayer(currentState, (o) => ({ ...o, armor: { amount: 3 } }))]
  ),
  'Effect:Poison': effectFun(
    ({ target }) => (origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(currentState, 1) : actions.attackMonster(currentState, target, 1)],
    (params) => (origin, play, currentState) => [play,
      (params.target !== 'Player' && currentState.enemies[params.target]!!.hp.current > 0)
        && (params.lifespan > 0)
        ? actions.addEotEffect(currentState, origin, { display: `Poison ${play.enemies[params.target]!!.lore.name} [${params.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Effect:Poison', { ...params, lifespan: params.lifespan - 1 }])] })
        : currentState],
  ),
  // #endregion EFFECTS
  // #region MONSTERS
  'Monster:Attack': effectFun(
    ({ amount }) => (_origin, play, currentState) => [play, actions.attackPlayer(currentState, amount)]
  ),
  'Monster:Summon': effectFun(
    ({ enemy }) => (_origin, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
  'Monster:Dead': effectFun(
    () => (_origin, play, currentState) => [play, currentState]
  ),
  'Monster:Swipe': effectFun(
    () => (_, play, currentState) => [play, actions.attackPlayer(currentState, 2)]
  ),
  'Monster:Roar': effectFun(
    () => (_, play, currentState) => [play, actions.modifyPlayerStamina(currentState, -5)]
  ),
  'Monster:Jump': effectFun(
    () => (origin, play, currentState) => [play, actions.changeDistance(currentState, origin, -2)]
  ),
  // #endregion MONSTERS
  // #region ITEMS
  'Axe:Chop': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)]
  ),
  'Axe:Cut': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)],
    () => (origin, play, currentState) => [play,
      actions.addEotEffect(currentState, origin, { display: `Poison ${play.enemies[currentState.target]!!.lore.name} [${currentState.target + 1}]`, tooltip: '', range: allRanges, priority: 4, effects: [effectFunCall(['Effect:Poison', { target: currentState.target, lifespan: 2 }])] })]
  ),
  'Axe:Bleed': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 2)],
    () => (_, play, currentState) => [play, actions.changeStatusMonster(currentState, currentState.target, (o) => ({ ...o, bleed: { turns: o.bleed.turns + 5 } }))]
  ),
  'Hook:GetHere': effectFun(
    () => (_, play, currentState) => [play, actions.attackMonster(currentState, currentState.target, 3)],
    () => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -1)]
  ),
  'BootsOfFlight:EOT': effectFun(
    () => (_, play, currentState) => [play, currentState.enemies.reduce((s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, -2), currentState)]
  ),
  'Wand:MagicBolt': effectFun(
    () => (_, play, currentState) => {
      let state = currentState;
      while (state.player.stamina.current) {
        state = actions.modifyPlayerStamina(state, -2);
        state = actions.attackMonster(state, currentState.target, 1)
      }
      return [play, state];
    }
  ),
  // #endregion ITEMS
};

// #endregion
// #region Modify state

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
  const armor = monster.status.armor.amount;
  const damage = amount + curr.player.attack.current;
  const afterDefence = Math.max(damage - monster.defence.current, 0);
  const afterArmor = Math.max(afterDefence - armor, 0);
  const armorSpent = armor - (afterDefence - afterArmor);
  const afterBleed = afterArmor + (monster.status.bleed.turns > 0 ? 1 : 0);
  return ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ status, hp }) => ({
      hp: { max: hp.max, current: clamp(hp.current - afterBleed, 0, hp.max) },
      status:
        { ...status, armor: { amount: armorSpent } }
    })),
  });
}

function attackPlayer(curr: Snapshot, amount: number): Snapshot {
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

// #endregion
// #region Stat funs

export type StatsFunIndex = keyof typeof statsRepository;
export const statsRepository = {
  '+Health': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, hp: makeStat(player.hp.current + 10) }, enemies],
  '+StaPerTurn': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, staminaPerTurn: makeStat(player.staminaPerTurn.current + 1) }, enemies],
  '+Stamina': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, stamina: makeStat(player.stamina.current + 3) }, enemies],
  '+Attack': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, attack: makeStat(player.attack.current + 1) }, enemies],
  '+Speed': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, speed: makeStat(player.speed.current + 1) }, enemies],
  '+Defence': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, defence: makeStat(player.defence.current + 1) }, enemies],

  '-Health': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, hp: makeStat(player.hp.current - 10) }, enemies],
  '-StaPerTurn': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, staminaPerTurn: makeStat(player.staminaPerTurn.current - 1) }, enemies],
  '-Stamina': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, stamina: makeStat(player.stamina.current - 3) }, enemies],
  '-Attack': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, attack: makeStat(player.attack.current - 1) }, enemies],
  '-Speed': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, speed: makeStat(player.speed.current - 1) }, enemies],
  '-Defence': (player: PlayerStats, enemies: EnemiesStats): [PlayerStats, EnemiesStats] => [{ ...player, defence: makeStat(player.defence.current - 1) }, enemies],
}

// #endregion