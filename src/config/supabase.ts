import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase: SupabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
