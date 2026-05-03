import { useQuery } from "@tanstack/react-query";
import type { RecommendedPet } from "../types/pet.types";

// Define expected API response type as an array of recommended pets
type RecommendationsResponse = RecommendedPet[];

/**
 * Fetch pet recommendation data from backend API.
 * Includes protection for:
 * - invalid JSON responses
 * - HTTP request failures
 * - empty responses
 */
async function fetchPetRecommendations(): Promise<RecommendationsResponse> {
  // Send request to recommendation endpoint
  const response = await fetch("/api/recommendations");

  // Read raw text first for safer parsing/debugging
  const raw = await response.text();

  let data: unknown;

  try {
    // Parse JSON only when response body exists
    data = raw ? JSON.parse(raw) : [];
  } catch {
    // Log invalid backend response for debugging
    console.error("Non-JSON response from /api/recommendations:", raw);

    // Throw readable error message
    throw new Error(
      `API returned ${response.status} but not JSON. Open /api/recommendations directly in the browser and check your terminal.`,
    );
  }

  // Handle non-success HTTP responses
  if (!response.ok) {
    // Try to use backend-provided error message if available
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Failed to load recommendations";

    throw new Error(message);
  }

  // Ensure returned result is always an array
  return Array.isArray(data) ? (data as RecommendationsResponse) : [];
}

/**
 * Custom React hook for loading pet recommendation pool.
 *
 * output:
 *   recommendations - recommended pet list
 *   loading - loading state
 *   error - readable error message
 */
export function usePetRecommendationPool() {
  // Use React Query for request caching and async state management
  const query = useQuery({
    queryKey: ["pet-recommendations"], // unique cache key
    queryFn: fetchPetRecommendations, // fetch function
    staleTime: 1000 * 60 * 30, // cache valid for 30 minutes
  });

  // Return simplified hook state
  return {
    recommendations: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
