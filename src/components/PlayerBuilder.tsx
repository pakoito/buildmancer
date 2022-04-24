import React from "react";
import { Container, Row, Form, Button, ButtonGroup, Navbar } from "react-bootstrap";
import useScroll from "../hooks/useScroll";

import { Player, PlayerStats } from "../utils/types";
import { build, defaultStatus, makeStat, randomName } from "../utils/data";
import Chance from 'chance';

const version = 'dev';

const selects = Object.entries(build).map(([type, options]) => ({
  type,
  options: options.map(({ display }, value) => ({
    display,
    value,
  })),
}));

const PlayerBuilder = ({ onSave }: { onSave: (player: Player, playerStats: PlayerStats) => void }) => {
  const [form, setForm] = React.useState<Record<string, number>>(
    selects.reduce(
      (acc, { type, options }) => ({
        ...acc,
        [type]: options[0].value,
      }),
      {},
    ),
  );
  const [lore, setLore] = React.useState({
    name: randomName(),
    age: new Chance().age(),
  });
  const setField = (field: string, value: number) => {
    setForm({
      ...form,
      [field]: value,
    });
  };
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    onSave({
      id: "p-1",
      lore,
      build: Object.entries(form).reduce((acc, [type, value]) => {
        return {
          ...acc,
          [type]: build[type][value]
        }
      }, { basic: build.basic[0] }),
    }, {
      hp: makeStat(25),
      stamina: makeStat(6),
      staminaPerTurn: makeStat(1),
      speed: makeStat(0),
      attack: makeStat(0),
      defence: makeStat(0),
      status: defaultStatus,
    });
  };
  const displayType = (type: string) => <b>{build[type][form[type]].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      Build: {version}
      <Container fluid style={{ marginBottom: '105px' }}>
        <Row className="g-2">
          {selects.map(({ type, options }) =>
            <ElementPicker
              setField={(value) => setField(type, value)}
              section={type}
              options={options}
              key={type}
              isSelected={(value) => form[type] === value} />
          )}
        </Row>
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '100px' }}>
          <Container>
            <Navbar.Text>You are <i onClick={() => setLore((lore) => ({ ...lore, name: randomName() }))}>{lore.name}</i>, the {displayType('skill')} {displayType('class')} {displayType('charm')}<br />who wields a {displayType('weapon')} and a {displayType('offhand')}<br />and wears {displayType('armor')} with {displayType('headgear')} and {displayType('footwear')}</Navbar.Text>
            <Button type="submit">This is me!</Button>
          </Container>
        </ Navbar>
      </Container >
    </Form >
  );
};

const ElementPicker = ({ isSelected, section, options, setField }: {
  options: {
    display: string;
    value: number;
  }[], isSelected: (value: number) => boolean, setField: (value: number) => void, section: string
}) => {
  const [scrollTo, scrollRef] = useScroll({
    behavior: 'smooth',
    block: 'start',
  });

  return (
    <Row>
      <Form.Label>{section}</Form.Label>
      <br />
      <ButtonGroup size="lg" className="mb-2">
        {options.map(({ display, value }) => (
          <Button
            key={value}
            name={section}
            id={`${value}`}
            variant={isSelected(value) ? 'primary' : 'secondary'}
            onClick={() => { setField(value); scrollTo(); }}
          >{display}</Button>
        ))}
      </ButtonGroup>
      <div id={`${section}-scroll`} ref={scrollRef} />
    </Row>
  );
}

export default PlayerBuilder;
