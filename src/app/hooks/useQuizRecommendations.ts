import { useQuery } from "@tanstack/react-query";
import type { QuizRecommendationPet } from "../types/pet.types";

// Define expected API response type as an array of quiz recommendation pets
type QuizRecommendationsResponse = QuizRecommendationPet[];

/**
 * Fetch quiz recommendation data from backend API.
 * Includes protection for:
 * - invalid JSON responses
 * - HTTP request failures
 * - empty response bodies
 */
async function fetchQuizRecommendations(): Promise<QuizRecommendationsResponse> {
  // Send request to backend endpoint
  const response = await fetch("/api/quiz-recommendations");

  // Read raw response text first for safer parsing/debugging
  const raw = await response.text();

  let data: unknown;

  try {
    // Parse JSON only if body content exists
    data = raw ? JSON.parse(raw) : [];
  } catch {
    // Log unexpected non-JSON backend response
    console.error("Non-JSON response from /api/quiz-recommendations:", raw);

    // Throw readable development error
    throw new Error(
      `API returned ${response.status} but not JSON. Open /api/quiz-recommendations directly in the browser and check your terminal.`,
    );
  }

  // Handle HTTP failure responses
  if (!response.ok) {
    // Attempt to extract backend error message
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Failed to load quiz recommendations";

    throw new Error(message);
  }

  // Ensure returned value is always an array
  return Array.isArray(data) ? (data as QuizRecommendationsResponse) : [];
}

/**
 * Custom React hook for loading quiz recommendation pets.
 *
 * output:
 *   pets - quiz recommendation list
 *   loading - request loading state
 *   error - readable error message
 */
export function useQuizRecommendations() {
  // Execute query with React Query caching system
  const query = useQuery({
    queryKey: ["quiz-recommendations"], // unique cache key
    queryFn: fetchQuizRecommendations, // async fetch function
    staleTime: 1000 * 60 * 30, // cache remains fresh for 30 minutes
  });

  // Return simplified hook state
  return {
    pets: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
