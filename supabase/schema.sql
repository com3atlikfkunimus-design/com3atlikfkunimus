-- ============================================================
-- Skema Tabel Supabase untuk COM 7 Kedokteran UNIMUS
-- Jalankan query ini di Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/<your-id>/sql
-- ============================================================

-- Tabel researchers: menyimpan data peneliti yang dapat login
CREATE TABLE IF NOT EXISTS researchers (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  username    TEXT        UNIQUE NOT NULL,
  password    TEXT        NOT NULL,  -- GANTI dengan bcrypt hash di production!
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS) — aktifkan untuk keamanan
ALTER TABLE researchers ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan anon key untuk SELECT (diperlukan untuk login)
-- PERHATIAN: Di production, pindahkan logika auth ke Edge Function
-- agar password hash tidak terekspos ke client.
CREATE POLICY "Allow anon select for login" ON researchers
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- Data Sample untuk Testing
-- HAPUS ini di production!
-- ============================================================
INSERT INTO researchers (name, username, password)
VALUES 
  ('Dr. Ahmad Fauzi', 'ahmad.fauzi', 'password123'),
  ('Dr. Siti Rahayu', 'siti.rahayu', 'password456'),
  ('Budi Santoso, M.Kes', 'budi.santoso', 'password789')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- CATATAN KEAMANAN PRODUCTION:
-- 1. Jangan simpan password plaintext. Gunakan bcrypt.
-- 2. Buat Supabase Edge Function untuk memverifikasi password
--    tanpa mengekspos hash ke client.
-- 3. Pertimbangkan menggunakan Supabase Auth (built-in) sebagai
--    alternatif yang lebih aman.
-- ============================================================
