import React from 'react';
import { Card, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Enemy, Effect, EnemyStats } from '../game/types';
import { Seq } from 'immutable';

const skillPercents = (effects: Effect[]) =>
  Seq(effects)
    .countBy((e) => e.display)
    .toArray()
    .map(([display, v], idx) => {
      const { range, priority, tooltip } = effects.find((a) => a.display === display)!!;
      return (
        <OverlayTrigger
          key={idx}
          placement="top"
          delay={{ show: 100, hide: 250 }}
          overlay={(props) => (
            <Popover {...props}>
              <Popover.Header as="h3">{display}</Popover.Header>
              <Popover.Body>
                {tooltip}
                <br />
                ⏱:{priority}
                <br />
                🏹:
                {range.length === 5
                  ? 'Any'
                  : range.length === 0
                  ? 'None'
                  : range.map((a) => a + 1).join(', ')}
              </Popover.Body>
            </Popover>
          )}
        >
          <>
            <br />[{((v / effects.length) * 100).toFixed(2)}%] {display}
          </>
        </OverlayTrigger>
      );
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
  <Card bg={isSelected ? 'info' : undefined}>
    {canAct && (
      <Button disabled={isSelected} onClick={onSelect}>
        [<i>{hotkey.toUpperCase()}</i>]
      </Button>
    )}
    <Card.Body>
      <Card.Title>
        {enemy.lore.name} {enemyStats.hp.current > 0 ? '' : <b>💀DEAD💀</b>}
      </Card.Title>
      <Card.Text>
        ❤:{enemyStats.hp.current} 🏹:{enemyStats.distance}
        <br />A {enemyStats.attack.current} | D {enemyStats.defence.current} | S{' '}
        {enemyStats.speed.current}
        {enemyStats.status.bleed.turns > 0 && (
          <>
            <br />
            {enemyStats.status.bleed.turns} 🩸
          </>
        )}
        {latestAttack && (
          <>
            <br />
            Latest attack: {latestAttack}
          </>
        )}
        <br />
        Next attack prediction:
        {skillPercents(enemy.rolls[enemyStats.distance].map((idx) => enemy.effects[idx]))}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default EnemyCard;
