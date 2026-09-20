
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

const API_BASE = 'http://localhost:5005/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  loginWithGoogleToken: (token: string) => Promise<void>;
  loginWithGoogleCode: (code: string, redirectUri?: string) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  getGoogleAuthUrl: () => Promise<string>;
  updateProfile: (name: string, password?: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<void>;
  verifyTwoStep: (email: string, code?: string, backup?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = db.getSession();
    if (sessionUser) setUser(sessionUser);
    setIsLoading(false);
  }, []);

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
  const signup = async (name: string, email: string, pass: string) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Signup failed');

    // Send verification OTP
    try {
      await fetch(`${API_BASE}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch {
      console.warn('OTP send failed — check server email config');
    }
    // Don't create session yet — wait for email verification
  };

  // ── VERIFY EMAIL ───────────────────────────────────────
  const verifyEmail = async (email: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    // Auto-login after verification
    db.createSession(data.user);
    setUser(data.user);
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
  const updateProfile = async (name: string, password?: string) => {
    if (!user) return;
    const updatedUser = { ...user, name };
    setUser(updatedUser);
    await fetch(`${API_BASE}/users/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name, avatar: user.avatar })
    });
  };

  // ── CHANGE PASSWORD ────────────────────────────────────
  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) throw new Error('Not logged in');
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, oldPassword: oldPass, newPassword: newPass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
  };

  // ── PASSWORD RESET ─────────────────────────────────────
  const requestPasswordReset = async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp, newPassword: newPass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
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

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isVerified: user ? Boolean(user.isVerified) : false,
      isLoading,
      login,
      signup,
      verifyEmail,
      loginWithGoogleToken,
      loginWithGoogleCode,
      loginWithGoogleCredential,
      getGoogleAuthUrl,
      updateProfile,
      changePassword,
      requestPasswordReset,
      resetPassword,
      verifyTwoStep,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
