import React from 'react';
import { Zap, HelpCircle } from 'lucide-react';
import { PaymentFrequency, MortgageInputs } from '../types/mortgage';
import { formatCurrency } from '../utils/formatters';

interface PaycheckSectionProps {
  inputs: MortgageInputs;
  baseMonthlyPayment: number;
  onChange: (updates: Partial<MortgageInputs>) => void;
}

export const PaycheckSection: React.FC<PaycheckSectionProps> = ({
  inputs,
  baseMonthlyPayment,
  onChange,
}) => {
  const options: Array<{
    id: PaymentFrequency;
    title: string;
    badge?: string;
    periods: number;
    amount: number;
    description: string;
    isAccelerated?: boolean;
  }> = [
    {
      id: 'monthly',
      title: 'Standard Monthly',
      periods: 12,
      amount: baseMonthlyPayment,
      description: '1 payment every month. Standard mortgage schedule.',
    },
    {
      id: 'bi_weekly_accelerated',
      title: 'Accelerated Bi-Weekly',
      badge: 'Couple Favorite ⭐',
      periods: 26,
      amount: baseMonthlyPayment / 2,
      description: 'Pay half of monthly payment every 2 weeks. Equals 13 full payments/year (1 extra payment/year)!',
      isAccelerated: true,
    },
    {
      id: 'semi_monthly',
      title: 'Semi-Monthly (2x / Month)',
      periods: 24,
      amount: baseMonthlyPayment / 2,
      description: 'Pay on the 1st and 15th (or your two monthly paydays). Equals 12 payments/year.',
    },
    {
      id: 'bi_weekly_regular',
      title: 'Regular Bi-Weekly',
      periods: 26,
      amount: (baseMonthlyPayment * 12) / 26,
      description: 'Total yearly payment divided equally into 26 paychecks.',
    },
    {
      id: 'weekly_accelerated',
      title: 'Accelerated Weekly',
      periods: 52,
      amount: baseMonthlyPayment / 4,
      description: 'Pay 1/4 monthly payment every week (equals 13 full payments/year).',
      isAccelerated: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>2.</span> Paycheck Frequency Strategy
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Paycheck Sync
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500">
        Align your mortgage payment with how you and your wife receive your paychecks.
      </p>

      {/* Frequency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = inputs.paymentFrequency === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ paymentFrequency: opt.id })}
              className={`p-4 rounded-xl text-left transition relative border flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {opt.isAccelerated && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {opt.title}
                  </div>
                  {opt.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white tracking-wide">
                      {opt.badge}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {opt.description}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Per Paycheck:</span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(opt.amount)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* How Accelerated Bi-Weekly Works Explanation Callout */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-800">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>How does Accelerated Bi-Weekly save so much?</span>
        </div>
        <p className="text-amber-800/90 leading-relaxed">
          Most months have 2 paychecks, but <strong>two months every year have 3 paychecks</strong> (26 paychecks total). 
          By paying half your monthly mortgage with every paycheck, you painlessly make <strong>26 half-payments = 13 full payments per year</strong>! That extra full monthly payment goes directly toward paying down principal, cutting ~4 to 6 years off a 30-year loan without having to budget for a large lump sum.
        </p>
      </div>
    </div>
  );
};
