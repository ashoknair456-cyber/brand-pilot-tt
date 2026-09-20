import { AppSettings } from '../types';

export const triggerN8nWorkflow = async (
    webhookUrl: string,
    payload: any
): Promise<any> => {
    if (!webhookUrl) {
        throw new Error("n8n Webhook URL is not configured.");
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("n8n Automation Failed:", error);
        throw error;
    }
};
