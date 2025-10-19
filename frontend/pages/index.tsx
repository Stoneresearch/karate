import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const models = [
    'GPTimg1',
    'Ideogram V3',
    'Flux Pro 1.1 Ultra',
    'Wan',
    'SD 3.5',
    'Runway Gen-4',
    'Imagen 3',
    'Veo 3',
    'Recraft V3',
    'Kling',
    'Claude 3',
  ];

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

  return (
    <main className={`min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f6f4ff] via-[#faf9ff] to-white text-zinc-900 dark:bg-black dark:text-white`} ref={containerRef}>
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="h-8 w-8 rounded-sm bg-gradient-to-br from-[#f2c6ff] via-[#ffd27a] to-[#7ae1ff]" />
            <span className="font-bold text-xl tracking-tight">KARATE</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: 'Docs', href: '/docs' },
              { label: 'Enterprise', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Explore workflows', href: '/dashboard' },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden md:block"
            >
              Sign in
            </motion.a>
            <motion.a
              href="/dashboard"
              className="px-6 py-2 text-black font-semibold rounded-md transition-all bg-gradient-to-r from-[#ffe177] via-[#ffc3b0] to-[#9ef8ff] hover:brightness-110"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-[#fff7fb] to-white dark:from-slate-900 dark:via-black dark:to-black" />
          <motion.div
            className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ background: 'conic-gradient(from 90deg at 50% 50%, #ffd27a 0deg, #f2c6ff 120deg, #7ae1ff 240deg, #ffd27a 360deg)' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ background: 'conic-gradient(from 0deg at 50% 50%, #9ef8ff 0deg, #ffe177 120deg, #ffc3b0 240deg, #9ef8ff 360deg)' }}
          />
        </div>

        {/* 3D Sphere with Parallax */}
        <div className="absolute inset-0 -z-5 flex items-center justify-end pr-20 perspective">
          {isClient && (
            <motion.div
              className="relative w-96 h-96 rounded-full bg-gradient-to-b from-slate-400 to-slate-800 shadow-2xl"
              style={{
                x: (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.02,
                y: (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.02,
              }}
              animate={{
                rotateX: [0, 5, 0],
                rotateY: [0, 5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-600/30 blur-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 bg-clip-text text-transparent dark:from-white dark:via-cyan-200 dark:to-white">
                Use all AI models,
              </span>
              <br />
              <motion.span
                className="inline-block bg-gradient-to-r from-[#ffb4d3] via-[#ffd27a] to-[#7ae1ff] bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                together at last
              </motion.span>
          </h1>

            <motion.p
              className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              AI models and professional editing tools in one node-based platform. Turn creative vision into scalable workflows without compromising quality.
            </motion.p>

            {/* Floating AI Model Names */}
            <div className="relative h-20 mb-12 overflow-hidden">
              <div className="flex flex-wrap justify-center gap-4">
                {models.map((model, i) => (
                  <motion.div
                    key={model}
                    className="text-sm font-semibold text-yellow-300 opacity-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 0], y: [-20, 0, -40] }}
                    transition={{
                      delay: i * 0.1,
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    {model}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.a
                href="/dashboard"
                className="px-8 py-4 text-black font-bold rounded-lg transition-all bg-gradient-to-r from-[#ffe177] via-[#ffc3b0] to-[#9ef8ff] hover:brightness-110"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(250, 204, 21, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                Open Dashboard →
              </motion.a>
              <motion.button
                className="px-8 py-4 border-2 border-zinc-300 text-zinc-900 dark:border-zinc-600 dark:text-white font-bold rounded-lg hover:border-zinc-900 dark:hover:border-white transition-all"
                whileHover={{ scale: 1.05, borderColor: '#fff' }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Features
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
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

          {/* Tools Grid with Parallax */}
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

            {/* Floating Tool Labels */}
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

      {/* AI Models Showcase */}
      <motion.section
        className="relative py-32 px-6 bg-gradient-to-b from-black via-slate-950 to-black"
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
            Powered by the best
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-cyan-400 bg-clip-text text-transparent">
              AI models available
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { title: 'Image Generation', models: ['Flux Pro 1.1 Ultra', 'Stable Diffusion 3.5', 'DALL·E 3', 'Ideogram V3'] },
              { title: 'Video Generation', models: ['Runway Gen-4', 'Minimax Video', 'Luma Ray 2', 'Veo 3'] },
              { title: '3D & Advanced', models: ['Kling', 'Rodin 2.0', 'Trellis 3D', 'Recraft V3'] },
            ].map((category, idx) => (
              <motion.div
                key={category.title}
                className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-zinc-700 rounded-2xl backdrop-blur"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, borderColor: '#fcd34d' }}
              >
                <h3 className="text-lg font-bold mb-4 text-yellow-300">{category.title}</h3>
                <ul className="space-y-3">
                  {category.models.map((model) => (
                    <motion.li
                      key={model}
                      className="text-zinc-300 text-sm flex items-center gap-2"
                      whileHover={{ x: 5, color: '#fff' }}
                    >
                      <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                      {model}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.section
        className="relative py-20 px-6 border-t border-zinc-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-black mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to create
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-cyan-400 bg-clip-text text-transparent">
              without limits?
            </span>
          </motion.h2>

          <motion.a
            href="/dashboard"
            className="inline-block px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(250, 204, 21, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Launch Dashboard →
          </motion.a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Karate. All rights reserved.</p>
      </footer>
    </main>
  );
}


