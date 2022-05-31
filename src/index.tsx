import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Button, Card, Col, Container, Navbar, Row } from 'react-bootstrap';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Container fluid>
      <Row>
        <App />
      </Row>
      <Card>
        <Card.Body>
          <Row>
            <Col xs={10}>
              <Card.Text>
                Buildmancer by pakoito (2022) for the{' '}
                <a
                  href={
                    'https://boardgamegeek.com/thread/2875719/2022-solitaire-print-and-play-contest'
                  }
                >
                  BGG's 2022 Solitaire Print and Play Contest
                </a>
                . Send your feedback and Replays to the{' '}
                <a
                  href={
                    'https://boardgamegeek.com/thread/2858500/wip-buildmancer-pre-release-tinkering-player-build'
                  }
                >
                  game entry thread
                </a>
                !
              </Card.Text>
            </Col>
            <Col>
              <Button variant="secondary" active={false}>
                [TBD] Print and Play
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
