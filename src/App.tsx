import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemies, Player } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";
import EncounterBuilder from "./components/EncounterBuilder";
import play, { Play } from "./play_game";
import { Chance } from "chance";


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
  const makeReactGame = (game: Play): Play => ({
    ...game,
    handlePlayerEffect: (idx) => {
      const newGame = game.handlePlayerEffect(idx);
      setGame(makeReactGame(newGame));
      return newGame;
    },
    setSelected: (idx) => {
      const newGame = game.setSelected(idx);
      setGame(makeReactGame(newGame));
      return newGame;
    },
  });

  if (!game && player && encounter) {
    const game = play(player, encounter, new Chance());
    setGame(makeReactGame(game));
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
        <Game game={game} />
      ) : null}
    </div>
  );
}

export default App;
