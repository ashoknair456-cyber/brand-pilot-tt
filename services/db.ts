import { BrandIdentity, MultiChannelCampaign, AppSettings, Persona, User, NotificationItem, AuditLogItem, TrendItem, CampaignVersion, SocialProfile, MarketSimilarityAnalysis, ContentSimilarityAnalysis } from '../types';

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
  enableZapier: false,
  emailNotifications: true,
  campaignNotifications: true,
  securityAlerts: true,
  aiModel: 'gemini-2.0-flash'
};

const DEFAULT_BRAND: BrandIdentity = {
  name: "",
  industry: "",
  description: "",
  mission: "",
  vision: "",
  tone: "",
  voiceArchetype: "",
  communicationStyle: "",
  personality: "",
  recommendedContentStyle: "",
  values: "",
  keywords: [],
  bannedWords: [],
  competitors: [],
  audience: "",
  website: "",
  socialUrls: {},
  liveStats: {}
};

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
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Login failed');
    }
    return await res.json();
  },

  signup: async (name: string, email: string, pass: string, mobile?: string, termsAccepted = true): Promise<any> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, mobile, termsAccepted })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Signup failed');
    }
    return await res.json();
  },

  createSession: (data: any) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    localStorage.setItem(KEYS.SESSION, JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      company: data.company,
      industry: data.industry,
      jobRole: data.jobRole,
      country: data.country,
      timezone: data.timezone,
      avatar: data.avatar,
      provider: data.provider,
      isVerified: Boolean(data.isVerified),
      plan: data.plan || 'free',
      subscriptionStatus: data.subscriptionStatus || 'active',
      subscriptionStartDate: data.subscriptionStartDate,
      subscriptionExpiresAt: data.subscriptionExpiresAt,
      accountStatus: data.accountStatus || 'active'
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

  getProfile: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return await res.json();
  },

  updateProfile: async (profile: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    if (data.user) db.createSession(data.user);
    return data.user;
  },

  updateProfileDetails: async (profile: Partial<User>): Promise<User> => {
    return db.updateProfile(profile);
  },

  logoutAll: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout-all`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch { }
  },

  deleteAccount: async (): Promise<void> => {
    const res = await fetch(`${API_URL}/users/account`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete account');
    }
    db.clearSession();
  },

  // --- Subscriptions ---
  getSubscription: async () => {
    const res = await fetch(`${API_URL}/subscription`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch subscription data');
    }
    return await res.json();
  },

  upgradeSubscription: async (plan: 'basic' | 'pro', interval: 'monthly' | 'yearly' = 'monthly', paymentDetails?: any) => {
    const res = await fetch(`${API_URL}/subscription/upgrade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan, interval, paymentDetails })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upgrade subscription');
    if (data.user) {
      db.createSession(data.user);
    }
    return data;
  },

  cancelSubscription: async () => {
    const res = await fetch(`${API_URL}/subscription/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
    if (data.user) {
      db.createSession(data.user);
    }
    return data;
  },

  // --- Multi-Brand Management ---
  getBrands: async (): Promise<BrandIdentity[]> => {
    try {
      const res = await fetch(`${API_URL}/brands`, {
        headers: getHeaders()
      });
      if (!res.ok) return [DEFAULT_BRAND];
      return await res.json();
    } catch {
      return [DEFAULT_BRAND];
    }
  },

  createBrand: async (brand: Partial<BrandIdentity>): Promise<BrandIdentity> => {
    const res = await fetch(`${API_URL}/brands`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(brand)
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to create brand');
      err.code = data.code;
      err.requiredPlan = data.requiredPlan;
      throw err;
    }
    return data;
  },

  updateBrandById: async (id: string, brand: Partial<BrandIdentity>): Promise<BrandIdentity> => {
    const res = await fetch(`${API_URL}/brands/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(brand)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update brand');
    return data;
  },

  switchBrand: async (id: string): Promise<BrandIdentity> => {
    const res = await fetch(`${API_URL}/brands/${id}/activate`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to switch brand');
    const data = await res.json();
    return data.brand || { ...DEFAULT_BRAND, id };
  },

  switchActiveBrand: async (id: string): Promise<BrandIdentity> => {
    return db.switchBrand(id);
  },

  deleteBrandWorkspace: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/brands/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete brand workspace');
  },

  deleteBrand: async (id?: string) => {
    if (id) {
      await db.deleteBrandWorkspace(id);
    } else {
      try {
        await fetch(`${API_URL}/brand`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch { }
    }
  },

  getBrand: async (): Promise<BrandIdentity> => {
    try {
      const res = await fetch(`${API_URL}/brand`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch brand');
      const data = await res.json();
      return { ...DEFAULT_BRAND, ...data };
    } catch {
      return DEFAULT_BRAND;
    }
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
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: AppSettings) => {
    await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
  },

  // --- Campaign Tracking & Versioning ---
  saveCampaign: async (campaign: MultiChannelCampaign) => {
    const res = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(campaign)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save campaign');
    }
  },

  getCampaigns: async (): Promise<MultiChannelCampaign[]> => {
    try {
      const res = await fetch(`${API_URL}/campaigns`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return await res.json();
    } catch {
      return [];
    }
  },

  updateCampaign: async (c: MultiChannelCampaign) => {
    try {
      await fetch(`${API_URL}/campaigns/${c.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(c)
      });
    } catch { }
  },

  duplicateCampaign: async (id: string): Promise<MultiChannelCampaign> => {
    const res = await fetch(`${API_URL}/campaigns/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate campaign');
    return data;
  },

  archiveCampaign: async (id: string, isArchived?: boolean): Promise<boolean> => {
    const res = await fetch(`${API_URL}/campaigns/${id}/archive`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isArchived })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to archive campaign');
    return data.isArchived === 1;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/campaigns/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  getCampaignVersions: async (id: string): Promise<CampaignVersion[]> => {
    try {
      const res = await fetch(`${API_URL}/campaigns/${id}/versions`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // --- Personas ---
  getPersonas: async (): Promise<Persona[]> => {
    try {
      const res = await fetch(`${API_URL}/personas`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch personas');
      return await res.json();
    } catch {
      return [];
    }
  },

  savePersona: async (p: Persona) => {
    const res = await fetch(`${API_URL}/personas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(p)
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to save persona');
      err.code = data.code;
      err.requiredPlan = data.requiredPlan;
      throw err;
    }
    return data;
  },

  duplicatePersona: async (id: string): Promise<Persona> => {
    const res = await fetch(`${API_URL}/personas/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate persona');
    return data;
  },

  removePersona: async (id: string) => {
    try {
      await fetch(`${API_URL}/personas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch { }
  },

  // --- Notifications ---
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.notifications || []);
    } catch {
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    return db.markNotificationRead(id);
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    return db.markAllNotificationsRead();
  },

  deleteNotification: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // --- Audit Logs ---
  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    try {
      const res = await fetch(`${API_URL}/audit-logs`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // --- Industry Trends ---
  getTrends: async (): Promise<TrendItem[]> => {
    try {
      const res = await fetch(`${API_URL}/trends`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  fetchTrends: async (industry: string, keywords: string[] | string = [], region = 'Global'): Promise<TrendItem[]> => {
    const kw = Array.isArray(keywords) ? keywords : [keywords].filter(Boolean);
    const res = await fetch(`${API_URL}/trends/fetch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ industry, keywords: kw, region })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trends');
    return data;
  },

  fetchLiveTrends: async (industry: string, keywords: string[] | string = [], region = 'Global'): Promise<TrendItem[]> => {
    return db.fetchTrends(industry, keywords, region);
  },

  saveTrend: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/trends/save/${id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save trend');
    return data.saved === 1;
  },

  toggleSaveTrend: async (id: string): Promise<boolean> => {
    return db.saveTrend(id);
  },

  deleteTrend: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/trends/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  getSystemStats: async () => {
    try {
      const res = await fetch(`${API_URL}/system/stats`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return { users: data.total_users || 0, companies: data.total_clients || 0, campaigns: data.total_campaigns || 0 };
      }
    } catch { }
    return { users: 0, companies: 0, campaigns: 0 };
  },

  // --- Member 2: Social Media Profiles & Integrations ---
  getSocialProfiles: async (): Promise<SocialProfile[]> => {
    try {
      const res = await fetch(`${API_URL}/social/profiles`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.profiles || [];
    } catch {
      return [];
    }
  },

  connectYouTube: async (url: string) => {
    const res = await fetch(`${API_URL}/social/youtube`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to connect YouTube channel');
    return data;
  },

  disconnectYouTube: async () => {
    const res = await fetch(`${API_URL}/social/youtube`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to disconnect YouTube');
    return data;
  },

  connectInstagram: async (url: string) => {
    const res = await fetch(`${API_URL}/social/instagram`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to connect Instagram profile');
    return data;
  },

  disconnectInstagram: async () => {
    const res = await fetch(`${API_URL}/social/instagram`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to disconnect Instagram');
    return data;
  },

  syncSocialProfiles: async () => {
    const res = await fetch(`${API_URL}/social/sync`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync social profiles');
    return data;
  },

  // --- Member 2: Customer Profile Enrichment ---
  enrichBrand: async (brandData?: Partial<BrandIdentity>) => {
    const res = await fetch(`${API_URL}/brand/enrich`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ brand: brandData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to enrich brand profile');
    return data.enrichment;
  },

  // --- Member 2: Market Similarity Analysis ---
  runMarketSimilarity: async (data: {
    brandName: string;
    brandDescription: string;
    industry: string;
    targetAudience: string;
    targetMarket: string;
    referenceBrand?: string;
  }): Promise<MarketSimilarityAnalysis> => {
    const res = await fetch(`${API_URL}/analysis/market-similarity`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Market similarity analysis failed');
    return result;
  },

  getMarketSimilarityHistory: async (): Promise<MarketSimilarityAnalysis[]> => {
    try {
      const res = await fetch(`${API_URL}/analysis/market-similarity`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.analyses || [];
    } catch {
      return [];
    }
  },

  // --- Member 2: Content Similarity Analysis ---
  runContentSimilarity: async (data: {
    brandDescription?: string;
    contentText: string;
    referenceContent: string;
  }): Promise<ContentSimilarityAnalysis> => {
    const res = await fetch(`${API_URL}/analysis/content-similarity`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Content similarity comparison failed');
    return result;
  },

  getContentSimilarityHistory: async (): Promise<ContentSimilarityAnalysis[]> => {
    try {
      const res = await fetch(`${API_URL}/analysis/content-similarity`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.analyses || [];
    } catch {
      return [];
    }
  },

  // --- Member 2 & Dashboard: Aggregated Telemetry ---
  getDashboardSummary: async () => {
    const res = await fetch(`${API_URL}/dashboard/summary`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to retrieve dashboard summary');
    }
    return await res.json();
  }
};

