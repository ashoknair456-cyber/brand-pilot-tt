
export interface BrandIdentity {
  id?: string;
  user_id?: string;
  name: string;
  logo?: string;
  industry: string;
  description: string;
  mission?: string;
  vision?: string;
  tone: string;
  voiceArchetype: string; // e.g., "The Sage", "The Rebel", "The Visionary Leader"
  communicationStyle?: string;
  personality?: string;
  recommendedContentStyle?: string;
  keywords: string[];
  bannedWords: string[];
  competitors?: string[];
  values: string;
  audience: string;
  website?: string;
  socialUrls?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  liveStats?: {
    followers?: number;
    engagementRate?: string;
    lastScraped?: string;
    topPostUrl?: string;
  };
  isDefault?: boolean;
}

export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'email' | 'blog' | 'facebook';

export interface GeneratedChannelContent {
  platform: Platform;
  content: string;
  headline?: string;
  hook?: string;
  hashtags?: string[];
  cta?: string;
  imagePrompt?: string;
  generatedImage?: string;
}

export interface ConsistencyCategoryScores {
  tone: number;
  voiceArchetype: number;
  vocabulary: number;
  brandValues: number;
  bannedWordsCompliance: number;
  audienceAlignment: number;
  ctaConsistency: number;
  messagingCohesion: number;
}

export interface ConsistencyAuditResult {
  score: number;
  categories: ConsistencyCategoryScores;
  detectedProblems: string[];
  suggestions: string[];
  improvedVariant?: string;
}

export interface ContentQualityAuditResult {
  overallScore: number;
  grammarScore: number;
  clarityScore: number;
  readabilityScore: number;
  ctaStrengthScore: number;
  audienceRelevanceScore: number;
  repetitionCheck: string;
  suggestions: string[];
  highlightedStrengths: string[];
}

export interface CampaignVersion {
  id: string;
  campaign_id: string;
  version_number: number;
  name: string;
  objective: string;
  channels: GeneratedChannelContent[];
  metrics: {
    consistencyScore?: number;
    predictedEngagement?: number;
  };
  change_summary: string;
  createdAt: string;
}

export interface MultiChannelCampaign {
  id: string;
  user_id?: string;
  brand_id?: string;
  name: string;
  objective: string;
  status: 'draft' | 'generated' | 'scheduled' | 'published' | 'archived';
  scheduledDate?: string;
  language?: string;
  channels: GeneratedChannelContent[];
  createdAt: string;
  updatedAt?: string;
  qualityScore?: number;
  qualityAudit?: Partial<ContentQualityAuditResult>;
  consistencyReport?: Partial<ConsistencyAuditResult>;
  isArchived?: boolean;
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
  emailNotifications?: boolean;
  campaignNotifications?: boolean;
  securityAlerts?: boolean;
  aiModel?: string;
}

export interface Persona {
  id: string;
  user_id?: string;
  brand_id?: string;
  name: string;
  role: string;
  age: string;
  gender?: string;
  location?: string;
  occupation?: string;
  incomeRange?: string;
  education?: string;
  interests?: string[];
  goals?: string[];
  painPoints: string;
  buyingBehaviour?: string;
  preferredPlatforms?: string[];
  contentPreferences?: string;
  traits: string[];
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read_status: number;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  user_id: string;
  action: string;
  details: string;
  resource_id?: string;
  ip_address?: string;
  createdAt: string;
}

export interface TrendItem {
  id: string;
  user_id: string;
  industry: string;
  keyword?: string;
  region?: string;
  title: string;
  summary: string;
  source?: string;
  url?: string;
  relevanceScore: number;
  actionSuggestion?: string;
  saved: number;
  createdAt: string;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: string;
  expiresAt?: string;
  interval?: 'monthly' | 'yearly';
  amount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  company?: string;
  industry?: string;
  jobRole?: string;
  country?: string;
  timezone?: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  isVerified?: boolean;
  termsAccepted?: boolean;
  plan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscription?: UserSubscription;
  accountStatus?: string;
  token?: string;
  createdAt?: string;
}

export interface SubscriptionUsage {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  campaignsCount: number;
  campaignsLimit: number; // -1 for unlimited
  personasCount: number;
  personasLimit: number; // -1 for unlimited
  canUseMarketResearch: boolean;
  canUseAnalyticsAudit: boolean;
  canUseCustomVoice: boolean;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limits: {
    campaigns: string;
    personas: string;
    channels: string;
    support: string;
  };
  ctaText: string;
}

export interface BrandContextType {
  brand: BrandIdentity;
  brands: BrandIdentity[];
  activeBrand: BrandIdentity | null;
  updateBrand: (b: BrandIdentity) => Promise<void>;
  createBrand: (b: Partial<BrandIdentity>) => Promise<BrandIdentity>;
  switchBrand: (id: string) => Promise<void>;
  deleteBrandWorkspace: (id: string) => Promise<void>;
  campaigns: MultiChannelCampaign[];
  addCampaign: (c: MultiChannelCampaign) => Promise<void>;
  updateCampaign: (c: MultiChannelCampaign) => Promise<void>;
  duplicateCampaign: (id: string) => Promise<void>;
  archiveCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  settings: AppSettings;
  updateSettings: (s: AppSettings) => Promise<void>;
  personas: Persona[];
  addPersona: (p: Persona) => Promise<void>;
  duplicatePersona: (id: string) => Promise<void>;
  removePersona: (id: string) => Promise<void>;
}

export interface SocialProfile {
  id: string;
  user_id: string;
  brand_id?: string;
  platform: 'youtube' | 'instagram';
  profile_url: string;
  handle?: string;
  channel_id?: string;
  display_name?: string;
  avatar_url?: string;
  subscriber_count: number;
  total_views: number;
  media_count: number;
  engagement_rate: string;
  status: 'connected' | 'linked_key_required' | 'linked_token_required' | 'api_error' | 'not_found';
  status_message?: string;
  raw_data?: any;
  last_synced_at?: string;
}

export interface MarketSimilarityDimensions {
  industrySimilarity: number;
  targetAudienceSimilarity: number;
  topicSimilarity: number;
  categorySimilarity: number;
  descriptionSimilarity: number;
}

export interface MarketSimilarityAnalysis {
  id: string;
  user_id: string;
  brand_name: string;
  brand_description: string;
  industry: string;
  target_audience: string;
  target_market: string;
  reference_brand?: string;
  overall_score: number;
  dimensions: MarketSimilarityDimensions;
  strong_matches: string[];
  improvement_areas: string[];
  recommendations: string[];
  algorithm_used: string;
  createdAt: string;
}

export interface ContentSimilarityMetrics {
  cosineSimilarity: number;
  phraseOverlapIndex: number;
  unigramOverlapRatio: number;
}

export interface ContentSimilarityAnalysis {
  id: string;
  user_id: string;
  brand_description?: string;
  content_text: string;
  reference_content: string;
  overall_score: number;
  common_topics: string[];
  keyword_overlap: string[];
  content_differences: string[];
  suggestions: string[];
  algorithm_used: string;
  metrics?: ContentSimilarityMetrics;
  createdAt: string;
}


