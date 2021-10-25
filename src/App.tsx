import React from "react";
import "./App.css";
// import { readString } from "react-papaparse";
import { Enemy, Player } from "./types";

import "bootstrap/dist/css/bootstrap.min.css";
import Game from "./components/Game";
import PlayerBuilder from "./components/PlayerBuilder";

const enemies: Enemy[] = [
  {
    id: "m-1",
    lore: {
      name: "Sacapuntas",
    },
    stats: {
      hp: 25,
      rage: 0,
      distance: 5,
    },
  },
  {
    id: "m-2",
    lore: {
      name: "Sacapuntas",
    },
    stats: {
      hp: 25,
      rage: 0,
      distance: 5,
    },
  },
  {
    id: "m-3",
    lore: {
      name: "Sacapuntas",
    },
    stats: {
      hp: 25,
      rage: 0,
      distance: 5,
    },
  },
];

type AppStatus = "buildingPlayer" | "game" | "endGame";

function App() {
  const [status, setStatus] = React.useState<AppStatus>("buildingPlayer");
  const [initialGameState, setInitialGameState] = React.useState<
    { player: Player; enemies: Enemy[] } | undefined
  >();

  const handleSavePlayer = (player: Player) => {
    setInitialGameState({
      player,
      enemies,
    });
    setStatus("game");
  };
  return (
    <div className="App">
      {status === "buildingPlayer" ? (
        <PlayerBuilder onSave={handleSavePlayer} />
      ) : null}
      {status === "game" && initialGameState ? (
        <Game
          player={initialGameState.player}
          enemies={initialGameState.enemies}
        />
      ) : null}
    </div>
  );
}

export default App;
