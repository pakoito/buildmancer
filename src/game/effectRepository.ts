import { Opaque } from 'type-fest';
import { enemies } from './data';
import { allRanges, makeStat } from './makeGame';
import { updateGlobals } from './modding';
import {
  callEffectFun,
  Effect,
  effectFunCall,
  EffectTarget,
  Enemies,
  EnemiesStats,
  Enemy,
  EnemyStats,
  FunIndex,
  MonsterTarget,
  Play,
  PlayerStats,
  Snapshot,
  StatEffectTarget,
  Status,
  Target,
} from './types';
import { clamp, pipe } from './zFunDump';

// #region Effect funs

export function extractFunction({ effects }: Effect): ReduceFun {
  return (origin, play, startState) =>
    effects.reduce(
      (acc, { index, parameters }) =>
        callEffectFun(effectFunRepo, index, parameters)(origin, ...acc),
      [play, startState]
    );
}

const effectFun = <T>(fun: ParametrizedFun<T>): EffectFun<T> =>
  ((params) => (origin, play, oldState) =>
    fun(params)(origin, play, oldState)) as EffectFun<T>;

const applyPoison = (
  play: Play,
  currentState: Snapshot,
  { target, turns }: ReduceFunctionT['Reduce:PoisonBOT']
) =>
  pipe(
    target === 'Player'
      ? actions.changeStatPlayer(currentState, ({ hp }) => ({
          hp: { ...hp, current: Math.max(0, hp.current - 1) },
        }))
      : actions.changeStatMonster(
          currentState,
          currentState.target,
          ({ hp }) => ({ hp: { ...hp, current: Math.max(0, hp.current - 1) } })
        ),
    (newState) =>
      turns > 0
        ? actions.addBotEffect(newState, 'Player', {
            display: `Poison ${
              target === 'Player'
                ? 'Player'
                : play.enemies[target]!!.lore.name + '[' + (target + 1)
            } + "]"`,
            tooltip: '',
            range: allRanges,
            priority: 4,
            dodgeable: false,
            effects: [
              effectFunCall([
                'Reduce:PoisonBOT',
                { target: target, turns: turns - 1 },
              ]),
            ],
          })
        : newState
  );

type SystemFunctionT = {
  'Utility:Cleanup': undefined;
  'Debug:GGWP': undefined;
  'Debug:Sudoku': undefined;
};
type BasicFunctionT = {
  'Basic:Rest': undefined;
  'Basic:Move': { amount: number };
  'Basic:Attack': { amount: number };
  'Basic:Stamina': { amount: number };
  'Basic:HP': { amount: number };
};

type StatusFunctionT = {
  'Effect:Poison': { target: EffectTarget; turns: number };
  'Effect:Dodge': undefined;
  'Effect:Armor': { amount: number };
  'Effect:Stun': undefined;
  'Effect:Bleed': { target: EffectTarget; turns: number };
  'Effect:Stat': StatEffectTarget;
};

type MonsterFunctionT = {
  'Monster:Summon': { enemy: number };
  'Monster:Dead': undefined;
  'Monster:Attack': { amount: number };
  'Monster:Move': { amount: number };
};
type ItemFunctionT = {
  'Wand:MagicBolt': undefined;
  'BootsOfFlight:EOT': undefined;
};
type ReduceFunctionT = {
  'Reduce:PoisonBOT': { target: Target; turns: number };
};

const engineFunctions = {
  'Debug:GGWP': effectFun(() => (_, play, currentState) => [
    play,
    {
      ...currentState,
      enemies: currentState.enemies.map((m) => ({
        ...m,
        hp: { ...m.hp, current: 0 },
      })) as EnemiesStats,
    },
  ]),
  'Debug:Sudoku': effectFun(() => (_, play, currentState) => [
    play,
    {
      ...currentState,
      player: {
        ...currentState.player,
        hp: { ...currentState.player.hp, current: 0 },
      },
    },
  ]),
  'Utility:Cleanup': effectFun(() => (_origin, play, currentState) => [
    play,
    pipe(
      actions.changeStatusPlayer(currentState, (o) => ({
        ...o,
        armor: { amount: 0 },
        bleed: { turns: Math.max(o.bleed.turns - 1, 0) },
        dodge: { active: false },
        stun: { active: false },
      })),
      (newState) =>
        newState.enemies.reduce(
          (acc, v, idx) =>
            actions.changeStatusMonster(acc, idx as MonsterTarget, (o) => ({
              ...o,
              armor: { amount: 0 },
              bleed: { turns: Math.max(o.bleed.turns - 1, 0) },
              dodge: { active: false },
              stun: { active: false },
            })),
          currentState
        )
    ),
  ]),
};

