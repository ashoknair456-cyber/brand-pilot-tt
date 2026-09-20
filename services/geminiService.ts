import { BrandIdentity, GeneratedChannelContent } from "../types";

const AI_BASE = 'http://localhost:5005/api/ai';

async function callAI(endpoint: string, body: any): Promise<any> {
  const res = await fetch(`${AI_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `AI request failed: ${res.statusText}`);
  }
  return res.json();
}

export interface ResearchResult {
  text: string;
  sources: { uri: string; title: string }[];
}

export const performMarketResearch = async (topic: string): Promise<ResearchResult> => {
  const data = await callAI('market-research', { topic });
  return { text: data.text || '', sources: data.sources || [] };
};

export const generateCampaignImage = async (
  prompt: string,
  aspectRatio: string,
  size: string,
  style?: string
): Promise<string> => {
  const refinedPrompt = style
    ? `${prompt}, ${style} style, high quality, 8k, detailed`
    : `${prompt}, high quality, 8k, professional`;
  const encodedPrompt = encodeURIComponent(refinedPrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Math.floor(Math.random() * 999999)}`;
};

export const editCampaignImage = async (base64Image: string, prompt: string): Promise<string> => {
  return base64Image;
};

export const analyzeBrandText = async (text: string): Promise<Partial<BrandIdentity>> => {
  try {
    const data = await callAI('analyze-brand', { text });
    return data;
  } catch (e) {
    console.error('analyzeBrandText failed:', e);
    throw e;
  }
};

export const translateContent = async (
  text: string,
  language: string,
  brandTone: string
): Promise<string> => {
  const data = await callAI('translate', { text, language, brandTone });
  return data.translated || text;
};

export const generateMultiChannelCampaign = async (
  brand: BrandIdentity,
  objective: string,
  audienceOverride?: string,
  researchContext?: string
): Promise<GeneratedChannelContent[]> => {
  const data = await callAI('generate-campaign', {
    brand,
    objective,
    audienceOverride,
    researchContext
  });
  return data.channels || [];
};

export const calculateConsistencyScore = async (
  campaign: GeneratedChannelContent[],
  brand: BrandIdentity
): Promise<number> => {
  try {
    const data = await callAI('consistency-score', { campaign, brand });
    return typeof data.score === 'number' ? data.score : 85;
  } catch {
    return 85;
  }
};

export const generateAnalyticsReport = async (data: any): Promise<string> => {
  const result = await callAI('analytics-report', { data });
  return result.report || '';
};
