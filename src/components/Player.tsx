import React from 'react';
import {
  Card,
  Button,
  ToggleButton,
  ButtonGroup,
  Popover,
  OverlayTrigger,
  Container,
  Row,
} from 'react-bootstrap';
import {
  BuildRepository,
  DisabledSkills,
  InventoryEffect,
  InventoryStats,
  Item,
  Player,
  PlayerStats,
  safeEntries,
} from '../game/types';
import { Seq, Set } from 'immutable';
import { clamp } from '../game/zFunDump';
import { playerItemActions } from '../game/playGame';

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
    ([k, e]) =>
      [k, e, [...(e.bot ?? []), ...(e.eot ?? [])]] as [
        keyof BuildRepository,
        Item,
        InventoryEffect[]
      ]
  );

  const disabled = Set(disabledSkills);

  const [passiveCount, passiveStamina] = passives.reduce(
    ([count, sta], [k, _e, p]) => [
      count + p.length,
      sta + (disabled.has(k) ? 0 : p.reduce((acc, s) => acc + s.stamina, 0)),
    ],
    [0, 0]
  );
  const hasPassives = passiveCount > 0;
  const staminaPerTurn = playerStats.staminaPerTurn.current - passiveStamina;

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
      <Container>
        {canAct && hasPassives && (
          <Row>
            <b>Passives</b>
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
                        checked={!disabled.has(k)}
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
                        {e.display} (💪: {e.stamina})
                      </ToggleButton>
                    </OverlayTrigger>
                  ))
              )}
            </ButtonGroup>
          </Row>
        )}
        {canAct &&
          Seq(playerItemActions(player, inventoryStats))
            .map((a, idx) => [idx, a] as const)
            .groupBy(([idx, [i, _e]]) => i.display)
            .toArray()
            .map(([k, effects]) => (
              <Row key={k}>
                <b>{k}</b>
                <ButtonGroup>
                  {effects
                    .map(([idx, [_i, e]]) => (
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
                            {clamp(
                              e.priority - playerStats.speed.current,
                              0,
                              4
                            )}
                            <br />
                            🏹:
                            {e.range.length === 5 ? 'All' : e.range.join(', ')}
                          </Card.Text>
                        </div>
                      </OverlayTrigger>
                    ))
                    .toArray()}
                </ButtonGroup>
              </Row>
            ))}
      </Container>
    </Card>
  );
};

export default PlayerCard;
