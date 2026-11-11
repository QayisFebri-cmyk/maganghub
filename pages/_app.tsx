import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/ui/Toast'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="MagangHub — Sistem Informasi Manajemen Magang"
          />
          <meta name="theme-color" content="#070d1b" />
        </Head>
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
  )
}
