import { supabase } from './supabase'
import type {
  Absensi,
  AbsensiRow,
  Aktivitas,
  AktivitasRow,
  Divisi,
  Pembimbing,
  Profile,
} from './types'

const USER_COLUMNS =
  'id, email, username, nama, role, divisi_id, pembimbing_id, created_at'

async function run<T>(
  query: PromiseLike<{ data: any; error: { message: string } | null }>
): Promise<T> {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as T
}

/* ------------------------------------------------------------------ */
/* Divisi                                                             */
/* ------------------------------------------------------------------ */

export const divisiApi = {
  list: () =>
    run<Divisi[]>(
      supabase.from('divisi').select('*').order('nama', { ascending: true })
    ),
  create: (values: { nama: string; deskripsi?: string | null }) =>
    run<Divisi>(
      supabase.from('divisi').insert(values).select().single()
    ),
  update: (id: number, values: { nama: string; deskripsi?: string | null }) =>
    run<Divisi>(
      supabase.from('divisi').update(values).eq('id', id).select().single()
    ),
  remove: (id: number) =>
    run<null>(supabase.from('divisi').delete().eq('id', id)),
}

/* ------------------------------------------------------------------ */
/* Pembimbing                                                         */
/* ------------------------------------------------------------------ */

export const pembimbingApi = {
  list: () =>
    run<Pembimbing[]>(
      supabase
        .from('pembimbing')
        .select('*')
        .order('nama', { ascending: true })
    ),
  create: (values: Partial<Pembimbing>) =>
    run<Pembimbing>(
      supabase.from('pembimbing').insert(values).select().single()
    ),
  update: (id: number, values: Partial<Pembimbing>) =>
    run<Pembimbing>(
      supabase.from('pembimbing').update(values).eq('id', id).select().single()
    ),
  remove: (id: number) =>
    run<null>(supabase.from('pembimbing').delete().eq('id', id)),
}

/* ------------------------------------------------------------------ */
/* Peserta (tabel users)                                              */
/* ------------------------------------------------------------------ */

export const pesertaApi = {
  list: () =>
    run<Profile[]>(
      supabase
        .from('users')
        .select(USER_COLUMNS)
        .order('nama', { ascending: true })
    ),
  get: (id: string) =>
    run<Profile | null>(
      supabase.from('users').select(USER_COLUMNS).eq('id', id).maybeSingle()
    ),
  create: (values: Record<string, unknown>) =>
    run<Profile>(
      supabase.from('users').insert(values).select(USER_COLUMNS).single()
    ),
  update: (id: string, values: Record<string, unknown>) =>
    run<Profile>(
      supabase.from('users').update(values).eq('id', id).select(USER_COLUMNS).single()
    ),
  remove: (id: string) =>
    run<null>(supabase.from('users').delete().eq('id', id)),
}

/* ------------------------------------------------------------------ */
/* Jurnal / Aktivitas                                                 */
/* ------------------------------------------------------------------ */

export const jurnalApi = {
  list: () =>
    run<AktivitasRow[]>(
      supabase
        .from('aktivitas')
        .select('*, users(nama, email)')
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false })
    ),
  listByUser: (userId: string) =>
    run<AktivitasRow[]>(
      supabase
        .from('aktivitas')
        .select('*, users(nama, email)')
        .eq('user_id', userId)
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false })
    ),
  create: (values: Partial<Aktivitas>) =>
    run<Aktivitas>(supabase.from('aktivitas').insert(values).select().single()),
  update: (id: number, values: Partial<Aktivitas>) =>
    run<Aktivitas>(
      supabase.from('aktivitas').update(values).eq('id', id).select().single()
    ),
  setStatus: (id: number, status: string) =>
    run<Aktivitas>(
      supabase.from('aktivitas').update({ status }).eq('id', id).select().single()
    ),
  remove: (id: number) =>
    run<null>(supabase.from('aktivitas').delete().eq('id', id)),
}

/* ------------------------------------------------------------------ */
/* Absensi                                                            */
/* ------------------------------------------------------------------ */

export const absensiApi = {
  list: () =>
    run<AbsensiRow[]>(
      supabase
        .from('absensi')
        .select('*, users(nama, email)')
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false })
    ),
  listByUser: (userId: string) =>
    run<AbsensiRow[]>(
      supabase
        .from('absensi')
        .select('*, users(nama, email)')
        .eq('user_id', userId)
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false })
    ),
  findByUserAndDate: (userId: string, tanggal: string) =>
    run<Absensi | null>(
      supabase
        .from('absensi')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .maybeSingle()
    ),
  create: (values: Partial<Absensi>) =>
    run<Absensi>(supabase.from('absensi').insert(values).select().single()),
  update: (id: number, values: Partial<Absensi>) =>
    run<Absensi>(
      supabase.from('absensi').update(values).eq('id', id).select().single()
    ),
  remove: (id: number) =>
    run<null>(supabase.from('absensi').delete().eq('id', id)),
}

/* ------------------------------------------------------------------ */
/* Statistik dashboard                                                */
/* ------------------------------------------------------------------ */

async function count(
  table: string,
  apply?: (q: any) => any
): Promise<number> {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (apply) q = apply(q)
    const { count: total, error } = await q
    if (error) return 0
    return total ?? 0
  } catch {
    return 0
  }
}

export async function fetchDashboardStats(user: Profile) {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60000
  const iso = new Date(today.getTime() - offset).toISOString().slice(0, 10)
  const isPeserta = user.role === 'user'

  const scope = (q: any) => (isPeserta ? q.eq('user_id', user.id) : q)

  const [peserta, divisi, pembimbing, jurnalHariIni, menunggu, disetujui] =
    await Promise.all([
      isPeserta ? Promise.resolve(1) : count('users', (q) => q.eq('role', 'user')),
      count('divisi'),
      count('pembimbing'),
      count('aktivitas', (q) => scope(q).eq('tanggal', iso)),
      count('aktivitas', (q) => scope(q).eq('status', 'menunggu')),
      count('aktivitas', (q) => scope(q).eq('status', 'disetujui')),
    ])

  return { peserta, divisi, pembimbing, jurnalHariIni, menunggu, disetujui }
}

/** Jumlah jurnal per hari untuk 7 hari terakhir */
export async function fetchWeeklyJurnal(user: Profile) {
  const days: { tanggal: string; label: string; total: number }[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const offset = d.getTimezoneOffset() * 60000
    const iso = new Date(d.getTime() - offset).toISOString().slice(0, 10)
    days.push({
      tanggal: iso,
      label: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
      total: 0,
    })
  }

  try {
    let query = supabase
      .from('aktivitas')
      .select('tanggal')
      .gte('tanggal', days[0].tanggal)
      .lte('tanggal', days[days.length - 1].tanggal)

    if (user.role === 'user') query = query.eq('user_id', user.id)

    const { data, error } = await query
    if (error || !data) return days

    for (const row of data as { tanggal: string }[]) {
      const found = days.find((d) => d.tanggal === row.tanggal)
      if (found) found.total += 1
    }
  } catch {
    /* abaikan */
  }

  return days
}
