import { Container, Row, Col, Card, Modal, ButtonGroup } from 'react-bootstrap';

import { DisabledSkills, MonsterTarget, Play } from '../game/types';

import EnemyCard from './Enemy';
import PlayerCard from './Player';
import usePressedKeys from '../hooks/usePressedKeys';
import { playerActions } from '../game/playGame';
import { Seq, Set } from 'immutable';
import { previousState } from '../game/playGame';
import { Button } from 'react-bootstrap';
import saveAs from 'file-saver';
import { useCallback, useEffect, useState } from 'react';
import { updateGlobals } from '../game/modding';
import { useForceRerender } from '../hooks/useForceRerender';

export type GameProps = {
  game: Play;
  setSelected: (target: MonsterTarget) => void;
  setDisabledSkills: (disabled: DisabledSkills) => void;
  handlePlayerEffect: (index: number) => void;
  solveGame: (iterations: number, population: number) => void;
  hint: (iterations: number, population: number) => void;
  timeTravel: { undo: () => void; redo: (() => void) | undefined } | undefined;
  onMenu: () => void;
};

const playerHotkeys = [
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
];

const Game = ({
  handlePlayerEffect,
  setSelected,
  setDisabledSkills,
  game,
  solveGame,
  timeTravel,
  hint,
  onMenu,
}: GameProps): JSX.Element => {
  const { player, enemies } = game;
  const {
    player: playerStats,
    enemies: enemiesStats,
    target,
    lastAttacks,
    disabledSkills,
    inventory: inventoryStats,
  } = previousState(game);
  const [isLogShown, setShowLog] = useState(false);
  const forceUpdate = useForceRerender();

  useEffect(() => {
    updateGlobals({ ingame: { game, forceUpdate } });
    return () => updateGlobals({ ingame: undefined });
  }, [game, forceUpdate]);

  const handleCloseLog = () => setShowLog(false);
  const handleShowLog = () => setShowLog(true);

  const playerSkills = playerActions(player, inventoryStats);
  const monsterHealth = enemiesStats.reduce((acc, m) => m.hp.current + acc, 0);
  const isPlayerAlive = playerStats.hp.current > 0;
  const areMonstersAlive = monsterHealth > 0;
  const endGame = game.states.length < game.turns;
  const canAct = isPlayerAlive && areMonstersAlive && endGame;

  const pressed = usePressedKeys((key) => {
    if (!canAct) return;

    const skillIndex = playerHotkeys.indexOf(key);
    if (skillIndex !== -1) {
      const skillNumber = playerHotkeys.indexOf(key);
      const hasStamina = playerSkills[skillNumber].stamina <= playerStats.stamina.current;
      if (!hasStamina) return;
      handlePlayerEffect(skillNumber);
    }

    if (key === 'Escape') {
      onMenu();
    }
    if (key === 'h') {
      hint(5, 100);
    }

    if (key === 'l') {
      setShowLog(!isLogShown);
    }

    if (key === 's') {
      save();
    }

    if (key === 'a' && game.states.length > 1 && timeTravel) {
      timeTravel.undo();
    }
    if (key === 'd' && timeTravel && timeTravel.redo != null) {
      timeTravel.redo();
    }

    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= enemies.length) {
      setSelected((valNum - 1) as MonsterTarget);
    }
  });

  const selectedButtons = Set<string>(
    [...pressed].flatMap((key: string) => {
      const skillIndex = playerHotkeys.indexOf(key);
      if (skillIndex !== -1) {
        return [playerSkills[skillIndex].display];
      } else {
        return [];
      }
    })
  );

  const save = useCallback(() => {
    const blob = new Blob([JSON.stringify(game)], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, `buildmancer-${Date.now()}.bmreplay`);
  }, [game]);

  return (
    <>
      <Container fluid>
        <Row className="justify-content-center align-items-flex-start">
          <Col sm={12} md={8}>
            <Button onClick={onMenu}>
              [<i>Esc</i>] MAIN MENU
            </Button>
            <Card.Title>
              {!isPlayerAlive ? (
                <b>❌❌DEFEAT❌❌</b>
              ) : !areMonstersAlive ? (
                <b>🎉🎉VICTORY🎉🎉</b>
              ) : (
                ''
              )}{' '}
              Turn {game.states.length} out of {game.turns}
            </Card.Title>
            <PlayerCard
              player={player}
              playerStats={playerStats}
              inventoryStats={inventoryStats}
              disabledSkills={disabledSkills}
              setDisabledSkills={setDisabledSkills}
              onClickEffect={(idx) => handlePlayerEffect(idx)}
              selectedButtons={selectedButtons}
              hotkeys={playerHotkeys}
              lastAction={
                lastAttacks
                  .filter((a) => a.origin === 'Player' && a.phase !== 'CLEANUP')
                  .map((a) => `${a.display}`)
                  .join(' -> ') ?? undefined
              }
              canAct={canAct}
            />
            {timeTravel != null && (
              <Row>
                <ButtonGroup>
                  {game.states.length > 1 && (
                    <Button onClick={(_) => timeTravel.undo()}>
                      [<i>A</i>] Undo ↩
                    </Button>
                  )}
                  {timeTravel.redo && (
                    <Button onClick={(_) => timeTravel.redo!!()}>
                      [<i>D</i>] Redo ↪
                    </Button>
                  )}
                </ButtonGroup>
              </Row>
            )}
            <Row>
              <ButtonGroup>
                <Button onClick={(_) => hint(5, 100)}>
                  <i>[H]</i> Hint
                </Button>
              </ButtonGroup>
            </Row>
            <Row>
              {Seq(enemies)
                .zip(Seq(enemiesStats))
                .map(([enemy, stats], idx) => (
                  <Col key={idx} xs={6} md={4}>
                    <EnemyCard
                      key={idx}
                      enemyStats={stats}
                      enemy={enemy}
                      canAct={canAct}
                      latestAttack={
                        Seq(lastAttacks)
                          .filter(({ origin, phase }) => origin === idx && phase === 'MAIN')
                          .map((a) => `${a.display}`)
                          .join(' -> ') ?? undefined
                      }
                      isSelected={idx === target}
                      onSelect={() => setSelected(idx as MonsterTarget)}
                      hotkey={`${idx + 1}`}
                    />
                  </Col>
                ))}
            </Row>
            <Card.Title>Debug</Card.Title>
            <Row>
              <ButtonGroup>
                <Button onClick={handleShowLog}>
                  [<i>L</i>] Log 🗒
                </Button>
                <Button onClick={save}>
                  [<i>S</i>] Save Replay 📂
                </Button>
              </ButtonGroup>
            </Row>
            <Card.Title>Cheats</Card.Title>
            <Row>
              <ButtonGroup>
                <Button onClick={(_) => solveGame(5, 100)}>Solve ⌛</Button>
                <Button onClick={(_) => solveGame(20, 100)}>Solve thoroughly ⌛⌛⌛</Button>
              </ButtonGroup>
            </Row>
          </Col>
        </Row>
      </Container>
      <Modal show={isLogShown} onHide={handleCloseLog} scrollable={true} centered={true}>
        <Modal.Header closeButton>
          <Modal.Title>Game Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {game.states.map((s, idx) => (
            <div key={idx}>
              <b>Turn {idx}</b>
              <br />
              Player: {JSON.stringify(s.player, null, 2)}
              <br />
              Enemies: {JSON.stringify(s.enemies, null, 2)}
              <br />
              Inventory?: {JSON.stringify(s.inventory, null, 2)}
              <br />
              Target [{s.target}]<br />
              Bot?: {JSON.stringify(s.bot, null, 2)}
              <br />
              Eot?: {JSON.stringify(s.eot, null, 2)}
              <br />
              Actions:
              <br />
              {s.lastAttacks.map((a, idx) => (
                <div key={idx}>
                  {'-->'} {JSON.stringify(a, null, 2)}
                  <br />
                </div>
              ))}
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseLog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Game;
