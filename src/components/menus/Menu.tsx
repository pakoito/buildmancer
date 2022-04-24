import React from "react";
import { Container, Row, Form, Button, ButtonGroup, Navbar } from "react-bootstrap";

const Menu: React.FC<{
  states: string[];
  onClick: (value: string) => void
}> = ({ states, onClick }) =>
    <Container fluid style={{ marginBottom: '105px' }}>{states.map(state =>
      <Row className="g-2" key={state}>
        <Button size="lg" className="mb-2"
          key={state}
          variant={'primary'}
          onClick={() => { onClick(state); }}
        >{state}</Button>
      </Row>
    )}</Container >;

export default Menu;
