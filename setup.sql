-- ============================================================
--  MagangHub — Setup Database Supabase (LENGKAP)
-- ============================================================
--  Cara pakai:
--    Supabase Dashboard -> SQL Editor -> New query
--    -> paste SEMUA isi file ini -> Run
--
--  Script ini AMAN dijalankan berulang kali.
--  Ia akan:
--    1. Membuat tabel yang belum ada
--    2. Menambah constraint yang belum ada
--    3. Mengatur RLS + policy (mode demo)
--    4. Mengisi akun demo + data contoh
-- ============================================================


-- ============================================================
-- 1. TABEL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  username       VARCHAR(100) UNIQUE,
  password       VARCHAR(255),
  role           VARCHAR(50) DEFAULT 'user',
  nama           VARCHAR(255),
  divisi_id      INT,
  pembimbing_id  INT,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.divisi (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  deskripsi   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pembimbing (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  nip         VARCHAR(100),
  email       VARCHAR(255),
  divisi_id   INT REFERENCES public.divisi(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aktivitas (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tanggal     DATE DEFAULT CURRENT_DATE,
  judul       VARCHAR(255),
  deskripsi   TEXT,
  divisi_id   INT REFERENCES public.divisi(id) ON DELETE SET NULL,
  progress    INT DEFAULT 0,
  status      VARCHAR(50) DEFAULT 'menunggu',
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.absensi (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tanggal     DATE DEFAULT CURRENT_DATE,
  jam_masuk   TIME,
  jam_pulang  TIME,
  durasi      VARCHAR(20),
  status      VARCHAR(50),
  keterangan  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 2. CONSTRAINT TAMBAHAN (dijalankan hanya jika belum ada)
-- ============================================================

DO $$
BEGIN
  -- divisi.nama harus unik (dipakai untuk seed & mencegah duplikat)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'divisi_nama_key'
  ) THEN
    ALTER TABLE public.divisi ADD CONSTRAINT divisi_nama_key UNIQUE (nama);
  END IF;
END $$;


-- ============================================================
-- 3. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_role        ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_aktivitas_user    ON public.aktivitas (user_id);
CREATE INDEX IF NOT EXISTS idx_aktivitas_tanggal ON public.aktivitas (tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_user      ON public.absensi (user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal   ON public.absensi (tanggal);


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
--  ⚠️ PENTING — BACA DULU
--
--  Aplikasi MagangHub memakai "anon key" dari browser, dan login-nya
--  memakai tabel `users` (bukan Supabase Auth). Karena itu tabel perlu
--  policy yang mengizinkan akses anon.
--
--  Policy di bawah ini MEMBERI AKSES PENUH kepada siapa pun yang punya
--  anon key (anon key selalu terlihat di browser). Ini CUKUP untuk
--  demo / tugas / skripsi di komputer sendiri, TAPI JANGAN dipakai
--  untuk aplikasi publik yang berisi data sungguhan.
--
--  Untuk produksi: pakai Supabase Auth + policy berbasis auth.uid().
-- ------------------------------------------------------------

ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisi     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembimbing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aktivitas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS demo_all_users      ON public.users;
DROP POLICY IF EXISTS demo_all_divisi     ON public.divisi;
DROP POLICY IF EXISTS demo_all_pembimbing ON public.pembimbing;
DROP POLICY IF EXISTS demo_all_aktivitas  ON public.aktivitas;
DROP POLICY IF EXISTS demo_all_absensi    ON public.absensi;

CREATE POLICY demo_all_users ON public.users
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY demo_all_divisi ON public.divisi
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY demo_all_pembimbing ON public.pembimbing
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY demo_all_aktivitas ON public.aktivitas
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY demo_all_absensi ON public.absensi
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 5. DATA DEMO
-- ============================================================

-- Divisi
INSERT INTO public.divisi (nama, deskripsi) VALUES
  ('Web Development', 'Pengembangan aplikasi berbasis web'),
  ('IT Support', 'Dukungan teknis dan infrastruktur'),
  ('Desain Grafis', 'Desain visual dan materi publikasi')
ON CONFLICT (nama) DO NOTHING;

-- Akun admin
INSERT INTO public.users (email, username, password, role, nama)
VALUES ('admin@maganghub.com', 'admin', 'admin123', 'admin', 'Administrator')
ON CONFLICT (email) DO NOTHING;

-- Pembimbing
INSERT INTO public.pembimbing (nama, nip, email, divisi_id)
SELECT 'Budi Santoso', '198501012010011001', 'budi@maganghub.com', d.id
FROM public.divisi d WHERE d.nama = 'Web Development'
  AND NOT EXISTS (SELECT 1 FROM public.pembimbing WHERE nama = 'Budi Santoso');

INSERT INTO public.pembimbing (nama, nip, email, divisi_id)
SELECT 'Siti Rahmawati', '199002152015022002', 'siti@maganghub.com', d.id
FROM public.divisi d WHERE d.nama = 'Desain Grafis'
  AND NOT EXISTS (SELECT 1 FROM public.pembimbing WHERE nama = 'Siti Rahmawati');

-- Akun peserta
INSERT INTO public.users (email, username, password, role, nama, divisi_id, pembimbing_id)
SELECT 'andi@maganghub.com', 'andi', 'peserta123', 'user', 'Andi Pratama',
       d.id, (SELECT id FROM public.pembimbing WHERE nama = 'Budi Santoso' LIMIT 1)
FROM public.divisi d WHERE d.nama = 'Web Development'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (email, username, password, role, nama, divisi_id, pembimbing_id)
SELECT 'nur@maganghub.com', 'nur', 'peserta123', 'user', 'Nur Aisyah',
       d.id, (SELECT id FROM public.pembimbing WHERE nama = 'Siti Rahmawati' LIMIT 1)
FROM public.divisi d WHERE d.nama = 'Desain Grafis'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (email, username, password, role, nama, divisi_id, pembimbing_id)
SELECT 'rizky@maganghub.com', 'rizky', 'peserta123', 'user', 'Rizky Hidayat',
       d.id, (SELECT id FROM public.pembimbing WHERE nama = 'Budi Santoso' LIMIT 1)
FROM public.divisi d WHERE d.nama = 'IT Support'
ON CONFLICT (email) DO NOTHING;

-- Contoh jurnal (hanya jika tabel aktivitas masih kosong)
INSERT INTO public.aktivitas (user_id, tanggal, judul, deskripsi, divisi_id, progress, status)
SELECT u.id, (CURRENT_DATE - (v.n || ' days')::interval)::date, v.judul, v.deskripsi,
       u.divisi_id, v.progress, v.status
FROM (
  VALUES
    (0, 'Membuat halaman login', 'Implementasi form login dengan validasi', 100, 'disetujui'),
    (1, 'Belajar struktur project Next.js', 'Mempelajari routing dan komponen', 100, 'disetujui'),
    (2, 'Membuat komponen tabel', 'Tabel data peserta dengan pencarian', 80, 'menunggu'),
    (3, 'Desain banner media sosial', 'Membuat 3 varian banner', 60, 'menunggu'),
    (4, 'Perbaikan bug tampilan mobile', 'Memperbaiki layout pada layar kecil', 90, 'disetujui'),
    (5, 'Dokumentasi API', 'Menulis dokumentasi endpoint', 40, 'menunggu')
) AS v(n, judul, deskripsi, progress, status)
CROSS JOIN LATERAL (
  SELECT id, divisi_id FROM public.users
  WHERE email = 'andi@maganghub.com'
  LIMIT 1
) u
WHERE NOT EXISTS (SELECT 1 FROM public.aktivitas);

-- Contoh absensi 5 hari terakhir (hanya jika tabel absensi masih kosong)
INSERT INTO public.absensi (user_id, tanggal, jam_masuk, jam_pulang, durasi, status, keterangan)
SELECT u.id,
       (CURRENT_DATE - (v.n || ' days')::interval)::date,
       CASE WHEN v.status = 'hadir' THEN TIME '08:00' END,
       CASE WHEN v.status = 'hadir' THEN TIME '16:30' END,
       CASE WHEN v.status = 'hadir' THEN '8 jam 30 menit' END,
       v.status,
       v.keterangan
FROM (
  VALUES
    (0, 'hadir', NULL),
    (1, 'hadir', NULL),
    (2, 'hadir', NULL),
    (3, 'izin', 'Keperluan keluarga'),
    (4, 'sakit', 'Demam')
) AS v(n, status, keterangan)
CROSS JOIN LATERAL (
  SELECT id FROM public.users WHERE email = 'andi@maganghub.com' LIMIT 1
) u
WHERE NOT EXISTS (SELECT 1 FROM public.absensi);


-- ============================================================
--  SELESAI
-- ============================================================
--  Tabel : users, divisi, pembimbing, aktivitas, absensi
--
--  Akun demo:
--    Admin    : admin@maganghub.com / admin123
--    Peserta  : andi@maganghub.com  / peserta123
--               nur@maganghub.com   / peserta123
--               rizky@maganghub.com / peserta123
-- ============================================================
