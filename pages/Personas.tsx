
import React, { useState, useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';
import { Users, UserPlus, Trash2, Brain, AlertCircle } from 'lucide-react';
import { Persona } from '../types';

const Personas: React.FC = () => {
  const { personas, addPersona, removePersona } = useContext(BrandContext);
  const [showForm, setShowForm] = useState(false);
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({ traits: [] });
  const [traitInput, setTraitInput] = useState('');

  const handleAddTrait = () => {
    if (traitInput) {
      setNewPersona(prev => ({
        ...prev,
        traits: [...(prev.traits || []), traitInput]
      }));
      setTraitInput('');
    }
  };

  const handleSave = () => {
    if (newPersona.name && newPersona.role) {
      addPersona({
        id: Date.now().toString(),
        name: newPersona.name,
        role: newPersona.role,
        age: newPersona.age || 'Unknown',
        traits: newPersona.traits || [],
        painPoints: newPersona.painPoints || ''
      } as Persona);
      setShowForm(false);
      setNewPersona({ traits: [] });
    }
  };

  return (
    <>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold font-tech text-white mb-2 neon-text">Target Personas</h1>
          <p className="text-slate-400">Simulate audience reaction and tailor content to specific archetypes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
        >
          <UserPlus className="w-4 h-4" /> Add Persona
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Form */}
        {showForm && (
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-white mb-4">New Profile Simulation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Name</label>
                <input
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white"
                  value={newPersona.name || ''}
                  onChange={e => setNewPersona({ ...newPersona, name: e.target.value })}
                  placeholder="e.g. Corporate Carl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase">Role</label>
                  <input
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white"
                    value={newPersona.role || ''}
                    onChange={e => setNewPersona({ ...newPersona, role: e.target.value })}
                    placeholder="e.g. CTO"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">Age Range</label>
                  <input
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white"
                    value={newPersona.age || ''}
                    onChange={e => setNewPersona({ ...newPersona, age: e.target.value })}
                    placeholder="e.g. 40-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Traits (Add one by one)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white"
                    value={traitInput}
                    onChange={e => setTraitInput(e.target.value)}
                    placeholder="e.g. Skeptical, Budget-focused"
                    onKeyDown={e => e.key === 'Enter' && handleAddTrait()}
                  />
                  <button onClick={handleAddTrait} className="px-4 bg-slate-700 rounded-lg text-white hover:bg-slate-600">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newPersona.traits?.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-800">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Core Pain Points</label>
                <textarea
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white h-20"
                  value={newPersona.painPoints || ''}
                  onChange={e => setNewPersona({ ...newPersona, painPoints: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">Save Profile</button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {personas.length === 0 && !showForm && (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <AlertCircle className="w-10 h-10 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No Target Profiles Defined</h3>
            <p className="text-slate-500 text-sm mt-2">Add personas to help the AI simulate audience reactions.</p>
          </div>
        )}

        {/* List */}
        {personas.map(persona => (
          <div key={persona.id} className="glass-panel p-6 rounded-2xl relative group hover:border-cyan-500/50 transition-all">
            <button
              onClick={() => removePersona(persona.id)}
              className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {persona.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{persona.name}</h3>
                <div className="text-sm text-cyan-400 font-mono">{persona.role} • {persona.age}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Brain className="w-3 h-3" /> Psychographics
                </div>
                <div className="flex flex-wrap gap-2">
                  {persona.traits.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 uppercase mb-1">Pain Points</div>
                <p className="text-sm text-slate-300 italic">"{persona.painPoints}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Personas;
