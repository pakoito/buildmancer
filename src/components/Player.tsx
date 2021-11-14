import React from "react";
import { Card, Button, Stack } from "react-bootstrap";
import { Player } from "../types";

const PlayerCard: React.FC<{
  selectedButtons: Set<string>,
  player: Player;
  canAct: boolean;
  lastAction: string | undefined;
  onClickEffect: (index: number) => void;
}> = ({ selectedButtons, player, onClickEffect, canAct, lastAction }) => (
  <Card>
    <Card.Body>
      <Card.Title>{player.lore.name}{player.stats.hp > 0 ? "" : (<b> 💀DEAD💀 </b>)}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        {player.build.class.display}
      </Card.Subtitle>
      <Card.Text>{player.stats.hp} ❤ {player.stats.stamina} 💪</Card.Text>
      {lastAction && (<Card.Text>Last action: {lastAction}</Card.Text>)}
    </Card.Body>
    {canAct && (<Card.Body>
      <Stack direction="horizontal" gap={2}>
        {Object.values(player.build)
          .flatMap((a) => a.effects)
          .map((e, idx) => (<div>
            <Button
              key={e.display}
              active={selectedButtons.has(e.display)}
              disabled={player.stats.stamina < e.stamina}
              onClick={(_) => onClickEffect(idx)}
            >
              [<i>{idx + 1}</i>] <b>{e.display}</b>
            </Button>
            <Card.Text>💪:{e.stamina} ⏱:{e.priority}<br />🏹:{e.range.length === 5 ? 'Any' : e.range.map(a => a + 1).join(",")}</Card.Text>
          </div>
          ))}
      </Stack>
    </Card.Body>)}
  </Card>
);

export default PlayerCard;
