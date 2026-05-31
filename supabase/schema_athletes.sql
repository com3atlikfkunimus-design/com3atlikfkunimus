-- ============================================================
-- Skema Tabel `athletes` — COM 7 Kedokteran UNIMUS
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS athletes (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Peneliti yang mendaftarkan atlet ini (FK ke researchers)
  researcher_id UUID          NOT NULL REFERENCES researchers(id) ON DELETE CASCADE,

  -- Data Profil Naracoba
  name          TEXT          NOT NULL CHECK (char_length(name) >= 3),
  age           SMALLINT      NOT NULL CHECK (age BETWEEN 10 AND 60),
  prodi         TEXT          NOT NULL,
  weight        NUMERIC(5,2)  NOT NULL CHECK (weight > 0),   -- kg
  height        NUMERIC(5,2)  NOT NULL CHECK (height > 0),   -- cm
  bmi           NUMERIC(5,2)  NOT NULL,
  bmi_category  TEXT          NOT NULL CHECK (bmi_category IN ('Underweight','Normal','Overweight','Obesitas')),

  -- Hasil Pre-Test ABQ
  abq_score     SMALLINT      NOT NULL CHECK (abq_score BETWEEN 5 AND 25),
  abq_answers   JSONB         NOT NULL,  -- array 5 integer [1–5]

  -- Hasil Fisik Pre-Test (Sesi 1)
  sprint_pre    NUMERIC(5,2)  NULL,      -- detik
  cmj_pre       NUMERIC(5,2)  NULL,      -- cm
  hop_pre       NUMERIC(5,2)  NULL,      -- cm
  video_url_sprint TEXT       NULL,
  video_url_cmj    TEXT       NULL,
  video_url_hop    TEXT       NULL,

  -- Hasil Fisik Post-Test (Sesi 2)
  sprint_post   NUMERIC(5,2)  NULL,      -- detik
  cmj_post      NUMERIC(5,2)  NULL,      -- cm
  hop_post      NUMERIC(5,2)  NULL,      -- cm
  abq_post_score SMALLINT     NULL CHECK (abq_post_score BETWEEN 5 AND 25),
  video_url_sprint_post TEXT  NULL,
  video_url_cmj_post    TEXT  NULL,
  video_url_hop_post    TEXT  NULL,

  -- Metadata
  created_at    TIMESTAMPTZ   DEFAULT now()
);

-- ── Indeks ──
CREATE INDEX IF NOT EXISTS idx_athletes_researcher ON athletes(researcher_id);
CREATE INDEX IF NOT EXISTS idx_athletes_created    ON athletes(created_at DESC);

-- ── Row Level Security ──
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Policy: anon key boleh INSERT (diperlukan oleh client browser)
-- CATATAN: Di production, pertimbangkan menggunakan Supabase Auth JWT
-- agar hanya researcher yang login yang bisa menyimpan data.
CREATE POLICY "Allow anon insert athletes" ON athletes
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: anon key boleh SELECT untuk debugging (hapus di production jika perlu)
CREATE POLICY "Allow anon select athletes" ON athletes
  FOR SELECT TO anon USING (true);

-- ============================================================
-- CATATAN: Pastikan tabel `researchers` sudah dibuat terlebih
-- dahulu (lihat supabase/schema.sql) sebelum menjalankan ini,
-- karena ada FOREIGN KEY ke researchers(id).
-- ============================================================
