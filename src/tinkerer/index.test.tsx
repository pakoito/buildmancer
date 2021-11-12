import { Play } from '../playGame';
import { build, enemies } from '../utils';
import tinkerer from './tinkerer'

const play: Play = {
  states: [{
    player: {
      id: "1",
      lore: {
        name: "XXX",
        age: 123,
      },
      stats: {
        hp: 10,
        stamina: 8,
        staminaPerTurn: 2,
      },
      build: {
        basic: build.basic[0],
        class: build.class[0],
        weapon: build.weapon[0],
        skill: build.skill[0],
        offhand: build.offhand[0],
        consumable: build.consumable[0],
        armor: build.armor[0],
        headgear: build.headgear[0],
        footwear: build.footwear[0],
        charm: build.charm[0],
      }
    },
    enemies: [enemies[0]],
    target: 0,
    lastAttacks: [],
  }]
}

test('10 gens', () => {
  const result = tinkerer(play, 10, "PACO");
  expect(result).toMatchSnapshot();
});
