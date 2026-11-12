import React from 'react';
import { 
  PiggyBank, 
  CalendarCheck, 
  Wallet, 
  TrendingDown, 
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CalculationResult } from '../types/mortgage';
import { formatCurrency, formatDuration, formatMonthYear } from '../utils/formatters';

interface SummaryCardsProps {
  result: CalculationResult;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ result }) => {
  const hasSavings = result.interestSavings > 50 || result.timeSavingsMonths > 0;

  // Find 20% equity milestone
  const milestone20 = result.schedule.find(s => s.equityPercent >= 20);
  // Find 50% equity milestone
  const milestone50 = result.schedule.find(s => s.equityPercent >= 50);

  return (
    <div className="space-y-4">
      {/* Highlight Banner if saving money */}
      {hasSavings && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-700/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md">
              <Award className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
                Accelerated Freedom Plan
              </div>
              <div className="text-xl sm:text-2xl font-black">
                Save {formatCurrency(result.interestSavings)} & {formatDuration(result.timeSavingsMonths)}!
              </div>
              <p className="text-xs sm:text-sm text-emerald-100">
                You will be 100% mortgage-free by <span className="font-bold underline text-white">{result.payoffDateLabel}</span> instead of {result.baseline.payoffDateLabel}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-right">
              <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Total Time Off Loan</div>
              <div className="text-lg font-black">{formatDuration(result.timeSavingsMonths)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Periodic Payment */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment per Pay Period
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(result.effectivePaymentPerPeriod)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{result.frequencyLabel}</span>
            <span className="font-semibold text-emerald-600">P&I only</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>All-in with Taxes & Fees:</span>
              <span className="font-black text-slate-800">
                {formatCurrency(result.totalHousingCostPerPeriod)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Monthly PITI:</span>
              <span className="font-medium text-slate-600">
                {formatCurrency(result.totalEstimatedMonthlyHousingCost)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Payoff Date */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payoff Date
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {result.payoffDateLabel}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {result.totalYearsToPayoff.toFixed(1)} years ({result.totalPeriods} payments)
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Standard Term:</span>
            <span className="font-medium line-through text-slate-400">{result.baseline.payoffDateLabel}</span>
          </div>
        </div>

        {/* Card 3: Total Interest */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Interest
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(result.totalInterestPaid)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>vs Original:</span>
            <span className="text-slate-400 line-through">{formatCurrency(result.baseline.totalInterestPaid)}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Interest Saved:</span>
            <span className="font-bold text-emerald-600">+{formatCurrency(result.interestSavings)}</span>
          </div>
        </div>

        {/* Card 4: Total Cost of Loan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Loan Cost
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(result.totalCostOfLoan)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Principal:</span>
            <span className="font-medium text-slate-700">{formatCurrency(result.loanAmount)}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Extra Paid Toward Principal:</span>
            <span className="font-bold text-purple-700">{formatCurrency(result.totalExtraPaid)}</span>
          </div>
        </div>
      </div>

      {/* Milestones Strip */}
      <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Key Milestones:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {milestone20 && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>
                <strong>20% Equity (PMI Drop):</strong> {formatMonthYear(milestone20.date)}
              </span>
            </div>
          )}
          {milestone50 && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong>50% Paid Off:</strong> {formatMonthYear(milestone50.date)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong>100% Free & Clear:</strong> {result.payoffDateLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
