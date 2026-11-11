import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/login.module.css'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Halaman Tidak Ditemukan — MagangHub</title>
      </Head>

      <div className={styles.loginPage}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🔍</div>
            <h2 className={styles.cardTitle}>404 — Halaman Tidak Ditemukan</h2>
            <p className={styles.subtitle}>
              Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
            </p>
            <Link
              href="/dashboard"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 42,
                padding: '0 20px',
                borderRadius: 10,
                fontWeight: 700,
                color: '#04121b',
                background: 'linear-gradient(135deg, #00d9ff, #22b8e0)',
              }}
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
