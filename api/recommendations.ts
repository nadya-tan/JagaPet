import { neon } from "@neondatabase/serverless";
import {
  buildLifetimeBudgetThresholds,
  enrichPetsWithLifetimeBudget,
} from "./_lib/petBudget.js";

/* ===================== Database connection ===================== */
// Initialize Neon serverless SQL client using environment variable
const sql = neon(process.env.DATABASE_URL!);

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for beginner-friendly native pet recommendations.

    workflow:
      1. Load full dataset for budget threshold calculation
      2. Build lifetime budget scoring thresholds
      3. Query filtered pets (beginner + native + has image)
      4. Normalize data types
      5. Enrich pets with lifetime budget score
      6. Remove internal scoring before returning response
  */

  try {
    /* ===================== Step 1: Load full dataset for scoring model ===================== */
    const allBudgetRows = await sql`
      select
        pet_cost::float8 as pet_cost,
        pet_longevity::float8 as pet_longevity,
        pet_care_level,
        pet_max_length::float8 as pet_max_length
      from public.pet
    `;

    /* ===================== Step 2: Normalize dataset for threshold computation ===================== */
    const normalizedBudgetRows = allBudgetRows.map((row: any) => ({
      // Convert cost to numeric or null
      pet_cost: row.pet_cost == null ? null : Number(row.pet_cost),

      // Convert longevity to numeric or null
      pet_longevity:
        row.pet_longevity == null ? null : Number(row.pet_longevity),

      // Keep care level text
      pet_care_level: row.pet_care_level ?? null,

      // Convert max length to numeric or null
      pet_max_length:
        row.pet_max_length == null ? null : Number(row.pet_max_length),
    }));

    /* ===================== Step 3: Build scoring thresholds ===================== */
    const thresholds = buildLifetimeBudgetThresholds(normalizedBudgetRows);

    /* ===================== Step 4: Query filtered recommendation dataset ===================== */
    const rows = await sql`
      select
        pet_id,
        pet_vernacular_name,
        pet_scientific_name,
        pet_care_level,
        pet_is_native,
        pet_danger,
        pet_invasive_risk,
        pet_image_ref,
        pet_comments,
        pet_cost::float8 as pet_cost,
        pet_longevity::float8 as pet_longevity,
        pet_max_length::float8 as pet_max_length
      from public.pet
      where
        pet_care_level ilike '%Beginner%'
        and pet_is_native ilike 'Native%'
        and pet_image_ref is not null
      order by pet_id
    `;

    /* ===================== Step 5: Normalize query results ===================== */
    const normalizedRows = rows.map((row: any) => ({
      // Ensure ID is string type
      pet_id: String(row.pet_id),

      // Text fields with null fallback
      pet_vernacular_name: row.pet_vernacular_name ?? null,
      pet_scientific_name: row.pet_scientific_name ?? null,
      pet_care_level: row.pet_care_level ?? null,
      pet_is_native: row.pet_is_native ?? null,
      pet_danger: row.pet_danger ?? null,
      pet_invasive_risk: row.pet_invasive_risk ?? null,

      // Validate image reference type
      pet_image_ref:
        typeof row.pet_image_ref === "string" ? row.pet_image_ref : null,

      // Optional comments field
      pet_comments: row.pet_comments ?? null,

      // Numeric conversions
      pet_cost: row.pet_cost == null ? null : Number(row.pet_cost),
      pet_longevity:
        row.pet_longevity == null ? null : Number(row.pet_longevity),
      pet_max_length:
        row.pet_max_length == null ? null : Number(row.pet_max_length),
    }));

    /* ===================== Step 6: Apply lifetime budget scoring ===================== */
    const enrichedRows = enrichPetsWithLifetimeBudget(
      normalizedRows,
      thresholds,
    ).map(({ pet_lifetime_budget_score, ...pet }) => pet); // Remove internal scoring field before returning API response

    /* ===================== Step 7: Return response ===================== */
    return res.status(200).json(enrichedRows);
  } catch (error) {
    // Log error for debugging
    console.error("recommendations error:", error);

    // Return safe error response
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
