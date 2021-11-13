import React from "react";
import { Card, Button } from "react-bootstrap";
import { Enemy, Effect } from "../types";
import { Seq } from "immutable";

const skillPercents = (effects: Effect[]) =>
  Seq(effects).countBy((e) => e.display).toArray().map(([k, v], idx) => <Card.Text key={idx}>[{(v / effects.length * 100).toFixed(2)}%] {k}</Card.Text>);

const EnemyCard: React.FC<{
  enemy: Enemy;
  latestAttack: string | undefined;
  isSelected?: boolean;
  onSelect: () => void;
}> = ({ enemy, isSelected, onSelect, latestAttack }) => (
  <Card bg={isSelected ? "info" : undefined}>
    <Card.Body>
      <Card.Title>{enemy.lore.name}{enemy.stats.hp > 0 ? "" : (<b> 💀DEAD💀 </b>)}</Card.Title>
      <Card.Text>
        {enemy.lore.name}. Has {enemy.stats.hp} HP and is at distance{" "}
        {enemy.stats.distance}
      </Card.Text>
      {latestAttack && (<Card.Text>Latest attack: {latestAttack}</Card.Text>)}
      <Card.Text>Next attack prediction:</Card.Text>
      {skillPercents(enemy.rolls[enemy.stats.distance - 1].map((idx) => enemy.effects[idx]))}
      <Button disabled={isSelected} onClick={onSelect}>Select</Button>
    </Card.Body>
  </Card>
);

export default EnemyCard;
