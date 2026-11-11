# MagangHub

Sistem Informasi Manajemen Magang — pengganti aplikasi HTML lama.
Dibangun dengan **Next.js 14 + TypeScript + Supabase (PostgreSQL)**.

Tema **Futuristic Dark**: latar navy gelap, aksen cyan, glassmorphism, dan animasi minimal (hanya hover & fade ringan — tidak ada animasi berat).

---

## 1. Setup Supabase

1. Buka <https://supabase.com> → login → pilih project
2. Buka **SQL Editor** → **New query**
3. Copy **seluruh isi file [`setup.sql`](./setup.sql)** → paste → **Run**

Script itu akan membuat tabel, mengatur hak akses (RLS), dan mengisi data demo.
**Aman dijalankan berulang kali.**

> ⚠️ Tanpa langkah ini aplikasi akan error "row-level security policy" karena
> tabel belum punya izin akses untuk anon key.

## 2. Isi `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Ambil dari **Supabase → Settings → API**:

- **Project URL** → contoh `https://abcdefgh.supabase.co`
  *(JANGAN pakai yang ada `/rest/v1/` di belakangnya)*
- **anon public key** (atau `sb_publishable_...`)

## 3. Jalankan

```bash
npm install
npm run dev
```

Buka <http://localhost:3000> → otomatis ke `/login`.

### Akun demo

| Peran | Email | Password |
| --- | --- | --- |
| Administrator | `admin@maganghub.com` | `admin123` |
| Peserta | `andi@maganghub.com` | `peserta123` |
| Peserta | `nur@maganghub.com` | `peserta123` |
| Peserta | `rizky@maganghub.com` | `peserta123` |

---

## Modul

| Route | Modul | Hak akses |
| --- | --- | --- |
| `/login` | Login | publik |
| `/dashboard` | Statistik + grafik 7 hari + jurnal terbaru | semua |
| `/peserta` | CRUD akun peserta | admin (tulis), pembimbing (lihat) |
| `/divisi` | CRUD divisi | admin |
| `/pembimbing` | CRUD pembimbing | admin |
| `/jurnal` | CRUD jurnal harian + setujui/tolak | peserta (milik sendiri), admin & pembimbing (review) |
| `/absensi` | Absen masuk/pulang + rekap | peserta (milik sendiri), admin (kelola) |
| `/laporan` | Rekap per peserta + filter tanggal/divisi + cetak | admin, pembimbing |
| `/profil` | Ubah nama, username, password | semua |

Navigasi sidebar otomatis menyesuaikan peran yang login.

## Struktur Project

```
maganghub/
├── pages/                      # Routing Next.js
│   ├── _app.tsx                # AuthProvider + ToastProvider
│   ├── _document.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   ├── peserta.tsx
│   ├── divisi.tsx
│   ├── pembimbing.tsx
│   ├── jurnal.tsx
│   ├── absensi.tsx
│   ├── laporan.tsx
│   ├── profil.tsx
│   └── 404.tsx
├── components/
│   ├── layout/                 # AppShell, Navbar, Sidebar
│   └── ui/                     # Badge, DataTable, Modal, PageHeader,
│                               # SearchInput, StatCard, Toast
├── lib/
│   ├── supabase.ts             # Supabase client + auth
│   ├── api.ts                  # Semua query database
│   ├── auth-context.tsx        # State user global
│   ├── types.ts                # Tipe TypeScript
│   └── format.ts               # Helper tanggal/status
├── styles/                     # globals.css + CSS Modules
│   ├── globals.css             # token warna, reset, animasi minimal
│   ├── layout.module.css
│   ├── ui.module.css
│   ├── page.module.css
│   └── login.module.css
├── public/logo.webp
├── legacy/                     # Aplikasi HTML lama (arsip, tidak dipakai)
├── setup.sql                   # Query database — paste ke SQL Editor
└── package.json
```

## Cara Login Bekerja

`lib/supabase.ts` mencoba **dua jalur**:

1. **Supabase Auth** (`signInWithPassword`) — jalur utama untuk produksi
2. **Tabel `public.users`** — fallback, supaya akun demo dari `setup.sql`
   langsung bisa dipakai

Sesi disimpan di `localStorage` (key `maganghub_session`).

> ⚠️ **Keamanan:** kolom `password` masih plain text dan policy RLS dibuat
> terbuka (mode demo). Ini **hanya cocok untuk demo / tugas / skripsi**.
> Untuk produksi: pakai Supabase Auth sepenuhnya + policy berbasis `auth.uid()`.

## Scripts

```bash
npm run dev     # development  → http://localhost:3000
npm run build   # production build
npm start       # jalankan hasil build
```

## Tech Stack

- Next.js 14 (Pages Router) + React 18 + TypeScript
- Supabase (PostgreSQL) via `@supabase/supabase-js`
- CSS Modules — tanpa framework CSS tambahan
- Grafik dashboard dibuat dengan CSS murni (tanpa library chart)
