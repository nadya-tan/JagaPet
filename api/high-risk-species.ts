import { neon } from "@neondatabase/serverless";

/* ===================== Database connection ===================== */
// Create Neon database SQL client using environment variable
const sql = neon(process.env.DATABASE_URL!);

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint to retrieve high invasive risk species list.

    output(JSON):
      array of pet objects with normalized fields

    fields:
      pet_id
      pet_vernacular_name
      pet_scientific_name
      pet_care_level
      pet_is_native
      pet_danger
      pet_invasive_risk
      pet_image_ref
      pet_comments
      pet_cost
  */

  try {
    // Query all pets with high invasive risk and available image
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
        pet_cost::float8 as pet_cost
      from public.pet
      where
        pet_invasive_risk ilike 'High%'
        and pet_image_ref is not null
      order by pet_id
    `;

    // Normalize query result data types and null values
    const normalizedRows = rows.map((row: any) => ({
      // Convert pet_id into string
      pet_id: String(row.pet_id),

      // Keep text fields or set null
      pet_vernacular_name: row.pet_vernacular_name ?? null,
      pet_scientific_name: row.pet_scientific_name ?? null,
      pet_care_level: row.pet_care_level ?? null,
      pet_is_native: row.pet_is_native ?? null,
      pet_danger: row.pet_danger ?? null,
      pet_invasive_risk: row.pet_invasive_risk ?? null,

      // Only keep valid string image reference
      pet_image_ref:
        typeof row.pet_image_ref === "string" ? row.pet_image_ref : null,

      // Keep comments or null
      pet_comments: row.pet_comments ?? null,

      // Convert cost into number if exists
      pet_cost: row.pet_cost == null ? null : Number(row.pet_cost),
    }));

    // Return successful response
    return res.status(200).json(normalizedRows);
  } catch (error) {
    // Print backend error log
    console.error("high risk species error:", error);

    // Return failure response
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
