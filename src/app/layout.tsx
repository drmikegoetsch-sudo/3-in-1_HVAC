import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import MobileHeader from '@/components/MobileHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '3N1 HVAC | Follow-Up Manager',
  description: 'Open loop tracking for 3N1 HVAC service follow-ups',
  openGraph: {
    title: '3N1 HVAC | Follow-Up Manager',
    description: 'Open loop tracking for 3N1 HVAC service follow-ups',
    siteName: '3N1 HVAC',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3N1 HVAC | Follow-Up Manager',
    description: 'Open loop tracking for 3N1 HVAC service follow-ups',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex h-screen overflow-hidden bg-[#f5f5f7]`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <MobileHeader />
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  )
}
