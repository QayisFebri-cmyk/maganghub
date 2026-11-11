import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { divisiApi, jurnalApi, pesertaApi } from '@/lib/api'
import {
  formatDate,
  statusLabel,
  statusTone,
  todayISO,
} from '@/lib/format'
import type { AktivitasRow, Divisi, Profile } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type FormState = {
  tanggal: string
  judul: string
  deskripsi: string
  divisi_id: string
  progress: string
}

const emptyForm = (divisiId?: number | null): FormState => ({
  tanggal: todayISO(),
  judul: '',
  deskripsi: '',
  divisi_id: divisiId ? String(divisiId) : '',
  progress: '0',
})

export default function JurnalPage() {
  const { user } = useAuth()
  const toast = useToast()

  const isPeserta = user?.role === 'user'
  const canReview = user?.role === 'admin' || user?.role === 'pembimbing'

  const [rows, setRows] = useState<AktivitasRow[]>([])
  const [divisiList, setDivisiList] = useState<Divisi[]>([])
  const [pesertaList, setPesertaList] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AktivitasRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<AktivitasRow | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const [jurnalData, divisiData, pesertaData] = await Promise.all([
        isPeserta ? jurnalApi.listByUser(user.id) : jurnalApi.list(),
        divisiApi.list(),
        canReview ? pesertaApi.list() : Promise.resolve([] as Profile[]),
      ])

      setRows(jurnalData)
      setDivisiList(divisiData)
      setPesertaList(pesertaData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat jurnal')
    } finally {
      setLoading(false)
    }
  }, [user, isPeserta, canReview])

  useEffect(() => {
    load()
  }, [load])

  const divisiMap = useMemo(() => {
    const map = new Map<number, string>()
    divisiList.forEach((item) => map.set(item.id, item.nama))
    return map
  }, [divisiList])

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
      return [
        row.judul,
        row.deskripsi,
        row.users?.nama,
        row.users?.email,
        divisiMap.get(row.divisi_id || 0),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [rows, search, statusFilter, divisiMap])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm(user?.divisi_id))
    setModalOpen(true)
  }

  const openEdit = (row: AktivitasRow) => {
    setEditing(row)
    setForm({
      tanggal: row.tanggal,
      judul: row.judul || '',
      deskripsi: row.deskripsi || '',
      divisi_id: row.divisi_id ? String(row.divisi_id) : '',
      progress: String(row.progress ?? 0),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.judul.trim()) {
      toast('Judul kegiatan wajib diisi', 'error')
      return
    }

    if (!form.tanggal) {
      toast('Tanggal wajib diisi', 'error')
      return
    }

    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0))

    setSaving(true)
    try {
      const payload = {
        tanggal: form.tanggal,
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim() || null,
        divisi_id: form.divisi_id ? Number(form.divisi_id) : null,
        progress,
      }

      if (editing) {
        await jurnalApi.update(editing.id, payload)
        toast('Jurnal diperbarui')
      } else {
        await jurnalApi.create({
          ...payload,
          user_id: user!.id,
          status: 'menunggu',
        })
        toast('Jurnal berhasil ditambahkan')
      }

      setModalOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (row: AktivitasRow, status: string) => {
    try {
      await jurnalApi.setStatus(row.id, status)
      toast(
        status === 'disetujui' ? 'Jurnal disetujui' : 'Jurnal ditolak',
        status === 'disetujui' ? 'success' : 'info'
      )
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal mengubah status', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    try {
      await jurnalApi.remove(deleting.id)
      toast('Jurnal dihapus')
      setDeleting(null)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setRemoving(false)
    }
  }

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
        <div>
          <div className={ui.tdStrong}>
            {row.users?.nama || pesertaMap.get(row.user_id) || '—'}
          </div>
          <div className={ui.hint}>
            {divisiMap.get(row.divisi_id || 0) || 'Tanpa divisi'}
          </div>
        </div>
      ),
    },
    {
      key: 'judul',
      header: 'Kegiatan',
      render: (row) => (
        <div>
          <div>{row.judul}</div>
          {row.deskripsi ? (
            <div className={ui.hint}>{row.deskripsi}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      width: '150px',
      render: (row) => (
        <div className={ui.progressText}>
          <div className={ui.progress}>
            <div
              className={ui.progressFill}
              style={{ width: `${Math.min(100, row.progress || 0)}%` }}
            />
          </div>
          <span className={ui.progressValue}>{row.progress || 0}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      align: 'right',
      width: '210px',
      render: (row) => {
        const mine = row.user_id === user?.id
        return (
          <div className={ui.rowActions}>
            {canReview && row.status === 'menunggu' ? (
              <>
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnSuccess} ${ui.btnSm}`}
                  onClick={() => handleStatus(row, 'disetujui')}
                >
                  Setujui
                </button>
                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnDanger} ${ui.btnSm}`}
                  onClick={() => handleStatus(row, 'ditolak')}
                >
                  Tolak
                </button>
              </>
            ) : null}

            {(isPeserta && mine) || user?.role === 'admin' ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                onClick={() => openEdit(row)}
              >
                Ubah
              </button>
            ) : null}

            {user?.role === 'admin' || (isPeserta && mine) ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnDanger} ${ui.btnSm}`}
                onClick={() => setDeleting(row)}
              >
                Hapus
              </button>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <AppShell title="Jurnal Harian">
      <div className={page.page}>
        <PageHeader
          title="Jurnal Harian"
          subtitle={
            isPeserta
              ? 'Catat kegiatan magang harian kamu'
              : 'Pantau dan setujui jurnal peserta magang'
          }
          actions={
            isPeserta ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnPrimary}`}
                onClick={openCreate}
              >
                + Tulis Jurnal
              </button>
            ) : null
          }
        />

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
            placeholder="Cari kegiatan atau peserta..."
          />

          <select
            className={ui.select}
            style={{ maxWidth: 180 }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter status"
          >
            <option value="all">Semua status</option>
            <option value="menunggu">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <div className={ui.toolbarSpacer} />
          <span className={ui.hint}>{filtered.length} jurnal</span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          loading={loading}
          emptyIcon="📝"
          emptyTitle="Belum ada jurnal"
          emptyDescription={
            isPeserta
              ? 'Klik "Tulis Jurnal" untuk mencatat kegiatan magang kamu hari ini.'
              : 'Jurnal peserta magang akan muncul di sini.'
          }
        />
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Jurnal' : 'Tulis Jurnal'}
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
              form="jurnal-form"
              className={`${ui.btn} ${ui.btnPrimary}`}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="jurnal-form" onSubmit={handleSubmit}>
          <div className={ui.formGrid}>
            <div className={ui.field}>
              <label
                className={`${ui.label} ${ui.required}`}
                htmlFor="jurnal-tanggal"
              >
                Tanggal
              </label>
              <input
                id="jurnal-tanggal"
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
              <label className={ui.label} htmlFor="jurnal-divisi">
                Divisi
              </label>
              <select
                id="jurnal-divisi"
                className={ui.select}
                value={form.divisi_id}
                onChange={(event) =>
                  setForm({ ...form, divisi_id: event.target.value })
                }
              >
                <option value="">— Tanpa divisi —</option>
                {divisiList.map((divisi) => (
                  <option key={divisi.id} value={divisi.id}>
                    {divisi.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label
                className={`${ui.label} ${ui.required}`}
                htmlFor="jurnal-judul"
              >
                Judul Kegiatan
              </label>
              <input
                id="jurnal-judul"
                className={ui.input}
                value={form.judul}
                onChange={(event) =>
                  setForm({ ...form, judul: event.target.value })
                }
                placeholder="Contoh: Membuat halaman login"
                autoFocus
                required
              />
            </div>

            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label className={ui.label} htmlFor="jurnal-deskripsi">
                Deskripsi
              </label>
              <textarea
                id="jurnal-deskripsi"
                className={ui.textarea}
                value={form.deskripsi}
                onChange={(event) =>
                  setForm({ ...form, deskripsi: event.target.value })
                }
                placeholder="Uraikan kegiatan yang dilakukan (opsional)"
              />
            </div>

            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label className={ui.label} htmlFor="jurnal-progress">
                Progress: {form.progress}%
              </label>
              <input
                id="jurnal-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(event) =>
                  setForm({ ...form, progress: event.target.value })
                }
                style={{ width: '100%', accentColor: '#00d9ff' }}
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Hapus jurnal "${deleting?.judul || ''}"? Tindakan ini tidak bisa dibatalkan.`}
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  )
}
