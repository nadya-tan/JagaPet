// ===================== Enum Type Definitions =====================

/**
 * Purchase cost classification for a pet
 * Used to categorize upfront buying cost
 */
export type PurchaseCostCategory = "Low" | "Medium" | "High" | "Unknown";

/**
 * Lifetime maintenance budget classification
 * Used to estimate long-term care expenses
 */
export type LifetimeBudgetCategory = "Low" | "Medium" | "High" | "Unknown";

// ===================== Body Shape Type Definitions =====================

/**
 * Fish body structure definition
 * Includes basic morphological feature: body shape
 */
export type FishBodyShape = {
  fish: {
    body_shape: string | null;
  };
};

/**
 * Turtle body structure definition
 * Includes shell type and limb digit counts
 */
export type TurtleBodyShape = {
  turtle: {
    shell_type: string | null;
    no_of_toes_fore: number | null;
    no_of_toes_hind: number | null;
  };
};

/**
 * Unified pet body shape type
 * Can represent either fish or turtle morphology
 */
export type PetBodyShape = FishBodyShape | TurtleBodyShape | null;

// ===================== Trait Type Definitions =====================

/**
 * Fish trait definition
 * Currently placeholder (no extended attributes defined)
 */
export type FishTraits = {
  fish: Record<string, never>;
};

/**
 * Turtle trait definition
 * Includes shell and coloration characteristics
 */
export type TurtleTraits = {
  turtle: {
    carapace_colour: string | null;
    dorsal_colour: string | null;
    dorsal_pattern: string | null;
    underside_colour: string | null;
  };
};

/**
 * Unified pet traits type
 * Supports fish or turtle trait structures
 */
export type PetTraits = FishTraits | TurtleTraits | null;

// ===================== Diet Information =====================

/**
 * Pet diet structure
 * Includes main feeding type and additional notes
 */
export type PetDiet = {
  main_type: string | null;
  remarks: string | null;
} | null;

// ===================== Core Pet Entity =====================

/**
 * Main Pet data model
 * Represents full biological, ecological, and care-related information
 */
export type Pet = {
  pet_id: string;

  // Taxonomy information
  pet_scientific_name: string | null;
  pet_vernacular_name: string | null;
  pet_genus: string | null;
  pet_family: string | null;

  // Morphology and traits
  pet_body_shape: PetBodyShape;
  pet_traits: PetTraits;

  // Physical characteristics
  pet_max_length: number | null;
  pet_max_weight: number | null;
  pet_longevity: number | null;

  // Environmental requirements
  pet_habitat: string | null;
  pet_temperature: string | null;
  pet_ph_range: string | null;
  pet_water_hardness: string | null;
  pet_tank_size: string | null;

  // Cost and classification
  pet_cost: number | null;
  pet_migration_type: string | null;

  // Risk and ecological classification
  pet_danger: string | null;
  pet_is_native: string | null;
  pet_invasive_risk: string | null;

  // Care information
  pet_care_level: string | null;
  pet_comments: string | null;

  // Aquarium usage flag
  pet_aquarium: boolean | null;

  // Media and legal status
  pet_image_ref: string | null;
  pet_banned: boolean | null;

  // Optional budget categorization
  pet_purchase_cost_category?: PurchaseCostCategory;
  pet_lifetime_budget_category?: LifetimeBudgetCategory;

  // Diet information
  pet_diet: PetDiet;
};

// ===================== Recommendation Models =====================

/**
 * Simplified pet model for recommendation system
 * Used in related pet suggestions and search results
 */
export type RecommendedPet = {
  pet_id: string;
  pet_vernacular_name: string | null;
  pet_scientific_name: string | null;
  pet_care_level: string | null;
  pet_is_native: string | null;
  pet_danger: string | null;
  pet_invasive_risk: string | null;
  pet_image_ref: string | null;
  pet_comments: string | null;
  pet_cost: number | null;
  pet_purchase_cost_category?: PurchaseCostCategory;
  pet_lifetime_budget_category?: LifetimeBudgetCategory;
};

/**
 * Quiz-based recommendation model
 * Includes additional physical constraints for user matching logic
 */
export type QuizRecommendationPet = {
  pet_id: string;
  pet_vernacular_name: string | null;
  pet_scientific_name: string | null;
  pet_care_level: string | null;
  pet_is_native: string | null;
  pet_danger: string | null;
  pet_invasive_risk: string | null;
  pet_image_ref: string | null;
  pet_comments: string | null;
  pet_cost: number | null;

  // Additional ecological/physical attributes for filtering
  pet_longevity: number | null;
  pet_max_length: number | null;
  pet_tank_size: string | null;

  // Budget classification
  pet_lifetime_budget_category?: LifetimeBudgetCategory;
};

// ===================== Sorting Options =====================

/**
 * Sorting options used in UI filtering and ordering
 * Covers taxonomy, risk, care level, native status, and cost
 */
export type SortOption =
  | "aquarium"
  | "alphabet_asc"
  | "alphabet_desc"
  | "invasive_risk_desc"
  | "invasive_risk_asc"
  | "care_level_desc"
  | "care_level_asc"
  | "native_status_desc"
  | "native_status_asc"
  | "cost_desc"
  | "cost_asc";
