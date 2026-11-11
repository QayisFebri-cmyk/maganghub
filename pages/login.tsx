import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { signIn } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, router])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    setLoading(true)

    const result = await signIn(email.trim(), password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    await refresh()

    window.setTimeout(() => {
      router.replace('/dashboard')
    }, 700)
  }

  const busy = loading || success

  return (
    <>
      <Head>
        <title>Masuk — MagangHub</title>
      </Head>

      <div className={styles.loginPage}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.container} id="konten">
          <div className={styles.logo}>
            <img src="/logo.webp" alt="MagangHub" className={styles.logoImg} />
            <p className={styles.logoText}>Sistem Informasi Manajemen Magang</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Selamat Datang</h2>
            <p className={styles.subtitle}>Masuk untuk melanjutkan</p>

            {error ? (
              <div className={styles.error} role="alert">
                <span aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className={styles.success} role="status">
                <span aria-hidden="true">✅</span>
                <span>Login berhasil, mengalihkan...</span>
              </div>
            ) : null}

            <form onSubmit={handleLogin} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@maganghub.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={busy}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={busy}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className={styles.togglePass}
                    aria-label={
                      showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.btnLogin} disabled={busy}>
                {success ? '✓ Berhasil' : loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className={styles.infoBox}>
              <strong>Akun demo</strong>
              <span>admin@maganghub.com</span>
              <span>admin123</span>
            </div>
          </div>

          <p className={styles.footer}>
            &copy; {new Date().getFullYear()} MagangHub
          </p>
        </div>
      </div>
    </>
  )
}
