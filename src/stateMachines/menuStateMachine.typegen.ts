// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    bumpVictories: "WIN";
    bumpScore: "WIN";
    reset: "xstate.init";
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
    isFinal: "WIN";
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
    | "arcade.victory"
    | "arcade.defeat"
    | "survival"
    | "survival.player"
    | "survival.play"
    | "survival.defeat"
    | "load"
    | "load.load"
    | "load.play"
    | "load.win"
    | "load.lose"
    | "training"
    | "training.player"
    | "training.play"
    | "training.win"
    | "training.lose"
    | {
        quick?: "play" | "win" | "lose";
        single?: "player" | "encounter" | "play" | "win" | "lose";
        arcade?: "player" | "play" | "victory" | "defeat";
        survival?: "player" | "play" | "defeat";
        load?: "load" | "play" | "win" | "lose";
        training?: "player" | "play" | "win" | "lose";
      };
  tags: never;
}
