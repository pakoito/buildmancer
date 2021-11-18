import React from "react";
import { Card, Button } from "react-bootstrap";
import { Enemy, Effect, EnemyStats } from "../utils/types";
import { Seq } from "immutable";

const skillPercents = (effects: Effect[]) =>
  Seq(effects).countBy((e) => e.display).toArray().map(([display, v], idx) => {
    const { range, priority } = effects.find(a => a.display === display)!!;
    return <>[{(v / effects.length * 100).toFixed(2)}%] {display} ⏱:{priority} 🏹:{range.length === 5 ? 'Any' : range.map(a => a + 1).join(",")}<br key={idx} /></>
  });

const EnemyCard: React.FC<{
  enemy: Enemy;
  enemyStats: EnemyStats;
  latestAttack: string | undefined;
  isSelected?: boolean;
  onSelect: () => void;
  canAct: boolean;
}> = ({ enemy, enemyStats, isSelected, onSelect, latestAttack, canAct }) => (
  <Card bg={isSelected ? "info" : undefined}>
    <Card.Body>
      <Card.Title>{enemy.lore.name} {enemyStats.hp > 0 ? "" : (<b>💀DEAD💀</b>)}</Card.Title>
      <Card.Text>❤:{enemyStats.hp} 🏹:{enemyStats.distance}</Card.Text>
      {latestAttack && (<Card.Text>Latest attack: {latestAttack}</Card.Text>)}
      <Card.Text>
        Next attack prediction:
        <br />
        {skillPercents(enemy.rolls[enemyStats.distance - 1].map((idx) => enemy.effects[idx]))}
        <br />
      </Card.Text>
      {canAct && (<Button disabled={isSelected} onClick={onSelect}>Select</Button>)}
    </Card.Body>
  </Card>
);

export default EnemyCard;
