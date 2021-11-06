import { Container, Row, Col } from "react-bootstrap";

import { Player, Enemy, EffectFun } from "../types";

import useGame from "../hooks/useGame";
import { snap } from "../utils";

import { Chance } from "chance";

import EnemyCard from "./Enemy";
import PlayerCard from "./Player";
import usePressedKeys from "../hooks/usePressedKeys";
import { Seq } from "immutable";

const select = new Chance();

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

  const startState = snap(
    props.player.stats,
    props.enemies.map(e => e.stats),
  );

  const handlePlayerEffect = (effect: EffectFun) => {
    const newState = effect(startState,
      snap(
        player.stats,
        enemies.map(e => e.stats),
      ),
    );

    const lastState = Seq(props.enemies)
      .map(e => e.effects[e.rolls[e.stats.distance - 1][select.natural({ min: 0, max: e.rolls[e.stats.distance - 1].length - 1 })]])
      .reduce((state, effect) => effect.effect(startState, state), newState);

    updatePlayerStats(lastState.player);
    updateEnemyStats(selectedEnemy, lastState.monsters);
  };

  const playerSkills = Object.values(player.build).flatMap((s) => s.effects);

  const pressed = usePressedKeys((key) => {
    const valNum = parseInt(key);
    if (valNum > 0 && valNum <= playerSkills.length) {
      handlePlayerEffect(playerSkills[valNum - 1].effect);
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
            <Col>
              <PlayerCard player={player} onClickEffect={handlePlayerEffect} selectedButtons={selectedButtons} />
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
