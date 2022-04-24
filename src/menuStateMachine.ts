import WebSocket from 'ws';
import { assign, createMachine, interpret } from 'xstate';
import { inspect } from '@xstate/inspect/lib/server.js';

const isDebug = process.env['SMD'] === '1';

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
  initial: 'random',
  states: {
    random: {
      entry: ['resetSingle'],
      on: {
        ACK: { target: 'play' }
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

const single = {
  initial: 'player',
  states: {
    player: {
      entry: ['resetSingle'],
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
      entry: ['resetArcade'],
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
        LOSE: { target: 'defeat' }
      }
    },
    win: {
      entry: ['bumpVictories'],
      on: {
        always: [
          { target: 'encounter', cond: 'isNotFinal' },
          { target: 'victory', cond: 'isFinal' }
        ]
      }
    },
    victory: {
      type: 'final' as const,
      on: {
        MENU: undefined,
        ACK: { target: '#menus.leaderboards' }
      }
    },
    defeat: {
      type: 'final' as const,
      on: {
        MENU: undefined,
        ACK: { target: '#menus.leaderboards' }
      }
    },
  },
  ...toMenu,
};

const survival = {
  initial: 'player',
  states: {
    player: {
      entry: ['resetSurvival'],
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
        WIN: { target: 'encounter' },
        LOSE: { target: 'defeat' }
      }
    },
    win: {
      entry: ['bumpVictories'],
      on: {
        always: [
          { target: 'encounter' },
        ]
      }
    },
    defeat: {
      type: 'final' as const,
      on: {
        MENU: undefined,
        ACK: { target: '#menus.leaderboards' }
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
        PUZZLE: { target: 'puzzle' },
        LEADERBOARDS: { target: 'leaderboards' },
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
    puzzle: {
      ...puzzle,
    },
    leaderboards: {
      ...toMenu,
    }
  },
}, {
  guards: {
    isFinal: ({ arcadeContext: { victories } }) => victories >= 7,
    isNotFinal: ({ arcadeContext: { victories } }) => victories < 7,
  },
  actions: {
    bumpVictories: assign({
      arcadeContext: ({ arcadeContext }, _event) => ({ ...arcadeContext, victories: arcadeContext.victories + 1 }),
    }),
    resetSurvival: assign({
      survivalContext: (c, e) => makeSurvivalContext(),
    }),
    resetArcade: assign({
      arcadeContext: (c, e) => makeArcadeContext(),
    }),
    resetSingle: assign({
      singleContext: (c, e) => makeSingleContext(),
    }),
  }
});

if (isDebug) {
  interpret(gameMenuMachine, { devTools: true })
    .onTransition((state) => console.log(state))
    .start();
}
