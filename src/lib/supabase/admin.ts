/**
 * Server-only Supabase client, authenticated with the service_role key.
 *
 * WHY service_role and not the anon key: Row Level Security on the
 * Suburban Toppers database is set up for staff/customer logins (see the
 * `current_staff_level()` / `current_client_id()` policies), but this app
 * doesn't have Supabase Auth wired in yet — there's no session to check RLS
 * against. Until real auth lands, the app's own backend (this file) acts as
 * the trusted intermediary: it holds the service_role key (which bypasses
 * RLS entirely) and is the ONLY thing allowed to query these tables.
 *
 * DO NOT:
 *   - import this file from a "use client" component
 *   - import this file from anything that ships to the browser
 *   - add a NEXT_PUBLIC_ prefix to SUPABASE_SERVICE_ROLE_KEY
 *
 * Only import this from Server Components, Route Handlers (src/app/api/...),
 * and Server Actions.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL — check .env.local"
  );
}

if (!serviceRoleKey) {
  // Don't throw at import time (that would crash the whole app / build).
  // Queries will fail with a clear error instead — see supabaseAdmin below.
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n" +
      "Get it from: Supabase Dashboard -> Project Settings -> API -> " +
      "'service_role' secret key. Server-side data fetches will fail until it's set."
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey ?? "MISSING_SERVICE_ROLE_KEY", {
  auth: { persistSession: false, autoRefreshToken: false },
});
