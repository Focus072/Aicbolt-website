import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/theme-provider';
import { SWRProvider } from '@/components/providers/swr-provider';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js and Postgres.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-gray-950 text-white dark ${manrope.className}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Always force dark mode
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-gray-950">
        <ThemeProvider>
          <SWRProvider>
            {children}
            <Toaster richColors position="top-center" />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
