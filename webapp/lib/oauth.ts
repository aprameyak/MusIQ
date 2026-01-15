import { apiClient } from './api';

export const initGoogleAuth = () => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  return new Promise<void>((resolve) => {
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        });
      }
      resolve();
    };
  });
};

const handleGoogleCallback = async (response: any) => {
  try {
    const credential = response.credential;
    
    if (!credential) {
      console.error('No credential received from Google');
      return;
    }
    
    const result = await apiClient.oauthGoogle(credential);
    
    if (result.success && result.data) {
      apiClient.setTokens(result.data);
      window.location.href = '/';
    } else {
      console.error('Google OAuth failed:', result.error);
      alert(result.error?.message || 'Google authentication failed');
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    alert('An error occurred during Google authentication');
  }
};

export const triggerGoogleSignIn = () => {
  if (typeof window === 'undefined' || !window.google) {
    alert('Google Sign-In is not available. Please check your configuration.');
    return;
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    alert('Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
    return;
  }

  try {
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile',
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                const result = await apiClient.oauthGoogle(response.access_token);
                if (result.success && result.data) {
                  apiClient.setTokens(result.data);
                  window.location.href = '/';
                } else {
                  alert(result.error?.message || 'Google authentication failed');
                }
              } catch (error) {
                console.error('Error during Google OAuth:', error);
                alert('An error occurred during authentication');
              }
            }
          },
        });
        client.requestAccessToken();
      }
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    alert('Failed to initialize Google Sign-In');
  }
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}
