import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandContext } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { TrendItem, SocialProfile, MarketSimilarityAnalysis, ContentSimilarityAnalysis } from '../types';
import {
  Shield,
  Target,
  Zap,
  Activity,
  Dna,
  ArrowRight,
  AlertCircle,
  Plus,
  TrendingUp,
  Bookmark,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  Youtube,
  Instagram,
  Compass,
  FileText,
  CheckCircle2,
  Wifi,
  BarChart2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { brand, campaigns } = useContext(BrandContext);
  const { user } = useAuth();

  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(brand.industry || 'Technology');

  // Member 2 Aggregated Telemetry State
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [latestMarketSim, setLatestMarketSim] = useState<MarketSimilarityAnalysis | null>(null);
  const [latestContentSim, setLatestContentSim] = useState<ContentSimilarityAnalysis | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  const hasBrand = brand.name && (brand.tone || brand.industry);

  // Calculate real metrics
  const avgConsistency = campaigns.length > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + (c.metrics?.consistencyScore || 0), 0) / campaigns.length)
    : 100;

  const totalContentPieces = campaigns.reduce((acc, c) => acc + (c.channels?.length || 0), 0);

  const fetchDashboardData = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await db.getDashboardSummary();
      if (summary) {
        if (summary.socialProfiles) setSocialProfiles(summary.socialProfiles);
        if (summary.latestMarketSimilarity) setLatestMarketSim(summary.latestMarketSimilarity);
        if (summary.latestContentSimilarity) setLatestContentSim(summary.latestContentSimilarity);
      }
      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Dashboard summary fetch failed:', e);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const fetched = await db.fetchLiveTrends(selectedIndustry, brand.keywords?.[0] || '', 'Global');
      setTrends(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.warn('Trend fetch failed:', e);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  useEffect(() => {
    if (brand.industry) {
      setSelectedIndustry(brand.industry);
    }
    fetchTrends();
    fetchDashboardData();
  }, [brand.industry]);

  const handleSaveTrend = async (id: string) => {
    await db.saveTrend(id);
    setTrends(prev => prev.map(t => t.id === id ? { ...t, saved: 1 } : t));
  };

  const ytProfile = socialProfiles.find(p => p.platform === 'youtube');
  const igProfile = socialProfiles.find(p => p.platform === 'instagram');

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Subscription Badge & Refresh */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
              user?.plan === 'pro'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : user?.plan === 'basic'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {user?.plan === 'pro' ? 'Pro Plan ($19/mo)' : user?.plan === 'basic' ? 'Basic Plan ($5/mo)' : 'Free Tier'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Last synced: {lastUpdatedTime}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold font-tech text-white neon-text mb-1">Brand Intelligence Dashboard</h1>
          <p className="text-slate-400 text-xs lg:text-sm">
            {hasBrand ? (
              <span>Orchestrating <strong className="text-cyan-400">{brand.name}</strong> customer profiles, social analytics, and market resonance.</span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Identity parameters missing. Please initialize Brand DNA.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchDashboardData(); fetchTrends(); }}
            disabled={isLoadingSummary || isLoadingTrends}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoadingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Telemetry
          </button>
          {user?.plan === 'free' && (
            <Link
              to="/pricing"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upgrade to Basic ($5)
            </Link>
          )}
        </div>
      </header>

      {/* Brand Initialization Callout */}
      {!hasBrand ? (
        <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-700 bg-slate-900/40">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-6 animate-pulse border border-cyan-500/30">
            <Dna className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initialize Brand DNA</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Configure your customer brand voice archetype, keywords, and audience to power intelligence analytics and campaigns.
          </p>
          <Link to="/brand-dna" className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20">
            <Plus className="w-4 h-4" /> Create Brand Profile
          </Link>
        </div>
      ) : (
        /* Top Section: Active DNA & System Health */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active DNA Panel */}
          <div className="glass-panel rounded-3xl p-6 lg:col-span-2 relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-tech">
                <Activity className="w-5 h-5 text-cyan-400" /> Active Customer Profile
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
                Brand: {brand.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1">Archetype</div>
                <div className="text-base font-bold text-white">{brand.voiceArchetype || "The Visionary Leader"}</div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1">Tone of Voice</div>
                <div className="text-base font-bold text-cyan-300">{brand.tone || "Professional, Authoritative"}</div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 sm:col-span-2">
                <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1">Target Audience Focus</div>
                <div className="text-xs text-slate-200">{brand.audience || "Unspecified Segment"}</div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">Lexicon & Keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {brand.keywords?.map((k, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* System Health Status */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 border-l-4 border-green-500 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-tech">
                <Shield className="w-5 h-5 text-green-400" /> DNA Consistency Health
              </h3>
              <p className="text-xs text-slate-400">Continuous voice alignment across all {campaigns.length} campaigns.</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${avgConsistency > 80 ? 'bg-green-400' : 'bg-yellow-400'}`}
                  style={{ width: `${avgConsistency}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Consistency Index</span>
                <span className={avgConsistency > 80 ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{avgConsistency}%</span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border-l-4 border-purple-500 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-tech">
                <Zap className="w-5 h-5 text-purple-400" /> Campaign Studio Assets
              </h3>
              <p className="text-xs text-slate-400">Multi-channel copy & visuals ready for distribution.</p>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-white font-tech">{totalContentPieces}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Total Assets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER 2: Social Media Channel Integrations & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YouTube Channel Widget */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-tech">YouTube Channel</h3>
                <span className="text-[10px] text-slate-500 font-mono">Member 2 Social Telemetry</span>
              </div>
            </div>
            {ytProfile ? (
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                ytProfile.status === 'connected'
                  ? 'text-green-400 bg-green-500/10 border-green-500/30'
                  : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
              }`}>
                {ytProfile.status === 'connected' ? 'Verified' : 'Linked (Key Needed)'}
              </span>
            ) : (
              <span className="text-[9px] font-mono uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                Not Connected
              </span>
            )}
          </div>

          {ytProfile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{ytProfile.display_name || ytProfile.handle}</div>
                  <a href={ytProfile.profile_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
                    {ytProfile.handle || ytProfile.channel_id} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <Link to="/brand-dna" className="text-[10px] font-mono text-cyan-400 hover:underline">
                  Manage Channel →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5 text-center">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Subscribers</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {ytProfile.subscriber_count > 0 ? ytProfile.subscriber_count.toLocaleString() : '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Total Views</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {ytProfile.total_views > 0 ? ytProfile.total_views.toLocaleString() : '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Videos</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {ytProfile.media_count > 0 ? ytProfile.media_count.toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              {ytProfile.status_message && (
                <p className="text-[10px] text-slate-400 italic">
                  {ytProfile.status_message}
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">No YouTube channel linked yet.</p>
              <Link to="/brand-dna" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl text-xs font-mono border border-red-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Connect YouTube in Brand DNA
              </Link>
            </div>
          )}
        </div>

        {/* Instagram Profile Widget */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-tech">Instagram Profile</h3>
                <span className="text-[10px] text-slate-500 font-mono">Member 2 Social Telemetry</span>
              </div>
            </div>
            {igProfile ? (
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                igProfile.status === 'connected'
                  ? 'text-green-400 bg-green-500/10 border-green-500/30'
                  : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
              }`}>
                {igProfile.status === 'connected' ? 'Verified' : 'Linked (Token Needed)'}
              </span>
            ) : (
              <span className="text-[9px] font-mono uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                Not Connected
              </span>
            )}
          </div>

          {igProfile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{igProfile.display_name || igProfile.handle}</div>
                  <a href={igProfile.profile_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 font-mono">
                    {igProfile.handle} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <Link to="/brand-dna" className="text-[10px] font-mono text-pink-400 hover:underline">
                  Manage Profile →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/5 text-center">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Followers</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {igProfile.subscriber_count > 0 ? igProfile.subscriber_count.toLocaleString() : '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Media Posts</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {igProfile.media_count > 0 ? igProfile.media_count.toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              {igProfile.status_message && (
                <p className="text-[10px] text-slate-400 italic">
                  {igProfile.status_message}
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">No Instagram profile linked yet.</p>
              <Link to="/brand-dna" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-xl text-xs font-mono border border-pink-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Connect Instagram in Brand DNA
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MEMBER 2: Similarity Engines Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Similarity Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech">Market Similarity Analysis</h3>
                <span className="text-[10px] text-slate-400 font-mono">5-Dimension Market Resonance</span>
              </div>
            </div>
            {latestMarketSim ? (
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border text-cyan-400 bg-cyan-950/50 border-cyan-500/30">
                Score: {latestMarketSim.overall_score}%
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">Not analyzed yet</span>
            )}
          </div>

          {latestMarketSim ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Market:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{latestMarketSim.target_market}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-[10px] font-mono">
                <div className="p-2 bg-black/40 rounded-xl">
                  <div className="text-slate-500 uppercase">Industry</div>
                  <div className="font-bold text-white mt-0.5">{latestMarketSim.dimensions?.industrySimilarity}%</div>
                </div>
                <div className="p-2 bg-black/40 rounded-xl">
                  <div className="text-slate-500 uppercase">Audience</div>
                  <div className="font-bold text-white mt-0.5">{latestMarketSim.dimensions?.targetAudienceSimilarity}%</div>
                </div>
                <div className="p-2 bg-black/40 rounded-xl">
                  <div className="text-slate-500 uppercase">Topic</div>
                  <div className="font-bold text-white mt-0.5">{latestMarketSim.dimensions?.topicSimilarity}%</div>
                </div>
              </div>
              {latestMarketSim.recommendations?.[0] && (
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200">
                  <strong className="text-cyan-300 font-mono text-[9px] uppercase block mb-0.5">Top Recommendation:</strong>
                  {latestMarketSim.recommendations[0]}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate how closely your brand narrative aligns with your target market dimensions.
            </p>
          )}

          <Link
            to="/market-similarity"
            className="w-full py-2.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-cyan-500/30 transition-colors"
          >
            {latestMarketSim ? 'View Full Market Analysis' : 'Run Market Similarity Analysis'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Similarity Card */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech">Content Similarity Score</h3>
                <span className="text-[10px] text-slate-400 font-mono">N-Gram & Cosine Overlap</span>
              </div>
            </div>
            {latestContentSim ? (
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border text-purple-300 bg-purple-950/50 border-purple-500/30">
                Score: {latestContentSim.overall_score}%
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">Not analyzed yet</span>
            )}
          </div>

          {latestContentSim ? (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 truncate">
                Snippet: <span className="text-slate-200">"{latestContentSim.content_text.slice(0, 60)}..."</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {latestContentSim.keyword_overlap?.slice(0, 4).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-[10px] text-purple-200 font-mono">
                    {kw}
                  </span>
                ))}
              </div>
              {latestContentSim.suggestions?.[0] && (
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                  <strong className="text-purple-300 font-mono text-[9px] uppercase block mb-0.5">Optimization Tip:</strong>
                  {latestContentSim.suggestions[0]}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare your captions, video scripts, or posts against viral competitor content to optimize resonance.
            </p>
          )}

          <Link
            to="/content-similarity"
            className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-purple-500/30 transition-colors"
          >
            {latestContentSim ? 'View Content Comparison' : 'Run Content Similarity Comparison'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Industry Trend Monitor Module */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-cyan-500/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-tech">Industry Trend Monitor</h3>
              <p className="text-xs text-slate-400">AI-curated market shifts and recommended marketing maneuvers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTrends}
              disabled={isLoadingTrends}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 border border-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoadingTrends ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Refresh Trends
            </button>
          </div>
        </div>

        {isLoadingTrends ? (
          <div className="text-center py-12 text-xs font-mono text-cyan-400">
            Scanning industry signals and summarizing trends...
          </div>
        ) : trends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      {item.industry}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Relevance: {item.relevanceScore}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">{item.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-3 leading-relaxed">{item.summary}</p>
                </div>

                {item.actionSuggestion && (
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                    <strong className="text-purple-300 font-mono text-[10px] uppercase block mb-0.5">Suggested Action:</strong>
                    {item.actionSuggestion}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-[10px] text-slate-500 truncate">{item.source || 'Industry Feed'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveTrend(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        item.saved ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-slate-400 hover:text-white border-white/5'
                      }`}
                      title="Save Trend"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to="/generate"
                      className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      Create Campaign
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            No active industry trends found. Click "Refresh Trends" to scan.
          </div>
        )}
      </div>

      {/* Quick Launchpad Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/brand-dna" className="group rounded-2xl p-5 glass-panel hover:bg-slate-800/80 transition-all border border-white/10 hover:border-cyan-500/50">
          <div className="flex justify-between items-center">
            <span className="font-tech text-sm text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Dna className="w-4 h-4" /> Customer Profile & DNA
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
        <Link to="/market-similarity" className="group rounded-2xl p-5 glass-panel hover:bg-slate-800/80 transition-all border border-white/10 hover:border-cyan-500/50">
          <div className="flex justify-between items-center">
            <span className="font-tech text-sm text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Compass className="w-4 h-4" /> Market Similarity
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
        <Link to="/content-similarity" className="group rounded-2xl p-5 glass-panel hover:bg-slate-800/80 transition-all border border-white/10 hover:border-purple-400 transition-colors">
          <div className="flex justify-between items-center">
            <span className="font-tech text-sm text-slate-200 group-hover:text-purple-300 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content Similarity
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 transition-colors" />
          </div>
        </Link>
        <Link to="/pricing" className="group rounded-2xl p-5 glass-panel hover:bg-slate-800/80 transition-all border border-white/10 hover:border-green-500/50">
          <div className="flex justify-between items-center">
            <span className="font-tech text-sm text-slate-200 group-hover:text-green-400 transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Plans & Pricing
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
