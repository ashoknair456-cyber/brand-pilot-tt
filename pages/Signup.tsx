import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Rocket, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import GoogleIcon from '../components/GoogleIcon';
import { useGoogleLogin } from '@react-oauth/google';

export const Signup: React.FC = () => {
  const { signup, loginWithGoogleToken, loginWithGoogleCode, getGoogleAuthUrl, user, isAuthenticated, isVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated and verified, redirect to dashboard or original target
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isVerified, navigate, location]);

  // Real-time password strength validation rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure your password satisfies all security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim().toLowerCase(), password, mobile.trim(), agreeTerms);
      // Transition to the dedicated OTP page
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        state: { email: email.trim().toLowerCase(), from: location.state?.from }
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
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
      <ThreeBackground mode="flow" />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-700/50 backdrop-blur-2xl">

          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Registration
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Rocket className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold font-tech text-white mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Join BrandPilot to orchestrate, analyze, and automate multi-channel brand campaigns.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-xs placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-xs placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-xs placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Access Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-xs placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className={`w-full bg-slate-900/60 border rounded-xl py-2.5 pl-10 pr-10 text-white transition-all outline-none text-xs placeholder:text-slate-600 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Policy Real-time Matrix */}
            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-[10px]">
              <div className="font-mono text-slate-400 uppercase tracking-wider font-bold">
                Security Requirements:
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono">
                <span className={hasMinLength ? 'text-green-400' : 'text-slate-500'}>
                  {hasMinLength ? '✓' : '○'} Min 8 chars
                </span>
                <span className={hasUpper ? 'text-green-400' : 'text-slate-500'}>
                  {hasUpper ? '✓' : '○'} Uppercase letter
                </span>
                <span className={hasLower ? 'text-green-400' : 'text-slate-500'}>
                  {hasLower ? '✓' : '○'} Lowercase letter
                </span>
                <span className={hasNumber ? 'text-green-400' : 'text-slate-500'}>
                  {hasNumber ? '✓' : '○'} Number (0-9)
                </span>
                <span className={hasSpecial ? 'text-green-400' : 'text-slate-500'}>
                  {hasSpecial ? '✓' : '○'} Special char (!@#)
                </span>
                <span className={passwordsMatch ? 'text-green-400' : 'text-slate-500'}>
                  {passwordsMatch ? '✓' : '○'} Passwords match
                </span>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-400">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
              />
              <label htmlFor="terms" className="leading-snug text-[11px]">
                I agree to BrandPilot's{' '}
                <Link to="/terms" target="_blank" className="text-cyan-400 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !agreeTerms}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-widest cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Create Account & Send OTP <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Or Continue With</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Real Google OAuth Button */}
          <button
            type="button"
            onClick={handleContinueWithGoogle}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center gap-3 text-slate-200 hover:text-white font-medium shadow-sm hover:shadow-cyan-500/10 active:scale-[0.99] group text-xs cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">
              Login to Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
