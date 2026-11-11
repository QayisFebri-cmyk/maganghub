import { createClient } from '@supabase/supabase-js'
import type { Profile } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SESSION_KEY = 'maganghub_session'

const USER_COLUMNS =
  'id, email, username, nama, role, divisi_id, pembimbing_id, created_at'

/* ------------------------------------------------------------------ */
/* Session lokal (dipakai oleh jalur login tabel `users`)              */
/* ------------------------------------------------------------------ */

/** Buang kolom password sebelum data disimpan di browser */
function sanitize(profile: Profile): Profile {
  const copy: Record<string, unknown> = { ...profile }
  delete copy.password
  return copy as unknown as Profile
}

function saveSession(profile: Profile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sanitize(profile)))
  } catch {
    /* ignore */
  }
}

function readSession(): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? sanitize(JSON.parse(raw) as Profile) : null
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

export function updateSession(profile: Profile) {
  saveSession(profile)
}

async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  return (data as Profile) || null
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export type SignInResult =
  | { data: Profile; error: null }
  | { data: null; error: string }

/**
 * Login dengan dua jalur:
 *  1. Supabase Auth (signInWithPassword) — jalur utama / produksi
 *  2. Tabel `public.users` — fallback agar akun demo dari setup.sql
 *     langsung bisa dipakai tanpa setup tambahan.
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
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
    return { data: profile, error: null }
  }

  // 2) Fallback: tabel users
  const { data: row, error: rowError } = await supabase
    .from('users')
    .select(`${USER_COLUMNS}, password`)
    .eq('email', email)
    .eq('password', password)
    .maybeSingle()

  if (!rowError && row) {
    const profile = sanitize(row as Profile)
    saveSession(profile)
    return { data: profile, error: null }
  }

  return { data: null, error: 'Email atau password salah' }
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

  return { data: authData, error: null }
}

export async function getCurrentUser(): Promise<Profile | null> {
  try {
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
  } catch {
    /* offline / belum dikonfigurasi */
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
