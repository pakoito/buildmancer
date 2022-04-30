import React from "react";
import { Container, Row, Form, Button, ButtonGroup, Navbar } from "react-bootstrap";
import useScroll from "../hooks/useScroll";

import { Build, Item, Player, PlayerStats, safeEntries } from "../utils/types";
import { build, randomName, randomPlayer } from "../utils/data";
import { Set } from 'immutable';

const systemBuildKeys: Set<keyof Build> = Set(['debug', 'basic']);

const PlayerBuilder = ({ onSave }: { onSave: (player: Player, playerStats: PlayerStats) => void }) => {
  const [player, playerStats] = randomPlayer();
  const [form, setForm] = React.useState<Build>(player.build);
  const [lore, setLore] = React.useState(player.lore);
  const setField = <T extends keyof Build>(field: T, value: Build[T]) => {
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
      build: form,
    }, playerStats);
  };
  const displayType = (type: keyof Build) => <b>{form[type].display}</b>;
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid style={{ marginBottom: '105px' }}>
        <Row className="g-2">
          {safeEntries(build)
            .filter(([type, _]) => !systemBuildKeys.has(type))
            .map(([type, values]) =>
              <ElementPicker
                setField={(value) => setField(type, value)}
                section={type}
                options={(values as Item[])}
                key={type}
                isSelected={(value) => form[type].display === value.display} />)
          }
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
  options: Item[], isSelected: (value: Item) => boolean, setField: (value: Item) => void, section: string
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
        {options.map((item) => (
          <Button
            key={item.display}
            name={section}
            id={`${item.display}`}
            variant={isSelected(item) ? 'primary' : 'secondary'}
            onClick={() => { setField(item); scrollTo(); }}
          >{item.display}</Button>
        ))}
      </ButtonGroup>
      <div id={`${section}-scroll`} ref={scrollRef} />
    </Row>
  );
}

export default PlayerBuilder;
