
import React, { useContext, useState } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { MultiChannelCampaign } from '../types';
import { CalendarDays, Clock, MoreHorizontal, Layers, X, Save } from 'lucide-react';

const CampaignCard = ({ campaign }: { campaign: MultiChannelCampaign }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', campaign.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`p-4 rounded-xl border transition-all duration-200 group select-none
        ${isDragging
          ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-grabbing scale-[1.02] rotate-1 z-50'
          : 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing'
        }
      `}
    >
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <div className="flex gap-1">
          {campaign.channels.map((ch, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${ch.platform === 'instagram' ? 'bg-pink-500' :
                ch.platform === 'linkedin' ? 'bg-blue-500' :
                  ch.platform === 'twitter' ? 'bg-slate-200' :
                    'bg-orange-500'
              }`} />
          ))}
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
      </div>
      <h4 className="text-slate-200 font-medium text-sm line-clamp-2 mb-3 pointer-events-none">{campaign.name}</h4>
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3 pointer-events-none">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : new Date(campaign.createdAt).toLocaleDateString()}
        </div>
        {campaign.metrics && (
          <div className="text-cyan-500 font-mono flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {campaign.channels.length}
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const { campaigns, updateCampaign } = useContext(BrandContext);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedCampaignId, setDraggedCampaignId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  const now = new Date();

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    const date = new Date(c.scheduledDate || c.createdAt);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filter === 'week') return diffDays <= 7;
    if (filter === 'month') return diffDays <= 30;
    return true;
  });

  const draftCampaigns = filteredCampaigns.filter(c => c.status === 'draft' || c.status === 'generated');
  const scheduledCampaigns = filteredCampaigns.filter(c => c.status === 'scheduled');
  const publishedCampaigns = filteredCampaigns.filter(c => c.status === 'published');

  const handleDrop = (e: React.DragEvent, status: 'draft' | 'scheduled' | 'published') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');

    if (status === 'scheduled') {
      setDraggedCampaignId(id);
      setIsModalOpen(true);
    } else {
      updateCampaignStatus(id, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateCampaignStatus = (id: string, status: 'draft' | 'scheduled' | 'published', date?: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const updated = { ...campaign, status, scheduledDate: date };
      updateCampaign(updated);
    }
  };

  const confirmSchedule = () => {
    if (draggedCampaignId && selectedDate) {
      updateCampaignStatus(draggedCampaignId, 'scheduled', selectedDate);
      setIsModalOpen(false);
      setDraggedCampaignId(null);
      setSelectedDate('');
    }
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-tech text-white mb-2">Campaign Hologrid</h1>
          <p className="text-slate-400">Drag and drop to schedule generated multi-channel streams.</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>All Time</button>
          <button onClick={() => setFilter('week')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'week' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>This Week</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Columns */}
        <div
          onDrop={(e) => handleDrop(e, 'draft')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-2xl p-4 flex flex-col h-full bg-slate-900/20 border-dashed border-2 border-slate-800 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <h3 className="font-tech text-lg text-slate-300">Drafts / Generated</h3>
            <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{draftCampaigns.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {draftCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>

        <div
          onDrop={(e) => handleDrop(e, 'scheduled')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-2xl p-4 flex flex-col h-full bg-cyan-950/10 border-dashed border-2 border-cyan-900/50 hover:border-cyan-500/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            <h3 className="font-tech text-lg text-white">Scheduled</h3>
            <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{scheduledCampaigns.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {scheduledCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            {scheduledCampaigns.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl opacity-50">
                <CalendarDays className="w-8 h-8 text-slate-700 mb-2" />
                <div className="text-slate-600 text-sm">Drop here to schedule</div>
              </div>
            )}
          </div>
        </div>

        <div
          onDrop={(e) => handleDrop(e, 'published')}
          onDragOver={handleDragOver}
          className="glass-panel rounded-2xl p-4 flex flex-col h-full bg-green-950/10 border-dashed border-2 border-green-900/50 hover:border-green-500/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="font-tech text-lg text-slate-300">Published</h3>
            <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{publishedCampaigns.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {publishedCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" /> Schedule Campaign
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-mono text-slate-500 uppercase mb-2">Select Publish Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={!selectedDate}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
