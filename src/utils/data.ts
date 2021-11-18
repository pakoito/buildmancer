import { Chance } from "chance";
import { paramsRender } from "../tinkerer/tinkererCLI";
import { Subtract } from "type-fest/source/internal";
import { actions } from "./playGame";
import { Build, Distances, Effect, EffectFun, EffectFunRepo, Enemy, EnemyStats, Item, MonsterTarget, Player, PlayerStats, Ranges, Snapshot, StatsFunRepo, UpTo, Play, MultiTurnEffectFunRepo, MultiTurnEffectFun } from "./types";

export const startState = (play: Play): Snapshot => play.states[0];
export const previousState = (play: Play): Snapshot => play.states[play.states.length - 1];

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  // TODO check direction of the fold
  funs.reduce((acc, value) => (origin, play, newState) => value(origin, play, acc(origin, play, newState)));

export const chain2 = (...funs: Array<MultiTurnEffectFun>): MultiTurnEffectFun =>
  // TODO check direction of the fold
  funs.reduce((acc, value) => (params) => (origin, play, oldState) => {
    const [newPlay, newState] = acc(params)(origin, play, oldState);
    return value(params)(origin, newPlay, newState);
  });

export const randomEnemy = (): [Enemy, EnemyStats] => new Chance().pickone(enemies);

export const randomPlayer = (statsOverride?: PlayerStats, buildOverride?: Build): [Player, PlayerStats] => {
  const rng = new Chance();
  return [{
    id: rng.string(),
    lore: {
      name: randomName(),
      age: rng.age(),
    },
    build: {
      basic: rng.pickone(build.basic),
      class: rng.pickone(build.class),
      armor: rng.pickone(build.armor),
      weapon: rng.pickone(build.weapon),
      offhand: rng.pickone(build.offhand),
      footwear: rng.pickone(build.footwear),
      headwear: rng.pickone(build.headwear),
      charm: rng.pickone(build.charm),
      ...buildOverride,
    }
  }, {
    hp: 25,
    stamina: 8,
    staminaPerTurn: 2,
    ...statsOverride,
  }];
}

export const makeRange = (...number: UpTo<Subtract<Distances, 1>>[]) => [...new Set(number)] as Ranges;
export const allRanges = makeRange(0, 1, 2, 3, 4);
export const selfRange = allRanges;

export const effectDead: Effect = { display: "DEAD", priority: 4, effect: "Monster:Dead", range: makeRange() };
export const effectRepository: EffectFunRepo = {
  'Monster:Dead': (_origin, _play, newState) => newState,
  'Basic:Rest': (_origin, _play, newState) => newState,
  'Basic:Advance': (_origin, _play, newState) => actions.changeDistance(newState, newState.target, -2),
  'Basic:Retreat': (_origin, _play, newState) => actions.changeDistance(newState, newState.target, 2),
  'Axe:Chop': (_, play, currentState) => actions.attackMonster(startState(play), currentState, currentState.target, 3),
  'Axe:Cut': chain(
    (_, play, currentState) => actions.attackMonster(startState(play), currentState, currentState.target, 3),
    (origin, _p, currentState) => actions.addEotEffect(currentState, { effect: 'Target:Bleed', origin, parameters: { lifespan: 3, target: currentState.target } })
  ),
  'Hook:GetHere': chain(
    (_, play, currentState) => actions.attackMonster(startState(play), currentState, currentState.target, 3),
    (_origin, _play, currentState) => actions.changeDistance(currentState, currentState.target, -1),
  ),
  'Monster:Swipe': (_, play, currentState) => actions.attackPlayer(startState(play), currentState, 2),
  'Monster:Roar': (_, play, currentState) => actions.modifyPlayerStamina(startState(play), currentState, -5),
  'Monster:Jump': (origin, _, currentState) => actions.changeDistance(currentState, origin, -2),
  'Monster:Summon': (origin, _, currentState) => actions.addEotEffect(currentState, { effect: 'Monster:Summon', origin, parameters: { enemy: 0 } }),
  'BootsOfFlight:EOT': (_, _p, currentState) => currentState.enemies.reduce((s, _m, idx) => actions.changeDistance(s, idx as MonsterTarget, -2), currentState),
};

