export const rangeArr = (max: number, min: number = 0) => {
  let range = [...Array(max).keys()];
  if (min >= 0) {
    range.filter(i => i < min)
  }
  return range;
}
