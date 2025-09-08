import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OtakuCanvas - AI-Powered Manga Creator',
  description: 'Create your own manga and comics with AI-powered character generation and storytelling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Grammarly extension warnings
              if (typeof window !== 'undefined') {
                const originalConsoleWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('data-new-gr-c-s-check-loaded') || 
                      message.includes('data-gr-ext-installed') ||
                      message.includes('Extra attributes from the server')) {
                    return;
                  }
                  originalConsoleWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.className} bg-manga-white text-manga-black`}
        suppressHydrationWarning
      >
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#000',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
      </body>
    </html>
  )
}
