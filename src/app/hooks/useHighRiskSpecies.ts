import { useQuery } from "@tanstack/react-query";
import type { RecommendedPet } from "../types/pet.types";

// Define the expected API response type as an array of RecommendedPet
type HighRiskSpeciesResponse = RecommendedPet[];

/**
 * Fetch high-risk species data from backend API.
 * Handles:
 * - JSON parsing safety
 * - non-JSON responses
 * - HTTP error responses
 */
async function fetchHighRiskSpecies(): Promise<HighRiskSpeciesResponse> {
  // Send request to backend endpoint
  const response = await fetch("/api/high-risk-species");

  // Read raw response text first (safer for debugging non-JSON responses)
  const raw = await response.text();

  let data: unknown;

  try {
    // Attempt to parse JSON only if response is not empty
    data = raw ? JSON.parse(raw) : [];
  } catch {
    // Log invalid JSON for debugging purposes
    console.error("Non-JSON response from /api/high-risk-species:", raw);

    // Throw a descriptive error for development troubleshooting
    throw new Error(
      `API returned ${response.status} but not JSON. Open /api/high-risk-species directly in the browser and check your terminal.`,
    );
  }

  // Handle HTTP error responses (non-2xx status codes)
  if (!response.ok) {
    // Try to extract backend-provided error message if available
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Failed to load high risk species";

    // Throw error so React Query can capture it
    throw new Error(message);
  }

  // Ensure returned data is always an array
  return Array.isArray(data) ? (data as HighRiskSpeciesResponse) : [];
}

/**
 * Custom React hook to fetch high-risk species using React Query.
 * Provides:
 * - cached data
 * - loading state
 * - error message handling
 */
export function useHighRiskSpecies() {
  // Execute query using React Query's caching system
  const query = useQuery({
    queryKey: ["high-risk-species"], // unique cache key
    queryFn: fetchHighRiskSpecies, // async fetch function
    staleTime: 1000 * 60 * 30, // data stays fresh for 30 minutes
  });

  // Normalize and expose simplified state to components
  return {
    highRiskSpecies: query.data ?? [], // fallback to empty array
    loading: query.isPending, // loading state
    error: query.error instanceof Error ? query.error.message : null, // safe error message
  };
}
