import { updateGlobals } from './modding';
import { Snapshot, Play, BuildRepository, EnemyRepository } from './types';
import enemyRepository from './data/enemies';
import buildRepository from './data/build';

export const startState = (play: Play): Snapshot => play.states[0];
export const previousState = (play: Play): Snapshot =>
  play.states[play.states.length - 1];

export const enemies: EnemyRepository = enemyRepository;
export const build: BuildRepository = buildRepository;

updateGlobals({ build, enemies });
