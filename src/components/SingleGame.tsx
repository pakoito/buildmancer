import { Seq } from 'immutable';
import React from 'react';
import { findBestPlay } from '../game/tinkerer';
import { initialState, previousState } from '../game/playGame';
import { PlayState, setSelected, setDisabledSkills, handlePlayerEffect } from '../game/playGame';
import { Play, Snapshot } from '../game/types';
import Game from './Game';

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
            states: [initialState(game), ...game.states.slice(1, -1)],
          });
        },
      }
    : undefined;

  return (
    <Game
      game={game}
      timeTravel={timeTravelObj}
      onMenu={onMenu}
      onGameEnd={onGameEnd}
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
      solveGame={(iterations, population) =>
        setGame(Seq(findBestPlay(game, iterations, population)).maxBy((a) => a.score)!!.phenotype)
      }
      hint={(iterations, population) =>
        setGame({
          ...game,
          states: [
            ...game.states,
            Seq(findBestPlay(game, iterations, population)).maxBy((a) => a.score)!!.phenotype
              .states[game.states.length],
          ],
        })
      }
    />
  );
};

export default SingleGame;
