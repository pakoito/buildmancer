import { Chance } from "chance";
import { Subtract } from "type-fest/source/internal";
import { Build, Distances, Enemy, EnemyStats, Item, Player, PlayerStats, Ranges, Snapshot, UpTo, Play, effectFunCall, Stat, Status, BuildRepository } from "./types";

export const DEBUG = true;

export const startState = (play: Play): Snapshot => play.states[0];
export const previousState = (play: Play): Snapshot => play.states[play.states.length - 1];

export const randomEnemy = (): [Enemy, EnemyStats] => new Chance().pickone(enemies);

export const randomPlayer = (statsOverride?: PlayerStats, buildOverride?: Partial<Build>): [Player, PlayerStats] => {
  const rng = new Chance();
  return [{
    id: rng.string(),
    lore: {
      name: randomName(),
      age: rng.age(),
    },
    build: {
      debug: build.debug[DEBUG ? 1 : 0],
      basic: rng.pickone(build.basic),
      class: rng.pickone(build.class),
      skill: rng.pickone(build.skill),
      armor: rng.pickone(build.armor),
      weapon: rng.pickone(build.weapon),
      offhand: rng.pickone(build.offhand),
      footwear: rng.pickone(build.footwear),
      headgear: rng.pickone(build.headgear),
      charm: rng.pickone(build.charm),
      consumable: rng.pickone(build.consumable),
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
  bleed: { turns: 0 },
  stun: { active: false },
}


// TODO
const weapons: Item[] = [
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
];

export const build: BuildRepository = {
  debug: [
    {
      display: "None",
    },
    {
      display: "Debug",
      effects: [
        {
          display: "GGWP",
          tooltip: "Wins the game",
          priority: 1,
          stamina: 0,
          range: allRanges,
          effects: [effectFunCall('Debug:GGWP')]
        },
        {
          display: "SUDOKU",
          tooltip: "Loses the game",
          priority: 1,
          stamina: 0,
          range: allRanges,
          effects: [effectFunCall('Debug:Sudoku')]
        },
      ]
    }
  ],
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
          effects: [effectFunCall(['Basic:Move', { amount: -1 }])]
        },
        {
          display: "Retreat",
          tooltip: "Move farther",
          effects: [effectFunCall(["Basic:Move", { amount: 1 }])],
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
      passives: ["+Attack", "+Defence", "+Stamina"],
      effects: [
        {
          display: "Strategic Kick",
          tooltip: "Last resource attack",
          effects: [effectFunCall(["Basic:Attack", { amount: 2 }])],
          priority: 2,
          stamina: 1,
          range: makeRange(1),
        }
      ]

    },
    {
      display: "Mage",
      passives: ["+StaPerTurn", "+Stamina", "-Health"],
      effects: [
        {
          display: "Just having a thought",
          tooltip: "Restores stamina for the next action",
          priority: 4,
          stamina: 0,
          range: selfRange,
          effects: [effectFunCall(['Basic:Stamina', { amount: 999 }])]
        },
      ]
    },
    {
      display: "Rogue",
      passives: ["+Speed", "+Speed", "-Attack", "-Stamina"],
      effects: [
        {
          display: "Strategic retreat",
          tooltip: "Jump backwards",
          effects: [effectFunCall(["Basic:Move", { amount: 4 }])],
          priority: 4,
          stamina: 1,
          range: selfRange,
        }
      ]
    },
    {
      display: "Berserk",
      passives: ["+Attack", "+Attack", "+Attack", "+Attack", "-Defence", "-Defence", "-Health"],
    },
  ],
  skill: [
    {
      display: "Sturdy",
      effects: [
        {
          display: "Endure the pain",
          tooltip: "Blocks some damage",
          effects: [effectFunCall(["Effect:Armor", { amount: 2 }])],
          priority: 1,
          stamina: 2,
          range: selfRange,
        },
      ]
    },
    {
      display: "Nimble",
      effects: [
        {
          display: "Dodge",
          tooltip: "Avoid 1 enemy attack",
          effects: [effectFunCall("Effect:Dodge")],
          priority: 2,
          stamina: 4,
          range: selfRange,
        }
      ]
    },
    {
      display: "Resourceful",
      effects: [
        {
          display: "Dodge this!",
          tooltip: "Throws a stone",
          effects: [effectFunCall(["Basic:Attack", { amount: 2 }])],
          priority: 4,
          stamina: 3,
          range: makeRange(3, 4),
        }
      ]
    },
  ],
  weapon: weapons,
  offhand: [
    {
      display: "Hook",
      passives: ["-Stamina"],
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
      display: "Parry Dagger",
      passives: ["-Defence"],
      effects: [
        {
          display: "Get over here!",
          tooltip: "Avoids a melee attack",
          effects: [effectFunCall("Effect:Dodge")],
          priority: 2,
          stamina: 2,
          range: makeRange(1),
        },
      ],
    },
    {
      display: "Shield",
      passives: ["+Defence", "-Speed"],
      effects: [
        {
          display: "Not today!",
          tooltip: "Blocks a lot of damage",
          effects: [effectFunCall(["Effect:Armor", { amount: 5 }])],
          priority: 2,
          stamina: 4,
          range: selfRange,
        },
      ],
    },
    {
      display: "Focus",
      passives: ["+Speed", "+StaPerTurn"]
    },
    {
      display: "Wand",
      passives: ["-Defence", "-StaPerTurn"],
      effects: [
        {
          display: "Magic Bolt",
          tooltip: "Shoots mana bolts until the caster faints",
          effects: [effectFunCall("Wand:MagicBolt")],
          priority: 3,
          stamina: 1,
          range: makeRange(3, 4),
        }
      ]
    },
  ],
  armor: [
    {
      display: "Heavy",
      passives: ["+Defence", "+Defence", "+Defence", "+Defence", "-Speed", "-Speed", "-StaPerTurn"],
    },
    {
      display: "Medium",
      passives: ["+Defence", "+Defence", "-StaPerTurn"],
    },
    {
      display: "Light",
      passives: ["+Defence"],
    },
    {
      display: "None",
      passives: ["+Speed"],
    },
  ],
  // TODO
  headgear: [
    {
      display: "Helm",
      passives: ["+Defence", "+Defence", "-Speed", "-StaPerTurn"],
      tooltip: "Big protection for slow combatants",
    },
    {
      display: "Feather Cap",
      passives: ["+StaPerTurn", "+Stamina"],
      tooltip: "Makes you feel energized, doesn't it?",
    },
    {
      display: "Mage Hat",
      passives: ["-StaPerTurn"],
      tooltip: "Small tricks for big plays",
      effects: [
        {
          display: "Flash!",
          tooltip: "Blinks you to a better position",
          effects: [
            effectFunCall(["Basic:Attack", { amount: 1 }]),
            effectFunCall(["Basic:Move", { amount: 2 }])
          ],
          priority: 3,
          stamina: 4,
          range: makeRange(1, 2),
        }
      ]
    },
  ],
  footwear: [
    {
      display: "Slippers of Dooooodge!",
      tooltip: "Allows you to dodge attacks",
      passives: ["-Stamina"],
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
      tooltip: "Avoid your enemies",
      passives: ["-StaPerTurn", "-Defence"],
      eot: [{
        display: "Flight!",
        tooltip: "Increases distance every turn",
        priority: 0,
        range: allRanges,
        effects: [effectFunCall('BootsOfFlight:EOT')],
      }],
    },
    {
      display: "Greaves of Stability",
      tooltip: "Extra resilient",
      passives: ["+Defence", "-Speed"],
      effects: [
        {
          display: "Dig your heels",
          tooltip: "Resists damage",
          effects: [effectFunCall(["Effect:Armor", { amount: 3 }])],
          priority: 1,
          stamina: 4,
          range: selfRange,
        },
      ],
    },
  ],
  charm: [
    {
      display: "of Health",
      passives: ["+Health", "-Speed"],
      tooltip: "Increases your maximum health",
    },
    {
      display: "of Haste",
      passives: ["+StaPerTurn", "-Stamina"],
      tooltip: "Increases your maximum stamina regeneration",
    },
    {
      display: "of Resilience",
      passives: ["+Stamina", "-StaPerTurn"],
      tooltip: "Increases your maximum stamina",
    },
    {
      display: "of Strength",
      passives: ["+Attack", "-Health", "-StaPerTurn"],
      tooltip: "Increases your maximum attack",
    },
    {
      display: "of Swiftness",
      passives: ["+Speed", "-Attack"],
      tooltip: "Increases your maximum speed",
    },
    {
      display: "of Defence",
      passives: ["+Defence", "-Stamina", "-Speed"],
      tooltip: "Increases your maximum defence",
    },
  ],
  // TODO
  consumable: [
    {
      display: "Potion",
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Attack", { amount: 3 }])], range: makeRange(0, 1) },
      { display: "Roar", tooltip: "Swipe", priority: 1, effects: [effectFunCall(["Basic:Stamina", { amount: -5 }])], range: allRanges },
      { display: "Jump", tooltip: "Swipe", priority: 2, effects: [effectFunCall(["Monster:Move", { amount: -4 }])], range: makeRange(2, 3, 4) },
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Attack", { amount: 3 }])], range: allRanges },
      { display: "Jump", tooltip: "Jump", priority: 2, effects: [effectFunCall(["Monster:Move", { amount: -4 }])], range: makeRange(2, 3, 4) },
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Attack", { amount: 3 }])], range: makeRange(0, 1) },
      { display: "Retreat", tooltip: "Jump", priority: 3, effects: [effectFunCall(["Monster:Move", { amount: 5 }])], range: allRanges },
      { display: "Summon Smol", tooltip: "Summon Smol", priority: 4, effects: [effectFunCall(["Monster:Summon", { enemy: 4 }])], range: makeRange(2, 3, 4) },
      { display: "Spit", tooltip: "Summon Smol", priority: 4, effects: [effectFunCall(["Monster:Attack", { amount: 2 }])], range: makeRange(2, 3, 4) },
    ],
    rolls: [
      [1, 1, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 3, 3, 0],
      [2, 3, 3, 3, 0],
      [2, 2, 3, 3, 0],
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Attack", { amount: 3 }])], range: makeRange() },
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
      { display: "Swipe", tooltip: "Swipe", priority: 3, effects: [effectFunCall(["Monster:Attack", { amount: 3 }])], range: makeRange() },
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