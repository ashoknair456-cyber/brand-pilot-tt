import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ChevronRight, Fingerprint, ShieldCheck, KeyRound, Rocket, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import GoogleIcon from '../components/GoogleIcon';
import { useGoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const { login, loginWithGoogleToken, loginWithGoogleCode, getGoogleAuthUrl, requestPasswordReset, resetPassword, verifyTwoStep } = useAuth();
  const navigate = useNavigate();

  // View State: 'login' | 'forgot-email' | 'forgot-code' | '2fa'
  const [view, setView] = useState<'login' | 'forgot-email' | 'forgot-code' | '2fa'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2FA / Reset States
  const [otp, setOtp] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      // @ts-ignore
      if (res?.twoFactorRequired) {
        setView('2fa');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoStepVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (useBackup) {
        await verifyTwoStep(email, undefined, backupCode);
      } else {
        await verifyTwoStep(email, otp);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSuccessMsg(`Code sent to ${email}`);
      setView('forgot-code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword);
      setSuccessMsg('Password reset successfully. Please login.');
      setView('login');
      setPassword('');
      setOtp('');
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
      <ThreeBackground mode="constellation" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 backdrop-blur-xl">

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 neon-border mx-auto mb-4">
              {view === 'login' ? <Rocket className="w-8 h-8 text-cyan-400" /> :
                view === '2fa' ? <ShieldCheck className="w-8 h-8 text-green-400" /> :
                  <KeyRound className="w-8 h-8 text-yellow-400" />}
            </div>
            <h1 className="text-3xl font-bold font-tech text-white mb-2 uppercase tracking-tight">
              {view === 'login' ? 'Nexus Entry' :
                view === '2fa' ? 'Neural Shield' :
                  'Recovery Protocol'}
            </h1>
            <p className="text-slate-400 text-sm">
              {view === 'login'
                ? 'Authenticate to access the Brand Neural Network.'
                : view === '2fa'
                  ? 'Secondary authentication required for neural sync.'
                  : view === 'forgot-email'
                    ? 'Enter your registered email to receive a reset code.'
                    : 'Secure your account with a new credential.'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs text-center font-mono">
              [CRITICAL] {error}
            </div>
          )}

          {successMsg && (view === 'login' || view === 'forgot-code') && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-300 text-xs text-center flex items-center justify-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Digital ID (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Access Key</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setView('forgot-email'); }}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-tighter"
                  >
                    Reset Protocol?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-black text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Login'}
              </button>
            </form>
          ) : view === '2fa' ? (
            <form onSubmit={handleTwoStepVerify} className="space-y-6">
              {useBackup ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Emergency Backup Code</label>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    className="w-full bg-slate-900/50 border border-orange-500/50 rounded-xl py-4 px-4 text-white text-center font-mono tracking-widest focus:border-orange-500 transition-all outline-none"
                    placeholder="hex-code"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Neural Sync OTP (6 Digits)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-900/50 border border-green-500/50 rounded-xl py-4 px-4 text-white text-center font-mono tracking-[0.8em] text-xl focus:border-green-500 transition-all outline-none"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Protocol'}
                </button>
                <button
                  type="button"
                  onClick={() => setUseBackup(!useBackup)}
                  className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold"
                >
                  {useBackup ? 'Use Email OTP instead' : 'Lost access to email? Use Backup Code'}
                </button>
              </div>
            </form>
          ) : view === 'forgot-email' ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Target Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Transmit Reset Code'}
              </button>
              <button
                type="button"
                onClick={() => { setError(''); setView('login'); }}
                className="w-full text-[10px] text-slate-500 hover:text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Entry
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">Neural Reset Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-900/50 border border-yellow-500/50 rounded-xl py-3 px-4 text-white text-center font-mono tracking-[0.5em] focus:border-yellow-500 transition-all outline-none"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">New Neural Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 transition-all outline-none text-sm"
                    placeholder="Enter new 8+ char key"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-black text-white shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply Reset'}
              </button>
              <button
                type="button"
                onClick={() => { setError(''); setView('login'); }}
                className="w-full text-[10px] text-slate-500 hover:text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest"
              >
                Abort Reset
              </button>
            </form>
          )}

          {view === 'login' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Or Continue With</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleContinueWithGoogle}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center gap-3 text-slate-200 hover:text-white font-medium shadow-sm hover:shadow-cyan-500/10 active:scale-[0.99] group cursor-pointer text-sm"
                >
                  <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="mt-8 text-center text-[10px] font-medium tracking-wide">
                <span className="text-slate-500 uppercase">New operator? </span>
                <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-black inline-flex items-center gap-1 group uppercase">
                  Join Tech Turf <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
