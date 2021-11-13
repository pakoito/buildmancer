import React from "react";
import { Container, ButtonGroup, Form, Button, Navbar } from "react-bootstrap";

import { Player, Enemies, Enemy } from "../types";
import { enemies } from "../utils/data";
import Chance from 'chance';

const rng = new Chance();

const EncounterBuilder = ({ player, onSave }: { player: Player, onSave: (enemies: Enemies) => void }) => {
  const [encounter, setEncounter] = React.useState<Enemy[]>([]);
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    // Size enforced by UI
    onSave([...encounter] as Enemies);
  };
  const displayType = (type: string) => <b>{player.build[type].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid style={{ marginBottom: encounter.length > 0 ? '205px' : '105px' }}>
        <ButtonGroup size="lg" className="mb-2">
          {enemies.map((enemy) =>
            <Button
              key={enemy.lore.name}
              disabled={encounter.length > 4}
              onClick={() => setEncounter((e) => [...e, enemy])}
            >{enemy.lore.name}</Button>
          )}
        </ButtonGroup>
      </Container >
      {
        encounter.length > 0 &&
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ marginBottom: '100px' }}>
          <Container fluid>
            <ButtonGroup size="sm" className="mb-2">
              {encounter.map((enemy, idx) => <Button key={`${enemy.lore.name}-${idx}`} onClick={() => setEncounter((e) => { let found = false; return e.filter((m) => (found || m.lore.name !== enemy.lore.name) || !(found = true)); })}>{enemy.lore.name}</Button>)}
            </ButtonGroup>
          </Container>
        </ Navbar>
      }
      <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '100px' }}>
        <Container>
          <Navbar.Text>You are <i>{player.lore.name}</i>, the {displayType('skill')} {displayType('class')} {displayType('charm')}<br />who wields a {displayType('weapon')} and a {displayType('offhand')}<br />and wears {displayType('armor')} with {displayType('headgear')} and {displayType('footwear')}</Navbar.Text>
          <ButtonGroup>
            <Button
              disabled={encounter.length < 0 || encounter.length > 5}
              onClick={(_) => setEncounter((e) => [...e, enemies[rng.natural({ min: 0, max: enemies.length - 1 })]])}>
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
