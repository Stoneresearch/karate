"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

type DocsProps = {
  files: { name: string; title: string }[];
  contents: Record<string, string>;
};

export default function DocsPage({ files: initialFiles, contents }: DocsProps) {
  const [files, setFiles] = useState<{ name: string; title: string }[]>(initialFiles || []);
  const [activeFile, setActiveFile] = useState<string | null>(initialFiles?.[0]?.name || null);
  const [content, setContent] = useState<string>(activeFile ? (contents[activeFile] || '') : '');
  const [loading, setLoading] = useState(false);
  // Default to full content for admin-oriented docs
  const [concise, setConcise] = useState(false);

  useEffect(() => {
    // keep state in sync if props change (unlikely)
    if (!activeFile && initialFiles?.[0]) {
      setActiveFile(initialFiles[0].name);
      setContent(contents[initialFiles[0].name] || '');
    }
  }, [initialFiles, contents, activeFile]);

  const load = async (name: string) => {
    setLoading(true);
    setActiveFile(name);
    setContent(contents[name] || '');
    setLoading(false);
  };

  const toc = useMemo(() => {
    const lines = content.split('\n');
    const items: { level: number; text: string; id: string }[] = [];
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    const stripMd = (s: string) => s.replace(/[*_`~]/g, '').replace(/^\s+|\s+$/g, '');
    let sectionIndex = 0;
    lines.forEach((line) => {
      const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
      if (match) {
        const level = match[1].length;
        const raw = match[2].trim();
        const text = stripMd(raw);
        if (level === 1) {
          const isNumberedH1 = /^(\d+(?:\.\d+)*[\.)]?\s+)/.test(text);
          if (!isNumberedH1 || /^table of contents$/i.test(text) || /^guide index$/i.test(text)) return;
        }
        if (/^table of contents$/i.test(text)) return; // skip built-in ToC heading
        if (/^guide index$/i.test(text)) return;
        const id = slug(text);
        let display = text;
        const numbered = /^(\d+(?:\.\d+)*[\.)]?\s+)/.test(display);
        const lettered = /^([A-Z][\.\)]\s+)/.test(display);
        if (!numbered && !lettered && level === 2) {
          sectionIndex += 1;
          display = `${sectionIndex}. ${display}`;
        }
        items.push({ level, text: display, id });
      }
    });
    return items;
  }, [content]);

  const filteredContent = useMemo(() => {
    // Always strip the explicit Table of Contents section and any leading HR/frontmatter-like lines
    const stripTOCSection = (src: string) => {
      const re = /^#{1,6}\s*[*_`~]*\s*(Table of Contents|Guide Index)\s*[*_`~]*[\s\S]*?(?=^#{1,6}\s+|\Z)/gim;
      return src.replace(re, '').trim();
    };
    const stripLeadingRules = (src: string) => {
      const lines = src.split('\n');
      while (lines.length && /^\s*(-{3,}|\*{3,})\s*$/.test(lines[0])) {
        lines.shift();
      }
      return lines.join('\n');
    };
    const base = stripLeadingRules(stripTOCSection(content));
    if (!concise) return base;
    // Remove boilerplate-ish lines and headers that are too verbose
    const hide = [/^#+\s*(Changelog|License)/i, /^>\s*Note:/i, /^\s*-\s*\[[x\s]\]\s*/i];
    return base
      .split('\n')
      .filter((line) => !hide.some((re) => re.test(line)))
      .join('\n');
  }, [concise, content]);

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:opacity-80 transition">
            KARATE AI Documentation
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
          <div className="md:col-span-1 space-y-4 md:sticky md:top-24 md:self-start md:h-[calc(100vh-6rem)]">
            <div className="p-4 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg">
              <h2 className="text-lg font-bold mb-3">Documentation</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Karate AI Developer documentation, including the full technical guide.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">Files</div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {files.map((f) => (
                  <li key={f.name}>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ${activeFile === f.name ? 'bg-yellow-400/10 text-yellow-300' : 'text-zinc-700 dark:text-zinc-300'}`}
                      onClick={() => load(f.name)}
                    >
                      {f.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {toc.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">On this page</div>
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
            <div className="flex gap-2 md:sticky md:bottom-4">
              <Link href="/dashboard" className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-bold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Dashboard</Link>
              <Link href="/editor" className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 transition">Editor</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <motion.div
              key={activeFile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg p-6 prose dark:prose-invert max-w-none prose-headings:scroll-mt-24"
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
                    code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => (
                      <code className={`rounded px-1.5 py-0.5 bg-zinc-100 text-zinc-900 dark:bg-black/60 dark:text-zinc-100 ${className || ''}`} {...props}>{children}</code>
                    ),
                    a: ({ href = '', children, ...props }: { href?: string; children?: React.ReactNode }) => (
                      <a href={href} className="text-yellow-300 hover:text-yellow-200 underline decoration-yellow-400/50" {...props}>{children}</a>
                    ),
                    p: ({ children, ...props }: { children?: React.ReactNode }) => (
                      <p className="text-zinc-800 dark:text-zinc-200 leading-7" {...props}>{children}</p>
                    ),
                    ul: ({ children, ...props }: { children?: React.ReactNode }) => (
                      <ul className="marker:text-zinc-400 dark:marker:text-zinc-500" {...props}>{children}</ul>
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

export async function getStaticProps() {
  const path = await import('path');
  const fs = await import('fs');

  const repoRoot = path.resolve(process.cwd(), '..');
  const docsRoot = path.join(repoRoot, 'docs');
  const includeInstruction = true;

  let files: { name: string; title: string }[] = [];
  const contents = {} as Record<string, string>;
  try {
    let entries = fs.readdirSync(docsRoot, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((n) => /\.(md)$/i.test(n));

    // instruction.md is expected to be in docs now; check there first
    const instructionPathDocs = path.join(docsRoot, 'instruction.md');
    const instructionPathRoot = path.join(repoRoot, 'instruction.md');
    const hasInstruction = includeInstruction && (fs.existsSync(instructionPathDocs) || fs.existsSync(instructionPathRoot));

    // Read contents
    for (const name of entries) {
      const target = path.join(docsRoot, path.basename(name));
      contents[name] = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    }
    if (hasInstruction) {
      const ip = fs.existsSync(instructionPathDocs) ? instructionPathDocs : instructionPathRoot;
      contents['instruction.md'] = fs.readFileSync(ip, 'utf8');
      // Ensure we don't list instruction.md twice
      entries = entries.filter((n) => n.toLowerCase() !== 'instruction.md');
      entries.unshift('instruction.md');
    }

    // Build files list with nicer titles: from first H1 if present, else filename
    const toTitle = (name: string, raw: string): string => {
      const stripMd = (s: string) => s.replace(/[*_`~]/g, '');
      const h1Matches = [...(raw || '').matchAll(/^#\s+(.+)$/gm)].map(m => m[1]);
      const chosen = h1Matches.find(h => !/table of contents/i.test(h)) || h1Matches[0];
      if (chosen) return stripMd(chosen).trim();
      return name.replace(/_/g, ' ').replace(/\.md$/i, '').toUpperCase();
    };

    // Build unique list (avoid accidental duplicates)
    const seen = new Set<string>();
    const pushUnique = (arr: { name: string; title: string }[], name: string, title: string) => {
      const key = name.toLowerCase();
      if (!seen.has(key)) { seen.add(key); arr.push({ name, title }); }
    };
    const tmp: { name: string; title: string }[] = [];
    if (hasInstruction) pushUnique(tmp, 'instruction.md', toTitle('instruction.md', contents['instruction.md']));
    for (const n of entries) pushUnique(tmp, n, toTitle(n, contents[n]));
    files = tmp;

    // Default to instruction.md first if present
    const order = ['get_started.md', 'quick_start.md', 'workflow_editor_guide.md', 'instruction.md'];
    files.sort((a, b) => {
      const ai = order.indexOf(a.name.toLowerCase());
      const bi = order.indexOf(b.name.toLowerCase());
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.title.localeCompare(b.title);
    });
  } catch {}

  return { props: { files, contents } };
}

function DocCard({ doc, isExpanded, onToggle }: { doc: { name: string; title: string; description: string }; isExpanded: boolean; onToggle: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={onToggle}
        className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-yellow-400/50 transition-all text-left flex items-center justify-between group"
      >
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-yellow-400 transition">{doc.title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-500">{doc.description}</p>
        </div>
        <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''} text-zinc-500 group-hover:text-yellow-400`}>▼</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg"
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
