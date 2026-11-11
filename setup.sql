-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  nama VARCHAR(255),
  divisi_id INT,
  pembimbing_id INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create divisi table
CREATE TABLE public.divisi (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create pembimbing table
CREATE TABLE public.pembimbing (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nip VARCHAR(100),
  email VARCHAR(255),
  divisi_id INT REFERENCES divisi(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create aktivitas table
CREATE TABLE public.aktivitas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tanggal DATE,
  judul VARCHAR(255),
  deskripsi TEXT,
  divisi_id INT REFERENCES divisi(id),
  progress INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'menunggu',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create absensi table
CREATE TABLE public.absensi (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tanggal DATE,
  jam_masuk TIME,
  jam_pulang TIME,
  durasi VARCHAR(20),
  status VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo user
INSERT INTO public.users (email, username, password, role, nama) 
VALUES ('admin@maganghub.com', 'admin', 'admin123', 'admin', 'Administrator');
