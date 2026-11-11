import Link from 'next/link'
import { initials, roleLabel } from '@/lib/format'
import type { Profile } from '@/lib/types'
import layout from '@/styles/layout.module.css'

interface NavbarProps {
  user: Profile
  onLogout: () => void
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className={layout.navbar}>
      <div className={layout.navLeft}>
        <Link href="/dashboard" className={layout.brand}>
          <span className={layout.brandMark} aria-hidden="true">
            💼
          </span>
          <span className={layout.brandName}>MagangHub</span>
        </Link>
      </div>

      <div className={layout.navRight}>
        <div className={layout.userBox}>
          <span className={layout.avatar} aria-hidden="true">
            {initials(user.nama, user.email)}
          </span>
          <span className={layout.userMeta}>
            <span className={layout.userName}>
              {user.nama || user.email}
            </span>
            <span className={layout.userRole}>{roleLabel(user.role)}</span>
          </span>
        </div>

        <button
          type="button"
          className={`${layout.iconBtn} ${layout.iconBtnDanger}`}
          onClick={onLogout}
          title="Keluar"
          aria-label="Keluar"
        >
          🚪
        </button>
      </div>
    </header>
  )
}
