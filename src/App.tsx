import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, Player } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { handlePlayerEffect, Play, turnDeterministicRng, setSelected } from "./playGame";
import tinkerer, { defaultTinkererOptions } from "./tinkerer/tinkerer";
import { Seq } from "immutable";

type AppStatus = "buildPlayer" | "buildEncounter" | "game" | "endGame";

function App() {
  const [status, setStatus] = React.useState<AppStatus>("buildPlayer");
  const [player, setPlayerBuild] = React.useState<
    Player | undefined
  >();
  const [encounter, setEncounter] = React.useState<Enemies>();
  const [game, setGame] = React.useState<Play | undefined>();

  const handleSavePlayer = (player: Player) => {
    setPlayerBuild(player);
    setStatus("buildEncounter");
  };
  const handleSaveEncounter = (encounter: Enemies) => {
    setEncounter(encounter);
    setStatus("game");
  }

  if (!game && player && encounter) {
    const game = play(player, encounter);
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
          setSelected={(idx) => setGame(setSelected(game, idx))}
          handlePlayerEffect={(idx) => setGame(handlePlayerEffect(game, idx, turnDeterministicRng(50, 10, 'SEED')))}
          solveGame={() => setGame(Seq(tinkerer(game, 150, 'SEED', { ...defaultTinkererOptions, turns: 50 - game.states.length })).maxBy(a => a.score)!!.phenotype)}
        />
      ) : null}
    </div>
  );
}

export default App;
