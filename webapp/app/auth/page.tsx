'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, SignupData, LoginData } from '@/lib/api';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (await apiClient.isAuthenticated()) {
        router.push('/');
        return;
      }
    };
    checkAuth();
  }, [router]);

  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8 || pwd.length > 128) {
      errors.push('Password must be between 8 and 128 characters');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[@$!%*?&]/.test(pwd)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    return errors;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordErrors([]);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const pwdErrors = validatePassword(password);
        if (pwdErrors.length > 0) {
          setPasswordErrors(pwdErrors);
          setError('Please fix password requirements');
          setLoading(false);
          return;
        }

        if (username.length < 3 || username.length > 30) {
          setError('Username must be between 3 and 30 characters');
          setLoading(false);
          return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setError('Username can only contain letters, numbers, and underscores');
          setLoading(false);
          return;
        }

        const signupData: SignupData = {
          username,
          password,
          confirmPassword,
        };

        const response = await apiClient.signup(signupData);

        if (response.success && response.data) {
          apiClient.setTokens(response.data);
          router.push('/');
        } else {
          setError(response.error?.message || 'Sign up failed');
        }
      } else {
        const loginData: LoginData = {
          username,
          password,
        };

        const response = await apiClient.login(loginData);

        if (response.success && response.data) {
          apiClient.setTokens(response.data);
          router.push('/');
        } else {
          setError(response.error?.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">MusIQ</h1>
          <p className="text-textSecondary">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-textPrimary mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={mode === 'signup' ? 'Choose a username (3-30 chars)' : 'Enter your username'}
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-textSecondary">
                  Letters, numbers, and underscores only
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (mode === 'signup') {
                    setPasswordErrors(validatePassword(e.target.value));
                  }
                }}
                required
                minLength={8}
                maxLength={128}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
              />
              {mode === 'signup' && passwordErrors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {mode === 'signup' && password.length > 0 && passwordErrors.length === 0 && (
                <p className="mt-1 text-xs text-green-600">✓ Password meets all requirements</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-textPrimary mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setPassword('');
                setConfirmPassword('');
                setPasswordErrors([]);
                setUsername('');
              }}
              className="text-sm text-primary hover:underline"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-textSecondary">
          <p>
            By continuing, you agree to MusIQ's{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
