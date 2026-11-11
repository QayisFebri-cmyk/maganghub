export type Role = 'admin' | 'pembimbing' | 'user'

export interface Profile {
  id: string
  email: string
  username?: string | null
  nama?: string | null
  role?: Role | string | null
  divisi_id?: number | null
  pembimbing_id?: number | null
  created_at?: string
}

export interface Divisi {
  id: number
  nama: string
  deskripsi?: string | null
  created_at?: string
}

export interface Pembimbing {
  id: number
  nama: string
  nip?: string | null
  email?: string | null
  divisi_id?: number | null
  created_at?: string
}

export type StatusJurnal = 'menunggu' | 'disetujui' | 'ditolak'

export interface Aktivitas {
  id: number
  user_id: string
  tanggal: string
  judul: string
  deskripsi?: string | null
  divisi_id?: number | null
  progress: number
  status: StatusJurnal | string
  created_at?: string
}

export type StatusAbsensi = 'hadir' | 'izin' | 'sakit' | 'alpha'

export interface Absensi {
  id: number
  user_id: string
  tanggal: string
  jam_masuk?: string | null
  jam_pulang?: string | null
  durasi?: string | null
  status?: StatusAbsensi | string | null
  keterangan?: string | null
  created_at?: string
}

/** Baris hasil join PostgREST (user_id -> users) */
export interface WithUser {
  users?: { nama?: string | null; email?: string | null } | null
}

export type AktivitasRow = Aktivitas & WithUser
export type AbsensiRow = Absensi & WithUser

export type DivisiOption = { id: number; nama: string }
export type PembimbingOption = { id: number; nama: string }
