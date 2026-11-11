import Head from 'next/head'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'
import ui from '@/styles/ui.module.css'
import styles from '@/styles/login.module.css'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Halaman Tidak Ditemukan — MagangHub</title>
      </Head>

      <div className={styles.loginPage} id="konten">
        <div className={styles.glow} aria-hidden="true" />

        <Reveal className={styles.container}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2.4rem',
                marginBottom: 8,
                filter: 'drop-shadow(0 0 18px rgba(0, 217, 255, 0.35))',
              }}
              aria-hidden="true"
            >
              🛰️
            </div>
            <h2 className={styles.cardTitle}>404 — Halaman Tidak Ditemukan</h2>
            <p className={styles.subtitle}>
              Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
            </p>
            <Link
              href="/dashboard"
              className={`${ui.btn} ${ui.btnPrimary}`}
              style={{ width: '100%', marginTop: 6 }}
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  )
}
