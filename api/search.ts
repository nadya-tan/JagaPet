import { neon } from "@neondatabase/serverless";

/* ===================== Database connection ===================== */
// Initialize Neon serverless SQL client using environment variable
const sql = neon(process.env.DATABASE_URL!);

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for pet search (autocomplete / fuzzy search).

    features:
      - Search by vernacular name
      - Search by scientific name
      - Search by genus or family
      - Returns up to 50 matching results
  */

  try {
    // Extract query string from request
    const q = String(req.query.q || "").trim();

    // If empty query, return empty result immediately
    if (!q) {
      return res.status(200).json([]);
    }

    // Build SQL LIKE pattern for fuzzy search
    const pattern = `%${q}%`;

    /* ===================== Database query ===================== */
    const rows = await sql`
      select
        pet_id,
        pet_scientific_name,
        pet_vernacular_name,
        pet_vernacular_name_cn,
        pet_vernacular_name_ms,
        pet_genus,
        pet_family,
        pet_body_shape,
        pet_traits,
        pet_max_length,
        pet_max_weight,
        pet_longevity,
        pet_habitat,
        pet_temperature,
        pet_ph_range,
        pet_water_hardness,
        pet_tank_size,
        pet_migration_type,
        pet_danger,
        pet_is_native,
        pet_comments,
        pet_comments_cn,
        pet_comments_ms,
        pet_aquarium,
        pet_cost,
        pet_image_ref,
        pet_banned,
        pet_invasive_risk,
        pet_care_level,
        pet_diet
      from public.pet
      where
        pet_vernacular_name ilike ${pattern}
        or pet_scientific_name ilike ${pattern}
        or pet_genus ilike ${pattern}
        or pet_family ilike ${pattern}
        or pet_vernacular_name_cn ilike ${pattern}
        or pet_vernacular_name_ms ilike ${pattern}
      limit 50
    `;

    /* ===================== Return results ===================== */
    return res.status(200).json(rows);
  } catch (error) {
    // Log error for debugging purposes
    console.error(error);

    // Return generic failure response
    return res.status(500).json({ error: "Internal server error" });
  }
}
