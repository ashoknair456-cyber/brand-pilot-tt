import React, { useContext, useState, useEffect } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Webhook,
  Key,
  Database,
  Save,
  Check,
  User as UserIcon,
  ShieldAlert,
  Activity,
  Building,
  Users,
  Bell,
  Clock,
  LogOut,
  Sparkles,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { BrandContext } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { AuditLogItem } from '../types';

const Settings: React.FC = () => {
  const { settings, updateSettings, updateBrand } = useContext(BrandContext);
  const { user, updateProfile, changePassword, logoutAllDevices, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'automation' | 'audit' | 'danger'>('profile');
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    company: user?.company || '',
    industry: user?.industry || '',
    jobRole: user?.jobRole || '',
    country: user?.country || '',
    timezone: user?.timezone || 'UTC'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Stats State
  const [stats, setStats] = useState({ users: 0, companies: 0 });

  useEffect(() => {
    db.getSystemStats().then(setStats);
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        company: user.company || '',
        industry: user.industry || '',
        jobRole: user.jobRole || '',
        country: user.country || '',
        timezone: user.timezone || 'UTC'
      });
    }
  }, [user]);

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const logs = await db.getAuditLogs();
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'Profile details saved successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm("Are you sure you want to invalidate all active login sessions?")) {
      await logoutAllDevices();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("EXTREME WARNING: Are you sure you want to permanently delete your BrandPilot user account? This cannot be undone.")) {
      try {
        await db.deleteAccount();
        logout();
      } catch (err: any) {
        alert(err.message || 'Failed to delete account.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-tech text-white neon-text mb-1">System Configuration</h1>
          <p className="text-slate-400 text-xs lg:text-sm">Manage user profile, webhooks, security protocols, and audit logs.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            saved ? 'bg-green-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'profile' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Account & Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'notifications' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'automation' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4" /> Automation (n8n & Zapier)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security Audit Log
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'danger' ? 'border-red-400 text-red-400' : 'border-transparent text-slate-400 hover:text-red-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Danger Zone
        </button>
      </div>

      {/* Tab: Profile & Account */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-cyan-400" /> User Profile Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full glass-input p-3 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full glass-input p-3 text-slate-500 text-xs cursor-not-allowed bg-slate-950/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    value={profileForm.mobile}
                    onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full glass-input p-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="Acme Technologies"
                    className="w-full glass-input p-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Job Role / Title</label>
                  <input
                    type="text"
                    value={profileForm.jobRole}
                    onChange={e => setProfileForm({ ...profileForm, jobRole: e.target.value })}
                    placeholder="Marketing Director"
                    className="w-full glass-input p-3 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Country / Region</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="United States"
                    className="w-full glass-input p-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">Time Zone</label>
                  <input
                    type="text"
                    value={profileForm.timezone}
                    onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}
                    placeholder="UTC, EST, PST"
                    className="w-full glass-input p-3 text-white text-xs"
                  />
                </div>
              </div>

              {profileMsg && (
                <div className={`p-3 rounded-xl text-xs font-mono ${profileMsg.type === 'success' ? 'bg-green-950/40 text-green-300 border border-green-500/30' : 'bg-red-950/40 text-red-300 border border-red-500/30'}`}>
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Update Profile Details'}
              </button>
            </form>
          </div>

          {/* Change Password Panel */}
          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-yellow-400" /> Account Security & Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input p-3 text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full glass-input p-3 text-white text-xs"
                  required
                />
              </div>

              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs font-mono ${passwordMsg.type === 'success' ? 'bg-green-950/40 text-green-300 border border-green-500/30' : 'bg-red-950/40 text-red-300 border border-red-500/30'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="px-4 py-2.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Logout All Devices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" /> Notification Channels & Triggers
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Email Digest & Alerts</h4>
                <p className="text-xs text-slate-400">Receive email notifications for campaign schedules, OTPs, and trend reports.</p>
              </div>
              <button onClick={() => setLocalSettings({ ...localSettings, emailNotifications: !localSettings.emailNotifications })}>
                {localSettings.emailNotifications !== false ? (
                  <ToggleRight className="w-8 h-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Campaign Generation Alerts</h4>
                <p className="text-xs text-slate-400">In-app notifications when autonomous multi-channel AI generation completes.</p>
              </div>
              <button onClick={() => setLocalSettings({ ...localSettings, campaignNotifications: !localSettings.campaignNotifications })}>
                {localSettings.campaignNotifications !== false ? (
                  <ToggleRight className="w-8 h-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Security & Login Alerts</h4>
                <p className="text-xs text-slate-400">Alerts for new logins, password updates, and token lifecycle events.</p>
              </div>
              <button onClick={() => setLocalSettings({ ...localSettings, securityAlerts: !localSettings.securityAlerts })}>
                {localSettings.securityAlerts !== false ? (
                  <ToggleRight className="w-8 h-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Automation */}
      {activeTab === 'automation' && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-cyan-400" /> Automation Webhooks
          </h2>

          <div className="space-y-6">
            {/* n8n */}
            <div className={`p-6 rounded-2xl border transition-all ${localSettings.enableN8n ? 'bg-slate-800/50 border-cyan-500/50' : 'bg-slate-900/30 border-white/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm">
                    n8n
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">n8n Workflow Webhook</h4>
                    <p className="text-xs text-slate-400">Automatically push scheduled and generated content streams to self-hosted n8n nodes.</p>
                  </div>
                </div>
                <button onClick={() => setLocalSettings({ ...localSettings, enableN8n: !localSettings.enableN8n })}>
                  {localSettings.enableN8n ? <ToggleRight className="w-8 h-8 text-cyan-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                </button>
              </div>

              {localSettings.enableN8n && (
                <div className="mt-3">
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Webhook Endpoint URL</label>
                  <input
                    type="text"
                    value={localSettings.n8nWebhookUrl}
                    onChange={e => setLocalSettings({ ...localSettings, n8nWebhookUrl: e.target.value })}
                    placeholder="https://n8n.yourdomain.com/webhook/brandpilot-stream"
                    className="w-full glass-input p-2.5 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Zapier */}
            <div className={`p-6 rounded-2xl border transition-all ${localSettings.enableZapier ? 'bg-slate-800/50 border-orange-500/50' : 'bg-slate-900/30 border-white/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-sm">
                    Z
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Zapier Catch Hook</h4>
                    <p className="text-xs text-slate-400">Forward campaign assets into 5,000+ marketing apps and social management platforms.</p>
                  </div>
                </div>
                <button onClick={() => setLocalSettings({ ...localSettings, enableZapier: !localSettings.enableZapier })}>
                  {localSettings.enableZapier ? <ToggleRight className="w-8 h-8 text-orange-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                </button>
              </div>

              {localSettings.enableZapier && (
                <div className="mt-3">
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Zapier Webhook URL</label>
                  <input
                    type="text"
                    value={localSettings.zapierWebhookUrl}
                    onChange={e => setLocalSettings({ ...localSettings, zapierWebhookUrl: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full glass-input p-2.5 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Audit Log */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Account Audit Trail
            </h2>
            <button
              onClick={loadAuditLogs}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
            >
              Refresh Logs
            </button>
          </div>

          {isLoadingAudit ? (
            <div className="text-center py-12 text-xs font-mono text-slate-500">Loading audit events...</div>
          ) : auditLogs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white font-mono uppercase text-[11px] mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-xs">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500 italic">No audit records found.</div>
          )}
        </div>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="glass-panel p-8 rounded-3xl border border-red-500/30 bg-red-950/10 space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Purge Current Brand Identity</h4>
                <p className="text-xs text-slate-400 max-w-md">Resets Brand DNA parameters and archetype settings for the active workspace.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Reset current Brand DNA?")) {
                    updateBrand({
                      name: "My Brand", industry: "", description: "", tone: "", voiceArchetype: "", values: "", keywords: [], bannedWords: [], audience: "", socialUrls: {}
                    });
                  }
                }}
                className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-xl text-xs font-bold border border-red-500/40"
              >
                Reset Brand DNA
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-300">Delete User Account</h4>
                <p className="text-xs text-slate-400 max-w-md">Permanently delete your profile, workspaces, campaigns, and personas from the system.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/30"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
