import React from 'react';
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  Building2, 
  ShieldAlert
} from 'lucide-react';
import { MortgageInputs } from '../types/mortgage';
import { formatCurrency } from '../utils/formatters';

interface InputSectionProps {
  inputs: MortgageInputs;
  onChange: (updates: Partial<MortgageInputs>) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ inputs, onChange }) => {
  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPercent / 100);
  const loanAmount = Math.max(0, inputs.homePrice - downPaymentAmount);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Computed monthly auxiliary fees
  const monthlyTax = inputs.includePropertyTax 
    ? (inputs.homePrice * (inputs.annualPropertyTaxRate / 100)) / 12 
    : 0;
  const monthlyInsurance = inputs.includeHomeInsurance 
    ? inputs.annualHomeInsurance / 12 
    : 0;
  const isPmiApplicable = inputs.downPaymentPercent < 20;
  const monthlyPmi = (inputs.includePmi && isPmiApplicable) 
    ? (loanAmount * (inputs.annualPmiRate / 100)) / 12 
    : 0;
  const monthlyHoa = inputs.includeHoa ? inputs.monthlyHoa : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>1.</span> Loan Basics
        </h2>
        <span className="text-xs text-slate-400 font-medium">Core Mortgage Details</span>
      </div>

      <div className="space-y-5">
        {/* Home Price */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Home Price
            </label>
            <span className="text-xs font-semibold text-emerald-600">
              {formatCurrency(inputs.homePrice)}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min={10000}
              max={5000000}
              step={5000}
              value={inputs.homePrice}
              onChange={(e) => onChange({ homePrice: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none"
            />
          </div>
          <input
            type="range"
            min={100000}
            max={2000000}
            step={10000}
            value={inputs.homePrice}
            onChange={(e) => onChange({ homePrice: Number(e.target.value) })}
            className="w-full mt-2 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Down Payment (% and $) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Down Payment
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                {formatCurrency(downPaymentAmount)}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                inputs.downPaymentPercent >= 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {inputs.downPaymentPercent}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Percent className="w-3.5 h-3.5" />
              </div>
              <input
                type="number"
                min={0}
                max={99}
                step={0.5}
                value={inputs.downPaymentPercent}
                onChange={(e) => {
                  const newPct = Math.min(99, Math.max(0, Number(e.target.value)));
                  // Automatically enable PMI if down payment drops below 20%
                  onChange({ 
                    downPaymentPercent: newPct,
                    includePmi: newPct < 20 ? true : inputs.includePmi,
                  });
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <input
                type="number"
                min={0}
                max={inputs.homePrice}
                step={1000}
                value={Math.round(downPaymentAmount)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const pct = inputs.homePrice > 0 ? (val / inputs.homePrice) * 100 : 0;
                  const newPct = Math.min(99, Math.max(0, +pct.toFixed(2)));
                  onChange({ 
                    downPaymentPercent: newPct,
                    includePmi: newPct < 20 ? true : inputs.includePmi,
                  });
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Quick Down Payment Preset Buttons */}
          <div className="flex gap-1.5 mt-2">
            {[3.5, 5, 10, 15, 20, 25].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => onChange({ 
                  downPaymentPercent: pct,
                  includePmi: pct < 20 ? true : inputs.includePmi,
                })}
                className={`flex-1 py-1 text-xs rounded-lg font-semibold transition ${
                  inputs.downPaymentPercent === pct
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {inputs.downPaymentPercent < 20 && (
            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" /> Down payment &lt; 20% typically requires PMI insurance.
            </p>
          )}
        </div>

        {/* Calculated Loan Amount Highlight */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Loan Principal to Borrow:</span>
          <span className="text-sm font-black text-slate-900">{formatCurrency(loanAmount)}</span>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Interest Rate (APR)
            </label>
            <span className="text-xs font-bold text-emerald-600">
              {inputs.interestRate}%
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Percent className="w-4 h-4" />
            </div>
            <input
              type="number"
              min={0.1}
              max={20}
              step={0.125}
              value={inputs.interestRate}
              onChange={(e) => onChange({ interestRate: Math.max(0.1, Number(e.target.value)) })}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <input
            type="range"
            min={2.0}
            max={12.0}
            step={0.125}
            value={inputs.interestRate}
            onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
            className="w-full mt-2 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Loan Term Years */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Loan Term
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[15, 20, 25, 30].map(years => (
              <button
                key={years}
                type="button"
                onClick={() => onChange({ loanTermYears: years })}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                  inputs.loanTermYears === years
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{years} Yrs</span>
                <span className="text-[10px] font-normal opacity-80">{years * 12} mo</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Month and Year */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            First Payment Date
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={inputs.startMonth}
                onChange={(e) => onChange({ startMonth: Number(e.target.value) })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={inputs.startYear}
                onChange={(e) => onChange({ startYear: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- DEDICATED PROPERTY TAX, INSURANCE, HOA & PMI SECTION --- */}
      <div className="pt-5 border-t border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Taxes, Insurance, HOA & PMI
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Optional Add-ons</span>
        </div>

        <div className="space-y-3">
          {/* 1. Property Tax */}
          <div className={`p-3 rounded-xl border transition ${
            inputs.includePropertyTax 
              ? 'bg-blue-50/40 border-blue-200' 
              : 'bg-slate-50/60 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.includePropertyTax}
                  onChange={(e) => onChange({ includePropertyTax: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">Property Tax</span>
              </label>
              {inputs.includePropertyTax && (
                <span className="text-xs font-bold text-blue-600">
                  {formatCurrency(monthlyTax)}/mo
                </span>
              )}
            </div>

            {inputs.includePropertyTax && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                    <Percent className="w-3 h-3" />
                  </span>
                  <input
                    type="number"
                    step={0.05}
                    min={0}
                    max={10}
                    value={inputs.annualPropertyTaxRate}
                    onChange={(e) => onChange({ annualPropertyTaxRate: Math.max(0, Number(e.target.value)) })}
                    className="w-full pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Annual %"
                  />
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                  % annual ({formatCurrency(monthlyTax * 12)}/yr)
                </span>
              </div>
            )}
          </div>

          {/* 2. Homeowners Insurance */}
          <div className={`p-3 rounded-xl border transition ${
            inputs.includeHomeInsurance 
              ? 'bg-amber-50/40 border-amber-200' 
              : 'bg-slate-50/60 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.includeHomeInsurance}
                  onChange={(e) => onChange({ includeHomeInsurance: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">Homeowners Insurance</span>
              </label>
              {inputs.includeHomeInsurance && (
                <span className="text-xs font-bold text-amber-600">
                  {formatCurrency(monthlyInsurance)}/mo
                </span>
              )}
            </div>

            {inputs.includeHomeInsurance && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step={50}
                    min={0}
                    value={inputs.annualHomeInsurance}
                    onChange={(e) => onChange({ annualHomeInsurance: Math.max(0, Number(e.target.value)) })}
                    className="w-full pl-6 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="$/year"
                  />
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                  $/year ({formatCurrency(monthlyInsurance)}/mo)
                </span>
              </div>
            )}
          </div>

          {/* 3. HOA / Condo Dues */}
          <div className={`p-3 rounded-xl border transition ${
            inputs.includeHoa 
              ? 'bg-purple-50/40 border-purple-200' 
              : 'bg-slate-50/60 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.includeHoa}
                  onChange={(e) => onChange({ includeHoa: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">HOA / Condo Dues</span>
              </label>
              {inputs.includeHoa && (
                <span className="text-xs font-bold text-purple-600">
                  {formatCurrency(monthlyHoa)}/mo
                </span>
              )}
            </div>

            {inputs.includeHoa && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step={25}
                    min={0}
                    value={inputs.monthlyHoa}
                    onChange={(e) => onChange({ monthlyHoa: Math.max(0, Number(e.target.value)) })}
                    className="w-full pl-6 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="$/month"
                  />
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                  $/month
                </span>
              </div>
            )}
          </div>

          {/* 4. PMI (Private Mortgage Insurance) */}
          <div className={`p-3 rounded-xl border transition ${
            inputs.includePmi && isPmiApplicable
              ? 'bg-rose-50/40 border-rose-200' 
              : 'bg-slate-50/60 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.includePmi}
                  onChange={(e) => onChange({ includePmi: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">PMI Insurance</span>
                  {!isPmiApplicable && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                      Not needed (&ge;20% down)
                    </span>
                  )}
                </div>
              </label>
              {inputs.includePmi && isPmiApplicable && (
                <span className="text-xs font-bold text-rose-600">
                  {formatCurrency(monthlyPmi)}/mo
                </span>
              )}
            </div>

            {inputs.includePmi && isPmiApplicable && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                      <Percent className="w-3 h-3" />
                    </span>
                    <input
                      type="number"
                      step={0.05}
                      min={0.1}
                      max={3}
                      value={inputs.annualPmiRate}
                      onChange={(e) => onChange({ annualPmiRate: Math.max(0, Number(e.target.value)) })}
                      className="w-full pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Annual %"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    % annual rate ({formatCurrency(monthlyPmi * 12)}/yr)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Automatically drops off once your equity reaches 20% (80% LTV).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
