import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getCurrentUser, signOut, supabase, type Profile } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import StatCard from '@/components/StatCard'
import styles from '@/styles/dashboard.module.css'

type Stats = {
  peserta: number
  divisi: number
  pembimbing: number
  jurnalHariIni: number
  menunggu: number
  disetujui: number
}

const emptyStats: Stats = {
  peserta: 0,
  divisi: 0,
  pembimbing: 0,
  jurnalHariIni: 0,
  menunggu: 0,
  disetujui: 0,
}

async function countRows(
  table: string,
  apply?: (q: any) => any
): Promise<number> {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (apply) q = apply(q)
    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>(emptyStats)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const currentUser = await getCurrentUser()
      if (!mounted) return

      if (!currentUser) {
        router.replace('/login')
        return
      }

      setUser(currentUser)
      setLoading(false)

      const today = new Date().toISOString().slice(0, 10)

      const [peserta, divisi, pembimbing, jurnalHariIni, menunggu, disetujui] =
        await Promise.all([
          countRows('users', (q) => q.eq('role', 'user')),
          countRows('divisi'),
          countRows('pembimbing'),
          countRows('aktivitas', (q) => q.eq('tanggal', today)),
          countRows('aktivitas', (q) => q.eq('status', 'menunggu')),
          countRows('aktivitas', (q) => q.eq('status', 'disetujui')),
        ])

      if (!mounted) return
      setStats({
        peserta,
        divisi,
        pembimbing,
        jurnalHariIni,
        menunggu,
        disetujui,
      })
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  const placeholder = (title: string, desc: string) => (
    <div className={styles.pageSection}>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  )

  return (
    <>
      <Head>
        <title>Dashboard - MagangHub</title>
      </Head>

      <div className={styles.appLayout}>
        <Navbar user={user} onLogout={handleLogout} />
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className={styles.mainContent}>
          <div className={styles.pageContent}>
            {activeTab === 'dashboard' && (
              <div className={styles.dashboardView}>
                <div className={styles.pageHeader}>
                  <div>
                    <h1>Dashboard</h1>
                    <p className={styles.subtitle}>
                      Selamat datang di MagangHub
                      {user?.nama ? `, ${user.nama}` : ''}
                    </p>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <StatCard
                    icon="👥"
                    title="Peserta Magang"
                    value={stats.peserta}
                    color="blue"
                  />
                  <StatCard
                    icon="🏢"
                    title="Divisi"
                    value={stats.divisi}
                    color="purple"
                  />
                  <StatCard
                    icon="👨‍🏫"
                    title="Pembimbing"
                    value={stats.pembimbing}
                    color="green"
                  />
                  <StatCard
                    icon="📝"
                    title="Jurnal Hari Ini"
                    value={stats.jurnalHariIni}
                    color="orange"
                  />
                  <StatCard
                    icon="⏳"
                    title="Menunggu Approval"
                    value={stats.menunggu}
                    color="red"
                  />
                  <StatCard
                    icon="✅"
                    title="Disetujui"
                    value={stats.disetujui}
                    color="success"
                  />
                </div>

                <div className={styles.cardsContainer}>
                  <div className={styles.card}>
                    <h3>📊 Status Koneksi</h3>
                    <p>
                      Terhubung ke Supabase. Angka di atas diambil langsung dari
                      database.
                    </p>
                    <p className={styles.meta}>Login sebagai: {user?.email}</p>
                  </div>

                  <div className={styles.card}>
                    <h3>🚀 Langkah Berikutnya</h3>
                    <p>
                      Tambahkan data divisi, pembimbing, dan peserta magang lewat
                      tabel Supabase, lalu angka statistik akan terisi otomatis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'peserta' &&
              placeholder(
                'Data Peserta Magang',
                'Modul ini belum dibuat. Sementara kelola data lewat tabel `users` di Supabase.'
              )}

            {activeTab === 'divisi' &&
              placeholder(
                'Data Divisi',
                'Modul ini belum dibuat. Sementara kelola data lewat tabel `divisi` di Supabase.'
              )}

            {activeTab === 'pembimbing' &&
              placeholder(
                'Data Pembimbing',
                'Modul ini belum dibuat. Sementara kelola data lewat tabel `pembimbing` di Supabase.'
              )}

            {activeTab === 'jurnal' &&
              placeholder(
                'Jurnal Harian',
                'Modul ini belum dibuat. Data jurnal tersimpan di tabel `aktivitas`.'
              )}

            {activeTab === 'absensi' &&
              placeholder(
                'Absensi',
                'Modul ini belum dibuat. Data absensi tersimpan di tabel `absensi`.'
              )}

            {activeTab === 'laporan' &&
              placeholder(
                'Laporan',
                'Modul ini belum dibuat. Laporan akan dibuat dari data jurnal dan absensi.'
              )}
          </div>
        </main>
      </div>
    </>
  )
}
