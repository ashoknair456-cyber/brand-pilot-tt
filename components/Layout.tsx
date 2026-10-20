import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BrainCircuit, PenTool, CalendarDays, BarChart3, Settings, Rocket, Dna, Share2, Users, LogOut, Menu, X, History, Sparkles, Bell, CheckCircle2, AlertTriangle, Info, ChevronDown, Plus, Compass, FileText } from 'lucide-react';
import ThreeBackground from './ThreeBackground';
import { useAuth } from '../contexts/AuthContext';
import { BrandContext } from '../contexts/BrandContext';
import { db } from '../services/db';
import { NotificationItem } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden mb-1 ${isActive
        ? 'bg-white/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-white/10 backdrop-blur-md'
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`w-5 h-5 z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="font-medium tracking-wide z-10 text-sm">{label}</span>
      </>
    )}
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { brand, brands, switchBrand } = useContext(BrandContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const items = await db.getNotifications();
      if (Array.isArray(items)) {
        setNotifications(items);
      }
    } catch (e) {
      console.warn('Could not load notifications:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleMarkAllRead = async () => {
    await db.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 })));
  };

  const getBgMode = (path: string): 'brain' | 'constellation' | 'flow' => {
    switch (path) {
      case '/generate':
      case '/settings':
        return 'flow';
      case '/calendar':
      case '/analytics':
      case '/history':
        return 'constellation';
      default:
        return 'brain';
    }
  };

  const bgMode = getBgMode(location.pathname);

  return (
    <div className="min-h-screen relative flex text-slate-200 selection:bg-cyan-500/30">
      <ThreeBackground mode={bgMode} />

      {/* Mobile Header / Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between glass-panel !rounded-none !border-x-0 !border-t-0 backdrop-blur-xl bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <Rocket className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-tech font-bold text-white tracking-wider">BRANDPILOT</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 relative text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 glass-panel !rounded-l-none !rounded-r-3xl !border-l-0 z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.25, 0.8, 0.25, 1) bg-slate-900/40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:my-4 lg:ml-4 lg:!h-[calc(100vh-2rem)]
        `}
      >
        <div className="p-6 pb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Rocket className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-tech text-white tracking-wider">BRANDPILOT</h1>
              <div className="text-[10px] text-cyan-500 font-mono tracking-[0.2em] uppercase">Intelligence AI</div>
            </div>
          </div>

          {/* Active Brand Selector */}
          <div className="relative">
            <button
              onClick={() => setShowBrandMenu(!showBrandMenu)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {brand?.name?.charAt(0) || 'B'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{brand?.name || 'My Brand'}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{brand?.industry || 'Workspace'}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showBrandMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">Your Brands</div>
                <div className="max-h-40 overflow-y-auto space-y-1 my-1">
                  {brands && brands.length > 0 ? (
                    brands.map(b => (
                      <button
                        key={b.id || b.name}
                        onClick={() => {
                          if (b.id) switchBrand(b.id);
                          setShowBrandMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          brand?.id === b.id ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {brand?.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 px-2 py-1">{brand?.name || 'Default Workspace'}</div>
                  )}
                </div>
                <NavLink
                  to="/brand-dna"
                  onClick={() => setShowBrandMenu(false)}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium border-t border-white/5"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage / New Brand
                </NavLink>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin py-2">
          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-1 mt-1 tracking-widest">Core</div>
          <NavItem to="/" icon={Share2} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/brand-dna" icon={Dna} label="Brand DNA" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/personas" icon={Users} label="Personas" onClick={() => setIsSidebarOpen(false)} />

          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-1 mt-3 tracking-widest">Action</div>
          <NavItem to="/generate" icon={PenTool} label="Campaign Studio" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/calendar" icon={CalendarDays} label="Campaign Calendar" onClick={() => setIsSidebarOpen(false)} />

          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-1 mt-3 tracking-widest">Similarity & Market</div>
          <NavItem to="/market-similarity" icon={Compass} label="Market Similarity" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/content-similarity" icon={FileText} label="Content Similarity" onClick={() => setIsSidebarOpen(false)} />

          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-1 mt-3 tracking-widest">System</div>
          <NavItem to="/history" icon={History} label="Content Archive" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics & Audit" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/pricing" icon={Sparkles} label="Plans & Pricing" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 mt-auto">
          {/* User Profile Card with Plan Badge */}
          <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/5 backdrop-blur-md mb-2">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-10 h-10 rounded-xl border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white font-bold truncate">{user?.name}</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase ${
                  user?.plan === 'pro'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : user?.plan === 'basic'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {user?.plan || 'Free'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[10px] text-slate-500 font-mono">
            <NavLink to="/terms" onClick={() => setIsSidebarOpen(false)} className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </NavLink>
            <span>•</span>
            <NavLink to="/pricing" onClick={() => setIsSidebarOpen(false)} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              {user?.plan === 'pro' ? 'Pro Plan' : user?.plan === 'basic' ? 'Basic $5' : 'Upgrade ($5)'}
            </NavLink>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-500 text-xs font-bold transition-colors border border-transparent hover:border-red-500/20 uppercase tracking-wide cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 relative z-10 overflow-y-auto h-screen p-4 lg:p-8 pt-24 lg:pt-8 transition-all">
        {/* Top Header Bar for Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full">
              Workspace: <strong className="text-white">{brand?.name || 'Default Brand'}</strong>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {brand?.industry ? `Industry: ${brand.industry}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-cyan-500 text-slate-950 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 max-h-[28rem] glass-panel !bg-slate-900/95 !border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-50 flex flex-col animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Notifications</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 py-3 scrollbar-thin">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          n.read_status ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-cyan-500/10 border-cyan-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">{n.title}</span>
                          <span className="text-[9px] font-mono text-slate-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto glass-panel p-6 lg:p-10 min-h-[calc(100vh-8rem)] animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
