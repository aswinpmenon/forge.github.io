import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const AI = {
  analyze: import.meta.env.VITE_FORGE_AI_API_URL,
  coach: import.meta.env.VITE_FORGE_AI_COACH_URL
};
