import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CogitX Retail Agent',
  description: 'Multi-agent AI engagement engine powered by n8n + Groq + Airtable',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
