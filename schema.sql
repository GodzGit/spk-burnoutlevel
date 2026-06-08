-- schema.sql
-- Script SQL untuk membuat struktur database pada Supabase SQL Editor

-- 1. Hapus tabel lama jika ada (opsional, berurutan karena foreign key)
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS participants;

-- 2. Buat tabel participants
CREATE TABLE participants (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama TEXT NOT NULL,
    prodi TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Buat tabel assessments
CREATE TABLE assessments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    participant_id INT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    beban_akademik NUMERIC NOT NULL CHECK (beban_akademik >= 0 AND beban_akademik <= 100),
    durasi_tidur NUMERIC NOT NULL CHECK (durasi_tidur >= 0 AND durasi_tidur <= 12),
    aktivitas_non_akademik NUMERIC NOT NULL CHECK (aktivitas_non_akademik >= 0 AND aktivitas_non_akademik <= 100),
    burnout_score NUMERIC NOT NULL CHECK (burnout_score >= 0 AND burnout_score <= 100),
    burnout_category TEXT NOT NULL CHECK (burnout_category IN ('Rendah', 'Sedang', 'Tinggi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Aktifkan Row Level Security (RLS) untuk keamanan
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 5. Buat Kebijakan Akses Publik (Anonymous Insert & Read)
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

-- Catatan Tambahan:
-- Pastikan Anda menonaktifkan atau mengonfigurasi RLS di dashboard Supabase agar Anon Key bisa menulis dan membaca data.
-- Kode di atas mempermudah mahasiswa pemula agar sistem dapat berjalan tanpa sistem autentikasi (login) yang rumit.
