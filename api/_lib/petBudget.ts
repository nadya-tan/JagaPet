/**
 * Lifetime budget classification categories for pets
 */
export type LifetimeBudgetCategory = "Low" | "Medium" | "High" | "Unknown";

/**
 * Basic structure representing pet-related cost and care attributes
 * Used as input for lifetime budget scoring
 */
type BudgetPetLike = {
  pet_cost?: number | null;
  pet_longevity?: number | null;
  pet_care_level?: string | null;
  pet_max_length?: number | null;
};

/**
 * Statistical quartiles used for thresholding values
 */
type Quartiles = {
  q1: number;
  q3: number;
};

/**
 * Full threshold configuration used for lifetime budget scoring
 */
export type LifetimeBudgetThresholds = {
  cost: Quartiles;
  longevity: Quartiles;
  maxLength: Quartiles;
  totalScore: Quartiles;
};

/**
 * Compute percentile value from a sorted numeric array
 *
 * input:
 *   sortedValues - sorted array of numbers (ascending order)
 *   percentile - value between 0 and 1 (e.g. 0.25, 0.75)
 *
 * output:
 *   interpolated percentile value
 */
function getPercentile(sortedValues: number[], percentile: number): number {
  // Return NaN if dataset is empty
  if (sortedValues.length === 0) return NaN;

  // Compute fractional index
  const index = (sortedValues.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  // If index is exact integer, return directly
  if (lower === upper) return sortedValues[lower];

  // Linear interpolation between lower and upper bounds
  const weight = index - lower;
  return (
    sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight
  );
}

/**
 * Compute Q1 and Q3 quartiles from a numeric dataset
 *
 * input:
 *   values - array of numbers (may include null/undefined)
 *
 * output:
 *   object containing q1 (25th percentile) and q3 (75th percentile)
 */
export function getQuartiles(
  values: Array<number | null | undefined>,
): Quartiles {
  // Filter valid finite numbers and sort ascending
  const validValues = values
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    )
    .sort((a, b) => a - b);

  // Return NaN quartiles if no valid data exists
  if (validValues.length === 0) {
    return { q1: NaN, q3: NaN };
  }

  // Compute quartiles using percentile function
  return {
    q1: getPercentile(validValues, 0.25),
    q3: getPercentile(validValues, 0.75),
  };
}

/**
 * Convert a numeric value into a 3-level score based on quartiles
 *
 * scoring rules:
 *   <= q1 -> 1 (low)
 *   <= q3 -> 2 (medium)
 *   > q3  -> 3 (high)
 */
function getNumericScore(
  value: number | null | undefined,
  q1: number,
  q3: number,
): 1 | 2 | 3 | null {
  // Validate input value
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  // Validate quartiles
  if (!Number.isFinite(q1) || !Number.isFinite(q3)) {
    return null;
  }

  // Assign score based on quartile thresholds
  if (value <= q1) return 1;
  if (value <= q3) return 2;
  return 3;
}

/**
 * Convert textual care level into numeric score
 *
 * mapping:
 *   beginner     -> 1
 *   intermediate -> 2
 *   advanced/expert/difficult -> 3
 */
export function getCareLevelScore(
  careLevel: string | null | undefined,
): 1 | 2 | 3 | null {
  // Handle missing input
  if (!careLevel) return null;

  const value = careLevel.toLowerCase();

  // Map care difficulty levels to numeric scores
  if (value.includes("beginner")) return 1;
  if (value.includes("intermediate")) return 2;
  if (
    value.includes("advanced") ||
    value.includes("expert") ||
    value.includes("difficult")
  ) {
    return 3;
  }

  // Unknown category
  return null;
}

/**
 * Compute total lifetime budget score for a single pet
 *
 * logic:
 * - combine multiple feature scores
 * - require at least 2 valid signals
 *
 * output:
 *   summed score or null if insufficient data
 */
export function getLifetimeBudgetScore(
  pet: BudgetPetLike,
  thresholds: Omit<LifetimeBudgetThresholds, "totalScore">,
): number | null {
  // Compute individual feature scores
  const scores = [
    getNumericScore(pet.pet_cost, thresholds.cost.q1, thresholds.cost.q3),
    getNumericScore(
      pet.pet_longevity,
      thresholds.longevity.q1,
      thresholds.longevity.q3,
    ),
    getNumericScore(
      pet.pet_max_length,
      thresholds.maxLength.q1,
      thresholds.maxLength.q3,
    ),
    getCareLevelScore(pet.pet_care_level),
  ].filter((score): score is 1 | 2 | 3 => score !== null);

  // Require minimum data reliability
  if (scores.length < 2) return null;

  // Sum all valid scores
  return scores.reduce((sum, score) => sum + score, 0);
}

/**
 * Convert total score into categorical budget level
 *
 * rules:
 *   <= q1 -> Low
 *   <= q3 -> Medium
 *   > q3  -> High
 */
export function getLifetimeBudgetCategory(
  totalScore: number | null | undefined,
  q1: number,
  q3: number,
): LifetimeBudgetCategory {
  // Validate score input
  if (typeof totalScore !== "number" || !Number.isFinite(totalScore)) {
    return "Unknown";
  }

  // Validate thresholds
  if (!Number.isFinite(q1) || !Number.isFinite(q3)) {
    return "Unknown";
  }

  // Map score to category
  if (totalScore <= q1) return "Low";
  if (totalScore <= q3) return "Medium";
  return "High";
}

/**
 * Build statistical thresholds from dataset of pets
 *
 * output:
 *   quartile thresholds for cost, longevity, maxLength, and totalScore
 */
export function buildLifetimeBudgetThresholds<T extends BudgetPetLike>(
  pets: T[],
): LifetimeBudgetThresholds {
  // Compute quartiles for each numeric feature
  const cost = getQuartiles(pets.map((pet) => pet.pet_cost));
  const longevity = getQuartiles(pets.map((pet) => pet.pet_longevity));
  const maxLength = getQuartiles(pets.map((pet) => pet.pet_max_length));

  // Compute total score distribution across dataset
  const totalScores = pets
    .map((pet) =>
      getLifetimeBudgetScore(pet, {
        cost,
        longevity,
        maxLength,
      }),
    )
    .filter((score): score is number => typeof score === "number");

  // Quartiles for aggregated score
  const totalScore = getQuartiles(totalScores);

  return {
    cost,
    longevity,
    maxLength,
    totalScore,
  };
}

/**
 * Enrich a single pet object with lifetime budget score and category
 *
 * output:
 *   original pet + computed score + category
 */
export function enrichPetWithLifetimeBudget<T extends BudgetPetLike>(
  pet: T,
  thresholds: LifetimeBudgetThresholds,
) {
  const totalScore = getLifetimeBudgetScore(pet, thresholds);

  return {
    ...pet,
    pet_lifetime_budget_score: totalScore,
    pet_lifetime_budget_category: getLifetimeBudgetCategory(
      totalScore,
      thresholds.totalScore.q1,
      thresholds.totalScore.q3,
    ),
  };
}

/**
 * Enrich a list of pets with lifetime budget scoring information
 */
export function enrichPetsWithLifetimeBudget<T extends BudgetPetLike>(
  pets: T[],
  thresholds: LifetimeBudgetThresholds,
) {
  return pets.map((pet) => enrichPetWithLifetimeBudget(pet, thresholds));
}
