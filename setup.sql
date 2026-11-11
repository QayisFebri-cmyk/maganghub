-- ============================================================
--  MagangHub — Setup Database Supabase
--  Cara pakai: Supabase Dashboard -> SQL Editor -> New query
--              -> paste SEMUA isi file ini -> Run
--  Aman dijalankan lebih dari sekali (pakai IF NOT EXISTS).
-- ============================================================

-- 1. Tabel users -------------------------------------------------
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

-- 2. Tabel divisi ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.divisi (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL UNIQUE,
  deskripsi   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. Tabel pembimbing --------------------------------------------
CREATE TABLE IF NOT EXISTS public.pembimbing (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  nip         VARCHAR(100),
  email       VARCHAR(255),
  divisi_id   INT REFERENCES public.divisi(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 4. Tabel aktivitas (jurnal harian) -----------------------------
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

-- 5. Tabel absensi -----------------------------------------------
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

-- 6. Index bantu (opsional, mempercepat query) -------------------
CREATE INDEX IF NOT EXISTS idx_users_role        ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_aktivitas_user    ON public.aktivitas (user_id);
CREATE INDEX IF NOT EXISTS idx_aktivitas_tanggal ON public.aktivitas (tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_user      ON public.absensi (user_id);

-- 7. Akun demo ---------------------------------------------------
-- CATATAN: password disimpan apa adanya (plain text) HANYA untuk
-- keperluan demo/skripsi. Untuk produksi gunakan Supabase Auth.
INSERT INTO public.users (email, username, password, role, nama)
VALUES ('admin@maganghub.com', 'admin', 'admin123', 'admin', 'Administrator')
ON CONFLICT (email) DO NOTHING;

-- 8. Contoh data divisi (opsional, boleh dihapus) ----------------
INSERT INTO public.divisi (nama, deskripsi) VALUES
  ('IT Support', 'Dukungan teknis dan infrastruktur'),
  ('Web Development', 'Pengembangan aplikasi berbasis web'),
  ('Desain Grafis', 'Desain visual dan materi publikasi')
ON CONFLICT (nama) DO NOTHING;

-- ============================================================
--  Selesai. Tabel: users, divisi, pembimbing, aktivitas, absensi
--  Login demo: admin@maganghub.com  /  admin123
-- ============================================================
