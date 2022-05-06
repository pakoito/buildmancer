import React from "react";
import { Card, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { Enemy, Effect, EnemyStats } from "../utils/types";
import { Seq } from "immutable";

const skillPercents = (effects: Effect[]) =>
  Seq(effects).countBy((e) => e.display).toArray().map(([display, v], idx) => {
    const { range, priority, tooltip } = effects.find(a => a.display === display)!!;
    return <OverlayTrigger
      key={idx}
      placement="right"
      delay={{ show: 100, hide: 250 }}
      overlay={<Popover>
        <Popover.Header as="h3">{display}</Popover.Header>
        <Popover.Body>
          {tooltip}<br />⏱:{priority}<br />🏹:{range.length === 5 ? 'Any' : range.length === 0 ? 'None' : range.map(a => a + 1).join(", ")}
        </Popover.Body>
      </Popover>}
    ><>[{(v / effects.length * 100).toFixed(2)}%] {display}<br key={idx} /></>
    </OverlayTrigger>
  });

const EnemyCard: React.FC<{
  enemy: Enemy;
  enemyStats: EnemyStats;
  latestAttack: string | undefined;
  isSelected?: boolean;
  onSelect: () => void;
  canAct: boolean;
  hotkey: string;
}> = ({ enemy, enemyStats, isSelected, onSelect, latestAttack, canAct, hotkey }) => (
  <Card bg={isSelected ? "info" : undefined}>
    <Card.Body>
      <Card.Title>{enemy.lore.name} {enemyStats.hp.current > 0 ? "" : (<b>💀DEAD💀</b>)}</Card.Title>
      <Card.Text>❤:{enemyStats.hp.current} 🏹:{enemyStats.distance + 1}</Card.Text>
      <Card.Text>Attack {enemyStats.attack.current}<br />Defence {enemyStats.defence.current}<br />Speed {enemyStats.speed.current}</Card.Text>
      {enemyStats.status.bleed.turns > 0 && ` ${enemyStats.status.bleed.turns} 🩸`}
      {latestAttack && (<Card.Text>Latest attack: {latestAttack}</Card.Text>)}
      <Card.Text>
        Next attack prediction:
        <br />
        {skillPercents(enemy.rolls[enemyStats.distance].map((idx) => enemy.effects[idx]))}
        <br />
      </Card.Text>
      {canAct && (<Button disabled={isSelected} onClick={onSelect}>[<i>{hotkey.toUpperCase()}</i>] Select</Button>)}
    </Card.Body>
  </Card>
);

export default EnemyCard;
