import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Input, Tab, Tabs, ScrollShadow } from '@heroui/react';

interface SidebarItem {
  name: string;
  type: string;
  icon: string;
  symbol?: string; // deprecated visual badge (no longer displayed)
  category: string;
  brand: string;
  logo?: string; // optional explicit logo URL
}

interface SidebarProps {
  isOpen: boolean;
  models: Array<SidebarItem>;
  tools: Array<SidebarItem>;
  onAddNode: (type: string, label: string) => void;
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
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
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
  };
  const noFrameBrands = new Set(['Google']);
  
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
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const next = visible[0]?.target.getAttribute('data-category');
        if (next) {
          setActiveCategory(next);
          if (onActiveCategoryChange) onActiveCategoryChange(next);
        }
      },
      { root: container, threshold: 0.15 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeTab, searchQuery, items.length, onActiveCategoryChange]);

  useEffect(() => {
    if (!scrollToCategory) return;
    handleCategoryClick(scrollToCategory);
    if (onConsumeScrollToCategory) onConsumeScrollToCategory();
  }, [scrollToCategory]);

  const handleCategoryClick = (category: string) => {
    const container = scrollContainerRef.current;
    const section = sectionRefs.current[category];
    if (!container || !section) return;
    const headerHeight = ((container.firstElementChild as HTMLElement | null)?.clientHeight) ?? 0;
    const top = section.offsetTop - headerHeight;
    container.scrollTo({ top, behavior: 'smooth' });
  };

  const handleDragStart = (e: React.DragEvent, item: any) => {
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed md:relative w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col z-30 md:z-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white mb-3">AI Models & Tools</h2>
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
              onSelectionChange={setActiveTab as any}
              size="sm"
              className="px-4 pt-2"
            >
              <Tab key="models" title="🧠 Models" />
              <Tab key="tools" title="🛠️ Tools" />
            </Tabs>

            {/* Category Pills removed as requested */}
            <div className="h-2 bg-zinc-900 border-b border-zinc-900" />

            {/* Content */}
            <ScrollShadow ref={scrollContainerRef as any} className="flex-1 overflow-y-auto">
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
                      <h3 className="text-xs font-bold text-yellow-400 mb-2 uppercase tracking-wider">
                        {group.category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <motion.div
                            key={item.name}
                            draggable
                            onDragStart={(e) => handleDragStart(e as any, item)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onAddNode(item.type, item.name)}
                            className={`cursor-move ${
                              draggedItem?.name === item.name ? 'opacity-50' : ''
                            }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                        <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 hover:border-yellow-400/50 transition-all">
                          <CardBody className="relative p-3 gap-2 flex flex-col items-center text-center">
                            {/* Logo or emoji icon */}
                            <div className="flex items-center justify-center">
                              {(() => {
                                const googleColor = 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png';
                                const clearbit = brandDomain[item.brand] ? `https://logo.clearbit.com/${brandDomain[item.brand]}` : undefined;
                                const simpleIcon = brandSimpleIconsSlug[item.brand] ? `https://cdn.simpleicons.org/${brandSimpleIconsSlug[item.brand]}/ffffff` : undefined;
                                const inferredLogo = item.brand === 'Google' ? googleColor : (item.logo || clearbit || simpleIcon);
                                const baseClass = noFrameBrands.has(item.brand) ? 'w-8 h-8 object-contain mx-auto' : 'w-8 h-8 object-contain rounded-sm bg-white/5 border border-white/10 mx-auto';
                                return inferredLogo ? (
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
                                ) : null;
                              })()}
                              <div data-fallback-icon="true" className="text-3xl hidden" aria-hidden>
                                {item.icon}
                              </div>
                            </div>
                            
                            {/* Name & Brand only */}
                            <p className="text-xs font-semibold text-white line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {item.brand}
                            </p>
                            
                            {/* Drag hint */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded">
                              <span className="text-xs text-white font-semibold">Drag to canvas</span>
                            </div>
                          </CardBody>
                        </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollShadow>

            {/* Footer: avatar (bottom-left) + hint */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                  U
                </div>
                <span className="text-xs text-zinc-400">Login</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Drag to canvas or click to add
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
