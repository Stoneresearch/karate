'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import HeaderShell from '../components/Layout/HeaderShell';
import 'highlight.js/styles/github-dark.css';

type DocsProps = {
  files: { name: string; title: string }[];
  contents: Record<string, string>;
};

// Safety net: strip any emoji/pictographic symbols from documentation content
// so that docs render in a clean, neutral style even if authors add them.
const stripEmojis = (value: string) =>
  value.replace(/\p{Extended_Pictographic}/gu, '');

export default function DocsPage({ files: initialFiles, contents }: DocsProps) {
  const files = initialFiles || [];
  const [activeFile, setActiveFile] = useState<string | null>(initialFiles?.[0]?.name || null);
  const [content, setContent] = useState<string>(activeFile ? (contents[activeFile] || '') : '');
  const [loading, setLoading] = useState(false);
  // Default to full content for admin-oriented docs
  const [concise, setConcise] = useState(false);

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
    const seenIds = new Set<string>();
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
        if (seenIds.has(id)) return;
        seenIds.add(id);
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
    const noEmoji = stripEmojis(base);
    if (!concise) return noEmoji;
    // Remove boilerplate-ish lines and headers that are too verbose
    const hide = [/^#+\s*(Changelog|License)/i, /^>\s*Note:/i, /^\s*-\s*\[[x\s]\]\s*/i];
    return noEmoji
      .split('\n')
      .filter((line) => !hide.some((re) => re.test(line)))
      .join('\n');
  }, [concise, content]);

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <HeaderShell
        variant="app"
        isScrolled={true}
        leftContent={
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-md bg-[conic-gradient(from_180deg_at_50%_50%,#f97316_0deg,#22d3ee_120deg,#eab308_240deg,#f97316_360deg)] shadow-[0_0_22px_rgba(250,204,21,0.45)] group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Karate
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                Documentation
              </span>
            </div>
          </Link>
        }
        centerContent={
          <div className="hidden md:flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/50 tracking-[0.18em] uppercase">
              Docs
            </span>
            <span className="hidden lg:inline text-zinc-400 dark:text-zinc-500">
              Setup, editor, and integration guides for Karate Studio.
            </span>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className={`hidden sm:inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-tight transition-colors ${
                concise
                  ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-900/70 dark:text-zinc-200 dark:border-zinc-700'
              }`}
              onClick={() => setConcise(!concise)}
              title="Toggle concise view"
            >
              {concise ? 'Concise view' : 'Full view'}
            </button>
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden md:inline-block text-xs px-3 py-1.5 rounded-full border border-zinc-300/70 text-zinc-600 hover:text-zinc-900 hover:border-zinc-500 dark:text-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500 transition-colors"
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'w-8 h-8 rounded-full border border-zinc-200/70 dark:border-zinc-700 shadow-sm',
                  },
                }}
              />
            </SignedIn>
          </div>
        }
        className="fixed top-0 left-0 right-0"
      />

      <div className="pt-24 pb-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4 md:sticky md:top-24 md:self-start md:h-[calc(100vh-6rem)]">
            <div className="surface-panel overflow-hidden">
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
              <div className="surface-soft overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">On this page</div>
                <ul className="max-h-[40vh] overflow-y-auto py-2">
                  {toc.map((h) => (
                    <li key={h.id} className="px-4 py-1">
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
          </div>

          <div className="md:col-span-2">
            <motion.div
              key={activeFile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-hero p-6 md:p-8 prose dark:prose-invert max-w-none prose-headings:scroll-mt-24"
            >
              {loading ? (
                <div className="text-zinc-400">Loading…</div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }], rehypeHighlight]}
                  components={{
                    h1: ({ ...props }) => <h1 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
                    h2: ({ ...props }) => <h2 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
                    h3: ({ ...props }) => <h3 id={String(props.children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')} {...props} />,
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
