import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Reveal from '@/components/ui/Reveal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth-context'
import { pesertaApi } from '@/lib/api'
import { formatDate, initials, roleLabel } from '@/lib/format'
import page from '@/styles/page.module.css'
import ui from '@/styles/ui.module.css'

export default function ProfilPage() {
  const { user, setUser } = useAuth()
  const toast = useToast()

  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setNama(user.nama || '')
      setUsername(user.username || '')
    }
  }, [user])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!user) return

    if (!nama.trim()) {
      toast('Nama wajib diisi', 'error')
      return
    }

    if (password && password.length < 6) {
      toast('Password baru minimal 6 karakter', 'error')
      return
    }

    if (password && password !== confirm) {
      toast('Konfirmasi password tidak sama', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        nama: nama.trim(),
        username: username.trim() || null,
      }

      if (password) payload.password = password

      const updated = await pesertaApi.update(user.id, payload)

      setUser({ ...user, ...updated })
      setPassword('')
      setConfirm('')
      toast('Profil berhasil diperbarui')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan'
      toast(
        message.includes('duplicate')
          ? 'Username sudah dipakai'
          : message,
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title="Profil Saya">
      <div className={page.page}>
        <PageHeader
          title="Profil Saya"
          subtitle="Perbarui informasi akun dan password kamu"
        />

        <Reveal delay={40}>
          <div className={page.grid2}>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2 className={ui.cardTitle}>Informasi Akun</h2>
            </div>

            <div className={ui.cardBody}>
              <div className={ui.stack}>
                <div className={ui.inline} style={{ gap: 14 }}>
                  <span
                    className={ui.statIcon}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#04121b',
                      background: 'linear-gradient(135deg, #00d9ff, #7c6bff)',
                    }}
                  >
                    {initials(user?.nama, user?.email)}
                  </span>
                  <div>
                    <div className={ui.textStrong} style={{ fontSize: '1rem' }}>
                      {user?.nama || 'Belum diisi'}
                    </div>
                    <div className={ui.hint}>{user?.email}</div>
                  </div>
                </div>

                <hr className={ui.divider} />

                <div className={page.metaList}>
                  <div className={page.metaRow}>
                    <span className={page.metaKey}>Peran</span>
                    <span className={page.metaVal}>
                      <Badge
                        tone={
                          user?.role === 'admin'
                            ? 'info'
                            : user?.role === 'pembimbing'
                            ? 'warn'
                            : 'muted'
                        }
                      >
                        {roleLabel(user?.role)}
                      </Badge>
                    </span>
                  </div>
                  <div className={page.metaRow}>
                    <span className={page.metaKey}>Username</span>
                    <span className={page.metaVal}>
                      {user?.username || '—'}
                    </span>
                  </div>
                  <div className={page.metaRow}>
                    <span className={page.metaKey}>Terdaftar</span>
                    <span className={page.metaVal}>
                      {formatDate(user?.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2 className={ui.cardTitle}>Ubah Profil</h2>
            </div>

            <div className={ui.cardBody}>
              <form onSubmit={handleSubmit}>
                <div className={ui.stack}>
                  <div className={ui.field}>
                    <label
                      className={`${ui.label} ${ui.required}`}
                      htmlFor="profil-nama"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id="profil-nama"
                      className={ui.input}
                      value={nama}
                      onChange={(event) => setNama(event.target.value)}
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label} htmlFor="profil-username">
                      Username
                    </label>
                    <input
                      id="profil-username"
                      className={ui.input}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Username unik (opsional)"
                    />
                  </div>

                  <hr className={ui.divider} />

                  <div className={ui.field}>
                    <label className={ui.label} htmlFor="profil-password">
                      Password Baru
                    </label>
                    <input
                      id="profil-password"
                      type="password"
                      className={ui.input}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Kosongkan jika tidak diubah"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label} htmlFor="profil-confirm">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      id="profil-confirm"
                      type="password"
                      className={ui.input}
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      disabled={!password}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`${ui.btn} ${ui.btnPrimary} ${ui.btnBlock}`}
                    disabled={saving}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </section>
          </div>
        </Reveal>
      </div>
    </AppShell>
  )
}
