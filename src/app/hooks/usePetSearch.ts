import { useQuery } from "@tanstack/react-query";
import type { Pet } from "../types/pet.types";

// Define return structure of the custom search hook
type UsePetSearchResult = {
  results: Pet[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetch pet search results from backend API.
 *
 * input:
 *   query - search keyword entered by user
 *
 * output:
 *   array of matching pets
 */
async function fetchPetSearch(query: string): Promise<Pet[]> {
  // Send search request with encoded query string
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  // Parse JSON response
  const data = await response.json();

  // Handle failed HTTP request
  if (!response.ok) {
    throw new Error(data.error || "Search failed");
  }

  // Return result array, fallback to empty list
  return data ?? [];
}

/**
 * Custom React hook for searching pets.
 *
 * input:
 *   query - raw search input from user
 *
 * output:
 *   results - matching pets
 *   loading - request loading state
 *   error - readable error message
 */
export function usePetSearch(query: string): UsePetSearchResult {
  // Remove unnecessary leading/trailing spaces
  const trimmedQuery = query.trim();

  // Execute search query using React Query
  const searchQuery = useQuery({
    queryKey: ["pet-search", trimmedQuery], // cache key based on query text
    queryFn: () => fetchPetSearch(trimmedQuery),
    enabled: !!trimmedQuery, // only search if query is not empty
    staleTime: 1000 * 60 * 5, // fresh for 5 minutes
    gcTime: 1000 * 60 * 15, // cache kept for 15 minutes
    retry: 1, // retry once on failure
    refetchOnWindowFocus: false, // do not auto-refetch when tab refocuses
  });

  // Return normalized state for components
  return {
    results: trimmedQuery ? (searchQuery.data ?? []) : [],
    loading: !!trimmedQuery && searchQuery.isPending,
    error:
      trimmedQuery && searchQuery.error instanceof Error
        ? searchQuery.error.message
        : null,
  };
}
