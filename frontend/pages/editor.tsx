import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const Canvas = dynamic(() => import('../components/NodeEditor/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-white text-zinc-900 dark:bg-black dark:text-white flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400/20 border border-yellow-400/50 rounded-lg mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-xl"
          >
            ⚙️
          </motion.div>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Loading editor...</p>
      </motion.div>
    </div>
  ),
});

export default function EditorPage() {
  const router = useRouter();
  const workflowId = (router.query.id as string) || 'demo-room';

  return (
    <motion.div
      className="h-screen w-screen bg-white text-zinc-900 dark:bg-black dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas roomId={workflowId} />
    </motion.div>
  );
}


