import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../lib/convex/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import DashboardHeader from '../../components/Layout/DashboardHeader';
import { format } from 'date-fns'; // You might need to install date-fns if not available, or use intl

export default function CreditsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const userCredits = useQuery(api.users.getCredits);
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
          successUrl: window.location.href + '?success=true',
          cancelUrl: window.location.href + '?canceled=true',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL returned', data);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white">
        {/* Re-use the main dashboard header which now shows credits */}
        <DashboardHeader onCreateNew={() => router.push('/editor')} />

      <div className="max-w-5xl mx-auto pt-12 px-6 pb-24">
        
        <div className="mb-10">
             <h1 className="text-3xl font-bold mb-2">Credit Balance</h1>
             <div className="text-5xl font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                {userCredits !== undefined ? userCredits.toLocaleString() : '...'}
             </div>
             <p className="text-zinc-500 mt-2">
                Credits are used to run AI models. Each model has a different cost per run.
             </p>
        </div>

        <h2 className="text-xl font-semibold mb-6">Top Up</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {creditPackages.map((pkg) => (
            <div key={pkg.credits} className="relative overflow-hidden p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-orange-400/50 transition-all group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-500 dark:text-zinc-400 mb-2">{pkg.label}</h3>
              <div className="text-3xl font-bold mb-6">
                {pkg.credits.toLocaleString()} <span className="text-sm font-normal text-zinc-500">credits</span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-semibold">${pkg.price}</div>
                  <button 
                    onClick={() => handleBuy(pkg)}
                    disabled={loadingPriceId === pkg.priceId}
                    className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {loadingPriceId === pkg.priceId ? 'Loading...' : 'Buy Now'}
                  </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
            {!transactions ? (
                <div className="p-8 text-center text-zinc-500">Loading history...</div>
            ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No transactions yet.</div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {transactions.map((tx) => (
                            <tr key={tx._id} className="bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-500">
                                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                                    {tx.description || 'Transaction'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                        ${tx.type === 'credit_purchase' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                          tx.type === 'run_cost' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' :
                                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {tx.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-medium ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
}
