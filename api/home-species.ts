// 
import { neon } from "@neondatabase/serverless";
import {
  buildLifetimeBudgetThresholds,
  enrichPetsWithLifetimeBudget,
} from "./_lib/petBudget.js";

/* ===================== Database connection ===================== */
const sql = neon(process.env.DATABASE_URL!);

/* ===================== Shared helper ===================== */
function normalizePetRow(row: any) {
  return {
    pet_id: String(row.pet_id),

    pet_vernacular_name: row.pet_vernacular_name ?? null,
    pet_scientific_name: row.pet_scientific_name ?? null,
    pet_care_level: row.pet_care_level ?? null,
    pet_is_native: row.pet_is_native ?? null,
    pet_danger: row.pet_danger ?? null,
    pet_invasive_risk: row.pet_invasive_risk ?? null,

    pet_image_ref:
      typeof row.pet_image_ref === "string" ? row.pet_image_ref : null,

    pet_comments: row.pet_comments ?? null,

    pet_cost: row.pet_cost == null ? null : Number(row.pet_cost),
    pet_longevity:
      row.pet_longevity == null ? null : Number(row.pet_longevity),
    pet_max_length:
      row.pet_max_length == null ? null : Number(row.pet_max_length),
  };
}

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for Home page species data.

    output(JSON):
      {
        recommendations: beginner-friendly native pets,
        highRiskSpecies: high invasive-risk pets
      }
  */

  try {
    /* ===================== Step 1: Load full dataset for budget scoring ===================== */
    const allBudgetRows = await sql`
      select
        pet_cost::float8 as pet_cost,
        pet_longevity::float8 as pet_longevity,
        pet_care_level,
        pet_max_length::float8 as pet_max_length
      from public.pet
    `;

    const normalizedBudgetRows = allBudgetRows.map((row: any) => ({
      pet_cost: row.pet_cost == null ? null : Number(row.pet_cost),
      pet_longevity:
        row.pet_longevity == null ? null : Number(row.pet_longevity),
      pet_care_level: row.pet_care_level ?? null,
      pet_max_length:
        row.pet_max_length == null ? null : Number(row.pet_max_length),
    }));

    const thresholds = buildLifetimeBudgetThresholds(normalizedBudgetRows);

    /* ===================== Step 2: Beginner-friendly recommendations ===================== */
    const recommendationRows = await sql`
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

    const normalizedRecommendationRows = recommendationRows.map(normalizePetRow);

    const recommendations = enrichPetsWithLifetimeBudget(
      normalizedRecommendationRows,
      thresholds,
    ).map(({ pet_lifetime_budget_score, ...pet }) => pet);

    /* ===================== Step 3: High-risk species ===================== */
    const highRiskRows = await sql`
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
        pet_invasive_risk ilike 'High%'
        and pet_image_ref is not null
      order by pet_id
    `;

    const normalizedHighRiskRows = highRiskRows.map(normalizePetRow);

    const highRiskSpecies = enrichPetsWithLifetimeBudget(
      normalizedHighRiskRows,
      thresholds,
    ).map(({ pet_lifetime_budget_score, ...pet }) => pet);

    /* ===================== Step 4: Return combined response ===================== */
    return res.status(200).json({
      recommendations,
      highRiskSpecies,
    });
  } catch (error) {
    console.error("home species error:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}