'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

function ResetPasswordModal({ tokens, onClose }: { tokens: { access_token: string, refresh_token: string }, onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (tokens.access_token && tokens.refresh_token) {
      apiClient.setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    }
  }, [tokens]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8 || pwd.length > 128) errors.push('8-128 characters');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/\d/.test(pwd)) errors.push('One number');
    if (!/[@$!%*?&]/.test(pwd)) errors.push('One special char (@$!%*?&)');
    return errors;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors);
      setError('Please meet all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.updatePassword(password);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error?.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
        {success ? (
          <div className="text-center py-4">
            <h2 className="text-3xl font-bold text-green-500 mb-4">Password Updated!</h2>
            <p className="text-textSecondary mb-8 text-lg">Your password has been changed successfully.</p>
            <p className="text-textPrimary font-bold text-xl mb-6">Please open the MusIQ iOS app to sign in.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-secondary text-white rounded-xl hover:opacity-90 transition font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">Setup New Password</h2>
              <button onClick={onClose} className="text-textSecondary hover:text-textPrimary text-2xl">&times;</button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordErrors(validatePassword(e.target.value));
                  }}
                  required
                  className="w-full px-5 py-4 bg-secondaryBg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-lg"
                  placeholder="Create a strong password"
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-3 text-xs text-red-400 grid grid-cols-2 gap-1">
                    {passwordErrors.map((err, i) => <span key={i}>• {err}</span>)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-secondaryBg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-lg"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg shadow-primary/20"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [recoveryTokens, setRecoveryTokens] = useState<{ access_token: string, refresh_token: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleHashAndParams = () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        if (params.get('type') === 'recovery') {
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            setRecoveryTokens({ access_token, refresh_token });
            return;
          }
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('type') === 'recovery' && searchParams.get('code')) {
        router.push('/reset-password' + window.location.search);
      }
    };
    handleHashAndParams();
  }, [router]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.forgotPassword(email);
      if (response.success) {
        setResetSent(true);
      } else {
        setError(response.error?.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {recoveryTokens && (
        <ResetPasswordModal
          tokens={recoveryTokens}
          onClose={() => {
            setRecoveryTokens(null);
            window.location.hash = '';
          }}
        />
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-textPrimary mb-2 tracking-tighter">MusIQ</h1>
          <p className="text-textSecondary font-medium">Account Support</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          {resetSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-textPrimary mb-2">Check your email</p>
              <p className="text-textSecondary mb-8">
                We've sent a recovery link to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setResetSent(false)}
                className="w-full py-3 text-primary hover:bg-primary/5 rounded-xl transition font-bold"
              >
                Send another link
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-textPrimary mb-2 text-center">Forgot Password?</h2>
              <p className="text-textSecondary text-center mb-8">Enter your email and we'll send you a link to reset your password.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-textPrimary mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-secondaryBg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-lg"
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg shadow-primary/10"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-textSecondary mb-4">Need help? Contact <a href="/support" className="text-primary hover:underline">Support</a></p>
          <div className="p-6 bg-secondaryBg/50 rounded-2xl border border-border">
            <p className="text-sm text-textSecondary">
              To sign in or create an account, please use the <strong>MusIQ iOS App</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
