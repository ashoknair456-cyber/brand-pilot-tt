import React, { useContext, useState } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { MultiChannelCampaign } from '../types';
import { CalendarDays, Clock, MoreHorizontal, Layers, X, Save, Copy, Trash2, Edit3, ArrowRight, CheckCircle2, Archive } from 'lucide-react';

const CampaignCard = ({
  campaign,
  onDuplicate,
  onDelete,
  onReschedule,
  onStatusChange
}: {
  campaign: MultiChannelCampaign;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (c: MultiChannelCampaign) => void;
  onStatusChange: (id: string, status: 'draft' | 'scheduled' | 'published' | 'archived') => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', campaign.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`p-4 rounded-2xl border transition-all duration-200 group select-none relative
        ${isDragging
          ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-grabbing scale-[1.02] rotate-1 z-50'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing'
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-1.5 pointer-events-none">
          {campaign.channels.map((ch, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                ch.platform === 'instagram' ? 'bg-pink-500' :
                ch.platform === 'linkedin' ? 'bg-blue-500' :
                ch.platform === 'twitter' ? 'bg-cyan-400' :
                ch.platform === 'facebook' ? 'bg-indigo-500' :
                'bg-orange-500'
              }`}
              title={ch.platform}
            />
          ))}
        </div>
        
        {/* Card Options Menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 w-36 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <button
                onClick={() => { onDuplicate(campaign.id); setShowMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" /> Duplicate
              </button>
              <button
                onClick={() => { onReschedule(campaign); setShowMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Reschedule
              </button>
              <button
                onClick={() => { onDelete(campaign.id); setShowMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h4 className="text-slate-100 font-bold text-xs line-clamp-2 mb-3 pointer-events-none">{campaign.name}</h4>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2.5 pointer-events-none">
        <div className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : new Date(campaign.createdAt).toLocaleDateString()}
        </div>
        <div className="text-cyan-400 font-mono text-[10px] flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
          <Layers className="w-3 h-3" />
          {campaign.channels.length} Ch
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const { campaigns, updateCampaign, duplicateCampaign, deleteCampaign } = useContext(BrandContext);
  const [filter, setFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<MultiChannelCampaign | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  const now = new Date();

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    const date = new Date(c.scheduledDate || c.createdAt);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (filter === 'day') return diffDays <= 1;
    if (filter === 'week') return diffDays <= 7;
    if (filter === 'month') return diffDays <= 30;
    return true;
  });

  const draftCampaigns = filteredCampaigns.filter(c => (c.status === 'draft' || c.status === 'generated') && !c.isArchived);
  const scheduledCampaigns = filteredCampaigns.filter(c => c.status === 'scheduled' && !c.isArchived);
  const publishedCampaigns = filteredCampaigns.filter(c => c.status === 'published' && !c.isArchived);

  const handleDrop = (e: React.DragEvent, status: 'draft' | 'scheduled' | 'published') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const campaign = campaigns.find(c => c.id === id);

    if (status === 'scheduled') {
      if (campaign) {
        setActiveCampaign(campaign);
        setSelectedDate(campaign.scheduledDate ? campaign.scheduledDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
        setIsModalOpen(true);
      }
    } else {
      updateCampaignStatus(id, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateCampaignStatus = (id: string, status: 'draft' | 'scheduled' | 'published' | 'archived', date?: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const updated: MultiChannelCampaign = {
        ...campaign,
        status,
        scheduledDate: date || campaign.scheduledDate
      };
      updateCampaign(updated);
    }
  };

  const confirmSchedule = () => {
    if (activeCampaign && selectedDate) {
      updateCampaignStatus(activeCampaign.id, 'scheduled', selectedDate);
      setIsModalOpen(false);
      setActiveCampaign(null);
      setSelectedDate('');
    }
  };

  const handleOpenReschedule = (c: MultiChannelCampaign) => {
    setActiveCampaign(c);
    setSelectedDate(c.scheduledDate ? c.scheduledDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-tech text-white neon-text mb-1">Campaign Hologrid</h1>
          <p className="text-slate-400 text-xs lg:text-sm">Drag and drop to reschedule multi-channel marketing campaigns.</p>
        </div>

        <div className="flex gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold ${filter === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('day')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold ${filter === 'day' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold ${filter === 'week' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold ${filter === 'month' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            30 Days
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-14rem)]">
        
        {/* Column 1: Drafts */}
        <div
          onDrop={(e) => handleDrop(e, 'draft')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-3xl p-5 flex flex-col h-full bg-slate-900/20 border-dashed border-2 border-slate-700/50 hover:border-cyan-500/40 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h3 className="font-tech text-base text-slate-200 uppercase tracking-wider">Drafts & Generated</h3>
            <span className="ml-auto text-xs bg-slate-800 font-mono px-2.5 py-0.5 rounded-full text-slate-400">
              {draftCampaigns.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {draftCampaigns.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDuplicate={duplicateCampaign}
                onDelete={deleteCampaign}
                onReschedule={handleOpenReschedule}
                onStatusChange={updateCampaignStatus}
              />
            ))}
            {draftCampaigns.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-xs italic">
                No draft campaigns
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Scheduled */}
        <div
          onDrop={(e) => handleDrop(e, 'scheduled')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-3xl p-5 flex flex-col h-full bg-cyan-950/10 border-dashed border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse" />
            <h3 className="font-tech text-base text-cyan-300 uppercase tracking-wider">Scheduled Streams</h3>
            <span className="ml-auto text-xs bg-cyan-950/60 font-mono px-2.5 py-0.5 rounded-full text-cyan-300 border border-cyan-500/30">
              {scheduledCampaigns.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {scheduledCampaigns.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDuplicate={duplicateCampaign}
                onDelete={deleteCampaign}
                onReschedule={handleOpenReschedule}
                onStatusChange={updateCampaignStatus}
              />
            ))}
            {scheduledCampaigns.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-cyan-500/20 rounded-2xl opacity-60 text-center p-4">
                <CalendarDays className="w-8 h-8 text-cyan-500 mb-2" />
                <div className="text-cyan-400 text-xs font-bold">Drag cards here to schedule</div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Published */}
        <div
          onDrop={(e) => handleDrop(e, 'published')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-3xl p-5 flex flex-col h-full bg-green-950/10 border-dashed border-2 border-green-500/30 hover:border-green-500/60 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_#22c55e]" />
            <h3 className="font-tech text-base text-green-300 uppercase tracking-wider">Published</h3>
            <span className="ml-auto text-xs bg-green-950/60 font-mono px-2.5 py-0.5 rounded-full text-green-300 border border-green-500/30">
              {publishedCampaigns.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {publishedCampaigns.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDuplicate={duplicateCampaign}
                onDelete={deleteCampaign}
                onReschedule={handleOpenReschedule}
                onStatusChange={updateCampaignStatus}
              />
            ))}
            {publishedCampaigns.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-xs italic">
                No published campaigns
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date & Time Picker Modal */}
      {isModalOpen && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md animate-in fade-in zoom-in-95 space-y-5 shadow-2xl !bg-slate-900/95 !border-cyan-500/40">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" /> Schedule Campaign
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
                Campaign: <span className="text-white font-bold">{activeCampaign.name}</span>
              </label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full glass-input p-3 text-white text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={!selectedDate}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
