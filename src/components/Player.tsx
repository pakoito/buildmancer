import React from 'react';
import {
  Card,
  Button,
  Stack,
  ToggleButton,
  ButtonGroup,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap';
import {
  DisabledSkills,
  InventoryStats,
  Player,
  PlayerStats,
  safeEntries,
} from '../game/types';
import { Set } from 'immutable';
import { clamp } from '../game/zFunDump';
import { playerActions } from '../game/playGame';

const PlayerCard: React.FC<{
  selectedButtons: Set<string>;
  player: Player;
  playerStats: PlayerStats;
  inventoryStats: InventoryStats;
  canAct: boolean;
  lastAction: string | undefined;
  onClickEffect: (index: number) => void;
  disabledSkills: DisabledSkills;
  hotkeys: string[];
  setDisabledSkills: (skills: DisabledSkills) => void;
}> = ({
  selectedButtons,
  player,
  playerStats,
  inventoryStats,
  onClickEffect,
  canAct,
  lastAction,
  disabledSkills,
  setDisabledSkills,
  hotkeys,
}) => {
  const passives = safeEntries(player.build).map(
    ([k, e]) => [k, e, [...(e.bot ?? []), ...(e.eot ?? [])]] as const
  );

  const passiveCount = passives.reduce(
    (acc, [_k, _e, passives]) => acc + passives.length,
    0
  );
  const hasPassives = passiveCount > 0;
  const staminaPerTurn =
    playerStats.staminaPerTurn.current -
    2 * (passiveCount - disabledSkills.length);

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          {player.lore.name}
          {playerStats.hp.current > 0 ? '' : <b> 💀DEAD💀 </b>}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {player.build.class.display}
        </Card.Subtitle>
        <Card.Text>
          Attack {playerStats.attack.current} | Defence{' '}
          {playerStats.defence.current} | Speed {playerStats.speed.current}
        </Card.Text>
        <Card.Text>{playerStats.hp.current} ❤</Card.Text>
        <Card.Text>
          {playerStats.stamina.current}/{playerStats.stamina.max} 💪 (
          {staminaPerTurn >= 0 && '+'}
          {staminaPerTurn})
        </Card.Text>
        {playerStats.status.bleed.turns > 0 && (
          <Card.Text>{playerStats.status.bleed.turns} 🩸</Card.Text>
        )}
        {lastAction && <Card.Text>Last action: {lastAction}</Card.Text>}
      </Card.Body>
      {canAct && hasPassives && (
        <>
          <b>Passives (-2 💪 each)</b>
          <ButtonGroup>
            {passives.map(
              ([k, _i, effs]) =>
                effs.length > 0 &&
                effs.map((e, idx) => (
                  <OverlayTrigger
                    key={idx}
                    placement="right"
                    delay={{ show: 100, hide: 250 }}
                    overlay={
                      <Popover>
                        <Popover.Header as="h3">{e.display}</Popover.Header>
                        <Popover.Body>{e.tooltip}</Popover.Body>
                      </Popover>
                    }
                  >
                    <ToggleButton
                      checked={!Set(disabledSkills).has(k)}
                      value={k}
                      id={`passive-skill-${k}`}
                      type="checkbox"
                      variant="outline-primary"
                      onChange={(event) =>
                        setDisabledSkills(
                          event.currentTarget.checked
                            ? Set(disabledSkills).delete(k).toArray()
                            : Set(disabledSkills).add(k).toArray()
                        )
                      }
                    >
                      {e.display}
                    </ToggleButton>
                  </OverlayTrigger>
                ))
            )}
          </ButtonGroup>
        </>
      )}
      {canAct && (
        <Card.Body>
          <Stack direction="horizontal" gap={2}>
            {playerActions(player, inventoryStats).map((e, idx) => (
              <OverlayTrigger
                key={e.display}
                placement="top"
                delay={{ show: 100, hide: 250 }}
                overlay={
                  <Popover>
                    <Popover.Header as="h3">{e.display}</Popover.Header>
                    <Popover.Body>{e.tooltip}</Popover.Body>
                  </Popover>
                }
              >
                <div>
                  <Button
                    active={selectedButtons.has(e.display)}
                    disabled={playerStats.stamina.current < e.stamina}
                    onClick={(_) => onClickEffect(idx)}
                  >
                    [<i>{hotkeys[idx]}</i>] <b>{e.display}</b>
                  </Button>
                  <br />
                  <Card.Text>
                    💪:{e.stamina} ⏱:
                    {clamp(e.priority - playerStats.speed.current, 0, 4)}
                    <br />
                    🏹:
                    {e.range.length === 5 ? 'All' : e.range.join(', ')}
                  </Card.Text>
                </div>
              </OverlayTrigger>
            ))}
          </Stack>
        </Card.Body>
      )}
    </Card>
  );
};

export default PlayerCard;
