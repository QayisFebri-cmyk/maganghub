import type { ReactNode } from 'react'
import ui from '@/styles/ui.module.css'

export type Tone = 'success' | 'warn' | 'danger' | 'info' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  success: ui.toneSuccess,
  warn: ui.toneWarn,
  danger: ui.toneDanger,
  info: ui.toneInfo,
  muted: ui.toneMuted,
}

export default function Badge({
  tone = 'muted',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return <span className={`${ui.badge} ${TONE_CLASS[tone]}`}>{children}</span>
}
