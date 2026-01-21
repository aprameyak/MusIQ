'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const error = searchParams.get('error');

    let title = 'Action Successful';
    let message = 'Your request has been processed.';

    if (error) {
        title = 'Error';
        message = error;
    } else if (type === 'signup') {
        title = 'Email Verified!';
        message = 'Your email has been successfully verified.';
    } else if (type === 'email_change') {
        title = 'Email Updated!';
        message = 'Your email address has been successfully updated.';
    }

    return (
        <div className="bg-card rounded-lg p-8 shadow-sm border border-border text-center">
            <h2 className={`text-2xl font-bold mb-4 ${error ? 'text-red-600' : 'text-green-600'}`}>
                {title}
            </h2>
            <p className="text-textSecondary mb-6">{message}</p>
            <p className="text-textPrimary font-medium">Please return to the MusIQ iOS app.</p>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-textPrimary mb-2">MusIQ</h1>
                </div>
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <CallbackContent />
                </Suspense>
            </div>
        </div>
    );
}
