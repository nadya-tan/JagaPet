import { useQuery } from "@tanstack/react-query";
import type { Pet } from "../types/pet.types";

// Define return structure of the custom hook
type UsePetDetailResult = {
  pet: Pet | null;
  relatedPets: Pet[];
  loading: boolean;
  error: string | null;
};

// Define expected backend response structure
type PetDetailResponse = {
  pet: Pet;
  relatedPets?: Pet[];
};

/**
 * Fetch a single pet detail record from backend API.
 *
 * input:
 *   id - pet unique identifier
 *
 * output:
 *   pet - selected pet detail
 *   relatedPets - optional related pet recommendations
 */
async function fetchPetDetail(id: string): Promise<PetDetailResponse> {
  // Send request with encoded id parameter
  const response = await fetch(`/api/pet?id=${encodeURIComponent(id)}`);

  // Parse JSON response
  const data = await response.json();

  // Handle failed HTTP response
  if (!response.ok) {
    throw new Error(data.error || "Failed to load pet");
  }

  // Normalize response structure
  // Supports both:
  // { pet: {...}, relatedPets: [...] }
  // or direct pet object response
  return {
    pet: data.pet ?? data,
    relatedPets: data.relatedPets ?? [],
  };
}

/**
 * Custom React hook for loading pet detail page data.
 *
 * input:
 *   id - pet identifier (can be undefined before route loads)
 *
 * output:
 *   pet - selected pet detail or null
 *   relatedPets - related pets list
 *   loading - request loading state
 *   error - readable error message
 */
export function usePetDetail(id: string | undefined): UsePetDetailResult {
  // Execute query using React Query
  const query = useQuery({
    queryKey: ["pet-detail", id], // unique cache key per pet id
    queryFn: () => fetchPetDetail(id!), // safe because enabled prevents undefined execution
    enabled: !!id, // only run when id exists
    staleTime: 1000 * 60 * 10, // cache stays fresh for 10 minutes
    retry: 1, // retry once on failure
  });

  // Return simplified hook state
  return {
    pet: query.data?.pet ?? null,
    relatedPets: query.data?.relatedPets ?? [],
    loading: !!id && query.isPending,
    error: !id
      ? "Missing pet id."
      : query.error instanceof Error
        ? query.error.message
        : null,
  };
}
