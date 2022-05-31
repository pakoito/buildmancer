import React from 'react';
import { Container, ButtonGroup, Form, Button, Navbar } from 'react-bootstrap';

import {
  Player,
  Enemies,
  EnemiesStats,
  Build,
  EnemyInfo,
  safeValues,
  PlayerStats,
} from '../game/types';
import { enemies } from '../game/data';
import { randomEnemy } from '../game/makeGame';

const EncounterBuilder = ({
  player,
  onSave,
}: {
  player: [Player, PlayerStats];
  onSave: (enemies: Enemies, enemiesStats: EnemiesStats) => void;
}) => {
  const [encounter, setEncounter] = React.useState<EnemyInfo[]>([]);
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    const enemies = encounter.map((a) => a[0]);
    const enemiesStats = encounter.map((a) => a[1]);
    // Size enforced by UI
    onSave(enemies as Enemies, enemiesStats as EnemiesStats);
  };
  const displayType = (type: keyof Build) => <b>{player[0].build[type].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid>
        <ButtonGroup size="lg" className="mb-2">
          {safeValues(enemies).map((enemy) => (
            <Button
              key={enemy[0].lore.name}
              disabled={encounter.length > 4}
              onClick={() => setEncounter((e) => [...e, enemy])}
            >
              {enemy[0].lore.name}
            </Button>
          ))}
        </ButtonGroup>
      </Container>
      {encounter.length > 0 && (
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ marginBottom: '100px' }}>
          <Container fluid>
            <ButtonGroup size="sm" className="mb-2">
              {encounter.map((enemy, idx) => (
                <Button
                  key={`${enemy[0].lore.name}-${idx}`}
                  onClick={() =>
                    setEncounter((e) => {
                      let found = false;
                      return e.filter(
                        (m) => found || m[0].lore.name !== enemy[0].lore.name || !(found = true)
                      );
                    })
                  }
                >
                  {enemy[0].lore.name}
                </Button>
              ))}
            </ButtonGroup>
          </Container>
        </Navbar>
      )}
      <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '100px' }}>
        <Container>
          <Navbar.Text>
            You are <i>{player[0].lore.name}</i>, the {displayType('skill')} {displayType('class')}{' '}
            {displayType('charm')}
            <br />
            {player[1].hp.current} ❤
            <br />
            {player[1].stamina.current} 💪 ({player[1].staminaPerTurn.current >= 0 && '+'}
            {player[1].staminaPerTurn.current})<br />
            Attack {player[1].attack.current} | Defence {player[1].defence.current} | Speed{' '}
            {player[1].speed.current}
          </Navbar.Text>
          <ButtonGroup>
            <Button
              disabled={encounter.length < 0 || encounter.length > 4}
              onClick={(_) => setEncounter((e) => [...e, randomEnemy()])}
            >
              Add Random
            </Button>
            <Button type="submit" disabled={encounter.length < 1 || encounter.length > 5}>
              To Battle!
            </Button>
          </ButtonGroup>
        </Container>
      </Navbar>
    </Form>
  );
};

export default EncounterBuilder;
