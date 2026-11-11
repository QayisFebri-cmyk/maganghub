import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter, Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/ui/Toast'
import Background from '@/components/layout/Background'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`appRoot ${inter.variable} ${spaceGrotesk.variable}`}
    >
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

          <a href="#konten" className="skipLink">
            Lewati ke konten
          </a>

          <Background />

          <Component {...pageProps} />
        </ToastProvider>
      </AuthProvider>
    </div>
  )
}
