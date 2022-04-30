import { Enemies, Player, Snapshot, MonsterTarget, Target, InventoryEffect, EnemiesStats, PlayerStats, Play, RNG, StatsFun, Effect, PlayerTarget, effectFunCall, DisabledSkills, safeEntries } from "./types";
import { Seq, Set } from "immutable";
import { allRanges, previousState } from "./data";
import { Chance } from "chance";
// @ts-ignore fails on scripts despite having a d.ts file
import { toIndexableString } from 'pouchdb-collate';
import { extractFunction, statsRepository } from "./effectRepository";

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

export const turnRng = (play: Play, turn: number): ((min: number, max: number) => number) => {
  const turnRng = [...play.rng[turn]];
  return (min: number, max: number) => Math.floor(((max - min) * turnRng.pop()!!) + min);
}

export const playerPassives = (player: Player): StatsFun[] =>
  Object.values(player.build).flatMap((s) => s.passives ?? []).map(i => statsRepository[i]);

export const playerActions = (player: Player): InventoryEffect[] =>
  Object.values(player.build).flatMap((s) => s.effects ?? []);

const enemiesBotEffects = (enemies: Enemies): [MonsterTarget, Effect][] =>
  enemies.flatMap((e, idx) => (e.bot ?? []).map(eff => [idx as MonsterTarget, eff] as const))
    // Sure, typescript
    .map(a => [...a]);

const enemiesEotEffects = (enemies: Enemies): [MonsterTarget, Effect][] =>
  enemies.flatMap((e, idx) => (e.eot ?? []).map(eff => [idx as MonsterTarget, eff] as const))
    // Sure, typescript
    .map(a => [...a]);

export const playerBotEffects = (player: Player, d: DisabledSkills): [PlayerTarget, Effect][] =>
  safeEntries(player.build).flatMap(([k, s]) => !Set(d).has(k) ? s.bot ?? [] : []).map(a => ['Player', a]);

export const playerEotEffects = (player: Player, d: DisabledSkills): [PlayerTarget, Effect][] =>
  safeEntries(player.build).flatMap(([k, s]) => !Set(d).has(k) ? s.eot ?? [] : []).map(a => ['Player', a]);

export const buildPlayer = (player: Player, playerStats: PlayerStats, enemiesStats: EnemiesStats): [PlayerStats, EnemiesStats] =>
  playerPassives(player).reduce(([p, e], fun) => fun(p, e), [playerStats, enemiesStats]);

export default function start(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  const [playerGameStats, enemyGameStats] = buildPlayer(player, playerStats, enemiesStats);
  return {
    player,
    enemies,
    states: [{
      player: playerGameStats,
      enemies: enemyGameStats,
      target: 0,
      lastAttacks: [],
      disabledSkills: []
    }],
    rng: turnDeterministicRng(turns, randPerTurn, seed),
    turns,
    id: toIndexableString([player, enemies, turns, seed]),
    seed,
  };
}

const clamp = (num: number, min: number, max: number = Infinity) =>
  Math.min(Math.max(num, min), max);

const reduceFuns = (funs: [Target, Effect][], p: Play, s: Snapshot, dodgeable: boolean, phase: string): [Play, Snapshot] =>
  Seq(funs)
    .sortBy(([origin, a]) => {
      const priorityBonus = origin === 'Player' ? s.player.speed.current : s.enemies[origin]!!.speed.current;
      return clamp(a.priority - priorityBonus, 0, 4);
    })
    .reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldPlay, oldState] = acc;
      const monsterId = origin === 'Player' ? oldState.target : origin;
      const targetMonster = oldState.enemies[monsterId]!!;
      const isInRange = Set([...effect.range]).has(targetMonster.distance);

      if (!isInRange) {
        const newState: Snapshot = {
          ...oldState,
          lastAttacks: [...oldState.lastAttacks, { origin, display: `❌❌WHIFFED❌❌ ${effect.display}`, phase }]
        };
        return [oldPlay, newState];
      }

      const monsterDodged = dodgeable && origin === 'Player' && targetMonster.status.dodge.active;
      if (monsterDodged) {
        const newState: Snapshot = {
          ...oldState,
          enemies: oldState.enemies.map((e, i) => i === monsterId ? { ...e, status: { ...e.status, dodge: { active: false } } } : e) as EnemiesStats,
          lastAttacks: [...oldState.lastAttacks, { origin, display: `💨💨DODGED💨💨 ${effect.display}`, phase }]
        };
        return [oldPlay, newState];
      }

      const playerDodged = dodgeable && origin !== 'Player' && oldState.player.status.dodge.active;
      if (playerDodged) {
        const newState: Snapshot = {
          ...oldState,
          player: { ...oldState.player, status: { ...oldState.player.status, dodge: { active: false } } },
          lastAttacks: [...oldState.lastAttacks, { origin, display: `💨💨DODGED💨💨 ${effect.display}`, phase }]
        };
        return [oldPlay, newState];
      }

      const [newPlay, newState] = extractFunction(effect)(origin, oldPlay, oldState);
      const finalState: Snapshot = { ...newState, lastAttacks: [...newState.lastAttacks, { origin, display: effect.display, phase }] };
      return [newPlay, finalState];
    }, [p, s]);

