import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReddiToks - Turn Reddit Threads into Viral AI Videos',
  description: 'Transform Reddit discussions into engaging short-form videos with AI voices and captions. Create viral content from threads in minutes.',
  keywords: 'Reddit, AI videos, TikTok, shorts, viral content, meme videos',
  authors: [{ name: 'ReddiToks' }],
  openGraph: {
    title: 'ReddiToks - Turn Reddit Threads into Viral AI Videos',
    description: 'Transform Reddit discussions into engaging short-form videos with AI voices and captions.',
    type: 'website',
    url: 'https://redditoks.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReddiToks - Turn Reddit Threads into Viral AI Videos',
    description: 'Transform Reddit discussions into engaging short-form videos with AI voices and captions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#f9fafb',
            },
          }}
        />
      </body>
    </html>
  );
}