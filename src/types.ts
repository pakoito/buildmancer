export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

type Length<T extends any[]> =
  T extends { length: infer L } ? L : never;
type BuildTuple<L extends number, T extends any[] = []> =
  T extends { length: L } ? T : BuildTuple<L, [...T, any]>;
type Subtract<A extends number, B extends number> =
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
  : LT<Subtract<A, 1>, Subtract<B, 1>>;

export type TupleUpTo<T, N extends number> =
  EQ<N, 1> extends true ? [T] : TupleUpTo<T, Subtract<N, 1>> | Tuple<T, N>;

type UpTo<N extends number> =
  EQ<N, 0> extends true ? 0 : UpTo<Subtract<N, 1>> | N

export type PlayerStats = Record<string, number>;
export type EnemyStats = Record<string, number>;

type Priorities = 5;
type Distances = 5;
type MonsterCount = 5;

export type Snapshot = { player: Player; enemies: Enemies, target: MonsterTarget };
export type EffectFun = (origin: Target, start: Snapshot, curr: Snapshot) => Snapshot;

export type Effect = {
  display: string;
  effect: EffectFun;
  priority: UpTo<Subtract<Priorities, 1>>;
};

export type MonsterTarget = UpTo<Subtract<MonsterCount, 1>>;
export type Target = MonsterTarget | 'Player';

export type Build = Record<
  string,
  {
    display: string;
    effects: Effect[];
    [key: string]: any;
  }
>;

export type Player = {
  id: string;
  lore: Record<string, string | number>;
  stats: PlayerStats;
  build: Build;
};

export type Enemy = {
  id: string;
  lore: Record<string, string | number>;
  stats: EnemyStats;
  effects: Effect[];
  rolls: Tuple<number[], Distances>;
}

export type Enemies = TupleUpTo<Enemy, MonsterCount>;