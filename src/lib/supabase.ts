import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use placeholder values if env vars are missing - the UI will show a warning
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

export const isMissingConfig = !supabaseUrl || !supabaseAnonKey;

if (isMissingConfig) {
    console.warn('⚠️ Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase: SupabaseClient = createClient(
    supabaseUrl || PLACEHOLDER_URL,
    supabaseAnonKey || PLACEHOLDER_KEY
);
