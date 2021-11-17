import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, EnemiesStats, Player, PlayerStats, Snapshot, Play } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { handlePlayerEffect, setSelected } from "./playGame";
import tinkerer from "./tinkerer/tinkerer";
import { Seq } from "immutable";
import { previousState } from "./utils/data";

type AppStatus = "buildPlayer" | "buildEncounter" | "game" | "endGame";

function App() {
  const [status, setStatus] = React.useState<AppStatus>("buildPlayer");
  const [playerBuild, setPlayerBuild] = React.useState<
    [Player, PlayerStats] | undefined
  >();
  const [encounterBuild, setEncounter] = React.useState<[Enemies, EnemiesStats]>();
  const [game, setGame] = React.useState<Play | undefined>();
  const [redo, setRedo] = React.useState<Snapshot[]>([]);

  const handleSavePlayer = (player: Player, playerStats: PlayerStats) => {
    setPlayerBuild([player, playerStats]);
    setStatus("buildEncounter");
  };
  const handleSaveEncounter = (encounter: Enemies, encounterStats: EnemiesStats) => {
    setEncounter([encounter, encounterStats]);
    setStatus("game");
  }

  if (!game && playerBuild && encounterBuild) {
    const [player, playerStats] = playerBuild;
    const [encounter, encounterStats] = encounterBuild;
    const game = play(player, playerStats, encounter, encounterStats, 50, 'PACC');
    setGame(game);
  }

  return (
    <div className="App">
      {status === "buildPlayer" ? (
        <PlayerBuilder onSave={handleSavePlayer} />
      ) : null}
      {status === "buildEncounter" && playerBuild ? (
        <EncounterBuilder
          player={playerBuild[0]}
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
          solveGame={(iterations) => setGame(Seq(tinkerer(game, iterations, { turns: game.turns - game.states.length })).maxBy(a => a.score)!!.phenotype)}
          hint={(iterations) =>
            setGame({
              ...game,
              states: [...game.states, Seq(tinkerer(game, iterations, { turns: game.turns - game.states.length })).maxBy(a => a.score)!!.phenotype.states[game.states.length]]
            })
          }
        />
      ) : null}
    </div>
  );
}

export default App;
