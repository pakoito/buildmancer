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

export type TupleUpTo<T, N extends number> =
  EQ<N, 1> extends true ? [T] : Tuple<T, N> | TupleUpTo<T, Subtract<N, 1>>;

export type PlayerStats = Record<string, number>;
export type EnemyStats = Record<string, number>;

export type Snapshot = { player: PlayerStats; monster: EnemyStats };
export type EffectFun = (start: Snapshot, curr: Snapshot) => Snapshot;

export type Effect = {
  display: string;
  effect: EffectFun;
};

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
  lore: Record<string, string | number>
  stats: EnemyStats;
  // build: Build;
}

export type Enemies = TupleUpTo<Enemy, 5>;