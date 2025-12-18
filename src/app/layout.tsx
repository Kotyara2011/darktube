import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/Layout/Navigation';
import { Sidebar } from '@/components/Layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DarkTube - Dive Deeper',
  description: 'A high-performance, creator-centric video-sharing platform with a sleek, dark interface that reduces eye strain and emphasizes content discovery beyond simple engagement metrics.',
  keywords: 'video sharing, dark theme, creator platform, streaming, content discovery',
  authors: [{ name: 'DarkTube Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#FF6600',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'DarkTube - Dive Deeper',
    description: 'A high-performance, creator-centric video-sharing platform',
    url: 'https://darktube.com',
    siteName: 'DarkTube',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DarkTube Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DarkTube - Dive Deeper',
    description: 'A high-performance, creator-centric video-sharing platform',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dt-black text-dt-white min-h-screen`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Top Navigation */}
            <Navigation />
            
            <div className="flex flex-1">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Main Content */}
              <main className="flex-1 min-h-0">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}