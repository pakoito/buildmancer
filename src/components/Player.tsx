import React from "react";
import { Card, Button, Stack, ToggleButton, ButtonGroup, Popover, OverlayTrigger } from "react-bootstrap";
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
      <Card.Title>{player.lore.name}{playerStats.hp.current > 0 ? "" : (<b> 💀DEAD💀 </b>)}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        {player.build.class.display}
      </Card.Subtitle>
      <Card.Text>{playerStats.hp.current}/{playerStats.hp.max} ❤ {playerStats.stamina.current}/{playerStats.stamina.max} 💪</Card.Text>
      {lastAction && (<Card.Text>Last action: {lastAction}</Card.Text>)}
    </Card.Body>
    {canAct && (<>
      <b>Passives</b>
      <ButtonGroup>
        {Object.entries(player.build)
          .map(([k, e]) => [k, e, [...(e.bot ?? []), ...(e.eot ?? [])]] as const)
          .map(([k, e, passives], idx) => passives.length > 0 && (<OverlayTrigger
            placement="right"
            delay={{ show: 100, hide: 250 }}
            overlay={<Popover>
              <Popover.Header as="h3">{e.display}</Popover.Header>
              <Popover.Body>
                {e.tooltip}
              </Popover.Body>
            </Popover>}
          >
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
          </OverlayTrigger>
          ))}
      </ButtonGroup>
    </>)}
    {canAct && (<Card.Body>
      <Stack direction="horizontal" gap={2}>
        {Object.values(player.build)
          .flatMap((a) => a.effects ?? [])
          .map((e, idx) => (<OverlayTrigger
            key={e.display}
            placement="top"
            delay={{ show: 100, hide: 250 }}
            overlay={<Popover>
              <Popover.Header as="h3">{e.display}</Popover.Header>
              <Popover.Body>
                {e.tooltip}
              </Popover.Body>
            </Popover>}
          >
            <div>
              <Button
                active={selectedButtons.has(e.display)}
                disabled={playerStats.stamina.current < e.stamina}
                onClick={(_) => onClickEffect(idx)}
              >
                [<i>{idx + 1}</i>] <b>{e.display}</b>
              </Button>
              <br />
              <Card.Text>💪:{e.stamina} ⏱:{Math.max(e.priority + playerStats.speed.current)}<br />🏹:{e.range.length === 5 ? 'Any' : e.range.map(a => a + 1).join(", ")}</Card.Text>
            </div>
          </OverlayTrigger>
          ))}
      </Stack>
    </Card.Body>)}
  </Card>
);

export default PlayerCard;
