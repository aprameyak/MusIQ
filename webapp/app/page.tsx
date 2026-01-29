'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash) {
      router.replace('/auth' + window.location.hash);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-black text-textPrimary mb-4 tracking-tighter">MusIQ</h1>
        <p className="text-textSecondary text-xl font-medium mb-12">
          The global music rating platform.
        </p>

        <div className="bg-card rounded-3xl p-10 shadow-2xl border border-border mb-12 transform hover:scale-[1.02] transition-transform duration-300">
          <p className="text-textPrimary font-bold text-2xl mb-4">
            Listen, Rate, Rank.
          </p>
          <p className="text-textSecondary text-lg mb-10 leading-relaxed">
            Please use the <strong>MusIQ iOS app</strong> to access your dashboard, rate music, and see global rankings.
          </p>
        </div>

        <div className="flex gap-8 justify-center items-center">
          <Link href="/support" className="text-textSecondary hover:text-primary transition font-bold text-sm uppercase tracking-widest">
            Support
          </Link>
          <div className="w-1.5 h-1.5 bg-border rounded-full" />
          <Link href="/privacy" className="text-textSecondary hover:text-primary transition font-bold text-sm uppercase tracking-widest">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
