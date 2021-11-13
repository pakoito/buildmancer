import { Container, Row, Col, Card } from "react-bootstrap";

import { MonsterTarget } from "../types";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";
import usePressedKeys from "../hooks/usePressedKeys";
import { Play, playerActions } from "../playGame";
import { Seq } from "immutable";
import { previousState } from "../utils/data";
import { Button } from "react-bootstrap";

const Game = (props: { game: Play; setSelected: (target: MonsterTarget) => void; handlePlayerEffect: (index: number) => void, solveGame: (play: Play) => void }): JSX.Element => {
  const { handlePlayerEffect, setSelected, game, solveGame } = props;
  const { player, enemies, target, lastAttacks } = previousState(game);

  const playerSkills = playerActions(player);
  const isAlive = player.stats.hp > 0;

  const pressed = usePressedKeys((key) => {
    if (!isAlive) return;
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
              Turn {game.states.length}
            </Card.Title>
          </Row>
          <Row>
            <Col>
              <PlayerCard player={player} onClickEffect={handlePlayerEffect} selectedButtons={selectedButtons} />
            </Col>
          </Row>
          <Row className="mt-2 g-2">
            {enemies.map((enemy, idx) => (
              <Col key={idx} xs={6} md={4}>
                <EnemyCard
                  key={idx}
                  enemy={enemy}
                  latestAttack={Seq(lastAttacks).filter(([target, _]) => target === idx).map(v => v[1]).first()}
                  isSelected={idx === target}
                  onSelect={() => setSelected(idx as MonsterTarget)}
                />
              </Col>
            ))}
          </Row>
          <Row>
            <Button onClick={(_) => solveGame(game)}>Solve</Button>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Game;
