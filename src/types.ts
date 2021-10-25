export type PlayerStats = Record<string, number>;
export type EnemyStats = Record<string, number>;

export type Snapshot = { player: PlayerStats; monster: EnemyStats };
export type EffectFun = (start: Snapshot, curr: Snapshot) => Snapshot;

export type Effect = {
  display: string;
  effect: EffectFun;
};

export type Build = Record<
  string,
  {
    display: string;
    effects: Effect[];
    [key: string]: any;
  }
>;

export type Player = {
  id: string;
  lore: Record<string, string | number>;
  stats: PlayerStats;
  build: Build;
};

export type Enemy = {
  id: string;
  lore: Record<string, string | number>
  stats: EnemyStats;
  // build: Build;
}