import { useEffect, type ReactNode } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth-context'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import layout from '@/styles/layout.module.css'

interface AppShellProps {
  title: string
  children: ReactNode
}

export default function AppShell({ title, children }: AppShellProps) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <>
        <Head>
          <title>{title} — MagangHub</title>
        </Head>
        <div className={layout.loader}>
          <div className={layout.spinner} />
          <span>Memuat data...</span>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{title} — MagangHub</title>
      </Head>

      <div className={layout.shell}>
        <Navbar user={user} onLogout={logout} />
        <Sidebar role={user.role} />
        <main className={layout.main}>
          <div className={layout.content}>{children}</div>
        </main>
      </div>
    </>
  )
}
