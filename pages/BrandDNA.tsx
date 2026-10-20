import React, { useState, useContext, useEffect } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { analyzeBrandText } from '../services/geminiService';
import { scrapeSocialMetrics } from '../services/socialScraper';
import { db } from '../services/db';
import { BrandIdentity, SocialProfile } from '../types';
import { Save, Sparkles, Loader2, RefreshCw, Globe, Instagram, Linkedin, Twitter, Activity, Wifi, Facebook, Youtube, Link as LinkIcon, Plus, Trash2, CheckCircle2, ShieldAlert, Users, Layers, ExternalLink, Compass } from 'lucide-react';

const BrandDNA: React.FC = () => {
    const { brand, brands, updateBrand, createBrand, switchBrand, deleteBrandWorkspace } = useContext(BrandContext);
    const [descriptionInput, setDescriptionInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [localBrand, setLocalBrand] = useState<BrandIdentity>(brand);
    const [extractedPreview, setExtractedPreview] = useState<Partial<BrandIdentity> | null>(null);
    const [keywordInput, setKeywordInput] = useState('');
    const [bannedWordInput, setBannedWordInput] = useState('');
    const [competitorInput, setCompetitorInput] = useState('');
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Social Media Integrations State
    const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
    const [ytInput, setYtInput] = useState('');
    const [igInput, setIgInput] = useState('');
    const [ytLoading, setYtLoading] = useState(false);
    const [igLoading, setIgLoading] = useState(false);
    const [socialMessage, setSocialMessage] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);

    useEffect(() => {
        setLocalBrand(brand);
    }, [brand]);

    const fetchSocialProfiles = async () => {
        try {
            const list = await db.getSocialProfiles();
            setSocialProfiles(list);
        } catch (e) {
            console.warn('Social profiles fetch error:', e);
        }
    };

    useEffect(() => {
        fetchSocialProfiles();
    }, []);

    // Analyze -> Review -> Edit -> Save flow
    const handleAnalyze = async () => {
        if (!descriptionInput.trim()) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeBrandText(descriptionInput);
            setExtractedPreview(analysis);
        } catch (e: any) {
            alert(e.message || "Brand analysis failed. Please verify AI API connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleApplyExtractedData = () => {
        if (!extractedPreview) return;
        setLocalBrand(prev => ({
            ...prev,
            ...extractedPreview,
            keywords: Array.from(new Set([...(prev.keywords || []), ...(extractedPreview.keywords || [])])),
            bannedWords: Array.from(new Set([...(prev.bannedWords || []), ...(extractedPreview.bannedWords || [])])),
            competitors: Array.from(new Set([...(prev.competitors || []), ...(extractedPreview.competitors || [])]))
        }));
        setExtractedPreview(null);
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
            await db.syncSocialProfiles();
            await fetchSocialProfiles();
        } catch (e) {
            alert("Live scraping failed. Please check connection.");
        } finally {
            setIsScraping(false);
        }
    };

    const handleConnectYouTube = async () => {
        if (!ytInput.trim()) return;
        setYtLoading(true);
        setSocialMessage('');
        try {
            const res = await db.connectYouTube(ytInput.trim());
            setSocialMessage(`YouTube connected: ${res.profile?.handle || res.profile?.channel_id}`);
            setYtInput('');
            await fetchSocialProfiles();
        } catch (e: any) {
            alert(e.message || 'Failed to connect YouTube channel');
        } finally {
            setYtLoading(false);
        }
    };

    const handleDisconnectYouTube = async () => {
        if (!confirm('Are you sure you want to disconnect this YouTube channel?')) return;
        try {
            await db.disconnectYouTube();
            await fetchSocialProfiles();
        } catch (e: any) {
            alert(e.message || 'Failed to disconnect YouTube');
        }
    };

    const handleConnectInstagram = async () => {
        if (!igInput.trim()) return;
        setIgLoading(true);
        setSocialMessage('');
        try {
            const res = await db.connectInstagram(igInput.trim());
            setSocialMessage(`Instagram connected: ${res.profile?.handle}`);
            setIgInput('');
            await fetchSocialProfiles();
        } catch (e: any) {
            alert(e.message || 'Failed to connect Instagram profile');
        } finally {
            setIgLoading(false);
        }
    };

    const handleDisconnectInstagram = async () => {
        if (!confirm('Are you sure you want to disconnect this Instagram profile?')) return;
        try {
            await db.disconnectInstagram();
            await fetchSocialProfiles();
        } catch (e: any) {
            alert(e.message || 'Failed to disconnect Instagram');
        }
    };

    const handleEnrichBrand = async () => {
        setIsEnriching(true);
        try {
            const res = await db.enrichBrand(localBrand);
            if (res) {
                setLocalBrand(prev => ({
                    ...prev,
                    voiceArchetype: res.voiceArchetype || prev.voiceArchetype,
                    keywords: Array.from(new Set([...(prev.keywords || []), ...(res.suggestedKeywords || [])]))
                }));
                alert(`Customer Profile Enriched!\n\n• Strategic Archetype: ${res.voiceArchetype}\n• New Keywords Added: ${res.suggestedKeywords?.length || 0}\n• Core Positioning: ${res.competitivePositioning}`);
            }
        } catch (e: any) {
            alert(e.message || 'Brand enrichment failed');
        } finally {
            setIsEnriching(false);
        }
    };

    const handleSave = async () => {
        await updateBrand(localBrand);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleCreateBrandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;
        try {
            const created = await createBrand({ name: newBrandName.trim() });
            setNewBrandName('');
            setIsCreatingBrand(false);
            setLocalBrand(created);
        } catch (err: any) {
            alert(err.message || 'Failed to create new brand workspace');
        }
    };

    const addKeyword = () => {
        if (!keywordInput.trim()) return;
        setLocalBrand(prev => ({
            ...prev,
            keywords: [...(prev.keywords || []), keywordInput.trim()]
        }));
        setKeywordInput('');
    };

    const removeKeyword = (index: number) => {
        setLocalBrand(prev => ({
            ...prev,
            keywords: (prev.keywords || []).filter((_, i) => i !== index)
        }));
    };

    const addBannedWord = () => {
        if (!bannedWordInput.trim()) return;
        setLocalBrand(prev => ({
            ...prev,
            bannedWords: [...(prev.bannedWords || []), bannedWordInput.trim()]
        }));
        setBannedWordInput('');
    };

    const removeBannedWord = (index: number) => {
        setLocalBrand(prev => ({
            ...prev,
            bannedWords: (prev.bannedWords || []).filter((_, i) => i !== index)
        }));
    };

    const addCompetitor = () => {
        if (!competitorInput.trim()) return;
        setLocalBrand(prev => ({
            ...prev,
            competitors: [...(prev.competitors || []), competitorInput.trim()]
        }));
        setCompetitorInput('');
    };

    const removeCompetitor = (index: number) => {
        setLocalBrand(prev => ({
            ...prev,
            competitors: (prev.competitors || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* Header & Brand Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-tech text-white mb-2 neon-text">Brand DNA Engine</h1>
                    <p className="text-slate-400 text-sm lg:text-base">Define and train the core identity governing all AI campaign generation.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreatingBrand(true)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Brand Workspace
                    </button>
                    {brands && brands.length > 1 && localBrand.id && (
                        <button
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete brand workspace "${localBrand.name}"?`)) {
                                    deleteBrandWorkspace(localBrand.id!);
                                }
                            }}
                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                            title="Delete Workspace"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Create Brand Modal */}
            {isCreatingBrand && (
                <div className="p-6 rounded-2xl glass-panel !border-cyan-500/40 bg-slate-900/90 animate-in fade-in zoom-in-95">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-cyan-400" /> Create New Brand Workspace
                    </h3>
                    <form onSubmit={handleCreateBrandSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Brand Name (e.g. Apex Digital)"
                            value={newBrandName}
                            onChange={e => setNewBrandName(e.target.value)}
                            className="flex-1 glass-input p-3 text-white text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                            >
                                Create Brand
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreatingBrand(false)}
                                className="px-4 py-3 bg-slate-800 text-slate-400 text-xs rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Col: Analysis & Core DNA */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* AI Ingest - Analyze -> Review -> Edit -> Save */}
                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-purple-400" /> AI Identity Extraction
                            </h2>
                            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-widest uppercase">
                                Gemini 2.0 Flash
                            </span>
                        </div>
                        
                        <div className="relative group">
                            <textarea
                                className="w-full glass-input p-6 text-slate-200 h-36 mb-4 resize-none text-base leading-relaxed focus:bg-black/40 transition-all"
                                placeholder="Paste brand mission, website copy, About Us text, or marketing manifesto to auto-extract DNA parameters..."
                                value={descriptionInput}
                                onChange={(e) => setDescriptionInput(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !descriptionInput.trim()}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-bold tracking-wide transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            Analyze & Review Parameters
                        </button>

                        {/* Review Extracted Data Confirmation Box */}
                        {extractedPreview && (
                            <div className="mt-6 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 animate-in fade-in">
                                <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" /> Extracted Parameters Ready for Review
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 mb-4">
                                    <div><strong className="text-purple-400">Tone:</strong> {extractedPreview.tone || '—'}</div>
                                    <div><strong className="text-purple-400">Archetype:</strong> {extractedPreview.voiceArchetype || '—'}</div>
                                    <div><strong className="text-purple-400">Audience:</strong> {extractedPreview.audience || '—'}</div>
                                    <div><strong className="text-purple-400">Values:</strong> {extractedPreview.values || '—'}</div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApplyExtractedData}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Apply to Profile
                                    </button>
                                    <button
                                        onClick={() => setExtractedPreview(null)}
                                        className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded-xl"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Core Parameters */}
                    <div className="glass-panel p-8 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity className="w-6 h-6 text-cyan-400" /> Core Brand Parameters
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={localBrand.name || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, name: e.target.value })}
                                    className="w-full glass-input p-3.5 text-white text-base font-bold"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Industry</label>
                                <input
                                    type="text"
                                    value={localBrand.industry || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, industry: e.target.value })}
                                    className="w-full glass-input p-3.5 text-white text-base"
                                    placeholder="e.g. SaaS, Fintech, HealthTech"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Mission Statement</label>
                                <textarea
                                    value={localBrand.mission || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, mission: e.target.value })}
                                    className="w-full glass-input p-3.5 text-slate-200 h-24 resize-none text-sm"
                                    placeholder="Why your company exists and what purpose it serves..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Vision Statement</label>
                                <textarea
                                    value={localBrand.vision || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, vision: e.target.value })}
                                    className="w-full glass-input p-3.5 text-slate-200 h-24 resize-none text-sm"
                                    placeholder="The future impact and destination your brand aspires to achieve..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Core Values & Ethics</label>
                            <textarea
                                value={localBrand.values || ''}
                                onChange={e => setLocalBrand({ ...localBrand, values: e.target.value })}
                                className="w-full glass-input p-3.5 text-slate-200 h-24 resize-none text-sm"
                                placeholder="e.g. Radical transparency, continuous innovation, customer obsession..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Target Audience Overview</label>
                            <textarea
                                value={localBrand.audience || ''}
                                onChange={e => setLocalBrand({ ...localBrand, audience: e.target.value })}
                                className="w-full glass-input p-3.5 text-slate-200 h-24 resize-none text-sm"
                                placeholder="Describe demographics, decision makers, key aspirations, and target segments..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Communication Style</label>
                                <input
                                    type="text"
                                    value={localBrand.communicationStyle || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, communicationStyle: e.target.value })}
                                    className="w-full glass-input p-3 text-white text-sm"
                                    placeholder="e.g. Direct, data-backed, empathetic"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Personality Traits</label>
                                <input
                                    type="text"
                                    value={localBrand.personality || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, personality: e.target.value })}
                                    className="w-full glass-input p-3 text-white text-sm"
                                    placeholder="e.g. Visionary, meticulous, vibrant"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Col: Voice, Guidelines, Live Data */}
                <div className="space-y-8">

                    {/* Voice & Archetype */}
                    <div className="glass-panel p-6 space-y-5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" /> Voice & Tone
                        </h3>

                        <div>
                            <label className="text-xs text-cyan-400 uppercase tracking-widest mb-2 block font-mono">Archetype</label>
                            <input
                                value={localBrand.voiceArchetype || ''}
                                onChange={e => setLocalBrand({ ...localBrand, voiceArchetype: e.target.value })}
                                className="w-full glass-input p-3 text-cyan-300 font-bold border-cyan-500/30 focus:border-cyan-400 text-sm"
                                placeholder="e.g. The Visionary Leader, The Creator"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block font-mono">Tone of Voice</label>
                            <input
                                value={localBrand.tone || ''}
                                onChange={e => setLocalBrand({ ...localBrand, tone: e.target.value })}
                                className="w-full glass-input p-3 text-white text-sm"
                                placeholder="e.g. Authoritative, Inspiring, Approachable"
                            />
                        </div>

                        {/* Approved Keywords */}
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block font-mono">Brand Keywords</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add keyword..."
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                                    className="flex-1 glass-input p-2 text-xs text-white"
                                />
                                <button
                                    onClick={addKeyword}
                                    className="px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-xs rounded-xl border border-cyan-500/30"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
                                {localBrand.keywords?.map((k, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-950/50 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                                        {k}
                                        <button onClick={() => removeKeyword(i)} className="hover:text-red-400 text-cyan-500 ml-1">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Banned Words */}
                        <div>
                            <label className="text-xs text-red-400 uppercase tracking-widest mb-2 block font-mono flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Banned / Restricted Words
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add restricted word..."
                                    value={bannedWordInput}
                                    onChange={e => setBannedWordInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBannedWord(); } }}
                                    className="flex-1 glass-input p-2 text-xs text-white"
                                />
                                <button
                                    onClick={addBannedWord}
                                    className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs rounded-xl border border-red-500/30"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
                                {localBrand.bannedWords?.map((bw, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-950/50 text-red-300 text-xs rounded-full border border-red-500/30">
                                        {bw}
                                        <button onClick={() => removeBannedWord(i)} className="hover:text-white text-red-500 ml-1">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Competitors */}
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block font-mono">Competitors to Benchmark</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add competitor..."
                                    value={competitorInput}
                                    onChange={e => setCompetitorInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor(); } }}
                                    className="flex-1 glass-input p-2 text-xs text-white"
                                />
                                <button
                                    onClick={addCompetitor}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-xl border border-white/10"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
                                {localBrand.competitors?.map((c, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-white/10">
                                        {c}
                                        <button onClick={() => removeCompetitor(i)} className="hover:text-red-400 text-slate-500 ml-1">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Social Connect & Live Channel Analytics */}
                    <div className="glass-panel p-6 relative overflow-hidden flex flex-col h-auto space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-tech">
                                <Wifi className={`w-4 h-4 ${isScraping ? 'animate-pulse text-cyan-400' : 'text-slate-400'}`} />
                                Social Media Channel Integrations
                            </h3>
                            <button
                                onClick={handleEnrichBrand}
                                disabled={isEnriching || !localBrand.name}
                                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-[10px] font-mono flex items-center gap-1.5 border border-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
                                title="Enrich brand with AI market archetype & strategic keywords"
                            >
                                {isEnriching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
                                Enrich Profile
                            </button>
                        </div>

                        {socialMessage && (
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{socialMessage}</span>
                            </div>
                        )}

                        {/* YouTube Integration Section */}
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                                    <Youtube className="w-4 h-4 text-red-500" />
                                    YouTube Channel
                                </span>
                                {socialProfiles.find(p => p.platform === 'youtube') && (
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                        socialProfiles.find(p => p.platform === 'youtube')?.status === 'connected'
                                            ? 'text-green-400 bg-green-500/10 border-green-500/30'
                                            : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                                    }`}>
                                        {socialProfiles.find(p => p.platform === 'youtube')?.status === 'connected' ? 'Connected' : 'Linked (Key Required)'}
                                    </span>
                                )}
                            </div>

                            {(() => {
                                const yt = socialProfiles.find(p => p.platform === 'youtube');
                                if (yt) {
                                    return (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="font-bold text-white">{yt.display_name || yt.handle}</div>
                                                    <a href={yt.profile_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
                                                        {yt.handle || yt.channel_id} <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={handleDisconnectYouTube}
                                                    className="px-2.5 py-1 text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                                                >
                                                    Disconnect
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                                                <div className="p-2 bg-black/40 rounded-xl">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase">Subscribers</div>
                                                    <div className="text-xs font-bold text-white font-mono">{yt.subscriber_count > 0 ? yt.subscriber_count.toLocaleString() : '—'}</div>
                                                </div>
                                                <div className="p-2 bg-black/40 rounded-xl">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase">Total Views</div>
                                                    <div className="text-xs font-bold text-white font-mono">{yt.total_views > 0 ? yt.total_views.toLocaleString() : '—'}</div>
                                                </div>
                                                <div className="p-2 bg-black/40 rounded-xl">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase">Videos</div>
                                                    <div className="text-xs font-bold text-white font-mono">{yt.media_count > 0 ? yt.media_count.toLocaleString() : '—'}</div>
                                                </div>
                                            </div>

                                            {yt.status_message && (
                                                <p className="text-[10px] text-slate-400 italic leading-snug">
                                                    {yt.status_message}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="YouTube Channel URL or @handle"
                                            value={ytInput}
                                            onChange={e => setYtInput(e.target.value)}
                                            className="flex-1 glass-input p-2 text-xs text-white placeholder-slate-600"
                                        />
                                        <button
                                            onClick={handleConnectYouTube}
                                            disabled={ytLoading || !ytInput.trim()}
                                            className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 hover:text-white rounded-xl text-xs font-mono border border-red-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {ytLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                            Link
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Instagram Integration Section */}
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                                    <Instagram className="w-4 h-4 text-pink-500" />
                                    Instagram Profile
                                </span>
                                {socialProfiles.find(p => p.platform === 'instagram') && (
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                        socialProfiles.find(p => p.platform === 'instagram')?.status === 'connected'
                                            ? 'text-green-400 bg-green-500/10 border-green-500/30'
                                            : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                                    }`}>
                                        {socialProfiles.find(p => p.platform === 'instagram')?.status === 'connected' ? 'Connected' : 'Linked (Token Required)'}
                                    </span>
                                )}
                            </div>

                            {(() => {
                                const ig = socialProfiles.find(p => p.platform === 'instagram');
                                if (ig) {
                                    return (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="font-bold text-white">{ig.display_name || ig.handle}</div>
                                                    <a href={ig.profile_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 font-mono">
                                                        {ig.handle} <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={handleDisconnectInstagram}
                                                    className="px-2.5 py-1 text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                                                >
                                                    Disconnect
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center">
                                                <div className="p-2 bg-black/40 rounded-xl">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase">Followers</div>
                                                    <div className="text-xs font-bold text-white font-mono">{ig.subscriber_count > 0 ? ig.subscriber_count.toLocaleString() : '—'}</div>
                                                </div>
                                                <div className="p-2 bg-black/40 rounded-xl">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase">Media Posts</div>
                                                    <div className="text-xs font-bold text-white font-mono">{ig.media_count > 0 ? ig.media_count.toLocaleString() : '—'}</div>
                                                </div>
                                            </div>

                                            {ig.status_message && (
                                                <p className="text-[10px] text-slate-400 italic leading-snug">
                                                    {ig.status_message}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Instagram URL or @username"
                                            value={igInput}
                                            onChange={e => setIgInput(e.target.value)}
                                            className="flex-1 glass-input p-2 text-xs text-white placeholder-slate-600"
                                        />
                                        <button
                                            onClick={handleConnectInstagram}
                                            disabled={igLoading || !igInput.trim()}
                                            className="px-3 py-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 hover:text-white rounded-xl text-xs font-mono border border-pink-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {igLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                            Link
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* LinkedIn and Website optional inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-400" />
                                <input
                                    placeholder="LinkedIn URL"
                                    value={localBrand.socialUrls?.linkedin || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), linkedin: e.target.value } })}
                                    className="w-full glass-input pl-9 p-2 text-[11px] text-white placeholder-slate-600"
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-cyan-400" />
                                <input
                                    placeholder="Official Website"
                                    value={localBrand.socialUrls?.website || ''}
                                    onChange={e => setLocalBrand({ ...localBrand, socialUrls: { ...(localBrand.socialUrls || {}), website: e.target.value } })}
                                    className="w-full glass-input pl-9 p-2 text-[11px] text-white placeholder-slate-600"
                                />
                            </div>
                        </div>

                        {/* Sync Button */}
                        <button
                            onClick={handleScrape}
                            disabled={isScraping || !localBrand.name}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 border border-white/10 shadow cursor-pointer disabled:opacity-50"
                        >
                            {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Synchronize All Social Channels
                        </button>
                    </div>

                </div>
            </div>

            {/* Bottom Floating Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                {saveSuccess ? (
                    <span className="flex items-center gap-2 text-sm text-green-400 font-bold animate-in fade-in">
                        <CheckCircle2 className="w-5 h-5 text-green-400" /> Brand DNA saved successfully
                    </span>
                ) : (
                    <span className="text-xs text-slate-500 font-mono">
                        Workspace changes are persistent and isolated to your user account.
                    </span>
                )}
                <button
                    onClick={handleSave}
                    className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white text-base shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:scale-[1.02] transition-all flex items-center gap-3 active:scale-95 cursor-pointer"
                >
                    <Save className="w-5 h-5" /> Save DNA Profile
                </button>
            </div>

        </div>
    );
};

export default BrandDNA;
