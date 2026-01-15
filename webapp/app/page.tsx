'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setIsAuthenticated(true);
            setUser(response.data);
          } else {
            setIsAuthenticated(false);
            apiClient.clearTokens();
            router.push('/auth');
          }
        } catch (error) {
          setIsAuthenticated(false);
          apiClient.clearTokens();
          router.push('/auth');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const refreshToken = apiClient.getRefreshToken();
    if (refreshToken) {
      await apiClient.logout(refreshToken);
    }
    apiClient.clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-textSecondary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-textSecondary">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Welcome back!</h1>
            <p className="text-textSecondary">
              {user?.username || 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-textSecondary hover:text-textPrimary border border-border rounded-lg hover:bg-secondaryBg transition"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          <h2 className="text-2xl font-semibold text-textPrimary mb-4">Your Dashboard</h2>
          <p className="text-textSecondary leading-relaxed">
            Start rating music and discover new sounds. Your ratings help shape global music rankings.
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/support"
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90 transition"
          >
            Support
          </Link>
          <Link
            href="/privacy"
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90 transition"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
