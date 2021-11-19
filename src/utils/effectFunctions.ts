import { Opaque } from "type-fest";
import { enemies, startState } from "./data";
import { actions } from "./playGame";
import { MonsterTarget, Nel, Play, Snapshot, Target } from "./types";

export type ParametrizedFun<T> = (params: T) => (play: Play, newState: Snapshot) => [Play, Snapshot];
export type EffectFun<T> = Opaque<ParametrizedFun<T>, ParametrizedFun<T>>;
export const effectFun = <T>(...funs: Nel<ParametrizedFun<T>>): EffectFun<T> =>
  // TODO check direction of the fold
  (funs.length > 1
    ? funs.reduce((acc, value) => (params) => (play, oldState) => {
      const [newPlay, newState] = acc(params)(play, oldState);
      return value(params)(newPlay, newState);
    }) : funs[0]) as EffectFun<T>;

type ItemOrMonster = string /* TODO all items */ | 'Monster';
export type FunIndex = `${ItemOrMonster}:${string}`;

export type EffectFunRepoIndex = keyof typeof EffectRepository & FunIndex;
export type EffectFunRepo = typeof EffectRepository;
export type EffectFunParams<T extends EffectFunRepoIndex> = Parameters<EffectFunRepo[T]>[0];

export const EffectRepository = {
  'Target:Bleed': effectFun<{ target: Target; lifespan: number; origin: Target }>(
    ({ target }) => (play, currentState) => [play, target === 'Player' ? actions.attackPlayer(startState(play), currentState, 1) : actions.attackMonster(startState(play), currentState, target, 3)],
    (params) => (play, currentState) => [play, params.lifespan > 0 ? actions.addEotEffect(currentState, { effect: 'Target:Bleed', origin: params.origin, parameters: { ...params, lifespan: params.lifespan - 1 } }) : currentState],
  ),
  'Monster:Summon': effectFun<{ enemy: MonsterTarget }>(
    ({ enemy }) => (play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1])
  ),
};

const main = () => {
  const [idx, value] = JSON.parse(JSON.stringify(['Monster:Summon', { enemy: 1 }]));
  //if (isEffectFunRepoIndex(idx) && isEffectFunValue<typeof idx>(value)) {

  //}

  const someParameters: EffectFunParams<'Target:Bleed'> = {
    lifespan: 1,
    target: 1,
    origin: 0,
  };

  console.log(someParameters);
}