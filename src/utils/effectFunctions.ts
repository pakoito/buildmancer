// import { createIs, is } from 'typescript-is';
import { Opaque } from "type-fest";
import { FunIndex, Nel, Play, Snapshot, Target } from "./types";
import EffectRepository from './effectRepository';
import effectRepository from './effectRepository';

export type ReduceFun = (origin: Target, play: Play, newState: Snapshot) => [Play, Snapshot];
export type ParametrizedFun<T> = (params: T) => ReduceFun;
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;

export type EffectFunRepoIndex = keyof EffectFunRepo & FunIndex;
export type EffectFunRepo = typeof EffectRepository;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<EffectFunRepo[T]>[0];

export function extractFunction(idx: string, value: EffectFunParams<EffectFunRepoIndex>): ReduceFun {
  //if (isAnyEffectFunParams(idx, value)) {
  // @ts-ignore: where the magic happens
  return effectRepository[idx](value);
  //}
  //throw new Error('ValidationException');
}

// // Uses all the tricks in the book for runtime validation
// const validators = Object.keys(EffectRepository)
//   // eslint-disable-next-line array-callback-return
//   .reduce((obj, idx) => {
//     if (!is<EffectFunRepoIndex>(idx)) {
//       return obj;
//     }
//     switch (idx) {
//       case 'Target:Bleed': return assignObject('Target:Bleed', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Monster:Summon': return assignObject('Monster:Summon', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Monster:Dead': return assignObject('Monster:Dead', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Basic:Rest': return assignObject('Basic:Rest', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Basic:Advance': return assignObject('Basic:Advance', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Basic:Retreat': return assignObject('Basic:Retreat', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Axe:Chop': return assignObject('Axe:Chop', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Axe:Cut': return assignObject('Axe:Cut', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Hook:GetHere': return assignObject('Hook:GetHere', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Monster:Swipe': return assignObject('Monster:Swipe', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Monster:Roar': return assignObject('Monster:Roar', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'Monster:Jump': return assignObject('Monster:Jump', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//       case 'BootsOfFlight:EOT': return assignObject('BootsOfFlight:EOT', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
//     }
//   }, {}) as Validators;
// type Validators = { [k in EffectFunRepoIndex]: readonly [(object: any) => object is k, (object: any) => object is EffectFunParams<k>] };

// export function isAnyEffectFunParams(idx: any, value: any): value is EffectFunParams<EffectFunRepoIndex> {
//   if (is<EffectFunRepoIndex>(idx)) {
//     const v = validators[idx];
//     if (v != null) {
//       return v[0](idx) && v[1](value);
//     }
//   }
//   return false;
// }

// export function isEffectFunParams<T extends EffectFunRepoIndex>(expected: T, idx: any, value: any): value is EffectFunParams<T> {
//   if (expected === idx) {
//     const v = validators[expected];
//     return v[0](idx) && v[1](value);
//   }
//   return false;
// }

// const assignObject = <T extends EffectFunRepoIndex>(idx: T, obj: object, value: any): object => {
//   // @ts-ignore
//   obj[idx as string] = value;
//   return { ...obj };
// }

// const main = () => {
//   const [idx1, value1] = JSON.parse(JSON.stringify(['Monster:Summon', { enemy: 1 }]));
//   console.log(isAnyEffectFunParams(idx1, value1));
//   console.log(isEffectFunParams('Target:Bleed', idx1, value1));
//   console.log(isAnyEffectFunParams('Target:Bleed', value1));

//   const [idx2, value2] = JSON.parse(JSON.stringify(['Monster:Summon', { patatas: 1 }]));
//   console.log(isAnyEffectFunParams(idx2, value2));

//   const [idx3, value3] = JSON.parse(JSON.stringify(['Monster:Patatas', {}]));
//   console.log(isAnyEffectFunParams(idx3, value3));
// }
