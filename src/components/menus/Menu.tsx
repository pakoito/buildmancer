import React from 'react';
import { Container, Card, Row, Button } from 'react-bootstrap';

const Menu: React.FC<{
  title: string;
  states: string[];
  onClick: (value: string) => void;
}> = ({ title, states, onClick }) => (
  <Container fluid style={{ marginBottom: '105px' }}>
    <Row className="g-2">
      <Card.Title>{title}</Card.Title>
    </Row>
    {states.map((state) => (
      <Row className="g-2" key={state}>
        <Button
          size="lg"
          className="mb-2"
          key={state}
          variant={'primary'}
          onClick={() => {
            onClick(state);
          }}
        >
          {state}
        </Button>
      </Row>
    ))}
  </Container>
);

export default Menu;
