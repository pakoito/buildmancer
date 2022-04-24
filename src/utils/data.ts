import { Chance } from "chance";
import { Subtract } from "type-fest/source/internal";
import { Build, Distances, Effect, Enemy, EnemyStats, Item, Player, PlayerStats, Ranges, Snapshot, StatsFunRepo, UpTo, Play, effectFunCall, Stat, Status } from "./types";

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
      skill: rng.pickone(build.skill),
      armor: rng.pickone(build.armor),
      weapon: rng.pickone(build.weapon),
      offhand: rng.pickone(build.offhand),
      footwear: rng.pickone(build.footwear),
      headgear: rng.pickone(build.headgear),
      charm: rng.pickone(build.charm),
      ...buildOverride,
    }
  }, {
    hp: makeStat(25),
    stamina: makeStat(8),
    staminaPerTurn: makeStat(2),
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
    ...statsOverride,
  }];
}

export const makeRange = (...number: UpTo<Subtract<Distances, 1>>[]) => [...new Set(number)] as Ranges;
export const allRanges = makeRange(0, 1, 2, 3, 4);
export const selfRange = allRanges;

export const makeStat = (amount: number): Stat => ({ current: amount, max: amount });
export const defaultStatus: Status = {
  dodge: { active: false },
  armor: { amount: 0 },
  bleed: { turns: 0 }
}

export const effectDead: Effect =
  { display: "⚰", tooltip: "⚰", priority: 4, effects: [effectFunCall("Monster:Dead")], range: allRanges };

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
          effects: [effectFunCall('Basic:Rest')]
        },
        {
          display: "Advance",
          tooltip: "Move closer",
          priority: 4,
          stamina: 1,
          range: selfRange,
          effects: [effectFunCall('Basic:Advance')]
        },
        {
          display: "Retreat",
          tooltip: "Move further",
          effects: [effectFunCall("Basic:Retreat")],
          priority: 4,
          stamina: 1,
          range: selfRange,
        },
        {
          display: "Dodge",
          tooltip: "Avoid 1 enemy attack",
          effects: [effectFunCall("Effect:Dodge")],
          priority: 2,
          stamina: 4,
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
          effects: [effectFunCall("Axe:Chop")],
          priority: 2,
          stamina: 2,
          range: makeRange(0, 1),
        },
        {
          display: "Cut",
          tooltip: "Cut",
          effects: [effectFunCall("Axe:Cut")],
          priority: 3,
          stamina: 2,
          range: makeRange(0),
        },
        {
          display: "Bleed",
          tooltip: "Makes the enemy bleed",
          effects: [effectFunCall("Axe:Bleed")],
          priority: 3,
          stamina: 2,
          range: allRanges,
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
          effects: [effectFunCall("Hook:GetHere")],
          priority: 4,
          stamina: 3,
          range: makeRange(2, 3, 4),
        },
      ],
    },
    {
      display: "Shield",
      effects: [
        {
          display: "Not today!",
          tooltip: "Blocks some damage",
          effects: [effectFunCall(["Effect:Armor", { amount: 3 }])],
          priority: 2,
          stamina: 3,
          range: selfRange,
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
    effects: [
      {
        display: "Advanced Dodge",
        tooltip: "Avoid 1 attack",
        effects: [effectFunCall("Effect:Dodge")],
        priority: 1,
        stamina: 3,
        range: selfRange,
      },
    ],
  },
  {
    display: "Boots of Flight",
    eot: [{
      display: "Flight!",
      tooltip: "Increases distance by 2 every turn",
      priority: 0,
      range: allRanges,
      effects: [effectFunCall('BootsOfFlight:EOT')],
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
    {
      display: "of Strength",
      passive: "Charm:ofStrength",
    },
    {
      display: "of Swiftness",
      passive: "Charm:ofSwiftness",
    },
    {
      display: "of Defence",
      passive: "Charm:ofDefence",
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall("Monster:Swipe")], range: makeRange(0, 1) },
      { display: "Roar", tooltip: "Swipe", priority: 1, effects: [effectFunCall("Monster:Roar")], range: allRanges },
      { display: "Jump", tooltip: "Swipe", priority: 2, effects: [effectFunCall("Monster:Jump")], range: makeRange(2, 3, 4) },
    ],
  }, {
    hp: makeStat(25),
    distance: 4,
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
  }],
  [{
    lore: {
      name: "Toro",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall("Monster:Swipe")], range: allRanges },
      { display: "Jump", tooltip: "Jump", priority: 2, effects: [effectFunCall("Monster:Jump")], range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
    ]
  }, {
    hp: makeStat(22),
    distance: 4,
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
  }],
  [{
    lore: {
      name: "Summoner",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall("Monster:Swipe")], range: makeRange(0, 1) },
      { display: "Jump", tooltip: "Jump", priority: 3, effects: [effectFunCall("Monster:Jump")], range: allRanges },
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
    hp: makeStat(30),
    distance: 4,
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
  }],
  [{
    lore: {
      name: "Body",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall("Monster:Swipe")], range: makeRange() },
    ],
    rolls: [
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
  }, {
    hp: makeStat(300),
    distance: 0,
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
  }],

  [{
    lore: {
      name: "Smol",
    },
    effects: [
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall("Monster:Swipe")], range: makeRange() },
    ],
    rolls: [
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
  }, {
    hp: makeStat(5),
    distance: 0,
    speed: makeStat(0),
    attack: makeStat(0),
    defence: makeStat(0),
    status: defaultStatus,
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
  "Azamarr",
  "Jather",
  "Tekren",
  "Jareth",
  "Adon",
  "Zaden",
  "Eune",
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
  "Tyvrik",
  "Henndar",
  "Favroe",
  "Whit",
  "Jaris",
  "Renham",
  "Kagran",
  "Lassrin",
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
  "Blaiz",
  "Talon",
  "Agro",
  "Zagaroth",
  "Turrek",
  "Esdel",
  "Lustros",
  "Zenner",
  "Baashar",
  "Dagrod",
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
  "Asralyn",
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
  "Renalee",
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
  "Pekka",
  "Xavia",
  "Beatha",
  "Yarri",
  "Liris",
  "Sonali",
  "Razra",
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
  "Thesra",
  "Tezani",
  "Ralia",
  "Esmee",
  "Heron",
  "Naima",
  "Rydna",
  "Sparrow",
  "Baakshi",
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
  "Rasy",
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
  "Vemery",
  "Lunex",
  "Fidess",
  "Tisette",
  "Partha",
]