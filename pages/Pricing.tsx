import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Smartphone,
  Building2,
  Receipt,
  Download,
  Clock,
  Layers,
  Users,
  Dna,
  X,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Globe
} from 'lucide-react';
import { SubscriptionPlan } from '../types';

export const Pricing: React.FC = () => {
  const { user, plan: currentPlan, upgradePlan, cancelPlan, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<'upi' | 'qr' | 'card' | 'netbanking'>('upi');
  
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);

  // Form Inputs
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [qrTimer, setQrTimer] = useState(600); // 10 mins

  // QR Code Timer countdown
  useEffect(() => {
    let timer: any;
    if (isCheckoutOpen && activePaymentTab === 'qr' && qrTimer > 0) {
      timer = window.setInterval(() => setQrTimer(prev => Math.max(0, prev - 1)), 1000);
    }
    return () => { if (timer) window.clearInterval(timer); };
  }, [isCheckoutOpen, activePaymentTab, qrTimer]);

  const handleOpenCheckout = (planToUpgrade: SubscriptionPlan) => {
    if (planToUpgrade === currentPlan) return;
    if (planToUpgrade === 'free') {
      handleCancelSubscription();
      return;
    }
    setSelectedPlan(planToUpgrade);
    setCheckoutError('');
    setCheckoutSuccess(false);
    setCompletedTransaction(null);
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setUpiId(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'alex@okhdfcbank');
    setQrTimer(600);
    setIsCheckoutOpen(true);
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (plan === 'basic') return interval === 'yearly' ? 50 : 5;
    if (plan === 'pro') return interval === 'yearly' ? 190 : 19;
    return 0;
  };

  const getPlanInrPrice = (plan: SubscriptionPlan) => {
    if (plan === 'basic') return interval === 'yearly' ? 4199 : 499;
    if (plan === 'pro') return interval === 'yearly' ? 15999 : 1599;
    return 0;
  };

  const handleProcessPayment = async (methodType: 'upi' | 'qr' | 'card' | 'netbanking') => {
    if (!selectedPlan || selectedPlan === 'free') return;

    if (methodType === 'upi' && !upiId.includes('@')) {
      setCheckoutError('Please enter a valid UPI ID (e.g., yourname@okhdfcbank or 9876543210@paytm)');
      return;
    }

    setLoading(true);
    setCheckoutError('');

    try {
      const priceUsd = getPlanPrice(selectedPlan);
      const priceInr = getPlanInrPrice(selectedPlan);
      const paymentBrand = 
        methodType === 'upi' ? `UPI (${selectedUpiApp.toUpperCase()} - ${upiId})` :
        methodType === 'qr' ? 'UPI Dynamic QR Scan' :
        methodType === 'netbanking' ? `NetBanking (${selectedBank} Bank)` :
        `Card (Visa ending in ${cardNumber.slice(-4) || '4242'})`;

      const result = await upgradePlan(selectedPlan as 'basic' | 'pro', interval, {
        brand: paymentBrand,
        last4: cardNumber.slice(-4) || '4242',
        name: cardName || user?.name,
        method: methodType,
        amount: priceUsd,
        amountInr: priceInr
      });

      const txnData = {
        transactionId: result.transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        plan: selectedPlan,
        interval,
        amountUsd: priceUsd,
        amountInr: priceInr,
        paymentMethod: paymentBrand,
        timestamp: new Date().toLocaleString(),
        userEmail: user?.email,
        userName: user?.name
      };

      setCompletedTransaction(txnData);
      setCheckoutSuccess(true);
      if (refreshUser) refreshUser();
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to revert to the Free plan? You will lose access to premium multi-brand and persona quotas.')) {
      return;
    }
    setCanceling(true);
    try {
      await cancelPlan();
      if (refreshUser) refreshUser();
      alert('Subscription canceled. Your account is now on the Free tier.');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription.');
    } finally {
      setCanceling(false);
    }
  };

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'Free Starter',
      badge: 'Explorer',
      priceMonthly: 0,
      priceYearly: 0,
      priceInrMonthly: 0,
      description: 'Test the AI waters and set up your initial Brand DNA archetype.',
      features: [
        '3 Multi-Channel Campaign generations (lifetime)',
        '1 Customer Persona slot',
        '1 Brand Workspace',
        '3 Core channels (Instagram, LinkedIn, Twitter)',
        'Standard generation compute',
        'Community support'
      ],
      highlight: false,
      cta: currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free'
    },
    {
      id: 'basic' as SubscriptionPlan,
      name: 'Basic Plan',
      badge: 'Most Popular',
      priceMonthly: 5,
      priceYearly: 50,
      priceInrMonthly: 499,
      description: 'Ideal for growing brands, creators, and modern solo entrepreneurs.',
      features: [
        '25 Multi-Channel Campaigns / month',
        '5 Customer Persona slots',
        'Up to 3 Brand Workspaces',
        'All 5 Channels (IG, LinkedIn, Twitter, FB, Email)',
        'Deep AI Market Intelligence Research',
        'AI Content Rewriter & Quality Analyzer',
        'n8n & Zapier Webhook Automations',
        'Multi-Language Translation (50+ Languages)',
        'Standard Priority Support'
      ],
      highlight: true,
      popular: true,
      cta: currentPlan === 'basic' ? 'Active Plan' : 'Upgrade to Basic — $5 (₹499)'
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Pro Intelligence',
      badge: 'Ultimate Power',
      priceMonthly: 19,
      priceYearly: 190,
      priceInrMonthly: 1599,
      description: 'For agencies, scaling enterprises, and high-velocity marketing teams.',
      features: [
        'Unlimited AI Campaign Generations',
        'Unlimited Customer Persona Archetypes',
        'Unlimited Multi-Brand Workspaces',
        'Priority Gemini 2.0 Flash Compute Engine',
        'Executive AI Analytics Audit Reports',
        '8-Dimension Consistency Engine & Magic Editor',
        'Real-Time Live Social Metric Scraper',
        'Custom Tone of Voice Fine-Tuning',
        'Dedicated Webhooks & Telemetry Export',
        '24/7 Priority Dedicated Support'
      ],
      highlight: false,
      cta: currentPlan === 'pro' ? 'Active Plan' : 'Upgrade to Pro — $19 (₹1599)'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 text-slate-200">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Scalable Intelligence Architecture
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-tech text-white tracking-tight">
          Transparent Pricing & Direct Payment
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Choose your plan and checkout directly using <strong className="text-cyan-400">UPI, QR Code, Credit/Debit Card</strong> or NetBanking with immediate plan activation.
        </p>

        {/* Current Plan Badge */}
        {user && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono">
              <span className="text-slate-400">Your Active Tier:</span>
              <span className="font-bold text-cyan-400 uppercase tracking-wider">{currentPlan} Plan</span>
              {currentPlan !== 'free' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  className="ml-2 text-[10px] text-red-400 hover:text-red-300 underline"
                >
                  {canceling ? 'Canceling...' : 'Cancel'}
                </button>
              )}
            </span>
          </div>
        )}

        {/* Billing Period Selector */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              interval === 'monthly'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              interval === 'yearly'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] border border-green-500/30 font-mono">
              Save ~17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          const price = interval === 'yearly' ? p.priceYearly : p.priceMonthly;
          const inrPrice = interval === 'yearly' ? p.priceYearly * 84 : (p.priceMonthly * 84 || 0);
          const periodLabel = interval === 'yearly' ? '/year' : '/month';

          return (
            <div
              key={p.id}
              className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.02] ${
                p.highlight
                  ? 'border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] bg-gradient-to-b from-slate-900/90 to-slate-950/90'
                  : 'border border-slate-800 bg-slate-950/60'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-tech text-white">{p.name}</h3>
                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">{p.badge}</div>
                  </div>
                  {p.id === 'basic' ? (
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                      <Zap className="w-5 h-5" />
                    </div>
                  ) : p.id === 'pro' ? (
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black font-tech text-white">${price}</span>
                    <span className="text-slate-400 text-xs font-mono">{periodLabel}</span>
                    {price > 0 && (
                      <span className="text-xs text-slate-400 font-mono">
                        (₹{inrPrice})
                      </span>
                    )}
                  </div>
                  {interval === 'yearly' && p.priceYearly > 0 && (
                    <div className="text-[11px] text-green-400 font-mono mt-1">
                      Billed annually (${(p.priceYearly / 12).toFixed(2)}/mo equivalent)
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{p.description}</p>
                </div>

                <hr className="border-slate-800/80 my-6" />

                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Included Capabilities:
                  </div>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="p-0.5 rounded-full bg-cyan-500/10 text-cyan-400 mt-0.5 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => handleOpenCheckout(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                      : p.highlight
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Current Plan
                    </>
                  ) : (
                    <>
                      {p.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass-panel p-8 md:p-10 rounded-3xl border border-slate-800 mt-12 overflow-x-auto">
        <h2 className="text-2xl font-bold font-tech text-white mb-6">Detailed Plan Comparison & Limits</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <th className="pb-4 pr-4">Capabilities</th>
              <th className="pb-4 px-4 text-center">Free Starter ($0)</th>
              <th className="pb-4 px-4 text-center text-cyan-400 font-bold">Basic Plan ($5/mo)</th>
              <th className="pb-4 pl-4 text-center text-purple-400 font-bold">Pro Intelligence ($19/mo)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-light">
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">AI Campaign Generations</td>
              <td className="py-3.5 px-4 text-center text-slate-400 font-mono">3 Lifetime</td>
              <td className="py-3.5 px-4 text-center text-cyan-300 font-mono font-bold">25 / Month</td>
              <td className="py-3.5 pl-4 text-center text-purple-300 font-mono font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Customer Personas Quota</td>
              <td className="py-3.5 px-4 text-center text-slate-400 font-mono">1 Persona</td>
              <td className="py-3.5 px-4 text-center text-cyan-300 font-mono font-bold">5 Personas</td>
              <td className="py-3.5 pl-4 text-center text-purple-300 font-mono font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Brand Workspaces</td>
              <td className="py-3.5 px-4 text-center text-slate-400 font-mono">1 Workspace</td>
              <td className="py-3.5 px-4 text-center text-cyan-300 font-mono font-bold">3 Workspaces</td>
              <td className="py-3.5 pl-4 text-center text-purple-300 font-mono font-bold">Unlimited Workspaces</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Multi-Channel Matrix (5 Channels)</td>
              <td className="py-3.5 px-4 text-center text-slate-400">3 Channels</td>
              <td className="py-3.5 px-4 text-center text-green-400 font-bold">✓ Included</td>
              <td className="py-3.5 pl-4 text-center text-green-400 font-bold">✓ Included</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Deep AI Market Research</td>
              <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
              <td className="py-3.5 px-4 text-center text-green-400 font-bold">✓ Included</td>
              <td className="py-3.5 pl-4 text-center text-green-400 font-bold">✓ Included</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">8-Dimension Consistency Audit</td>
              <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
              <td className="py-3.5 px-4 text-center text-green-400 font-bold">✓ Included</td>
              <td className="py-3.5 pl-4 text-center text-green-400 font-bold">✓ Included</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Executive AI Analytics Audit</td>
              <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
              <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
              <td className="py-3.5 pl-4 text-center text-green-400 font-bold">✓ Priority Pipeline</td>
            </tr>
            <tr>
              <td className="py-3.5 pr-4 font-medium text-slate-200">Webhook Automation (n8n / Zapier)</td>
              <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
              <td className="py-3.5 px-4 text-center text-green-400 font-bold">✓ Included</td>
              <td className="py-3.5 pl-4 text-center text-green-400 font-bold">✓ Priority Trigger</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Multi-Method Payment Gateway & Receipt Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 relative shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 my-8">
            
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* If Payment Successful -> Show Activated Plan Breakdown & Receipt */}
            {checkoutSuccess && completedTransaction ? (
              <div className="space-y-6 py-2 animate-in fade-in">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-tech text-white">Payment Confirmed & Plan Activated!</h3>
                  <p className="text-xs text-slate-400">
                    Your account has been upgraded to the <strong className="text-cyan-400 uppercase">{completedTransaction.plan} Plan</strong>.
                  </p>
                </div>

                {/* Plan Entitlements & Requirements Box */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white font-tech uppercase text-sm">
                        {completedTransaction.plan} Tier Entitlements
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-green-400 bg-green-950/60 px-2 py-0.5 rounded-full border border-green-500/30">
                      ACTIVE NOW
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Campaign Quota: <strong>{completedTransaction.plan === 'basic' ? '25 / Month' : 'Unlimited'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Customer Personas: <strong>{completedTransaction.plan === 'basic' ? '5 Slots' : 'Unlimited'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Brand Workspaces: <strong>{completedTransaction.plan === 'basic' ? 'Up to 3 Brands' : 'Unlimited'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>8-Dimension Consistency Audits: <strong>Enabled</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Live Market Trend Research: <strong>Enabled</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>n8n & Zapier Automations: <strong>Active Pipeline</strong></span>
                    </div>
                  </div>
                </div>

                {/* Transaction Receipt Details */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction ID:</span>
                    <span className="text-slate-200 select-all">{completedTransaction.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="text-cyan-300">{completedTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Billing Interval:</span>
                    <span className="text-white capitalize">{completedTransaction.interval}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Amount Paid:</span>
                    <span className="text-green-400 font-bold text-sm">
                      ${completedTransaction.amountUsd} USD / ₹{completedTransaction.amountInr} INR
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timestamp:</span>
                    <span className="text-slate-400 text-[10px]">{completedTransaction.timestamp}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => { setIsCheckoutOpen(false); navigate('/generate'); }}
                    className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Launch Campaign Studio Now
                  </button>
                  <button
                    onClick={() => { setIsCheckoutOpen(false); navigate('/personas'); }}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" /> Setup Personas
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Modal Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-tech text-white uppercase">
                      Checkout — {selectedPlan} Plan
                    </h3>
                    <div className="text-xs text-slate-400">Choose your preferred payment method</div>
                  </div>
                </div>

                {/* Order Summary Ribbon */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">Total Amount Due</span>
                    <span className="text-2xl font-bold font-tech text-white">
                      ${getPlanPrice(selectedPlan)} USD <span className="text-sm font-normal text-slate-400 font-mono">/ ₹{getPlanInrPrice(selectedPlan)} INR</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 uppercase">
                    {interval} Plan
                  </span>
                </div>

                {/* Payment Method Tabs */}
                <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-2">
                  <button
                    type="button"
                    onClick={() => { setActivePaymentTab('upi'); setCheckoutError(''); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activePaymentTab === 'upi' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI ID / App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActivePaymentTab('qr'); setCheckoutError(''); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activePaymentTab === 'qr' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActivePaymentTab('card'); setCheckoutError(''); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activePaymentTab === 'card' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActivePaymentTab('netbanking'); setCheckoutError(''); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activePaymentTab === 'netbanking' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>NetBanking</span>
                  </button>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* TAB 1: UPI ID & Apps */}
                {activePaymentTab === 'upi' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Quick App Selectors */}
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">
                        Select UPI App:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay', icon: 'G' },
                          { id: 'phonepe', name: 'PhonePe', icon: 'P' },
                          { id: 'paytm', name: 'Paytm', icon: 'Pt' },
                          { id: 'bhim', name: 'BHIM / Cred', icon: 'B' }
                        ].map(app => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                              selectedUpiApp === app.id
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                              {app.icon}
                            </span>
                            <span className="text-[10px] truncate">{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* VPA / UPI ID Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Enter UPI ID / VPA *
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi or username@okhdfcbank"
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        A payment request will be sent to your UPI application.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment('upi')}
                      disabled={loading || !upiId}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying with UPI...
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Pay ₹{getPlanInrPrice(selectedPlan)} ($ {getPlanPrice(selectedPlan)}) with UPI
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 2: Dynamic QR Code Scan & Pay */}
                {activePaymentTab === 'qr' && (
                  <div className="space-y-4 text-center animate-in fade-in">
                    <p className="text-xs text-slate-400">
                      Scan this QR code with any UPI app (GPay, PhonePe, Paytm, BHIM, Cred)
                    </p>

                    <div className="p-4 bg-white rounded-2xl w-52 h-52 mx-auto flex flex-col items-center justify-center shadow-xl border-4 border-cyan-500/40 relative">
                      {/* High-Tech Dynamic QR Simulation */}
                      <div className="w-full h-full bg-slate-950 p-2 rounded-lg flex flex-col items-center justify-center text-center space-y-1">
                        <QrCode className="w-28 h-28 text-cyan-400 mx-auto" />
                        <span className="text-[9px] font-mono text-cyan-300 font-bold block">
                          ₹{getPlanInrPrice(selectedPlan)} • BrandPilot
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>QR Valid For: <strong className="text-cyan-300">{Math.floor(qrTimer / 60)}:{('0' + (qrTimer % 60)).slice(-2)}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment('qr')}
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying QR Transaction...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> I Have Completed the QR Payment
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 3: Credit / Debit Card */}
                {activePaymentTab === 'card' && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyan-500 outline-none"
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono focus:border-cyan-500 outline-none"
                          placeholder="4242 •••• •••• 4242"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          required
                          placeholder="MM/YY"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono focus:border-cyan-500 outline-none text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          required
                          maxLength={4}
                          placeholder="•••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono focus:border-cyan-500 outline-none text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment('card')}
                      disabled={loading}
                      className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-bold text-white text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Authorizing 3D Secure Card...
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Pay ${getPlanPrice(selectedPlan)} with Card
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 4: NetBanking */}
                {activePaymentTab === 'netbanking' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">
                        Popular Banking Portals:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Others'].map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                              selectedBank === bank
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {bank} Bank
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment('netbanking')}
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Connecting to Bank Portal...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5" /> Proceed to {selectedBank} NetBanking
                        </>
                      )}
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-center text-slate-500 pt-1">
                  By confirming payment, you authorize immediate plan activation under our{' '}
                  <Link to="/terms" className="text-cyan-400 underline">Terms of Service</Link>.
                </p>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Pricing;
