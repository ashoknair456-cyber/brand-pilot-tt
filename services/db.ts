
import { BrandIdentity, MultiChannelCampaign, AppSettings, Persona, User } from '../types';

// Storage Keys
const KEYS = {
  BRAND: 'brandpilot_brand',
  CAMPAIGNS: 'brandpilot_campaigns',
  SETTINGS: 'brandpilot_settings',
  PERSONAS: 'brandpilot_personas',
  USERS: 'brandpilot_users',
  SESSION: 'brandpilot_session'
};

// Default Empty States
const DEFAULT_SETTINGS: AppSettings = {
  n8nWebhookUrl: "",
  zapierWebhookUrl: "",
  enableN8n: false,
  enableZapier: false
};

const DEFAULT_BRAND: BrandIdentity = {
  name: "",
  industry: "",
  description: "",
  tone: "",
  voiceArchetype: "",
  values: "",
  keywords: [],
  bannedWords: [],
  audience: "",
  socialUrls: {},
};

// --- Database Operations ---

// --- Database Operations ---

const API_URL = 'http://localhost:5005/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && token !== 'undefined' && token !== 'null' ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const db = {
  // --- Auth & Users ---
  login: async (email: string, pass: string): Promise<any> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.message || 'Login failed');
    }
    return await res.json();
  },

  signup: async (name: string, email: string, pass: string): Promise<any> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.message || 'Signup failed');
    }
    return await res.json();
  },

  createSession: (data: any) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      localStorage.removeItem('token');
    }
    localStorage.setItem(KEYS.SESSION, JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      provider: data.provider,
      isVerified: Boolean(data.isVerified)
    }));
  },

  getSession: (): User | null => {
    try {
      const data = localStorage.getItem(KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem(KEYS.SESSION);
  },

  // --- Brand DNA ---
  getBrand: async (): Promise<BrandIdentity> => {
    try {
      const res = await fetch(`${API_URL}/brand`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch brand');
      const data = await res.json();
      return { ...DEFAULT_BRAND, ...data };
    } catch (e) { return DEFAULT_BRAND; }
  },

  saveBrand: async (brand: BrandIdentity) => {
    await fetch(`${API_URL}/brand`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(brand)
    });
  },

  // --- Settings ---
  getSettings: async (): Promise<AppSettings> => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      return { ...DEFAULT_SETTINGS, ...data };
    } catch (e) { return DEFAULT_SETTINGS; }
  },

  saveSettings: async (settings: AppSettings) => {
    await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
  },

  // --- Campaign Tracking ---
  saveCampaign: async (campaign: MultiChannelCampaign) => {
    await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(campaign)
    });
  },

  getCampaigns: async (): Promise<MultiChannelCampaign[]> => {
    try {
      const res = await fetch(`${API_URL}/campaigns`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return await res.json();
    } catch (e) { return []; }
  },

  getPersonas: async (): Promise<Persona[]> => {
    try {
      const res = await fetch(`${API_URL}/personas`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch personas');
      return await res.json();
    } catch (e) { return []; }
  },

  savePersona: async (p: Persona) => {
    await fetch(`${API_URL}/personas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...p, brand_id: 1 })
    });
  },

  removePersona: async (id: string) => {
    try {
      await fetch(`${API_URL}/personas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) { }
  },

  updateCampaign: async (c: MultiChannelCampaign) => {
    try {
      await fetch(`${API_URL}/campaigns/${c.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(c)
      });
    } catch (e) { }
  },

  getSystemStats: async () => {
    try {
      const res = await fetch(`${API_URL}/system/stats`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return { users: data.total_users || 0, companies: data.total_clients || 0 };
      }
    } catch (e) { }
    return { users: 0, companies: 0 };
  },

  deleteBrand: async () => {
    try {
      await fetch(`${API_URL}/brand`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) { }
  }
};
