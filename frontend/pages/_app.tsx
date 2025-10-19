import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ConvexProviderRoot } from '../lib/convex/client';
import { ThemeProvider, useTheme } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = require('react').useState(false);
    require('react').useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed right-4 bottom-4 z-50 px-3 py-2 rounded-md text-xs border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur hover:bg-white dark:hover:bg-zinc-800 transition"
        title="Toggle theme"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    );
  }

  return (
    <ConvexProviderRoot>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen">
          <ThemeToggle />
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </ConvexProviderRoot>
  );
}


