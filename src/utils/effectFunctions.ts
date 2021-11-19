/* eslint-disable no-empty-pattern */
import { createIs, is } from 'typescript-is';
import { Opaque } from "type-fest";
import { enemies, startState } from "./data";
import { actions } from "./playGame";
import { MonsterTarget, Nel, Play, Snapshot, Target } from "./types";

export type ParametrizedFun<T> = (params: T) => (origin: Target, play: Play, newState: Snapshot) => [Play, Snapshot];
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;
export const effectFun = <T>(...funs: Nel<ParametrizedFun<T>>): EffectFun<T> =>
  // TODO check direction of the fold
  (funs.length > 1
    ? funs.reduce((acc, value) => (params) => (origin, play, oldState) => {
      const [newPlay, newState] = acc(params)(origin, play, oldState);
      return value(params)(origin, newPlay, newState);
    }) : funs[0]) as EffectFun<T>;

type ItemOrMonster = string /* TODO all items */ | 'Monster';
export type FunIndex = `${ItemOrMonster}:${string}`;

export type EffectFunRepoIndex = keyof typeof EffectRepository & FunIndex;
export type EffectFunRepo = typeof EffectRepository;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<EffectFunRepo[T]>[0];

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

export const EffectRepository = {
  'Target:Bleed': effectFun<{ target: Target; lifespan: number; origin: Target }>(
    ({ target }) => (_origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(startState(play), currentState, 1) : actions.attackMonster(startState(play), currentState, target, 3)],
    (params) => (_origin, play, currentState) => [play, params.lifespan > 0 ? actions.addEotEffect(currentState, { effect: 'Target:Bleed', origin: params.origin, parameters: { ...params, lifespan: params.lifespan - 1 } }) : currentState],
  ),
  'Monster:Summon': effectFun<{ enemy: number }>(
    ({ enemy }) => (_origin, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
  'Monster:Dead': effectFun<{}>(
    ({ }) => (_origin, play, newState) => [play, newState]
  ),
  'Basic:Rest': effectFun<{}>(
    ({ }) => (_origin, play, newState) => [play, newState]
  ),
  'Basic:Advance': effectFun<{}>(
    ({ }) => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, -2)]
  ),
  'Basic:Retreat': effectFun<{}>(
    ({ }) => (_origin, play, newState) => [play, actions.changeDistance(newState, newState.target, 2)]
  ),
  'Axe:Chop': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)]
  ),
  'Axe:Cut': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)],
    ({ }) => (origin, play, currentState) => [play, actions.addEotEffect(currentState, { effect: 'Target:Bleed', origin, parameters: { lifespan: 3, target: currentState.target } })]
  ),
  'Hook:GetHere': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, actions.attackMonster(startState(play), currentState, currentState.target, 3)],
    ({ }) => (_origin, play, currentState) => [play, actions.changeDistance(currentState, currentState.target, -1)]
  ),
  'Monster:Swipe': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, actions.attackPlayer(startState(play), currentState, 2)]
  ),
  'Monster:Roar': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, actions.modifyPlayerStamina(startState(play), currentState, -5)]
  ),
  'Monster:Jump': effectFun<{}>(
    ({ }) => (origin, play, currentState) => [play, actions.changeDistance(currentState, origin, -2)]
  ),
  'BootsOfFlight:EOT': effectFun<{}>(
    ({ }) => (_, play, currentState) => [play, currentState.enemies.reduce((s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, -2), currentState)]
  ),
};

// Uses all the tricks in the book for runtime validation
const validators = Object.keys(EffectRepository)
  // eslint-disable-next-line array-callback-return
  .reduce((obj, idx) => {
    if (!is<EffectFunRepoIndex>(idx)) {
      return obj;
    }
    switch (idx) {
      case 'Target:Bleed': return assignObject('Target:Bleed', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Monster:Summon': return assignObject('Monster:Summon', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Monster:Dead': return assignObject('Monster:Dead', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Basic:Rest': return assignObject('Basic:Rest', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Basic:Advance': return assignObject('Basic:Advance', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Basic:Retreat': return assignObject('Basic:Retreat', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Axe:Chop': return assignObject('Axe:Chop', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Axe:Cut': return assignObject('Axe:Cut', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Hook:GetHere': return assignObject('Hook:GetHere', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Monster:Swipe': return assignObject('Monster:Swipe', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Monster:Roar': return assignObject('Monster:Roar', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'Monster:Jump': return assignObject('Monster:Jump', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
      case 'BootsOfFlight:EOT': return assignObject('BootsOfFlight:EOT', obj, [createIs<typeof idx>(), createIs<EffectFunParams<typeof idx>>()]);
    }
  }, {}) as Validators;
type Validators = { [k in EffectFunRepoIndex]: readonly [(object: any) => object is k, (object: any) => object is EffectFunParams<k>] };

const assignObject = <T extends EffectFunRepoIndex>(idx: T, obj: object, value: any): object => {
  // @ts-ignore
  obj[idx as string] = value;
  return { ...obj };
}

const main = () => {
  const [idx1, value1] = JSON.parse(JSON.stringify(['Monster:Summon', { enemy: 1 }]));
  console.log(isAnyEffectFunParams(idx1, value1));
  console.log(isEffectFunParams('Target:Bleed', idx1, value1));
  console.log(isAnyEffectFunParams('Target:Bleed', value1));

  const [idx2, value2] = JSON.parse(JSON.stringify(['Monster:Summon', { patatas: 1 }]));
  console.log(isAnyEffectFunParams(idx2, value2));

  const [idx3, value3] = JSON.parse(JSON.stringify(['Monster:Patatas', {}]));
  console.log(isAnyEffectFunParams(idx3, value3));
}

main();