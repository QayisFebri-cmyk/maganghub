import styles from '@/styles/statcard.module.css'

interface StatCardProps {
  icon: string
  title: string
  value: string | number
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'success'
}

export default function StatCard({
  icon,
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.iconBox}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{title}</div>
      </div>
    </div>
  )
}
