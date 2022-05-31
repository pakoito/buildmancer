import { List, Range } from 'immutable';
import { Tuple } from './types';

export const rangeArr = (max: number, min: number = 0) => {
  let range = [...Array(max).keys()];
  if (min >= 0) {
    range.filter((i) => i < min);
  }
  return range;
};

export const clamp = (num: number, min: number, max: number = Infinity) =>
  Math.min(Math.max(num, min), max);

export const pipe = <T, U>(t: T, f: (t: T) => U): U => f(t);

export const pipe2 = <T, U, A>(t: T, u: U, f: (t: T, u: U) => A): A => f(t, u);

export const pipe3 = <T, U, V, A>(t: T, u: U, v: V, f: (t: T, u: U, v: V) => A): A => f(t, u, v);

export const chunk = <T, N extends number>(list: T[], chunkSize: N): Tuple<T, N>[] =>
  Range(0, list.length, chunkSize)
    .map((chunkStart) => list.slice(chunkStart, chunkStart + chunkSize))
    .toArray() as Tuple<T, N>[];
