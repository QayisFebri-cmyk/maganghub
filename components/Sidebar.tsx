import styles from '@/styles/sidebar.module.css'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'peserta', icon: '👥', label: 'Peserta Magang' },
    { id: 'divisi', icon: '🏢', label: 'Divisi' },
    { id: 'pembimbing', icon: '👨‍🏫', label: 'Pembimbing' },
    { id: 'jurnal', icon: '📝', label: 'Jurnal Harian' },
    { id: 'absensi', icon: '📅', label: 'Absensi' },
    { id: 'laporan', icon: '📄', label: 'Laporan' },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.icon}>💼</span>
        <h2>MagangHub</h2>
      </div>

      <nav className={styles.menu}>
        <div className={styles.label}>Menu Utama</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.menuItem} ${
              activeTab === item.id ? styles.active : ''
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
