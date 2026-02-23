import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import DevRoleSwitcher from '@/components/DevRoleSwitcher'
import { ThemeProvider } from '@/components/ThemeProvider'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SewaSetu - AI-Powered Civic Issue Reporting',
  description: 'Report civic issues with AI-powered triage and gamified karma system',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SewaSetu'
  },
  icons: {
    icon: '/icons/icon-192x192.svg',
    apple: '/icons/icon-192x192.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={cn(poppins.className, 'flex h-screen overflow-hidden bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white transition-colors duration-300')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
            {/* Phone container: min-h 100dvh so bottom nav is never clipped */}
            <div className="w-full max-w-[390px] min-h-[100dvh] bg-white shadow-2xl relative shrink-0 mx-auto">
              {children}
            </div>
          </main>
          <DevRoleSwitcher />
        </ThemeProvider>
      </body>
    </html>
  )
}
