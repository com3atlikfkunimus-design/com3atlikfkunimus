import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton.
 * Kredensial dibaca dari environment variables — tidak pernah di-hardcode.
 * Pastikan .env.local sudah diisi sebelum menjalankan aplikasi.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Environment variables NEXT_PUBLIC_SUPABASE_URL dan ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi. ' +
    'Periksa file .env.local Anda.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
