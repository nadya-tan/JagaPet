import { sql } from "./_lib/auth.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

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

    const species = rows.map((row: any) => ({
      petId: row.pet_id,
      name:
        row.pet_vernacular_name || row.pet_scientific_name || "Unknown species",
      scientificName: row.pet_scientific_name,
      imageUrl: row.pet_image_ref,
      biodiversityRisk: row.pet_invasive_risk || "Unknown",
    }));

    return res.status(200).json(species);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
