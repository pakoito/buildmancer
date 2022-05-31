import minimist from 'minimist';
import { BuildConfig, GameConfig, randGame, randBuild } from './tinkererTools';
import { rangeArr } from '../game/zFunDump';
import { Chance } from 'chance';

const start = async ({ type, amount }: minimist.ParsedArgs) => {
  if (type !== 'build' && type !== 'game') {
    console.log("Please specify a type of 'build' or 'game'");
    process.exit(1);
  }
  const amt = amount ?? 1;
  const rand = new Chance();
  if (type === 'build') {
    const conf: BuildConfig[] = rangeArr(amt).map((_) => randBuild(rand));
    console.log(JSON.stringify(conf));
  } else if (type === 'game') {
    const conf: GameConfig = randGame(rand);
    console.log(JSON.stringify(conf));
  }
};

start(minimist(process.argv.slice(2)));
