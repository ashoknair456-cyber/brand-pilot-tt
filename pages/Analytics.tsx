
import React, { useContext, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Target, Users, Eye, MousePointerClick, AlertTriangle, Sparkles, Loader2, FileText, Share2 } from 'lucide-react';
import { BrandContext } from '../contexts/BrandContext';
import { generateAnalyticsReport } from '../services/geminiService';

// Generates fake history data for sparklines
const generateHistory = (value: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    val: value * (0.8 + Math.random() * 0.4)
  }));
};

const StatCard = ({ label, value, trend, change, icon: Icon }: any) => {
  const chartData = generateHistory(typeof value === 'number' ? value : 100);

  return (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}%
        </div>
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div>
          <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
          <div className="text-slate-500 text-sm font-medium">{label}</div>
        </div>

        {/* Sparkline */}
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="val" stroke={trend === 'up' ? '#4ade80' : '#f87171'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const { campaigns } = useContext(BrandContext);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived Metrics
  const totalCampaigns = campaigns.length;
  const totalChannels = campaigns.reduce((acc, c) => acc + c.channels.length, 0);
  const avgConsistency = totalCampaigns > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + (c.metrics?.consistencyScore ?? 0), 0) / totalCampaigns)
    : 0;

  // Platform Breakdown Logic
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    campaigns.forEach(c => {
      c.channels.forEach(ch => {
        counts[ch.platform] = (counts[ch.platform] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  // Engagement Trend Data
  const engagementData = useMemo(() => {
    return campaigns.map((c, i) => ({
      name: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      engagement: c.metrics?.predictedEngagement ?? 0,
      consistency: c.metrics?.consistencyScore ?? 0,
      fullDate: new Date(c.createdAt).toLocaleString()
    })).reverse();
  }, [campaigns]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const reportData = {
      totalCampaigns,
      avgConsistency,
      platformBreakdown: platformCounts,
      recentPerformance: engagementData.slice(0, 5), // last 5 campaigns
      topPerformingCampaign: campaigns.length > 0 ? campaigns[0].name : "N/A"
    };

    try {
      const text = await generateAnalyticsReport(reportData);
      setAiReport(text);
    } catch (e) {
      setAiReport("Failed to generate report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Insufficient Telemetry</h1>
        <p className="text-slate-400 max-w-md">
          Run your first marketing campaign to begin gathering performance data.
        </p>
      </div>
    );
  }

  const exportToCSV = () => {
    if (!campaigns || campaigns.length === 0) return;
    
    const headers = ['Campaign Name', 'Objective', 'Status', 'Language', 'Date', 'Consistency Score', 'Predicted Engagement'];
    
    const rows = campaigns.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.objective || '').replace(/"/g, '""')}"`,
      c.status,
      c.language,
      new Date(c.createdAt).toLocaleDateString(),
      c.metrics?.consistencyScore ?? 0,
      c.metrics?.predictedEngagement ?? 0
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'brandpilot_campaigns.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="relative flex justify-between items-end">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-tech text-white mb-2">Mission Analytics</h1>
          <p className="text-slate-400">Real-time performance telemetry across all channels.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <button
          onClick={handleAiAnalysis}
          disabled={isAnalyzing}
          className="relative z-10 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-70"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {aiReport ? 'Regenerate Insight' : 'Generate AI Insight'}
        </button>
      </header>

      {/* AI Report Section */}
      {aiReport && (
        <div className="glass-panel p-8 rounded-3xl border-t border-purple-500/30 bg-purple-900/10 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" /> Strategic Executive Summary
          </h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
            {aiReport}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Reach Est." value={(campaigns.length * 1250).toLocaleString()} trend="up" change={12} icon={Eye} />
        <StatCard label="Avg. Consistency" value={`${avgConsistency}%`} trend={avgConsistency > 80 ? 'up' : 'down'} change={2.4} icon={Target} />
        <StatCard label="Total Content" value={totalChannels} trend="up" change={15} icon={FileText} />
        <StatCard label="Campaigns Run" value={totalCampaigns} trend="up" change={100} icon={MousePointerClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Engagement Velocity Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Engagement Velocity</h3>
              <p className="text-xs text-slate-500">Predicted impact over recent campaigns</p>
            </div>
            <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-300 outline-none">
              <option>All Time</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConsist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                />
                <Area type="monotone" name="Engagement" dataKey="engagement" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                <Area type="monotone" name="Consistency" dataKey="consistency" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorConsist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown Pie Chart */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Platform Mix</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution of generated content</p>

          <div className="h-[250px] w-full flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCounts}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center pb-8">
                <div className="text-2xl font-bold text-white">{totalChannels}</div>
                <div className="text-[10px] uppercase text-slate-500">Assets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Campaign Performance Table */}
      <div className="glass-panel p-8 rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Campaign Performance Ledger</h3>
          <button 
            onClick={exportToCSV}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 text-xs font-mono text-slate-500 uppercase">
                <th className="pb-4 pl-2">Campaign Name</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Channels</th>
                <th className="pb-4 text-right">Brand Score</th>
                <th className="pb-4 text-right pr-2">Est. Impact</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group">
                  <td className="py-4 pl-2 font-medium text-white max-w-[200px] truncate">
                    {campaign.name}
                  </td>
                  <td className="py-4 text-slate-400">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${campaign.status === 'published' ? 'bg-green-500/10 text-green-400' :
                        campaign.status === 'scheduled' ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-slate-700 text-slate-400'
                      }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {campaign.channels.map((ch, i) => (
                        <div key={i} title={ch.platform} className={`w-2 h-2 rounded-full ${ch.platform === 'instagram' ? 'bg-pink-500' :
                            ch.platform === 'linkedin' ? 'bg-blue-500' :
                              ch.platform === 'twitter' ? 'bg-sky-400' :
                                'bg-slate-400'
                          }`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`${(campaign.metrics?.consistencyScore ?? 0) > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {campaign.metrics?.consistencyScore ?? 0}%
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2 font-mono text-slate-300">
                    {campaign.metrics?.predictedEngagement ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
