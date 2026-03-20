import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Admin клиент с service_role — только для серверных операций
export const createAdminClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