const applyEffectStamina = (amount: number): Effect =>
  ({ display: `${amount >= 0 ? '+' : ''}${amount} 💪`, tooltip: `Use ${amount} stamina`, effects: [effectFunCall(['Basic:Stamina', { amount }])], range: allRanges, priority: 0 });

const effectEotCleanup: Effect =
  ({ display: 'Cleanup', tooltip: 'Cleanup', effects: [effectFunCall('Utility:Cleanup')], range: allRanges, priority: 0 });

const effectDead: Effect =
  { display: "⚰", tooltip: "⚰", priority: 4, effects: [effectFunCall("Monster:Dead")], range: allRanges };

export const handlePlayerEffect = (play: Play, index: number): Play => {

  const lastTurnState = previousState(play);
  const usedSkill = playerActions(play.player)[index];
  const bot = lastTurnState.bot ?? [];
  const eot = lastTurnState.eot ?? [];

  const initialState: Snapshot = {
    ...lastTurnState,
    lastAttacks: [],
    bot: undefined,
    eot: undefined,
  };

  // Stamina
  const [preBotPlay, preBotState] =
    reduceFuns([['Player', applyEffectStamina(lastTurnState.player.staminaPerTurn.current - usedSkill.stamina)]], play, initialState, false, 'STAMINA');

  // BOT
  // Lingering effects
  const [postBotPlay, postBotState] = reduceFuns(bot, preBotPlay, preBotState, false, 'BOT');
  // Player & Monster effects
  const entitiesBot: [Target, Effect][] = [...playerBotEffects(postBotPlay.player, postBotState.disabledSkills), ...enemiesBotEffects(postBotPlay.enemies)];
  const [postEntitiesBotPlay, postEntitiesBotState] = reduceFuns(entitiesBot, postBotPlay, postBotState, false, 'BOT');

  // Turn
  const rand = turnRng(postEntitiesBotPlay, postEntitiesBotPlay.states.length);
  const turnFunctions: [Target, Effect][] = Seq(postEntitiesBotPlay.enemies).zip(Seq(postEntitiesBotState.enemies))
    .map(([e, stats], idx) =>
      [idx as Target,
      stats.hp.current > 0
        ? e.effects[e.rolls[stats.distance][rand(0, e.rolls[stats.distance].length)]]
        : effectDead] as const)
    .concat([['Player' as Target, usedSkill] as const])
    .toArray()
    // Sure, typescript
    .map(a => [...a]);

  const [newPlay, newState] =
    reduceFuns(turnFunctions, postEntitiesBotPlay, postEntitiesBotState, true, 'MAIN');

  // EOT
  // Player & Monster effects
  const entitiesEot = [...playerEotEffects(newPlay.player, newState.disabledSkills), ...enemiesEotEffects(newPlay.enemies)];
  const [postPlayerEotPlay, postPlayerEotState] = reduceFuns(entitiesEot, newPlay, newState, false, 'EOT');
  // Lingering effects
  const [postEotPlay, postEotState] = reduceFuns(eot, postPlayerEotPlay, postPlayerEotState, false, 'EOT');
  // Cleanup
  const [postCleanup, postCleanupState] = reduceFuns([['Player' as Target, effectEotCleanup]], postEotPlay, postEotState, false, 'EOT');

  return {
    ...postCleanup,
    states: [...postCleanup.states, postCleanupState],
  };
};

export const setSelected = (play: Play, target: MonsterTarget): Play => {
  play.states[play.states.length - 1].target = target;
  return {
    ...play,
    states: [...play.states],
  };
}

export const setDisabledSkills = (play: Play, disabled: DisabledSkills): Play => {
  play.states[play.states.length - 1].disabledSkills = disabled;
  return {
    ...play,
    states: [...play.states],
  };
}

export type PlayState = 'win' | 'loss' | 'playing'

export const playState = (play: Play): PlayState => {
  const state = play.states[play.states.length - 1];
  return state.player.hp.current <= 0
    ? 'loss'
    : state.enemies.reduce((acc, monster) => acc + monster.hp.current, 0) <= 0
      ? 'win'
      : 'playing';
}
