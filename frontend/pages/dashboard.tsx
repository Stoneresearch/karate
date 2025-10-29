import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

type LocalWorkflow = {
  id: string;
  title: string;
  createdAt: string;
  nodes: number;
  thumbnail: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);
  const [workflows, setWorkflows] = useState<LocalWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const saved = localStorage.getItem('workflows');
    if (saved) {
      const parsed = JSON.parse(saved) as LocalWorkflow[];
      setWorkflows(parsed);
    }
  };

  const persist = (items: LocalWorkflow[]) => {
    setWorkflows(items);
    localStorage.setItem('workflows', JSON.stringify(items));
  };

  const createNewWorkflow = async (templateName?: string) => {
    setLoading(true);
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      title: templateName || 'Untitled Workflow',
      createdAt: new Date().toLocaleDateString(),
      nodes: 0,
      thumbnail: null,
    };
    const updated = [newWorkflow, ...workflows];
    persist(updated);

    setTimeout(() => {
      router.push(`/editor?id=${newWorkflow.id}`);
      setLoading(false);
    }, 300);
  };

  const openWorkflow = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const deleteWorkflow = (id: string) => {
    const updated = workflows.filter((w) => w.id !== id);
    persist(updated);
  };

  const clearAll = () => {
    persist([]);
  };

  const templates = [
    { name: 'Image Generation', icon: '🎨', desc: 'Generate images with AI' },
    { name: 'Image Editing', icon: '✏️', desc: 'Edit and enhance images' },
    { name: 'Image to Video', icon: '🎬', desc: 'Convert images to videos' },
    { name: 'Upscaling', icon: '📈', desc: 'Upscale images with AI' },
    { name: 'Batch Processing', icon: '⚙️', desc: 'Process multiple files' },
    { name: 'Multi-Model', icon: '🔀', desc: 'Combine multiple models' },
  ];

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight">
            KARATE
          </Link>
          <div className="flex items-center gap-2">
            {CLERK_ENABLED ? (
              <>
                <SignedOut>
                  <Link href="/sign-in" className="text-xs px-3 py-1.5 hidden md:inline-block">
                    Sign in
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
                </SignedIn>
              </>
            ) : null}
            {workflows.length > 0 && (
              <button
                onClick={clearAll}
                className="btn-secondary text-xs px-3 py-1.5"
                title="Clear all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => createNewWorkflow('Untitled Project')}
              disabled={loading}
              className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'New Project'}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="hero-ambient rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h1 className="text-heading-xl mb-2">Your Studio</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a new project or pick up where you left off. Everything is editable.</p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => createNewWorkflow('Untitled Project')} disabled={loading} className="btn-primary">
                {loading ? 'Creating…' : 'New Project'}
              </button>
              <Link href="/docs" className="btn-secondary">Read Docs</Link>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">My Workflows</h2>
              {workflows.length > 0 && (
                <span className="text-xs text-zinc-500">{workflows.length} total</span>
              )}
            </div>
            {workflows.length === 0 ? (
              <div className="card-glass glow-border rounded-2xl p-6 text-center">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">No workflows yet. Click “New Project” to create one.</div>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence>
                  {workflows.map((workflow) => (
                    <motion.li
                      key={workflow.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group card-glass glow-border rounded-xl overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <button
                            onClick={() => openWorkflow(workflow.id)}
                            className="text-sm font-medium hover:text-yellow-400 truncate max-w-[14rem]"
                            title={workflow.title}
                          >
                            {workflow.title}
                          </button>
                          <div className="text-[11px] text-zinc-500">{workflow.createdAt}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openWorkflow(workflow.id)}
                            className="px-2 py-1 text-[11px] rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="px-2 py-1 text-[11px] rounded border border-red-300 text-red-600 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
