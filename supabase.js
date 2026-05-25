import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hcukwajosbfhbiapnhqv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_skJ_pSQpcjLmJLn_JkE_UQ_KZTcqWcg';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
