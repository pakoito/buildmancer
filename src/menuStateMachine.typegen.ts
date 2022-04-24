// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    reset: "xstate.init";
    bumpVictories: "WIN" | "PLAYER";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    isNotFinal: "always";
    isFinal: "always";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "main"
    | "quick"
    | "quick.play"
    | "quick.win"
    | "quick.lose"
    | "single"
    | "single.player"
    | "single.encounter"
    | "single.play"
    | "single.win"
    | "single.lose"
    | "arcade"
    | "arcade.player"
    | "arcade.play"
    | "arcade.win"
    | "arcade.victory"
    | "arcade.defeat"
    | "survival"
    | "survival.player"
    | "survival.play"
    | "survival.defeat"
    | {
        quick?: "play" | "win" | "lose";
        single?: "player" | "encounter" | "play" | "win" | "lose";
        arcade?: "player" | "play" | "win" | "victory" | "defeat";
        survival?: "player" | "play" | "defeat";
      };
  tags: never;
}
