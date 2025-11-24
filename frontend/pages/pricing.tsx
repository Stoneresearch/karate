import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingHeader from '../components/Layout/LandingHeader';
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { Loader } from '../components/ui/Loader';

// Credit packages mapped from existing credits.tsx
const CREDIT_PACKAGES = [
  { 
    credits: 100, 
    price: 5, 
    name: 'Starter', 
    priceId: 'price_1SWPyR2OgbFGwq9Cdws03Jo1',
    description: 'Great for trying out various models.',
    features: [
      '100 Credits',
      'Access to standard models',
      'Public workflows',
      'Community support'
    ],
    popular: false
  },
  { 
    credits: 500, 
    price: 20, 
    name: 'Creator', 
    priceId: 'price_1SWPz42OgbFGwq9C2XYA8rFq',
    description: 'Enough power for regular daily usage.',
    features: [
      '500 Credits',
      'Access to all models',
      'Private workflows',
      'Priority queue',
      'Commercial usage'
    ],
    popular: true
  },
  { 
    credits: 2000, 
    price: 70, 
    name: 'Pro', 
    priceId: 'price_1SWPzR2OgbFGwq9CCrKExqbQ',
    description: 'For heavy users and professionals.',
    features: [
      '2000 Credits',
      'Highest priority',
      'API Access',
      'Dedicated support',
      'Custom fine-tuning'
    ],
    popular: false
  },
];

export default function Pricing() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleBuy = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      openSignIn();
      return;
    }
    
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
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white overflow-hidden relative">
      <LandingHeader isScrolled={true} />
      
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
          >
             <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
               Flexible Credit Packs
             </h1>
             <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-16 max-w-2xl mx-auto leading-relaxed">
               No monthly commitments. Purchase credits as you need them and unlock the full power of generative AI.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
            {CREDIT_PACKAGES.map((plan, idx) => {
              const isHovered = hoveredPlan === plan.name;
              const isLoading = loadingPriceId === plan.priceId;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setHoveredPlan(plan.name)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 group ${
                    plan.popular 
                      ? 'border-yellow-400/50 bg-zinc-900/5 dark:bg-yellow-900/10 ring-1 ring-yellow-400/20' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Glow Effect on Hover */}
                  <div 
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : ''}`} 
                  />

                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-yellow-400/20">
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wider mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                            <span className="text-zinc-500 font-medium">USD</span>
                        </div>
                        <div className="mt-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 w-fit text-xs font-medium text-zinc-500">
                           {plan.credits} Credits
                        </div>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-yellow-400/20 text-yellow-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                          </div>
                          <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleBuy(plan)}
                      disabled={!!loadingPriceId}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
                        plan.popular
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black hover:shadow-yellow-400/30 hover:brightness-110'
                          : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader size="sm" variant="dots" color={plan.popular ? "black" : "current"} />
                            <span>Processing...</span>
                        </div>
                      ) : (
                        "Purchase Credits"
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50"
          >
              <h3 className="text-lg font-bold mb-4">Need a custom Enterprise plan?</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-6">
                  For large teams and high-volume API access, we offer custom pricing, dedicated support, and fine-tuned models.
              </p>
              <a href="mailto:sales@karate.ai" className="text-sm font-semibold text-zinc-900 dark:text-white border-b border-zinc-300 hover:border-black dark:hover:border-white transition-colors pb-0.5">
                  Contact Sales &rarr;
              </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
