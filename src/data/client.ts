import { createClient } from "@supabase/supabase-js";

// Server only: these variables have no NEXT_PUBLIC_ prefix, so they never reach browser code.
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
