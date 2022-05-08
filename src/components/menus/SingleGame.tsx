import { Seq } from 'immutable';
import React from 'react';
import { findBestPlay } from '../../game/tinkerer';
import { previousState } from '../../game/data';
import {
  PlayState,
  playState,
  setSelected,
  setDisabledSkills,
  handlePlayerEffect,
} from '../../game/playGame';
import { Play, Snapshot } from '../../game/types';
import Game from '../Game';

const SingleGame = ({
  play,
  timeTravel,
  onGameEnd,
  onMenu,
}: {
  play: Play;
  timeTravel: boolean;
  onGameEnd: (state: PlayState, play: Play) => void;
  onMenu: () => void;
}) => {
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

  const timeTravelObj = timeTravel
    ? {
        redo:
          redo.length > 0
            ? () => {
                const newRedo = [...redo];
                const latest = newRedo.pop() as Snapshot;
                setRedo(newRedo);
                setGame({ ...game, states: [...game.states, latest] });
              }
            : undefined,
        undo: () => {
          setRedo([...redo, previousState(game)]);
          setGame({
            ...game,
            states: [game.states[0], ...game.states.slice(1, -1)],
          });
        },
      }
    : undefined;

  return (
    <Game
      game={game}
      timeTravel={timeTravelObj}
      onMenu={onMenu}
      setSelected={(idx) => {
        setRedo([]);
        setGame(setSelected(game, idx));
      }}
      setDisabledSkills={(disabled) => {
        setRedo([]);
        setGame(setDisabledSkills(game, disabled));
      }}
      handlePlayerEffect={(idx) => {
        setRedo([]);
        setGame(handlePlayerEffect(game, idx));
      }}
      solveGame={(iterations) =>
        setGame(
          Seq(
            findBestPlay(game, iterations, {
              turns: game.turns - game.states.length,
            })
          ).maxBy((a) => a.score)!!.phenotype
        )
      }
      hint={(iterations) =>
        setGame({
          ...game,
          states: [
            ...game.states,
            Seq(
              findBestPlay(game, iterations, {
                turns: game.turns - game.states.length,
              })
            ).maxBy((a) => a.score)!!.phenotype.states[game.states.length],
          ],
        })
      }
    />
  );
};

export default SingleGame;
