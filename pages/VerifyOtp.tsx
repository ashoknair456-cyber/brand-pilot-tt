import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

export const VerifyOtp: React.FC = () => {
  const { verifyOtp, resendOtp, isAuthenticated, isVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from URL search params or location state or fallback
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');
  const emailFromState = (location.state as any)?.email;
  const redirectTarget = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState<string>(emailFromQuery || emailFromState || '');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already authenticated and verified, redirect away
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isVerified, navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    setError('');
    const cleanVal = value.replace(/\D/g, ''); // numbers only

    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const char = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input field
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current is empty, focus previous and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    // Focus on the next empty or last filled
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please return to login/signup.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, code);
      setSuccess('Verification successful! Initializing your workspace...');
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
      if (err.remainingAttempts !== undefined) {
        setAttemptsRemaining(err.remainingAttempts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;

    setResending(true);
    setError('');
    setSuccess('');
    try {
      await resendOtp(email);
      setSuccess(`A fresh 6-digit verification code has been sent to ${email}`);
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 text-slate-200">
      <ThreeBackground mode="flow" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-700/50 backdrop-blur-2xl">
          
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Entry
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Security Protocol
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold font-tech text-white mb-2 tracking-tight">
              Verify Your OTP
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              Enter the 6-digit security authentication code sent to:
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-cyan-300 font-mono text-xs font-bold">
              {email || 'your registered email'}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verification Error: </span>
                {error}
                {attemptsRemaining !== null && (
                  <div className="text-[11px] text-red-400 font-mono mt-1">
                    Remaining attempts: {attemptsRemaining}
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-green-950/50 border border-green-800/80 rounded-xl text-green-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
                6-Digit Security Passcode
              </label>

              {/* 6 Individual Digit Boxes with Auto-Advance & Paste */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={loading || !!success}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono text-white rounded-xl transition-all outline-none border ${
                      digit
                        ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-950/60 border-slate-700 hover:border-slate-500 focus:border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-500/20`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || digits.join('').length !== 6 || !!success}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-[0.15em]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Identity Confirmed
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Resend OTP with 60-second Countdown Timer */}
            <div className="pt-2 text-center border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                <span className="text-slate-400">Didn't receive the passcode?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending || loading}
                  className="font-bold text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : countdown > 0 ? (
                    <span>Resend OTP in ({countdown}s)</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Footer Terms */}
          <div className="mt-8 text-center text-[11px] text-slate-500">
            By authenticating, you agree to BrandPilot's{' '}
            <Link to="/terms" className="text-cyan-400 hover:underline">
              Terms & Conditions
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
