import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/theme-provider';
import { SWRProvider } from '@/components/providers/swr-provider';

export const metadata: Metadata = {
  title: 'AICBOLT',
  description: 'AI-powered business automation platform.'
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23f59e0b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M13 2L3 14h9l-1 8 10-12h-9l1-8z%22/></svg>" />
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


