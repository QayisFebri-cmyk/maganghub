import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Reveal from '@/components/ui/Reveal'
import { useAuth } from '@/lib/auth-context'
import { absensiApi, divisiApi, jurnalApi, pesertaApi } from '@/lib/api'
import { currentMonthRange, formatDate } from '@/lib/format'
import type { AbsensiRow, AktivitasRow, Divisi, Profile } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type Rekap = {
  id: string
  nama: string
  email: string
  divisi: string
  jurnal: number
  disetujui: number
  menunggu: number
  ditolak: number
  hadir: number
  izin: number
  sakit: number
  alpha: number
}

export default function LaporanPage() {
  const { user } = useAuth()

  const [jurnal, setJurnal] = useState<AktivitasRow[]>([])
  const [absensi, setAbsensi] = useState<AbsensiRow[]>([])
  const [divisiList, setDivisiList] = useState<Divisi[]>([])
  const [pesertaList, setPesertaList] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [range, setRange] = useState(currentMonthRange())
  const [divisiFilter, setDivisiFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [jurnalData, absensiData, divisiData, pesertaData] =
        await Promise.all([
          jurnalApi.list(),
          absensiApi.list(),
          divisiApi.list(),
          pesertaApi.list(),
        ])

      setJurnal(jurnalData)
      setAbsensi(absensiData)
      setDivisiList(divisiData)
      setPesertaList(pesertaData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const divisiMap = useMemo(() => {
    const map = new Map<number, string>()
    divisiList.forEach((item) => map.set(item.id, item.nama))
    return map
  }, [divisiList])

  const inRange = useCallback(
    (tanggal: string) => tanggal >= range[0] && tanggal <= range[1],
    [range]
  )

  const jurnalFiltered = useMemo(
    () =>
      jurnal.filter(
        (row) =>
          inRange(row.tanggal) &&
          (divisiFilter === 'all' || String(row.divisi_id) === divisiFilter)
      ),
    [jurnal, inRange, divisiFilter]
  )

  const absensiFiltered = useMemo(() => {
    const allowed = new Set(jurnalFiltered.map((row) => row.user_id))
    return absensi.filter(
      (row) =>
        inRange(row.tanggal) &&
        (divisiFilter === 'all' || allowed.has(row.user_id))
    )
  }, [absensi, jurnalFiltered, inRange, divisiFilter])

  const summary = useMemo(() => {
    return {
      jurnal: jurnalFiltered.length,
      disetujui: jurnalFiltered.filter((r) => r.status === 'disetujui').length,
      menunggu: jurnalFiltered.filter((r) => r.status === 'menunggu').length,
      ditolak: jurnalFiltered.filter((r) => r.status === 'ditolak').length,
      hadir: absensiFiltered.filter((r) => r.status === 'hadir').length,
      izin: absensiFiltered.filter((r) => r.status === 'izin').length,
      sakit: absensiFiltered.filter((r) => r.status === 'sakit').length,
      alpha: absensiFiltered.filter((r) => r.status === 'alpha').length,
    }
  }, [jurnalFiltered, absensiFiltered])

  const rekap = useMemo<Rekap[]>(() => {
    const map = new Map<string, Rekap>()

    const ensure = (id: string, nama: string, email: string, divisi: string) => {
      if (!map.has(id)) {
        map.set(id, {
          id,
          nama,
          email,
          divisi,
          jurnal: 0,
          disetujui: 0,
          menunggu: 0,
          ditolak: 0,
          hadir: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
        })
      }
      return map.get(id)!
    }

    const pesertaMap = new Map(pesertaList.map((item) => [item.id, item]))

    jurnalFiltered.forEach((row) => {
      const peserta = pesertaMap.get(row.user_id)
      const entry = ensure(
        row.user_id,
        row.users?.nama || peserta?.nama || 'Tanpa nama',
        row.users?.email || peserta?.email || '-',
        divisiMap.get(row.divisi_id || 0) || 'Tanpa divisi'
      )

      entry.jurnal += 1
      if (row.status === 'disetujui') entry.disetujui += 1
      else if (row.status === 'menunggu') entry.menunggu += 1
      else if (row.status === 'ditolak') entry.ditolak += 1
    })

    absensiFiltered.forEach((row) => {
      const peserta = pesertaMap.get(row.user_id)
      const entry = ensure(
        row.user_id,
        row.users?.nama || peserta?.nama || 'Tanpa nama',
        row.users?.email || peserta?.email || '-',
        'Tanpa divisi'
      )

      if (row.status === 'hadir') entry.hadir += 1
      else if (row.status === 'izin') entry.izin += 1
      else if (row.status === 'sakit') entry.sakit += 1
      else if (row.status === 'alpha') entry.alpha += 1
    })

    return Array.from(map.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama)
    )
  }, [jurnalFiltered, absensiFiltered, pesertaList, divisiMap])

  const columns: Column<Rekap>[] = [
    {
      key: 'nama',
      header: 'Peserta',
      render: (row) => (
        <div>
          <div className={ui.tdStrong}>{row.nama}</div>
          <div className={ui.hint}>{row.divisi}</div>
        </div>
      ),
    },
    {
      key: 'jurnal',
      header: 'Jurnal',
      align: 'right',
      width: '80px',
      render: (row) => <span className={ui.mono}>{row.jurnal}</span>,
    },
    {
      key: 'disetujui',
      header: 'Disetujui',
      align: 'right',
      width: '95px',
      render: (row) => <span className={ui.mono}>{row.disetujui}</span>,
    },
    {
      key: 'menunggu',
      header: 'Menunggu',
      align: 'right',
      width: '95px',
      render: (row) => <span className={ui.mono}>{row.menunggu}</span>,
    },
    {
      key: 'hadir',
      header: 'Hadir',
      align: 'right',
      width: '80px',
      render: (row) => <span className={ui.mono}>{row.hadir}</span>,
    },
    {
      key: 'izin',
      header: 'Izin',
      align: 'right',
      width: '70px',
      render: (row) => <span className={ui.mono}>{row.izin}</span>,
    },
    {
      key: 'sakit',
      header: 'Sakit',
      align: 'right',
      width: '70px',
      render: (row) => <span className={ui.mono}>{row.sakit}</span>,
    },
    {
      key: 'alpha',
      header: 'Alpha',
      align: 'right',
      width: '70px',
      render: (row) => <span className={ui.mono}>{row.alpha}</span>,
    },
  ]

  return (
    <AppShell title="Laporan">
      <div className={page.page}>
        <PageHeader
          title="Laporan"
          subtitle="Rekap jurnal dan absensi peserta magang"
          actions={
            <button
              type="button"
              className={`${ui.btn} ${ui.btnGhost} no-print`}
              onClick={() => window.print()}
            >
              🖨️ Cetak
            </button>
          }
        />

        {error ? (
          <div className={`${ui.alert} ${ui.alertError}`}>
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        <section className={ui.card}>
          <div className={ui.cardBody}>
            <div className={page.filters}>
              <div className={page.filterField}>
                <span className={page.filterLabel}>Dari Tanggal</span>
                <input
                  type="date"
                  className={ui.input}
                  value={range[0]}
                  onChange={(event) =>
                    setRange([event.target.value, range[1]])
                  }
                />
              </div>

              <div className={page.filterField}>
                <span className={page.filterLabel}>Sampai Tanggal</span>
                <input
                  type="date"
                  className={ui.input}
                  value={range[1]}
                  onChange={(event) =>
                    setRange([range[0], event.target.value])
                  }
                />
              </div>

              <div className={page.filterField}>
                <span className={page.filterLabel}>Divisi</span>
                <select
                  className={ui.select}
                  value={divisiFilter}
                  onChange={(event) => setDivisiFilter(event.target.value)}
                >
                  <option value="all">Semua divisi</option>
                  {divisiList.map((divisi) => (
                    <option key={divisi.id} value={divisi.id}>
                      {divisi.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className={page.filterField}>
                <span className={page.filterLabel}>Periode</span>
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnGhost}`}
                  onClick={() => setRange(currentMonthRange())}
                >
                  Bulan ini
                </button>
              </div>
            </div>

            <p className={ui.hint} style={{ marginTop: 12 }}>
              Menampilkan data {formatDate(range[0])} — {formatDate(range[1])}
            </p>
          </div>
        </section>

        <Reveal delay={40}>
          <div className={page.summaryGrid}>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>{summary.jurnal}</div>
            <div className={page.summaryLabel}>Total Jurnal</div>
          </div>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>{summary.disetujui}</div>
            <div className={page.summaryLabel}>Disetujui</div>
          </div>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>{summary.menunggu}</div>
            <div className={page.summaryLabel}>Menunggu</div>
          </div>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>{summary.ditolak}</div>
            <div className={page.summaryLabel}>Ditolak</div>
          </div>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>{summary.hadir}</div>
            <div className={page.summaryLabel}>Hadir</div>
          </div>
          <div className={page.summaryItem}>
            <div className={page.summaryValue}>
              {summary.izin + summary.sakit}
            </div>
            <div className={page.summaryLabel}>Izin / Sakit</div>
          </div>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <section>
            <div className={ui.cardHead} style={{ padding: '0 0 12px', border: 0 }}>
              <h2 className={ui.cardTitle}>Rekap per Peserta</h2>
              <span className={ui.hint}>{rekap.length} peserta</span>
            </div>

            <DataTable
              columns={columns}
              rows={rekap}
              rowKey={(row) => row.id}
              loading={loading}
              emptyIcon="📄"
              emptyTitle="Tidak ada data pada periode ini"
              emptyDescription="Coba ubah rentang tanggal atau filter divisi."
            />
          </section>
        </Reveal>
      </div>
    </AppShell>
  )
}
