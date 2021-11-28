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
      entry: ['resetContext'],
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
      entry: ['resetContext'],
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

const gameContext = {
  seed: Math.random(),
}
const arcadeContext = {
  victories: 0,
  score: 0,
};
const survivalContext = {
  victories: 0,
};

const gameMenuMachine = createMachine({
  id: 'menus',
  initial: 'main',
  context: {
    ...gameContext,
    ...arcadeContext,
    ...survivalContext,
  },
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
    isFinal: ({ victories }) => victories >= 7,
    isNotFinal: ({ victories }) => victories < 7,
  },
  actions: {
    bumpVictories: assign({
      victories: ({ victories }, _event) => victories + 1,
    }),
    resetContext: assign({ ...survivalContext, ...arcadeContext, seed: Math.random() }),
  }
});

if (isDebug) {
  interpret(gameMenuMachine, { devTools: true })
    .onTransition((state) => console.log(state))
    .start();
}
