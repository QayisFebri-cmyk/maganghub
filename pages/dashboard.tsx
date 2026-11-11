import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCurrentUser, signOut } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import StatCard from '@/components/StatCard'
import styles from '@/styles/dashboard.module.css'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.appLayout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Navbar user={user} onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <div className={styles.pageContent}>
          {activeTab === 'dashboard' && (
            <div className={styles.dashboardView}>
              <div className={styles.pageHeader}>
                <div>
                  <h1>Dashboard</h1>
                  <p className={styles.subtitle}>
                    Selamat datang di MagangHub
                  </p>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <StatCard
                  icon="👥"
                  title="Peserta Magang"
                  value="12"
                  color="blue"
                />
                <StatCard
                  icon="🏢"
                  title="Divisi"
                  value="5"
                  color="purple"
                />
                <StatCard
                  icon="👨‍🏫"
                  title="Pembimbing"
                  value="8"
                  color="green"
                />
                <StatCard
                  icon="📝"
                  title="Jurnal Hari Ini"
                  value="23"
                  color="orange"
                />
                <StatCard
                  icon="⏳"
                  title="Menunggu Approval"
                  value="5"
                  color="red"
                />
                <StatCard
                  icon="✅"
                  title="Disetujui"
                  value="45"
                  color="success"
                />
              </div>

              <div className={styles.cardsContainer}>
                <div className={styles.card}>
                  <h3>📊 Overview</h3>
                  <p>Dashboard berhasil dimuat dari Supabase!</p>
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#9CA3AF' }}>
                    User: {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'peserta' && (
            <div className={styles.pageSection}>
              <h1>Data Peserta Magang</h1>
              <p>Fitur ini akan ditambahkan...</p>
            </div>
          )}

          {activeTab === 'jurnal' && (
            <div className={styles.pageSection}>
              <h1>Jurnal Harian</h1>
              <p>Fitur ini akan ditambahkan...</p>
            </div>
          )}

          {activeTab === 'absensi' && (
            <div className={styles.pageSection}>
              <h1>Absensi</h1>
              <p>Fitur ini akan ditambahkan...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
