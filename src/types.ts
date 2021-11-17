import { Play } from "./playGame";

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
  EQ<N, 0> extends true ? 0 : UpTo<Subtract<N, 1>> | N

export type PlayerStats = Record<string, number>;
export type EnemyStats = Record<string, number> & { distance: UpTo<Subtract<Distances, 1>> };

export type Priorities = 5;
export type Distances = 5;
export type MonsterCount = 5;
export type Staminas = 5;

export type Snapshot = {
  player: PlayerStats;
  enemies: EnemiesStats;
  target: MonsterTarget;
  lastAttacks: (readonly [Target, string])[];
};
export type EffectFun = (origin: Target, play: Play, newState: Snapshot) => Snapshot;

type ItemOrMonster = string /* TODO all items */ | 'Monster';
export type EffectFunIndex = `${ItemOrMonster}:${string}`;
export type EffectFunRepo = { [key: EffectFunIndex]: EffectFun; }

export type Ranges = UpTo<Subtract<Distances, 1>>[];

export type Effect = {
  display: string;
  effect: EffectFunIndex;
  priority: UpTo<Subtract<Priorities, 1>>;
  range: Ranges;
};

export type InventoryEffect = Effect & {
  stamina: UpTo<Subtract<Staminas, 1>>;
};

export type MonsterTarget = UpTo<Subtract<MonsterCount, 1>>;
export type Target = MonsterTarget | 'Player';

export type Build = Record<
  string,
  Item
>;

export type Item = {
  display: string;
  bot?: Nel<EffectFunIndex>;
  eot?: Nel<EffectFunIndex>;
  effects: InventoryEffect[];
  [key: string]: any;
};

export type Player = {
  id: string;
  lore: Record<string, string | number>;
  build: Build;
};

export type Enemy = {
  lore: Record<string, string | number>;
  effects: Effect[];
  rolls: Tuple<number[], Distances>;
}

export type Enemies = TupleUpTo<Enemy, MonsterCount>;
export type EnemiesStats = TupleUpTo<EnemyStats, MonsterCount>;