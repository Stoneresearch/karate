import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const saved = localStorage.getItem('workflows');
    if (saved) {
      setWorkflows(JSON.parse(saved));
    }
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
    setWorkflows(updated);
    localStorage.setItem('workflows', JSON.stringify(updated));
    
    setTimeout(() => {
      router.push(`/editor?id=${newWorkflow.id}`);
      setLoading(false);
    }, 300);
  };

  const openWorkflow = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const templates = [
    { name: 'Image Generation', icon: '🎨', color: 'from-purple-900 to-purple-700', desc: 'Generate images with AI' },
    { name: 'Image Editing', icon: '✏️', color: 'from-blue-900 to-blue-700', desc: 'Edit and enhance images' },
    { name: 'Image to Video', icon: '🎬', color: 'from-cyan-900 to-cyan-700', desc: 'Convert images to videos' },
    { name: 'Upscaling', icon: '📈', color: 'from-pink-900 to-pink-700', desc: 'Upscale images with AI' },
    { name: 'Batch Processing', icon: '⚙️', color: 'from-green-900 to-green-700', desc: 'Process multiple files' },
    { name: 'Multi-Model', icon: '🔀', color: 'from-orange-900 to-orange-700', desc: 'Combine multiple models' },
  ];

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-8 w-8 bg-yellow-400 rounded-sm flex items-center justify-center text-black font-bold">K</div>
              <span className="font-bold text-xl tracking-tight">KARATE</span>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => createNewWorkflow('Untitled Project')}
              disabled={loading}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? '⏳ Creating...' : '+ Create New Project'}
            </motion.button>
            <motion.button
              onClick={() => {}}
              className="px-6 py-2 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-zinc-700 border border-zinc-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Help
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-white to-cyan-400 bg-clip-text text-transparent">Welcome Back! 👋</h1>
            <p className="text-zinc-400">Create AI workflows, compose images, and automate your creative process</p>
          </motion.section>

          {/* My Files / Gallery */}
          {workflows.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
                📁 My Files & Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {workflows.map((workflow, idx) => (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => openWorkflow(workflow.id)}
                      className="group cursor-pointer"
                    >
                      <motion.div
                        className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-yellow-400/50 transition-all h-48 flex flex-col"
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(250, 204, 21, 0.1)' }}
                      >
                        <div className="flex-1 bg-black/50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl mb-2">🎨</div>
                            <p className="text-xs text-zinc-400">{workflow.nodes} nodes</p>
                          </div>
                        </div>
                        <div className="p-3 border-t border-zinc-700 bg-black/30">
                          <h3 className="font-semibold text-sm truncate group-hover:text-yellow-400 transition">{workflow.title}</h3>
                          <p className="text-xs text-zinc-500">{workflow.createdAt}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* Workflow Templates */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
              ✨ Workflow Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, idx) => (
                <motion.button
                  key={template.name}
                  onClick={() => createNewWorkflow(template.name)}
                  disabled={loading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="text-left group disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={`bg-gradient-to-br ${template.color} rounded-lg p-6 border border-opacity-30 border-white h-40 flex flex-col justify-between hover:border-opacity-100 transition-all`}
                    whileHover={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.2)' }}
                  >
                    <div>
                      <div className="text-4xl mb-3">{template.icon}</div>
                      <h3 className="font-bold text-base">{template.name}</h3>
                      <p className="text-xs text-zinc-200 mt-1 opacity-90">{template.desc}</p>
                    </div>
                    <p className="text-xs text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to create →
                    </p>
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Quick Start Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
              🚀 Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: '1. Create Workflow', desc: 'Click any template or "Create New File" to start', icon: '➕', color: 'from-yellow-900' },
                { title: '2. Add Nodes', desc: 'Drag AI models and tools from the sidebar to canvas', icon: '🧠', color: 'from-purple-900' },
                { title: '3. Connect & Run', desc: 'Draw lines between nodes and execute your workflow', icon: '🔗', color: 'from-cyan-900' },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className={`bg-gradient-to-br ${step.color} to-black rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-all`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h3 className="font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-zinc-300">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Resources */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
              📚 Resources & Help
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/docs">
                <motion.div
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-yellow-400/50 cursor-pointer transition-all"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(250, 204, 21, 0.1)' }}
                >
                  <div className="text-3xl mb-3">📖</div>
                  <h3 className="font-bold mb-2 hover:text-yellow-400 transition">Documentation Hub</h3>
                  <p className="text-sm text-zinc-400">Read guides, tutorials, and platform help</p>
                </motion.div>
              </Link>
              <motion.div
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-cyan-400/50 cursor-pointer transition-all"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)' }}
              >
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-bold mb-2 hover:text-cyan-400 transition">Community & Support</h3>
                <p className="text-sm text-zinc-400">Connect with other users and get help</p>
              </motion.div>
            </div>
          </motion.section>

          {/* Tips Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-900/20 to-cyan-900/20 rounded-lg p-8 border border-zinc-700 hover:border-zinc-600 transition-all"
            whileHover={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.1)' }}
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-400">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>• Connect nodes by dragging from the yellow dots (outputs) to cyan dots (inputs)</li>
              <li>• Use the sidebar icons to search for specific AI models and tools</li>
              <li>• Save your workflows automatically as you make changes</li>
              <li>• Duplicate workflows to create variations quickly</li>
            </ul>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
