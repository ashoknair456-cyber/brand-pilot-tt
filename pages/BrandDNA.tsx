
import React, { useState, useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { analyzeBrandText } from '../services/geminiService';
import { scrapeSocialMetrics } from '../services/socialScraper';
import { Save, Sparkles, Loader2, RefreshCw, Globe, Instagram, Linkedin, Twitter, Activity, Wifi, Facebook, Youtube, Link as LinkIcon } from 'lucide-react';

const BrandDNA: React.FC = () => {
    const { brand, updateBrand } = useContext(BrandContext);
    const [descriptionInput, setDescriptionInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [localBrand, setLocalBrand] = useState(brand);

    React.useEffect(() => {
        setLocalBrand(brand);
    }, [brand]);

    const handleAnalyze = async () => {
        if (!descriptionInput) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeBrandText(descriptionInput);
            setLocalBrand(prev => ({
                ...prev,
                ...analysis,
            }));
        } catch (e) {
            alert("Analysis failed. Try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            const stats = await scrapeSocialMetrics(localBrand);
            const updated = {
                ...localBrand,
                liveStats: stats
            };
            setLocalBrand(updated);
            updateBrand(updated);
        } catch (e) {
            alert("Live scraping failed. Please check connection.");
        } finally {
            setIsScraping(false);
        }
    };

    const handleSave = () => {
        updateBrand(localBrand);
        alert("Brand DNA Updated Successfully");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            <header className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
                <h1 className="text-5xl font-bold font-tech text-white mb-2 neon-text">Brand DNA Engine</h1>
                <p className="text-slate-400 text-lg">Define the core identity that governs all AI agents in the system.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Col: Analysis & Basic Info */}
                <div className="xl:col-span-2 space-y-8">
                    {/* AI Ingest */}
                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-purple-400" /> AI Identity Extraction
                            </h2>
                            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                Gemini 2.5 Flash
                            </span>
                        </div>
                        <div className="relative group">
                            <textarea
                                className="w-full glass-input p-6 text-slate-200 h-40 mb-4 resize-none text-lg leading-relaxed focus:bg-black/40 transition-all"
                                placeholder="Paste brand mission, website copy, or 'About Us' text here to auto-extract DNA parameters..."
                                value={descriptionInput}
                                onChange={(e) => setDescriptionInput(e.target.value)}
                            />
                            <div className="absolute bottom-6 right-4 pointer-events-none text-xs text-slate-500 uppercase tracking-widest opacity-50">Context Window</div>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !descriptionInput}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-bold tracking-wide transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            Analyze & Extract Parameters
                        </button>
                    </div>

                    {/* Core Fields */}
                    <div className="glass-panel p-8 space-y-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity className="w-6 h-6 text-cyan-400" /> Core Parameters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 ml-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={localBrand.name}
                                    onChange={e => setLocalBrand({ ...localBrand, name: e.target.value })}
                                    className="w-full glass-input p-4 text-white text-lg font-bold"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 ml-1">Industry</label>
                                <input
                                    type="text"
                                    value={localBrand.industry}
                                    onChange={e => setLocalBrand({ ...localBrand, industry: e.target.value })}
                                    className="w-full glass-input p-4 text-white text-lg"
                                    placeholder="e.g. Sustainable Tech"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 ml-1">Core Values</label>
                            <textarea
                                value={localBrand.values}
                                onChange={e => setLocalBrand({ ...localBrand, values: e.target.value })}
                                className="w-full glass-input p-4 text-slate-200 h-24 resize-none text-base mb-4"
                                placeholder="e.g. Innovation, Integrity, Sustainability..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 ml-1">Target Audience Profile</label>
                            <textarea
                                value={localBrand.audience}
                                onChange={e => setLocalBrand({ ...localBrand, audience: e.target.value })}
                                className="w-full glass-input p-4 text-slate-200 h-32 resize-none text-base"
                                placeholder="Describe your ideal customer..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Col: Live Data & Tone */}
                <div className="space-y-8">

                    {/* Live Social Scraping */}
                    <div className="glass-panel p-6 relative overflow-hidden flex flex-col h-auto">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-[60px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Wifi className={`w-5 h-5 ${isScraping ? 'animate-pulse text-green-400' : 'text-slate-400'}`} />
                                Live Data Link
                            </h3>
                            {localBrand.liveStats && (
                                <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Connected
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="relative group">
                                <Instagram className="absolute left-3 top-3 w-4 h-4 text-pink-500 transition-transform group-hover:scale-110" />
                                <input
                                    placeholder="Instagram URL"
                                    value={localBrand.socialUrls?.instagram || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), instagram: e.target.value } })}
                                    className="w-full glass-input pl-10 p-2.5 text-xs text-white placeholder-slate-600"
                                />
                            </div>
                            <div className="relative group">
                                <Facebook className="absolute left-3 top-3 w-4 h-4 text-blue-500 transition-transform group-hover:scale-110" />
                                <input
                                    placeholder="Facebook Page URL"
                                    value={localBrand.socialUrls?.facebook || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), facebook: e.target.value } })}
                                    className="w-full glass-input pl-10 p-2.5 text-xs text-white placeholder-slate-600"
                                />
                            </div>
                            <div className="relative group">
                                <Youtube className="absolute left-3 top-3 w-4 h-4 text-red-500 transition-transform group-hover:scale-110" />
                                <input
                                    placeholder="YouTube Channel URL"
                                    value={localBrand.socialUrls?.youtube || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), youtube: e.target.value } })}
                                    className="w-full glass-input pl-10 p-2.5 text-xs text-white placeholder-slate-600"
                                />
                            </div>
                            <div className="relative group">
                                <Linkedin className="absolute left-3 top-3 w-4 h-4 text-blue-400 transition-transform group-hover:scale-110" />
                                <input
                                    placeholder="LinkedIn Company URL"
                                    value={localBrand.socialUrls?.linkedin || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), linkedin: e.target.value } })}
                                    className="w-full glass-input pl-10 p-2.5 text-xs text-white placeholder-slate-600"
                                />
                            </div>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-3 w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                                <input
                                    placeholder="Official Website URL"
                                    value={localBrand.socialUrls?.website || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), website: e.target.value } })}
                                    className="w-full glass-input pl-10 p-2.5 text-xs text-white placeholder-slate-600"
                                />
                            </div>

                            <button
                                onClick={handleScrape}
                                disabled={isScraping || !localBrand.name}
                                className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/20 shadow-lg"
                            >
                                {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                                Sync Live Metrics
                            </button>
                        </div>

                        {localBrand.liveStats ? (
                            <div className="bg-black/40 rounded-xl p-5 space-y-4 border border-white/10 backdrop-blur-md">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-xs text-slate-400 uppercase tracking-widest">Total Reach</span>
                                    <span className="text-2xl font-bold text-white font-tech">{(localBrand.liveStats?.followers ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-xs text-slate-400 uppercase tracking-widest">Engagement</span>
                                    <span className="text-xl font-bold text-green-400">{localBrand.liveStats?.engagementRate ?? '—'}</span>
                                </div>
                                {localBrand.liveStats.topPostUrl && (
                                    <a href={localBrand.liveStats.topPostUrl} target="_blank" rel="noreferrer" className="block text-xs text-cyan-400 hover:text-cyan-300 truncate flex items-center gap-1 mt-1">
                                        <LinkIcon className="w-3 h-3" /> Top Trending Content
                                    </a>
                                )}
                                <div className="text-[9px] text-slate-600 text-right uppercase tracking-widest mt-2">
                                    Synced: {localBrand.liveStats?.lastScraped ? new Date(localBrand.liveStats.lastScraped).toLocaleTimeString() : '—'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-xs text-slate-600 py-6 italic border border-dashed border-slate-700 rounded-xl">
                                Connect URLs above to visualize live insights
                            </div>
                        )}
                    </div>

                    {/* Tone & Voice */}
                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white">Voice Configuration</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 block">Archetype</label>
                                <input
                                    value={localBrand.voiceArchetype}
                                    onChange={e => setLocalBrand({ ...localBrand, voiceArchetype: e.target.value })}
                                    className="w-full glass-input p-3 text-cyan-300 font-bold border-cyan-500/30 focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Tone of Voice</label>
                                <input
                                    value={localBrand.tone}
                                    onChange={e => setLocalBrand({ ...localBrand, tone: e.target.value })}
                                    className="w-full glass-input p-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Keywords</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-xl min-h-[60px] border border-white/5">
                                    {localBrand.keywords?.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-cyan-950/40 text-cyan-400 text-xs rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">{k}</span>
                                    ))}
                                    {(!localBrand.keywords || localBrand.keywords.length === 0) && <span className="text-xs text-slate-600 italic">No keywords extracted</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-slate-800/50">
                <button
                    onClick={handleSave}
                    className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white text-lg shadow-[0_0_40px_rgba(8,145,178,0.3)] hover:scale-[1.03] transition-all flex items-center gap-3 active:scale-95"
                >
                    <Save className="w-6 h-6" /> Save DNA Profile
                </button>
            </div>

        </div>
    );
};

export default BrandDNA;
