import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SewaSetu - AI-Powered Civic Issue Reporting',
  description: 'Report civic issues with AI-powered triage and gamified karma system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-primary">
              🏛️ SewaSetu
            </a>
            <div className="flex gap-6">
              <a href="/report" className="hover:text-primary transition-colors">
                Report Issue
              </a>
              <a href="/heatmap" className="hover:text-primary transition-colors">
                Heatmap
              </a>
              <a href="/admin" className="hover:text-primary transition-colors">
                Admin
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
