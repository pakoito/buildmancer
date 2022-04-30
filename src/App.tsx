import React, { useCallback, useEffect } from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Snapshot, Play } from "./utils/types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { handlePlayerEffect, PlayState, playState, setDisabledSkills, setSelected } from "./utils/playGame";
import tinkerer from "./tinkerer/tinkerer";
import { Seq } from "immutable";
import { previousState, randomEnemy, randomPlayer } from "./utils/data";
import { useMachine } from '@xstate/react';
import { gameMenuMachine } from "./menuStateMachine";
import Menu from "./components/menus/Menu";

function App() {
  const player = randomPlayer();
  const [state, send] = useMachine(gameMenuMachine, { devTools: true });
  const event = state.event;

  switch (true) {
    case state.matches('main'):
      return <Menu
        title={"Main Menu"}
        states={Object.keys(gameMenuMachine.states.main.on)}
        onClick={send}
      />;
    // QUICK
    case state.matches({ quick: 'play' }): {
      const player = randomPlayer();
      const encounter = randomEnemy();
      return <SingleGame
        play={play(player[0], player[1], [encounter[0]], [encounter[1]], 50, state.context.singleContext.seed)}
        timeTravel={true}
        onGameEnd={(result, game) => { send(result === 'win' ? 'WIN' : 'LOSE', { result, game }) }}
      />;
    }
    case state.matches({ quick: 'win' }):
    case state.matches({ quick: 'lose' }):
      return <Menu
        title={`${event.result} in ${event.game.states.length - 1} turns`}
        states={["MENU"]}
        onClick={send}
      />;
    // SINGLE
    case state.matches({ single: 'player' }):
      return <PlayerBuilder onSave={(player, playerStats) => { send('PLAYER', { player: [player, playerStats] }); }} />;
    case state.matches({ single: 'encounter' }):
      return <EncounterBuilder
        player={player[0]}
        onSave={(enemies, enemiesStats) => { send('ENCOUNTER', { encounter: [enemies, enemiesStats], player: event.player }) }}
      />;
    case state.matches({ single: 'play' }): {
      return <SingleGame
        play={play(event.player[0], event.player[1], event.encounter[0], event.encounter[1], 50, state.context.singleContext.seed)}
        timeTravel={true}
        onGameEnd={(result, game) => { send(result === 'win' ? 'WIN' : 'LOSE', { result, game }) }}
      />;
    }
    case state.matches({ single: 'win' }):
    case state.matches({ single: 'lose' }):
      return <Menu
        title={`${event.result} in ${event.game.states.length - 1} turns`}
        states={["MENU"]}
        onClick={send}
      />;
    // ARCADE
    case state.matches({ arcade: 'player' }): {
      const encounter = randomEnemy();
      return <PlayerBuilder onSave={(player, playerStats) => { send('PLAYER', { game: play(player, playerStats, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) }); }} />;
    }
    case state.matches({ arcade: 'play' }): {
      return <SingleGame
        play={event.game}
        timeTravel={false}
        onGameEnd={(result: PlayState, game: Play) => {
          const encounter = randomEnemy();
          const firstState: Snapshot = game.states[0];
          send(result === 'win' ? 'WIN' : 'LOSE', { result, game: play(game.player, firstState.player, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) });
        }}
      />;
    }
    case state.matches({ arcade: 'victory' }): {
      return <Menu
        title={`VICTORY!`}
        states={["MENU"]}
        onClick={send}
      />;
    }
    case state.matches({ arcade: 'defeat' }): {
      return <Menu
        title={`Failed after ${state.context.arcadeContext.victories} victories`}
        states={["MENU"]}
        onClick={send}
      />;
    }
    // SURVIVAL
    case state.matches({ survival: 'player' }): {
      const encounter = randomEnemy();
      return <PlayerBuilder onSave={(player, playerStats) => { send('PLAYER', { game: play(player, playerStats, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) }); }} />;
    }
    case state.matches({ survival: 'play' }): {
      return <SingleGame
        play={event.game}
        timeTravel={false}
        onGameEnd={(result, game) => {
          const encounter = randomEnemy();
          const lastState: Snapshot = game.states[event.game.states.length - 1];
          send(result === 'win' ? 'WIN' : 'LOSE', { result, game: play(game.player, lastState.player, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) });
        }}
      />;
    }
    case state.matches({ survival: 'defeat' }): {
      return <Menu
        title={`Completed after ${state.context.survivalContext.victories} victories`}
        states={["MENU"]}
        onClick={send}
      />;
    }
    default:
      return <>{JSON.stringify(state.value)}</>;
  }
}

const SingleGame = ({ play, timeTravel, onGameEnd }: { play: Play; timeTravel: boolean, onGameEnd: (state: PlayState, play: Play) => void }) => {
  const [game, setGame] = React.useState<Play>(play);
  const [redo, setRedo] = React.useState<Snapshot[]>([]);

  useEffect(() => {
    setGame(play);
  }, [play]);

  useEffect(() => {
    const gameState = playState(game);
    const hasEnded = gameState !== 'playing';
    if (hasEnded) {
      onGameEnd(gameState, game);
    }
  }, [game]);

  const timeTravelObj = timeTravel ? {
    redo: redo.length > 0 ? (() => {
      const newRedo = [...redo];
      const latest = newRedo.pop() as Snapshot;
      setRedo(newRedo);
      setGame({ ...game, states: [...game.states, latest] });
    }) : undefined,
    undo: () => {
      setRedo([...redo, previousState(game)]);
      setGame({ ...game, states: [game.states[0], ...game.states.slice(1, -1)] });
    }
  } : undefined;

  return (<Game
    game={game}
    timeTravel={timeTravelObj}
    setSelected={(idx) => { setRedo([]); setGame(setSelected(game, idx)); }}
    setDisabledSkills={(disabled) => { setRedo([]); setGame(setDisabledSkills(game, disabled)) }}
    handlePlayerEffect={(idx) => { setRedo([]); setGame(handlePlayerEffect(game, idx)); }}
    solveGame={(iterations) => setGame(Seq(tinkerer(game, iterations, { turns: game.turns - game.states.length })).maxBy(a => a.score)!!.phenotype)}
    hint={(iterations) =>
      setGame({
        ...game,
        states: [...game.states, Seq(tinkerer(game, iterations, { turns: game.turns - game.states.length })).maxBy(a => a.score)!!.phenotype.states[game.states.length]]
      })
    }
  />
  );
}

export default App;
