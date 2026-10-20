import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Rocket, Loader2, ArrowRight } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import GoogleIcon from '../components/GoogleIcon';
import { useGoogleLogin } from '@react-oauth/google';

export const Login: React.FC = () => {
  const { login, loginWithGoogleToken, loginWithGoogleCode, getGoogleAuthUrl, isAuthenticated, isVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated and verified, redirect away
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isVerified, navigate, redirectTarget]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res?.requiresVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          state: { email: email.trim().toLowerCase(), from: location.state?.from }
        });
        return;
      }
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      if (err.requiresVerification || err.message?.includes('verify your email')) {
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          state: { email: email.trim().toLowerCase(), from: location.state?.from }
        });
      } else {
        setError(err.message || 'Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePopup = useGoogleLogin({
    onSuccess: async (response: any) => {
      setLoading(true);
      setError('');
      try {
        if (response.code) {
          const redirectUri = window.location.origin;
          await loginWithGoogleCode(response.code, redirectUri);
        } else if (response.access_token) {
          await loginWithGoogleToken(response.access_token);
        }
        navigate(redirectTarget, { replace: true });
      } catch (err: any) {
        setError(err.message || 'Google authentication failed on server');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.warn('Google sign-in canceled or failed:', errorResponse);
      setError('Google Sign-In was cancelled or failed.');
      setLoading(false);
    }
  });

  const handleContinueWithGoogle = async () => {
    setError('');
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.startsWith('dummy-') || clientId.startsWith('your-')) {
      setError('Google OAuth Client ID is not configured yet. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    try {
      handleGooglePopup();
    } catch (err: any) {
      try {
        setLoading(true);
        const url = await getGoogleAuthUrl();
        window.location.href = url;
      } catch (e: any) {
        setError(e.message || 'Failed to initiate Google OAuth redirect');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 text-slate-200 selection:bg-cyan-500/30">
      <ThreeBackground mode="constellation" />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-700/50 backdrop-blur-2xl">

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Rocket className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold font-tech text-white mb-2 uppercase tracking-tight">
              Nexus Entry
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              Authenticate to access the Brand Neural Network.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Error: </span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Digital ID (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Access Key
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-widest mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Execute Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Or Continue With</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Real Google OAuth Button */}
          <button
            type="button"
            onClick={handleContinueWithGoogle}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center gap-3 text-slate-200 hover:text-white font-medium shadow-sm hover:shadow-cyan-500/10 active:scale-[0.99] group text-sm cursor-pointer"
          >
            <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 text-center text-xs text-slate-400">
            <span>New operator? </span>
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider inline-flex items-center gap-1 group">
              Join Tech Turf <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-6 pt-4 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
            By logging in, you agree to our{' '}
            <Link to="/terms" className="text-cyan-400 hover:underline">
              Terms & Conditions
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
