const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

/** Tanggal hari ini dalam format YYYY-MM-DD (zona waktu lokal) */
export function todayISO(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

/** "2026-11-11" -> "11 Nov 2026" */
export function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "2026-11-11" -> "Rabu, 11 Nov 2026" */
export function formatDateLong(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '-'
  return `${DAYS[d.getDay()]}, ${formatDate(iso)}`
}

/** "08:30:00" -> "08:30" */
export function formatTime(value?: string | null): string {
  if (!value) return '-'
  return value.slice(0, 5)
}

/** Jam sekarang dalam format HH:MM:SS */
export function nowTime(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Hitung durasi antara dua jam "HH:MM[:SS]" -> "3 jam 15 menit" */
export function durationBetween(
  masuk?: string | null,
  pulang?: string | null
): string | null {
  if (!masuk || !pulang) return null
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  let diff = toMin(pulang) - toMin(masuk)
  if (diff < 0) diff += 24 * 60
  const jam = Math.floor(diff / 60)
  const menit = diff % 60
  if (jam === 0) return `${menit} menit`
  if (menit === 0) return `${jam} jam`
  return `${jam} jam ${menit} menit`
}

/** Awal & akhir bulan berjalan (YYYY-MM-DD) */
export function currentMonthRange(): [string, string] {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const iso = (x: Date) => {
    const offset = x.getTimezoneOffset() * 60000
    return new Date(x.getTime() - offset).toISOString().slice(0, 10)
  }
  return [iso(start), iso(end)]
}

export function initials(name?: string | null, email?: string | null): string {
  const source = (name || email || 'U').trim()
  const parts = source.split(/[\s.@_]+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function roleLabel(role?: string | null): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'pembimbing':
      return 'Pembimbing'
    case 'user':
      return 'Peserta Magang'
    default:
      return 'Pengguna'
  }
}

export function statusLabel(status?: string | null): string {
  switch (status) {
    case 'menunggu':
      return 'Menunggu'
    case 'disetujui':
      return 'Disetujui'
    case 'ditolak':
      return 'Ditolak'
    case 'hadir':
      return 'Hadir'
    case 'izin':
      return 'Izin'
    case 'sakit':
      return 'Sakit'
    case 'alpha':
      return 'Alpha'
    default:
      return status || '-'
  }
}

export function statusTone(
  status?: string | null
): 'success' | 'warn' | 'danger' | 'muted' {
  switch (status) {
    case 'disetujui':
    case 'hadir':
      return 'success'
    case 'menunggu':
    case 'izin':
    case 'sakit':
      return 'warn'
    case 'ditolak':
    case 'alpha':
      return 'danger'
    default:
      return 'muted'
  }
}