const effectFunRepo: EffectFunctionRepository = {
  ...engineFunctions,
  // #region BASIC
  'Basic:Rest': effectFun(() => (_origin, play, currentState) => [
    play,
    currentState,
  ]),
  'Basic:Move': effectFun(({ amount }) => (_origin, play, currentState) => [
    play,
    actions.changeDistance(currentState, currentState.target, amount),
  ]),
  'Basic:Attack': effectFun(({ amount }) => (_origin, play, currentState) => [
    play,
    actions.attackMonster(currentState, currentState.target, amount),
  ]),
  'Basic:Stamina': effectFun(({ amount }) => (_origin, play, currentState) => [
    play,
    actions.modifyPlayerStamina(currentState, amount),
  ]),
  'Basic:HP': effectFun(({ amount }) => (_origin, play, currentState) => [
    play,
    actions.changeStatPlayer(currentState, ({ hp }) => ({
      hp: { ...hp, current: clamp(hp.current + amount, 0, hp.max) },
    })),
  ]),
  // #endregion BASIC
  // #region EFFECTS
  'Effect:Dodge': effectFun(() => (origin, play, currentState) => [
    play,
    origin === 'Player'
      ? actions.changeStatusPlayer(currentState, (o) => ({
          ...o,
          dodge: { active: true },
        }))
      : actions.changeStatusMonster(currentState, currentState.target, (o) => ({
          ...o,
          dodge: { active: true },
        })),
  ]),
  'Effect:Armor': effectFun(({ amount }) => (origin, play, currentState) => [
    play,
    origin === 'Player'
      ? actions.changeStatusPlayer(currentState, (o) => ({
          ...o,
          armor: { amount: o.armor.amount + amount },
        }))
      : actions.changeStatusMonster(currentState, currentState.target, (o) => ({
          ...o,
          armor: { amount: o.armor.amount + amount },
        })),
  ]),
  'Effect:Stun': effectFun(() => (origin, play, currentState) => [
    play,
    origin === 'Player'
      ? actions.changeStatusMonster(currentState, currentState.target, (o) => ({
          ...o,
          stun: { active: true },
        }))
      : actions.changeStatusPlayer(currentState, (o) => ({
          ...o,
          stun: { active: true },
        })),
  ]),
  'Effect:Bleed': effectFun(({ target, turns }) => (_, play, currentState) => [
    play,
    target === 'Player'
      ? actions.changeStatusPlayer(currentState, (o) => ({
          ...o,
          bleed: { turns: o.bleed.turns + turns },
        }))
      : actions.changeStatusMonster(currentState, currentState.target, (o) => ({
          ...o,
          bleed: { turns: o.bleed.turns + turns },
        })),
  ]),
  'Effect:Poison': effectFun(({ target, turns }) => (_, play, currentState) => [
    play,
    pipe(
      target === 'Player' ? ('Player' as Target) : currentState.target,
      (gameTarget) =>
        applyPoison(play, currentState, { target: gameTarget, turns })
    ),
  ]),
  'Reduce:PoisonBOT': effectFun((params) => (_, play, currentState) => [
    play,
    applyPoison(play, currentState, params),
  ]),
  'Effect:Stat': effectFun((stats) => (origin, play, currentState) => [
    play,
    stats.target === 'Player'
      ? actions.changeStatPlayer(currentState, (s) => ({
          hp: {
            ...s.hp,
            current: clamp(s.hp.current + (stats.hp ?? 0), 0, s.hp.max),
          },
          stamina: {
            ...s.stamina,
            current: clamp(
              s.stamina.current + (stats.stamina ?? 0),
              0,
              s.stamina.max
            ),
          },
          speed: {
            ...s.speed,
            current: Math.min(
              s.speed.max,
              s.speed.current + (stats.speed ?? 0)
            ),
          },
          defence: {
            ...s.defence,
            current: Math.min(
              s.defence.max,
              s.defence.current + (stats.defence ?? 0)
            ),
          },
          attack: {
            ...s.attack,
            current: Math.min(
              s.attack.max,
              s.attack.current + (stats.attack ?? 0)
            ),
          },
          staminaPerTurn: {
            ...s.staminaPerTurn,
            current: Math.min(
              s.staminaPerTurn.max,
              s.staminaPerTurn.current + (stats.staminaPerTurn ?? 0)
            ),
          },
        }))
      : actions.changeStatMonster(
          currentState,
          origin === 'Player' ? currentState.target : origin,
          (s) => ({
            hp: {
              ...s.hp,
              current: clamp(s.hp.current + (stats.hp ?? 0), 0, s.hp.max),
            },
            speed: {
              ...s.speed,
              current: Math.min(
                s.speed.current + (stats.speed ?? 0),
                s.speed.max
              ),
            },
            defence: {
              ...s.defence,
              current: Math.min(
                s.defence.current + (stats.defence ?? 0),
                s.defence.max
              ),
            },
            attack: {
              ...s.attack,
              current: Math.min(
                s.attack.current + (stats.attack ?? 0),
                s.attack.max
              ),
            },
          })
        ),
  ]),
  // #endregion EFFECTS
  // #region MONSTERS
  'Monster:Attack': effectFun(({ amount }) => (_origin, play, currentState) => [
    play,
    actions.attackPlayer(currentState, amount),
  ]),
  'Monster:Summon': effectFun(
    ({ enemy }) =>
      (_origin, play, currentState) =>
        actions.addEnemy(
          play,
          currentState,
          enemies[enemy][0],
          enemies[enemy][1]
        )
  ),
  'Monster:Dead': effectFun(() => (_origin, play, currentState) => [
    play,
    currentState,
  ]),
  'Monster:Move': effectFun(() => (origin, play, currentState) => [
    play,
    actions.changeDistance(currentState, origin, -2),
  ]),
  // #endregion MONSTERS
  // #region ITEMS
  'BootsOfFlight:EOT': effectFun(() => (_, play, currentState) => [
    play,
    currentState.enemies.reduce(
      (s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, 2),
      currentState
    ),
  ]),
  'Wand:MagicBolt': effectFun(() => (_, play, currentState) => {
    let state = currentState;
    while (state.player.stamina.current) {
      state = actions.modifyPlayerStamina(state, -2);
      state = actions.attackMonster(state, currentState.target, 1);
    }
    return [play, state];
  }),
  // #endregion ITEMS
};

