import { z } from 'zod';

export const playSchema = z.object({
  player: z.object({
    id: z.string(),
    lore: z.object({ name: z.string(), age: z.number() }),
    build: z.object({
      debug: z.object({
        display: z.string(),
        effects: z.array(z.any()),
      }),
      basic: z.object({
        display: z.string(),
        effects: z.array(z.any()),
      }),
      class: z.object({
        display: z.string(),
        passives: z.array(z.string()),
        effects: z.array(z.any()),
      }),
      skill: z.object({
        display: z.string(),
        effects: z.array(z.any()),
      }),
      armor: z.object({ display: z.string(), passives: z.array(z.string()) }),
      weapon: z.object({
        display: z.string(),
        effects: z.array(z.any()),
      }),
      offhand: z.object({
        display: z.string(),
        passives: z.array(z.string()),
        effects: z.array(z.any()),
      }),
      footwear: z.object({
        display: z.string(),
        tooltip: z.string(),
        passives: z.array(z.string()),
        eot: z.array(z.any()),
      }),
      headgear: z.object({
        display: z.string(),
        passives: z.array(z.string()),
        tooltip: z.string(),
        effects: z.array(z.any()),
      }),
      charm: z.object({
        display: z.string(),
        passives: z.array(z.string()),
        tooltip: z.string(),
      }),
      consumable: z.object({ display: z.string() }),
    }),
  }),
  enemies: z.array(
    z.object({
      lore: z.object({ name: z.string() }),
      effects: z.array(z.any()),
      rolls: z.array(z.array(z.number())),
    })
  ),
  states: z.array(z.object({
    player: z.object({
      hp: z.object({ current: z.number(), max: z.number() }),
      stamina: z.object({ current: z.number(), max: z.number() }),
      staminaPerTurn: z.object({ current: z.number(), max: z.number() }),
      speed: z.object({ current: z.number(), max: z.number() }),
      attack: z.object({ current: z.number(), max: z.number() }),
      defence: z.object({ current: z.number(), max: z.number() }),
      status: z.object({
        dodge: z.object({ active: z.boolean() }),
        armor: z.object({ amount: z.number() }),
        bleed: z.object({ turns: z.number() }),
        stun: z.object({ active: z.boolean() }),
      }),
    }),
    enemies: z.array(
      z.object({
        hp: z.object({ current: z.number(), max: z.number() }),
        distance: z.number(),
        speed: z.object({ current: z.number(), max: z.number() }),
        attack: z.object({ current: z.number(), max: z.number() }),
        defence: z.object({ current: z.number(), max: z.number() }),
        status: z.object({
          dodge: z.object({ active: z.boolean() }),
          armor: z.object({ amount: z.number() }),
          bleed: z.object({ turns: z.number() }),
          stun: z.object({ active: z.boolean() }),
        }),
      })
    ),
    target: z.number(),
    lastAttacks: z.array(z.unknown()),
    disabledSkills: z.array(z.unknown()),
  })),
  rng: z.array(z.array(z.number())),
  turns: z.number(),
  id: z.string(),
  seed: z.number(),
});
