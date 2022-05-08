import './App.css';
// import { readString } from "react-papaparse";
import {
  Snapshot,
  Play,
  EnemyStats,
  Enemy,
  EnemiesStats,
  Enemies,
} from './game/types';

import 'bootstrap/dist/css/bootstrap.min.css';
import PlayerBuilder from './components/PlayerBuilder';
import EncounterBuilder from './components/EncounterBuilder';
import { makeGameNew, makeGameNextLevel, PlayState } from './game/playGame';
import { dummyEnemy, randomEnemy, randomPlayer } from './game/data';
import { useMachine } from '@xstate/react';
import { gameMenuMachine } from './stateMachines/menuStateMachine';
import Menu from './components/menus/Menu';
import SingleGame from './components/menus/SingleGame';
import LoadScreen from './components/menus/LoadScreen';

function App() {
  const [state, send] = useMachine(gameMenuMachine, { devTools: true });
  const event = state.event;
  const onMenu = () => {
    send('MENU');
  };

  switch (true) {
    case state.matches('main'):
      return (
        <Menu
          title={'Main Menu'}
          states={Object.keys(gameMenuMachine.states.main.on)}
          onClick={send}
        />
      );
    // QUICK
    case state.matches({ quick: 'play' }): {
      const player = randomPlayer();
      const encounter = randomEnemy();
      return (
        <SingleGame
          play={makeGameNew(
            player[0],
            player[1],
            [encounter[0]],
            [encounter[1]],
            50,
            state.context.singleContext.seed
          )}
          onMenu={onMenu}
          timeTravel={true}
          onGameEnd={(result, game) => {
            send(result === 'win' ? 'WIN' : 'LOSE', { result, game });
          }}
        />
      );
    }
    case state.matches({ quick: 'win' }):
    case state.matches({ quick: 'lose' }):
      return (
        <Menu
          title={`${event.result} in ${event.game.states.length - 1} turns`}
          states={['MENU']}
          onClick={send}
        />
      );
    // SINGLE
    case state.matches({ single: 'player' }):
      return (
        <PlayerBuilder
          onSave={(player, playerStats) => {
            send('PLAYER', { player: [player, playerStats] });
          }}
        />
      );
    case state.matches({ single: 'encounter' }):
      return (
        <EncounterBuilder
          player={event.player[0]}
          onSave={(enemies, enemiesStats) => {
            send('ENCOUNTER', {
              encounter: [enemies, enemiesStats],
              player: event.player,
            });
          }}
        />
      );
    case state.matches({ single: 'play' }): {
      return (
        <SingleGame
          play={makeGameNew(
            event.player[0],
            event.player[1],
            event.encounter[0],
            event.encounter[1],
            50,
            state.context.singleContext.seed
          )}
          onMenu={onMenu}
          timeTravel={true}
          onGameEnd={(result, game) => {
            send(result === 'win' ? 'WIN' : 'LOSE', { result, game });
          }}
        />
      );
    }
    case state.matches({ single: 'win' }):
    case state.matches({ single: 'lose' }):
      return (
        <Menu
          title={`${event.result} in ${event.game.states.length - 1} turns`}
          states={['MENU']}
          onClick={send}
        />
      );
    // TRAINING
    case state.matches({ training: 'player' }):
      return (
        <PlayerBuilder
          onSave={(player, playerStats) => {
            send('PLAYER', { player: [player, playerStats] });
          }}
        />
      );
    case state.matches({ training: 'play' }): {
      const player = randomPlayer();
      const encounter = dummyEnemy();
      return (
        <SingleGame
          play={makeGameNew(
            player[0],
            player[1],
            [encounter[0]],
            [encounter[1]],
            50,
            state.context.singleContext.seed
          )}
          onMenu={onMenu}
          timeTravel={true}
          onGameEnd={(result, game) => {
            send(result === 'win' ? 'WIN' : 'LOSE', { result, game });
          }}
        />
      );
    }
    case state.matches({ training: 'win' }):
    case state.matches({ training: 'lose' }):
      return (
        <Menu
          title={`You have dealt a lot of damage! Well done 💯`}
          states={['MENU']}
          onClick={send}
        />
      );
    // ARCADE
    case state.matches({ arcade: 'player' }): {
      const encounter = randomEnemy();
      return (
        <PlayerBuilder
          onSave={(player, playerStats) => {
            send('PLAYER', {
              game: makeGameNew(
                player,
                playerStats,
                [encounter[0]],
                [encounter[1]],
                50,
                state.context.survivalContext.seed
              ),
            });
          }}
        />
      );
    }
    case state.matches({ arcade: 'play' }): {
      return (
        <SingleGame
          play={event.game}
          timeTravel={false}
          onMenu={onMenu}
          onGameEnd={(result: PlayState, game: Play) => {
            let encounter = [[], []] as [Enemy[], EnemyStats[]];
            if (state.context.arcadeContext.victories >= 0) {
              const otherEnemy = randomEnemy();
              encounter = [
                [...encounter[0], otherEnemy[0]],
                [...encounter[1], otherEnemy[1]],
              ];
            }
            if (state.context.arcadeContext.victories >= 2) {
              const otherEnemy = randomEnemy();
              encounter = [
                [...encounter[0], otherEnemy[0]],
                [...encounter[1], otherEnemy[1]],
              ];
            }
            if (state.context.arcadeContext.victories >= 5) {
              const otherEnemy = randomEnemy();
              encounter = [
                [...encounter[0], otherEnemy[0]],
                [...encounter[1], otherEnemy[1]],
              ];
            }
            const firstState: Snapshot = game.states[0];
            send(result === 'win' ? 'WIN' : 'LOSE', {
              result,
              game: makeGameNextLevel(
                game.player,
                firstState.player,
                encounter[0] as Enemies,
                encounter[1] as EnemiesStats,
                {},
                50,
                state.context.survivalContext.seed
              ),
            });
          }}
        />
      );
    }
    case state.matches({ arcade: 'victory' }): {
      return (
        <Menu
          title={`🎉🎉VICTORY!🎉🎉 Final score: ${state.context.arcadeContext.score}`}
          states={['MENU']}
          onClick={send}
        />
      );
    }
    case state.matches({ arcade: 'defeat' }): {
      return (
        <Menu
          title={`Failed after ${state.context.arcadeContext.victories} victories`}
          states={['MENU']}
          onClick={send}
        />
      );
    }
    // SURVIVAL
    case state.matches({ survival: 'player' }): {
      const encounter = randomEnemy();
      return (
        <PlayerBuilder
          onSave={(player, playerStats) => {
            send('PLAYER', {
              game: makeGameNew(
                player,
                playerStats,
                [encounter[0]],
                [encounter[1]],
                50,
                state.context.survivalContext.seed
              ),
            });
          }}
        />
      );
    }
    case state.matches({ survival: 'play' }): {
      return (
        <SingleGame
          play={event.game}
          onMenu={onMenu}
          timeTravel={false}
          onGameEnd={(result, game) => {
            const encounter = randomEnemy();
            const lastState: Snapshot =
              game.states[event.game.states.length - 1];
            send(result === 'win' ? 'WIN' : 'LOSE', {
              result,
              game: makeGameNextLevel(
                game.player,
                lastState.player,
                [encounter[0]],
                [encounter[1]],
                lastState.inventory,
                50,
                state.context.survivalContext.seed
              ),
            });
          }}
        />
      );
    }
    case state.matches({ survival: 'defeat' }): {
      return (
        <Menu
          title={`Completed after ${state.context.survivalContext.victories} victories`}
          states={['MENU']}
          onClick={send}
        />
      );
    }
    // LOAD
    case state.matches({ load: 'load' }): {
      return (
        <LoadScreen onLoad={(game) => send('LOAD', { game })} onMenu={onMenu} />
      );
    }
    case state.matches({ load: 'play' }): {
      return (
        <SingleGame
          play={event.game}
          onMenu={onMenu}
          timeTravel={true}
          onGameEnd={(result, game) => {
            send(result === 'win' ? 'WIN' : 'LOSE', { result, game });
          }}
        />
      );
    }
    case state.matches({ load: 'win' }):
    case state.matches({ load: 'lose' }):
      return (
        <Menu
          title={`${event.result} in ${event.game.states.length - 1} turns`}
          states={['MENU']}
          onClick={send}
        />
      );
    default:
      return <>{JSON.stringify(state.value)}</>;
  }
}

export default App;
