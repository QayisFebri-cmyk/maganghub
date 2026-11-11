import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { divisiApi } from '@/lib/api'
import type { Divisi } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type FormState = { nama: string; deskripsi: string }

const emptyForm: FormState = { nama: '', deskripsi: '' }

export default function DivisiPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'

  const [rows, setRows] = useState<Divisi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Divisi | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Divisi | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await divisiApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat divisi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter(
      (row) =>
        row.nama.toLowerCase().includes(keyword) ||
        (row.deskripsi || '').toLowerCase().includes(keyword)
    )
  }, [rows, search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: Divisi) => {
    setEditing(row)
    setForm({ nama: row.nama, deskripsi: row.deskripsi || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.nama.trim()) {
      toast('Nama divisi wajib diisi', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim() || null,
      }

      if (editing) {
        await divisiApi.update(editing.id, payload)
        toast('Divisi berhasil diperbarui')
      } else {
        await divisiApi.create(payload)
        toast('Divisi berhasil ditambahkan')
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
      await divisiApi.remove(deleting.id)
      toast('Divisi dihapus')
      setDeleting(null)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setRemoving(false)
    }
  }

  const columns: Column<Divisi>[] = [
    {
      key: 'nama',
      header: 'Nama Divisi',
      render: (row) => <span className={ui.tdStrong}>{row.nama}</span>,
    },
    {
      key: 'deskripsi',
      header: 'Deskripsi',
      render: (row) => row.deskripsi || <span className={ui.textMuted}>—</span>,
    },
    ...(isAdmin
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            align: 'right' as const,
            width: '150px',
            render: (row: Divisi) => (
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
    <AppShell title="Divisi">
      <div className={page.page}>
        <PageHeader
          title="Data Divisi"
          subtitle="Kelola divisi tempat peserta magang ditempatkan"
          actions={
            isAdmin ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnPrimary}`}
                onClick={openCreate}
              >
                + Tambah Divisi
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
            placeholder="Cari divisi..."
          />
          <div className={ui.toolbarSpacer} />
          <span className={ui.hint}>{filtered.length} divisi</span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          loading={loading}
          emptyIcon="🏢"
          emptyTitle="Belum ada divisi"
          emptyDescription="Tambahkan divisi pertama untuk mulai menempatkan peserta magang."
        />
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Divisi' : 'Tambah Divisi'}
        onClose={() => setModalOpen(false)}
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
              form="divisi-form"
              className={`${ui.btn} ${ui.btnPrimary}`}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="divisi-form" onSubmit={handleSubmit}>
          <div className={ui.stack}>
            <div className={ui.field}>
              <label className={`${ui.label} ${ui.required}`} htmlFor="divisi-nama">
                Nama Divisi
              </label>
              <input
                id="divisi-nama"
                className={ui.input}
                value={form.nama}
                onChange={(event) =>
                  setForm({ ...form, nama: event.target.value })
                }
                placeholder="Contoh: Web Development"
                autoFocus
                required
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="divisi-deskripsi">
                Deskripsi
              </label>
              <textarea
                id="divisi-deskripsi"
                className={ui.textarea}
                value={form.deskripsi}
                onChange={(event) =>
                  setForm({ ...form, deskripsi: event.target.value })
                }
                placeholder="Deskripsi singkat divisi (opsional)"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Hapus divisi "${deleting?.nama || ''}"? Tindakan ini tidak bisa dibatalkan.`}
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  )
}
