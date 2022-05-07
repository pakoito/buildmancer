import React, { useState } from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Snapshot, Play, EnemyStats, Enemy, EnemiesStats, Enemies } from "./utils/types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import { makeGameNew, makeGameNextLevel, handlePlayerEffect, PlayState, playState, setDisabledSkills, setSelected } from "./utils/playGame";
import tinkerer from "./tinkerer/tinkerer";
import { Seq } from "immutable";
import { previousState, randomEnemy, randomPlayer } from "./utils/data";
import { useMachine } from '@xstate/react';
import { gameMenuMachine } from "./stateMachines/menuStateMachine";
import Menu from "./components/menus/Menu";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";

function App() {
  const [state, send] = useMachine(gameMenuMachine, { devTools: true });
  const event = state.event;
  const onMenu = () => {
    send('MENU');
  }

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
        play={makeGameNew(player[0], player[1], [encounter[0]], [encounter[1]], 50, state.context.singleContext.seed)}
        onMenu={onMenu}
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
        player={event.player[0]}
        onSave={(enemies, enemiesStats) => { send('ENCOUNTER', { encounter: [enemies, enemiesStats], player: event.player }) }}
      />;
    case state.matches({ single: 'play' }): {
      return <SingleGame
        play={makeGameNew(event.player[0], event.player[1], event.encounter[0], event.encounter[1], 50, state.context.singleContext.seed)}
        onMenu={onMenu}
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
      return <PlayerBuilder onSave={(player, playerStats) => { send('PLAYER', { game: makeGameNew(player, playerStats, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) }); }} />;
    }
    case state.matches({ arcade: 'play' }): {
      return <SingleGame
        play={event.game}
        timeTravel={false}
        onMenu={onMenu}
        onGameEnd={(result: PlayState, game: Play) => {
          let encounter = [[], []] as [Enemy[], EnemyStats[]];
          if (state.context.arcadeContext.victories >= 0) {
            const otherEnemy = randomEnemy();
            encounter = [[...encounter[0], otherEnemy[0]], [...encounter[1], otherEnemy[1]]];
          }
          if (state.context.arcadeContext.victories >= 2) {
            const otherEnemy = randomEnemy();
            encounter = [[...encounter[0], otherEnemy[0]], [...encounter[1], otherEnemy[1]]];
          }
          if (state.context.arcadeContext.victories >= 5) {
            const otherEnemy = randomEnemy();
            encounter = [[...encounter[0], otherEnemy[0]], [...encounter[1], otherEnemy[1]]];
          }
          const firstState: Snapshot = game.states[0];
          send(result === 'win' ? 'WIN' : 'LOSE', { result, game: makeGameNextLevel(game.player, firstState.player, encounter[0] as Enemies, encounter[1] as EnemiesStats, 50, state.context.survivalContext.seed) });
        }}
      />;
    }
    case state.matches({ arcade: 'victory' }): {
      return <Menu
        title={`🎉🎉VICTORY!🎉🎉 Final score: ${state.context.arcadeContext.score}`}
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
      return <PlayerBuilder onSave={(player, playerStats) => { send('PLAYER', { game: makeGameNew(player, playerStats, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) }); }} />;
    }
    case state.matches({ survival: 'play' }): {
      return <SingleGame
        play={event.game}
        onMenu={onMenu}
        timeTravel={false}
        onGameEnd={(result, game) => {
          const encounter = randomEnemy();
          const lastState: Snapshot = game.states[event.game.states.length - 1];
          send(result === 'win' ? 'WIN' : 'LOSE', { result, game: makeGameNextLevel(game.player, lastState.player, [encounter[0]], [encounter[1]], 50, state.context.survivalContext.seed) });
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
    // LOAD
    case state.matches({ load: 'load' }): {
      return <LoadScreen
        onLoad={(game) => send('LOAD', { game })}
        onMenu={onMenu}
      />;
    }
    case state.matches({ load: 'play' }): {
      return <SingleGame
        play={event.game}
        onMenu={onMenu}
        timeTravel={true}
        onGameEnd={(result, game) => { send(result === 'win' ? 'WIN' : 'LOSE', { result, game }) }}
      />;
    }
    case state.matches({ load: 'win' }):
    case state.matches({ load: 'lose' }):
      return <Menu
        title={`${event.result} in ${event.game.states.length - 1} turns`}
        states={["MENU"]}
        onClick={send}
      />;
    default:
      return <>{JSON.stringify(state.value)}</>;
  }
}

const LoadScreen = ({ onLoad, onMenu }: { onLoad: (g: Play) => void; onMenu: () => void }) => {
  const [loadError, setLoadError] = useState<string | undefined>();
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    const load = (data: string) => {
      try {
        const play = JSON.parse(data) as Play;
        onLoad(play);
      } catch (e) {
        setLoadError("Failed to Load");
      }
    }
    if (e.target?.fileData?.files[0] != null) {
      const reader = new FileReader();
      reader.onloadend = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result as string;
        if (result != null) {
          load(result);
        } else {
          setLoadError("Failed to read file");
        }
      };
      reader.readAsText(e.target.fileData.files[0])
    } else if (e.target?.rawData?.value != null) {
      load(e.target.rawData.value);
    }
  };
  return <Form onSubmit={onFormSubmit}>
    <Col>
      <Row>
        {loadError && (<Alert variant={'danger'}>{loadError}</Alert>)}
      </Row>
      <Row>
        <Form.Group>
          <Form.Label>Load File</Form.Label>
          <Form.Control type="file" name="fileData" accept=".json" />
          <Form.Text muted>Select the file to load</Form.Text>
        </Form.Group>
      </Row>
      <Row>
        <Form.Group>
          <Form.Label>Load</Form.Label>
          <Form.Control name="rawData" as="textarea" rows={3} placeholder="Save Data" />
          <Form.Text muted>Paste the text of your savegame here</Form.Text>
          <br />
        </Form.Group>
      </Row>
      <Button variant="primary" type="submit">Load</Button>
    </Col>
    <Button onClick={onMenu}>MAIN MENU</Button>
  </Form>;
}

const SingleGame = ({ play, timeTravel, onGameEnd, onMenu }: { play: Play; timeTravel: boolean, onGameEnd: (state: PlayState, play: Play) => void, onMenu: () => void }) => {
  const [game, setGame] = React.useState<Play>(play);
  const [redo, setRedo] = React.useState<Snapshot[]>([]);

  React.useEffect(() => {
    setGame(play);
  }, [play]);

  React.useEffect(() => {
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
    onMenu={onMenu}
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
