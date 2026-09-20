
import React, { useContext, useState } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { Twitter, Facebook, Linkedin, MessageCircle, Send, Mail, Copy, Check, Calendar, Filter, Search, Instagram, Megaphone } from 'lucide-react';

const History: React.FC = () => {
    const { campaigns } = useContext(BrandContext);
    const [filter, setFilter] = useState<'all' | 'published' | 'scheduled' | 'generated'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredCampaigns = campaigns.filter(c => {
        if (filter !== 'all' && c.status !== filter) return false;
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleShare = (platform: string, content: string, headline?: string) => {
        const text = encodeURIComponent(content);
        const url = encodeURIComponent(window.location.href);

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
                break;
            case 'linkedin':
                handleCopy(content, 'linkedin');
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                alert("Content copied to clipboard! Paste it into your LinkedIn post.");
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
            case 'email':
                const subject = encodeURIComponent(headline || "Check out this post");
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
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold font-tech text-white mb-2">Content Archives</h1>
                    <p className="text-slate-400">Timeline of all generated and published brand assets.</p>
                </div>
            </header>

            {/* Toolbar */}
            <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'published', 'scheduled', 'generated'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors uppercase tracking-wider ${filter === f ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900/50 text-slate-400 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-64"
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
                {filteredCampaigns.map(campaign => (
                    <div key={campaign.id} className="relative pl-20 animate-in fade-in slide-in-from-bottom-4">
                        {/* Date Marker */}
                        <div className="absolute left-0 top-0 w-16 text-right">
                            <div className="text-xs font-bold text-slate-400">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-600">{new Date(campaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {/* Dot */}
                        <div className={`absolute left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 ${campaign.status === 'published' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                                campaign.status === 'scheduled' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' :
                                    'bg-slate-600'
                            }`} />

                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500/50 hover:border-l-cyan-500 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{campaign.name}</h3>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${campaign.status === 'published' ? 'bg-green-500/10 text-green-400' :
                                                campaign.status === 'scheduled' ? 'bg-cyan-500/10 text-cyan-400' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                        {campaign.scheduledDate && (
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Calendar className="w-3 h-3" /> Due: {new Date(campaign.scheduledDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campaign.channels.map((ch, idx) => (
                                    <div key={idx} className="bg-slate-950/50 rounded-xl p-4 border border-white/5 group hover:border-white/10 transition-colors">
                                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                                                {getIcon(ch.platform)} {ch.platform}
                                            </div>
                                            <div className="flex gap-1">
                                                {/* Social Sharing Buttons */}
                                                <button onClick={() => handleShare('twitter', ch.content)} title="Share to Twitter" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-400 transition-colors">
                                                    <Twitter className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('facebook', ch.content)} title="Share to Facebook" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors">
                                                    <Facebook className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('linkedin', ch.content)} title="Share to LinkedIn" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-700 transition-colors">
                                                    <Linkedin className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('whatsapp', ch.content)} title="Share to WhatsApp" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-green-500 transition-colors">
                                                    <MessageCircle className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('telegram', ch.content)} title="Share to Telegram" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-sky-500 transition-colors">
                                                    <Send className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleShare('email', ch.content, ch.headline)} title="Share via Email" className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-orange-500 transition-colors">
                                                    <Mail className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {ch.headline && <div className="font-bold text-slate-200 text-sm mb-2">{ch.headline}</div>}
                                        <p className="text-slate-400 text-sm line-clamp-3 mb-3">{ch.content}</p>

                                        {ch.generatedImage && (
                                            <div className="mb-3 rounded-lg overflow-hidden border border-slate-800">
                                                <img src={ch.generatedImage} alt="Asset" className="w-full h-32 object-cover" />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleCopy(ch.content, `${campaign.id}-${idx}`)}
                                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-400 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {copiedId === `${campaign.id}-${idx}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            {copiedId === `${campaign.id}-${idx}` ? 'Copied' : 'Copy Content'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCampaigns.length === 0 && (
                    <div className="text-center text-slate-500 py-12 italic">
                        No campaigns found in archives.
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
