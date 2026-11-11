import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SESSION_KEY = 'maganghub_session'

export type Profile = {
  id: string
  email: string
  username?: string | null
  nama?: string | null
  role?: string | null
  divisi_id?: number | null
  pembimbing_id?: number | null
}

/* ------------------------------------------------------------------ */
/* Session helpers (dipakai untuk mode login tabel `users`)            */
/* ------------------------------------------------------------------ */

function saveSession(profile: Profile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

function readSession(): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

function clearSession() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return (data as Profile) || null
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

/**
 * Login dengan 2 jalur:
 *  1. Supabase Auth (signInWithPassword) — jalur utama / production
 *  2. Tabel `users` (email + password) — fallback agar akun demo dari
 *     setup.sql langsung bisa dipakai tanpa setup tambahan.
 */
export async function signIn(email: string, password: string) {
  // 1) Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password })

  if (!authError && authData?.user) {
    const meta = (authData.user.user_metadata || {}) as Partial<Profile>
    const profile =
      (await getProfileById(authData.user.id)) ||
      ({
        id: authData.user.id,
        email: authData.user.email || email,
        nama: meta.nama ?? null,
        role: meta.role ?? 'admin',
      } as Profile)

    saveSession(profile)
    return { data: profile, error: null as string | null }
  }

  // 2) Fallback: tabel users
  const { data: row, error: rowError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .maybeSingle()

  if (!rowError && row) {
    const profile = row as Profile
    saveSession(profile)
    return { data: profile, error: null as string | null }
  }

  return {
    data: null,
    error: 'Email atau password salah',
  }
}

export async function signUp(
  email: string,
  password: string,
  userData: Partial<Profile> = {}
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData },
  })

  if (authError) return { data: null, error: authError.message }

  if (authData.user) {
    const { error: userError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email,
        role: 'user',
        ...userData,
      },
    ])

    if (userError) return { data: null, error: userError.message }
  }

  return { data: authData, error: null as string | null }
}

export async function getCurrentUser(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const profile = await getProfileById(user.id)
    if (profile) return profile

    const meta = (user.user_metadata || {}) as Partial<Profile>
    return {
      id: user.id,
      email: user.email || '',
      nama: meta.nama ?? null,
      role: meta.role ?? 'admin',
    }
  }

  return readSession()
}

export async function signOut() {
  clearSession()
  try {
    await supabase.auth.signOut()
  } catch {
    /* ignore */
  }
}
