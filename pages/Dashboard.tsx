
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BrandContext } from '../contexts/BrandContext';
import { Shield, Target, Zap, Activity, Dna, ArrowRight, AlertCircle, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { brand, campaigns } = useContext(BrandContext);

  const hasBrand = brand.name && brand.tone;

  // Calculate real metrics
  const avgConsistency = campaigns.length > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + (c.metrics?.consistencyScore || 0), 0) / campaigns.length)
    : 100;

  const totalContentPieces = campaigns.reduce((acc, c) => acc + c.channels.length, 0);

  const BrainCircuitIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 3 2.5 2.5 0 0 0 .5 3.32 2.5 2.5 0 0 0 2.22 3.14" />
      <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 3 2.5 2.5 0 0 1-.5 3.32 2.5 2.5 0 0 1-2.22 3.14" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 15v6" />
      <path d="M9 18h6" />
    </svg>
  );

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-tech text-white mb-2 neon-text">Brand Neural Network</h1>
        <p className="text-slate-400 max-w-2xl">
          {hasBrand ? (
            <span>Visualizing <span className="text-cyan-400 font-semibold">{brand.name}</span> identity parameters.</span>
          ) : (
            <span className="text-yellow-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> System Uninitialized. Identity parameters missing.</span>
          )}
        </p>
      </header>

      {!hasBrand ? (
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-700 bg-slate-900/50">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 animate-pulse">
            <Dna className="w-10 h-10 text-cyan-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initialize Brand DNA</h2>
          <p className="text-slate-400 max-w-md mb-8">
            The AI needs to understand your brand voice, values, and audience before generating content.
          </p>
          <Link to="/brand-dna" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20">
            <Plus className="w-5 h-5" /> Create Brand Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Brand DNA Panel */}
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <BrainCircuitIcon className="w-32 h-32" />
            </div>

            <h3 className="text-lg font-tech text-cyan-400 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Active Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Archetype</div>
                <div className="text-xl font-bold text-white">{brand.voiceArchetype || "N/A"}</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tone</div>
                <div className="text-xl font-bold text-white">{brand.tone || "N/A"}</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 col-span-2">
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Target Audience</div>
                <div className="text-lg text-slate-300">{brand.audience || "Unspecified"}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-3">Lexicon & Keywords</div>
              <div className="flex flex-wrap gap-2">
                {brand.keywords.map((k, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-tech text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" /> Integrity Check
              </h3>
              <p className="text-sm text-slate-400 mb-4">Brand voice consistency across {campaigns.length} campaigns.</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ${avgConsistency > 80 ? 'bg-green-500 text-green-500' : 'bg-yellow-500 text-yellow-500'}`}
                  style={{ width: `${avgConsistency}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono">
                <span className="text-slate-500">Stability</span>
                <span className={avgConsistency > 80 ? 'text-green-400' : 'text-yellow-400'}>{avgConsistency}%</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-tech text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" /> Vector Database
              </h3>
              <p className="text-sm text-slate-400 mb-4">Content chunks ready for RAG retrieval.</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalContentPieces}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Generated Assets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/brand-dna" className="group relative overflow-hidden rounded-xl p-6 glass-panel hover:bg-slate-800/80 transition-all border-dashed border border-slate-700 hover:border-cyan-500/50 text-left">
          <div className="relative z-10 flex justify-between items-center">
            <span className="font-tech text-lg text-slate-300 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Dna className="w-4 h-4" /> {hasBrand ? 'Edit DNA' : 'Setup DNA'}
            </span>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
        <Link to="/generate" className={`group relative overflow-hidden rounded-xl p-6 glass-panel hover:bg-slate-800/80 transition-all border-dashed border border-slate-700 hover:border-cyan-500/50 text-left ${!hasBrand ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="relative z-10 flex justify-between items-center">
            <span className="font-tech text-lg text-slate-300 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Target className="w-4 h-4" /> New Campaign
            </span>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
        <Link to="/analytics" className={`group relative overflow-hidden rounded-xl p-6 glass-panel hover:bg-slate-800/80 transition-all border-dashed border border-slate-700 hover:border-cyan-500/50 text-left ${!hasBrand ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="relative z-10 flex justify-between items-center">
            <span className="font-tech text-lg text-slate-300 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Activity className="w-4 h-4" /> View Telemetry
            </span>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
      </div>

    </>
  );
};

export default Dashboard;
