
import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Calendar from './pages/Calendar';
import BrandDNA from './pages/BrandDNA';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Personas from './pages/Personas';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GoogleCallback from './pages/GoogleCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrandIdentity, MultiChannelCampaign, AppSettings, Persona, BrandContextType } from './types';
import { Loader2 } from 'lucide-react';
import { db } from './services/db';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Context
import { BrandProvider } from './contexts/BrandContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isVerified } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isVerified) return <Navigate to="/signup" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrandProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/brand-dna" element={<BrandDNA />} />
                <Route path="/brand_dna" element={<BrandDNA />} />
                <Route path="/generate" element={<Generator />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<History />} />
                <Route path="/personas" element={<Personas />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </HashRouter>
        </BrandProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
