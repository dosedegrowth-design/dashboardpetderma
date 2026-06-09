import { createClient } from "@supabase/supabase-js";

// Cliente server-only com service role no schema petderma.
// NUNCA importar em componente client.
export function db() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    db: { schema: "petderma" },
    auth: { persistSession: false },
  });
}
