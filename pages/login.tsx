import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { signIn } from '@/lib/supabase'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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
    setTimeout(() => {
      router.push('/dashboard')
    }, 900)
  }

  return (
    <>
      <Head>
        <title>Login - MagangHub</title>
      </Head>

      <div className={styles.loginPage}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src="/logo.webp" alt="MagangHub" className={styles.logoImg} />
          </div>

          <div className={styles.card}>
            <h2>Selamat Datang</h2>
            <p className={styles.subtitle}>Silakan login untuk melanjutkan</p>

            {error && (
              <div className={styles.error}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <span>✅ Login berhasil, mengalihkan...</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="email">📧 Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading || success}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">🔐 Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading || success}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={styles.togglePass}
                    aria-label="Tampilkan password"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.btnLogin}
                disabled={loading || success}
              >
                {success ? '✓ Berhasil' : loading ? 'Memproses...' : '✓ Masuk'}
              </button>
            </form>

            <div className={styles.infoBox}>
              <strong>👤 Akun Demo:</strong>
              admin@maganghub.com / admin123
            </div>
          </div>

          <div className={styles.footer}>
            <p>&copy; 2026 MagangHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}
