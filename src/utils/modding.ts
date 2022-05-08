import { EffectFunctionRepository } from "./effectRepository";
import { BuildRepository, effectFunCall, Enemy, EnemyRepository, EnemyStats, Play } from "./types";

export type Globals = {
  debug: boolean;
  trainingEnemy: [Enemy, EnemyStats];
  build?: BuildRepository;
  effects?: EffectFunctionRepository;
  enemies?: EnemyRepository;
  ingame?: {
    game: Play;
    forceUpdate: () => void;
  }
};

const globalsDefault: Globals = {
  debug: false,
  trainingEnemy: [{
    lore: {
      name: "🤖 Dummy 🤖",
    },
    effects: [
      {
        display: "Approve of your life choices",
        tooltip: "You're doing great!",
        priority: 4,
        effects: [effectFunCall(["Monster:Attack", { amount: 0 }])],
        range: []
      },
    ],
    rolls: [
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
  }, {
    hp: { current: 300, max: 300 },
    distance: 0,
    speed: { current: 0, max: 0 },
    attack: { current: 0, max: 0 },
    defence: { current: 0, max: 0 },
    status: {
      dodge: { active: false },
      armor: { amount: 0 },
      bleed: { turns: 0 },
      stun: { active: false },
    },
  }],
}

export const globals = (): Globals =>
  // @ts-ignore
  globalThis.__buildmancer;

export const updateGlobals = (p: Partial<Globals>) => {
  // @ts-ignore
  globalThis.__buildmancer = ({
    ...globalsDefault,
    // @ts-ignore
    ...(globalThis.__buildmancer ?? {}),
    ...p,
  });
}

updateGlobals({});
