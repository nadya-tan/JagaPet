import { getPetDisplayName } from "../utils/petDisplay";
import type { Pet, SortOption } from "../types/pet.types";

/**
 * ===================== Sorting Utility Functions =====================
 * This module provides comparison and ranking logic for Pet sorting.
 * It supports:
 * - Numeric sorting with missing value handling
 * - Categorical ranking (care level, invasive risk, native status)
 * - Stable fallback sorting by name
 */

// ===================== Missing Value Safe Comparison =====================

/**
 * Compare numeric values while pushing missing values (negative) to the end
 * Supports both ascending and descending order
 *
 * Convention:
 * - Values < 0 are treated as missing
 * - Missing values always rank lower priority (sorted last)
 */
export function compareWithMissingLast(
  aValue: number,
  bValue: number,
  direction: "asc" | "desc",
) {
  const aMissing = aValue < 0;
  const bMissing = bValue < 0;

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return direction === "asc" ? aValue - bValue : bValue - aValue;
}

// ===================== Ranking Converters =====================

/**
 * Convert invasive risk string into numeric rank
 * Higher value = higher risk severity
 */
export function getInvasiveRiskRank(value: string | null | undefined) {
  switch ((value ?? "").toLowerCase()) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return -1; // unknown values always sorted last
  }
}

/**
 * Convert care level string into numeric rank
 * Higher value = more difficult care requirement
 */
export function getCareLevelRank(value: string | null | undefined) {
  switch ((value ?? "").toLowerCase()) {
    case "advanced":
      return 3;
    case "intermediate":
      return 2;
    case "beginner":
      return 1;
    default:
      return -1;
  }
}

/**
 * Convert native status into numeric rank
 * Used for ecological prioritization sorting
 */
export function getNativeStatusRank(value: string | null | undefined) {
  switch ((value ?? "").toLowerCase()) {
    case "invasive":
      return 3;
    case "not native":
      return 2;
    case "native":
      return 1;
    default:
      return -1;
  }
}

// ===================== Name-Based Sorting =====================

/**
 * Compare pets alphabetically using normalized display name
 * Uses localeCompare for consistent alphabetical sorting
 */
function compareByName(a: Pet, b: Pet) {
  return getPetDisplayName(a).localeCompare(getPetDisplayName(b));
}

// ===================== Ranked Field Comparator =====================

/**
 * Generic comparator for ranked categorical fields
 * Falls back to alphabetical ordering if ranks are equal
 */
function compareRankedField(
  a: Pet,
  b: Pet,
  aRank: number,
  bRank: number,
  direction: "asc" | "desc",
) {
  const result = compareWithMissingLast(aRank, bRank, direction);
  if (result !== 0) return result;

  // Stable fallback to ensure deterministic ordering
  return compareByName(a, b);
}

// ===================== Main Sorting Function =====================

/**
 * Sort pet dataset based on selected SortOption
 * Produces a new sorted array (does not mutate input)
 */
export function sortPets(results: Pet[], sortBy: SortOption): Pet[] {
  const items = [...results];

  items.sort((a, b) => {
    switch (sortBy) {
      // ===================== Aquarium Popularity =====================
      case "aquarium": {
        const aRank = a.pet_aquarium === true ? 1 : 0;
        const bRank = b.pet_aquarium === true ? 1 : 0;

        // Aquarium species first
        if (aRank !== bRank) return bRank - aRank;
        return compareByName(a, b);
      }

      // ===================== Alphabetical Sorting =====================
      case "alphabet_asc":
        return compareByName(a, b);

      case "alphabet_desc":
        return compareByName(b, a);

      // ===================== Invasive Risk Sorting =====================
      case "invasive_risk_desc": {
        return compareRankedField(
          a,
          b,
          getInvasiveRiskRank(a.pet_invasive_risk),
          getInvasiveRiskRank(b.pet_invasive_risk),
          "desc",
        );
      }

      case "invasive_risk_asc": {
        return compareRankedField(
          a,
          b,
          getInvasiveRiskRank(a.pet_invasive_risk),
          getInvasiveRiskRank(b.pet_invasive_risk),
          "asc",
        );
      }

      // ===================== Care Level Sorting =====================
      case "care_level_desc":
        return compareRankedField(
          a,
          b,
          getCareLevelRank(a.pet_care_level),
          getCareLevelRank(b.pet_care_level),
          "desc",
        );

      case "care_level_asc": {
        return compareRankedField(
          a,
          b,
          getCareLevelRank(a.pet_care_level),
          getCareLevelRank(b.pet_care_level),
          "asc",
        );
      }

      // ===================== Native Status Sorting =====================
      case "native_status_desc": {
        return compareRankedField(
          a,
          b,
          getNativeStatusRank(a.pet_is_native),
          getNativeStatusRank(b.pet_is_native),
          "desc",
        );
      }

      case "native_status_asc": {
        return compareRankedField(
          a,
          b,
          getNativeStatusRank(a.pet_is_native),
          getNativeStatusRank(b.pet_is_native),
          "asc",
        );
      }

      // ===================== Cost Sorting =====================
      case "cost_desc": {
        const aCost = a.pet_cost ?? -1;
        const bCost = b.pet_cost ?? -1;

        const result = compareWithMissingLast(aCost, bCost, "desc");
        if (result !== 0) return result;

        return compareByName(a, b);
      }

      case "cost_asc": {
        const aCost = a.pet_cost ?? -1;
        const bCost = b.pet_cost ?? -1;

        const result = compareWithMissingLast(aCost, bCost, "asc");
        if (result !== 0) return result;

        return compareByName(a, b);
      }

      // ===================== Fallback =====================
      default:
        return 0;
    }
  });

  return items;
}
