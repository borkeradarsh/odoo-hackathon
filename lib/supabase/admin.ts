// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This client is used for admin tasks that need to bypass RLS.
// NEVER expose this client or the service_role key to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
