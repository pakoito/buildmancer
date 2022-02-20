import { Opaque } from "type-fest";
import { EffectFunParams, EffectFunRepo, EffectFunRepoIndex } from "./effectFunctions";

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Nel<T> = [T, ...T[]];

type Length<T extends any[]> =
  T extends { length: infer L } ? L : never;
type BuildTuple<L extends number, T extends any[] = []> =
  T extends { length: L } ? T : BuildTuple<L, [...T, any]>;
export type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...(infer U), ...BuildTuple<B>]
  ? Length<U>
  : never;
type EQ<A, B> =
  A extends B
  ? (B extends A ? true : false)
  : false;
type AtTerminus<A extends number, B extends number> =
  A extends 0
  ? true
  : (B extends 0 ? true : false);
type LT<A extends number, B extends number> =
  AtTerminus<A, B> extends true
  ? EQ<A, B> extends true
  ? false
  : (A extends 0 ? true : false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  : LT<Subtract<A, 1>, Subtract<B, 1>>;

export type TupleUpTo<T, N extends number> =
  EQ<N, 1> extends true ? [T] : TupleUpTo<T, Subtract<N, 1>> | Tuple<T, N>;

export type UpTo<N extends number> =
  EQ<N, 0> extends true ? 0 : UpTo<Subtract<N, 1>> | N;

export interface Stat {
  max: number,
  current: UpTo<Stat['max']>,
}
export interface PlayerStats { hp: Stat, stamina: Stat, staminaPerTurn: Stat, speed: Stat, attack: Stat };
export interface EnemyStats { hp: Stat, speed: Stat, attack: Stat, distance: UpTo<Subtract<Distances, 1>> };

export type Priorities = 5;
export type Distances = 5;
export type MonsterCount = 5;
export type Staminas = 5;

export interface EffectSummary {
  origin: Target;
  display: string;
  phase: string;
}

export type DisabledSkills = string[];
export interface Snapshot {
  player: PlayerStats;
  enemies: EnemiesStats;
  target: MonsterTarget;
  lastAttacks: EffectSummary[];
  bot?: Nel<[Target, Effect]>;
  eot?: Nel<[Target, Effect]>;
  disabledSkills: DisabledSkills;
};

export type RNG = Opaque<number[][], 'RNG'>;

export interface Play {
  states: Nel<Snapshot>;
  player: Player;
  enemies: Enemies,
  rng: RNG;
  turns: number;
  id: string;
  seed: string | number;
};

type ItemOrMonster = string /* TODO all items */ | 'Monster';
export type FunIndex = `${ItemOrMonster}:${string}`;

export type StatsFunIndex = FunIndex;
export type StatsFunRepo = { [key: StatsFunIndex]: StatsFun; }
export type StatsFun = (player: PlayerStats, enemies: EnemiesStats) => [PlayerStats, EnemiesStats];

export type Ranges = UpTo<Subtract<Distances, 1>>[];

interface EffectFunCallT {
  index: EffectFunRepoIndex;
  parameters: EffectFunParams<EffectFunRepoIndex>;
};
export type EffectFunCall = Opaque<EffectFunCallT, EffectFunCallT>;
export const effectFunCall = <T extends EffectFunRepoIndex>(t: EffectFunParams<T> extends undefined ? T : [T, EffectFunParams<T>]): EffectFunCall =>
  ({ index: t[0], parameters: t[1] }) as EffectFunCall;
export const callEffectFun = <T extends EffectFunRepoIndex>(repo: EffectFunRepo, t: T, p: EffectFunParams<T>) => {
  const f = repo[t];
  // @ts-expect-error: index and parameters are enforced to be compatible at construction and the runtime check above ^^^^
  return f(p);
}

interface EffectT {
  display: string;
  tooltip: string;
  effects: Nel<EffectFunCall>;
  priority: UpTo<Subtract<Priorities, 1>>;
  range: Ranges;
};
export type Effect = EffectT;
export type InventoryEffect = EffectT & {
  stamina: UpTo<Subtract<Staminas, 1>>;
};

export type MonsterTarget = UpTo<Subtract<MonsterCount, 1>>;
export type PlayerTarget = 'Player';
export type Target = MonsterTarget | PlayerTarget;

export type Build = Record<
  string,
  Item
>;

export interface Item {
  display: string;
  passive?: StatsFunIndex;
  bot?: Nel<Effect>;
  eot?: Nel<Effect>;
  effects?: Nel<InventoryEffect>;
  [key: string]: any;
};

export interface Player {
  id: string;
  lore: Record<string, string | number>;
  build: Build;
};

// Place in the array for now
type EffectIdentity = number;
export interface Enemy {
  lore: Record<string, string | number>;
  effects: Nel<Effect>;
  rolls: Tuple<EffectIdentity[], Distances>;
  bot?: Nel<Effect>;
  eot?: Nel<Effect>;
}

export type Enemies = TupleUpTo<Enemy, MonsterCount>;
export type EnemiesStats = TupleUpTo<EnemyStats, MonsterCount>;
