import { Enemies, Player, Snapshot, MonsterTarget } from "./types";
import { Seq } from "immutable";

export type PlayHistory = [Snapshot, ...Snapshot[]];

export type Play = {
  states: PlayHistory;
  setSelected: (target: MonsterTarget) => Play;
  handlePlayerEffect: (index: number) => Play;
};

export default function play(player: Player, enemies: Enemies, select: Chance.Chance): Play {
  const startState: Snapshot = {
    player,
    enemies,
    target: 0,
  };

  const playerSkills = Object.values(player.build).flatMap((s) => s.effects);

  const handlePlayerEffectFn = (history: PlayHistory, index: number): Play => {
    const newState = Seq(enemies)
      .map((e, idx) => [idx as MonsterTarget, e.effects[e.rolls[e.stats.distance - 1][select.natural({ min: 0, max: e.rolls[e.stats.distance - 1].length - 1 })]]] as const)
      .concat([['Player', playerSkills[index]] as const])
      .sortBy(([_origin, effect]) => effect.priority)
      .reduce((state, [origin, effect]) => effect.effect(origin, startState, state), history[history.length - 1]);
    const states = [...history, newState] as PlayHistory;
    return {
      states,
      setSelected: (target: MonsterTarget) => setSelectedFn(states, target),
      handlePlayerEffect: (target: number) => handlePlayerEffectFn(states, target),
    };
  };

  const setSelectedFn = (history: PlayHistory, target: MonsterTarget): Play => {
    const newState: Snapshot = {
      ...history[history.length - 1],
      target,
    };
    const states = [...history, newState] as PlayHistory;
    return {
      states,
      setSelected: (target: MonsterTarget) => setSelectedFn(states, target),
      handlePlayerEffect: (target: number) => handlePlayerEffectFn(states, target),
    };
  }

  return {
    states: [startState],
    setSelected: (target: MonsterTarget) => setSelectedFn([startState], target),
    handlePlayerEffect: (target: number) => handlePlayerEffectFn([startState], target),
  };
}
