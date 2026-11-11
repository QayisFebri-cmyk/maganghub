import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { absensiApi, pesertaApi } from '@/lib/api'
import {
  durationBetween,
  formatDate,
  formatTime,
  nowTime,
  statusLabel,
  statusTone,
  todayISO,
} from '@/lib/format'
import type { AbsensiRow, Profile } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type FormState = {
  user_id: string
  tanggal: string
  jam_masuk: string
  jam_pulang: string
  status: string
  keterangan: string
}

const emptyForm = (): FormState => ({
  user_id: '',
  tanggal: todayISO(),
  jam_masuk: '',
  jam_pulang: '',
  status: 'hadir',
  keterangan: '',
})

const STATUS_OPTIONS = ['hadir', 'izin', 'sakit', 'alpha']

export default function AbsensiPage() {
  const { user } = useAuth()
  const toast = useToast()

  const isPeserta = user?.role === 'user'
  const isAdmin = user?.role === 'admin'

  const [rows, setRows] = useState<AbsensiRow[]>([])
  const [pesertaList, setPesertaList] = useState<Profile[]>([])
  const [today, setToday] = useState<AbsensiRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clocking, setClocking] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AbsensiRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<AbsensiRow | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const [absensiData, pesertaData] = await Promise.all([
        isPeserta ? absensiApi.listByUser(user.id) : absensiApi.list(),
        isAdmin ? pesertaApi.list() : Promise.resolve([] as Profile[]),
      ])

      setRows(absensiData)
      setPesertaList(pesertaData)

      if (isPeserta) {
        const todayRow = await absensiApi.findByUserAndDate(user.id, todayISO())
        setToday(todayRow ? ({ ...todayRow } as AbsensiRow) : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat absensi')
    } finally {
      setLoading(false)
    }
  }, [user, isPeserta, isAdmin])

  useEffect(() => {
    load()
  }, [load])

  const pesertaMap = useMemo(() => {
    const map = new Map<string, string>()
    pesertaList.forEach((item) => map.set(item.id, item.nama || item.email))
    return map
  }, [pesertaList])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!keyword) return true
      return [row.users?.nama, row.users?.email, row.keterangan]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [rows, search, statusFilter])

  /* ---------------- Absen masuk / pulang (peserta) ---------------- */

  const handleClockIn = async () => {
    if (!user) return
    setClocking(true)
    try {
      await absensiApi.create({
        user_id: user.id,
        tanggal: todayISO(),
        jam_masuk: nowTime(),
        status: 'hadir',
      })
      toast('Absen masuk berhasil dicatat')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal absen masuk', 'error')
    } finally {
      setClocking(false)
    }
  }

  const handleClockOut = async () => {
    if (!today) return
    setClocking(true)
    try {
      const jamPulang = nowTime()
      await absensiApi.update(today.id, {
        jam_pulang: jamPulang,
        durasi: durationBetween(today.jam_masuk, jamPulang),
      })
      toast('Absen pulang berhasil dicatat')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal absen pulang', 'error')
    } finally {
      setClocking(false)
    }
  }

  /* ---------------- Modal ---------------- */

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (row: AbsensiRow) => {
    setEditing(row)
    setForm({
      user_id: row.user_id,
      tanggal: row.tanggal,
      jam_masuk: row.jam_masuk || '',
      jam_pulang: row.jam_pulang || '',
      status: row.status || 'hadir',
      keterangan: row.keterangan || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!editing && !form.user_id) {
      toast('Pilih peserta terlebih dahulu', 'error')
      return
    }

    setSaving(true)
    try {
      const jamMasuk = form.jam_masuk || null
      const jamPulang = form.jam_pulang || null

      const payload = {
        tanggal: form.tanggal,
        jam_masuk: jamMasuk,
        jam_pulang: jamPulang,
        durasi: durationBetween(jamMasuk, jamPulang),
        status: form.status,
        keterangan: form.keterangan.trim() || null,
      }

      if (editing) {
        await absensiApi.update(editing.id, payload)
        toast('Absensi diperbarui')
      } else {
        await absensiApi.create({ ...payload, user_id: form.user_id })
        toast('Absensi ditambahkan')
      }

      setModalOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    try {
      await absensiApi.remove(deleting.id)
      toast('Absensi dihapus')
      setDeleting(null)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setRemoving(false)
    }
  }

  const columns: Column<AbsensiRow>[] = [
    {
      key: 'tanggal',
      header: 'Tanggal',
      width: '110px',
      render: (row) => <span className={ui.mono}>{formatDate(row.tanggal)}</span>,
    },
    ...(isPeserta
      ? []
      : [
          {
            key: 'peserta',
            header: 'Peserta',
            render: (row: AbsensiRow) => (
              <div>
                <div className={ui.tdStrong}>
                  {row.users?.nama || pesertaMap.get(row.user_id) || '—'}
                </div>
                <div className={ui.hint}>{row.users?.email || ''}</div>
              </div>
            ),
          },
        ]),
    {
      key: 'jam_masuk',
      header: 'Masuk',
      width: '90px',
      render: (row) => (
        <span className={ui.mono}>{formatTime(row.jam_masuk)}</span>
      ),
    },
    {
      key: 'jam_pulang',
      header: 'Pulang',
      width: '90px',
      render: (row) => (
        <span className={ui.mono}>{formatTime(row.jam_pulang)}</span>
      ),
    },
    {
      key: 'durasi',
      header: 'Durasi',
      width: '130px',
      render: (row) => row.durasi || <span className={ui.textMuted}>—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (row) => (
        <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
      ),
    },
    {
      key: 'keterangan',
      header: 'Keterangan',
      render: (row) =>
        row.keterangan || <span className={ui.textMuted}>—</span>,
    },
    ...(isAdmin
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            align: 'right' as const,
            width: '150px',
            render: (row: AbsensiRow) => (
              <div className={ui.rowActions}>
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                  onClick={() => openEdit(row)}
                >
                  Ubah
                </button>
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnDanger} ${ui.btnSm}`}
                  onClick={() => setDeleting(row)}
                >
                  Hapus
                </button>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <AppShell title="Absensi">
      <div className={page.page}>
        <PageHeader
          title="Absensi"
          subtitle={
            isPeserta
              ? 'Catat kehadiran magang harian kamu'
              : 'Rekap kehadiran peserta magang'
          }
          actions={
            isAdmin ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnPrimary}`}
                onClick={openCreate}
              >
                + Tambah Absensi
              </button>
            ) : null
          }
        />

        {isPeserta ? (
          <section className={ui.card}>
            <div className={ui.cardBody}>
              <div className={ui.inline} style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className={ui.textStrong}>
                    Absensi hari ini · {formatDate(todayISO())}
                  </div>
                  <div className={ui.hint}>
                    {today
                      ? `Masuk ${formatTime(today.jam_masuk)}${
                          today.jam_pulang
                            ? ` · Pulang ${formatTime(today.jam_pulang)}`
                            : ''
                        }`
                      : 'Kamu belum absen masuk hari ini'}
                  </div>
                </div>

                <div className={ui.inline}>
                  {!today ? (
                    <button
                      type="button"
                      className={`${ui.btn} ${ui.btnPrimary}`}
                      onClick={handleClockIn}
                      disabled={clocking}
                    >
                      {clocking ? 'Menyimpan...' : '🕒 Absen Masuk'}
                    </button>
                  ) : !today.jam_pulang ? (
                    <button
                      type="button"
                      className={`${ui.btn} ${ui.btnSuccess}`}
                      onClick={handleClockOut}
                      disabled={clocking}
                    >
                      {clocking ? 'Menyimpan...' : '🏁 Absen Pulang'}
                    </button>
                  ) : (
                    <Badge tone="success">
                      Selesai · {today.durasi || '—'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {error ? (
          <div className={`${ui.alert} ${ui.alertError}`}>
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className={ui.toolbar}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari peserta atau keterangan..."
          />

          <select
            className={ui.select}
            style={{ maxWidth: 170 }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter status"
          >
            <option value="all">Semua status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>

          <div className={ui.toolbarSpacer} />
          <span className={ui.hint}>{filtered.length} catatan</span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          loading={loading}
          emptyIcon="📅"
          emptyTitle="Belum ada absensi"
          emptyDescription={
            isPeserta
              ? 'Klik "Absen Masuk" untuk mencatat kehadiran hari ini.'
              : 'Catatan kehadiran peserta akan muncul di sini.'
          }
        />
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Absensi' : 'Tambah Absensi'}
        onClose={() => setModalOpen(false)}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnGhost}`}
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              form="absensi-form"
              className={`${ui.btn} ${ui.btnPrimary}`}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="absensi-form" onSubmit={handleSubmit}>
          <div className={ui.formGrid}>
            {!editing ? (
              <div className={`${ui.field} ${ui.formGridFull}`}>
                <label
                  className={`${ui.label} ${ui.required}`}
                  htmlFor="absensi-peserta"
                >
                  Peserta
                </label>
                <select
                  id="absensi-peserta"
                  className={ui.select}
                  value={form.user_id}
                  onChange={(event) =>
                    setForm({ ...form, user_id: event.target.value })
                  }
                  required
                >
                  <option value="">— Pilih peserta —</option>
                  {pesertaList.map((peserta) => (
                    <option key={peserta.id} value={peserta.id}>
                      {peserta.nama || peserta.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={ui.field}>
              <label
                className={`${ui.label} ${ui.required}`}
                htmlFor="absensi-tanggal"
              >
                Tanggal
              </label>
              <input
                id="absensi-tanggal"
                type="date"
                className={ui.input}
                value={form.tanggal}
                onChange={(event) =>
                  setForm({ ...form, tanggal: event.target.value })
                }
                required
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="absensi-status">
                Status
              </label>
              <select
                id="absensi-status"
                className={ui.select}
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="absensi-masuk">
                Jam Masuk
              </label>
              <input
                id="absensi-masuk"
                type="time"
                className={ui.input}
                value={form.jam_masuk.slice(0, 5)}
                onChange={(event) =>
                  setForm({ ...form, jam_masuk: event.target.value })
                }
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="absensi-pulang">
                Jam Pulang
              </label>
              <input
                id="absensi-pulang"
                type="time"
                className={ui.input}
                value={form.jam_pulang.slice(0, 5)}
                onChange={(event) =>
                  setForm({ ...form, jam_pulang: event.target.value })
                }
              />
            </div>

            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label className={ui.label} htmlFor="absensi-keterangan">
                Keterangan
              </label>
              <textarea
                id="absensi-keterangan"
                className={ui.textarea}
                value={form.keterangan}
                onChange={(event) =>
                  setForm({ ...form, keterangan: event.target.value })
                }
                placeholder="Alasan izin/sakit, catatan, dll (opsional)"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message="Hapus catatan absensi ini? Tindakan ini tidak bisa dibatalkan."
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  )
}
