import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client. Uses the public anon key, so every query it
// makes is subject to the RLS policies defined in the migrations — a user
// can only ever read their own rows.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
