import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Jeda animasi dalam milidetik (untuk efek stagger). */
  delay?: number
  className?: string
}

/**
 * Reveal saat elemen masuk viewport.
 *
 * Prinsip aman:
 *  - Konten selalu dirender terlihat di server (tidak ada layout shift / konten hilang).
 *  - Animasi hanya diaktifkan bila IntersectionObserver tersedia.
 *  - Ada jaring pengaman: konten dipaksa tampil setelah beberapa saat.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hidden, setHidden] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    setHidden(true)

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(element)

    // Jaring pengaman agar konten tidak pernah tertahan tersembunyi.
    const fallback = window.setTimeout(() => setVisible(true), 2200)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  const stateClass = hidden && !visible ? 'revealHidden' : visible ? 'revealVisible' : ''

  return (
    <div
      ref={ref}
      className={['reveal', stateClass, className].filter(Boolean).join(' ')}
      style={visible && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
