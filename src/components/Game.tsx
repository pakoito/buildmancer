import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import { Player, Enemy, EffectFun } from "../types";

import useGame from "../hooks/useGame";
import { snap } from "../utils";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";

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
