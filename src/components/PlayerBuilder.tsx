import React from "react";
import { Container, Row, Form, Button, ButtonGroup, Navbar } from "react-bootstrap";
import useScroll from "../hooks/useScroll";

import { Player } from "../types";
import { build, randomName } from "../utils";

const randomAge = () => Math.floor((Math.random() * 50) + 16);

const selects = Object.entries(build).map(([type, options]) => ({
  type,
  options: options.map(({ display }, value) => ({
    display,
    value,
  })),
}));

const PlayerBuilder = ({ onSave }: { onSave: (player: Player) => void }) => {
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
    age: randomAge(),
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
      stats: {
        hp: 10,
        stamina: 8,
      },
      build: Object.entries(form).reduce((acc, [type, value]) => {
        return {
          ...acc,
          [type]: build[type][value]
        }
      }, {}),
    });
  };
  const displayType = (type: string) => <b>{build[type][form[type]].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid style={{ marginBottom: '105px' }}>
        <Row className="g-2">
          {selects.map(({ type, options }) =>
            <ElementPicker
              setField={(value) => setField(type, value)}
              section={type}
              options={options}
              isSelected={(value) => form[type] === value} />
          )}
        </Row>
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '100px' }}>
          <Container>
            <Navbar.Text>You are <i onClick={() => setLore((lore) => ({ ...lore, name: randomName() }))}>{lore.name}</i>, the {displayType('skill')} {displayType('class')} {displayType('charm')}<br />who wields a {displayType('weapon')} and a {displayType('offhand')}<br />and wears {displayType('armor')} with {displayType('headgear')} and {displayType('footwear')}</Navbar.Text>
            <Button type="submit">Pick your foe!</Button>
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
