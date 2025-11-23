"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Input, Tab, Tabs } from '@heroui/react';
import type { PaletteItem } from './types';

type SidebarItem = PaletteItem;

interface SidebarProps {
  isOpen: boolean;
  models: Array<SidebarItem>;
  tools: Array<SidebarItem>;
  onAddNode: (type: string, label: string, logo?: string) => void;
  onActiveCategoryChange?: (category: string) => void;
  scrollToCategory?: string;
  onConsumeScrollToCategory?: () => void;
  focusSearchSignal?: number;
  onSearchRequested?: () => void;
  externalActiveTab?: 'models' | 'tools';
}

export default function Sidebar({ isOpen, models, tools, onAddNode, onActiveCategoryChange, scrollToCategory, onConsumeScrollToCategory, focusSearchSignal, externalActiveTab }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('models');
  const [draggedItem, setDraggedItem] = useState<SidebarItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const items = activeTab === 'models' ? models : tools;
  
  // Brand → domain mapping to fetch logos via Clearbit when an explicit logo isn't provided.
  const brandDomain: Record<string, string> = {
    'OpenAI': 'openai.com',
    'Google': 'google.com',
    'Runway': 'runwayml.com',
    'Luma': 'luma.ai',
    'Stability': 'stability.ai',
    'Ideogram': 'ideogram.ai',
    'Bria': 'bria.ai',
    'Topaz': 'topazlabs.com',
    'Flux': 'blackforestlabs.ai',
    'Black Forest Labs': 'blackforestlabs.ai',
    'Pixverse': 'pixverse.ai',
    'Meshy': 'meshy.ai',
    'Trellis': 'trellis.xyz',
    'Kling': 'klingai.com',
    'Omnihuman': 'tencent.com',
    'Hunyuan': 'tencent.com',
    'Recraft': 'recraft.ai',
    'Mystic': 'mystic.ai',
    'Reve': 'reve.ai',
    'Higgsfield': 'higgsfield.ai',
    'Nano': 'nanonets.com',
    'Minimax': 'minimax.ai',
    'Rodin': 'hyperhuman.deemos.com',
    'Seedream': 'seedream.ai',
    'Wan': 'wan.ai',
    'Sync': 'sync.labs',
    'Kolors': 'kolors.ai',
    'Dream': 'dream.ai',
    'Clarity': 'clarity.ai',
    'ESRGAN': 'github.com',
  };

  // Optional Simple Icons fallback when Clearbit is missing
  const brandSimpleIconsSlug: Record<string, string> = {
    'OpenAI': 'openai',
    'Google': 'google',
    'Runway': 'runwayml',
    'Luma': 'luma',
    'Stability': 'stabilityai',
    'Ideogram': 'ideogram',
    'Topaz': 'topazlabs',
    'Flux': 'blackforestlabs',
    'Minimax': 'minimax',
    'Recraft': 'recraft',
    'Pixverse': 'pixverse',
    'Meshy': 'meshy',
    'Trellis': 'trellis',
    'Kling': 'klingai',
    'Bria': 'bria',
    'ESRGAN': 'github',
    'Midjourney': 'midjourney',
  };
  
  const noFrameBrands = new Set(['Google', 'Stability', 'OpenAI', 'Flux', 'Black Forest Labs']);
  
  // Filter by category and search
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const filteredByCategory = categories.map((cat) => ({
    category: cat,
    items: items.filter((item) => item.category === cat && 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  useEffect(() => {
    if (focusSearchSignal) {
      // try to focus the search input when requested
      const input = document.querySelector('input[aria-label="Search models and tools"]') as HTMLInputElement | null;
      input?.focus();
    }
  }, [focusSearchSignal]);

  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible in the top detection zone
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        
        // Sort by top position. The first one is the one highest up in the detection zone.
        // Since we use a narrow rootMargin at the top, this should effectively correspond to the "sticky header" logic.
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        
        const next = visible[0]?.target.getAttribute('data-category');
        if (next && onActiveCategoryChange) {
          onActiveCategoryChange(next);
        }
      },
      // Constrain detection to a strip near the top of the container (top 5% to 30% down)
      // This ensures we highlight the section that is actually at the top of the view.
      { root: container, rootMargin: '-5% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeTab, searchQuery, items.length, onActiveCategoryChange]);

  const handleCategoryClick = (category: string) => {
    const container = scrollContainerRef.current;
    const section = sectionRefs.current[category];
    if (!container || !section) return;
    
    // Robust scroll calculation using getBoundingClientRect
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const currentScroll = container.scrollTop;
    
    // Calculate target scroll position relative to container
    // Add slight offset to align flush (taking into account padding if necessary)
    const relativeTop = sectionRect.top - containerRect.top;
    const top = currentScroll + relativeTop;
    
    container.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!scrollToCategory) return;
    // Determine which tab contains the requested category
    const modelCats = Array.from(new Set(models.map((i) => i.category)));
    const toolCats = Array.from(new Set(tools.map((i) => i.category)));
    const targetTab = toolCats.includes(scrollToCategory)
      ? 'tools'
      : modelCats.includes(scrollToCategory)
        ? 'models'
        : activeTab;

    // If tab needs to change, switch first and then scroll after render
    if (targetTab !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(targetTab);
      // Wait for the tab content to render sections, then scroll
      requestAnimationFrame(() => {
        setTimeout(() => handleCategoryClick(scrollToCategory), 0);
      });
    } else {
      handleCategoryClick(scrollToCategory);
    }
    if (onConsumeScrollToCategory) onConsumeScrollToCategory();
  }, [scrollToCategory, activeTab, models, tools, onConsumeScrollToCategory]);

  const handleDragStart = (e: React.DragEvent, item: SidebarItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: item.type,
      label: item.name,
    }));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (stops at editor navbar height on mobile) */}
          <motion.div
            className="fixed top-14 left-0 right-0 bottom-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-14 bottom-0 left-16 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-30"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">AI Models & Tools</h2>
                <a href="/dashboard" className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Back to Home">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </a>
              </div>
              <Input
                isClearable
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="text-sm"
                size="sm"
                autoFocus={false}
                aria-label="Search models and tools"
              />
            </div>

            {/* Tabs */}
            <Tabs
              aria-label="Options"
              selectedKey={activeTab}
              // HeroUI types are generic over Selection and Key; adapt to string state
              onSelectionChange={(key) => setActiveTab(String(key))}
              size="sm"
              className="px-4 pt-2"
            >
              <Tab key="models" title="🧠 Models" />
              <Tab key="tools" title="🛠️ Tools" />
            </Tabs>

            {/* Category Pills removed as requested */}
            <div className="h-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-900" />

            {/* Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              {filteredByCategory.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  No {activeTab} found
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredByCategory.map((group) => (
                    <div
                      key={group.category}
                      ref={(el) => { sectionRefs.current[group.category] = el; }}
                      data-category={group.category}
                    >
                      <h3 className="text-xs font-bold text-yellow-500 dark:text-yellow-400 mb-2 uppercase tracking-wider">
                        {group.category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item) => {
                          const googleColor = 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png';
                          const clearbit = brandDomain[item.brand] ? `https://logo.clearbit.com/${brandDomain[item.brand]}` : undefined;
                          const simpleIcon = brandSimpleIconsSlug[item.brand] ? `https://cdn.simpleicons.org/${brandSimpleIconsSlug[item.brand]}/ffffff` : undefined;
                          const inferredLogo = item.brand === 'Google' ? googleColor : (item.logo || clearbit || simpleIcon);
                          const baseClass = noFrameBrands.has(item.brand) ? 'w-8 h-8 object-contain mx-auto' : 'w-8 h-8 object-contain rounded-sm bg-white/5 border border-white/10 mx-auto';

                          return (
                          <motion.div
                            key={item.name}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-full"
                          >
                        <div
                          role="button"
                          tabIndex={0}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onAddNode(item.type, item.name, inferredLogo)}
                          className={`cursor-move h-full flex flex-col ${draggedItem?.name === item.name ? 'opacity-50' : ''}`}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAddNode(item.type, item.name, inferredLogo); }}
                        >
                        <Card className="bg-white dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-yellow-400/50 transition-all overflow-hidden h-full">
                          <CardBody className="relative p-3 gap-2 flex flex-col items-center justify-between text-center overflow-hidden h-full">
                            {/* Logo or emoji icon */}
                            <div className="flex items-center justify-center">
                              {inferredLogo ? (
                                  <img
                                    src={inferredLogo}
                                    alt={item.brand}
                                    className={baseClass}
                                    onError={(e) => {
                                      const img = e.currentTarget as HTMLImageElement;
                                      if (img.src.includes('logo.clearbit.com') && simpleIcon) {
                                        img.src = simpleIcon;
                                        return;
                                      }
                                      img.hidden = true;
                                      const parent = img.parentElement;
                                      if (parent) {
                                        const fallback = parent.querySelector('[data-fallback-icon="true"]') as HTMLElement | null;
                                        if (fallback) fallback.style.display = 'block';
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="text-3xl" aria-hidden>
                                    {item.icon}
                                  </div>
                                )
                              }
                              <div data-fallback-icon="true" className="text-3xl hidden" aria-hidden>
                                {item.icon}
                              </div>
                            </div>
                            
                            {/* Name & Brand only */}
                            <div className="flex flex-col items-center justify-center w-full">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-white text-center whitespace-normal break-words line-clamp-2">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {item.brand}
                              </p>
                            </div>
                            
                            {/* Drag hint */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded">
                              <span className="text-xs text-white font-semibold">Drag to canvas</span>
                            </div>
                          </CardBody>
                        </Card>
                        </div>
                          </motion.div>
                        );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint only (login avatar moved to top bar) */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 flex items-center justify-center">
              <p className="text-[11px] text-zinc-500">Drag to canvas or click to add</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
