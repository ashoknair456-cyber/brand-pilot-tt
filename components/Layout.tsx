
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BrainCircuit, PenTool, CalendarDays, BarChart3, Settings, Rocket, Dna, Share2, Users, LogOut, Menu, X, History } from 'lucide-react';
import ThreeBackground from './ThreeBackground';
import { useAuth } from '../contexts/AuthContext';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Rocket className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-tech text-white tracking-wider">BRANDPILOT</h1>
              <div className="text-[10px] text-cyan-500 font-mono tracking-[0.2em] uppercase">Intelligence AI</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin py-4">
          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-2 mt-2 tracking-widest">Core</div>
          <NavItem to="/" icon={Share2} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/brand-dna" icon={Dna} label="Brand DNA" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/personas" icon={Users} label="Personas" onClick={() => setIsSidebarOpen(false)} />

          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-2 mt-4 tracking-widest">Action</div>
          <NavItem to="/generate" icon={PenTool} label="Generator" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/calendar" icon={CalendarDays} label="Campaigns" onClick={() => setIsSidebarOpen(false)} />

          <div className="text-[10px] font-bold text-slate-600 uppercase px-4 py-2 mt-4 tracking-widest">System</div>
          <NavItem to="/history" icon={History} label="History" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" onClick={() => setIsSidebarOpen(false)} />
          <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/5 backdrop-blur-md mb-2">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-10 h-10 rounded-xl border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <div className="text-sm text-white font-bold truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-500 text-xs font-bold transition-colors border border-transparent hover:border-red-500/20 uppercase tracking-wide"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 relative z-10 overflow-y-auto h-screen p-4 lg:p-8 pt-24 lg:pt-8 transition-all">
        <div className="max-w-7xl mx-auto glass-panel p-6 lg:p-10 min-h-[calc(100vh-6rem)] animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
