import React, { useState, useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { generatePersonaAI } from '../services/geminiService';
import { Users, UserPlus, Trash2, Brain, AlertCircle, Sparkles, ArrowRight, Copy, Edit3, Loader2, Target, DollarSign, MapPin, Briefcase, GraduationCap, Compass, Layers } from 'lucide-react';
import { Persona } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Personas: React.FC = () => {
  const { brand, personas, addPersona, duplicatePersona, removePersona } = useContext(BrandContext);
  const { plan } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [limitError, setLimitError] = useState('');

  const [formData, setFormData] = useState<Partial<Persona>>({
    name: '',
    role: '',
    age: '',
    gender: 'All',
    location: '',
    occupation: '',
    incomeRange: '',
    education: '',
    interests: [],
    goals: [],
    painPoints: '',
    buyingBehaviour: '',
    preferredPlatforms: ['LinkedIn', 'Instagram'],
    contentPreferences: '',
    traits: []
  });

  const [traitInput, setTraitInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const personaLimit = plan === 'pro' ? Infinity : plan === 'basic' ? 5 : 1;
  const isLimitReached = personas.length >= personaLimit;

  const handleOpenCreateForm = () => {
    if (isLimitReached) {
      setLimitError(
        plan === 'free'
          ? 'Free tier is limited to 1 Persona. Upgrade to the $5 Basic Plan for 5 personas or Pro for unlimited personas.'
          : 'Basic plan is limited to 5 Personas. Upgrade to Pro for unlimited personas.'
      );
      return;
    }
    setLimitError('');
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      role: '',
      age: '28-45',
      gender: 'Any',
      location: 'North America / Global',
      occupation: '',
      incomeRange: '$75,000 - $140,000',
      education: 'Bachelor or Higher',
      interests: ['Industry Innovations', 'Efficiency Tools'],
      goals: ['Scale Revenue', 'Save Time'],
      painPoints: 'Struggling with inconsistent messaging and slow marketing turnaround.',
      buyingBehaviour: 'ROI-driven, researches reviews thoroughly before purchasing.',
      preferredPlatforms: ['LinkedIn', 'Twitter / X'],
      contentPreferences: 'Case studies, actionable frameworks, data benchmarks',
      traits: ['Analytical', 'Goal-Oriented']
    });
    setShowForm(true);
  };

  const handleEdit = (persona: Persona) => {
    setIsEditing(true);
    setEditingId(persona.id);
    setFormData({ ...persona });
    setShowForm(true);
  };

  const handleDuplicate = async (id: string) => {
    if (isLimitReached) {
      setLimitError('Cannot duplicate: Persona limit reached for your current plan tier.');
      return;
    }
    await duplicatePersona(id);
  };

  const handleGenerateAI = async () => {
    if (isLimitReached) {
      setLimitError('Persona limit reached. Upgrade to generate more AI personas.');
      return;
    }
    setIsGeneratingAI(true);
    setLimitError('');
    try {
      const generated = await generatePersonaAI(brand, brand.industry, brand.audience);
      if (generated) {
        setFormData(prev => ({
          ...prev,
          ...generated,
          traits: generated.traits || ['Pragmatic', 'Decisive'],
          preferredPlatforms: generated.preferredPlatforms || ['LinkedIn', 'Twitter']
        }));
        setIsEditing(false);
        setShowForm(true);
      }
    } catch (err: any) {
      alert(err.message || 'AI Persona generation failed. Please check AI key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddTrait = () => {
    if (traitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        traits: [...(prev.traits || []), traitInput.trim()]
      }));
      setTraitInput('');
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const handleAddGoal = () => {
    if (goalInput.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.role?.trim()) {
      alert('Persona name and role are required.');
      return;
    }

    const personaToSave: Persona = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      age: formData.age || '30-45',
      gender: formData.gender || 'Any',
      location: formData.location || 'Global',
      occupation: formData.occupation || formData.role,
      incomeRange: formData.incomeRange || 'Competitive',
      education: formData.education || 'Higher Education',
      interests: formData.interests || [],
      goals: formData.goals || [],
      painPoints: formData.painPoints || '',
      buyingBehaviour: formData.buyingBehaviour || '',
      preferredPlatforms: formData.preferredPlatforms || ['LinkedIn'],
      contentPreferences: formData.contentPreferences || '',
      traits: formData.traits || []
    };

    await addPersona(personaToSave);
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold font-tech text-white neon-text">Target Personas</h1>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {personas.length} / {plan === 'pro' ? '∞' : personaLimit} Profiles
            </span>
          </div>
          <p className="text-slate-400 text-sm">Design target buyer archetypes for hyper-personalized multi-channel campaigns.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 disabled:opacity-50"
          >
            {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate with AI
          </button>
          <button
            onClick={handleOpenCreateForm}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:scale-105"
          >
            <UserPlus className="w-4 h-4" /> Add Persona
          </button>
        </div>
      </header>

      {limitError && (
        <div className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Persona Limit Reached</h4>
              <p className="text-xs text-slate-300">{limitError}</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-900/30 whitespace-nowrap"
          >
            Upgrade Plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Persona Creation & Editing Modal */}
      {showForm && (
        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 shadow-2xl animate-in fade-in slide-in-from-top-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              {isEditing ? `Edit Persona: ${formData.name}` : 'New Persona Archetype'}
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
              Workspace: {brand.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 block">Persona Name *</label>
              <input
                className="w-full glass-input p-3 text-white text-sm"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Enterprise Emily"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 block">Professional Role *</label>
              <input
                className="w-full glass-input p-3 text-white text-sm"
                value={formData.role || ''}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Head of Growth / VP Marketing"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 block">Age Range</label>
              <input
                className="w-full glass-input p-3 text-white text-sm"
                value={formData.age || ''}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 32-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">Location / Region</label>
              <input
                className="w-full glass-input p-2.5 text-xs text-white"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. US / EMEA / Global"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">Income Range</label>
              <input
                className="w-full glass-input p-2.5 text-xs text-white"
                value={formData.incomeRange || ''}
                onChange={e => setFormData({ ...formData, incomeRange: e.target.value })}
                placeholder="e.g. $100k - $160k"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">Education</label>
              <input
                className="w-full glass-input p-2.5 text-xs text-white"
                value={formData.education || ''}
                onChange={e => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. Master's / MBA"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">Gender</label>
              <input
                className="w-full glass-input p-2.5 text-xs text-white"
                value={formData.gender || ''}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                placeholder="e.g. All / Female / Male"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Core Pain Points</label>
              <textarea
                className="w-full glass-input p-3 text-slate-200 h-24 resize-none text-xs"
                value={formData.painPoints || ''}
                onChange={e => setFormData({ ...formData, painPoints: e.target.value })}
                placeholder="What challenges, roadblocks, or frustrations do they encounter daily?"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Buying Behaviour & Motivations</label>
              <textarea
                className="w-full glass-input p-3 text-slate-200 h-24 resize-none text-xs"
                value={formData.buyingBehaviour || ''}
                onChange={e => setFormData({ ...formData, buyingBehaviour: e.target.value })}
                placeholder="How do they evaluate solutions, make purchase decisions, and assess ROI?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Content & Channel Preferences</label>
              <input
                className="w-full glass-input p-3 text-white text-xs mb-2"
                value={formData.contentPreferences || ''}
                onChange={e => setFormData({ ...formData, contentPreferences: e.target.value })}
                placeholder="e.g. Whitepapers, podcast snippets, LinkedIn carousels"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Key Goals & Aspirations</label>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 glass-input p-2 text-xs text-white"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  placeholder="Add goal..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGoal(); } }}
                />
                <button onClick={handleAddGoal} className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">+</button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {formData.goals?.map((g, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-purple-950/50 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Personality Traits</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 glass-input p-2 text-xs text-white"
                value={traitInput}
                onChange={e => setTraitInput(e.target.value)}
                placeholder="e.g. Pragmatic, Data-driven, Visionary"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTrait(); } }}
              />
              <button onClick={handleAddTrait} className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.traits?.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-950/40 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => { setShowForm(false); setIsEditing(false); }}
              className="px-5 py-2.5 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              {isEditing ? 'Update Persona' : 'Save Persona'}
            </button>
          </div>
        </div>
      )}

      {/* Personas List */}
      {personas.length === 0 && !showForm ? (
        <div className="col-span-full flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Target Profiles Defined Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Create custom customer archetypes or generate them automatically using BrandPilot AI to tailor campaign voice and messaging.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleGenerateAI}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Generate with AI
            </button>
            <button
              onClick={handleOpenCreateForm}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" /> Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map(persona => (
            <div
              key={persona.id}
              className="glass-panel p-6 rounded-3xl relative group hover:border-cyan-500/50 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg border border-white/10">
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{persona.name}</h3>
                    <div className="text-xs text-cyan-400 font-mono">{persona.role} • {persona.age}</div>
                    {persona.location && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" /> {persona.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDuplicate(persona.id)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Duplicate Persona"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(persona)}
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Edit Persona"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete persona "${persona.name}"?`)) {
                        removePersona(persona.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Persona"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Traits & Goals */}
              <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                {persona.painPoints && (
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1">Pain Points</span>
                    <p className="text-slate-300 italic">"{persona.painPoints}"</p>
                  </div>
                )}

                {persona.buyingBehaviour && (
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Buying Behaviour</span>
                    <p className="text-slate-300">{persona.buyingBehaviour}</p>
                  </div>
                )}

                {persona.traits && persona.traits.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Psychographic Traits</span>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.traits.map((t, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-white/5 text-slate-300 text-[11px] rounded-full border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Personas;
