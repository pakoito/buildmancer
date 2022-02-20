import { createIs, is } from 'typescript-is';
import { Opaque } from "type-fest";
import { callEffectFun, Effect, FunIndex, Play, Snapshot, Target } from "./types";
import effectRepository, { EffectFunctionRepository, EffectFunctionT } from './effectRepository';

export type ReduceFun = (origin: Target, play: Play, newState: Snapshot) => [Play, Snapshot];
export type ParametrizedFun<T> = (params: T) => ReduceFun;
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;

export type EffectFunRepo = EffectFunctionRepository;
export type EffectFunRepoIndex = keyof EffectFunctionT & FunIndex;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<EffectFunRepo[T]>[0];

const isNode = typeof process === 'undefined';

export function extractFunction({ effects }: Effect): ReduceFun {
  if (!isNode || !effects.map(({ index, parameters }) => isAnyEffectFunParams(index, parameters)).includes(false)) {
    return (origin, play, startState) => effects.reduce((acc, { index, parameters }) =>
      callEffectFun(effectRepository, index, parameters)(origin, ...acc), [play, startState]);
  }
  throw new Error(`ValidationException: ${JSON.stringify(effects.filter(({ index, parameters }) => !isAnyEffectFunParams(index, parameters)))}`);
}

const assignObject = <T extends EffectFunRepoIndex>(idx: T, obj: object, value: any): object => {
  // @ts-ignore
  obj[idx as string] = value;
  return { ...obj };
}

// Uses all the tricks in the book for runtime validation
const validators = !isNode
  ? {} as { [k: string]: any }
  : Object.keys(effectRepository)
    // eslint-disable-next-line array-callback-return
    .reduce((obj, idx) => {
      if (!is<EffectFunRepoIndex>(idx)) {
        return obj;
      }
      switch (idx) {
        case 'Target:Bleed': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Monster:Summon': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Monster:Dead': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Basic:UseStamina': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Basic:Rest': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Basic:Advance': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Basic:Retreat': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Axe:Chop': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Axe:Cut': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Hook:GetHere': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Monster:Swipe': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Monster:Roar': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'Monster:Jump': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
        case 'BootsOfFlight:EOT': return assignObject(idx, obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      }
    }, {}) as Validators;
type Validators = { [k in EffectFunRepoIndex]: [(object: any) => object is k, (object: any) => object is EffectFunParams<k>] };

export function isAnyEffectFunParams(idx: any, value: any): value is EffectFunParams<EffectFunRepoIndex> {
  if (is<EffectFunRepoIndex>(idx)) {
    const v = validators[idx];
    if (v != null) {
      return v[0](idx) && v[1](value);
    }
  }
  return false;
}

export function isEffectFunParams<T extends EffectFunRepoIndex>(expected: T, idx: any, value: any): value is EffectFunParams<T> {
  if (expected === idx) {
    const v = validators[expected];
    return v[0](idx) && v[1](value);
  }
  return false;
}

// Jest doesn't work so this should do
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test = () => {
  const assertF = (a: any, b: any) => a === b ? void 0 : console.log(`Failed ${a.toString()} compared to ${b.toString()} ${new Error().stack?.split('\n')[2].trim()}`);
  const [idx1, value1] = JSON.parse(JSON.stringify(['Monster:Summon', { enemy: 1 }]));
  assertF(true, isAnyEffectFunParams(idx1, value1));
  assertF(false, isEffectFunParams('Target:Bleed', idx1, value1));
  assertF(false, isAnyEffectFunParams('Target:Bleed', value1));

  const [idx2, value2] = JSON.parse(JSON.stringify(['Monster:Summon', { patatas: 1 }]));
  assertF(false, isAnyEffectFunParams(idx2, value2));

  const [idx3, value3] = JSON.parse(JSON.stringify(['Monster:Patatas', {}]));
  assertF(false, isAnyEffectFunParams(idx3, value3));

  const [idx4, value4] = JSON.parse(JSON.stringify(['Monster:Swipe']));
  assertF(true, isAnyEffectFunParams(idx4, value4));
  assertF(false, isAnyEffectFunParams(idx4, value4 ?? null));
  assertF(true, isAnyEffectFunParams(idx4, value4 ?? undefined));

  const [idx5, value5] = JSON.parse(JSON.stringify(['Monster:Swipe', undefined]));
  assertF(false, isAnyEffectFunParams(idx5, value5));
  assertF(false, isAnyEffectFunParams(idx5, value5 ?? null));
  assertF(true, isAnyEffectFunParams(idx5, value5 ?? undefined));
}

// node --experimental-specifier-resolution=node --loader ts-node/esm src/utils/effectFunctions.ts 
// test();
