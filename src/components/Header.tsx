import React from 'react';
import { Home, Sparkles, HeartHandshake, RotateCcw } from 'lucide-react';
import { MortgageInputs } from '../types/mortgage';

interface HeaderProps {
  onApplyPreset: (preset: Partial<MortgageInputs>) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onApplyPreset, onReset }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  OurHome <span className="text-emerald-600 font-semibold text-lg sm:text-xl">Mortgage & Paycheck Planner</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <HeartHandshake className="w-3.5 h-3.5" /> Couple Edition
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Plan extra payments, align with your paychecks, and save thousands in interest together
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden lg:inline">
              Quick Scenarios:
            </span>
            <button
              onClick={() => onApplyPreset({
                homePrice: 450000,
                downPaymentPercent: 10,
                interestRate: 6.5,
                loanTermYears: 30,
                paymentFrequency: 'monthly',
                extraMonthlyPayment: 0,
                extraAnnualPayment: 0,
              })}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Starter Home
            </button>
            <button
              onClick={() => onApplyPreset({
                homePrice: 700000,
                downPaymentPercent: 20,
                interestRate: 6.25,
                loanTermYears: 30,
                paymentFrequency: 'monthly',
                extraMonthlyPayment: 0,
                extraAnnualPayment: 0,
              })}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Family Home
            </button>
            <button
              onClick={() => onApplyPreset({
                homePrice: 550000,
                downPaymentPercent: 20,
                interestRate: 6.5,
                loanTermYears: 30,
                paymentFrequency: 'bi_weekly_accelerated',
                extraMonthlyPayment: 250,
                extraAnnualPayment: 2000,
              })}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Fast-Track Payoff
            </button>
            <button
              onClick={onReset}
              title="Reset to defaults"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
