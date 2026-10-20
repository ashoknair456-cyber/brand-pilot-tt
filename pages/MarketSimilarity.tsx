import React, { useState, useEffect, useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { db } from '../services/db';
import { MarketSimilarityAnalysis } from '../types';
import {
  Compass,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Target,
  Layers,
  ArrowRight,
  RefreshCw,
  History,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Zap,
  BarChart2
} from 'lucide-react';

export const MarketSimilarity: React.FC = () => {
  const { brand } = useContext(BrandContext);

  // Form State
  const [brandName, setBrandName] = useState(brand.name || '');
  const [brandDescription, setBrandDescription] = useState(brand.description || '');
  const [industry, setIndustry] = useState(brand.industry || 'Technology');
  const [targetAudience, setTargetAudience] = useState(brand.audience || '');
  const [targetMarket, setTargetMarket] = useState('');
  const [referenceBrand, setReferenceBrand] = useState('');

  // Execution State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<MarketSimilarityAnalysis | null>(null);
  const [history, setHistory] = useState<MarketSimilarityAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Sync with active brand if available
  useEffect(() => {
    if (brand.name && !brandName) setBrandName(brand.name);
    if (brand.description && !brandDescription) setBrandDescription(brand.description);
    if (brand.industry && !industry) setIndustry(brand.industry);
    if (brand.audience && !targetAudience) setTargetAudience(brand.audience);
  }, [brand]);

  // Load history on mount
  const loadHistory = async () => {
    try {
      const items = await db.getMarketSimilarityHistory();
      setHistory(items);
      if (items.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(items[0]);
      }
    } catch (e) {
      console.warn('Failed to load market similarity history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAutofillFromBrand = () => {
    setBrandName(brand.name || '');
    setBrandDescription(brand.description || '');
    setIndustry(brand.industry || 'Technology');
    setTargetAudience(brand.audience || '');
    if (!targetMarket) {
      setTargetMarket(`Leading ${brand.industry || 'industry'} market segment seeking reliable, innovative solutions with high efficiency and measurable ROI.`);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brandName.trim()) {
      setError('Please provide your Brand Name.');
      return;
    }
    if (!brandDescription.trim() || brandDescription.trim().length < 10) {
      setError('Please provide a substantive Brand Description (at least 10 characters).');
      return;
    }
    if (!industry.trim()) {
      setError('Please specify the industry or niche.');
      return;
    }
    if (!targetMarket.trim() || targetMarket.trim().length < 10) {
      setError('Please describe your target market in detail (at least 10 characters) for accurate algorithmic scoring.');
      return;
    }

    setLoading(true);
    try {
      const result = await db.runMarketSimilarity({
        brandName: brandName.trim(),
        brandDescription: brandDescription.trim(),
        industry: industry.trim(),
        targetAudience: targetAudience.trim(),
        targetMarket: targetMarket.trim(),
        referenceBrand: referenceBrand.trim()
      });
      setCurrentAnalysis(result);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Market similarity analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-cyan-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1.5">
              <Compass className="w-3 h-3" /> Member 2 Intelligence Engine
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold font-tech text-white tracking-tight">Market Similarity Analysis</h1>
          <p className="text-slate-400 text-xs lg:text-sm mt-1">
            Evaluate how closely your brand positioning, value proposition, and audience vectors align with your chosen target market or reference benchmark.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutofillFromBrand}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Import from Brand DNA
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            History ({history.length})
          </button>
        </div>
      </header>

      {/* Main Grid: Input Form vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-tech">
                <Target className="w-4 h-4 text-cyan-400" />
                Comparison Parameters
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Input Vectors</span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRunAnalysis} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g., BrandPilot AI"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Industry / Niche *</label>
                  <input
                    type="text"
                    placeholder="e.g., SaaS Marketing"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full glass-input p-3 text-xs text-white rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Reference Brand (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Jasper, HubSpot"
                    value={referenceBrand}
                    onChange={e => setReferenceBrand(e.target.value)}
                    className="w-full glass-input p-3 text-xs text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g., Growth marketers, founders, agencies"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Brand Description *</label>
                <textarea
                  rows={3}
                  placeholder="Explain your core brand mission, value proposition, products, and voice..."
                  value={brandDescription}
                  onChange={e => setBrandDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Target Market or Benchmark Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the target market segment, buyer expectations, competitor landscape, and expected topics..."
                  value={targetMarket}
                  onChange={e => setTargetMarket(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Vector Overlap...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    Run Market Similarity Analysis
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historical Runs List (if toggled) */}
          {showHistory && (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white font-mono uppercase">Analysis History</span>
                <span className="text-[10px] text-slate-500">{history.length} Saved</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {history.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      currentAnalysis?.id === item.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold truncate max-w-[200px]">{item.brand_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()} • {item.industry}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: Detailed Score & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {currentAnalysis ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Overall Score Header Card */}
              <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1 block">Overall Market Similarity</span>
                    <h2 className="text-2xl font-bold font-tech text-white mb-1">{currentAnalysis.brand_name}</h2>
                    <p className="text-slate-400 text-xs">
                      Evaluated against: <strong className="text-slate-300">{currentAnalysis.industry}</strong> target market.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-tech shadow-xl ${getScoreColor(currentAnalysis.overall_score)}`}>
                      <span className="text-4xl font-bold">{currentAnalysis.overall_score}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-1000 ${getScoreBarColor(currentAnalysis.overall_score)}`}
                      style={{ width: `${currentAnalysis.overall_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Divergent (&lt;40%)</span>
                    <span>Moderate (40-69%)</span>
                    <span>High Alignment (70-89%)</span>
                    <span>Exact Resonance (90%+)</span>
                  </div>
                </div>
              </div>

              {/* 5 Dimensional Breakdown */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  Dimensional Similarity Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dim 1: Industry */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">1. Industry Similarity</span>
                      <span className="font-bold text-white font-mono">{currentAnalysis.dimensions.industrySimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBarColor(currentAnalysis.dimensions.industrySimilarity)}`} style={{ width: `${currentAnalysis.dimensions.industrySimilarity}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Taxonomy and sector keyword intersection.</p>
                  </div>

                  {/* Dim 2: Target Audience */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">2. Target Audience Alignment</span>
                      <span className="font-bold text-white font-mono">{currentAnalysis.dimensions.targetAudienceSimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBarColor(currentAnalysis.dimensions.targetAudienceSimilarity)}`} style={{ width: `${currentAnalysis.dimensions.targetAudienceSimilarity}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Buyer persona and demographic overlap.</p>
                  </div>

                  {/* Dim 3: Topic & Niche */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">3. Topic & Niche Similarity</span>
                      <span className="font-bold text-white font-mono">{currentAnalysis.dimensions.topicSimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBarColor(currentAnalysis.dimensions.topicSimilarity)}`} style={{ width: `${currentAnalysis.dimensions.topicSimilarity}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Subject matter term frequency correlation.</p>
                  </div>

                  {/* Dim 4: Category & Format */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">4. Value Proposition Format</span>
                      <span className="font-bold text-white font-mono">{currentAnalysis.dimensions.categorySimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBarColor(currentAnalysis.dimensions.categorySimilarity)}`} style={{ width: `${currentAnalysis.dimensions.categorySimilarity}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">N-gram phrase structure alignment.</p>
                  </div>

                  {/* Dim 5: Description */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2 sm:col-span-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">5. Narrative Description Similarity</span>
                      <span className="font-bold text-white font-mono">{currentAnalysis.dimensions.descriptionSimilarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBarColor(currentAnalysis.dimensions.descriptionSimilarity)}`} style={{ width: `${currentAnalysis.dimensions.descriptionSimilarity}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Full brand positioning statement vs target market benchmark narrative.</p>
                  </div>
                </div>
              </div>

              {/* Strong Matches & Areas of Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-green-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold font-tech uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Strong Matching Areas
                  </div>
                  <div className="space-y-2">
                    {currentAnalysis.strong_matches?.map((match, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-green-500/5 border border-green-500/10 text-xs text-green-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                        <span>{match}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-yellow-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold font-tech uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </div>
                  <div className="space-y-2">
                    {currentAnalysis.improvement_areas?.map((area, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-xs text-yellow-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-tech uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-purple-400" /> Actionable Recommendations
                </div>
                <div className="space-y-2.5">
                  {currentAnalysis.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology & Disclaimer */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-400 block mb-0.5">Scoring Methodology: {currentAnalysis.algorithm_used}</strong>
                  Scores represent mathematical lexical overlap and semantic vector distance between provided narratives. They provide directional guidance and are not a commercial prediction or financial guarantee.
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-tech">No Analysis Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Complete the parameters on the left or click "Import from Brand DNA" and run an analysis to generate dimensional similarity scores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketSimilarity;
