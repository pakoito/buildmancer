import { updateGlobals } from './modding';
import { Snapshot, Play, BuildRepository, EnemyRepository } from './types';
import enemyRepository from './data/enemies';
import buildRepository from './data/build';

export const enemies: EnemyRepository = enemyRepository;
export const build: BuildRepository = buildRepository;

updateGlobals({ build, enemies });
