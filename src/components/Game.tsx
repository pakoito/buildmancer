import { Container, Row, Col } from "react-bootstrap";

import { Player, Enemy, EffectFun } from "../types";

import useGame from "../hooks/useGame";
import { snap } from "../utils";

import { useCallback } from "react";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";
import usePressedKeys from "../hooks/usePressedKeys";
import usePrevious from "../hooks/usePrevious";

const Game = (props: { player: Player; enemies: Enemy[] }): JSX.Element => {
  const {
    player,
    enemies,
    selectedEnemy,
    updatePlayerStats,
    updateEnemyStats,
    setSelectedEnemy,
  } = useGame({
    player: props.player,
    enemies: props.enemies,
    selectedEnemy: props.enemies[0].id,
  });

  const handlePlayerEffect = (effect: EffectFun) => {
    const newState = effect(
      snap(
        props.player.stats,
        props.enemies.filter((enemy) => enemy.id === selectedEnemy)[0].stats,
      ),
      snap(
        player.stats,
        enemies.filter((enemy) => enemy.id === selectedEnemy)[0].stats,
      ),
    );
    updatePlayerStats(newState.player);
    updateEnemyStats(selectedEnemy, newState.monster);
  };

  const pressedKeys = usePressedKeys();
  const previousPressed = usePrevious(pressedKeys);

  const currentSet = previousPressed.current ?? new Set();
  previousPressed.current = new Set();

  const playerSkills = Object.values(player.build).flatMap((s) => s.effects);
  const upKeys = [...currentSet].filter((k) => !pressedKeys.has(k));

  upKeys.reduce((hasRun, val) => {
    if (hasRun) {
      return hasRun;
    } else {
      // Key pressed is 1-9
      const valNum = parseInt(val);
      if (valNum > 0 && valNum <= playerSkills.length) {
        handlePlayerEffect(playerSkills[valNum - 1].effect);
      }
      return true;
    }
  }, false);

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-flex-start">
        <Col sm={12} md={8}>
          <Row>
            <Col>
              <PlayerCard player={player} onClickEffect={handlePlayerEffect} />
            </Col>
          </Row>
          <Row className="mt-2 g-2">
            {enemies.map((enemy) => (
              <Col key={enemy.id} xs={6} md={4}>
                <EnemyCard
                  enemy={enemy}
                  isSelected={enemy.id === selectedEnemy}
                  onSelect={() => {
                    setSelectedEnemy(enemy.id);
                  }}
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Game;