export type EffectFunctionT = SystemFunctionT &
  BasicFunctionT &
  StatusFunctionT &
  ReduceFunctionT &
  MonsterFunctionT &
  ItemFunctionT;

export type ReduceFun = (
  origin: Target,
  play: Play,
  newState: Snapshot
) => [Play, Snapshot];
export type ParametrizedFun<T> = (params: T) => ReduceFun;
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;

export type EffectFunctionRepository = {
  [k in keyof EffectFunctionT]: (params: EffectFunctionT[k]) => ReduceFun;
};
export type EffectFunRepoIndex = keyof EffectFunctionT & FunIndex;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<
  EffectFunctionRepository[T]
>[0];

// #endregion
// #region Modify state

const updateMonster = (
  enemies: EnemiesStats,
  target: Target,
  override: (stats: EnemyStats) => Partial<EnemyStats>
): EnemiesStats =>
  enemies.map((m, idx) =>
    idx === target ? { ...m, ...override(m) } : m
  ) as EnemiesStats;

const updatePlayer = (
  curr: Snapshot,
  override: (player: PlayerStats) => Partial<PlayerStats>
): Snapshot => {
  return {
    ...curr,
    player: { ...curr.player, ...override(curr.player) },
  };
};

const updatePlayerStat = <T extends keyof PlayerStats>(
  curr: Snapshot,
  key: T,
  modify: (player: PlayerStats[T]) => Partial<PlayerStats[T]>
): Snapshot => {
  const player = curr.player;
  player[key] = {
    ...player[key],
    ...modify(player[key]),
  };
  return {
    ...curr,
    player,
  };
};

