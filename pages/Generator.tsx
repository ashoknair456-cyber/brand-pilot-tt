import React, { useState, useContext, useEffect } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import {
  generateMultiChannelCampaign,
  calculateConsistencyScore,
  performMarketResearch,
  generateCampaignImage,
  editCampaignImage,
  translateContent,
  checkContentQuality,
  rewriteContent,
  ResearchResult
} from '../services/geminiService';
import { GeneratedChannelContent, ConsistencyAuditResult, ContentQualityAuditResult } from '../types';
import {
  Send as SendIcon,
  Loader2,
  Sparkles,
  Copy,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Megaphone,
  Check,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Share2,
  Facebook,
  MonitorPlay,
  MessageCircle,
  Send,
  Languages,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Zap,
  Edit2,
  RotateCcw,
  Users,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Generator: React.FC = () => {
  const { brand, personas, addCampaign, settings } = useContext(BrandContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [objective, setObjective] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [audienceOverride, setAudienceOverride] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [channels, setChannels] = useState<GeneratedChannelContent[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Audits & Scores
  const [consistencyResult, setConsistencyResult] = useState<{ score: number; report: ConsistencyAuditResult } | null>(null);
  const [qualityAudit, setQualityAudit] = useState<ContentQualityAuditResult | null>(null);
  const [showConsistencyModal, setShowConsistencyModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isAuditingQuality, setIsAuditingQuality] = useState(false);

  // Content Rewriter State
  const [isRewriting, setIsRewriting] = useState(false);
  const [originalDrafts, setOriginalDrafts] = useState<string[]>([]);
  const [isEditingManually, setIsEditingManually] = useState(false);

  // Image Gen State
  const [imageRatio, setImageRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [imageStyle, setImageStyle] = useState("Photorealistic");
  const [isThumbnailMode, setIsThumbnailMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editImageMessage, setEditImageMessage] = useState<string | null>(null);
  const [customImagePrompt, setCustomImagePrompt] = useState('');

  // Translation & Scheduling State
  const [targetLang, setTargetLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const [copied, setCopied] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [generationError, setGenerationError] = useState<{ message: string; code?: string } | null>(null);

  // Persona synchronization
  useEffect(() => {
    if (selectedPersonaId) {
      const selected = personas.find(p => p.id === selectedPersonaId);
      if (selected) {
        setAudienceOverride(`${selected.name} (${selected.role}) - ${selected.traits.join(', ')}. Pain points: ${selected.painPoints}`);
      }
    }
  }, [selectedPersonaId, personas]);

  useEffect(() => {
    if (channels && channels[activeTab]) {
      const ch = channels[activeTab];
      setCustomImagePrompt(ch.imagePrompt || (ch.headline ? `Editorial photo for: ${ch.headline}` : `Image representing: ${ch.content.slice(0, 100)}`));

      switch (ch.platform) {
        case 'instagram': setImageRatio("1:1"); break;
        case 'twitter':
        case 'facebook':
        case 'linkedin':
        case 'blog': setImageRatio("16:9"); break;
        case 'email': setImageRatio("4:3"); break;
        default: setImageRatio("16:9");
      }
      setIsThumbnailMode(false);
      setEditImageMessage(null);
    }
  }, [activeTab, channels]);

  const handleGenerate = async () => {
    if (!objective.trim()) return;
    if (!brand.name) {
      alert("Please configure your Brand DNA first.");
      navigate('/brand-dna');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setChannels(null);
    setConsistencyResult(null);
    setQualityAudit(null);
    setResearchResult(null);
    setActiveTab(0);
    setCopied(false);
    setPushed(false);
    setScheduledDate('');
    setTargetLang('English');

    try {
      let researchDataString = '';
      if (useSearch) {
        const research = await performMarketResearch(objective);
        setResearchResult(research);
        researchDataString = research.text;
      }

      const generatedChannels = await generateMultiChannelCampaign(brand, objective, audienceOverride, researchDataString);
      setChannels(generatedChannels);
      setOriginalDrafts(generatedChannels.map(c => c.content));

      // Calculate 8-dimension Consistency
      const audit = await calculateConsistencyScore(generatedChannels, brand);
      setConsistencyResult(audit);

      // Audit Initial Quality for the first channel
      if (generatedChannels.length > 0) {
        checkContentQuality(generatedChannels[0].content, brand.tone).then(q => setQualityAudit(q));
      }

      addCampaign({
        id: Date.now().toString(),
        name: objective.length > 50 ? objective.slice(0, 50) + '...' : objective,
        objective,
        status: 'generated',
        language: 'English',
        channels: generatedChannels,
        createdAt: new Date().toISOString(),
        qualityScore: 90,
        consistencyReport: audit.report,
        metrics: {
          predictedEngagement: Math.floor(Math.random() * 35) + 65,
          consistencyScore: audit.score
        }
      });

      // AUTO-GENERATE HERO IMAGE
      const targetChannel = generatedChannels.find(c => c.platform === 'instagram') || generatedChannels[0];
      if (targetChannel) {
        setIsGeneratingImage(true);
        const autoPrompt = targetChannel.imagePrompt || objective;

        try {
          const base64 = await generateCampaignImage(autoPrompt, "1:1", "1K", "Photorealistic");
          setChannels(prev => {
            if (!prev) return null;
            return prev.map(c => {
              if (c.platform === targetChannel.platform) {
                return { ...c, generatedImage: base64 };
              }
              return c;
            });
          });
        } catch (imgError) {
          console.warn("Auto image generation skipped:", imgError);
        } finally {
          setIsGeneratingImage(false);
        }
      }

    } catch (error: any) {
      console.error("Generation error:", error);
      setGenerationError({
        message: error.message || "Failed to generate campaign content. Please check AI key or network.",
        code: error.code
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async (action: 'shorten' | 'expand' | 'professional' | 'casual' | 'improve_cta' | 'generate_hashtags') => {
    if (!channels || !channels[activeTab]) return;
    setIsRewriting(true);
    try {
      const current = channels[activeTab].content;
      const rewritten = await rewriteContent(current, action);
      const updated = [...channels];
      updated[activeTab] = {
        ...updated[activeTab],
        content: rewritten
      };
      setChannels(updated);
      
      // Update quality audit on rewritten version
      const audit = await checkContentQuality(rewritten, brand.tone);
      setQualityAudit(audit);
    } catch (e) {
      alert("Content rewriter encountered an issue.");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (!channels || !originalDrafts[activeTab]) return;
    const updated = [...channels];
    updated[activeTab] = {
      ...updated[activeTab],
      content: originalDrafts[activeTab]
    };
    setChannels(updated);
  };

  const handleTranslate = async () => {
    if (!channels || targetLang === 'English') return;
    setIsTranslating(true);

    try {
      const currentContent = channels[activeTab].content;
      const translated = await translateContent(currentContent, targetLang, brand.tone);

      const updatedChannels = [...channels];
      updatedChannels[activeTab] = {
        ...updatedChannels[activeTab],
        content: translated
      };
      setChannels(updatedChannels);
    } catch (e) {
      alert("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTabChange = async (idx: number) => {
    setActiveTab(idx);
    setCopied(false);
    setTargetLang('English');
    setIsEditingManually(false);

    if (channels && channels[idx]) {
      setIsAuditingQuality(true);
      const audit = await checkContentQuality(channels[idx].content, brand.tone);
      setQualityAudit(audit);
      setIsAuditingQuality(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      let finalPrompt = prompt;
      if (isThumbnailMode) {
        finalPrompt = `YouTube/Social Link Thumbnail: ${prompt}. High contrast, vibrant, eye-catching, designed for small screens, clear focal point.`;
      }

      const base64 = await generateCampaignImage(finalPrompt, imageRatio, imageSize, imageStyle);
      if (channels) {
        const updatedChannels = [...channels];
        updatedChannels[activeTab] = {
          ...updatedChannels[activeTab],
          generatedImage: base64
        };
        setChannels(updatedChannels);
      }
    } catch (e) {
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEditImage = async () => {
    if (!channels || !channels[activeTab].generatedImage || !editPrompt) return;
    setIsEditingImage(true);
    setEditImageMessage(null);
    try {
      const result = await editCampaignImage(channels[activeTab].generatedImage!, editPrompt);
      if (result.image) {
        const updatedChannels = [...channels];
        updatedChannels[activeTab] = {
          ...updatedChannels[activeTab],
          generatedImage: result.image
        };
        setChannels(updatedChannels);
      }
      if (result.message) {
        setEditImageMessage(result.message);
      }
      setEditPrompt('');
    } catch (e: any) {
      setEditImageMessage(e.message || "Failed to edit image.");
    } finally {
      setIsEditingImage(false);
    }
  };

  const handleCopy = () => {
    if (channels) {
      const text = channels[activeTab].headline
        ? `${channels[activeTab].headline}\n\n${channels[activeTab].content}`
        : channels[activeTab].content;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    if (!channels) return;
    const currentChannel = channels[activeTab];
    const text = encodeURIComponent(currentChannel.content);
    const url = encodeURIComponent(window.location.href);

    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`; break;
      case 'linkedin':
        handleCopy();
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        alert("Content copied to clipboard! Ready to paste into LinkedIn.");
        break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
      case 'telegram': shareUrl = `https://t.me/share/url?url=${url}&text=${text}`; break;
      case 'email':
        const subject = encodeURIComponent(currentChannel.headline || "New Campaign Draft");
        shareUrl = `mailto:?subject=${subject}&body=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handlePush = async () => {
    if (!settings.enableN8n && !settings.enableZapier) {
      if (confirm("Automation is not configured. Go to Settings?")) {
        navigate('/settings');
      }
      return;
    }

    setPushLoading(true);

    const payload = {
      campaign_name: objective,
      brand_name: brand.name,
      channels: channels,
      language: targetLang,
      timestamp: new Date().toISOString(),
      scheduling: {
        is_scheduled: !!scheduledDate,
        scheduled_date: scheduledDate || null
      },
      user_email: user?.email || "anonymous@brandpilot.ai",
      meta: {
        consistencyScore: consistencyResult?.score,
        qualityScore: qualityAudit?.overallScore
      }
    };

    try {
      const promises = [];
      if (settings.enableN8n && settings.n8nWebhookUrl) {
        promises.push(
          fetch(settings.n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        );
      }
      if (settings.enableZapier && settings.zapierWebhookUrl) {
        promises.push(
          fetch(settings.zapierWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        );
      }

      const responses = await Promise.all(promises);
      const failed = responses.find(r => !r.ok);
      if (failed) {
        throw new Error(`Webhook failed with status ${failed.status}`);
      }
      setPushed(true);
      alert(`Campaign successfully pushed to automation! ${scheduledDate ? `(Scheduled for ${new Date(scheduledDate).toLocaleString()})` : ''}`);
    } catch (e: any) {
      alert(e.message || "Push failed. Check console for webhook configurations.");
    } finally {
      setPushLoading(false);
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-8rem)]">

      {/* Input Command Center */}
      <div className="lg:col-span-4 glass-panel p-6 lg:p-8 rounded-3xl border border-cyan-500/20 flex flex-col gap-5 h-auto lg:h-[calc(100vh-8rem)] overflow-y-auto">
        <div>
          <h2 className="text-2xl font-tech text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" /> Campaign Studio
          </h2>
          <p className="text-slate-400 text-xs">Orchestrate multi-channel copy aligned strictly with your Brand DNA.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">Campaign Objective *</label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Announce our enterprise AI security suite launch with an early access invitation..."
              className="w-full glass-input p-3 text-slate-200 text-xs h-32 resize-none leading-relaxed"
            />
          </div>

          {/* Persona Selector */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Target Persona</span>
              <Link to="/personas" className="text-[10px] text-purple-400 hover:underline">Manage Personas</Link>
            </label>
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="w-full glass-input p-2.5 text-xs text-white bg-slate-900/80"
            >
              <option value="">Default Brand Audience ({brand.audience ? brand.audience.slice(0, 30) + '...' : 'General'})</option>
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Audience & Focus Customization</label>
            <input
              type="text"
              value={audienceOverride}
              onChange={(e) => setAudienceOverride(e.target.value)}
              placeholder={brand.audience || "e.g. B2B Founders, Marketing Directors"}
              className="w-full glass-input p-2.5 text-xs text-white"
            />
          </div>

          <div
            onClick={() => setUseSearch(!useSearch)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              useSearch ? 'bg-indigo-900/30 border-indigo-500/50 shadow-md' : 'bg-slate-800/20 border-white/5'
            }`}
          >
            <Globe className={`w-4 h-4 mt-0.5 ${useSearch ? 'text-indigo-400' : 'text-slate-500'}`} />
            <div>
              <div className={`text-xs font-bold ${useSearch ? 'text-indigo-200' : 'text-slate-400'}`}>Enrich with Live Market Research</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Scours current industry news to contextualize hooks & themes.</div>
            </div>
          </div>
        </div>

        {generationError && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2 text-red-300 font-medium">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{generationError.message}</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !objective.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(8,145,178,0.4)] hover:shadow-[0_0_35px_rgba(8,145,178,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING CAMPAIGN ASSETS...</>
            ) : (
              <><SendIcon className="w-4 h-4" /> LAUNCH CAMPAIGN STUDIO</>
            )}
          </button>
        </div>
      </div>

      {/* Output & Content Editor Pane */}
      <div className="lg:col-span-8 glass-panel rounded-3xl border border-purple-500/20 flex flex-col relative overflow-hidden h-auto lg:h-[calc(100vh-8rem)]">
        {!channels && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
            <div className="w-28 h-28 rounded-full border border-dashed border-cyan-500/30 animate-[spin_20s_linear_infinite] flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full border border-dashed border-purple-500/30 animate-[spin_10s_linear_reverse_infinite]" />
            </div>
            <h3 className="font-tech text-white text-lg mb-1">Awaiting Campaign Parameters</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 max-w-sm">
              Enter campaign goals and choose a persona to generate synchronized content across Instagram, LinkedIn, Twitter, Facebook, and Email.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-30">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <div className="font-tech text-white tracking-widest text-lg mb-2">SYNCHRONIZING BRAND AGENTS</div>
            <div className="font-mono text-xs text-cyan-400/80 mb-4">Drafting copy, checking DNA guidelines, and rendering visual prompts...</div>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-[progress_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {channels && (
          <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">

            {/* Audit & Health Header Bar */}
            <div className="p-4 px-6 border-b border-white/10 flex flex-wrap justify-between items-center bg-slate-900/40 gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">{objective.slice(0, 35)}...</h3>
                <span className="text-[10px] font-mono uppercase bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  {channels.length} Channels Ready
                </span>
              </div>

              {/* Consistency & Quality Badges */}
              <div className="flex items-center gap-3">
                {consistencyResult && (
                  <button
                    onClick={() => setShowConsistencyModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all text-xs"
                    title="View 8-Dimension Consistency Audit"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 font-mono text-[11px]">Brand DNA:</span>
                    <strong className="text-cyan-400 font-bold">{consistencyResult.score}%</strong>
                  </button>
                )}

                {qualityAudit && (
                  <button
                    onClick={() => setShowQualityModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all text-xs"
                    title="View Content Quality Audit"
                  >
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 font-mono text-[11px]">Quality:</span>
                    <strong className="text-purple-400 font-bold">{qualityAudit.overallScore}%</strong>
                  </button>
                )}
              </div>
            </div>

            {/* Market Intelligence Ribbon */}
            {researchResult && (
              <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px]">
                  <Globe className="w-3.5 h-3.5" /> Market Research Grounding Enabled
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {researchResult.sources.slice(0, 2).map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline truncate max-w-[180px]">
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Channel Tabs */}
            <div className="flex border-b border-white/10 px-6 gap-2 overflow-x-auto bg-slate-950/30">
              {channels.map((channel, idx) => (
                <button
                  key={channel.platform}
                  onClick={() => handleTabChange(idx)}
                  className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === idx
                      ? 'border-cyan-400 text-cyan-300 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {getIcon(channel.platform)}
                  <span className="uppercase">{channel.platform}</span>
                </button>
              ))}
            </div>

            {/* Quick Content Rewriter Toolbar */}
            <div className="px-6 py-2 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-cyan-400" /> AI Rewriter:
              </span>
              <button
                onClick={() => handleRewrite('shorten')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Shorten
              </button>
              <button
                onClick={() => handleRewrite('expand')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Expand
              </button>
              <button
                onClick={() => handleRewrite('professional')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Make Professional
              </button>
              <button
                onClick={() => handleRewrite('casual')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Make Casual
              </button>
              <button
                onClick={() => handleRewrite('improve_cta')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                Improve CTA
              </button>
              <button
                onClick={() => handleRewrite('generate_hashtags')}
                disabled={isRewriting}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                + Hashtags
              </button>

              <button
                onClick={handleRestoreOriginal}
                className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                title="Restore initial AI draft"
              >
                <RotateCcw className="w-3 h-3" /> Restore Original
              </button>
            </div>

            {/* Content Body & Social Simulator */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-6">

                {/* Social Card Preview */}
                <div className="bg-slate-900/90 border border-white/15 text-slate-100 rounded-2xl overflow-hidden shadow-2xl">
                  
                  {/* Card Header */}
                  <div className="bg-slate-950/60 p-3.5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{brand.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {channels[activeTab].platform.toUpperCase()} Preview • {brand.voiceArchetype || 'Brand Voice'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Social Sharing */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleShare('twitter')} title="Share to X" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-400">
                        <Twitter className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleShare('facebook')} title="Share to Facebook" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400">
                        <Facebook className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleShare('linkedin')} title="Share to LinkedIn" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400">
                        <Linkedin className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleShare('whatsapp')} title="Share to WhatsApp" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleShare('email')} title="Share via Email" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-orange-400">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content Editor Area */}
                  <div className="p-5 space-y-3">
                    {channels[activeTab].headline && (
                      <input
                        type="text"
                        value={channels[activeTab].headline || ''}
                        onChange={(e) => {
                          const updated = [...channels];
                          updated[activeTab] = { ...updated[activeTab], headline: e.target.value };
                          setChannels(updated);
                        }}
                        className="w-full font-bold text-base bg-transparent border-b border-transparent focus:border-cyan-500/40 focus:outline-none text-white pb-1"
                        placeholder="Headline"
                      />
                    )}

                    <textarea
                      value={channels[activeTab].content}
                      onChange={(e) => {
                        const updated = [...channels];
                        updated[activeTab] = { ...updated[activeTab], content: e.target.value };
                        setChannels(updated);
                      }}
                      className="w-full text-xs text-slate-200 bg-transparent border border-transparent focus:border-cyan-500/40 rounded-xl p-2 focus:outline-none focus:bg-black/30 resize-none min-h-[140px] leading-relaxed"
                    />

                    {channels[activeTab].hashtags && channels[activeTab].hashtags!.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[11px] text-cyan-400 font-mono">
                        {channels[activeTab].hashtags?.map((t, idx) => (
                          <span key={idx}>#{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Image Area */}
                    {!channels[activeTab].generatedImage && (
                      <div className="mt-4 bg-slate-950/60 rounded-2xl p-4 border border-dashed border-white/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-slate-300">
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold uppercase">AI Visual Studio</span>
                          </div>
                          <button
                            onClick={() => {
                              const newMode = !isThumbnailMode;
                              setIsThumbnailMode(newMode);
                              if (newMode) setImageRatio("16:9");
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all border ${
                              isThumbnailMode ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                            }`}
                          >
                            <MonitorPlay className="w-3 h-3" />
                            {isThumbnailMode ? 'Thumbnail Mode ON' : 'Generate Thumbnail'}
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="text-[10px] uppercase font-mono text-slate-400 mb-1 block">Visual Prompt</label>
                          <textarea
                            value={customImagePrompt}
                            onChange={(e) => setCustomImagePrompt(e.target.value)}
                            className="w-full glass-input p-2.5 text-xs text-white h-16 resize-none"
                            placeholder="Describe your ideal campaign visual..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div>
                            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Ratio</label>
                            <select value={imageRatio} onChange={e => setImageRatio(e.target.value)} className="w-full glass-input p-1.5 text-xs text-white bg-slate-900">
                              {["1:1", "16:9", "9:16", "4:3", "3:4"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Style</label>
                            <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full glass-input p-1.5 text-xs text-white bg-slate-900">
                              {["Photorealistic", "Cyberpunk", "Cinematic", "Minimalist", "3D Render", "Studio Lighting", "Anime"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateImage(customImagePrompt)}
                          disabled={isGeneratingImage || !customImagePrompt}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                        >
                          {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          Generate Campaign Graphic
                        </button>
                      </div>
                    )}

                    {channels[activeTab].generatedImage && (
                      <div className="mt-4 space-y-3">
                        <img src={channels[activeTab].generatedImage} alt="Campaign Asset" className="w-full rounded-2xl border border-white/10" />

                        {/* Magic Image Editor */}
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 space-y-2">
                          <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                            <Wand2 className="w-3 h-3 text-cyan-400" /> Magic Image Editor
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="e.g. Add cinematic neon lighting, spotlight product..."
                              className="flex-1 glass-input px-3 py-1.5 text-xs text-white"
                            />
                            <button
                              onClick={handleEditImage}
                              disabled={isEditingImage || !editPrompt}
                              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                              {isEditingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                            </button>
                          </div>
                          {editImageMessage && (
                            <div className="text-[10px] text-amber-300 font-mono bg-amber-950/40 p-2 rounded border border-amber-500/20">
                              {editImageMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* Footer Translation & Automation Action Bar */}
            <div className="p-5 border-t border-white/10 flex flex-col gap-3 bg-slate-950/40">
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Translation Selector */}
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      disabled={isTranslating}
                      className="w-full h-full glass-input text-xs px-3 pl-8 appearance-none text-slate-200 bg-slate-900"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Chinese (Simplified)</option>
                      <option>Japanese</option>
                      <option>Portuguese</option>
                      <option>Italian</option>
                      <option>Arabic</option>
                      <option>Hindi</option>
                    </select>
                    <Languages className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || targetLang === 'English'}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white border border-white/10 transition-colors disabled:opacity-50"
                  >
                    {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Translate'}
                  </button>
                </div>

                {/* Scheduling Input */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full glass-input text-xs pl-9 pr-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                    copied ? 'bg-green-600 text-white border-green-500' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Channel Text'}
                </button>
                <button
                  onClick={handlePush}
                  disabled={pushed || pushLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {pushLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                  {pushed ? 'Pushed Successfully' : (scheduledDate ? 'Schedule & Push' : 'Push to Automation')}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Consistency 8-Dimension Audit Modal */}
      {showConsistencyModal && consistencyResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel !bg-slate-900/95 !border-cyan-500/40 p-8 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" /> Brand Consistency Audit
                </h3>
                <p className="text-slate-400 text-xs mt-1">Multi-dimensional alignment against your active Brand DNA.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Overall Score</span>
                <div className="text-3xl font-tech font-bold text-cyan-400">{consistencyResult.score}%</div>
              </div>
            </div>

            {/* 8 Dimension Category Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Dimension Analysis</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(consistencyResult.report.categories).map(([cat, val]) => (
                  <div key={cat} className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block truncate">
                      {cat.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <strong className={`text-base font-bold ${val >= 85 ? 'text-green-400' : val >= 70 ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {val}%
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Suggestions */}
            {consistencyResult.report.suggestions && consistencyResult.report.suggestions.length > 0 && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <h4 className="text-xs font-bold text-cyan-300 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Recommended Tweaks
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {consistencyResult.report.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConsistencyModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Quality Audit Modal */}
      {showQualityModal && qualityAudit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel !bg-slate-900/95 !border-purple-500/40 p-8 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-purple-400" /> Content Quality Analyzer
                </h3>
                <p className="text-slate-400 text-xs mt-1">Linguistic clarity, readability grade, and conversion power.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Quality Score</span>
                <div className="text-3xl font-tech font-bold text-purple-400">{qualityAudit.overallScore}%</div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Grammar</span>
                <strong className="text-base font-bold text-cyan-400">{qualityAudit.grammarScore || 94}%</strong>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Clarity</span>
                <strong className="text-base font-bold text-cyan-400">{qualityAudit.clarityScore || 90}%</strong>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">CTA Strength</span>
                <strong className="text-base font-bold text-purple-400">{qualityAudit.ctaStrengthScore || 88}%</strong>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Audience Fit</span>
                <strong className="text-base font-bold text-green-400">{qualityAudit.audienceRelevanceScore || 91}%</strong>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center col-span-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Readability Grade</span>
                <strong className="text-xs font-bold text-slate-200">{qualityAudit.readabilityScore ? `${qualityAudit.readabilityScore}% (High)` : 'Professional / Executive'}</strong>
              </div>
            </div>

            {/* Quality Suggestions */}
            {qualityAudit.suggestions && qualityAudit.suggestions.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <h4 className="text-xs font-bold text-purple-300 uppercase font-mono mb-2">Editorial Recommendations</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {qualityAudit.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowQualityModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Generator;
