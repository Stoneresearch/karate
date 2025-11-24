import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LandingHeader from '../components/Layout/LandingHeader';
import { Loader } from '../components/ui/Loader';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading for visual effect on landing
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);

  const marqueeModels = [
    'GPT img 1',
    'Wan',
    'SD 3.5',
    'Runway Gen-4',
    'Imagen 3',
    'Veo 3',
    'Recraft V3',
    'Kling',
    'Flux Pro 1.1 Ultra',
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Horizontal marquee interactions were removed for now; can be reintroduced with proper hooks later.

  const tools = [
    { name: 'Crop', position: 'top-20 left-10' },
    { name: 'Invert', position: 'top-32 left-1/3' },
    { name: 'Outpaint', position: 'top-40 left-1/2' },
    { name: 'Painter', position: 'top-20 right-10' },
    { name: 'Channels', position: 'top-32 right-1/4' },
    { name: 'Inpaint', position: 'bottom-40 left-1/4' },
    { name: 'Mask Extractor', position: 'bottom-32 left-1/2' },
    { name: 'Image Describer', position: 'bottom-32 right-1/3' },
    { name: 'Upscale', position: 'bottom-40 left-1/3' },
    { name: 'Z Depth Extractor', position: 'bottom-20 right-1/4' },
    { name: 'Relight', position: 'bottom-20 right-10' },
  ];

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <main className={`min-h-screen overflow-x-hidden bg-white text-zinc-900 dark:bg-black dark:text-white`} ref={containerRef}>
      <LandingHeader isScrolled={isScrolled} />

      <section className="relative min-h-[100vh] pt-28 pb-24 overflow-hidden hero-ambient">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -right-32 top-20 w-[680px] h-[680px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,225,119,0.25),transparent_60%)] blur-3xl" />
          <div className="absolute -left-40 bottom-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(158,248,255,0.2),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <h1 className="display text-6xl md:text-7xl leading-[1.02] mb-6">
                Design anything
                <br /> with every AI model
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-8">
                Karate AI – Design Studio. Compose images, videos, vectors and 3D with precise art direction, reusable nodes and live collaboration.
              </p>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {['Crop','Invert','Outpaint','Inpaint','Mask Extractor','Upscale','Channels','Relight','Image Describer','Z Depth Extractor'].map((t) => (
                  <span key={t} className="chip chip-light dark:chip-dark">{t}</span>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 flex-wrap">
                <Link href="/dashboard" className="btn-primary">Start Now</Link>
                <Link href="#models" className="btn-secondary">Explore Engines</Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative h-[70vh] lg:h-[75vh] overflow-hidden">
                <div className="marquee-vertical">
                  <div className="marquee-track">
                    {[...Array(2)].map((_, loopIndex) => (
                      <div key={loopIndex} className="space-y-5 select-none">
                        {marqueeModels.map((m) => (
                          <div key={`${m}-${loopIndex}`} className="marquee-item text-[48px] md:text-[64px] xl:text-[80px] font-black leading-none">
                            {m}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Studio section (tagline + mini flow preview) */
      }
      <section className="relative py-28 grid-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="display text-5xl md:text-7xl mb-6">
              Built for <span className="gradient-text-primary">Creators</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Turn prompts into direction. Sketch a flow once, then remix it endlessly—batch images, refine color, relight scenes, upscale, animate and export. Everything stays editable.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: '/images/flow-2.jpg', label: 'Stable Diffusion' },
              { src: '/images/flow-1.jpg', label: 'Flux Pro 1.1' },
              { src: '/images/flow-3.jpg', label: 'Minimax Video' },
            ].map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur shadow-lg"
                whileHover={{ y: -6 }}
              >
                <div className="aspect-[16/11] relative">
                  <Image src={card.src} alt={card.label} fill className="object-cover" />
                </div>
                <div className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{card.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        id="features"
        className="relative py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl md:text-6xl font-black text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            With all the professional
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-yellow-300 bg-clip-text text-transparent">
              tools you rely on
            </span>
          </motion.h2>

          <p className="text-center text-zinc-400 text-lg mb-20 max-w-3xl mx-auto">
            In one seamless workflow
          </p>

          <div className="relative h-96 md:h-[500px]">
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255, 223, 110, 0.20) 0%, rgba(255, 195, 176, 0.15) 50%, rgba(158, 248, 255, 0.15) 100%)' }} />
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center Image Placeholder */}
                <motion.div
                  className="absolute w-48 h-48 rounded-2xl"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #ffb4d3 0deg, #ffe177 120deg, #7ae1ff 240deg, #ffb4d3 360deg)' }}
                />
              </div>
            </motion.div>

            {tools.map((tool, i) => (
              <motion.div
                key={tool.name}
                className={`absolute ${tool.position} pointer-events-none`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  {tool.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="models"
        className="relative py-32 px-6 models-surface"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl md:text-6xl font-black text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Powered by world‑class engines
          </motion.h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto">
            We route each task to the right model—keeping your visuals consistent, fast and production‑ready.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { title: 'Image', note: 'photoreal, stylized, vector', models: ['Flux Pro 1.1 Ultra', 'Stable Diffusion 3.5', 'DALL·E 3', 'Ideogram V3', 'Recraft V3'] },
              { title: 'Video', note: 'gen, reframe, modify', models: ['Runway Gen-4', 'Minimax Video', 'Luma Ray 2', 'Veo 3'] },
              { title: '3D & Advanced', note: 'avatars, 3D, depth', models: ['Kling', 'Rodin 2.0', 'Trellis 3D', 'Wan'] },
            ].map((category, idx) => (
              <motion.div
                key={category.title}
                className="card-glass glow-border p-8 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-xl font-bold text-yellow-300">{category.title}</h3>
                  <span className="badge badge-soft">{category.note}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.models.map((model) => (
                    <span key={model} className="badge badge-soft hover:brightness-110 transition-smooth">
                      {model}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="relative py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="card-glass glow-border rounded-2xl p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-black mb-3">Open the Studio</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
                Build a design workflow once and reuse it forever. Drag nodes, art‑direct outputs, and collaborate in real time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-primary">Open Studio →</Link>
              <Link href="/docs" className="btn-secondary">Read Docs</Link>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="py-8 px-6 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Karate. All rights reserved.</p>
      </footer>
    </main>
  );
}


