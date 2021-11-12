import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, Player } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { handlePlayerEffect, Play, setSelected } from "./playGame";
import { Chance } from "chance";
import { start } from "./tinkerer";


type AppStatus = "buildPlayer" | "buildEncounter" | "game" | "endGame";

const chance = new Chance();

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
    setGame(start(game, 10, "PACO").phenotype);
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
        <Game game={game} setSelected={(idx) => setGame(setSelected(game, idx))} handlePlayerEffect={(idx) => setGame(handlePlayerEffect(game, idx, chance))} />
      ) : null}
    </div>
  );
}

export default App;
