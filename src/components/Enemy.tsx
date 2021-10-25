import React from "react";
import { Card, Button } from "react-bootstrap";
import { Enemy } from "../types";

const EnemyCard: React.FC<{
  enemy: Enemy;
  isSelected?: boolean;
  onSelect: () => void;
}> = ({ enemy, isSelected, onSelect }) => (
  <Card bg={isSelected ? "info" : undefined}>
    <Card.Body>
      <Card.Title>{enemy.lore.name}</Card.Title>
      <Card.Text>
        {enemy.lore.name}. Has {enemy.stats.hp} HP and is at distance{" "}
        {enemy.stats.distance}
      </Card.Text>
      <Button disabled={isSelected} onClick={onSelect}>Select</Button>
    </Card.Body>
  </Card>
);

export default EnemyCard;
