import { isAnyEffectFunParams, isEffectFunParams } from "./effectFunctions";

// Skipped while incompatible with ts-is
test.skip('Runtime validations', () => {
  it('Should not get confused with the types and values', () => {
    const [idx1, value1] = JSON.parse(JSON.stringify(['Monster:Summon', { enemy: 1 }]));
    expect(isAnyEffectFunParams(idx1, value1)).toMatchInlineSnapshot();
    expect(isEffectFunParams('Target:Poison', idx1, value1)).toMatchInlineSnapshot();
    expect(isAnyEffectFunParams('Target:Poison', value1)).toMatchInlineSnapshot();
  });

  it('Should fail on wrong types', () => {
    const [idx2, value2] = JSON.parse(JSON.stringify(['Monster:Summon', { patatas: 1 }]));
    expect(isAnyEffectFunParams(idx2, value2)).toMatchInlineSnapshot();

    const [idx3, value3] = JSON.parse(JSON.stringify(['Monster:Patatas', {}]));
    expect(isAnyEffectFunParams(idx3, value3)).toMatchInlineSnapshot();
  });

  it('Should differentiate missing and null', () => {
    const [idx4, value4] = JSON.parse(JSON.stringify(['Monster:Swipe']));
    expect(isAnyEffectFunParams(idx4, value4)).toMatchInlineSnapshot();
    expect(isAnyEffectFunParams(idx4, value4 ?? null)).toMatchInlineSnapshot();

    const [idx5, value5] = JSON.parse(JSON.stringify(['Monster:Swipe', undefined]));
    expect(isAnyEffectFunParams(idx5, value5)).toMatchInlineSnapshot();
    expect(isAnyEffectFunParams(idx5, value5 ?? null)).toMatchInlineSnapshot();
  });
});
