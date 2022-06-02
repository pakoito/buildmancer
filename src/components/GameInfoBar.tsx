import React from 'react';
import { Card, Row, Col, Button, Modal, ButtonGroup } from 'react-bootstrap';

const contestThread =
  'https://boardgamegeek.com/thread/2875719/2022-solitaire-print-and-play-contest';
const gameThread =
  'https://boardgamegeek.com/thread/2858500/wip-buildmancer-pre-release-tinkering-player-build';

const GameInfoBar = () => {
  const [areRulesShown, showRules] = React.useState(false);
  return (
    <>
      <Card>
        <Card.Body>
          <Row className="d-flex justify-content-between align-items-center">
            <Col xs={8}>
              <Card.Text>
                Buildmancer by pakoito (2022) for the{' '}
                <a href={contestThread}>BGG's 2022 Solitaire Print and Play Contest</a>. Send your
                feedback and Replays to the <a href={gameThread}>game entry thread</a>!
              </Card.Text>
            </Col>
            <Col>
              <ButtonGroup size="lg">
                <Button onClick={() => showRules(true)}>Rules</Button>
                <Button variant="secondary" active={false}>
                  {'Print & Play'}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Modal
        fullscreen={true}
        show={areRulesShown}
        onHide={() => showRules(false)}
        scrollable={true}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Buildmancer Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Buildmancer has your standard turn-based JRPG rules. If you're familiar with Pokemon,
          Final Fantasy or Dragon Quest you will be right at home.
          <br />
          <br />
          As a player, you win 🎉 if you reduce your Enemy's health ❤ to 0.
          <br />
          You lose 💀 if your health ❤ becomes 0.
          <br />
          <br />
          Each turn you select one Skill to use, from the ones given by your Background and
          Equipment.
          <br />
          Enemies will choose one of their Skills with a fair roll of a dice.
          <br />
          Some Skills are Passive, which means they will be active on top of your chosen Skill.
          <br />
          <br />
          Skills can do an amount of damage that is increased or reduced by the Attack and Defense
          stats.
          <br />
          Skills cost stamina 💪 to use. You have a maximum amount of total stamina, and an amount
          that is restored per turn. Passive Skills consume additional stamina.
          <br />
          Skills also have initiative ⏱, and the lowest between your Skill and your enemy's
          determines which one will be resolved first. It is modified by your Speed stat.
          <br />
          Skills have a determined range 🏹, and whiff if the targeted enemy is outside of it at the
          moment of the attack. Use movement Skills to get in and out of danger!
          <br />
          <br />
          Skills can apply status effects to you or the enemy:
          <br />
          &emsp;<i>Shield</i>: absorbs up to X damage this turn
          <br />
          &emsp;<i>Bleed</i>: increases any instances of damage by 1 for several turns
          <br />
          &emsp;<i>Poison</i>: deals 1 damage at the end of the turn for several turns
          <br />
          &emsp;<i>Dodge</i>: avoids the next attack this turn Stun: skips all the current turn
          actions
          <br />
          <br />
          Experiment with different Backgrounds and Equipments to get additional stats, and beat the
          different play modes!
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button onClick={() => globalThis.open(gameThread, '_blank')}>Send Feedback</Button>
            <Button onClick={() => showRules(false)}>Close</Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GameInfoBar;
