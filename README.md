# MagangHub

Sistem Informasi Manajemen Magang (pengganti aplikasi HTML lama) — dibangun dengan **Next.js 14 + TypeScript + Supabase (PostgreSQL)**.

Tampilan memakai tema *Futuristic Dark*: latar navy gelap, aksen cyan, glassmorphism, dan animasi ringan (hanya hover lift).

---

## 1. Setup Supabase (sekali saja)

1. Buka <https://supabase.com> → login → **New project**
2. Tunggu project selesai dibuat
3. Buka **SQL Editor** → **New query**
4. Copy **seluruh isi file [`setup.sql`](./setup.sql)** → paste → **Run**
5. Buka **Settings → API**, copy:
   - **Project URL**
   - **anon public key**

## 2. Isi `.env.local`

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> `.env.local` sudah masuk `.gitignore`, jadi tidak akan ter-push ke GitHub.

## 3. Jalankan

```bash
npm install
npm run dev
```

Buka <http://localhost:3000> — otomatis redirect ke `/login`.

**Login demo:**

| Email | Password |
| --- | --- |
| `admin@maganghub.com` | `admin123` |

Akun demo ini dibuat oleh `setup.sql`, jadi langsung bisa dipakai.

---

## Struktur Project

```
maganghub/
├── pages/                  # Routing Next.js
│   ├── _app.tsx            # Root app + import globals.css
│   ├── login.tsx           # Halaman login  → /login
│   └── dashboard.tsx       # Dashboard      → /dashboard
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── lib/
│   └── supabase.ts         # Supabase client + auth helper
├── styles/                 # CSS Modules + globals.css
├── public/
│   └── logo.webp
├── legacy/                 # Aplikasi HTML lama (arsip, tidak dipakai)
├── setup.sql               # Query database — paste ke Supabase SQL Editor
├── next.config.js
├── tsconfig.json
└── package.json
```

## Halaman

| Route | Keterangan |
| --- | --- |
| `/` | Redirect ke `/login` |
| `/login` | Form login + akun demo |
| `/dashboard` | Statistik dari Supabase + navigasi sidebar |

## Cara Login Bekerja

`lib/supabase.ts` mencoba **dua jalur**:

1. **Supabase Auth** (`signInWithPassword`) — jalur utama untuk produksi
2. **Tabel `public.users`** — fallback, supaya akun demo dari `setup.sql` langsung bisa dipakai

Sesi disimpan di `localStorage` (key `maganghub_session`).

> ⚠️ **Untuk produksi:** hapus fallback tabel dan pakai Supabase Auth sepenuhnya. Kolom `password` di tabel `users` masih plain text dan hanya untuk keperluan demo.

## Statistik Dashboard

Angka pada kartu statistik diambil langsung dari database:

- **Peserta Magang** → `users` dengan `role = 'user'`
- **Divisi** → jumlah baris `divisi`
- **Pembimbing** → jumlah baris `pembimbing`
- **Jurnal Hari Ini** → `aktivitas` dengan `tanggal = hari ini`
- **Menunggu Approval** → `aktivitas` dengan `status = 'menunggu'`
- **Disetujui** → `aktivitas` dengan `status = 'disetujui'`

## Scripts

```bash
npm run dev     # development  → http://localhost:3000
npm run build   # production build
npm start       # jalankan hasil build
```

## Tech Stack

- Next.js 14 (Pages Router) + React 18 + TypeScript
- Supabase (PostgreSQL) via `@supabase/supabase-js`
- CSS Modules (tanpa framework CSS tambahan)
