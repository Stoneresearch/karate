"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../lib/convex/api';
import { useState } from 'react';
import Image from 'next/image';

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onDragStart: (e: React.DragEvent, item: any) => void;
}

export default function MediaGallery({ isOpen, onClose, onDragStart }: MediaGalleryProps) {
  // Safely access the query, defaulting to skip (undefined) if api.files is not yet generated
  const listUserFiles = api.files ? api.files.listUserFiles : undefined;
  const userFiles = useQuery(listUserFiles as any) || [];
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search
  const filteredFiles = userFiles.filter((file: any) => {
      const name = file.name || 'Untitled';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sliding Modal */}
          <motion.div
            className="fixed left-20 top-4 bottom-4 w-[400px] md:w-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden"
            initial={{ x: -50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🖼️</span> My Media Gallery
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Drag and drop assets to your canvas</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search your uploads and generations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-zinc-900 dark:text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-zinc-500 space-y-2">
                  <div className="text-4xl opacity-20">📂</div>
                  <p className="text-sm">No media found.</p>
                  <p className="text-xs text-zinc-400">Upload images or run a workflow to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredFiles.map((file: any) => {
                     // Construct item for drag-and-drop
                     const item = {
                         name: file.name || 'Media',
                         type: 'image', 
                         icon: '🖼️',
                         category: 'My Media',
                         brand: 'User',
                         logo: file.url // Important: URL for the image node
                     };
                     
                     return (
                      <motion.div
                        key={file._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-yellow-400 dark:hover:border-yellow-400 shadow-sm hover:shadow-lg transition-all"
                        draggable
                        onDragStart={(e) => onDragStart(e, item)}
                      >
                        {/* Image */}
                        {file.url ? (
                            <Image 
                              src={file.url} 
                              alt="Media" 
                              fill 
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                ?
                            </div>
                        )}

                        {/* Overlay Info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                           <p className="text-[10px] font-medium text-white truncate">{file.name || 'Untitled'}</p>
                           <p className="text-[9px] text-zinc-300">{new Date(file.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        {/* Type Badge */}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded px-1.5 py-0.5 text-[9px] text-white font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            IMG
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

