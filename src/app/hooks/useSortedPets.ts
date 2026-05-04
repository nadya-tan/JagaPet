import { useMemo } from "react";
import type { Pet, SortOption } from "../types/pet.types";
import { sortPets } from "../utils/petSort";

// Custom hook that returns pet results sorted based on the selected sort option.
export function useSortedPets(results: Pet[], sortBy: SortOption) {
  // Recalculate the sorted results only when the results array or sort option changes.
  return useMemo(() => sortPets(results, sortBy), [results, sortBy]);
}
