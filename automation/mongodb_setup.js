/**
 * MongoDB Setup & Schema Validation
 * Run this script in a Node.js environment with 'mongoose' installed
 * or use these schemas as a reference for your backend integration.
 */

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("\x1b[31m%s\x1b[0m", "Error: MONGODB_URI is not defined.");
        console.error("Please add 'MONGODB_URI=mongodb+srv://...' to your .env.local file in the project root.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\x1b[32m%s\x1b[0m', 'MongoDB Connected Successfully');
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Connection Failed:', err.message);
        process.exit(1);
    }
};

// --- SCHEMAS ---

// Brand Identity Schema
const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    industry: String,
    description: String,
    website: String,
    socialUrls: {
        instagram: String,
        twitter: String,
        facebook: String,
        linkedin: String,
        youtube: String
    },
    metrics: {
        followers: Number,
        engagementRate: String,
        lastScraped: Date
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Campaign Schema
const CampaignSchema = new mongoose.Schema({
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    name: String,
    objective: String,
    status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
    platforms: [String],
    startDate: Date,
    endDate: Date,
    results: Object
});

// --- MODELS ---
export const Brand = mongoose.model('Brand', BrandSchema);
export const Campaign = mongoose.model('Campaign', CampaignSchema);

// --- INITIALIZATION ---
const initDB = async () => {
    await connectDB();
    console.log('Database Initialized. Verification complete.');

    // Example: Check if collections exist or create dummy data
    // await Brand.create({ name: 'Test Brand' });

    console.log('Done.');
    process.exit(0);
};

// Return models if imported, otherwise run init
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initDB();
}
