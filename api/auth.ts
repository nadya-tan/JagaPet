import {
  sql,
  hashPassword,
  verifyPassword,
  createSessionToken,
  sha256,
  buildSessionCookie,
  clearSessionCookie,
  getCookie,
  getSessionUser,
} from "./_lib/auth.js";

/* ===================== Helper function: Get action type ===================== */
function getAction(req: any) {
  /*
    Extract action parameter from request query string.

    input:
      req - request object

    output:
      action string such as "login", "logout", "me", "register"
  */

  // Read raw action parameter from URL query
  const rawAction = req.query?.action;

  // If action is array, use first element
  if (Array.isArray(rawAction)) {
    return rawAction[0];
  }

  // Convert action to string, default empty string
  return String(rawAction || "");
}

/* ===================== API function: User login ===================== */
async function login(req: any, res: any) {
  /*
    Handle user login request.

    input:
      req.body.username - username
      req.body.password - password

    output(JSON):
      user - logged in user information
      error - error message if failed
  */

  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract username and password from request body
  const { username, password } = req.body || {};

  // Clean username and password
  const cleanUsername = String(username || "")
    .trim()
    .toLowerCase();
  const cleanPassword = String(password || "");

  // Query user record from database
  const rows = await sql`
    select user_id, user_name, user_password_hash
    from public.user
    where user_name = ${cleanUsername}
    limit 1
  `;

  // Get first matched user
  const user = rows[0];

  // Verify account exists and password is correct
  if (!user || !verifyPassword(cleanPassword, user.user_password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // Generate session token and encrypted hash
  const sessionToken = createSessionToken();
  const sessionHash = sha256(sessionToken);

  // Save session into database with 30 days expiration
  await sql`
    insert into public.user_session (user_id, session_token_hash, expires_at)
    values (${user.user_id}, ${sessionHash}, now() + interval '30 days')
  `;

  // Set login cookie to browser
  res.setHeader("Set-Cookie", buildSessionCookie(sessionToken));

  // Return successful login result
  return res.status(200).json({
    user: {
      userId: user.user_id,
      username: user.user_name,
    },
  });
}

/* ===================== API function: User logout ===================== */
async function logout(req: any, res: any) {
  /*
    Handle user logout request.

    input:
      cookie session token

    output(JSON):
      ok - true if success
  */

  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read session token from cookie
  const token = getCookie(req, "shell&fin_session");

  // If token exists, delete session from database
  if (token) {
    await sql`
      delete from public.user_session
      where session_token_hash = ${sha256(token)}
    `;
  }

  // Clear browser cookie
  res.setHeader("Set-Cookie", clearSessionCookie());

  // Return success result
  return res.status(200).json({ ok: true });
}

/* ===================== API function: Current user info ===================== */
async function me(req: any, res: any) {
  /*
    Get current logged-in user information.

    input:
      request cookie session token

    output(JSON):
      user - current user info
      null - if not logged in
  */

  // Only allow GET request
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get session user from request
  const sessionUser = await getSessionUser(req);

  // If no login session found
  if (!sessionUser) {
    return res.status(200).json({ user: null });
  }

  // Return user information
  return res.status(200).json({
    user: {
      userId: sessionUser.user_id,
      username: sessionUser.user_name,
      answers: sessionUser.answers ?? null,
    },
  });
}

/* ===================== API function: User register ===================== */
async function register(req: any, res: any) {
  /*
    Handle new user registration.

    input:
      req.body.username - username
      req.body.password - password

    output(JSON):
      user - newly created user info
      error - error message if failed
  */

  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract request data
  const { username, password } = req.body || {};

  // Clean username and password
  const cleanUsername = String(username || "")
    .trim()
    .toLowerCase();
  const cleanPassword = String(password || "");

  // Validate username format
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    return res.status(400).json({
      error:
        "Username must be 3-30 characters and use letters, numbers, or underscores only.",
    });
  }

  // Validate password length
  if (cleanPassword.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters.",
    });
  }

  // Check whether username already exists
  const existing = await sql`
    select user_id
    from public.user
    where user_name = ${cleanUsername}
    limit 1
  `;

  // If username exists
  if (existing.length > 0) {
    return res.status(409).json({ error: "Username already exists." });
  }

  // Encrypt password
  const passwordHash = hashPassword(cleanPassword);

  // Insert new user into database
  const inserted = await sql`
    insert into public.user (user_name, user_password_hash)
    values (${cleanUsername}, ${passwordHash})
    returning user_id, user_name
  `;

  // Get inserted user data
  const user = inserted[0];

  // Create login session automatically after registration
  const sessionToken = createSessionToken();
  const sessionHash = sha256(sessionToken);

  // Save session into database
  await sql`
    insert into public.user_session (user_id, session_token_hash, expires_at)
    values (${user.user_id}, ${sessionHash}, now() + interval '30 days')
  `;

  // Set session cookie
  res.setHeader("Set-Cookie", buildSessionCookie(sessionToken));

  // Return created user info
  return res.status(201).json({
    user: {
      userId: user.user_id,
      username: user.user_name,
    },
  });
}

/* ===================== Main API router ===================== */
export default async function handler(req: any, res: any) {
  /*
    Main authentication API handler.

    Route by action parameter:
      ?action=login
      ?action=logout
      ?action=me
      ?action=register

    output(JSON):
      corresponding API result
  */

  try {
    // Get action type
    const action = getAction(req);

    // Route to login API
    if (action === "login") {
      return await login(req, res);
    }

    // Route to logout API
    if (action === "logout") {
      return await logout(req, res);
    }

    // Route to current user API
    if (action === "me") {
      return await me(req, res);
    }

    // Route to register API
    if (action === "register") {
      return await register(req, res);
    }

    // Unknown route
    return res.status(404).json({
      error: "Unknown auth action.",
      action,
    });
  } catch (error) {
    // Print backend error and return 500
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
