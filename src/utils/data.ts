import { Chance } from "chance";
import { Subtract } from "type-fest/source/internal";
import { Build, Distances, Effect, Enemy, EnemyStats, Item, Player, PlayerStats, Ranges, Snapshot, StatsFunRepo, UpTo, Play, effectFunCall } from "./types";

export const startState = (play: Play): Snapshot => play.states[0];
export const previousState = (play: Play): Snapshot => play.states[play.states.length - 1];

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

export const effectDead: Effect =
  { display: "⚰", tooltip: "⚰", priority: 4, effects: [effectFunCall(["Monster:Dead"])], range: allRanges };

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
          tooltip: "Skip the turn and restore stamina",
          priority: 4,
          stamina: 0,
          range: selfRange,
          effects: [effectFunCall(['Basic:Rest'])]
        },
        {
          display: "Advance",
          tooltip: "Move closer",
          priority: 4,
          stamina: 1,
          range: selfRange,
          effects: [effectFunCall(['Basic:Advance'])]
        },
        {
          display: "Retreat",
          tooltip: "Move further",
          effects: [effectFunCall(["Basic:Retreat"])],
          priority: 4,
          stamina: 1,
          range: selfRange,
        },
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
          tooltip: "Chop",
          effects: [effectFunCall(["Axe:Chop"])],
          priority: 2,
          stamina: 2,
          range: makeRange(0, 1),
        },
        {
          display: "Cut",
          tooltip: "Cut",
          effects: [effectFunCall(['Monster:Stats', [['+', 'hp', -2]]])],
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
          tooltip: "Moves enemy closer",
          effects: [effectFunCall(["Hook:GetHere"])],
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
  footwear: [{
    display: "Boots of Dooooodge!",
  },
  {
    display: "Boots of Flight",
    eot: [{
      display: "Flight!",
      tooltip: "Increases distance by 2 every turn",
      priority: 0,
      range: allRanges,
      effects: [effectFunCall(['BootsOfFlight:EOT'])],
    }],
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Swipe"])], range: makeRange(0, 1) },
      { display: "Roar", tooltip: "Swipe", priority: 1, effects: [effectFunCall(["Monster:Roar"])], range: allRanges },
      { display: "Jump", tooltip: "Swipe", priority: 2, effects: [effectFunCall(["Monster:Jump"])], range: makeRange(2, 3, 4) },
    ],
  }, {
    hp: 25,
    rage: 0,
    distance: 4,
  }],
  [{
    lore: {
      name: "Toro",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Swipe"])], range: allRanges },
      { display: "Jump", tooltip: "Jump", priority: 2, effects: [effectFunCall(["Monster:Jump"])], range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
    ]
  }, {
    hp: 22,
    rage: 0,
    distance: 4,
  }],
  [{
    lore: {
      name: "Summoner",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Swipe"])], range: makeRange(0, 1) },
      { display: "Jump", tooltip: "Jump", priority: 3, effects: [effectFunCall(["Monster:Jump"])], range: allRanges },
      { display: "Summon Toro", tooltip: "Summon Toro", priority: 4, effects: [effectFunCall(["Monster:Summon", { enemy: 1 }])], range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 1, 2, 0, 0],
      [1, 1, 2, 0, 0],
      [1, 2, 2, 0, 0],
    ]
  }, {
    hp: 30,
    rage: 0,
    distance: 4,
  }],
  [{
    lore: {
      name: "Body",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Swipe"])], range: makeRange() },
    ],
    rolls: [
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
  }, {
    hp: 300,
    rage: 0,
    distance: 0,
  }],

  [{
    lore: {
      name: "Smol",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Swipe"])], range: makeRange() },
    ],
    rolls: [
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
  }, {
    hp: 5,
    rage: 0,
    distance: 0,
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