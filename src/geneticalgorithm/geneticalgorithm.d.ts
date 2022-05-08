declare class GeneticAlgorithmConstructor<T> {
  constructor(config: GeneticAlgorithmConfig<T>);

  population(): T[];
  best(): T;
  bestScore(): number;
  scoredPopulation(): ScoredPhenotype[];
  config(): GeneticAlgorithmConfig;
  clone(config?: GeneticAlgorithmConfig): GeneticAlgorithmConstructor;
  evolve(config?: GeneticAlgorithmConfig): GeneticAlgorithmConstructor;
}

export type ScoredPhenotype<T> = { phenotype: T; score: number };

export type GeneticAlgorithmConfig<T> = {
  mutationFunction?(phenotype: T): T;
  crossoverFunction?(p1: T, p2: T): [T, T];
  fitnessFunction(phenotype: T): number;
  doesABeatBFunction?(a: T, b: T): boolean;
  population: T[];
  populationSize: number;
};

export = GeneticAlgorithmConstructor;
