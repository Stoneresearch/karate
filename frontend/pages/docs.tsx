'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function DocsPage() {
  const [files, setFiles] = useState<{ name: string; title: string }[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [concise, setConcise] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/docs?list=1');
      const json = await res.json();
      setFiles(json.files || []);
      if (json.files?.[0]) load(json.files[0].name);
    })();
  }, []);

  const load = async (name: string) => {
    setLoading(true);
    setActiveFile(name);
    const res = await fetch(`/api/docs?name=${encodeURIComponent(name)}`);
    const json = await res.json();
    setContent(json.content || '');
    setLoading(false);
  };

  const toc = useMemo(() => {
    const lines = content.split('\n');
    const items: { level: number; text: string; id: string }[] = [];
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    lines.forEach((line) => {
      const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = slug(text);
        items.push({ level, text, id });
      }
    });
    return items;
  }, [content]);

  const filteredContent = useMemo(() => {
    if (!concise) return content;
    // Remove boilerplate-ish lines and headers that are too verbose
    const hide = [/^#+\s*(Table of Contents|Changelog|License)/i, /^>\s*Note:/i, /^\s*-\s*\[[x\s]\]\s*/i];
    return content
      .split('\n')
      .filter((line) => !hide.some((re) => re.test(line)))
      .join('\n');
  }, [concise, content]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:opacity-80 transition">
            🥋 KARATE
          </Link>
          <div className="flex gap-2 md:gap-4 items-center">
            <Link href="/dashboard" className="px-4 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition">
              Dashboard
            </Link>
            <Link href="/editor" className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 transition">
              Editor
            </Link>
            <button
              className={`px-3 py-2 text-sm rounded-md border ${concise ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-800 border-zinc-700 text-zinc-300'} hover:bg-zinc-700 transition`}
              onClick={() => setConcise(!concise)}
              title="Toggle concise view"
            >
              {concise ? 'Concise On' : 'Concise Off'}
            </button>
          </div>
        </div>
      </motion.header>

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <h2 className="text-lg font-bold mb-3">📚 Documentation</h2>
              <p className="text-sm text-zinc-400">Sourced from the repository /docs folder.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-zinc-800 text-sm text-zinc-400">Files</div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {files.map((f) => (
                  <li key={f.name}>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition ${activeFile === f.name ? 'bg-yellow-400/10 text-yellow-300' : 'text-zinc-300'}`}
                      onClick={() => load(f.name)}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* TOC */}
            {toc.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-zinc-800 text-sm text-zinc-400">On this page</div>
                <ul className="max-h-[40vh] overflow-y-auto py-2">
                  {toc.map((h, idx) => (
                    <li key={idx} className="px-4 py-1">
                      <a
                        href={`#${h.id}`}
                        className="text-xs text-zinc-400 hover:text-yellow-300 transition"
                        style={{ paddingLeft: (h.level - 1) * 8 }}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1 px-4 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition">Dashboard</Link>
              <Link href="/editor" className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 transition">Editor</Link>
            </div>
          </div>

          {/* Reader */}
          <div className="md:col-span-2">
            <motion.div
              key={activeFile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 prose prose-invert max-w-none prose-headings:scroll-mt-24"
            >
              {loading ? (
                <div className="text-zinc-400">Loading…</div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }], rehypeHighlight]}
                  components={{
                    h1: ({ node, ...props }) => <h1 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
                    h2: ({ node, ...props }) => <h2 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
                    h3: ({ node, ...props }) => <h3 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
                    code: ({ className, children, ...props }: any) => (
                      <code className={`rounded bg-black/60 px-1.5 py-0.5 ${className || ''}`} {...props}>{children}</code>
                    ),
                    a: ({ href = '', children, ...props }: any) => (
                      <a href={href} className="text-yellow-300 hover:text-yellow-200 underline decoration-yellow-400/50" {...props}>{children}</a>
                    ),
                    p: ({ children, ...props }: any) => (
                      <p className="text-zinc-200 leading-7" {...props}>{children}</p>
                    ),
                    ul: ({ children, ...props }: any) => (
                      <ul className="marker:text-zinc-500" {...props}>{children}</ul>
                    ),
                  }}
                >
                  {filteredContent}
                </ReactMarkdown>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DocCard({ doc, isExpanded, onToggle }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={onToggle}
        className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-yellow-400/50 transition-all text-left flex items-center justify-between group"
      >
        <div>
          <h3 className="font-bold text-white group-hover:text-yellow-400 transition">{doc.title}</h3>
          <p className="text-sm text-zinc-500">{doc.description}</p>
        </div>
        <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''} text-zinc-500 group-hover:text-yellow-400`}>▼</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-black border border-zinc-800 rounded-lg"
          >
            <a
              href={`/docs/${doc.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition"
            >
              Open File →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
