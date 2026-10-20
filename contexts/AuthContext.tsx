import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SubscriptionPlan, SubscriptionUsage } from '../types';
import { db } from '../services/db';

const API_BASE = 'http://localhost:5005/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  plan: SubscriptionPlan;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass: string, mobile?: string, termsAccepted?: boolean) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<any>;
  loginWithGoogleToken: (token: string) => Promise<void>;
  loginWithGoogleCode: (code: string, redirectUri?: string) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  getGoogleAuthUrl: () => Promise<string>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<any>;
  verifyTwoStep: (email: string, code?: string, backup?: string) => Promise<void>;
  upgradePlan: (plan: 'basic' | 'pro', interval?: 'monthly' | 'yearly', paymentDetails?: any) => Promise<any>;
  cancelPlan: () => Promise<any>;
  logoutAllDevices: () => Promise<void>;
  refreshUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const sessionUser = db.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  // ── LOGIN ──────────────────────────────────────────────
  const login = async (email: string, pass: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
    if (data.twoFactorRequired) {
      return data;
    }
    db.createSession(data);
    setUser(data);
    return data;
  };

  // ── SIGNUP ─────────────────────────────────────────────
  const signup = async (name: string, email: string, pass: string, mobile?: string, termsAccepted: boolean = true) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, mobile, termsAccepted })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Signup failed');
    return data;
  };

  // ── VERIFY EMAIL / OTP ──────────────────────────────────
  const verifyEmail = async (email: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    if (data.user) {
      db.createSession(data.user);
      setUser(data.user);
    }
  };

  const verifyOtp = verifyEmail;

  // ── RESEND OTP ──────────────────────────────────────────
  const resendOtp = async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend verification code');
    return data;
  };

  // ── GOOGLE LOGIN (TOKEN, CODE, CREDENTIAL) ───────────────
  const loginWithGoogleToken = async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed');
    db.createSession(data);
    setUser(data);
  };

  const loginWithGoogleCode = async (code: string, redirectUri?: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google authentication code exchange failed');
    db.createSession(data);
    setUser(data);
  };

  const loginWithGoogleCredential = async (credential: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google credential verification failed');
    db.createSession(data);
    setUser(data);
  };

  const getGoogleAuthUrl = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/auth/google/url`);
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Failed to retrieve Google Auth URL');
    return data.url;
  };

  // ── UPDATE PROFILE ─────────────────────────────────────
  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    const updated = await db.updateProfile(profileData);
    const mergedUser = { ...user, ...updated };
    db.createSession(mergedUser);
    setUser(mergedUser);
    return mergedUser;
  };

  // ── CHANGE PASSWORD ────────────────────────────────────
  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) throw new Error('Not logged in');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId: user.id, oldPassword: oldPass, newPassword: newPass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
  };

  // ── PASSWORD RESET ─────────────────────────────────────
  const requestPasswordReset = async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
    return data;
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp, newPassword: newPass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  };

  // ── SUBSCRIPTION PLANS ─────────────────────────────────
  const upgradePlan = async (plan: 'basic' | 'pro', interval: 'monthly' | 'yearly' = 'monthly', paymentDetails?: any) => {
    const data = await db.upgradeSubscription(plan, interval, paymentDetails);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const cancelPlan = async () => {
    const data = await db.cancelSubscription();
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  // ── LOGOUT FROM ALL DEVICES ────────────────────────────
  const logoutAllDevices = async () => {
    await db.logoutAll();
    logout();
  };

  // ── LOGOUT ─────────────────────────────────────────────
  const logout = () => {
    db.clearSession();
    setUser(null);
  };

  // ── 2FA VERIFICATION ───────────────────────────────────
  const verifyTwoStep = async (email: string, code?: string, backup?: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, backupCode: backup })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Two-step verification failed');
    if (data.user) {
      db.createSession(data.user);
      setUser(data.user);
    }
  };

  const currentPlan: SubscriptionPlan = user?.plan || 'free';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isVerified: user ? Boolean(user.isVerified) : false,
      isLoading,
      plan: currentPlan,
      login,
      signup,
      verifyEmail,
      verifyOtp,
      resendOtp,
      loginWithGoogleToken,
      loginWithGoogleCode,
      loginWithGoogleCredential,
      getGoogleAuthUrl,
      updateProfile,
      changePassword,
      requestPasswordReset,
      resetPassword,
      verifyTwoStep,
      upgradePlan,
      cancelPlan,
      logoutAllDevices,
      refreshUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
