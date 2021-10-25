import React from "react";
import { Card, Button, Stack } from "react-bootstrap";
import { Player, EffectFun } from "../types";

const PlayerCard: React.FC<{
  player: Player;
  onClickEffect: (effect: EffectFun) => void;
}> = ({ player, onClickEffect }) => (
  <Card>
    <Card.Body>
      <Card.Title>{player.lore.name}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        {player.build.class.display}
      </Card.Subtitle>
      <Card.Text>Has {player.stats.hp} HP</Card.Text>
    </Card.Body>
    <Card.Body>
      <Stack direction="horizontal" gap={2}>
      {Object.values(player.build).flatMap((a) =>
        a.effects.map((e) => (
          <Button
            key={e.display}
            onClick={(_) => {
              onClickEffect(e.effect);
            }}
          >
            {e.display}
          </Button>
        )),
      )}
      </Stack>
    </Card.Body>
  </Card>
);

export default PlayerCard;
