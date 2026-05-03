import { sql } from "./_lib/auth.js";

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for retrieving pet species list.

    features:
      - Returns simplified species overview
      - Includes name, scientific name, image, and risk level
      - Sorted alphabetically by name (case-insensitive)
  */

  try {
    /* ===================== Method validation ===================== */
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    /* ===================== Database query ===================== */
    const rows = await sql`
      select
        pet_id,
        pet_vernacular_name,
        pet_scientific_name,
        pet_image_ref,
        pet_invasive_risk
      from public.pet
      order by lower(coalesce(pet_vernacular_name, pet_scientific_name))
    `;

    /* ===================== Data transformation ===================== */
    const species = rows.map((row: any) => ({
      // Internal ID
      petId: row.pet_id,

      // Display name (fallback logic)
      name:
        row.pet_vernacular_name || row.pet_scientific_name || "Unknown species",

      // Scientific name
      scientificName: row.pet_scientific_name,

      // Image reference URL/path
      imageUrl: row.pet_image_ref,

      // Biodiversity / invasive risk label
      biodiversityRisk: row.pet_invasive_risk || "Unknown",
    }));

    /* ===================== Return response ===================== */
    return res.status(200).json(species);
  } catch (error) {
    // Log server-side error for debugging
    console.error(error);

    // Return generic error response
    return res.status(500).json({ error: "Internal server error" });
  }
}
