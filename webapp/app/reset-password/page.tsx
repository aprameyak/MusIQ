'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

    const code = searchParams.get('code');

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

        if (!code) {
            setError('Reset code is missing. Please request a new link.');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.resetPasswordWithCode(code, password);
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

    if (success) {
        return (
            <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-500 mb-4 text-center">Password Updated!</h2>
                <p className="text-textSecondary mb-8 text-lg">Your password has been changed successfully.</p>
                <p className="text-textPrimary font-bold text-xl">Please open the MusIQ iOS app to sign in.</p>
            </div>
        );
    }

    if (!code) {
        return (
            <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Link Invalid</h2>
                <p className="text-textSecondary mb-8">This password reset link is invalid or expired.</p>
                <a href="/auth" className="text-primary hover:underline font-bold">Request a new link</a>
            </div>
        );
    }

    return (
        <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border">
            <h2 className="text-2xl font-bold text-textPrimary mb-2 text-center">New Password</h2>
            <p className="text-textSecondary text-center mb-8">Set a new password for your MusIQ account.</p>

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
                        placeholder="Min 8 characters"
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
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 text-foreground">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-textPrimary mb-2 tracking-tighter">MusIQ</h1>
                </div>
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
