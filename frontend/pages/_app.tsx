import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ConvexProviderRoot } from '../lib/convex/client';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider, useTheme } from 'next-themes';
import { Inter, Space_Grotesk } from 'next/font/google';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export default function App({ Component, pageProps }: AppProps) {
  function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = require('react').useState(false);
    require('react').useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed right-4 bottom-4 z-50 w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur hover:bg-white dark:hover:bg-zinc-800 transition flex items-center justify-center"
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-zinc-700 dark:text-zinc-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {theme === 'dark' ? (
            <g>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </g>
          ) : (
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          )}
        </svg>
      </button>
    );
  }

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  const isValidPk = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);
  const AppShell = (
    <ConvexProviderRoot>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className={`${inter.variable} ${grotesk.variable} min-h-screen font-sans`}>
          <Head>
            <title>Karate AI – Design Studio</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="Karate AI – Design Studio. Create advanced visual workflows with models and tools in one node-based studio." />
            <meta property="og:title" content="Karate AI – Design Studio" />
            <meta property="og:description" content="Create advanced visual workflows with models and tools in one node-based studio." />
            <meta property="og:type" content="website" />
          </Head>
          <ThemeToggle />
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </ConvexProviderRoot>
  );
  if (!isValidPk) {
    if (typeof console !== 'undefined') console.warn('Clerk publishable key missing/invalid; running without auth. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.');
    return AppShell;
  }
  return (
    <ClerkProvider publishableKey={pk}>
      {AppShell}
    </ClerkProvider>
  );
}


