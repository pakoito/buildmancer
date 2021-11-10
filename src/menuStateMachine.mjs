import WebSocket from 'ws';
import { createMachine, interpret } from 'xstate';
import { inspect } from '@xstate/inspect/lib/server.js';

inspect({
  server: new WebSocket.Server({
    port: 8888
  })
});

const gameMenuMachine = createMachine({
  id: 'menus',
  initial: 'main',
  states: {
    main: {
      on: {
        QUICK: { target: 'quick' },
        ARCADE: { target: 'arcade' },
        SURVIVAL: { target: 'survival' },
        PUZZLE: { target: 'puzzle' },
      }
    },
    quick: {},
    arcade: {},
    survival: {},
    puzzle: {},
  }
});

interpret(gameMenuMachine, { devTools: true })
  .onTransition((state) => console.log(state))
  .start();
