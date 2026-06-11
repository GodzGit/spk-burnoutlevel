-- schema.sql
-- Script SQL untuk membuat struktur database pada Supabase SQL Editor
-- Disesuaikan dengan laporan penelitian terbaru (domain input baru + membership functions)

-- 1. Hapus tabel lama jika ada (opsional, berurutan karena foreign key)
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS fuzzy_rules;
DROP TABLE IF EXISTS membership_functions;
DROP TABLE IF EXISTS criteria;

-- 2. Buat tabel participants
CREATE TABLE participants (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama TEXT NOT NULL,
    prodi TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Buat tabel assessments
-- Domain input disesuaikan dengan laporan terbaru:
--   beban_akademik       : 0-60 (jam/minggu)
--   durasi_tidur          : 0-10 (jam/hari)
--   aktivitas_non_akademik: 0-40 (jam/minggu)
--   burnout_score         : 0-100 (persentase)
CREATE TABLE assessments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    participant_id INT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    beban_akademik NUMERIC NOT NULL CHECK (beban_akademik >= 0 AND beban_akademik <= 60),
    durasi_tidur NUMERIC NOT NULL CHECK (durasi_tidur >= 0 AND durasi_tidur <= 10),
    aktivitas_non_akademik NUMERIC NOT NULL CHECK (aktivitas_non_akademik >= 0 AND aktivitas_non_akademik <= 40),
    burnout_score NUMERIC NOT NULL CHECK (burnout_score >= 0 AND burnout_score <= 100),
    burnout_category TEXT NOT NULL CHECK (burnout_category IN ('Rendah', 'Sedang', 'Tinggi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Buat tabel criteria (definisi kriteria input)
CREATE TABLE criteria (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    min_value NUMERIC NOT NULL,
    max_value NUMERIC NOT NULL,
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Buat tabel membership_functions
-- Mendukung 2 jenis fungsi keanggotaan:
--   trimf  (segitiga)   : menggunakan parameter a, b, c (d = NULL)
--   trapmf (trapesium)  : menggunakan parameter a, b, c, d
CREATE TABLE membership_functions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    criteria_id INT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trimf', 'trapmf')),
    a NUMERIC NOT NULL,
    b NUMERIC NOT NULL,
    c NUMERIC NOT NULL,
    d NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Buat tabel fuzzy_rules (27 aturan)
CREATE TABLE fuzzy_rules (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rule_number INTEGER NOT NULL,
    beban TEXT NOT NULL,
    tidur TEXT NOT NULL,
    aktivitas TEXT NOT NULL,
    output TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Aktifkan Row Level Security (RLS) untuk keamanan
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuzzy_rules ENABLE ROW LEVEL SECURITY;

-- 8. Buat Kebijakan Akses Publik (Anonymous Insert & Read)
-- Kebijakan untuk tabel participants
CREATE POLICY "Allow public insert into participants" 
ON participants FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select from participants" 
ON participants FOR SELECT 
USING (true);

-- Kebijakan untuk tabel assessments
CREATE POLICY "Allow public insert into assessments" 
ON assessments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select from assessments" 
ON assessments FOR SELECT 
USING (true);

-- Kebijakan untuk tabel criteria
CREATE POLICY "Allow public select from criteria"
ON criteria FOR SELECT
USING (true);

-- Kebijakan untuk tabel membership_functions
CREATE POLICY "Allow public select from membership_functions"
ON membership_functions FOR SELECT
USING (true);

-- Kebijakan untuk tabel fuzzy_rules
CREATE POLICY "Allow public select from fuzzy_rules"
ON fuzzy_rules FOR SELECT
USING (true);

-- ============================================================
-- 9. INSERT DATA AWAL KRITERIA
-- ============================================================
INSERT INTO criteria (name, min_value, max_value, unit) VALUES
  ('Beban Akademik', 0, 60, 'jam/minggu'),
  ('Durasi Tidur', 0, 10, 'jam/hari'),
  ('Aktivitas Non Akademik', 0, 40, 'jam/minggu'),
  ('Burnout', 0, 100, 'persen');

-- ============================================================
-- 10. INSERT DATA MEMBERSHIP FUNCTIONS
-- ============================================================
-- A. Beban Akademik (criteria_id = 1, domain 0-60)
INSERT INTO membership_functions (criteria_id, label, type, a, b, c, d) VALUES
  (1, 'Ringan', 'trapmf', 0, 0, 20, 30),
  (1, 'Sedang', 'trimf', 20, 30, 40, NULL),
  (1, 'Berat', 'trapmf', 30, 40, 60, 60);

-- B. Durasi Tidur (criteria_id = 2, domain 0-10)
INSERT INTO membership_functions (criteria_id, label, type, a, b, c, d) VALUES
  (2, 'Kurang', 'trapmf', 0, 0, 5, 6),
  (2, 'Cukup', 'trimf', 5, 6, 7, NULL),
  (2, 'Baik', 'trapmf', 6, 7, 10, 10);

-- C. Aktivitas Non Akademik (criteria_id = 3, domain 0-40)
INSERT INTO membership_functions (criteria_id, label, type, a, b, c, d) VALUES
  (3, 'Rendah', 'trapmf', 0, 0, 10, 15),
  (3, 'Sedang', 'trimf', 10, 17.5, 25, NULL),
  (3, 'Tinggi', 'trapmf', 20, 25, 40, 40);

-- D. Burnout / Output (criteria_id = 4, domain 0-100)
INSERT INTO membership_functions (criteria_id, label, type, a, b, c, d) VALUES
  (4, 'Rendah', 'trapmf', 0, 0, 40, 50),
  (4, 'Sedang', 'trimf', 40, 55, 70, NULL),
  (4, 'Tinggi', 'trapmf', 60, 75, 100, 100);

-- ============================================================
-- 11. INSERT 27 FUZZY RULES
-- ============================================================
INSERT INTO fuzzy_rules (rule_number, beban, tidur, aktivitas, output) VALUES
  (1,  'ringan', 'kurang', 'rendah', 'sedang'),
  (2,  'ringan', 'kurang', 'sedang', 'sedang'),
  (3,  'ringan', 'kurang', 'tinggi', 'tinggi'),
  (4,  'ringan', 'cukup',  'rendah', 'rendah'),
  (5,  'ringan', 'cukup',  'sedang', 'rendah'),
  (6,  'ringan', 'cukup',  'tinggi', 'sedang'),
  (7,  'ringan', 'baik',   'rendah', 'rendah'),
  (8,  'ringan', 'baik',   'sedang', 'rendah'),
  (9,  'ringan', 'baik',   'tinggi', 'sedang'),
  (10, 'sedang', 'kurang', 'rendah', 'tinggi'),
  (11, 'sedang', 'kurang', 'sedang', 'sedang'),
  (12, 'sedang', 'kurang', 'tinggi', 'tinggi'),
  (13, 'sedang', 'cukup',  'rendah', 'sedang'),
  (14, 'sedang', 'cukup',  'sedang', 'rendah'),
  (15, 'sedang', 'cukup',  'tinggi', 'sedang'),
  (16, 'sedang', 'baik',   'rendah', 'sedang'),
  (17, 'sedang', 'baik',   'sedang', 'rendah'),
  (18, 'sedang', 'baik',   'tinggi', 'sedang'),
  (19, 'berat',  'kurang', 'rendah', 'tinggi'),
  (20, 'berat',  'kurang', 'sedang', 'tinggi'),
  (21, 'berat',  'kurang', 'tinggi', 'tinggi'),
  (22, 'berat',  'cukup',  'rendah', 'tinggi'),
  (23, 'berat',  'cukup',  'sedang', 'sedang'),
  (24, 'berat',  'cukup',  'tinggi', 'tinggi'),
  (25, 'berat',  'baik',   'rendah', 'tinggi'),
  (26, 'berat',  'baik',   'sedang', 'sedang'),
  (27, 'berat',  'baik',   'tinggi', 'tinggi');

-- Catatan Tambahan:
-- Pastikan Anda menonaktifkan atau mengonfigurasi RLS di dashboard Supabase agar Anon Key bisa menulis dan membaca data.
-- Kode di atas mempermudah mahasiswa pemula agar sistem dapat berjalan tanpa sistem autentikasi (login) yang rumit.
-- Untuk memperbarui constraint di Supabase yang sudah berjalan, gunakan ALTER TABLE pada SQL Editor.
