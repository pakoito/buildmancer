import { EnemyStats, PlayerStats, EffectFun, Snapshot, Effect } from "../types";

export const snap = (player: PlayerStats, monster: EnemyStats) => ({
  player,
  monster,
});

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  funs.reduce((acc, value) => (start, curr) => acc(start, value(start, curr)));

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const skills = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(curr.player, {
      ...curr.monster,
      hp: clamp(curr.monster.hp - amount, 0, start.monster.hp),
    }),
  changeDistance: (curr: Snapshot, amount: number): Snapshot =>
    snap(curr.player, {
      ...curr.monster,
      distance: clamp(curr.monster.distance + amount, 1, 5),
    }),

  attackPlayer: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(
      {
        ...curr.player,
        hp: clamp(curr.player.hp - amount, 0, start.player.hp),
      },
      curr.monster,
    ),
  reducePlayerStamina: (
    start: Snapshot,
    curr: Snapshot,
    amount: number,
  ): Snapshot =>
    snap(
      {
        ...curr.player,
        stamina: clamp(curr.player.stamina - amount, 0, start.player.stamina),
      },
      curr.monster,
    ),
};

export const build: Record<
  string,
  {
    display: string;
    effects: Effect[];
    [key: string]: any;
  }[]
> = {
  class: [
    {
      display: "Warrior",
      effects: [],
    },
    {
      display: "Mage",
      effects: [],
    },
  ],
  skill: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
  weapon: [
    {
      display: "Warrior",
      effects: [
        {
          display: "Chop",
          effect: (player, monster) => skills.attackMonster(player, monster, 3),
        },
        {
          display: "Cut",
          effect: (player, monster) => skills.attackMonster(player, monster, 3),
        },
      ],
    },
  ],
  offhand: [
    {
      display: "Warrior",
      effects: [
        {
          display: "Bla",
          effect: chain(
            (start, curr) => skills.attackMonster(start, curr, 3),
            (start, curr) => skills.reducePlayerStamina(start, curr, 2),
            (_, curr) => skills.changeDistance(curr, -1),
          ),
        },
      ],
    },
  ],
  consumable: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
  armor: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
  headgear: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
  footwear: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
  charm: [
    {
      display: "Warrior",
      effects: [],
    },
  ],
};