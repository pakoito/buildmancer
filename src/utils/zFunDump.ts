export const rangeArr = (max: number, min: number = 0) => {
  let range = [...Array(max).keys()];
  if (min >= 0) {
    range.filter(i => i < min)
  }
  return range;
}

export const clamp = (num: number, min: number, max: number = Infinity) =>
  Math.min(Math.max(num, min), max);

export const pipe = <T, U>(t: T, f: (t: T) => U): U =>
  f(t)