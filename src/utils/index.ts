import { EnemyStats, PlayerStats, EffectFun, Snapshot, Effect, Enemy } from "../types";

export const snap = (player: PlayerStats, monster: EnemyStats) => ({
  player,
  monster,
});

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  funs.reduce((acc, value) => (start, curr) => acc(start, value(start, curr)));

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const skills = {
  attackMonster: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(curr.player, {
      ...curr.monster,
      hp: clamp(curr.monster.hp - amount, 0, start.monster.hp),
    }),
  changeDistance: (curr: Snapshot, amount: number): Snapshot =>
    snap(curr.player, {
      ...curr.monster,
      distance: clamp(curr.monster.distance + amount, 1, 5),
    }),

  attackPlayer: (start: Snapshot, curr: Snapshot, amount: number): Snapshot =>
    snap(
      {
        ...curr.player,
        hp: clamp(curr.player.hp - amount, 0, start.player.hp),
      },
      curr.monster,
    ),
  reducePlayerStamina: (
    start: Snapshot,
    curr: Snapshot,
    amount: number,
  ): Snapshot =>
    snap(
      {
        ...curr.player,
        stamina: clamp(curr.player.stamina - amount, 0, start.player.stamina),
      },
      curr.monster,
    ),
};

export const build: Record<
  string,
  {
    display: string;
    effects: Effect[];
    [key: string]: any;
  }[]
> = {
  class: [
    {
      display: "Warrior",
      effects: [],
    },
    {
      display: "Mage",
      effects: [],
    },
    {
      display: "Rogue",
      effects: [],
    },
  ],
  skill: [
    {
      display: "Sturdy",
      effects: [],
    },
    {
      display: "Nimble",
      effects: [],
    },
  ],
  weapon: [
    {
      display: "Axe",
      effects: [
        {
          display: "Chop",
          effect: (start, curr) => skills.attackMonster(start, curr, 3),
          priority: 2,
        },
        {
          display: "Cut",
          effect: (start, curr) => skills.attackMonster(start, curr, 3),
          priority: 3,
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
          effect: chain(
            (start, curr) => skills.attackMonster(start, curr, 3),
            (start, curr) => skills.reducePlayerStamina(start, curr, 2),
            (_, curr) => skills.changeDistance(curr, -1),
          ),
          priority: 4,
        },
      ],
    },
  ],
  consumable: [
    {
      display: "Potion",
      effects: [],
    },
  ],
  armor: [
    {
      display: "Heavy",
      effects: [],
    },
  ],
  headgear: [
    {
      display: "Helm",
      effects: [],
    },
  ],
  footwear: [
    {
      display: "Boots",
      effects: [],
    },
  ],
  charm: [
    {
      display: "of Health",
      effects: [],
    },
  ],
};

export const randomName = () => names[Math.floor(Math.random() * names.length)];

export const enemies: Enemy[] = [
  {
    id: "m-1",
    lore: {
      name: "Sacapuntas",
    },
    stats: {
      hp: 25,
      rage: 0,
      distance: 5,
    },
    rolls: [
      [0, 1, 2, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    effects: [
      { display: "Swipe", priority: 3, effect: (start, curr) => skills.attackPlayer(start, curr, 2) },
      { display: "Roar", priority: 1, effect: (start, curr) => skills.reducePlayerStamina(start, curr, 5) },
      { display: "Jump", priority: 2, effect: (start, _) => skills.changeDistance(start, -2) },
    ],
  },
  {
    id: "m-2",
    lore: {
      name: "Cacahue",
    },
    stats: {
      hp: 30,
      rage: 0,
      distance: 5,
    },
    effects: [
      { display: "Swipe", priority: 3, effect: (start, curr) => skills.attackPlayer(start, curr, 2) },
      { display: "Roar", priority: 1, effect: (start, curr) => skills.reducePlayerStamina(start, curr, 5) },
      { display: "Jump", priority: 2, effect: (start, _) => skills.changeDistance(start, -2) },
    ],
    rolls: [
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ]
  },
  {
    id: "m-3",
    lore: {
      name: "Toro",
    },
    stats: {
      hp: 22,
      rage: 0,
      distance: 5,
    },
    effects: [
      { display: "Swipe", priority: 3, effect: (start, curr) => skills.attackPlayer(start, curr, 2) },
      { display: "Roar", priority: 1, effect: (start, curr) => skills.reducePlayerStamina(start, curr, 5) },
      { display: "Jump", priority: 2, effect: (start, _) => skills.changeDistance(start, -2) },
    ],
    rolls: [
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ]
  },
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