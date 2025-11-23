import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import LandingHeader from '../components/Layout/LandingHeader';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';

export default function Pricing() {
  const { user } = useUser();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Hobby',
      price: billingInterval === 'monthly' ? '0' : '0',
      description: 'Perfect for exploring AI generation.',
      features: [
        '10 Free Credits / Month',
        'Access to standard models',
        'Public workflows only',
        'Community support',
      ],
      cta: 'Start for Free',
      href: '/dashboard',
    },
    {
      name: 'Pro',
      price: billingInterval === 'monthly' ? '29' : '24',
      description: 'For power users and creators.',
      popular: true,
      features: [
        '1000 Credits / Month',
        'Access to Pro models (Flux, Sora)',
        'Private workflows',
        'Priority generation queue',
        'Commercial usage rights',
      ],
      cta: 'Upgrade to Pro',
      href: '/dashboard/credits',
    },
    {
      name: 'Team',
      price: billingInterval === 'monthly' ? '99' : '79',
      description: 'Collaborate on complex workflows.',
      features: [
        '5000 Credits / Month',
        'Shared workspace & roles',
        'API Access',
        'Dedicated support',
        'Custom model fine-tuning',
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@karate.ai',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <LandingHeader isScrolled={true} />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
            Start for free, scale as you create. Pay only for the compute you use.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-colors focus:outline-none"
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{ x: billingInterval === 'monthly' ? 0 : 24 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
              Yearly <span className="text-green-500 text-xs ml-1 font-bold">(Save 20%)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular 
                    ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-zinc-500 text-sm">/mo</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 h-10">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href={plan.href}
                  className={`block w-full py-3 px-4 rounded-lg text-center font-bold transition-transform active:scale-95 ${
                    plan.popular
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-90'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

