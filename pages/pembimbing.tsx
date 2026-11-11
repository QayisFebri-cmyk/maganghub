import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { type Column } from '@/components/ui/DataTable'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { divisiApi, pembimbingApi } from '@/lib/api'
import type { Divisi, Pembimbing } from '@/lib/types'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

type FormState = {
  nama: string
  nip: string
  email: string
  divisi_id: string
}

const emptyForm: FormState = { nama: '', nip: '', email: '', divisi_id: '' }

export default function PembimbingPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'

  const [rows, setRows] = useState<Pembimbing[]>([])
  const [divisiList, setDivisiList] = useState<Divisi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Pembimbing | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Pembimbing | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [pembimbingData, divisiData] = await Promise.all([
        pembimbingApi.list(),
        divisiApi.list(),
      ])
      setRows(pembimbingData)
      setDivisiList(divisiData)
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

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter((row) =>
      [row.nama, row.nip, row.email, divisiMap.get(row.divisi_id || 0)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
  }, [rows, search, divisiMap])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: Pembimbing) => {
    setEditing(row)
    setForm({
      nama: row.nama,
      nip: row.nip || '',
      email: row.email || '',
      divisi_id: row.divisi_id ? String(row.divisi_id) : '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.nama.trim()) {
      toast('Nama pembimbing wajib diisi', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nama: form.nama.trim(),
        nip: form.nip.trim() || null,
        email: form.email.trim() || null,
        divisi_id: form.divisi_id ? Number(form.divisi_id) : null,
      }

      if (editing) {
        await pembimbingApi.update(editing.id, payload)
        toast('Data pembimbing diperbarui')
      } else {
        await pembimbingApi.create(payload)
        toast('Pembimbing ditambahkan')
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
      await pembimbingApi.remove(deleting.id)
      toast('Pembimbing dihapus')
      setDeleting(null)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setRemoving(false)
    }
  }

  const columns: Column<Pembimbing>[] = [
    {
      key: 'nama',
      header: 'Nama',
      render: (row) => <span className={ui.tdStrong}>{row.nama}</span>,
    },
    {
      key: 'nip',
      header: 'NIP',
      width: '140px',
      render: (row) => row.nip || <span className={ui.textMuted}>—</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => row.email || <span className={ui.textMuted}>—</span>,
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
    ...(isAdmin
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            align: 'right' as const,
            width: '150px',
            render: (row: Pembimbing) => (
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
    <AppShell title="Pembimbing">
      <div className={page.page}>
        <PageHeader
          title="Data Pembimbing"
          subtitle="Kelola pembimbing magang beserta divisinya"
          actions={
            isAdmin ? (
              <button
                type="button"
                className={`${ui.btn} ${ui.btnPrimary}`}
                onClick={openCreate}
              >
                + Tambah Pembimbing
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
            placeholder="Cari nama, NIP, atau divisi..."
          />
          <div className={ui.toolbarSpacer} />
          <span className={ui.hint}>{filtered.length} pembimbing</span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          loading={loading}
          emptyIcon="🧑‍🏫"
          emptyTitle="Belum ada pembimbing"
          emptyDescription="Tambahkan data pembimbing untuk membimbing peserta magang."
        />
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Pembimbing' : 'Tambah Pembimbing'}
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
              form="pembimbing-form"
              className={`${ui.btn} ${ui.btnPrimary}`}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="pembimbing-form" onSubmit={handleSubmit}>
          <div className={ui.formGrid}>
            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label
                className={`${ui.label} ${ui.required}`}
                htmlFor="pembimbing-nama"
              >
                Nama Lengkap
              </label>
              <input
                id="pembimbing-nama"
                className={ui.input}
                value={form.nama}
                onChange={(event) =>
                  setForm({ ...form, nama: event.target.value })
                }
                placeholder="Nama pembimbing"
                autoFocus
                required
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="pembimbing-nip">
                NIP
              </label>
              <input
                id="pembimbing-nip"
                className={ui.input}
                value={form.nip}
                onChange={(event) =>
                  setForm({ ...form, nip: event.target.value })
                }
                placeholder="Nomor induk pegawai"
              />
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="pembimbing-email">
                Email
              </label>
              <input
                id="pembimbing-email"
                type="email"
                className={ui.input}
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="email@perusahaan.com"
              />
            </div>

            <div className={`${ui.field} ${ui.formGridFull}`}>
              <label className={ui.label} htmlFor="pembimbing-divisi">
                Divisi
              </label>
              <select
                id="pembimbing-divisi"
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
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Hapus pembimbing "${deleting?.nama || ''}"? Tindakan ini tidak bisa dibatalkan.`}
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  )
}
