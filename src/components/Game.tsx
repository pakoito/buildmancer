import { Container, Row, Col, Card } from "react-bootstrap";

import { MonsterTarget } from "../types";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";
import usePressedKeys from "../hooks/usePressedKeys";
import { Play, playerActions } from "../playGame";
import { Seq } from "immutable";
import { previousState } from "../utils/data";
import { Button } from "react-bootstrap";

export type GameProps = {
  game: Play;
  setSelected: (target: MonsterTarget) => void;
  handlePlayerEffect: (index: number) => void,
  solveGame: (iterations: number) => void,
  undo: () => void
  redo: (() => void) | undefined;
};

const Game = ({ handlePlayerEffect, setSelected, game, solveGame, undo, redo }: GameProps): JSX.Element => {
  const { player, enemies, target, lastAttacks } = previousState(game);

  const playerSkills = playerActions(player);
  const monsterHealth = enemies.reduce((acc, m) => m.stats.hp + acc, 0);
  const isPlayerAlive = player.stats.hp > 0;
  const areMonstersAlive = monsterHealth > 0;
  const canAct = isPlayerAlive && areMonstersAlive;

  const pressed = usePressedKeys((key) => {
    if (!canAct) return;
    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= playerSkills.length) {
      handlePlayerEffect(valNum - 1);
    }
  });

  const selectedButtons = new Set<string>([...pressed].flatMap((key: string) => {
    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= playerSkills.length) {
      return [playerSkills[valNum - 1].display];
    } else {
      return [];
    }
  }));

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-flex-start">
        <Col sm={12} md={8}>
          <Row>
            <Card.Title>
              Turn {game.states.length} {!isPlayerAlive ? (<b>❌❌DEFEAT❌❌</b>) : !areMonstersAlive ? (<b>🎉🎉VICTORY🎉🎉</b>) : ""}
            </Card.Title>
          </Row>
          <Row>
            <Col>
              <PlayerCard
                player={player}
                onClickEffect={handlePlayerEffect}
                selectedButtons={selectedButtons}
                lastAction={(lastAttacks.find(a => a[0] === 'Player') ?? [undefined, undefined])[1]}
                canAct={canAct} />
            </Col>
          </Row>
          <Row className="mt-2 g-2">
            {enemies.map((enemy, idx) => (
              <Col key={idx} xs={6} md={4}>
                <EnemyCard
                  key={idx}
                  enemy={enemy}
                  canAct={canAct}
                  latestAttack={Seq(lastAttacks).filter(([target, _]) => target === idx).map(v => v[1]).first()}
                  isSelected={idx === target}
                  onSelect={() => setSelected(idx as MonsterTarget)}
                />
              </Col>
            ))}
          </Row>
          <Row>
            {!redo && (<Button onClick={(_) => undo()}>Undo ↩</Button>)}
            {redo && (<Col><Button onClick={(_) => undo()}>Undo ↩</Button><Button onClick={(_) => redo()}>Redo ↪</Button></Col>)}
            <Button onClick={(_) => solveGame(100)}>Solve ⌛</Button>
            <Button onClick={(_) => solveGame(1000)}>Solve thoroughly ⌛⌛⌛</Button>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Game;
