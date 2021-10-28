import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, Player } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";


type AppStatus = "buildPlayer" | "buildEncounter" | "game" | "endGame";

function App() {
  const [status, setStatus] = React.useState<AppStatus>("buildPlayer");
  const [player, setPlayerBuild] = React.useState<
    Player | undefined
  >();

  const [encounter, setEncounter] = React.useState<Enemies>();

  const handleSavePlayer = (player: Player) => {
    setPlayerBuild(player);
    setStatus("buildEncounter");
  };
  const handleSaveEncounter = (encounter: Enemies) => {
    setEncounter(encounter);
    setStatus("game");
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
      {status === "game" && player && encounter ? (
        <Game
          player={player}
          enemies={encounter}
        />
      ) : null}
    </div>
  );
}

export default App;
