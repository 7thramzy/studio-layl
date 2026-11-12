import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const SESSION_COOKIE = "layl_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;
const PASSWORD_COST = 16_384;

type AdminRole = "admin" | "editor" | "viewer";
export type AdminSession = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
};

type AdminDb = ReturnType<typeof createAdminDb>;
function createAdminDb() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("ADMIN_CONFIGURATION_MISSING");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

function encodePassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: PASSWORD_COST, r: 8, p: 1 }).toString("hex");
  return `scrypt$${PASSWORD_COST}$8$1$${salt}$${hash}`;
}

function verifyPassword(password: string, encoded: string) {
  const [algorithm, cost, r, p, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !cost || !r || !p || !salt || !expected) return false;
  try {
    const actual = scryptSync(password, salt, 64, {
      N: Number(cost),
      r: Number(r),
      p: Number(p),
    });
    const expectedBuffer = Buffer.from(expected, "hex");
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  } catch {
    return false;
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(name: string) {
  const raw = getRequestHeader("cookie") ?? "";
  const entry = raw.split(";").find((part) => part.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : null;
}

function setSessionCookie(token: string, maxAge = SESSION_MAX_AGE) {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  setResponseHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`,
  );
}

async function ensureBootstrapUser(db: AdminDb) {
  const username = process.env["ADMIN_INITIAL_USERNAME"]?.trim();
  const password = process.env["ADMIN_INITIAL_PASSWORD"];
  if (!username || !password) return;
  const { data: existing, error: lookupError } = await db
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (lookupError) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  if (existing) return;
  const { error: insertError } = await db.from("admin_users").insert({
    username,
    password_hash: encodePassword(password),
    display_name: "مدير استوديو ليل",
    role: "admin",
    is_active: true,
  });
  if (insertError && !insertError.message.toLowerCase().includes("duplicate")) {
    throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  }
}

export async function loginAdmin(username: string, password: string) {
  const db = createAdminDb();
  await ensureBootstrapUser(db);
  const { data: user } = await db
    .from("admin_users")
    .select("id,username,password_hash,display_name,role,is_active")
    .eq("username", username.trim())
    .maybeSingle();
  if (!user) {
    if (!process.env["ADMIN_INITIAL_PASSWORD"])
      throw new Error("ADMIN_INITIAL_ACCOUNT_NOT_CONFIGURED");
    throw new Error("ADMIN_INVALID_CREDENTIALS");
  }
  if (!user.is_active || !verifyPassword(password, user.password_hash)) {
    throw new Error("ADMIN_INVALID_CREDENTIALS");
  }
  const token = randomBytes(32).toString("base64url");
  await db.from("admin_sessions").delete().eq("user_id", user.id);
  const { error } = await db.from("admin_sessions").insert({
    token_hash: hashToken(token),
    user_id: user.id,
    expires_at: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
  });
  if (error) throw new Error("تعذر إنشاء جلسة الدخول");
  await db
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
  setSessionCookie(token);
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role as AdminRole,
  } satisfies AdminSession;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = readCookie(SESSION_COOKIE);
  if (!token) return null;
  const db = createAdminDb();
  const { data: session } = await db
    .from("admin_sessions")
    .select("user_id,expires_at,revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!session || session.revoked_at || new Date(session.expires_at).getTime() <= Date.now())
    return null;
  const { data: user } = await db
    .from("admin_users")
    .select("id,username,display_name,role,is_active")
    .eq("id", session.user_id)
    .maybeSingle();
  if (!user || !user.is_active) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role as AdminRole,
  };
}

export async function logoutAdmin() {
  const token = readCookie(SESSION_COOKIE);
  if (token) {
    const db = createAdminDb();
    await db
      .from("admin_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", hashToken(token));
  }
  setSessionCookie("", 0);
  return { ok: true };
}
