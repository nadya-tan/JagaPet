import { sql } from "./_lib/auth.js";

/* ===================== Helper function: Format number with unit ===================== */
function formatNumber(value: any, unit: string) {
  /*
    Convert numeric value into text with unit.

    input:
      value - original value
      unit - unit string such as cm, kg, years

    output:
      formatted string or null
  */

  // Return null if empty value
  if (value === null || value === undefined || value === "") return null;

  // Convert value to number
  const num = Number(value);

  // Return null if invalid number
  if (Number.isNaN(num)) return null;

  // Return formatted result
  return `${num} ${unit}`;
}

/* ===================== Helper function: Convert any value to text ===================== */
function asText(value: any): string | null {
  /*
    Convert input value into readable text.

    input:
      value - string / array / object / other

    output:
      text string or null
  */

  // Return null if empty
  if (value === null || value === undefined || value === "") return null;

  // Return directly if already string
  if (typeof value === "string") return value;

  // Convert array into sentence text
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(". ");
  }

  // Convert object values into sentence text
  if (typeof value === "object") {
    return Object.values(value).map(asText).filter(Boolean).join(". ");
  }

  // Convert other data types into string
  return String(value);
}

/* ===================== Helper function: Convert value to string array ===================== */
function asStringArray(value: any): string[] {
  /*
    Convert input into string array.

    input:
      value - string / array / object

    output:
      string array
  */

  // Return empty array if no value
  if (!value) return [];

  // Convert array items into strings
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean) as string[];
  }

  // Convert object values into strings
  if (typeof value === "object") {
    return Object.values(value).map(asText).filter(Boolean) as string[];
  }

  // Single value becomes array
  return [String(value)];
}

/* ===================== Helper function: Convert illness data ===================== */
function asIllnessArray(value: any) {
  /*
    Convert illness data into standard object array.

    input:
      value - array / object

    output:
      array of illness objects:
      {
        name,
        symptoms,
        treatment
      }
  */

  // Return empty array if no value
  if (!value) return [];

  // If input is array
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      // If illness is plain string
      if (typeof item === "string") {
        return {
          name: item,
          symptoms: "",
          treatment: "",
        };
      }

      // If illness is object
      return {
        name: item.name || item.illness || item.title || `Illness ${index + 1}`,
        symptoms: asText(item.symptoms) || "",
        treatment: asText(item.treatment) || "",
      };
    });
  }

  // If input is object dictionary
  if (typeof value === "object") {
    return Object.entries(value).map(([name, details]: any) => ({
      name,
      symptoms: asText(details?.symptoms) || "",
      treatment: asText(details?.treatment) || "",
    }));
  }

  // Default empty array
  return [];
}

/* ===================== Helper function: Feeding frequency formatter ===================== */
function formatFeedingFrequency(value: any) {
  /*
    Convert feeding frequency number into readable text.

    input:
      value - numeric times per day

    output:
      text string or null
  */

  const freq = Number(value);

  // Invalid value
  if (!Number.isFinite(freq) || freq <= 0) return null;

  // Special common cases
  if (freq === 1) return "Daily";
  if (freq === 2) return "Twice daily";

  // General case
  return `${freq} times per day`;
}

/* ===================== Helper function: Water change frequency formatter ===================== */
function formatWaterChangeFrequency(value: any) {
  /*
    Convert water change frequency number into readable text.

    input:
      value - numeric times per week

    output:
      text string or null
  */

  const freq = Number(value);

  // Invalid value
  if (!Number.isFinite(freq) || freq <= 0) return null;

  // Special common cases
  if (freq === 1) return "Weekly";
  if (freq === 2) return "Twice weekly";

  // General case
  return `${freq} times per week`;
}

/* ===================== Helper function: Format diet information ===================== */
function formatDiet(value: any) {
  /*
    Convert diet object into readable text.

    input:
      value - diet object

    output:
      text string or null
  */

  // Return null if empty
  if (!value) return null;

  // Build diet description
  const parts = [
    value.main_type ? `Main diet: ${value.main_type}` : null,
    value.remarks || null,
  ].filter(Boolean);

  // Join text
  return parts.join(". ");
}

/* ===================== Core function: Map database row to care guide ===================== */
function mapCareGuide(row: any) {
  /*
    Convert database pet row into frontend response format.

    input:
      row - database query row

    output:
      formatted pet care guide object
  */

  return {
    petId: row.pet_id,
    name: row.pet_vernacular_name || row.pet_scientific_name || "Unknown Pet",
    scientificName: row.pet_scientific_name,
    vernacularName: row.pet_vernacular_name,
    vernacularNameCn: row.pet_vernacular_name_cn,
    vernacularNameMs: row.pet_vernacular_name_ms,

    maxLength: formatNumber(row.pet_max_length, "cm"),
    maxWeight: formatNumber(row.pet_max_weight, "kg"),
    longevity: formatNumber(row.pet_longevity, "years"),
    careLevel: row.pet_care_level,

    temperature: row.pet_temperature,
    baskingTemp: row.pet_care_basking_temp,
    phRange: row.pet_ph_range,
    waterHardness: row.pet_water_hardness,
    waterDepth: row.pet_care_water_depth,
    tankSize: row.pet_tank_size,

    feedingFreq: formatFeedingFrequency(row.pet_care_feeding_freq),
    waterChangeFreq: formatWaterChangeFrequency(row.pet_care_water_chg_freq),
    dietDetails: formatDiet(row.pet_diet),

    tankRequirements: asText(row.pet_care_tank_requirements),
    tankMates: row.pet_care_tank_mates,

    healthSigns: asStringArray(row.pet_care_health_signs),
    sicknessSigns: asStringArray(row.pet_care_sickness_signs),
    commonIllness: asIllnessArray(row.pet_care_common_illness),
  };
}

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint to get pet care guide.

    request(GET):
      ?petId=xxx

    output(JSON):
      pet care guide data
      error message if failed
  */

  try {
    // Only allow GET request
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Read petId from query string
    const petId = String(req.query.petId || "");

    // Validate petId
    if (!petId) {
      return res.status(400).json({ error: "Missing petId" });
    }

    // Query pet and care data from database
    const rows = await sql`
      select
        p.pet_id,
        p.pet_scientific_name,
        p.pet_vernacular_name,
        p.pet_vernacular_name_cn,
        p.pet_vernacular_name_ms,
        p.pet_genus,
        p.pet_max_length,
        p.pet_max_weight,
        p.pet_longevity,
        p.pet_temperature,
        p.pet_ph_range,
        p.pet_water_hardness,
        p.pet_tank_size,
        p.pet_diet,
        p.pet_care_level,

        pc.pet_care_water_depth,
        pc.pet_care_basking_temp,
        pc.pet_care_cool_temp,
        pc.pet_care_water_chg_freq,
        pc.pet_care_feeding_freq,
        pc.pet_care_tank_mates,
        pc.pet_care_tank_requirements,
        pc.pet_care_health_signs,
        pc.pet_care_sickness_signs,
        pc.pet_care_common_illness
      from public.pet p
      left join public.pet_care pc
        on pc.pet_genus = p.pet_genus
      where p.pet_id = ${petId}
      limit 1
    `;

    // If pet not found
    if (rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Return formatted care guide
    return res.status(200).json(mapCareGuide(rows[0]));
  } catch (error: any) {
    // Print backend error log
    console.error("[/api/care-guide error]", error);

    // Return failure response
    return res.status(500).json({
      error: "Failed to load care guide",
      detail: error?.message,
      code: error?.code,
    });
  }
}
