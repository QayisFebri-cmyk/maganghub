import Link from 'next/link'
import { useRouter } from 'next/router'
import layout from '@/styles/layout.module.css'

type MenuItem = {
  href: string
  label: string
  icon: string
  roles: string[]
}

type MenuGroup = {
  title: string
  items: MenuItem[]
}

const GROUPS: MenuGroup[] = [
  {
    title: 'Menu Utama',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: '📊',
        roles: ['admin', 'pembimbing', 'user'],
      },
      {
        href: '/peserta',
        label: 'Peserta Magang',
        icon: '👥',
        roles: ['admin', 'pembimbing'],
      },
      { href: '/divisi', label: 'Divisi', icon: '🏢', roles: ['admin'] },
      {
        href: '/pembimbing',
        label: 'Pembimbing',
        icon: '🧑‍🏫',
        roles: ['admin'],
      },
      {
        href: '/jurnal',
        label: 'Jurnal Harian',
        icon: '📝',
        roles: ['admin', 'pembimbing', 'user'],
      },
      {
        href: '/absensi',
        label: 'Absensi',
        icon: '📅',
        roles: ['admin', 'pembimbing', 'user'],
      },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      {
        href: '/laporan',
        label: 'Laporan',
        icon: '📄',
        roles: ['admin', 'pembimbing'],
      },
      {
        href: '/profil',
        label: 'Profil Saya',
        icon: '👤',
        roles: ['admin', 'pembimbing', 'user'],
      },
    ],
  },
]

export default function Sidebar({ role }: { role?: string | null }) {
  const router = useRouter()
  const currentRole = role || 'user'

  return (
    <aside className={layout.sidebar} aria-label="Navigasi utama">
      {GROUPS.map((group) => {
        const items = group.items.filter((item) =>
          item.roles.includes(currentRole)
        )
        if (items.length === 0) return null

        return (
          <div key={group.title} className={layout.sideGroup}>
            <div className={layout.sideLabel}>{group.title}</div>

            {items.map((item) => {
              const active = router.pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${layout.sideItem} ${
                    active ? layout.sideItemActive : ''
                  }`}
                  title={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={layout.sideIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={layout.sideText}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )
      })}

      <div className={layout.sideFoot}>
        MagangHub v1.0
        <br />
        Next.js + Supabase
      </div>
    </aside>
  )
}
