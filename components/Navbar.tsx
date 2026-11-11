import styles from '@/styles/navbar.module.css'

interface NavbarProps {
  user: any
  onLogout: () => void
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>💼</span>
          <span>MagangHub</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.navBtn} title="Notifikasi">
          🔔
          <span className={styles.badge}></span>
        </button>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.name}>{user?.email}</div>
            <div className={styles.role}>
              {user?.role === 'admin'
                ? 'Administrator'
                : user?.role === 'pembimbing'
                ? 'Pembimbing'
                : 'Peserta'}
            </div>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={onLogout}>
          🚪
        </button>
      </div>
    </nav>
  )
}
