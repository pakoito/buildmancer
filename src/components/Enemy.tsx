import React from "react";
import { Card, Button } from "react-bootstrap";
import { Enemy, Effect } from "../types";
import { Seq } from "immutable";

const skillPercents = (effects: Effect[]) =>
  Seq(effects).countBy((e) => e.display).toArray().map(([k, v], idx) => `[${(v / effects.length * 100).toFixed(2)}%] ${k}`).join("\n");

const EnemyCard: React.FC<{
  enemy: Enemy;
  latestAttack: string | undefined;
  isSelected?: boolean;
  onSelect: () => void;
  canAct: boolean;
}> = ({ enemy, isSelected, onSelect, latestAttack, canAct }) => (
  <Card bg={isSelected ? "info" : undefined}>
    <Card.Body>
      <Card.Title>{enemy.lore.name} {enemy.stats.hp > 0 ? "" : (<b>💀DEAD💀</b>)}</Card.Title>
      <Card.Text>❤:{enemy.stats.hp} 🏹:{enemy.stats.distance}</Card.Text>
      {latestAttack && (<Card.Text>Latest attack: {latestAttack}</Card.Text>)}
      <Card.Text>
        Next attack prediction:
        <br />
        {skillPercents(enemy.rolls[enemy.stats.distance - 1].map((idx) => enemy.effects[idx]))}
        <br />
      </Card.Text>
      {canAct && (<Button disabled={isSelected} onClick={onSelect}>Select</Button>)}
    </Card.Body>
  </Card>
);

export default EnemyCard;
