import React from 'react';
import { Container, Row, Form, Button, ButtonGroup, Navbar, Card } from 'react-bootstrap';
import useScroll from '../hooks/useScroll';
import { Build, Item, Player, PlayerStats, safeEntries, safeValues } from '../game/types';
import { build } from '../game/data';
import { Set } from 'immutable';
import { buildPlayer } from '../game/playGame';
import { randomPlayer, randomEnemy, randomName } from '../game/makeGame';
import { chunk } from '../game/zFunDump';

const systemBuildKeys: Set<keyof Build> = Set(['debug', 'basic']);

const PlayerBuilder = ({
  onSave,
}: {
  onSave: (player: Player, playerStats: PlayerStats) => void;
}) => {
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
    onSave(
      {
        id: 'p-1',
        lore,
        build: form,
      },
      playerStats
    );
  };
  const displayType = (type: keyof Build) => <b>{form[type].display}</b>;

  const postBuildPlayerStats = buildPlayer({ ...player, build: form }, playerStats, [
    randomEnemy()[1],
  ])[0];

  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid>
        {safeEntries(build).map(
          ([type, values]) =>
            !systemBuildKeys.has(type) && (
              <ElementPicker
                setField={(value) => setField(type, value)}
                section={type}
                options={safeValues<{ [k: string]: Item }, string>(values)}
                key={type}
                isSelected={(value) => form[type].display === value.display}
              />
            )
        )}
        <Navbar fixed="bottom" bg="dark" variant="dark" style={{ maxHeight: '115px' }}>
          <Container>
            <Navbar.Text>
              You are{' '}
              <i onClick={() => setLore((lore) => ({ ...lore, name: randomName() }))}>
                {lore.name}
              </i>
              , the {displayType('skill')} {displayType('class')} {displayType('charm')}
              <br />
              who wields a {displayType('weapon')} and a {displayType('offhand')}
              <br />
              and wears {displayType('armor')} with {displayType('headgear')} and{' '}
              {displayType('footwear')}
            </Navbar.Text>
            <Navbar.Text>
              {postBuildPlayerStats.hp.current} ???
              <br />
              {postBuildPlayerStats.stamina.current} ???? (
              {postBuildPlayerStats.staminaPerTurn.current >= 0 && '+'}
              {postBuildPlayerStats.staminaPerTurn.current})<br />
              Attack {postBuildPlayerStats.attack.current} | Defence{' '}
              {postBuildPlayerStats.defence.current} | Speed {postBuildPlayerStats.speed.current}
            </Navbar.Text>
            <Button type="submit">This is me!</Button>
          </Container>
        </Navbar>
      </Container>
    </Form>
  );
};

const ElementPicker = ({
  isSelected,
  section,
  options,
  setField,
}: {
  options: Item[];
  isSelected: (value: Item) => boolean;
  setField: (value: Item) => void;
  section: string;
}) => {
  const [scrollTo, scrollRef] = useScroll({
    behavior: 'smooth',
    block: 'start',
  });

  return (
    <Row>
      <Card.Title>{section}</Card.Title>
      {chunk(options, 4).map((itemChunk, idx) => (
        <ButtonGroup size="lg" className="mb-2" key={idx}>
          {itemChunk.map((item) => (
            <Button
              key={item.display}
              name={section}
              id={`${item.display}`}
              variant={isSelected(item) ? 'primary' : 'secondary'}
              onClick={() => {
                setField(item);
                scrollTo();
              }}
            >
              {item.display}
            </Button>
          ))}
        </ButtonGroup>
      ))}
      <div id={`${section}-scroll`} ref={scrollRef} />
    </Row>
  );
};

export default PlayerBuilder;
