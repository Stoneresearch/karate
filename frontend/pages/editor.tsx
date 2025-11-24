import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Loader } from '../components/ui/Loader';

const Canvas = dynamic(() => import('../components/NodeEditor/Canvas').catch(err => {
  console.error("Failed to load Canvas:", err);
  // Return a simple error component so the user sees what's wrong
  return () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="text-red-500 mb-2">Failed to load editor</div>
      <pre className="text-xs bg-zinc-900 p-4 rounded">{err.message}</pre>
    </div>
  );
}), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-white text-zinc-900 dark:bg-black dark:text-white flex items-center justify-center">
      <motion.div
        className="text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Loader size="xxl" className="text-yellow-400 mb-6" />
        <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium tracking-wide">Loading editor...</p>
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


