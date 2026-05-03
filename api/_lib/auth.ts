import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

/**
 * Initialize Neon PostgreSQL SQL client
 * Uses DATABASE_URL from environment variables as the connection string
 */
export const sql = neon(process.env.DATABASE_URL!);

/**
 * Name of the session cookie used to store login state in the browser
 */
const SESSION_COOKIE = "shell&fin_session";

/**
 * Session expiration duration in days
 */
const SESSION_DAYS = 30;

/**
 * Hash a password using optional salt
 *
 * Function details:
 * - Uses crypto.scryptSync for key derivation
 * - Generates a random salt if none is provided
 * - Returns a combined string in format: salt:hash
 *
 * input:
 *   password - plain text password
 *   salt - optional salt value
 *
 * output:
 *   string in format "salt:derivedHash"
 */
export function hashPassword(password: string, salt?: string) {
  // Generate random salt if not provided
  const actualSalt = salt ?? crypto.randomBytes(16).toString("hex");

  // Derive a 64-byte key using scrypt
  const derived = crypto.scryptSync(password, actualSalt, 64).toString("hex");

  // Return salt and hash combined
  return `${actualSalt}:${derived}`;
}

/**
 * Verify whether a plain password matches the stored hash
 *
 * Function details:
 * - Extracts salt and hash from stored value
 * - Recomputes hash using input password
 * - Uses timingSafeEqual to prevent timing attacks
 *
 * input:
 *   password - plain text password input
 *   stored - stored value in format "salt:hash"
 *
 * output:
 *   true if password matches, otherwise false
 */
export function verifyPassword(password: string, stored: string) {
  // Split stored value into salt and hash
  const [salt, key] = stored.split(":");

  // Recompute derived hash using same salt
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");

  // Convert both values to buffers for secure comparison
  const a = Buffer.from(key, "hex");
  const b = Buffer.from(derived, "hex");

  // Constant-time comparison to prevent timing attacks
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Generate a random session token
 *
 * output:
 *   64-character hexadecimal string
 */
export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate SHA-256 hash of a given string
 *
 * input:
 *   value - input string
 *
 * output:
 *   hex-encoded SHA-256 hash
 */
export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Build a session cookie string for HTTP response
 *
 * Function details:
 * - Sets HttpOnly to prevent JS access
 * - Uses SameSite=Lax for CSRF protection
 * - Adds Secure flag in production only
 * - Sets expiration using Max-Age
 *
 * input:
 *   token - session token
 *
 * output:
 *   formatted Set-Cookie string
 */
export function buildSessionCookie(token: string) {
  // Convert days to seconds for cookie expiration
  const maxAge = SESSION_DAYS * 24 * 60 * 60;

  // Add Secure flag only in production environment
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  // Construct cookie string
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/**
 * Clear session cookie (logout)
 *
 * Function details:
 * - Sets Max-Age=0 to immediately invalidate cookie
 */
export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/**
 * Retrieve a cookie value from HTTP request
 *
 * input:
 *   req - HTTP request object
 *   name - cookie name
 *
 * output:
 *   cookie value or null if not found
 */
export function getCookie(req: any, name: string) {
  // Read cookie header
  const cookieHeader = req.headers.cookie || "";

  // Split cookies into array and trim spaces
  const parts = cookieHeader.split(";").map((p: string) => p.trim());

  // Find cookie matching the given name
  const match = parts.find((p: string) => p.startsWith(`${name}=`));

  // Return decoded cookie value
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/**
 * Get authenticated user from session
 *
 * Function details:
 * - Extract session token from cookie
 * - Hash token using SHA-256
 * - Query database for valid session
 * - Join user and profile tables
 *
 * input:
 *   req - HTTP request object
 *
 * output:
 *   user object or null if session is invalid
 */
export async function getSessionUser(req: any) {
  // Extract session token from cookies
  const token = getCookie(req, SESSION_COOKIE);

  // If no token exists, user is not authenticated
  if (!token) return null;

  // Hash token before querying database
  const tokenHash = sha256(token);

  // Query session and user data from database
  const rows = await sql`
    select u.user_id, u.user_name, q.answers
    from public.user_session s
    join public.user u on u.user_id = s.user_id
    left join public.user_quiz_profile q on q.user_id = u.user_id
    where s.session_token_hash = ${tokenHash}
      and s.expires_at > now()
    limit 1
  `;

  // Return user record if found
  return rows[0] ?? null;
}
