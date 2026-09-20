
export interface BrandIdentity {
  name: string;
  industry: string;
  description: string;
  tone: string;
  voiceArchetype: string; // e.g., "The Sage", "The Rebel"
  keywords: string[];
  bannedWords: string[];
  values: string;
  audience: string;
  socialUrls?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  liveStats?: {
    followers: number;
    engagementRate: string;
    lastScraped: string;
    topPostUrl?: string;
  };
}

export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'email' | 'blog' | 'facebook';

export interface GeneratedChannelContent {
  platform: Platform;
  content: string;
  headline?: string;
  hashtags?: string[];
  imagePrompt?: string;
  generatedImage?: string;
}

export interface MultiChannelCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'draft' | 'generated' | 'scheduled' | 'published';
  scheduledDate?: string;
  language?: string;
  channels: GeneratedChannelContent[];
  createdAt: string;
  metrics: {
    consistencyScore: number;
    predictedEngagement: number;
  };
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  history?: number[];
}

export interface AppSettings {
  n8nWebhookUrl: string;
  zapierWebhookUrl: string;
  enableN8n: boolean;
  enableZapier: boolean;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  age: string;
  traits: string[];
  painPoints: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  isVerified?: boolean;
}

export interface BrandContextType {
  brand: BrandIdentity;
  updateBrand: (b: BrandIdentity) => void;
  campaigns: MultiChannelCampaign[];
  addCampaign: (c: MultiChannelCampaign) => void;
  updateCampaign: (c: MultiChannelCampaign) => void;
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  personas: Persona[];
  addPersona: (p: Persona) => void;
  removePersona: (id: string) => void;
}
