
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { BrandIdentity, MultiChannelCampaign, AppSettings, Persona, BrandContextType } from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';

const DEFAULT_BRAND: BrandIdentity = {
    name: "", industry: "", description: "", tone: "", voiceArchetype: "",
    keywords: [], bannedWords: [], values: "", audience: "", socialUrls: {}
};

const DEFAULT_SETTINGS: AppSettings = {
    n8nWebhookUrl: "", zapierWebhookUrl: "", enableN8n: false, enableZapier: false
};

export const BrandContext = createContext<BrandContextType>({} as BrandContextType);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [brand, setBrand] = useState<BrandIdentity>(DEFAULT_BRAND);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [campaigns, setCampaigns] = useState<MultiChannelCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setBrand(DEFAULT_BRAND);
            setSettings(DEFAULT_SETTINGS);
            setPersonas([]);
            setCampaigns([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const [b, s, p, c] = await Promise.all([
                db.getBrand().catch(() => DEFAULT_BRAND),
                db.getSettings().catch(() => DEFAULT_SETTINGS),
                db.getPersonas().catch(() => []),
                db.getCampaigns().catch(() => [])
            ]);
            if (b) setBrand(b);
            if (s) setSettings(s);
            setPersonas(Array.isArray(p) ? p : []);
            setCampaigns(Array.isArray(c) ? c : []);
        } catch (error) {
            console.error("Failed to load data from backend:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData, user?.id]);

    const updateBrand = async (newBrand: BrandIdentity) => {
        setBrand(newBrand);
        await db.saveBrand(newBrand);
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

    const updateSettings = async (newSettings: AppSettings) => {
        setSettings(newSettings);
        await db.saveSettings(newSettings);
    };

    const addPersona = async (p: Persona) => {
        const updated = [...personas, p];
        setPersonas(updated);
        await db.savePersona(p);
    };

    const removePersona = async (id: string) => {
        const updated = personas.filter(p => p.id !== id);
        setPersonas(updated);
        await db.removePersona(id);
    };

    return (
        <BrandContext.Provider value={{
            brand, updateBrand,
            campaigns, addCampaign, updateCampaign,
            settings, updateSettings,
            personas, addPersona, removePersona
        }}>
            {children}
        </BrandContext.Provider>
    );
};
