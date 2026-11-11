import { useEffect, type ReactNode } from 'react'
import ui from '@/styles/ui.module.css'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={ui.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={`${ui.modal} ${size === 'lg' ? ui.modalLg : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={ui.modalHead}>
          <h3 className={ui.modalTitle}>{title}</h3>
          <button
            type="button"
            className={ui.modalClose}
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className={ui.modalBody}>{children}</div>

        {footer ? <div className={ui.modalFoot}>{footer}</div> : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

interface ConfirmProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = 'Konfirmasi Hapus',
  message,
  confirmLabel = 'Hapus',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            className={`${ui.btn} ${ui.btnGhost}`}
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="button"
            className={`${ui.btn} ${ui.btnDanger}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)' }}>{message}</p>
    </Modal>
  )
}
