import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'CogitX Retail Agent',
  description: 'Multi-agent AI engagement engine powered by n8n + Groq + Airtable',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DL6EZZQ9RN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DL6EZZQ9RN');
          `}
        </Script>
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
