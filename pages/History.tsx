import React, { useContext, useState } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { Twitter, Facebook, Linkedin, MessageCircle, Send, Mail, Copy, Check, Calendar, Filter, Search, Instagram, Megaphone, Trash2, Archive, History as HistoryIcon, Layers, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { MultiChannelCampaign, CampaignVersion } from '../types';
import { db } from '../services/db';

const History: React.FC = () => {
    const { campaigns, duplicateCampaign, archiveCampaign, deleteCampaign } = useContext(BrandContext);
    const [filter, setFilter] = useState<'all' | 'published' | 'scheduled' | 'generated' | 'archived'>('all');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Version Control Modal
    const [selectedCampaignForVersions, setSelectedCampaignForVersions] = useState<MultiChannelCampaign | null>(null);
    const [versionsList, setVersionsList] = useState<CampaignVersion[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);

    const filteredCampaigns = campaigns.filter(c => {
        if (filter === 'archived') {
            if (!c.isArchived) return false;
        } else if (filter !== 'all') {
            if (c.status !== filter || c.isArchived) return false;
        } else {
            // 'all' shows non-archived by default
            if (c.isArchived) return false;
        }

        if (platformFilter !== 'all') {
            const hasPlatform = c.channels?.some(ch => ch.platform === platformFilter);
            if (!hasPlatform) return false;
        }

        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.objective.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
    });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleViewVersions = async (campaign: MultiChannelCampaign) => {
        setSelectedCampaignForVersions(campaign);
        setIsLoadingVersions(true);
        try {
            const vList = await db.getCampaignVersions(campaign.id);
            setVersionsList(Array.isArray(vList) ? vList : []);
        } catch (e) {
            console.error(e);
            setVersionsList([]);
        } finally {
            setIsLoadingVersions(false);
        }
    };

    const handleShare = (platform: string, content: string, headline?: string) => {
        const text = encodeURIComponent(content);
        const url = encodeURIComponent(window.location.href);

        let shareUrl = '';
        switch (platform) {
            case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}`; break;
            case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`; break;
            case 'linkedin':
                handleCopy(content, 'linkedin');
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                alert("Content copied to clipboard! Paste it into your LinkedIn post.");
                break;
            case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
            case 'telegram': shareUrl = `https://t.me/share/url?url=${url}&text=${text}`; break;
            case 'email':
                const subject = encodeURIComponent(headline || "Campaign Asset");
                shareUrl = `mailto:?subject=${subject}&body=${text}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
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
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-tech text-white neon-text mb-1">Content Archives</h1>
                    <p className="text-slate-400 text-xs lg:text-sm">Historical repository of all generated campaigns, version trees, and published streams.</p>
                </div>
            </header>

            {/* Toolbar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {['all', 'published', 'scheduled', 'generated', 'archived'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                                filter === f ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={platformFilter}
                        onChange={e => setPlatformFilter(e.target.value)}
                        className="glass-input px-3 py-1.5 text-xs text-white bg-slate-900"
                    >
                        <option value="all">All Channels</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="facebook">Facebook</option>
                        <option value="email">Email</option>
                    </select>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="glass-input pl-9 pr-3 py-1.5 text-xs text-white w-48 lg:w-56"
                        />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
                {filteredCampaigns.map(campaign => (
                    <div key={campaign.id} className="relative pl-20 animate-in fade-in slide-in-from-bottom-4">
                        {/* Date Marker */}
                        <div className="absolute left-0 top-0 w-16 text-right">
                            <div className="text-xs font-bold text-slate-300">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{new Date(campaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {/* Dot */}
                        <div className={`absolute left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                            campaign.isArchived ? 'bg-amber-600' :
                            campaign.status === 'published' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                            campaign.status === 'scheduled' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' :
                            'bg-slate-600'
                        }`} />

                        <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-colors space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                            campaign.isArchived ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                            campaign.status === 'published' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                            campaign.status === 'scheduled' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                            'bg-slate-800 text-slate-400 border border-slate-700'
                                        }`}>
                                            {campaign.isArchived ? 'Archived' : campaign.status}
                                        </span>
                                        {campaign.scheduledDate && (
                                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                                <Calendar className="w-3 h-3 text-slate-500" /> Scheduled: {new Date(campaign.scheduledDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {campaign.metrics?.consistencyScore && (
                                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                                                DNA Match: {campaign.metrics.consistencyScore}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Toolbar */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleViewVersions(campaign)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-cyan-400 text-xs font-mono flex items-center gap-1 border border-white/5"
                                        title="View Version Tree"
                                    >
                                        <HistoryIcon className="w-3.5 h-3.5" /> Versions
                                    </button>
                                    <button
                                        onClick={() => duplicateCampaign(campaign.id)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-cyan-400 text-xs border border-white/5"
                                        title="Duplicate Campaign"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => archiveCampaign(campaign.id)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-amber-400 text-xs border border-white/5"
                                        title={campaign.isArchived ? "Unarchive" : "Archive Campaign"}
                                    >
                                        <Archive className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete campaign "${campaign.name}"?`)) {
                                                deleteCampaign(campaign.id);
                                            }
                                        }}
                                        className="p-2 bg-white/5 hover:bg-red-500/10 rounded-xl text-slate-300 hover:text-red-400 text-xs border border-white/5"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Channel Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campaign.channels?.map((ch, idx) => (
                                    <div key={idx} className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 group hover:border-white/10 transition-colors">
                                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
                                                {getIcon(ch.platform)} {ch.platform}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleShare('twitter', ch.content)} title="Share to X" className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-400">
                                                    <Twitter className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('facebook', ch.content)} title="Share to Facebook" className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600">
                                                    <Facebook className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('linkedin', ch.content)} title="Share to LinkedIn" className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-700">
                                                    <Linkedin className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('whatsapp', ch.content)} title="Share to WhatsApp" className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-green-500">
                                                    <MessageCircle className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('email', ch.content, ch.headline)} title="Share via Email" className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-orange-500">
                                                    <Mail className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {ch.headline && <div className="font-bold text-slate-200 text-xs mb-1.5">{ch.headline}</div>}
                                        <p className="text-slate-400 text-xs line-clamp-3 mb-3 leading-relaxed">{ch.content}</p>

                                        {ch.generatedImage && (
                                            <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                                                <img src={ch.generatedImage} alt="Asset" className="w-full h-32 object-cover" />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleCopy(ch.content, `${campaign.id}-${idx}`)}
                                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-center gap-2 border border-white/5 transition-colors"
                                        >
                                            {copiedId === `${campaign.id}-${idx}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedId === `${campaign.id}-${idx}` ? 'Copied to Clipboard' : 'Copy Channel Text'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCampaigns.length === 0 && (
                    <div className="text-center text-slate-500 py-16 italic glass-panel rounded-3xl border border-white/5">
                        No campaigns found in archives.
                    </div>
                )}
            </div>

            {/* Version History Modal */}
            {selectedCampaignForVersions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="glass-panel p-8 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl !bg-slate-900/95 !border-cyan-500/40">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <HistoryIcon className="w-5 h-5 text-cyan-400" /> Version History
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">{selectedCampaignForVersions.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCampaignForVersions(null)}
                                className="text-slate-400 hover:text-white px-3 py-1 bg-white/5 rounded-lg text-xs"
                            >
                                Close
                            </button>
                        </div>

                        {isLoadingVersions ? (
                            <div className="text-center py-12 text-cyan-400 text-xs font-mono">
                                Loading version tree...
                            </div>
                        ) : versionsList.length > 0 ? (
                            <div className="space-y-4">
                                {versionsList.map(v => (
                                    <div key={v.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-cyan-300 font-mono">
                                                Version #{v.version_number} — {v.change_summary || 'Campaign Snapshot'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(v.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {v.channels?.[0]?.content || v.objective}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-xs italic bg-black/20 rounded-2xl border border-white/5">
                                No prior revision snapshots recorded for this campaign. (Current draft is V1).
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
