import ui from '@/styles/ui.module.css'

export type StatTone = 'blue' | 'purple' | 'green' | 'orange' | 'red'

const TONE_CLASS: Record<StatTone, string> = {
  blue: ui.statBlue,
  purple: ui.statPurple,
  green: ui.statGreen,
  orange: ui.statOrange,
  red: ui.statRed,
}

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  tone?: StatTone
}

export default function StatCard({
  icon,
  label,
  value,
  tone = 'blue',
}: StatCardProps) {
  return (
    <div className={`${ui.stat} ${TONE_CLASS[tone]}`}>
      <div className={ui.statIcon} aria-hidden="true">
        {icon}
      </div>
      <div className={ui.statBody}>
        <div className={ui.statValue}>{value}</div>
        <div className={ui.statLabel}>{label}</div>
      </div>
    </div>
  )
}
