import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Rocket, ArrowLeft, ShieldCheck } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import GoogleIcon from '../components/GoogleIcon';
import { useGoogleLogin } from '@react-oauth/google';

const Signup: React.FC = () => {
  const { signup, verifyEmail, loginWithGoogleToken, loginWithGoogleCode, getGoogleAuthUrl, user, isAuthenticated, isVerified } = useAuth();
  const navigate = useNavigate();

  // Steps: 'form' | 'verify'
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is logged in but not verified, jump to verify step
  useEffect(() => {
    if (isAuthenticated && !isVerified) {
      setStep('verify');
      if (user?.email) setEmail(user.email);
    }
  }, [isAuthenticated, isVerified, user]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, code);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
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
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Google authentication failed on server');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.warn('Google login popup error/canceled:', errorResponse);
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
      // Fallback to full browser redirect flow
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ThreeBackground mode="flow" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 backdrop-blur-xl">

          {step === 'form' && (
            <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          )}

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 mx-auto mb-4">
              {step === 'form' ? <Rocket className="w-6 h-6 text-cyan-400" /> : <ShieldCheck className="w-6 h-6 text-green-400" />}
            </div>
            <h1 className="text-2xl font-bold font-tech text-white mb-2">
              {step === 'form' ? 'Initialize Protocol' : 'Verify Identity'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 'form' ? 'Create your command identity.' : `Enter the security code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    placeholder="Commander Shepard"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-xs text-slate-500 font-mono uppercase">Or Continue With</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleContinueWithGoogle}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center gap-3 text-slate-200 hover:text-white font-medium shadow-sm hover:shadow-cyan-500/10 active:scale-[0.99] group cursor-pointer"
                >
                  <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase block text-center">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900/50 border border-cyan-500/50 rounded-xl py-4 text-center text-2xl font-mono tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-center text-xs text-slate-500">A code has been sent to your email.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Launch'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Signup;
