import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../lib/convex/api';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'general' | 'billing';
}

export default function SettingsPanel({ isOpen, onClose, defaultTab = 'general' }: SettingsPanelProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>(defaultTab);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Pass empty object for optional args to avoid TS errors if strict
  const userCredits = useQuery(api.users.getCredits, {});
  const transactions = useQuery(api.transactions.list);

  const creditPackages = [
    { credits: 100, price: 5, label: 'Starter', priceId: 'price_1SWPyR2OgbFGwq9Cdws03Jo1' },
    { credits: 500, price: 20, label: 'Creator', priceId: 'price_1SWPz42OgbFGwq9C2XYA8rFq' },
    { credits: 2000, price: 70, label: 'Pro', priceId: 'price_1SWPzR2OgbFGwq9CCrKExqbQ' },
  ];

  const handleBuy = async (pkg: typeof creditPackages[0]) => {
    if (!user) return;
    setLoadingPriceId(pkg.priceId);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: pkg.priceId,
          credits: pkg.credits,
          quantity: 1,
          successUrl: window.location.href.split('?')[0] + '?success=true',
          cancelUrl: window.location.href.split('?')[0] + '?canceled=true',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout');
      }
    } catch (err) {
      console.error(err);
      alert('Error starting checkout');
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-16 top-0 bottom-0 w-[400px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'billing' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  Billing
                </button>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Profile</h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      {user?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.imageUrl} alt="Profile" className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                      )}
                      <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user?.fullName || 'User'}</div>
                          <div className="text-xs text-zinc-500 truncate">{user?.primaryEmailAddress?.emailAddress}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => openUserProfile()}
                      className="w-full py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Manage Account
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Preferences</h3>
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dark Mode</span>
                        <span className="text-xs text-zinc-500">Managed by System</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notifications</span>
                        <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full relative">
                          <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  <div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Balance</div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 text-white shadow-lg">
                        <div className="text-sm opacity-70 mb-1">Available Credits</div>
                        <div className="text-3xl font-mono font-bold text-yellow-400">
                            {userCredits !== undefined ? userCredits.toLocaleString() : '---'}
                        </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Top Up</div>
                    <div className="space-y-2">
                        {creditPackages.map(pkg => (
                            <button
                                key={pkg.priceId}
                                onClick={() => handleBuy(pkg)}
                                disabled={loadingPriceId === pkg.priceId}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-yellow-400 dark:hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group text-left"
                            >
                                <div>
                                    <div className="font-medium text-sm">{pkg.label}</div>
                                    <div className="text-xs text-zinc-500">{pkg.credits.toLocaleString()} credits</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-semibold text-sm">${pkg.price}</div>
                                    {loadingPriceId === pkg.priceId ? (
                                        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Recent History</div>
                    <div className="space-y-2">
                        {transactions ? (
                            transactions.length === 0 ? (
                                <div className="text-xs text-zinc-400 italic">No transactions yet</div>
                            ) : (
                                transactions.slice(0, 5).map(tx => (
                                    <div key={tx._id} className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[150px]">{tx.description}</span>
                                            <span className="text-zinc-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`font-mono ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-500'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </div>
                                ))
                            )
                        ) : (
                            <div className="text-xs text-zinc-400 animate-pulse">Loading...</div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <button 
                    onClick={() => signOut()}
                    className="w-full py-2 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors text-xs font-medium"
                >
                    Sign Out
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
