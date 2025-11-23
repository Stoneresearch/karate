import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convex/api';
import type { Id } from '../lib/convex/dataModel';
import DashboardHeader from '../components/Layout/DashboardHeader';

type Workflow = {
  _id: string;
  title: string;
  createdAt: number | string | Date;
  nodes?: unknown[];
};

function ConvexDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  // Get workflows from Convex
  const owner = user?.id || 'demo-user';
  const workflowsData = useQuery(api.workflows.list, { owner }) as Workflow[] | undefined;
  const createWorkflow = useMutation(api.workflows.create);
  const deleteWorkflowMutation = useMutation(api.workflows.deleteWorkflow);
  const deleteBatchMutation = useMutation(api.workflows.deleteBatch);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const handleCreateClick = () => {
    setNewProjectTitle('');
    setCreateModalOpen(true);
  };

  const createNewWorkflow = async (title: string) => {
    setLoading(true);
    try {
      const workflowId = await createWorkflow({
        title: title || 'Untitled Workflow',
        owner: owner,
      });
      setTimeout(() => {
        router.push(`/editor?id=${workflowId}`);
        setLoading(false);
        setCreateModalOpen(false);
      }, 300);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      setLoading(false);
    }
  };

  const openWorkflow = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const deleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflowMutation({ id: id as Id<'workflows'> });
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} workflows?`)) return;
    
    setLoading(true);
    try {
      await deleteBatchMutation({ ids: Array.from(selectedIds) as Id<'workflows'>[] });
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Failed to delete selected workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === (workflowsData?.length || 0)) {
      setSelectedIds(new Set());
    } else {
      const allIds = workflowsData?.map(w => w._id) || [];
      setSelectedIds(new Set(allIds));
    }
  };

  const workflows = workflowsData?.map((w) => ({
    id: w._id,
    title: w.title,
    createdAt: new Date(w.createdAt).toLocaleDateString(),
    nodes: w.nodes?.length || 0,
    thumbnail: null,
  })) || [];

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white relative">
      <DashboardHeader onCreateNew={handleCreateClick} loading={loading} />

      <div className="px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="hero-ambient rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h1 className="text-heading-xl mb-2">Your Studio</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a new project or pick up where you left off. Everything is editable.</p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={handleCreateClick} disabled={loading} className="btn-primary">
                {loading ? 'Creating…' : 'New Project'}
              </button>
              <Link href="/docs" className="btn-secondary">Read Docs</Link>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">My Workflows</h2>
                {workflows.length > 0 && (
                  <>
                    <button 
                      onClick={() => setSelectionMode(!selectionMode)}
                      className={`text-xs px-2 py-1 rounded ${selectionMode ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                    >
                      {selectionMode ? 'Done' : 'Select'}
                    </button>
                    {selectionMode && (
                      <button 
                        onClick={toggleSelectAll}
                        className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                      >
                        {selectedIds.size === workflows.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {selectionMode && selectedIds.size > 0 && (
                  <button 
                    onClick={deleteSelected}
                    className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-md font-medium transition-colors"
                  >
                    Delete ({selectedIds.size})
                  </button>
                )}
                {workflows.length > 0 && (
                  <span className="text-xs text-zinc-500">{workflows.length} total</span>
                )}
              </div>
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
                        {selectionMode && (
                          <div className="pr-2">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.has(workflow.id)}
                              onChange={() => toggleSelect(workflow.id)}
                              className="w-4 h-4 rounded border-zinc-300 text-yellow-400 focus:ring-yellow-400 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
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

      {/* Create Project Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold">Create New Project</h3>
                <button onClick={() => setCreateModalOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Project Name</label>
                  <input
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="My Awesome Workflow"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createNewWorkflow(newProjectTitle);
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createNewWorkflow(newProjectTitle)}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-500"
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function FallbackDashboard() {
  const [loading, setLoading] = useState(false);

  const createNewWorkflow = async () => {
    setLoading(true);
    console.warn('Convex not initialized; cannot create workflow. See CONVEX_SETUP.md.');
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <DashboardHeader onCreateNew={() => createNewWorkflow()} loading={loading} />

      <div className="px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="hero-ambient rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h1 className="text-heading-xl mb-2">Your Studio</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a new project or pick up where you left off. Everything is editable.</p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => createNewWorkflow()} disabled={loading} className="btn-primary">
                {loading ? 'Creating…' : 'Convex not ready'}
              </button>
              <Link href="/docs" className="btn-secondary">Read Docs</Link>
            </div>
          </section>

          <section>
            <div className="card-glass glow-border rounded-2xl p-6 text-center">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Convex not initialized. See CONVEX_SETUP.md.</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DashboardContent() {
  const hasConvex = Boolean(api.workflows?.list);
  return hasConvex ? <ConvexDashboard /> : <FallbackDashboard />;
}

export default dynamic(() => Promise.resolve(DashboardContent), { ssr: false });
