import { Opaque } from "type-fest";
import { EffectFunParams, EffectFunRepoIndex } from "./effectFunctions";

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
  bot?: Nel<[Target, Effect]>;
  eot?: Nel<[Target, Effect]>;
};

export type RNG = Opaque<number[][], 'RNG'>;

export type Play = {
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

type EffectT = {
  display: string;
  effect: string;
  parameters: any;
  priority: UpTo<Subtract<Priorities, 1>>;
  range: Ranges;
};
export type Effect = Opaque<EffectT, EffectT>;
export const effect =
  <T extends EffectFunRepoIndex>(o: (EffectFunParams<T> extends undefined ? {
    display: string;
    effect: T;
    priority: UpTo<Subtract<Priorities, 1>>;
    range: Ranges;
    parameters?: undefined;
  } : {
    display: string;
    effect: T;
    priority: UpTo<Subtract<Priorities, 1>>;
    range: Ranges;
    parameters: EffectFunParams<T>
  })): Effect => ({
    display: o.display,
    effect: o.effect,
    parameters: o.parameters,
    priority: o.priority,
    range: o.range,
  } as Effect);

export type InventoryEffect = Opaque<Effect & {
  stamina: UpTo<Subtract<Staminas, 1>>;
}>;
export const inventoryEffect =
  <T extends EffectFunRepoIndex>(o: (EffectFunParams<T> extends undefined ? {
    display: string;
    effect: T;
    priority: UpTo<Subtract<Priorities, 1>>;
    range: Ranges;
    stamina: number;
    parameters?: undefined;
  } : {
    display: string;
    effect: T;
    priority: UpTo<Subtract<Priorities, 1>>;
    range: Ranges;
    stamina: number;
    parameters: EffectFunParams<T>
  })): InventoryEffect => ({
    display: o.display,
    effect: o.effect,
    parameters: o.parameters,
    priority: o.priority,
    range: o.range,
    stamina: o.stamina,
  } as InventoryEffect);

export type MonsterTarget = UpTo<Subtract<MonsterCount, 1>>;
export type PlayerTarget = 'Player';
export type Target = MonsterTarget | PlayerTarget;

export type Build = Record<
  string,
  Item
>;

export type Item = {
  display: string;
  passive?: StatsFunIndex;
  bot?: Nel<[PlayerTarget, Effect]>;
  eot?: Nel<[PlayerTarget, Effect]>;
  effects?: Nel<InventoryEffect>;
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
