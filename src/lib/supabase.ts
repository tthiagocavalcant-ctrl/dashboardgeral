import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbClient = {
  id: string;
  name: string;
  company: string;
  niche: string | null;
  result_type: string;
  ad_account_id: string;
  access_token: string;
  created_at: string;
  updated_at: string;
};

export type DbMetricLimit = {
  id: string;
  client_id: string;
  metric: string;
  max_value: number | null;
  min_value: number | null;
};
