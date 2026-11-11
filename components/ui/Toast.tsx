import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import ui from '@/styles/ui.module.css'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type PushToast = (message: string, type?: ToastType) => void

const ToastContext = createContext<PushToast>(() => {})

const ICON: Record<ToastType, string> = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
}

const TYPE_CLASS: Record<ToastType, string> = {
  success: ui.toastSuccess,
  error: ui.toastError,
  info: ui.toastInfo,
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback<PushToast>((message, type = 'success') => {
    counter += 1
    const id = counter

    setItems((current) => [...current, { id, message, type }])

    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id))
    }, 3400)
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={ui.toastWrap} aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            className={`${ui.toast} ${TYPE_CLASS[item.type]}`}
            role="status"
          >
            <span aria-hidden="true">{ICON[item.type]}</span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
