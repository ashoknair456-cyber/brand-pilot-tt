import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Pricing from './pages/Pricing';
import MarketSimilarity from './pages/MarketSimilarity';
import ContentSimilarity from './pages/ContentSimilarity';
import GoogleCallback from './pages/GoogleCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Context
import { BrandProvider } from './contexts/BrandContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isVerified, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return (
      <Navigate 
        to={`/verify-otp?email=${encodeURIComponent(user?.email || '')}`} 
        state={{ from: location, email: user?.email }} 
        replace 
      />
    );
  }

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
              {/* Public & Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Protected Workspace Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/brand-dna" element={<BrandDNA />} />
                <Route path="/brand_dna" element={<BrandDNA />} />
                <Route path="/generate" element={<Generator />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<History />} />
                <Route path="/personas" element={<Personas />} />
                <Route path="/market-similarity" element={<MarketSimilarity />} />
                <Route path="/content-similarity" element={<ContentSimilarity />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </BrandProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
