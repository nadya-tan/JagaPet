import { randomUUID } from "crypto";
import { getSessionUser, sql } from "./_lib/auth.js";

/* ===================== Type definition: Task frequency ===================== */
type FrequencySpec = {
  count: number;
  interval: number;
  unit: "day" | "week" | "month" | "year";
};

/* ===================== Helper function: Parse frequency text ===================== */
function parseFrequency(
  rawText: unknown,
  fallback: FrequencySpec,
): FrequencySpec {
  /*
    Convert human-readable frequency text into structured frequency object.

    input:
      rawText - text like "twice a week", "3 times per day"
      fallback - default frequency if parsing fails

    output:
      structured FrequencySpec object
  */

  // Normalize input text
  const text = String(rawText || "")
    .toLowerCase()
    .trim();

  // Return fallback if empty
  if (!text) return fallback;

  // Default values
  let count = 1;
  let interval = 1;
  let unit: FrequencySpec["unit"] = fallback.unit;

  /* ===================== Detect "twice" patterns ===================== */
  if (
    text.includes("twice") ||
    text.includes("2x") ||
    text.includes("2 times")
  ) {
    count = 2;
  }

  /* ===================== Extract numeric count ===================== */
  const numberMatch = text.match(/(\d+)/);
  if (numberMatch && !text.includes("-")) {
    count = Number(numberMatch[1]);
  }

  /* ===================== Detect time unit ===================== */
  if (text.includes("daily") || text.includes("day")) {
    unit = "day";
  } else if (text.includes("weekly") || text.includes("week")) {
    unit = "week";
  } else if (text.includes("monthly") || text.includes("month")) {
    unit = "month";
  } else if (text.includes("yearly") || text.includes("year")) {
    unit = "year";
  }

  /* ===================== Special case: bi-weekly ===================== */
  if (
    text.includes("bi-weekly") ||
    text.includes("biweekly") ||
    text.includes("fortnight")
  ) {
    count = 1;
    interval = 2;
    unit = "week";
  }

  return { count, interval, unit };
}

/* ===================== Helper function: Build default tasks ===================== */
function buildDefaultTasks(careProfile: any) {
  /*
    Generate default pet care tasks based on care profile.

    tasks include:
      - feeding
      - water change
      - health check
  */

  const feedingFreq = Number(careProfile?.pet_care_feeding_freq ?? 1);
  const waterChangeFreq = Number(careProfile?.pet_care_water_chg_freq ?? 7);

  return [
    {
      type: "feeding",
      frequency: {
        count:
          Number.isFinite(feedingFreq) && feedingFreq > 0 ? feedingFreq : 1,
        interval: 1,
        unit: "day" as const,
      },
    },
    {
      type: "water-change",
      frequency: {
        count: 1,
        interval:
          Number.isFinite(waterChangeFreq) && waterChangeFreq > 0
            ? waterChangeFreq
            : 1,
        unit: "week" as const,
      },
    },
    {
      type: "health-check",
      frequency: {
        count: 1,
        interval: 1,
        unit: "week" as const,
      },
    },
  ];
}

/* ===================== Helper function: Map pet record ===================== */
function mapPet(row: any) {
  /*
    Convert database pet_list + pet join result into frontend format.
  */

  return {
    petListId: row.pet_list_id,
    petId: row.pet_id,
    nickname: row.pet_list_name,
    age: row.pet_list_age === null ? null : Number(row.pet_list_age),
    speciesName:
      row.pet_vernacular_name || row.pet_scientific_name || "Unknown species",
    scientificName: row.pet_scientific_name,
    imageUrl: row.pet_image_ref,
  };
}

/* ===================== Helper function: Map task record ===================== */
function mapTask(row: any) {
  /*
    Convert database task record into frontend format.
  */

  return {
    id: row.pet_task_id,
    petListId: row.pet_list_id,
    type: row.pet_task_type,
    done: row.pet_task_done,
    count: Number(row.pet_task_count ?? 1),
    interval: Number(row.pet_task_interval ?? 1),
    intervalUnit: row.pet_task_interval_unit || "day",
    lastCompleted: row.pet_task_last_done,
  };
}

