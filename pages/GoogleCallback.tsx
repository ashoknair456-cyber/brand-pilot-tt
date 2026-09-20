import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import GoogleIcon from '../components/GoogleIcon';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogleCode } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check for error in query params from Google
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (errorParam) {
        setStatus('error');
        setErrorMessage(errorDescription || (errorParam === 'access_denied' ? 'Google authentication was cancelled by the user.' : `Google OAuth error: ${errorParam}`));
        return;
      }

      // 2. Check for token passed from backend redirect
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        try {
          localStorage.setItem('token', tokenParam);
          const userParam = searchParams.get('user');
          if (userParam) {
            localStorage.setItem('brandpilot_session', decodeURIComponent(userParam));
          }
          setStatus('success');
          setTimeout(() => navigate('/', { replace: true }), 1200);
          return;
        } catch (e: any) {
          setStatus('error');
          setErrorMessage(e.message || 'Failed to save authentication session.');
          return;
        }
      }

      // 3. Check for authorization code from Google
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code or session token received from Google.');
        return;
      }

      try {
        const redirectUri = window.location.origin + window.location.pathname;
        await loginWithGoogleCode(code, redirectUri);
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 1000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete Google authentication with server.');
      }
    };

    handleCallback();
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 text-slate-200">
      <ThreeBackground mode="constellation" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-700/50 backdrop-blur-xl text-center">
          
          <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center border border-slate-700 mx-auto mb-6 shadow-inner">
            <GoogleIcon className="w-8 h-8" />
          </div>

          {status === 'loading' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-tech text-white">Authenticating with Google...</h2>
              <p className="text-slate-400 text-sm">Verifying your Google identity credentials with Central Intelligence.</p>
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-tech text-white">Authentication Verified</h2>
              <p className="text-slate-400 text-sm">Welcome! Redirecting you into your command center...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-tech text-white mb-2">Authentication Failed</h2>
                <p className="text-red-300 text-xs bg-red-950/40 border border-red-800/60 rounded-xl p-3 text-left font-mono">
                  {errorMessage}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="py-3 px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  Return to Login <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signup"
                  className="py-2.5 px-4 text-slate-400 hover:text-white text-xs transition-colors"
                >
                  Create an account instead
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
