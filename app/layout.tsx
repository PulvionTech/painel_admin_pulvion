import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import PwaRegistration from '@/components/PwaRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PulviOn Admin',
  description: 'Painel administrativo PulviOn',
  applicationName: 'PulviOn Admin',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/logos/favicon.ico' },
      { url: '/logos/pulvion-symbol-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logos/pulvion-symbol-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/logos/pulvion-symbol-192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PulviOn',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E5162',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
