
import React, { useContext, useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Webhook, Key, Database, Save, Check, User as UserIcon, ShieldAlert, Activity, Building, Users } from 'lucide-react';
import { BrandContext } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';

const Settings: React.FC = () => {
  const { settings, updateSettings, updateBrand } = useContext(BrandContext);
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  // Stats State
  const [stats, setStats] = useState({ users: 0, companies: 0 });

  useEffect(() => {
    db.getSystemStats().then(setStats);
  }, []);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(name);
      setProfileMsg({ type: 'success', text: 'Display name updated!' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to update profile' });
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

  const handleDeleteBrand = () => {
    if (confirm("ARE YOU SURE? This will delete all Brand DNA, Campaigns, and Personas. This action cannot be undone.")) {
      db.deleteBrand();
      // Reset local context state (simplified)
      updateBrand({
        name: "", industry: "", description: "", tone: "", voiceArchetype: "", values: "", keywords: [], bannedWords: [], audience: "", socialUrls: {}
      });
      window.location.reload();
    }
  };

  const toggleN8n = () => setLocalSettings(p => ({ ...p, enableN8n: !p.enableN8n }));
  const toggleZapier = () => setLocalSettings(p => ({ ...p, enableZapier: !p.enableZapier }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-tech text-white mb-2">System Configuration</h1>
          <p className="text-slate-400">Manage integrations, account security, and system data.</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </header>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-tech">{stats.users}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest">Active Users</div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-tech">{stats.companies}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest">Registered Companies</div>
          </div>
        </div>
      </div>

      {/* DB Connection */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-green-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white">SQLite Database</h3>
            <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Connected — {`server-legacy/brandpilot.db`}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          <div>Latency: 12ms</div>
          <div>Region: us-east-1</div>
        </div>
      </div>

      {/* Profile Management */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <UserIcon className="w-5 h-5 text-cyan-400" /> Account Management
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input p-3 text-white"
            />
          </div>
          {profileMsg && (
            <p className={`text-xs ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{profileMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors border border-slate-700"
          >
            {profileSaving ? 'Updating...' : 'Update Name'}
          </button>
        </form>

        <hr className="border-slate-700/50 my-6" />

        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-400" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-2">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full glass-input p-3 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full glass-input p-3 text-white"
              required
            />
          </div>
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {passwordSaving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* API Keys */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Key className="w-5 h-5 text-yellow-400" /> API Keys
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Gemini API Key</label>
            <input
              type="password"
              value="********************************"
              disabled
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-500 font-mono cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-2">Managed via Environment Variables (Secure)</p>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="glass-panel p-8 rounded-2xl border-t border-cyan-500/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Webhook className="w-5 h-5 text-cyan-400" /> Automation & Webhooks
        </h2>

        <div className="space-y-6">

          {/* n8n */}
          <div className={`p-6 rounded-xl border transition-all ${localSettings.enableN8n ? 'bg-slate-800/50 border-cyan-500/50' : 'bg-slate-900/30 border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">n8n</div>
                <div>
                  <div className="text-white font-medium">n8n Workflow Webhook</div>
                  <div className="text-xs text-slate-500">Trigger post-generation workflows</div>
                </div>
              </div>
              <button onClick={toggleN8n}>
                {localSettings.enableN8n
                  ? <ToggleRight className="w-10 h-10 text-cyan-400" />
                  : <ToggleLeft className="w-10 h-10 text-slate-600" />
                }
              </button>
            </div>

            {localSettings.enableN8n && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-mono text-slate-400 mb-2">Webhook URL</label>
                <input
                  type="text"
                  value={localSettings.n8nWebhookUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, n8nWebhookUrl: e.target.value })}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Zapier */}
          <div className={`p-6 rounded-xl border transition-all ${localSettings.enableZapier ? 'bg-slate-800/50 border-orange-500/50' : 'bg-slate-900/30 border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">Z</div>
                <div>
                  <div className="text-white font-medium">Zapier Integration</div>
                  <div className="text-xs text-slate-500">Connect to 5000+ apps</div>
                </div>
              </div>
              <button onClick={toggleZapier}>
                {localSettings.enableZapier
                  ? <ToggleRight className="w-10 h-10 text-orange-400" />
                  : <ToggleLeft className="w-10 h-10 text-slate-600" />
                }
              </button>
            </div>

            {localSettings.enableZapier && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-mono text-slate-400 mb-2">Zapier Webhook URL</label>
                <input
                  type="text"
                  value={localSettings.zapierWebhookUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, zapierWebhookUrl: e.target.value })}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full bg-slate-950 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm focus:border-orange-500 outline-none"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-8 rounded-2xl border border-red-900/30 bg-red-950/10">
        <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" /> Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">Delete Company Details</h3>
            <p className="text-sm text-slate-400 max-w-md">Permanently remove your Brand DNA, Campaigns, and Personas from the local system. This action is irreversible.</p>
          </div>
          <button
            onClick={handleDeleteBrand}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-900/20"
          >
            Delete All Data
          </button>
        </div>
      </div>

    </div>
  );
};

export default Settings;
