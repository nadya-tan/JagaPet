import { useQuery } from "@tanstack/react-query";
import type { RecommendedPet } from "../types/pet.types";

type HomeSpeciesResponse = {
  recommendations: RecommendedPet[];
  highRiskSpecies: RecommendedPet[];
};

async function fetchHomeSpecies(): Promise<HomeSpeciesResponse> {
  const response = await fetch("/api/home-species");

  const raw = await response.text();

  let data: unknown;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    console.error("Non-JSON response from /api/home-species:", raw);

    throw new Error(
      `API returned ${response.status} but not JSON. Open /api/home-species directly in the browser and check your terminal.`,
    );
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Failed to load home species";

    throw new Error(message);
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "recommendations" in data &&
    "highRiskSpecies" in data
  ) {
    const parsed = data as Partial<HomeSpeciesResponse>;

    return {
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      highRiskSpecies: Array.isArray(parsed.highRiskSpecies)
        ? parsed.highRiskSpecies
        : [],
    };
  }

  return {
    recommendations: [],
    highRiskSpecies: [],
  };
}

export function useHomeSpecies() {
  const query = useQuery({
    queryKey: ["home-species"],
    queryFn: fetchHomeSpecies,
    staleTime: 1000 * 60 * 30,
  });

  return {
    recommendations: query.data?.recommendations ?? [],
    highRiskSpecies: query.data?.highRiskSpecies ?? [],

    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}