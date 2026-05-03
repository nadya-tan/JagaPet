import { neon } from "@neondatabase/serverless";

/* ===================== Database connection ===================== */
// Create Neon database SQL client using environment variable
const sql = neon(process.env.DATABASE_URL!);

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint to retrieve pet details and related pets.

    request(GET):
      ?id=pet_id

    output(JSON):
      pet - selected pet full data
      relatedPets - similar pets from same genus or family
      error - error message if failed
  */

  try {
    // Read pet id from query string
    const id = String(req.query.id || "").trim();

    // Validate pet id
    if (!id) {
      return res.status(400).json({ error: "Missing pet id" });
    }

    // Query target pet by id
    const petRows = await sql`
      select *
      from public.pet
      where pet_id = ${id}
      limit 1
    `;

    // If pet not found
    if (petRows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Get first matched pet record
    const pet = petRows[0];

    // Initialize related pets result
    let relatedPets: any[] = [];

    // Priority 1: Find pets with same genus
    if (pet.pet_genus) {
      relatedPets = await sql`
        select *
        from public.pet
        where pet_id <> ${id}
          and pet_genus = ${pet.pet_genus}
        limit 3
      `;

      // Priority 2: If no genus, find pets with same family
    } else if (pet.pet_family) {
      relatedPets = await sql`
        select *
        from public.pet
        where pet_id <> ${id}
          and pet_family = ${pet.pet_family}
        limit 3
      `;
    }

    // Return pet detail and related pets
    return res.status(200).json({ pet, relatedPets });
  } catch (error) {
    // Print backend error log
    console.error(error);

    // Return failure response
    return res.status(500).json({ error: "Internal server error" });
  }
}
