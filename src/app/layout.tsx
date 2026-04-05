import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Awas — India\'s Smartest Real Estate Search',
  description:
    'Search across 99acres, MagicBricks, and Housing.com simultaneously. Find your dream home with natural language search.',
  keywords: [
    'real estate',
    'property search',
    'India',
    '99acres',
    'MagicBricks',
    'Housing.com',
    'flat',
    'apartment',
    'buy property',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dim" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
