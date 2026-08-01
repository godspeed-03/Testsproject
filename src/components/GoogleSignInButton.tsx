'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '845893107647-hj6kv9acb6oge2ej4citu5jglft4e0uq.apps.googleusercontent.com';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function GoogleSignInButton({ text = 'signin_with' }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Google Identity Services Script
    const scriptId = 'google-jssdk';
    if (document.getElementById(scriptId)) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      setError('Failed to load Google Sign-In script');
    };
    document.body.appendChild(script);
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google Authentication failed');
      }

      router.push('/tracker');
      router.refresh();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const parent = document.getElementById('googleSignInBtnDiv');
        if (parent) {
          parent.innerHTML = '';
          (window as any).google.accounts.id.renderButton(parent, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: text,
            logo_alignment: 'left',
            width: 320
          });
          setSdkLoaded(true);
        }
      } catch (err) {
        console.error('Failed to initialize GIS:', err);
      }
    }
  };

  const handleOAuthRedirect = () => {
    setLoading(true);
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&prompt=select_account`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {error && (
        <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="w-full max-w-[320px] h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-semibold animate-pulse">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          <span>Signing in with Google...</span>
        </div>
      ) : (
        <>
          {/* Container rendered by Google Identity SDK */}
          <div id="googleSignInBtnDiv" className="flex justify-center min-h-[44px]"></div>

          {/* Render fallback button ONLY if SDK failed to mount */}
          {!sdkLoaded && (
            <button
              type="button"
              onClick={handleOAuthRedirect}
              className="w-full max-w-[320px] h-11 px-5 rounded-full bg-white text-slate-800 hover:bg-slate-50 font-bold text-sm flex items-center justify-center gap-3 shadow-sm border border-slate-300 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
