import { Enemies, Player, Snapshot, MonsterTarget, Target, InventoryEffect, EnemiesStats, PlayerStats, Play, RNG, StatsFun, Effect } from "./types";
import { Seq } from "immutable";
import { allRanges, effectDead, previousState, statsRepository } from "./data";
import { Chance } from "chance";
// @ts-ignore fails on scripts despite having a d.ts file
import { toIndexableString } from 'pouchdb-collate';
import { extractFunction } from "./effectFunctions";

/**
 * @returns min inclusive, max exclusive rand
 */
function turnDeterministicRng(turns: number, randPerTurn: number, monsterSeed: string | number): RNG {
  const monsterChance = new Chance(monsterSeed);
  const monsterRng =
    [...Array(turns).keys()]
      .map(_ => [...Array(randPerTurn).keys()]
        .map(_ => monsterChance.floating({ min: 0, max: 1, fixed: 2 })));
  return monsterRng as RNG;
}

export const turnRng = (play: Play, turn: number) => (min: number, max: number): number => {
  const turnRng = [...play.rng[turn]];
  return Math.floor(((max - min) * turnRng.pop()!!) + min);
}

export const playerPassives = (player: Player): StatsFun[] =>
  Object.values(player.build).flatMap((s) => s.passive ?? []).map(i => statsRepository[i]);

export const playerActions = (player: Player): InventoryEffect[] =>
  Object.values(player.build).flatMap((s) => s.effects ?? []);

export const playerBotEffects = (player: Player): Effect[] =>
  Object.values(player.build).flatMap((s) => s.bot ?? []);

export const playerEotEffects = (player: Player): Effect[] =>
  Object.values(player.build).flatMap((s) => s.eot ?? []);

export default function play(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  const [playerGameStats, enemyGameStats] = playerPassives(player).reduce(([p, e], fun) => fun(p, e), [playerStats, enemiesStats] as const);
  return {
    player,
    enemies,
    states: [{
      player: playerGameStats,
      enemies: enemyGameStats,
      target: 0,
      lastAttacks: []
    }],
    rng: turnDeterministicRng(turns, randPerTurn, seed),
    turns,
    id: toIndexableString([player, enemies, turns, seed]),
    seed,
  };
}

const reduceFuns = (funs: Effect[], p: Play, s: Snapshot): [Play, Snapshot] =>
  Seq(funs)
    .sortBy(a => a.priority)
    .reduce(([play, snap], { effect, parameters }) =>
      extractFunction(effect, parameters)('Player' /* FIXME */, play, snap),
      [p, s],
    );

const applyEffectStamina = (amount: number): Effect =>
  ({ display: "Stamina use", effect: 'Player:SapStamina', parameters: { amount }, range: allRanges, priority: 0 });

export const handlePlayerEffect = (play: Play, index: number): Play => {
  const currState = previousState(play);
  const { enemies, bot, eot } = currState;
  const playerSkills = playerActions(play.player);
  const usedSkill = playerSkills[index];

  // BOT
  const playerBot = playerBotEffects(play.player);
  const [preBotPlay, preBotState] =
    reduceFuns([applyEffectStamina(currState.player.staminaPerTurn - usedSkill.stamina)], play, currState);
  const [postBotPlay, postBotState] = reduceFuns(bot ?? [], preBotPlay, preBotState);
  const [postPlayerBotPlay, postPlayerBotState] = reduceFuns(playerBot, postBotPlay, postBotState);

  // Turn
  const rand = turnRng(play, play.states.length - 1);
  const functions = Seq(play.enemies).zip(Seq(enemies))
    .map(([e, stats], idx) =>
      [idx as Target,
      stats.hp > 0
        ? e.effects[e.rolls[stats.distance - 1][rand(0, e.rolls[stats.distance - 1].length)]]
        : effectDead] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .sortBy(([_origin, effect]) => effect.priority);

  const [newPlay, newState, lastAttacks] =
    functions.reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldPlay, oldState, lastAttacks] = acc;
      const target = origin === 'Player' ? postPlayerBotState.target : origin;
      const isInRange = new Set([...effect.range]).has(postPlayerBotState.enemies[target]?.distance!!);
      if (isInRange) {
        const [newPlay, newState] = extractFunction(effect.effect, effect.parameters)(origin, postPlayerBotPlay, oldState);
        return [newPlay, newState, [...lastAttacks, [origin, effect.display] as [Target, string]]]
      } else {
        return [oldPlay, oldState, [...lastAttacks, [origin, `${effect.display} ❌❌WHIFF❌❌`] as [Target, string]]]
      }
    }, [postPlayerBotPlay, postPlayerBotState, [] as [Target, string][]]);

  // EOT
  const preEotState = { ...newState, lastAttacks };
  const playerEot = playerEotEffects(newPlay.player);
  const [postPlayerEotPlay, postPlayerEotState] = reduceFuns(playerEot, newPlay, preEotState);
  const [postEotPlay, postEotState] = reduceFuns(eot ?? [], postPlayerEotPlay, postPlayerEotState);

  return {
    ...postEotPlay,
    states: [...postEotPlay.states, postEotState],
  };
};

export const setSelected = (play: Play, target: MonsterTarget): Play => {
  play.states[play.states.length - 1].target = target;
  return {
    ...play,
    states: [...play.states],
  };
}
