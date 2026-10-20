import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ArrowRight, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

export const ForgotPassword: React.FC = () => {
  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step 1: 'email' | Step 2: 'reset'
  const [step, setStep] = useState<'email' | 'reset'>('email');

  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0 || step !== 'reset') return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, step]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleDigitChange = (index: number, value: string) => {
    setError('');
    const cleanVal = value.replace(/\D/g, '');
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

    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
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
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSuccess(`A 6-digit reset code has been sent to ${email}`);
      setStep('reset');
      setCountdown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSuccess(`A fresh reset code has been dispatched to ${email}`);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend reset code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit reset code.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure your new password satisfies all security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resetPassword(email.trim().toLowerCase(), code, newPassword);
      setSuccess('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 text-slate-200 selection:bg-cyan-500/30">
      <ThreeBackground mode="flow" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-slate-700/50 backdrop-blur-2xl">

          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 bg-yellow-950/60 px-2.5 py-1 rounded-full border border-yellow-500/30">
              Recovery Protocol
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 mx-auto mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              {step === 'email' ? <KeyRound className="w-8 h-8 text-yellow-400" /> : <ShieldCheck className="w-8 h-8 text-cyan-400" />}
            </div>
            <h1 className="text-3xl font-bold font-tech text-white mb-2 tracking-tight">
              {step === 'email' ? 'Forgot Password' : 'Reset Credentials'}
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              {step === 'email'
                ? 'Enter your registered email address to receive a secure recovery code.'
                : `Enter the 6-digit code sent to ${email} and choose a new password.`}
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

          {success && (
            <div className="mb-6 p-3.5 bg-green-950/50 border border-green-800/80 rounded-xl text-green-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-white shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Transmitting Code...
                  </>
                ) : (
                  <>
                    Send Recovery Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* OTP Input Boxes */}
              <div>
                <label className="block text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                  6-Digit Recovery Passcode
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={loading}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-white rounded-xl transition-all outline-none border ${
                        digit
                          ? 'bg-slate-900 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                          : 'bg-slate-950/60 border-slate-700 hover:border-slate-500 focus:border-yellow-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create strong password"
                    required
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-sm placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className={`w-full bg-slate-900/60 border rounded-xl py-3 pl-10 pr-10 text-white transition-all outline-none text-sm placeholder:text-slate-600 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Security Checklist:
                </div>
                <div className="grid grid-cols-2 gap-1 font-mono">
                  <span className={hasMinLength ? 'text-green-400' : 'text-slate-500'}>
                    {hasMinLength ? '✓' : '○'} 8+ characters
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

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch || digits.join('').length !== 6}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password & Proceed'}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-400 hover:text-white"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending}
                  className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500">Remember your password? </span>
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">
              Login here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
