import React, { createContext, useState, useEffect, useCallback } from 'react';
import { BrandIdentity, MultiChannelCampaign, AppSettings, Persona, BrandContextType } from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';

const DEFAULT_BRAND: BrandIdentity = {
  name: "My Brand",
  industry: "Technology",
  description: "Innovative technology solutions for modern enterprises.",
  tone: "Professional, Authoritative, Inspiring",
  voiceArchetype: "The Visionary Leader",
  communicationStyle: "Clear, concise, data-driven",
  personality: "Innovative, Reliable, Forward-thinking",
  recommendedContentStyle: "Thought leadership, case studies, product insights",
  keywords: ["innovation", "scalability", "cloud", "security", "AI"],
  bannedWords: ["cheap", "unreliable", "slow", "outdated"],
  competitors: ["Competitor A", "Competitor B"],
  values: "Innovation, Integrity, Customer Focus",
  audience: "Tech founders, CTOs, Enterprise Product Leaders",
  website: "https://example.com",
  socialUrls: {
    instagram: "https://instagram.com/mybrand",
    linkedin: "https://linkedin.com/company/mybrand",
    twitter: "https://twitter.com/mybrand"
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  n8nWebhookUrl: "",
  zapierWebhookUrl: "",
  enableN8n: false,
  enableZapier: false,
  emailNotifications: true,
  campaignNotifications: true,
  securityAlerts: true,
  aiModel: "gemini-2.0-flash"
};

export const BrandContext = createContext<BrandContextType>({} as BrandContextType);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [brand, setBrand] = useState<BrandIdentity>(DEFAULT_BRAND);
  const [brands, setBrands] = useState<BrandIdentity[]>([]);
  const [activeBrand, setActiveBrand] = useState<BrandIdentity | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [campaigns, setCampaigns] = useState<MultiChannelCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setBrand(DEFAULT_BRAND);
      setBrands([]);
      setActiveBrand(null);
      setSettings(DEFAULT_SETTINGS);
      setPersonas([]);
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [brandList, currentBrand, s, p, c] = await Promise.all([
        db.getBrands().catch(() => []),
        db.getBrand().catch(() => DEFAULT_BRAND),
        db.getSettings().catch(() => DEFAULT_SETTINGS),
        db.getPersonas().catch(() => []),
        db.getCampaigns().catch(() => [])
      ]);

      const loadedBrands = Array.isArray(brandList) && brandList.length > 0 ? brandList : (currentBrand?.id ? [currentBrand] : [DEFAULT_BRAND]);
      setBrands(loadedBrands);

      const resolvedActive = currentBrand || loadedBrands[0] || DEFAULT_BRAND;
      setBrand(resolvedActive);
      setActiveBrand(resolvedActive);

      if (s) setSettings(s);
      setPersonas(Array.isArray(p) ? p : []);
      setCampaigns(Array.isArray(c) ? c : []);
    } catch (error) {
      console.error("Failed to load brand data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user?.id]);

  const updateBrand = async (newBrand: BrandIdentity) => {
    setBrand(newBrand);
    setActiveBrand(newBrand);
    setBrands(prev => prev.map(b => b.id === newBrand.id ? newBrand : b));
    await db.saveBrand(newBrand);
  };

  const createBrand = async (brandData: Partial<BrandIdentity>): Promise<BrandIdentity> => {
    const created = await db.createBrand(brandData);
    setBrands(prev => [...prev, created]);
    setBrand(created);
    setActiveBrand(created);
    return created;
  };

  const switchBrand = async (id: string) => {
    const switched = await db.switchActiveBrand(id);
    if (switched) {
      setBrand(switched);
      setActiveBrand(switched);
      // Reload campaigns & personas for this active brand
      const [p, c] = await Promise.all([
        db.getPersonas().catch(() => []),
        db.getCampaigns().catch(() => [])
      ]);
      setPersonas(Array.isArray(p) ? p : []);
      setCampaigns(Array.isArray(c) ? c : []);
    }
  };

  const deleteBrandWorkspace = async (id: string) => {
    await db.deleteBrand(id);
    const remaining = brands.filter(b => b.id !== id);
    setBrands(remaining);
    if (remaining.length > 0) {
      await switchBrand(remaining[0].id!);
    } else {
      setBrand(DEFAULT_BRAND);
      setActiveBrand(null);
    }
  };

  const addCampaign = async (newCampaign: MultiChannelCampaign) => {
    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    await db.saveCampaign(newCampaign);
  };

  const updateCampaign = async (updatedCampaign: MultiChannelCampaign) => {
    const updatedList = campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
    setCampaigns(updatedList);
    await db.updateCampaign(updatedCampaign);
  };

  const duplicateCampaign = async (id: string) => {
    const duplicated = await db.duplicateCampaign(id);
    if (duplicated) {
      setCampaigns(prev => [duplicated, ...prev]);
    }
  };

  const archiveCampaign = async (id: string) => {
    const target = campaigns.find(c => c.id === id);
    const newArchivedState = !target?.isArchived;
    await db.archiveCampaign(id, newArchivedState);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isArchived: newArchivedState, status: newArchivedState ? 'archived' : 'draft' } : c));
  };

  const deleteCampaign = async (id: string) => {
    await db.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await db.saveSettings(newSettings);
  };

  const addPersona = async (p: Persona) => {
    const updated = [...personas, p];
    setPersonas(updated);
    await db.savePersona(p);
  };

  const duplicatePersona = async (id: string) => {
    const duplicated = await db.duplicatePersona(id);
    if (duplicated) {
      setPersonas(prev => [...prev, duplicated]);
    }
  };

  const removePersona = async (id: string) => {
    const updated = personas.filter(p => p.id !== id);
    setPersonas(updated);
    await db.removePersona(id);
  };

  return (
    <BrandContext.Provider value={{
      brand,
      brands,
      activeBrand,
      updateBrand,
      createBrand,
      switchBrand,
      deleteBrandWorkspace,
      campaigns,
      addCampaign,
      updateCampaign,
      duplicateCampaign,
      archiveCampaign,
      deleteCampaign,
      settings,
      updateSettings,
      personas,
      addPersona,
      duplicatePersona,
      removePersona
    }}>
      {children}
    </BrandContext.Provider>
  );
};