export const multiTurnEffectRepository: MultiTurnEffectFunRepo = {
  'Target:Bleed': chain2(
    ({ target }) => (origin, play, currentState) => [play, target === 'Player' ? actions.attackPlayer(startState(play), currentState, 1) : actions.attackMonster(startState(play), currentState, target, 3)],
    ({ lifespan }) => (origin, play, currentState) => [play, lifespan > 0 ? actions.addEotEffect(currentState, { effect: 'Target:Bleed', origin, parameters: { ...paramsRender, lifespan: lifespan - 1 } }) : currentState],
  ),
  'Monster:Summon': ({ enemy }) => (_, play, currentState) => actions.addEnemy(play, currentState, enemies[enemy][0], enemies[enemy][1]),
};

export const statsRepository: StatsFunRepo = {
  'Charm:ofHealth': (player, enemies) => [{ ...player, hp: player.hp + 10 }, enemies],
  'Charm:ofHaste': (player, enemies) => [{ ...player, staminaPerTurn: player.staminaPerTurn + 1 }, enemies],
  'Charm:ofResilience': (player, enemies) => [{ ...player, stamina: player.stamina + 10 }, enemies],
}

export const build: Record<
  string,
  Item[]
> = {
  basic: [
    {
      display: "Basic",
      effects: [
        {
          display: "Rest",
          effect: "Basic:Rest",
          priority: 4,
          stamina: 0,
          range: selfRange,
        },
        {
          display: "Advance",
          effect: "Basic:Advance",
          priority: 4,
          stamina: 1,
          range: selfRange,
        },
        {
          display: "Retreat",
          effect: "Basic:Retreat",
          priority: 4,
          stamina: 1,
          range: selfRange,
        }
      ]
    }
  ],
  class: [
    {
      display: "Warrior",
    },
    {
      display: "Mage",
    },
    {
      display: "Rogue",
    },
  ],
  skill: [
    {
      display: "Sturdy",
    },
    {
      display: "Nimble",
    },
  ],
  weapon: [
    {
      display: "Axe",
      effects: [
        {
          display: "Chop",
          effect: "Axe:Chop",
          priority: 2,
          stamina: 2,
          range: makeRange(0, 1),
        },
        {
          display: "Cut",
          effect: "Axe:Cut",
          priority: 3,
          stamina: 2,
          range: makeRange(0),
        },
      ],
    },
  ],
  offhand: [
    {
      display: "Hook",
      effects: [
        {
          display: "Get over here!",
          effect: "Hook:GetHere",
          priority: 4,
          stamina: 3,
          range: makeRange(2, 3, 4),
        },
      ],
    },
  ],
  consumable: [
    {
      display: "Potion",
    },
  ],
  armor: [
    {
      display: "Heavy",
    },
  ],
  headgear: [
    {
      display: "Helm",
    },
  ],
  footwear: [
    {
      display: "Boots of Flight",
      eot: ["BootsOfFlight:EOT"],
    },
  ],
  charm: [
    {
      display: "of Health",
      passive: "Charm:ofHealth",
    },
    {
      display: "of Haste",
      passive: "Charm:ofHaste",
    },
    {
      display: "of Resilience",
      passive: "Charm:ofResilience",
    },
  ],
};

export const randomName = () => names[Math.floor(Math.random() * names.length)];

export const enemies: [Enemy, EnemyStats][] = [
  [{
    lore: {
      name: "Sacapuntas",
    },
    rolls: [
      [0, 1, 2, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 2, 1, 0, 0],
    ],
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe", range: makeRange(0, 1) },
      { display: "Roar", priority: 1, effect: "Monster:Roar", range: makeRange(0, 1, 2, 3, 4) },
      { display: "Jump", priority: 2, effect: "Monster:Jump", range: makeRange(2, 3, 4) },
    ],
  }, {
    hp: 25,
    rage: 0,
    distance: 4,
  }],
  [{
    lore: {
      name: "Cacahue",
    },
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe", range: makeRange(0, 1) },
      { display: "Roar", priority: 1, effect: "Monster:Roar", range: makeRange(0, 1, 2, 3, 4) },
      { display: "Jump", priority: 2, effect: "Monster:Jump", range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ]
  }, {
    hp: 30,
    rage: 0,
    distance: 4,
  }],
  [{
    lore: {
      name: "Toro",
    },
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe", range: makeRange(0, 1) },
      { display: "Roar", priority: 1, effect: "Monster:Roar", range: makeRange(0, 1, 2, 3, 4) },
      { display: "Jump", priority: 2, effect: "Monster:Jump", range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ]
  }, {
    hp: 22,
    rage: 0,
    distance: 4,
  }],
];

