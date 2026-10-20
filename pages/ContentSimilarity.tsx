import React, { useState, useEffect, useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { db } from '../services/db';
import { ContentSimilarityAnalysis } from '../types';
import {
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowRight,
  History,
  ShieldCheck,
  Zap,
  SplitSquareVertical,
  Copy,
  Hash,
  Lightbulb
} from 'lucide-react';

export const ContentSimilarity: React.FC = () => {
  const { brand } = useContext(BrandContext);

  // Form State
  const [brandDescription, setBrandDescription] = useState(brand.description || '');
  const [contentText, setContentText] = useState('');
  const [referenceContent, setReferenceContent] = useState('');

  // Execution State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<ContentSimilarityAnalysis | null>(null);
  const [history, setHistory] = useState<ContentSimilarityAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (brand.description && !brandDescription) {
      setBrandDescription(brand.description);
    }
  }, [brand]);

  const loadHistory = async () => {
    try {
      const items = await db.getContentSimilarityHistory();
      setHistory(items);
      if (items.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(items[0]);
      }
    } catch (e) {
      console.warn('Failed to load content similarity history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSampleFill = () => {
    setContentText(`🚀 Discover how AI is reshaping multi-channel marketing workflows. Stop burning hours manually drafting cross-platform copy. BrandPilot AI aligns your brand voice across LinkedIn, Instagram, and Twitter in seconds, boosting conversion rates and engagement.`);
    setReferenceContent(`Traditional content marketing is broken. High-growth teams are switching to autonomous AI content pipelines that maintain strict tone consistency, generate tailored platform hooks, and scale weekly publishing velocity by 10x without extra headcount.`);
  };

  const handleRunComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contentText.trim() || contentText.trim().length < 5) {
      setError('Please provide your content draft, caption, or transcript (at least 5 characters).');
      return;
    }
    if (!referenceContent.trim() || referenceContent.trim().length < 5) {
      setError('Please provide the reference market content or competitor benchmark to compare against.');
      return;
    }

    setLoading(true);
    try {
      const result = await db.runContentSimilarity({
        brandDescription: brandDescription.trim(),
        contentText: contentText.trim(),
        referenceContent: referenceContent.trim()
      });
      setCurrentAnalysis(result);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Content similarity comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-slate-400 border-slate-700 bg-slate-900';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-purple-400';
    if (score >= 60) return 'bg-cyan-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-slate-500';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Member 2 Lexical Overlap Engine
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold font-tech text-white tracking-tight">Content Similarity Score</h1>
          <p className="text-slate-400 text-xs lg:text-sm mt-1">
            Directly compare your drafts, captions, or campaign copy against top-performing market content or competitor benchmarks using real N-gram and cosine vectorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSampleFill}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Load Sample Comparison
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-tech">
                <SplitSquareVertical className="w-4 h-4 text-purple-400" />
                Content Comparison Inputs
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Dual Input</span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRunComparison} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Your Content Draft / Caption / Transcript *</label>
                <textarea
                  rows={5}
                  placeholder="Paste your post, video caption, email draft, or transcript here..."
                  value={contentText}
                  onChange={e => setContentText(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl resize-none font-mono"
                  required
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>{contentText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{contentText.length} characters</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Reference Market Content / Competitor Benchmark *</label>
                <textarea
                  rows={5}
                  placeholder="Paste the viral competitor post, target market reference piece, or standard..."
                  value={referenceContent}
                  onChange={e => setReferenceContent(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl resize-none font-mono"
                  required
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>{referenceContent.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{referenceContent.length} characters</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">Brand Context (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., AI-first marketing intelligence platform"
                  value={brandDescription}
                  onChange={e => setBrandDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs text-white rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting N-Grams & Term Frequencies...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Calculate Content Similarity Score
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History drawer if toggled */}
          {showHistory && (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white font-mono uppercase">Comparison History</span>
                <span className="text-[10px] text-slate-500">{history.length} Saved</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {history.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      currentAnalysis?.id === item.id
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                        : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="truncate max-w-[200px]">
                      <div className="font-mono text-[11px] truncate">{item.content_text.slice(0, 40)}...</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
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

        {/* Right Output: Score & Overlap Analytics */}
        <div className="lg:col-span-7 space-y-6">
          {currentAnalysis ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Overall Content Score Card */}
              <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-purple-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1 block">Content Similarity Metric</span>
                    <h2 className="text-2xl font-bold font-tech text-white mb-1">Syntactic & Semantic Alignment</h2>
                    <p className="text-slate-400 text-xs">
                      Evaluated via 55% TF-IDF Cosine Vector + 45% N-Gram Phrase Overlap.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-tech shadow-xl ${getScoreColor(currentAnalysis.overall_score)}`}>
                      <span className="text-4xl font-bold">{currentAnalysis.overall_score}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-1000 ${getScoreBarColor(currentAnalysis.overall_score)}`}
                      style={{ width: `${currentAnalysis.overall_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Low Overlap (&lt;30%)</span>
                    <span>Moderate (30-65%)</span>
                    <span>High Resonance (66-85%)</span>
                    <span>Near Identical (&gt;85%)</span>
                  </div>
                </div>

                {/* Statistical Vector Indicators */}
                {currentAnalysis.metrics && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 text-center">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Cosine Cos(θ)</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">{currentAnalysis.metrics.cosineSimilarity}</div>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Bigram Jaccard</div>
                      <div className="text-base font-bold text-purple-300 font-mono mt-0.5">{currentAnalysis.metrics.phraseOverlapIndex}</div>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Unigram Overlap</div>
                      <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">{currentAnalysis.metrics.unigramOverlapRatio}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Common Topics & Keyword Overlap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-tech uppercase tracking-wider">
                    <Hash className="w-4 h-4" /> Common Thematic Topics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.common_topics?.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-300 font-mono font-bold">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-tech uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Exact Keyword Overlap
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAnalysis.keyword_overlap?.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Differences */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold font-tech uppercase tracking-wider">
                  <SplitSquareVertical className="w-4 h-4 text-yellow-400" /> Content Divergence & Unique Elements
                </div>
                <div className="space-y-2">
                  {currentAnalysis.content_differences?.map((diff, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      {diff}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="glass-panel p-6 rounded-3xl border border-green-500/20 space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold font-tech uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" /> Optimization Suggestions
                </div>
                <div className="space-y-2.5">
                  {currentAnalysis.suggestions?.map((sug, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-green-950/20 border border-green-500/20 text-xs text-green-200 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-lg bg-green-500/20 text-green-300 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology & Disclaimer */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-400 block mb-0.5">Algorithm: {currentAnalysis.algorithm_used}</strong>
                  Content similarity evaluates lexical and structural overlap against reference copy. It does not measure commercial performance, guarantee engagement, or claim copyright infringement.
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileText className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-tech">No Comparison Run Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Paste your draft and reference content on the left or click "Load Sample Comparison" to evaluate vocabulary and phrase similarity.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentSimilarity;
