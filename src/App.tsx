import Button from '@restart/ui/esm/Button';
import React, { useState } from 'react';
import './App.css';
import { readString } from 'react-papaparse'

type Snapshot = { player: PlayerStats, monster: MonsterStats };
type EffectFun = (start: Snapshot, curr: Snapshot) => Snapshot;

const snap = ([player, monster]: [PlayerStats, MonsterStats]) => ({ player, monster })

const chain = (...funs: Array<EffectFun>): EffectFun =>
  funs.reduce((acc, value) => (start, curr) => acc(start, value(start, curr)));

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const skills = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap([curr.player, { ...curr.monster, hp: clamp(curr.monster.hp - amount, 0, start.monster.hp) }]),
  changeDistance: (curr: Snapshot, amount: number): Snapshot =>
    snap([curr.player, { ...curr.monster, distance: clamp(curr.monster.distance + amount, 1, 5) }]),

  attackPlayer: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap([{ ...curr.player, hp: clamp(curr.player.hp - amount, 0, start.player.hp) }, curr.monster]),
  reducePlayerStamina: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap([{ ...curr.player, stamina: clamp(curr.player.stamina - amount, 0, start.player.stamina) }, curr.monster]),
}

const build: Record<string, [{ display: string, effects: { display: string, effect: EffectFun }[], [key: string]: any; }]> = {
  class: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  skill: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  weapon: [
    {
      display: "Warrior",
      effects: [
        {
          display: "Chop",
          effect: (player, monster) => skills.attackMonster(player, monster, 3),
        },
        {
          display: "Cut",
          effect: (player, monster) => skills.attackMonster(player, monster, 3),
        }
      ]
    }
  ],
  offhand: [
    {
      display: "Warrior",
      effects: [{
        display: "Bla",
        effect: chain(
          (start, curr) => skills.attackMonster(start, curr, 3),
          (start, curr) => skills.reducePlayerStamina(start, curr, 2),
          (_, curr) => skills.changeDistance(curr, -1),
        )
      }],
    }
  ],
  consumable: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  armor: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  headgear: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  footwear: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
  charm: [
    {
      display: "Warrior",
      effects: [],
    }
  ],
}

const enemies = [
  {
    display: "Sacapuntas",
    stats: {
      hp: 25,
      rage: 0,
      distance: 5
    },
  }
]

const prop = {
  versus: {
    player: {
      stats: {
        hp: 10,
        stamina: 8,
      },
      build: {
        class: build.class[0],
        skill: build.skill[0],
        weapon: build.weapon[0],
        offhand: build.offhand[0],
        consumable: build.consumable[0],
        armor: build.armor[0],
        headgear: build.headgear[0],
        footwear: build.footwear[0],
        charm: build.charm[0],
      }
    },
    enemies: [enemies[0]]
  }
}

function App() {
  return (<Game versus={prop.versus} />);
}

type User = {
  name: string,
  age: number,
}

const monsterStats = enemies[0].stats;
type MonsterStats = typeof monsterStats;
type PlayerStats = typeof prop.versus.player.stats;

const Game = ({ versus: { player, enemies } }: typeof prop): JSX.Element => {
  const [playerState, updatePlayerState] = useState({ ...player.stats });
  const [monsterState, updateMonsterState] = useState({ ...enemies[0].stats });
  const [selectedMonster, updateSelectedMonster] = useState(0);

  const data = readString<User>("name,age\na,2\nb,3", { header: true, dynamicTyping: true }).data

  return (<div className="App">
    <header className="App-header">
      <p>
        Paco, the {player.build.class.display}. Has {playerState.hp} HP
      </p>
      {enemies.map(enemy =>
        <p key={enemy.display}>
          {enemy.display}. Has {monsterState.hp} HP and is at distance {monsterState.distance}
        </p>
      )}
      {Object.values(player.build).flatMap(a => a.effects.map(e => <Button key={e.display} onClick={(_) => {
        const newState = e.effect(snap([player.stats, enemies[selectedMonster].stats]), snap([playerState, monsterState]));
        updatePlayerState(newState.player);
        updateMonsterState(newState.monster);
      }}>{e.display}</Button>))}
    </header>
  </div >);
}

export default App;
