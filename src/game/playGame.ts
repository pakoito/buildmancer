import { Enemies, Player, Snapshot, MonsterTarget, Target, InventoryEffect, EnemiesStats, PlayerStats, Play, RNG, StatsFun, Effect, PlayerTarget, effectFunCall, DisabledSkills, safeEntries, EffectPhase, InventoryStats, Seed } from "./types";
import { Seq, Set } from "immutable";
import { allRanges, previousState } from "./data";
import { Chance } from "chance";
// @ts-ignore fails on scripts despite having a d.ts file
import { toIndexableString } from 'pouchdb-collate';
import { extractFunction, statsRepository } from "./effectRepository";
import { clamp, rangeArr } from "./zFunDump";

/**
 * @returns min inclusive, max exclusive rand
 */
function turnDeterministicRng(turns: number, randPerTurn: number, monsterSeed: Seed): RNG {
  const monsterChance = new Chance(monsterSeed);
  const monsterRng =
    rangeArr(turns)
      .map(_ => rangeArr(randPerTurn)
        // If max === 1, the rng function fails
        .map(_ => monsterChance.floating({ min: 0, max: 0.9999, fixed: 4 })));
  return monsterRng as RNG;
}

export const turnRng = (play: Play, turn: number): ((min: number, max: number) => number) => {
  const turnRng = [...play.rng[turn]];
  return (min: number, max: number) => Math.floor(((max - min) * turnRng.pop()!!) + min);
}

export const playerPassives = (player: Player): StatsFun[] =>
  safeEntries(player.build).flatMap(([_k, s]) => s.passives ?? []).map(i => statsRepository[i]);

export const playerActions = (player: Player, inventoryStats: InventoryStats): InventoryEffect[] =>
  safeEntries(player.build)
    .flatMap(([_k, i]) => (i.effects ?? []))
    .filter(e => (e.amount ?? 999) > (inventoryStats[e.display]?.used ?? 0));

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

export function makeGameNew(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  const [playerGameStats, enemyGameStats] = buildPlayer(player, playerStats, enemiesStats);
  return makeGameNextLevel(player, playerGameStats, enemies, enemyGameStats, {}, turns, seed, randPerTurn);
}

export function makeGameNextLevel(player: Player, playerStats: PlayerStats, enemies: Enemies, enemiesStats: EnemiesStats, inventoryStats: InventoryStats, turns: number, seed: number | string, randPerTurn: number = 20): Play {
  return {
    player,
    enemies,
    states: [{
      player: playerStats,
      enemies: enemiesStats,
      inventory: inventoryStats,
      target: 0,
      lastAttacks: [],
      disabledSkills: []
    }],
    rng: turnDeterministicRng(turns, randPerTurn, seed),
    turns,
    id: toIndexableString([player, enemies, turns, seed]),
    seed,
    version: "1",
  };
}

const reduceFuns = (funs: [Target, Effect][], p: Play, s: Snapshot, dodgeable: boolean, phase: EffectPhase): [Play, Snapshot] =>
  Seq(funs)
    .sortBy(([origin, a]) => {
      if (a == null) {
        throw new Error(`Error in ${phase} by ${origin === 'Player' ? 'Player' : p.enemies[origin]?.lore.name}`);
      }
      const priorityBonus = origin === 'Player' ? s.player.speed.current : s.enemies[origin]!!.speed.current;
      return clamp(a.priority - priorityBonus, 0, 4);
    })
    .reduce((acc, value) => {
      const [origin, effect] = value;
      const [oldPlay, oldState] = acc;
      const monsterId = origin === 'Player' ? oldState.target : origin;
      const targetMonster = oldState.enemies[monsterId]!!;

      const isDeadAttackingMonster = origin !== 'Player' && targetMonster.hp.current <= 0;
      if (isDeadAttackingMonster) {
        const newState: Snapshot = {
          ...oldState,
          lastAttacks: [...oldState.lastAttacks, { origin, display: `💀💀DEAD💀💀 ${effect.display}`, phase }]
        };
        return [oldPlay, newState];
      }

      const isStunnedPlayer = origin === 'Player' && oldState.player.status.stun.active;
      const isStunnedMonster = origin !== 'Player' && targetMonster.status.stun.active;
      const isStunned = isStunnedPlayer || isStunnedMonster;
      if (isStunned) {
        const newState: Snapshot = {
          ...oldState,
          lastAttacks: [...oldState.lastAttacks, { origin, display: `💫💫STUNNED💫💫 ${effect.display}`, phase }]
        };
        return [oldPlay, newState];
      }


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
  const usedSkill = playerActions(play.player, lastTurnState.inventory)[index];
  const bot = lastTurnState.bot ?? [];
  const eot = lastTurnState.eot ?? [];

  const initialState: Snapshot = {
    ...lastTurnState,
    lastAttacks: [],
    bot: undefined,
    eot: undefined,
    inventory: {
      ...lastTurnState.inventory,
      [usedSkill.display]: {
        used: 1 + (lastTurnState.inventory[usedSkill.display]?.used ?? 0)
      }
    }
  };

  // Stamina
  const [preBotPlay, preBotState] =
    reduceFuns([['Player', applyEffectStamina(lastTurnState.player.staminaPerTurn.current - usedSkill.stamina)]], play, initialState, false, 'MAIN');

  // BOT
  // Lingering effects
  const [postBotPlay, postBotState] = reduceFuns(bot, preBotPlay, preBotState, false, 'BOT');
  // Player & Monster effects
  const entitiesBot: [Target, Effect][] = [...playerBotEffects(postBotPlay.player, postBotState.disabledSkills), ...enemiesBotEffects(postBotPlay.enemies)];
  const [postEntitiesBotPlay, postEntitiesBotState] = reduceFuns(entitiesBot, postBotPlay, postBotState, false, 'BOT');

  // Turn
  const rand = turnRng(postEntitiesBotPlay, postEntitiesBotPlay.states.length);
  const turnFunctions: [Target, Effect][] = Seq(postEntitiesBotPlay.enemies).zip(Seq(postEntitiesBotState.enemies))
    .map(([e, stats], idx) => {
      if (stats.hp.current > 0) {
        return [idx as Target, effectDead] as const;
      } else {
        const rolls = e.rolls[stats.distance];
        const roll = rand(0, e.rolls[stats.distance].length);
        // if (isNaN(roll)) {
        //   throw new Error('Out of RNG exception');
        // }
        const effect = e.effects[rolls[roll]];
        // if (effect == null) {
        //   throw new Error(`Rolled outside the table ${JSON.stringify({ roll, rolls, effects: e.effects })}`);
        // }
        return [idx as Target, effect] as const;
      }
    })
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

  const endOfTurn: Play = {
    ...postCleanup,
    states: [...postCleanup.states, postCleanupState],
  };

  return endOfTurn;
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

export const scoreGame = (play: Play): number => {
  const firstState = play.states[0];
  const lastState = play.states[play.states.length - 1];

  const turns = play.states.length; // 1-50
  const hpLoss = Math.max(0, firstState.player.hp.max - lastState.player.hp.current) / firstState.player.hp.max; // 0-1
  const staminaLoss = Math.max(0, firstState.player.stamina.max - lastState.player.stamina.current) / firstState.player.hp.max; // 0-1
  const enemies = lastState.enemies.length; // 1-5

  return Math.floor(enemies * ((500 * hpLoss) + (150 * staminaLoss) + (500 - (turns * 10))));
}
