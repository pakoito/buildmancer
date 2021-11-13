import { actions, Play } from "../playGame";
import { EffectFun, EffectFunRepo, Enemy, InventoryEffect, Snapshot } from "../types";

export const startState = (play: Play): Snapshot => play.states[0];
export const previousState = (play: Play): Snapshot => play.states[play.states.length - 1];

export const chain = (...funs: Array<EffectFun>): EffectFun =>
  // TODO check direction of the fold
  funs.reduce((acc, value) => (origin, play, newState) => value(origin, play, acc(origin, play, newState)));


export const effectRepository: EffectFunRepo = {
  'Basic:Rest': (_origin, _play, newState) => newState,
  'Basic:Advance': (_origin, _play, newState) => actions.changeDistance(newState, newState.target, -2),
  'Basic:Retreat': (_origin, _play, newState) => actions.changeDistance(newState, newState.target, 2),
  'Axe:Chop': (_, play, currentState) => actions.attackMonster(startState(play), currentState, 3),
  'Axe:Cut': (_, play, currentState) => actions.attackMonster(startState(play), currentState, 3),
  'Hook:GetHere': chain(
    (_, play, currentState) => actions.attackMonster(startState(play), currentState, 3),
    (_origin, _play, currentState) => actions.changeDistance(currentState, currentState.target, -1),
  ),
  'Monster:Swipe': (_, play, currentState) => actions.attackPlayer(startState(play), currentState, 2),
  'Monster:Roar': (_, play, currentState) => actions.modifyPlayerStamina(startState(play), currentState, -5),
  'Monster:Jump': (origin, _, currentState) => actions.changeDistance(currentState, origin, -2),
};

export const build: Record<
  string,
  {
    display: string;
    effects: InventoryEffect[];
    [key: string]: any;
  }[]
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
        },
        {
          display: "Advance",
          effect: "Basic:Advance",
          priority: 4,
          stamina: 1,
        },
        {
          display: "Retreat",
          effect: "Basic:Retreat",
          priority: 4,
          stamina: 1,
        }
      ]
    }
  ],
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
          effect: "Axe:Chop",
          priority: 2,
          stamina: 2,
        },
        {
          display: "Cut",
          effect: "Axe:Cut",
          priority: 3,
          stamina: 2,
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
      [0, 1, 2, 1, 0, 0],
    ],
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe" },
      { display: "Roar", priority: 1, effect: "Monster:Roar" },
      { display: "Jump", priority: 2, effect: "Monster:Jump" },
    ],
  },
  {
    lore: {
      name: "Cacahue",
    },
    stats: {
      hp: 30,
      rage: 0,
      distance: 5,
    },
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe" },
      { display: "Roar", priority: 1, effect: "Monster:Roar" },
      { display: "Jump", priority: 2, effect: "Monster:Jump" },
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
    lore: {
      name: "Toro",
    },
    stats: {
      hp: 22,
      rage: 0,
      distance: 5,
    },
    effects: [
      { display: "Swipe", priority: 3, effect: "Monster:Swipe" },
      { display: "Roar", priority: 1, effect: "Monster:Roar" },
      { display: "Jump", priority: 2, effect: "Monster:Jump" },
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