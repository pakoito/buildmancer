import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, Player, Snapshot } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { handlePlayerEffect, Play, setSelected } from "./playGame";
import tinkerer from "./tinkerer/tinkerer";
import { Seq } from "immutable";
import { previousState } from "./utils/data";

type AppStatus = "buildPlayer" | "buildEncounter" | "game" | "endGame";

function App() {
  const [status, setStatus] = React.useState<AppStatus>("buildPlayer");
  const [player, setPlayerBuild] = React.useState<
    Player | undefined
  >();
  const [encounter, setEncounter] = React.useState<Enemies>();
  const [game, setGame] = React.useState<Play | undefined>();
  const [redo, setRedo] = React.useState<Snapshot[]>([]);

  const handleSavePlayer = (player: Player) => {
    setPlayerBuild(player);
    setStatus("buildEncounter");
  };
  const handleSaveEncounter = (encounter: Enemies) => {
    setEncounter(encounter);
    setStatus("game");
  }

  if (!game && player && encounter) {
    const game = play(player, encounter, 50, 'PACC');
    setGame(game);
  }

  return (
    <div className="App">
      {status === "buildPlayer" ? (
        <PlayerBuilder onSave={handleSavePlayer} />
      ) : null}
      {status === "buildEncounter" && player ? (
        <EncounterBuilder
          player={player}
          onSave={handleSaveEncounter}
        />
      ) : null}
      {status === "game" && game ? (
        <Game
          game={game}
          redo={redo.length > 0 ? (() => {
            const newRedo = [...redo];
            const latest = newRedo.pop() as Snapshot;
            setRedo(newRedo);
            setGame({ ...game, states: [...game.states, latest] });
          }) : undefined}
          undo={() => {
            setRedo([...redo, previousState(game)]);
            setGame({ ...game, states: [game.states[0], ...game.states.slice(1, -1)] });
          }}
          setSelected={(idx) => { setRedo([]); setGame(setSelected(game, idx)); }}
          handlePlayerEffect={(idx) => { setRedo([]); setGame(handlePlayerEffect(game, idx)); }}
          solveGame={(iterations) => setGame(Seq(tinkerer(game, iterations, { turns: 50 - game.states.length })).maxBy(a => a.score)!!.phenotype)}
        />
      ) : null}
    </div>
  );
}

export default App;