/* ===================== Helper function: Get user pets + tasks ===================== */
async function getUserPetsAndTasks(userId: string) {
  /*
    Fetch all pets and their tasks for a user.
  */

  /* ===================== Query pets ===================== */
  const petRows = await sql`
    select
      pl.pet_list_id,
      pl.user_id,
      pl.pet_list_name,
      pl.pet_list_age,
      pl.pet_id,
      p.pet_vernacular_name,
      p.pet_scientific_name,
      p.pet_image_ref
    from public.pet_list pl
    join public.pet p on p.pet_id = pl.pet_id
    where pl.user_id = ${userId}
  `;

  /* ===================== Query tasks ===================== */
  const taskRows = await sql`
    select
      t.pet_task_id,
      t.pet_list_id,
      t.pet_task_type,
      t.pet_task_done,
      t.pet_task_created_at,
      t.pet_task_last_done,
      t.pet_task_count,
      t.pet_task_interval,
      t.pet_task_interval_unit
    from public.pet_task t
    join public.pet_list pl on pl.pet_list_id = t.pet_list_id
    where pl.user_id = ${userId}
    order by t.pet_task_created_at asc
  `;

  // Return structured response
  return {
    pets: petRows.map(mapPet),
    tasks: taskRows.map(mapTask),
  };
}

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for user pet management system.

    supports:
      GET    -> fetch user pets + tasks
      POST   -> add new pet + auto-generate tasks
      DELETE -> remove pet + tasks

    authentication:
      required session user
  */

  let step = "starting";

  try {
    /* ===================== Step 1: Get session user ===================== */
    step = "getting session user";
    const sessionUser = await getSessionUser(req);

    if (!sessionUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /* ===================== GET: Fetch user pets ===================== */
    if (req.method === "GET") {
      const data = await getUserPetsAndTasks(sessionUser.user_id);
      return res.status(200).json(data);
    }

    /* ===================== POST: Add new pet ===================== */
    if (req.method === "POST") {
      step = "validating request body";

      // Extract input data
      const { petId, nickname, age } = req.body || {};

      // Validate required fields
      if (!petId || !nickname || !String(nickname).trim()) {
        return res.status(400).json({ error: "Missing petId or nickname" });
      }

      // Normalize age value
      const ageValue =
        age === undefined || age === null || age === "" ? null : Number(age);

      if (ageValue !== null && Number.isNaN(ageValue)) {
        return res.status(400).json({ error: "Invalid age" });
      }

      /* ===================== Verify pet species exists ===================== */
      step = "checking pet species";
      const petRows = await sql`
        select pet_id
        from public.pet
        where pet_id = ${String(petId)}
        limit 1
      `;

      if (petRows.length === 0) {
        return res.status(404).json({ error: "Pet species not found" });
      }

      /* ===================== Insert into pet_list ===================== */
      const petListId = randomUUID();

      step = "inserting pet_list";
      await sql`
        insert into public.pet_list (
          pet_list_id,
          user_id,
          pet_list_name,
          pet_list_age,
          pet_id
        )
        values (
          ${petListId},
          ${sessionUser.user_id},
          ${String(nickname).trim()},
          ${ageValue},
          ${String(petId)}
        )
      `;

      /* ===================== Load care profile ===================== */
      step = "reading pet_care_profile";
      let careProfile = null;

      try {
        const careRows = await sql`
          select
            pc.pet_care_feeding_freq,
            pc.pet_care_water_chg_freq
          from public.pet p
          left join public.pet_care pc
            on pc.pet_genus = p.pet_genus
          where p.pet_id = ${String(petId)}
          limit 1
        `;

        careProfile = careRows[0] ?? null;
      } catch (error: any) {
        // Handle missing table gracefully
        if (error?.code === "42P01") {
          console.warn(
            "pet_care_profile table does not exist yet. Using fallback task frequencies.",
          );
        } else {
          throw error;
        }
      }

      /* ===================== Generate default tasks ===================== */
      const defaultTasks = buildDefaultTasks(careProfile);

      /* ===================== Insert tasks ===================== */
      for (const task of defaultTasks) {
        step = `inserting pet_task: ${task.type}`;

        await sql`
          insert into public.pet_task (
            pet_task_id,
            pet_list_id,
            pet_task_type,
            pet_task_done,
            pet_task_created_at,
            pet_task_last_done,
            pet_task_count,
            pet_task_interval,
            pet_task_interval_unit
          )
          values (
            ${randomUUID()},
            ${petListId},
            ${task.type},
            false,
            now(),
            null,
            ${task.frequency.count},
            ${task.frequency.interval},
            ${task.frequency.unit}
          )
        `;
      }

      /* ===================== Return updated data ===================== */
      step = "loading updated pets and tasks";
      const data = await getUserPetsAndTasks(sessionUser.user_id);
      return res.status(201).json(data);
    }

    /* ===================== DELETE: Remove pet ===================== */
    if (req.method === "DELETE") {
      const petListId = String(req.query.petListId || "");

      // Validate input
      if (!petListId) {
        return res.status(400).json({ error: "Missing petListId" });
      }

      /* ===================== Check ownership ===================== */
      const ownerRows = await sql`
        select pet_list_id
        from public.pet_list
        where pet_list_id = ${petListId}
          and user_id = ${sessionUser.user_id}
        limit 1
      `;

      if (ownerRows.length === 0) {
        return res.status(404).json({ error: "Pet not found" });
      }

      /* ===================== Delete tasks first ===================== */
      await sql`
        delete from public.pet_task
        where pet_list_id = ${petListId}
      `;

      /* ===================== Delete pet ===================== */
      await sql`
        delete from public.pet_list
        where pet_list_id = ${petListId}
          and user_id = ${sessionUser.user_id}
      `;

      return res.status(200).json({ ok: true });
    }
    
    /* ===================== PATCH: Update task status ===================== */
    if (req.method === "PATCH") {

      const { taskId } = req.body || {};

      if (!taskId) {
        return res.status(400).json({ error: "Missing taskId" });
      }

      /* ===================== Update task in database ===================== */
      const rows = await sql`
        update public.pet_task t
        set
          pet_task_done = true,
          pet_task_last_done = now()
        from public.pet_list pl
        where t.pet_list_id = pl.pet_list_id
          and pl.user_id = ${sessionUser.user_id}
          and t.pet_task_id = ${String(taskId)}
        returning
          t.pet_task_id,
          t.pet_list_id,
          t.pet_task_type,
          t.pet_task_done,
          t.pet_task_created_at,
          t.pet_task_last_done,
          t.pet_task_count,
          t.pet_task_interval,
          t.pet_task_interval_unit
      `;
      
      /* ===================== Handle not found ===================== */
      if (rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      /* ===================== Return updated task ===================== */
      return res.status(200).json(mapTask(rows[0]));
    }

    /* ===================== Invalid method fallback ===================== */
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    // Log error with step tracking for debugging
    console.error("[/api/user-pets error]", { step, error });

    // Return structured error response
    return res.status(500).json({
      error: `Failed while ${step}`,
      detail: error?.message,
      code: error?.code,
      constraint: error?.constraint,
    });
  }
}
