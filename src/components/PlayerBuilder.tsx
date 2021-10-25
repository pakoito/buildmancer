import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

import { Player } from "../types";
import { build } from "../utils";

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
      lore: {
        name: "Paco",
        age: 34,
      },
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
  return (
    <Container fluid>
      <Row className="g-2">
        <Col>
          <Form onSubmit={onFormSubmit}>
            {selects.map(({ type, options }) => (
              <Form.Group
                key={type}
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>{type}</Form.Label>
                  {options.map(({ display, value }) => (
                    <Form.Check
                      key={value}
                      type="radio"
                      label={display}
                      name={type}
                      id={`${value}`}
                      checked={form[type] === value}
                      onChange={() => {
                        setField(type, value)
                      }}
                    />
                  ))}
              </Form.Group>
            ))}
            <Button type="submit">Submit</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayerBuilder;
