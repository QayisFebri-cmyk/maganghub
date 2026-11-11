import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { divisiApi, pembimbingApi, pesertaApi } from '@/lib/api'
import { formatDate, roleLabel } from '@/lib/format'
import type { Divisi, Pembimbing, Profile } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type FormState = {
  nama: string
  email: string
  username: string
  password: string
  role: string
  divisi_id: string
  pembimbing_id: string
}

const emptyForm: FormState = {
  nama: '',
  email: '',
  username: '',
  password: '',
  role: 'user',
  divisi_id: '',
  pembimbing_id: '',
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Peserta Magang' },
  { value: 'pembimbing', label: 'Pembimbing' },
  { value: 'admin', label: 'Administrator' },
]

export default function PesertaPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'

  const [rows, setRows] = useState<Profile[]>([])
  const [divisiList, setDivisiList] = useState<Divisi[]>([])
  const [pembimbingList, setPembimbingList] = useState<Pembimbing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Profile | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [userData, divisiData, pembimbingData] = await Promise.all([
        pesertaApi.list(),
        divisiApi.list(),
        pembimbingApi.list(),
      ])
      setRows(userData)
      setDivisiList(divisiData)
      setPembimbingList(pembimbingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
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

  const pembimbingMap = useMemo(() => {
    const map = new Map<number, string>()
    pembimbingList.forEach((item) => map.set(item.id, item.nama))
    return map
  }, [pembimbingList])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (roleFilter !== 'all' && row.role !== roleFilter) return false
      if (!keyword) return true
      return [
        row.nama,
        row.email,
        row.username,
        divisiMap.get(row.divisi_id || 0),
        pembimbingMap.get(row.pembimbing_id || 0),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [rows, search, roleFilter, divisiMap, pembimbingMap])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: Profile) => {
    setEditing(row)
    setForm({
      nama: row.nama || '',
      email: row.email,
      username: row.username || '',
      password: '',
      role: row.role || 'user',
      divisi_id: row.divisi_id ? String(row.divisi_id) : '',
      pembimbing_id: row.pembimbing_id ? String(row.pembimbing_id) : '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.nama.trim() || !form.email.trim()) {
      toast('Nama dan email wajib diisi', 'error')
      return
    }

    if (!editing && form.password.trim().length < 6) {
      toast('Password minimal 6 karakter', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        nama: form.nama.trim(),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim() || null,
        role: form.role,
        divisi_id: form.divisi_id ? Number(form.divisi_id) : null,
        pembimbing_id: form.pembimbing_id ? Number(form.pembimbing_id) : null,
      }

      if (form.password.trim()) {
        payload.password = form.password.trim()
      }

      if (editing) {
        await pesertaApi.update(editing.id, payload)
        toast('Data peserta diperbarui')
      } else {
        await pesertaApi.create(payload)
        toast('Peserta berhasil ditambahkan')
      }

      setModalOpen(false)
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan'
      toast(
        message.includes('duplicate')
          ? 'Email atau username sudah dipakai'
          : message,
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    try {
      await pesertaApi.remove(deleting.id)
      toast('Data peserta dihapus')
      setDeleting(null)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setRemoving(false)
    }
  }

  const columns: Column<Profile>[] = [
    {
      key: 'nama',
      header: 'Nama',
      render: (row) => (
        <div>
          <div className={ui.tdStrong}>{row.nama || '—'}</div>
          <div className={ui.hint}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'divisi',
      header: 'Divisi',
      render: (row) =>
        row.divisi_id ? (
          divisiMap.get(row.divisi_id) || '-'
        ) : (
          <span className={ui.textMuted}>—</span>
        ),
    },
    {
      key: 'pembimbing',
      header: 'Pembimbing',
      render: (row) =>
        row.pembimbing_id ? (
          pembimbingMap.get(row.pembimbing_id) || '-'
        ) : (
          <span className={ui.textMuted}>—</span>
        ),
    },
    {
      key: 'role',
      header: 'Peran',
      width: '150px',
      render: (row) => (
        <Badge
          tone={
            row.role === 'admin'
              ? 'info'
              : row.role === 'pembimbing'
              ? 'warn'
              : 'muted'
          }
        >
          {roleLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Dibuat',
      width: '120px',
      render: (row) => (
        <span className={ui.mono}>{formatDate(row.created_at)}</span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            align: 'right' as const,
            width: '150px',
            render: (row: Profile) => (
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
                  disabled={row.id === user?.id}
                  title={
                    row.id === user?.id
                      ? 'Tidak bisa menghapus akun sendiri'
                      : 'Hapus'
                  }
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
    <AppShell title="Peserta Magang">
      <div className={page.page}>
        <PageHeader
          title="Peserta Magang"
          subtitle="Kelola akun peserta, divisi, dan pembimbingnya"
          actions={
            isAdmin ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnPrimary}`}
                onClick={openCreate}
              >
                + Tambah Peserta
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
            placeholder="Cari nama, email, atau divisi..."
          />

          <select
            className={ui.select}
            style={{ maxWidth: 190 }}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter peran"
          >
            <option value="all">Semua peran</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className={ui.toolbarSpacer} />
          <span className={ui.hint}>{filtered.length} akun</span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          loading={loading}
          emptyIcon="👥"
          emptyTitle="Belum ada peserta"
          emptyDescription="Tambahkan akun peserta magang untuk mulai mencatat jurnal dan absensi."
        />
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Data Peserta' : 'Tambah Peserta'}
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
              form="peserta-form"
              className={`${ui.btn} ${ui.btnPrimary}`}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="peserta-form" onSubmit={handleSubmit}>
          <div className={ui.formGrid}>
            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label className={`${ui.label} ${ui.required}`} htmlFor="peserta-nama">
                Nama Lengkap
              </label>
              <input
                id="peserta-nama"
                className={ui.input}
                value={form.nama}
                onChange={(event) =>
                  setForm({ ...form, nama: event.target.value })
                }
                placeholder="Nama lengkap peserta"
                autoFocus
                required
              />
            </div>

            <div className={ui.field}>
              <label
                className={`${ui.label} ${ui.required}`}
                htmlFor="peserta-email"
              >
                Email
              </label>
              <input
                id="peserta-email"
                type="email"
                className={ui.input}
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="nama@maganghub.com"
                required
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="peserta-username">
                Username
              </label>
              <input
                id="peserta-username"
                className={ui.input}
                value={form.username}
                onChange={(event) =>
                  setForm({ ...form, username: event.target.value })
                }
                placeholder="username unik (opsional)"
              />
            </div>

            <div className={ui.field}>
              <label
                className={`${ui.label} ${editing ? '' : ui.required}`}
                htmlFor="peserta-password"
              >
                Password
              </label>
              <input
                id="peserta-password"
                type="password"
                className={ui.input}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                autoComplete="new-password"
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="peserta-role">
                Peran
              </label>
              <select
                id="peserta-role"
                className={ui.select}
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="peserta-divisi">
                Divisi
              </label>
              <select
                id="peserta-divisi"
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

            <div className={ui.field}>
              <label className={ui.label} htmlFor="peserta-pembimbing">
                Pembimbing
              </label>
              <select
                id="peserta-pembimbing"
                className={ui.select}
                value={form.pembimbing_id}
                onChange={(event) =>
                  setForm({ ...form, pembimbing_id: event.target.value })
                }
              >
                <option value="">— Tanpa pembimbing —</option>
                {pembimbingList.map((pembimbing) => (
                  <option key={pembimbing.id} value={pembimbing.id}>
                    {pembimbing.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Hapus akun "${deleting?.nama || deleting?.email || ''}"? Semua jurnal dan absensi miliknya juga akan terhapus.`}
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  )
}
