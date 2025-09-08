import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { RideProvider } from '@/contexts/RideContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RideShare - Your Reliable Transportation Partner',
  description: 'Book rides instantly, drive and earn, or schedule trips in advance. Safe, reliable, and affordable transportation at your fingertips.',
  keywords: 'rideshare, taxi, transportation, ride booking, driver, passenger',
  authors: [{ name: 'RideShare Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'RideShare - Your Reliable Transportation Partner',
    description: 'Book rides instantly, drive and earn, or schedule trips in advance.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <RideProvider>
            {children}
            <Toaster position="top-center" richColors />
          </RideProvider>
        </AuthProvider>
      </body>
    </html>
  );
}