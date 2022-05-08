import React from "react";
import { Container, ButtonGroup, Form, Button, Navbar } from "react-bootstrap";

import { Player, Enemies, EnemiesStats, Build, EnemyInfo } from "../utils/types";
import { enemies, randomEnemy } from "../utils/data";

const EncounterBuilder = ({ player, onSave }: { player: Player, onSave: (enemies: Enemies, enemiesStats: EnemiesStats) => void }) => {
  const [encounter, setEncounter] = React.useState<EnemyInfo[]>([]);
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    const enemies = encounter.map(a => a[0]);
    const enemiesStats = encounter.map(a => a[1]);
    // Size enforced by UI
    onSave(enemies as Enemies, enemiesStats as EnemiesStats);
  };
  const displayType = (type: keyof Build) => <b>{player.build[type].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid style={{ marginBottom: encounter.length > 0 ? '205px' : '105px' }}>
        <ButtonGroup size="lg" className="mb-2">
          {enemies.map((enemy) =>
            <Button
              key={enemy[0].lore.name}
              disabled={encounter.length > 4}
              onClick={() => setEncounter((e) => [...e, enemy])}
            >{enemy[0].lore.name}</Button>
          )}
        </ButtonGroup>
      </Container >
      {
        encounter.length > 0 &&
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ marginBottom: '100px' }}>
          <Container fluid>
            <ButtonGroup size="sm" className="mb-2">
              {encounter.map((enemy, idx) => <Button key={`${enemy[0].lore.name}-${idx}`} onClick={() => setEncounter((e) => { let found = false; return e.filter((m) => (found || m[0].lore.name !== enemy[0].lore.name) || !(found = true)); })}>{enemy[0].lore.name}</Button>)}
            </ButtonGroup>
          </Container>
        </ Navbar>
      }
      <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '100px' }}>
        <Container>
          <Navbar.Text>You are <i>{player.lore.name}</i>, the {displayType('skill')} {displayType('class')} {displayType('charm')}<br />who wields a {displayType('weapon')} and a {displayType('offhand')}<br />and wears {displayType('armor')} with {displayType('headgear')} and {displayType('footwear')}</Navbar.Text>
          <ButtonGroup>
            <Button
              disabled={encounter.length < 0 || encounter.length > 4}
              onClick={(_) => setEncounter((e) => [...e, randomEnemy()])}>
              Add Random
            </Button>
            <Button type="submit" disabled={encounter.length < 1 || encounter.length > 5}>To Battle!</Button>
          </ButtonGroup>
        </Container>
      </ Navbar>
    </Form >
  );
};

export default EncounterBuilder;
