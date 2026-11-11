import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export async function signUp(email: string, password: string, userData: any) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) return { error: authError.message }

  if (authData.user) {
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          ...userData,
        },
      ])

    if (userError) return { error: userError.message }
  }

  return { data: authData }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }

  // Get user data from users table
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) return { error: userError.message }

    return { data: { ...data, user: userData } }
  }

  return { data }
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
