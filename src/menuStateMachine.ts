import WebSocket from 'ws';
import { assign, createMachine, interpret } from 'xstate';
import { inspect } from '@xstate/inspect/lib/server.js';
import { scoreGame } from './utils/playGame';

const isDebug = process && process.env['SMD'] === '1';

if (isDebug) {
  inspect({
    server: new WebSocket.Server({
      port: 8888
    })
  });
}

const toMenu = {
  on: {
    MENU: { target: 'main' },
  }
}

const quick = {
  initial: 'play',
  states: {
    play: {
      entry: ['reset'],
      on: {
        WIN: { target: 'win' },
        LOSE: { target: 'lose' }
      }
    },
    win: { type: 'final' as const },
    lose: { type: 'final' as const },
  },
  ...toMenu,
};

const single = {
  initial: 'player',
  states: {
    player: {
      entry: ['reset'],
      on: {
        PLAYER: { target: 'encounter' }
      }
    },
    encounter: {
      on: {
        ENCOUNTER: { target: 'play' }
      }
    },
    play: {
      on: {
        WIN: { target: 'win' },
        LOSE: { target: 'lose' }
      }
    },
    win: { type: 'final' as const },
    lose: { type: 'final' as const },
  },
  ...toMenu,
};

const arcade = {
  initial: 'player',
  states: {
    player: {
      entry: ['reset'],
      on: {
        PLAYER: { target: 'play' }
      }
    },
    play: {
      on: {
        WIN: [
          { target: 'victory', cond: 'isFinal' },
          { target: 'play', actions: ['bumpVictories', 'bumpScore'], internal: true },
        ],
        LOSE: { target: 'defeat' }
      }
    },
    victory: {
      type: 'final' as const,
    },
    defeat: {
      type: 'final' as const,
    },
  },
  ...toMenu,
};

const survival = {
  initial: 'player',
  states: {
    player: {
      entry: ['reset'],
      on: {
        PLAYER: { target: 'play' }
      }
    },
    play: {
      on: {
        WIN: { target: 'play', actions: ['bumpVictories'] },
        LOSE: { target: 'defeat' }
      }
    },
    defeat: {
      type: 'final' as const,
      on: {
        // ACK: { target: '#menus.leaderboards' }
      }
    },
  },
  ...toMenu,
};

const puzzle = {
  initial: 'puzzle',
  states: {
    puzzle: {
      on: {
        PLAYER: { target: 'player' }
      }
    },
    player: {
      on: {
        SELECTED: { target: 'play' }
      }
    },
    play: {
      on: {
        COMPLETE: { target: 'complete' },
      }
    },
    complete: {
      on: {
        NEXT: { target: 'player' },
        SELECT: { target: 'puzzle' },
      }
    },
  },
  ...toMenu,
};

const makeArcadeContext = () => ({
  victories: 0,
  score: 0,
  seed: Math.random(),
});
const makeSurvivalContext = () => ({
  victories: 0,
  seed: Math.random(),
});
const makeSingleContext = () => ({
  seed: Math.random(),
});
const makeGameContext = () => ({
  arcadeContext: makeArcadeContext(),
  survivalContext: makeSurvivalContext(),
  singleContext: makeSingleContext(),
});

export const gameMenuMachine = createMachine({
  tsTypes: {} as import("./menuStateMachine.typegen").Typegen0,
  id: 'menus',
  initial: 'main',
  context: makeGameContext(),
  states: {
    main: {
      on: {
        QUICK: { target: 'quick' },
        SINGLE: { target: 'single' },
        ARCADE: { target: 'arcade' },
        SURVIVAL: { target: 'survival' },
        // PUZZLE: { target: 'puzzle' },
        // LEADERBOARDS: { target: 'leaderboards' },
      }
    },
    quick: {
      ...quick,
    },
    single: {
      ...single,
    },
    arcade: {
      ...arcade,
    },
    survival: {
      ...survival,
    },
    // puzzle: {
    //   ...puzzle,
    // },
    // leaderboards: {
    //   ...toMenu,
    // }
  },
}, {
  guards: {
    isFinal: ({ arcadeContext: { victories } }) => victories + 1 >= 7,
  },
  actions: {
    bumpVictories: assign({
      arcadeContext: ({ arcadeContext }, _event) => ({ ...arcadeContext, victories: arcadeContext.victories + 1, seed: Math.random() }),
      survivalContext: ({ survivalContext }, _event) => ({ ...survivalContext, victories: survivalContext.victories + 1, seed: Math.random() }),
    }),
    bumpScore: assign({
      arcadeContext: ({ arcadeContext }, { game }) => ({ ...arcadeContext, score: arcadeContext.score + scoreGame(game), seed: Math.random() }),
    }),
    reset: assign({
      survivalContext: (c, e) => makeSurvivalContext(),
      arcadeContext: (c, e) => makeArcadeContext(),
      singleContext: (c, e) => makeSingleContext(),
    }),
  }
});

if (isDebug) {
  interpret(gameMenuMachine, { devTools: true })
    .onTransition((state) => console.log(state))
    .start();
}
