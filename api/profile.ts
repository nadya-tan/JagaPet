import { getSessionUser, sql } from "./_lib/auth.js";

/* ===================== Main API handler ===================== */
export default async function handler(req: any, res: any) {
  /*
    API endpoint for user quiz profile.

    Features:
      - GET  : retrieve current user quiz answers
      - POST : create/update user quiz answers

    authentication:
      requires valid session user
  */

  try {
    // Get current logged-in session user
    const sessionUser = await getSessionUser(req);

    // If no session found, return unauthorized
    if (!sessionUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /* ===================== GET: Fetch user quiz profile ===================== */
    if (req.method === "GET") {
      /*
        Return current user's quiz profile.

        output(JSON):
          username - user's name
          answers - stored quiz answers or null
      */

      return res.status(200).json({
        username: sessionUser.user_name,
        answers: sessionUser.answers ?? null,
      });
    }

    /* ===================== POST: Create / update quiz answers ===================== */
    if (req.method === "POST") {
      /*
        Save or update user's quiz answers.

        input(JSON):
          answers - object containing quiz responses

        output(JSON):
          updated answers + timestamp
      */

      const { answers } = req.body || {};

      // Validate answers object
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Missing answers" });
      }

      // Insert or update user quiz profile
      const rows = await sql`
        insert into public.user_quiz_profile (user_id, answers, updated_at)
        values (${sessionUser.user_id}, ${JSON.stringify(answers)}::jsonb, now())
        on conflict (user_id)
        do update set answers = excluded.answers, updated_at = now()
        returning answers, updated_at
      `;

      // Return updated record
      return res.status(200).json(rows[0]);
    }

    /* ===================== Unsupported method ===================== */
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    // Log unexpected server error
    console.error(error);

    // Return generic failure response
    return res.status(500).json({ error: "Internal server error" });
  }
}
