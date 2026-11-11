# MagangHub - Next.js + Supabase

Sistem Informasi Manajemen Magang dengan Next.js, React, dan Supabase PostgreSQL.

## Setup Instructions

### 1. Setup Supabase

1. Buka https://supabase.com dan login ke akun kamu
2. Buat project baru atau gunakan yang sudah ada
3. Di SQL Editor, jalankan query ini untuk membuat tables:

```sql
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
```

4. Copy **Project URL** dan **Anon Key** dari Settings > API

### 2. Setup Project

```bash
# Clone atau download project
cd magang

# Install dependencies
npm install

# Buat .env.local dan isi dengan credentials Supabase
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev

# Buka http://localhost:3000
```

### 3. Login Credentials (Demo)

Sebelum login, tambahkan user di Supabase:
- Email: admin@maganghub.com
- Password: admin123

Atau buat melalui aplikasi (signup feature bisa ditambahkan nanti)

## Project Structure

```
magang/
├── pages/              # Next.js pages
│   ├── login.tsx
│   ├── dashboard.tsx
│   └── _app.tsx
├── components/         # React components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── lib/               # Utilities
│   └── supabase.ts
├── styles/            # CSS Modules
│   ├── globals.css
│   ├── login.module.css
│   ├── dashboard.module.css
│   ├── navbar.module.css
│   ├── sidebar.module.css
│   └── statcard.module.css
├── public/            # Static files
├── package.json
├── next.config.js
└── .env.local
```

## Features

✅ Authentication dengan Supabase
✅ Dashboard dengan stats cards
✅ Sidebar navigation
✅ Responsive design
✅ Futuristic dark UI
✅ Simple animations

## Next Steps

1. Setup database tables di Supabase
2. Copy URL dan Anon Key ke .env.local
3. `npm install` dan `npm run dev`
4. Buat akun atau gunakan demo credentials

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Modules
- **UI**: Emoji icons, glassmorphism design
