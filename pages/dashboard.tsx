import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth-context'
import { fetchDashboardStats, fetchWeeklyJurnal, jurnalApi } from '@/lib/api'
import {
  formatDate,
  formatDateLong,
  roleLabel,
  statusLabel,
  statusTone,
  todayISO,
} from '@/lib/format'
import type { AktivitasRow } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type Stats = Awaited<ReturnType<typeof fetchDashboardStats>>
type Day = { tanggal: string; label: string; total: number }

const emptyStats: Stats = {
  peserta: 0,
  divisi: 0,
  pembimbing: 0,
  jurnalHariIni: 0,
  menunggu: 0,
  disetujui: 0,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>(emptyStats)
  const [week, setWeek] = useState<Day[]>([])
  const [recent, setRecent] = useState<AktivitasRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const [statsData, weekData, jurnalData] = await Promise.all([
        fetchDashboardStats(user),
        fetchWeeklyJurnal(user),
        user.role === 'user'
          ? jurnalApi.listByUser(user.id)
          : jurnalApi.list(),
      ])

      setStats(statsData)
      setWeek(weekData)
      setRecent(jurnalData.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const maxDay = Math.max(1, ...week.map((day) => day.total))

  const columns: Column<AktivitasRow>[] = [
    {
      key: 'tanggal',
      header: 'Tanggal',
      width: '110px',
      render: (row) => <span className={ui.mono}>{formatDate(row.tanggal)}</span>,
    },
    {
      key: 'peserta',
      header: 'Peserta',
      render: (row) => (
        <span className={ui.tdStrong}>
          {row.users?.nama || row.users?.email || '-'}
        </span>
      ),
    },
    {
      key: 'judul',
      header: 'Kegiatan',
      render: (row) => row.judul || '-',
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (row) => (
        <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
      ),
    },
  ]

  return (
    <AppShell title="Dashboard">
      <div className={page.page}>
        <PageHeader
          title="Dashboard"
          subtitle={`${formatDateLong(todayISO())} · Masuk sebagai ${roleLabel(
            user?.role
          )}`}
          actions={
            <Link href="/jurnal" className={`${ui.btn} ${ui.btnGhost}`}>
              📝 Jurnal
            </Link>
          }
        />

        {error ? (
          <div className={`${ui.alert} ${ui.alertError}`}>
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className={page.statsGrid}>
          <StatCard
            icon="👥"
            label="Peserta Magang"
            value={stats.peserta}
            tone="blue"
          />
          <StatCard icon="🏢" label="Divisi" value={stats.divisi} tone="purple" />
          <StatCard
            icon="🧑‍🏫"
            label="Pembimbing"
            value={stats.pembimbing}
            tone="green"
          />
          <StatCard
            icon="📝"
            label="Jurnal Hari Ini"
            value={stats.jurnalHariIni}
            tone="orange"
          />
          <StatCard
            icon="⏳"
            label="Menunggu Approval"
            value={stats.menunggu}
            tone="red"
          />
          <StatCard
            icon="✅"
            label="Disetujui"
            value={stats.disetujui}
            tone="green"
          />
        </div>

        <div className={page.grid2}>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2 className={ui.cardTitle}>Jurnal 7 Hari Terakhir</h2>
              <span className={ui.hint}>Total: {week.reduce((a, b) => a + b.total, 0)}</span>
            </div>
            <div className={ui.cardBody}>
              <div className={page.chart}>
                {week.map((day) => {
                  const height =
                    day.total === 0 ? 4 : Math.round((day.total / maxDay) * 100)
                  return (
                    <div key={day.tanggal} className={page.barCol}>
                      <span className={page.barValue}>{day.total}</span>
                      <div className={page.barTrack}>
                        <div
                          className={`${page.barFill} ${
                            day.total === 0 ? page.barFillEmpty : ''
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className={page.barLabel}>{day.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2 className={ui.cardTitle}>Ringkasan Akun</h2>
            </div>
            <div className={ui.cardBody}>
              <div className={page.metaList}>
                <div className={page.metaRow}>
                  <span className={page.metaKey}>Nama</span>
                  <span className={page.metaVal}>
                    {user?.nama || 'Belum diisi'}
                  </span>
                </div>
                <div className={page.metaRow}>
                  <span className={page.metaKey}>Email</span>
                  <span className={page.metaVal}>{user?.email}</span>
                </div>
                <div className={page.metaRow}>
                  <span className={page.metaKey}>Peran</span>
                  <span className={page.metaVal}>{roleLabel(user?.role)}</span>
                </div>
                <div className={page.metaRow}>
                  <span className={page.metaKey}>Tanggal</span>
                  <span className={page.metaVal}>{formatDate(todayISO())}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section>
          <div className={ui.cardHead} style={{ padding: '0 0 12px', border: 0 }}>
            <h2 className={ui.cardTitle}>Jurnal Terbaru</h2>
            <Link href="/jurnal" className={ui.hint}>
              Lihat semua →
            </Link>
          </div>
          <DataTable
            columns={columns}
            rows={recent}
            rowKey={(row) => row.id}
            loading={loading}
            emptyIcon="📝"
            emptyTitle="Belum ada jurnal"
            emptyDescription="Jurnal yang dibuat akan tampil di sini."
            skeletonRows={3}
          />
        </section>
      </div>
    </AppShell>
  )
}
