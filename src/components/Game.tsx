import { Container, Row, Col, Card, Modal, ButtonGroup } from "react-bootstrap";

import { DisabledSkills, MonsterTarget, Play } from "../utils/types";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";
import usePressedKeys from "../hooks/usePressedKeys";
import { playerActions } from "../utils/playGame";
import { Seq, Set } from "immutable";
import { previousState } from "../utils/data";
import { Button } from "react-bootstrap";
import saveAs from 'file-saver';
import { useCallback, useState } from "react";

export type GameProps = {
  game: Play;
  setSelected: (target: MonsterTarget) => void;
  setDisabledSkills: (disabled: DisabledSkills) => void;
  handlePlayerEffect: (index: number) => void,
  solveGame: (iterations: number) => void,
  hint: (iterations: number) => void,
  undo: () => void
  redo: (() => void) | undefined;
};

const Game = ({ handlePlayerEffect, setSelected, setDisabledSkills, game, solveGame, undo, redo, hint }: GameProps): JSX.Element => {
  const { player, enemies } = game;
  const { player: playerStats, enemies: enemiesStats, target, lastAttacks, disabledSkills } = previousState(game);
  const [show, setShowLog] = useState(false);

  const handleCloseLog = () => setShowLog(false);
  const handleShowLog = () => setShowLog(true);

  const playerSkills = playerActions(player);
  const monsterHealth = enemiesStats.reduce((acc, m) => m.hp.current + acc, 0);
  const isPlayerAlive = playerStats.hp.current > 0;
  const areMonstersAlive = monsterHealth > 0;
  const endGame = game.states.length <= game.turns;
  const canAct = isPlayerAlive && areMonstersAlive && endGame;

  const pressed = usePressedKeys((key) => {
    if (!canAct) return;
    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= playerSkills.length) {
      const hasStamina = playerSkills[valNum - 1].stamina <= playerStats.stamina.current;
      if (!hasStamina) return;
      handlePlayerEffect(valNum - 1);
    }
  });

  const selectedButtons = Set<string>([...pressed].flatMap((key: string) => {
    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= playerSkills.length) {
      return [playerSkills[valNum - 1].display];
    } else {
      return [];
    }
  }));

  const save = useCallback(() => {
    const blob = new Blob([JSON.stringify(game)], { type: "application/json;charset=utf-8" });
    saveAs(blob, `buildmancer-${Date.now()}.json`);
  }, [game]);

  return (
    <>
      <Container fluid>
        <Row className="justify-content-center align-items-flex-start">
          <Col sm={12} md={8}>
            <Card.Title>
              Turn {game.states.length} out of {game.turns} {!isPlayerAlive ? (<b>❌❌DEFEAT❌❌</b>) : !areMonstersAlive ? (<b>🎉🎉VICTORY🎉🎉</b>) : ""}
            </Card.Title>
            <PlayerCard
              player={player}
              playerStats={playerStats}
              disabledSkills={disabledSkills}
              setDisabledSkills={setDisabledSkills}
              onClickEffect={(idx) => handlePlayerEffect(idx)}
              selectedButtons={selectedButtons}
              lastAction={lastAttacks.filter(a => a.origin === 'Player').map(a => `[${a.phase}] ${a.display}`).join(" -> ") ?? undefined}
              canAct={canAct} />
            <Row>
              <ButtonGroup>
                {game.states.length > 1 && (<Button onClick={(_) => undo()}>Undo ↩</Button>)}
                {redo && (<Button onClick={(_) => redo()}>Redo ↪</Button>)}
              </ButtonGroup>
            </Row>
            <Row>
              <ButtonGroup>
                <Button onClick={(_) => hint(100)}>Hint</Button>
              </ButtonGroup>
            </Row>
            <Row>
              {Seq(enemies).zip(Seq(enemiesStats)).map(([enemy, stats], idx) => (
                <Col key={idx} xs={6} md={4}>
                  <EnemyCard
                    key={idx}
                    enemyStats={stats}
                    enemy={enemy}
                    canAct={canAct}
                    latestAttack={Seq(lastAttacks).filter(({ origin }) => origin === idx).map(a => `[${a.phase}] ${a.display}`).join(" -> ") ?? undefined}
                    isSelected={idx === target}
                    onSelect={() => setSelected(idx as MonsterTarget)}
                  />
                </Col>
              ))}
            </Row>
            <Card.Title>
              Debug
            </Card.Title>
            <Row>
              <ButtonGroup>
                <Button onClick={handleShowLog}>Log 🗒</Button>
                <Button onClick={save}>Dump to file 📂</Button>
              </ButtonGroup>
            </Row>
            <Card.Title>
              Cheats
            </Card.Title>
            <Row>
              <ButtonGroup>
                <Button onClick={(_) => solveGame(100)}>Solve ⌛</Button>
                <Button onClick={(_) => solveGame(1000)}>Solve thoroughly ⌛⌛⌛</Button>
              </ButtonGroup>
            </Row>
          </Col>
        </Row>
      </Container>
      <Modal show={show} onHide={handleCloseLog} scrollable={true} centered={true}>
        <Modal.Header closeButton>
          <Modal.Title>Game Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {game.states.map((s, idx) => (
            <>
              <b>Turn {idx}</b><br />
              Player: {JSON.stringify(s.player, null, 2)}<br />
              Enemies: {JSON.stringify(s.enemies, null, 2)}<br />
              Target [{s.target}]<br />
              Eot? Bot?: {JSON.stringify({ bot: s.bot, eot: s.eot }, null, 2)}<br />
              Actions:<br />
              {s.lastAttacks.map(a => (<>  {JSON.stringify(a, null, 2)}<br /></>))}
            </>
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
