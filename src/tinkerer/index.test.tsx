import { Seq } from 'immutable';
import { Play } from '../playGame';
import { build, enemies } from '../utils';
import tinkerer, { defaultTinkererOptions, IndexPlay } from './tinkerer';
import prettyjson from 'prettyjson';
import { ScoredPhenotype } from '../geneticalgorithm/geneticalgorithm';

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

test('Some gens', () => {
  const results = tinkerer(play, 5, "PACO", { ...defaultTinkererOptions, debug: false });
  const best: ScoredPhenotype<IndexPlay> = Seq(results).maxBy(a => a.score);
  const lastState = best.phenotype[1].states[best.phenotype[1].states.length - 1];
  console.log(`BEST BY ${best.score}\n` +
    prettyjson.render([
      lastState.lastAttacks.flatMap(([target, id]) => [target === 'Player' ? 'Player' : `[${target}] ${lastState.enemies[target].lore.name}`, id]),
      lastState.enemies.flatMap((a, idx) => [`[${idx}] ${a.lore.name}`, a.stats]),
      lastState.player.stats
    ])
  );
});
