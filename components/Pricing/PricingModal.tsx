
import React, { useState } from 'react';
import { AuthService } from '../../services/mockBackend';
import { Plan } from '../../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const handleSubscribe = (plan: Plan) => {
    AuthService.updateUserPlan(plan);
    alert(`Switched to ${plan} plan!`);
    onClose();
  };

  const plans = [
    {
      id: Plan.FREE,
      name: "FREE",
      price: "$0",
      period: "forever",
      words: "3,000 words",
      undetectable: "500 words",
      features: [
        { text: "Essay tools (5 uses/day)", check: true },
        { text: "ScholarChat", check: false },
        { text: "3 PDF uploads / month", check: true },
        { text: "Watermarked exports", check: true },
        { text: "EN language only", check: true },
        { text: "Community support", check: true },
        { text: "Contains Ads", check: true, negative: true },
      ]
    },
    {
      id: Plan.BASIC,
      name: "BASIC",
      price: billingCycle === 'yearly' ? "$9.99" : "$13.99",
      period: "per month",
      words: "25,000 words",
      undetectable: "5,000 words",
      features: [
        { text: "Unlimited Essay Tools", check: true },
        { text: "ScholarChat Access", check: true },
        { text: "15 PDF uploads / month", check: true },
        { text: "Clean Export (No Watermark)", check: true },
        { text: "EN + 12 Languages", check: true },
        { text: "Email Support", check: true },
        { text: "No Ads", check: true },
      ]
    },
    {
      id: Plan.PRO,
      name: "PRO",
      price: billingCycle === 'yearly' ? "$19.99" : "$27.99",
      period: "per month",
      words: "100,000 words",
      undetectable: "10,000 words",
      popular: true,
      features: [
        { text: "Unlimited Essay Tools", check: true },
        { text: "Priority ScholarChat", check: true },
        { text: "50 PDF uploads / month", check: true },
        { text: "APA 7 Citation Template", check: true },
        { text: "EN + 30 Languages", check: true },
        { text: "Priority Email + Chat", check: true },
        { text: "No Ads", check: true },
      ]
    },
    {
      id: Plan.ULTRA,
      name: "ULTRA",
      price: billingCycle === 'yearly' ? "$49.99" : "$69.99",
      period: "per month",
      words: "UNLIMITED",
      undetectable: "50,000 words",
      features: [
        { text: "Unlimited Essay Tools", check: true },
        { text: "Priority ScholarChat", check: true },
        { text: "200 PDF uploads / month", check: true },
        { text: "White-label Exports", check: true },
        { text: "EN + 50 Languages", check: true },
        { text: "1h Live Onboarding", check: true },
        { text: "No Ads", check: true },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-7xl overflow-hidden relative shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors z-10">
          <i className="fas fa-times text-lg"></i>
        </button>

        <div className="text-center pt-12 pb-8 px-4">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Upgrade Your Writing Potential</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">Choose the plan that fits your academic needs. Save big with yearly billing.</p>

          {/* Toggle */}
          <div className="inline-flex bg-gray-100 p-1.5 rounded-full relative mb-4">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Yearly 
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">2 Months Free</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 border-t border-gray-100">
          {plans.map((plan) => (
            <div key={plan.id} className={`p-8 flex flex-col relative ${plan.popular ? 'bg-indigo-50/30' : 'bg-white'}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 w-full bg-indigo-600 text-white text-center text-xs font-bold py-1 uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6 mt-4">
                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 font-medium text-sm">/{billingCycle === 'yearly' ? 'mo' : 'mo'}</span>
                </div>
                {billingCycle === 'yearly' && plan.id !== Plan.FREE && (
                    <div className="text-xs text-indigo-600 font-bold mt-1">Billed ${parseFloat(plan.price.replace('$','')) * 12} yearly</div>
                )}
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-feather-alt text-indigo-500"></i>
                      <span className="font-bold text-gray-900">{plan.words}</span>
                   </div>
                   <div className="text-xs text-gray-500">GPT-3.5 / Gemini Flash Credits</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                   <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-shield-alt text-purple-600"></i>
                      <span className="font-bold text-gray-900">{plan.undetectable}</span>
                   </div>
                   <div className="text-xs text-gray-500">Undetectable AI Words</div>
                </div>

                <div className="space-y-3 pt-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className={`flex items-start gap-3 text-sm ${feature.check ? 'text-gray-700' : 'text-gray-300 line-through'}`}>
                       <div className={`mt-0.5 ${feature.check ? (feature.negative ? 'text-gray-400' : 'text-green-500') : 'text-gray-200'}`}>
                         <i className={`fas ${feature.check ? 'fa-check-circle' : 'fa-circle'}`}></i>
                       </div>
                       <span className={feature.check ? '' : 'text-gray-400'}>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                  plan.id === Plan.PRO 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                    : plan.id === Plan.FREE 
                       ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                       : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {plan.id === Plan.FREE ? 'Current Plan' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-6 text-center text-xs text-gray-400 border-t border-gray-100">
           Secure payment via Stripe. Cancel anytime. 100% money-back guarantee for 7 days.
        </div>
      </div>
    </div>
  );
};
