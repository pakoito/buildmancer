import React from "react";
import { Player, Enemy } from "../types";

type UpdatePlayerStatsAction = {
  type: "updatePlayerStats";
  stats: Player["stats"];
};

type UpdateEnemyStatsAction = {
  type: "updateEnemyStats";
  id: Enemy["id"];
  stats: Enemy["stats"];
};

type SetSelectedEnemy = {
  type: "setSelectedEnemy";
  id: Enemy["id"];
};

type Action =
  | UpdatePlayerStatsAction
  | UpdateEnemyStatsAction
  | SetSelectedEnemy;

export type GameState = {
  player: Player;
  enemies: Enemy[];
  selectedEnemy: Enemy["id"];
};

function gameReducer(state: GameState, action: Action) {
  switch (action.type) {
    case "updatePlayerStats":
      return {
        ...state,
        player: {
          ...state.player,
          stats: action.stats,
        },
      };
    case "updateEnemyStats":
      return {
        ...state,
        enemies: state.enemies.map((enemy) => {
          if (enemy.id === action.id) {
            return {
              ...enemy,
              stats: action.stats,
            };
          }
          return enemy;
        }),
      };
    case "setSelectedEnemy":
      return {
        ...state,
        selectedEnemy: action.id,
      };
    default:
      return state;
  }
}

function useGame(initialState: GameState) {
  const [state, dispatch] = React.useReducer(gameReducer, initialState);

  const updatePlayerStats = (stats: Player["stats"]) => {
    dispatch({
      type: "updatePlayerStats",
      stats,
    });
  };
  const updateEnemyStats = (id: Enemy["id"], stats: Enemy["stats"]) => {
    dispatch({
      type: "updateEnemyStats",
      id,
      stats,
    });
  };

  const setSelectedEnemy = (id: Enemy["id"]) => {
    dispatch({
      type: "setSelectedEnemy",
      id,
    });
  };
  return {
    ...state,
    updatePlayerStats,
    updateEnemyStats,
    setSelectedEnemy,
  };
}

export default useGame;