const actions = {
  attackPlayer,
  attackMonster,
  changeStatPlayer: updatePlayer,
  changeStatMonster: (
    curr: Snapshot,
    target: MonsterTarget,
    f: (stats: EnemyStats) => Partial<EnemyStats>
  ): Snapshot => ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, f),
  }),
  changeStatusPlayer: (
    curr: Snapshot,
    updateStatus: (oldStatus: Status) => Status
  ): Snapshot => ({
    ...curr,
    player: { ...curr.player, status: updateStatus(curr.player.status) },
  }),
  changeStatusMonster: (
    curr: Snapshot,
    target: MonsterTarget,
    updateStatus: (oldStatus: Status) => Status
  ): Snapshot => ({
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ status }) => ({
      status: updateStatus(status),
    })),
  }),
  changeDistance: (
    curr: Snapshot,
    origin: Target,
    amount: number
  ): Snapshot => ({
    ...curr,
    enemies: updateMonster(curr.enemies, origin, ({ distance }) => ({
      distance: clamp(distance + amount, 0, 4) as MonsterTarget,
    })),
  }),
  removeMonster: (
    currPlay: Play,
    currSnap: Snapshot,
    target: MonsterTarget
  ): [Play, Snapshot] => [
    {
      ...currPlay,
      enemies: currPlay.enemies.filter((_, idx) => idx === target) as Enemies,
    },
    {
      ...currSnap,
      target: 0,
      enemies: currSnap.enemies.filter(
        (_, idx) => idx === target
      ) as EnemiesStats,
    },
  ],
  modifyPlayerStamina: (curr: Snapshot, amount: number): Snapshot =>
    updatePlayerStat(curr, 'stamina', (stamina) => ({
      current: clamp(stamina.current + amount, 0, stamina.max),
    })),
  addEotEffect: (curr: Snapshot, origin: Target, effect: Effect): Snapshot => ({
    ...curr,
    eot: [...(curr.eot ?? []), [origin, effect]],
  }),
  addBotEffect: (curr: Snapshot, origin: Target, effect: Effect): Snapshot => ({
    ...curr,
    bot: [...(curr.eot ?? []), [origin, effect]],
  }),
  addEnemy: (
    play: Play,
    curr: Snapshot,
    enemy: Enemy,
    enemyStats: EnemyStats
  ): [Play, Snapshot] => {
    return play.enemies.length < 5
      ? [
          {
            ...play,
            enemies: [...play.enemies, enemy] as Enemies,
          },
          {
            ...curr,
            enemies: [...curr.enemies, enemyStats] as EnemiesStats,
          },
        ]
      : [play, curr];
  },
};

function attackMonster(
  curr: Snapshot,
  target: MonsterTarget,
  amount: number
): Snapshot {
  const monster = curr.enemies[target]!!;
  const armor = monster.status.armor.amount;
  const damage = amount + curr.player.attack.current;
  const afterDefence = Math.max(damage - monster.defence.current, 0);
  const afterArmor = Math.max(afterDefence - armor, 0);
  const armorSpent = armor - (afterDefence - afterArmor);
  const afterBleed = afterArmor + (monster.status.bleed.turns > 0 ? 1 : 0);
  return {
    ...curr,
    enemies: updateMonster(curr.enemies, target, ({ status, hp }) => ({
      hp: { max: hp.max, current: clamp(hp.current - afterBleed, 0, hp.max) },
      status: { ...status, armor: { amount: armorSpent } },
    })),
  };
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
    status: { ...status, armor: { amount: status.armor.amount - armorSpent } },
  }));
}

// #endregion
// #region Stat funs

export type StatsFunIndex = keyof typeof statsRepository;
export const statsRepository = {
  '+Health': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, hp: makeStat(player.hp.current + 3) },
    enemies,
  ],
  '+StaPerTurn': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, staminaPerTurn: makeStat(player.staminaPerTurn.current + 1) },
    enemies,
  ],
  '+Stamina': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, stamina: makeStat(player.stamina.current + 2) },
    enemies,
  ],
  '+Attack': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, attack: makeStat(player.attack.current + 1) },
    enemies,
  ],
  '+Speed': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, speed: makeStat(player.speed.current + 1) },
    enemies,
  ],
  '+Defence': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, defence: makeStat(player.defence.current + 1) },
    enemies,
  ],

  '-Health': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, hp: makeStat(player.hp.current - 3) },
    enemies,
  ],
  '-StaPerTurn': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, staminaPerTurn: makeStat(player.staminaPerTurn.current - 1) },
    enemies,
  ],
  '-Stamina': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, stamina: makeStat(player.stamina.current - 2) },
    enemies,
  ],
  '-Attack': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, attack: makeStat(player.attack.current - 1) },
    enemies,
  ],
  '-Speed': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, speed: makeStat(player.speed.current - 1) },
    enemies,
  ],
  '-Defence': (
    player: PlayerStats,
    enemies: EnemiesStats
  ): [PlayerStats, EnemiesStats] => [
    { ...player, defence: makeStat(player.defence.current - 1) },
    enemies,
  ],
};

// #endregion

updateGlobals({ effects: effectFunRepo });
