import React from "react";
import { Card, Button, Stack, ToggleButton, ButtonGroup } from "react-bootstrap";
import { DisabledSkills, Player, PlayerStats } from "../utils/types";
import { Set } from 'immutable';

const PlayerCard: React.FC<{
  selectedButtons: Set<string>,
  player: Player;
  playerStats: PlayerStats;
  canAct: boolean;
  lastAction: string | undefined;
  onClickEffect: (index: number) => void;
  disabledSkills: DisabledSkills;
  setDisabledSkills: (skills: DisabledSkills) => void;
}> = ({ selectedButtons, player, playerStats, onClickEffect, canAct, lastAction, disabledSkills, setDisabledSkills }) => (
  <Card>
    <Card.Body>
      <Card.Title>{player.lore.name}{playerStats.hp > 0 ? "" : (<b> 💀DEAD💀 </b>)}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        {player.build.class.display}
      </Card.Subtitle>
      <Card.Text>{playerStats.hp} ❤ {playerStats.stamina} 💪</Card.Text>
      {lastAction && (<Card.Text>Last action: {lastAction}</Card.Text>)}
    </Card.Body>
    {canAct && (<>
      <b>Passives</b>
      <ButtonGroup>
        {Object.entries(player.build)
          .map(([k, e]) => [k, e, [...(e.bot ?? []), ...(e.eot ?? [])]] as const)
          .map(([k, e, passives], idx) => passives.length > 0 && (
            <ToggleButton
              key={idx}
              checked={!Set(disabledSkills).has(k)}
              value={k}
              id={`passive-skill-${k}`}
              type="checkbox"
              variant="outline-primary"
              onChange={(event) => setDisabledSkills(
                event.currentTarget.checked
                  ? Set(disabledSkills).delete(k).toArray()
                  : Set(disabledSkills).add(k).toArray())}>
              {e.display}
            </ToggleButton>
          ))}
      </ButtonGroup>
    </>)}
    {canAct && (<Card.Body>
      <Stack direction="horizontal" gap={2}>
        {Object.values(player.build)
          .flatMap((a) => a.effects ?? [])
          .map((e, idx) => (<>
            <Button
              key={e.display}
              active={selectedButtons.has(e.display)}
              disabled={playerStats.stamina < e.stamina}
              onClick={(_) => onClickEffect(idx)}
            >
              [<i>{idx + 1}</i>] <b>{e.display}</b>
            </Button>
            <br key={`$br-{idx}`} />
            <Card.Text key={`footer-${idx}`}>💪:{e.stamina} ⏱:{e.priority}<br />🏹:{e.range.length === 5 ? 'Any' : e.range.map(a => a + 1).join(", ")}</Card.Text>
          </>
          ))}
      </Stack>
    </Card.Body>)}
  </Card>
);

export default PlayerCard;
