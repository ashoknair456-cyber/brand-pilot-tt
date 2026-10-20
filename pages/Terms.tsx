import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, FileText, CheckCircle2, Rocket, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import { useAuth } from '../contexts/AuthContext';

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const sections = [
    {
      id: "1",
      title: "1. Introduction",
      content: "Welcome to BrandPilot AI (\"BrandPilot\", \"we\", \"us\", or \"our\"). BrandPilot is an AI-powered autonomous brand intelligence, marketing automation, and multi-channel campaign generation platform designed to help businesses, creators, and marketers scale their cross-channel brand presence with consistent voice and resonance."
    },
    {
      id: "2",
      title: "2. Acceptance of Terms",
      content: "By accessing, registering for, or using BrandPilot services, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to all terms and conditions, you must not access or use the application or its associated APIs."
    },
    {
      id: "3",
      title: "3. Account Registration & Security",
      content: "To use BrandPilot, you must create an account using a valid email address or authentic Google OAuth authentication. You are responsible for maintaining the confidentiality of your login credentials, 2-factor authentication secrets, and for all activities that occur under your account. You must notify BrandPilot immediately upon becoming aware of any unauthorized account access."
    },
    {
      id: "4",
      title: "4. User Responsibilities",
      content: "You agree to use BrandPilot in compliance with all applicable local, national, and international laws and regulations. You are solely responsible for all brand identity materials, descriptions, keywords, values, prompts, and social media links you configure within the system."
    },
    {
      id: "5",
      title: "5. Subscription Plans",
      content: "BrandPilot provides tiered service plans, including Free Tier, Basic Plan ($5.00/month or $50.00/year), and Pro Plan ($19.00/month or $190.00/year). Each subscription tier is defined by designated generation quotas, persona slots, AI intelligence models, and automation features. Subscription details are viewable in the Pricing section."
    },
    {
      id: "6",
      title: "6. Payments and Billing",
      content: "Paid subscriptions are billed on a recurring monthly or annual billing cycle based on the subscription tier selected at checkout. All prices are in USD. You authorize BrandPilot to charge your designated payment method for all applicable fees upon subscription renewal until explicitly canceled."
    },
    {
      id: "7",
      title: "7. Free vs. Paid Feature Tiers",
      content: "The Free plan provides access to essential Brand DNA configuration, 1 Persona slot, and a lifetime limit of 3 AI campaign generations. The Basic Plan ($5/mo) unlocks 25 campaigns/month, 5 Persona slots, multi-channel generation (Instagram, LinkedIn, Twitter, Facebook, Email), AI market research, and webhook integrations. The Pro Plan provides unlimited campaign generation, unlimited personas, deep executive analytics audits, and priority compute."
    },
    {
      id: "8",
      title: "8. Acceptable Use Policy",
      content: "You agree not to use BrandPilot to generate, distribute, or facilitate spam, malware, deceptive marketing, defamatory material, hate speech, explicit illegal content, or intellectual property infringements. BrandPilot reserves the right to terminate accounts that violate this policy without notice."
    },
    {
      id: "9",
      title: "9. Intellectual Property & Content Ownership",
      content: "You retain full ownership of all custom brand assets, trade names, and user data input into BrandPilot. To the extent permitted by law, you own the marketing copy, campaign texts, and generated content created for your brand via BrandPilot. BrandPilot and its underlying software, algorithms, designs, and brand trademarks remain the exclusive intellectual property of BrandPilot AI."
    },
    {
      id: "10",
      title: "10. Privacy and Data Handling",
      content: "We take user data privacy seriously. User information, passwords (hashed with bcrypt), OAuth tokens, and brand metadata are stored securely using industry standard encryption protocols. We do not sell your personal data or your brand identity models to third parties for advertising purposes."
    },
    {
      id: "11",
      title: "11. Account Suspension and Termination",
      content: "You may terminate your account at any time via Account Settings or by contacting support. BrandPilot reserves the right to suspend or terminate accounts that breach these Terms, commit payment fraud, or engage in abusive platform behavior."
    },
    {
      id: "12",
      title: "12. Service Availability & Uptime",
      content: "While BrandPilot strives to maintain high service availability (99.9% uptime target), service delivery may experience temporary interruptions due to scheduled maintenance, upstream AI provider downtime (e.g. Google Gemini API), or network conditions. Services are provided on an \"AS IS\" and \"AS AVAILABLE\" basis."
    },
    {
      id: "13",
      title: "13. Limitation of Liability",
      content: "In no event shall BrandPilot, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities arising out of or related to your use of the service."
    },
    {
      id: "14",
      title: "14. Changes to Terms",
      content: "BrandPilot reserves the right to modify or replace these Terms at any time. Material updates will be communicated through in-app notifications or via your registered email address. Continued use of the platform after updates constitutes acceptance of the new Terms."
    },
    {
      id: "15",
      title: "15. Contact Information",
      content: "If you have any questions, inquiries, or legal concerns regarding these Terms & Conditions, please contact us at support@brandpilot.ai or through our central support desk."
    }
  ];

  return (
    <div className="min-h-screen relative text-slate-200 selection:bg-cyan-500/30">
      <ThreeBackground mode="constellation" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Rocket className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-tech font-bold text-white tracking-wider text-lg">BRANDPILOT</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest ml-2 uppercase">Legal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        
        {/* Header Hero */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl mb-10 border border-slate-700/50 backdrop-blur-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-tech text-white mb-3 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before utilizing the BrandPilot autonomous marketing intelligence platform.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Version 2.4.0</span>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div
              key={sec.id}
              id={`section-${sec.id}`}
              className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold font-tech text-white mb-3 flex items-center gap-2 text-cyan-300">
                {sec.title}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links & Footer Disclaimer */}
        <div className="mt-12 glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Have questions regarding our Terms?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our team is available to clarify any aspect of our licensing, subscription tiers, or acceptable use guidelines.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/pricing"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              View Pricing & Plans
            </Link>
            <a
              href="mailto:support@brandpilot.ai"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Contact Support
            </a>
          </div>
          <p className="text-[11px] text-slate-500 pt-4 border-t border-slate-800/80">
            Disclaimer: This document is provided as product terms for BrandPilot AI and does not constitute formal legal counsel.
          </p>
        </div>

      </main>
    </div>
  );
};

export default Terms;
