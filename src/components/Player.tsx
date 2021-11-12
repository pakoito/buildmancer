import React from "react";
import { Card, Button, Stack } from "react-bootstrap";
import { Player } from "../types";

const PlayerCard: React.FC<{
  selectedButtons: Set<string>,
  player: Player;
  onClickEffect: (index: number) => void;
}> = ({ selectedButtons, player, onClickEffect }) => (
  <Card>
    <Card.Body>
      <Card.Title>{player.lore.name}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        {player.build.class.display}
      </Card.Subtitle>
      <Card.Text>Has {player.stats.hp} HP and {player.stats.stamina} stamina</Card.Text>
    </Card.Body>
    <Card.Body>
      <Stack direction="horizontal" gap={2}>
        {Object.values(player.build)
          .flatMap((a) => a.effects)
          .map((e, idx) => (
            <Button
              key={e.display}
              active={selectedButtons.has(e.display)}
              disabled={player.stats.stamina < e.stamina}
              onClick={(_) => onClickEffect(idx)}
            >
              [<b>{e.display}</b> <i>{idx + 1}</i>]
              <br />
              Sta: {e.stamina} | Prio: {e.priority}
            </Button>
          ))}
      </Stack>
    </Card.Body>
  </Card>
);

export default PlayerCard;