const names = [
  "Lydan",
  "Syrin",
  "Ptorik",
  "Joz",
  "Varog",
  "Gethrod",
  "Hezra",
  "Feron",
  "Ophni",
  "Colborn",
  "Fintis",
  "Gatlin",
  "Jinto",
  "Hagalbar",
  "Krinn",
  "Lenox",
  "Revvyn",
  "Hodus",
  "Dimian",
  "Paskel",
  "Kontas",
  "Weston",
  "Azamarr ",
  "Jather ",
  "Tekren ",
  "Jareth",
  "Adon",
  "Zaden",
  "Eune ",
  "Graff",
  "Tez",
  "Jessop",
  "Gunnar",
  "Pike",
  "Domnhar",
  "Baske",
  "Jerrick",
  "Mavrek",
  "Riordan",
  "Wulfe",
  "Straus",
  "Tyvrik ",
  "Henndar",
  "Favroe",
  "Whit",
  "Jaris",
  "Renham",
  "Kagran",
  "Lassrin ",
  "Vadim",
  "Arlo",
  "Quintis",
  "Vale",
  "Caelan",
  "Yorjan",
  "Khron",
  "Ishmael",
  "Jakrin",
  "Fangar",
  "Roux",
  "Baxar",
  "Hawke",
  "Gatlen",
  "Barak",
  "Nazim",
  "Kadric",
  "Paquin",
  "Kent",
  "Moki",
  "Rankar",
  "Lothe",
  "Ryven",
  "Clawsen",
  "Pakker",
  "Embre",
  "Cassian",
  "Verssek",
  "Dagfinn",
  "Ebraheim",
  "Nesso",
  "Eldermar",
  "Rivik",
  "Rourke",
  "Barton",
  "Hemm",
  "Sarkin",
  "Blaiz ",
  "Talon",
  "Agro",
  "Zagaroth",
  "Turrek",
  "Esdel",
  "Lustros",
  "Zenner",
  "Baashar ",
  "Dagrod ",
  "Gentar",
  "Feston",
  "Syrana",
  "Resha",
  "Varin",
  "Wren",
  "Yuni",
  "Talis",
  "Kessa",
  "Magaltie",
  "Aeris",
  "Desmina",
  "Krynna",
  "Asralyn ",
  "Herra",
  "Pret",
  "Kory",
  "Afia",
  "Tessel",
  "Rhiannon",
  "Zara",
  "Jesi",
  "Belen",
  "Rei",
  "Ciscra",
  "Temy",
  "Renalee ",
  "Estyn",
  "Maarika",
  "Lynorr",
  "Tiv",
  "Annihya",
  "Semet",
  "Tamrin",
  "Antia",
  "Reslyn",
  "Basak",
  "Vixra",
  "Pekka ",
  "Xavia",
  "Beatha ",
  "Yarri",
  "Liris",
  "Sonali",
  "Razra ",
  "Soko",
  "Maeve",
  "Everen",
  "Yelina",
  "Morwena",
  "Hagar",
  "Palra",
  "Elysa",
  "Sage",
  "Ketra",
  "Lynx",
  "Agama",
  "Thesra ",
  "Tezani",
  "Ralia",
  "Esmee",
  "Heron",
  "Naima",
  "Rydna ",
  "Sparrow",
  "Baakshi ",
  "Ibera",
  "Phlox",
  "Dessa",
  "Braithe",
  "Taewen",
  "Larke",
  "Silene",
  "Phressa",
  "Esther",
  "Anika",
  "Rasy ",
  "Harper",
  "Indie",
  "Vita",
  "Drusila",
  "Minha",
  "Surane",
  "Lassona",
  "Merula",
  "Kye",
  "Jonna",
  "Lyla",
  "Zet",
  "Orett",
  "Naphtalia",
  "Turi",
  "Rhays",
  "Shike",
  "Hartie",
  "Beela",
  "Leska",
  "Vemery ",
  "Lunex",
  "Fidess",
  "Tisette",
  "Partha",
]