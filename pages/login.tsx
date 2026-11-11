import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from '@/lib/supabase'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      setLoading(false)
      return
    }

    const result = await signIn(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Success - redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" className={styles.logoImg} />
        </div>

        <div className={styles.card}>
          <h2>Selamat Datang</h2>
          <p className={styles.subtitle}>Silakan login untuk melanjutkan</p>

          {error && (
            <div className={styles.error}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label>📧 Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>🔐 Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePass}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnLogin}
              disabled={loading}
            >
              {loading ? 'Memproses...' : '✓ Masuk'}
            </button>
          </form>

          <div className={styles.infoBox}>
            <strong>👤 Demo Account:</strong>
            admin@maganghub.com / admin123
          </div>
        </div>

        <div className={styles.footer}>
          <p>&copy; 2026 MagangHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
