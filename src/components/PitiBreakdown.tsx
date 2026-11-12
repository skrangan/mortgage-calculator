import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, DollarSign, Percent } from 'lucide-react';
import { MortgageInputs, CalculationResult } from '../types/mortgage';
import { formatCurrency } from '../utils/formatters';

interface PitiBreakdownProps {
  inputs: MortgageInputs;
  result: CalculationResult;
  onChange: (updates: Partial<MortgageInputs>) => void;
}

export const PitiBreakdown: React.FC<PitiBreakdownProps> = ({
  inputs,
  result,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      label: 'Principal & Interest',
      amount: result.baseMonthlyPayment,
      color: 'bg-emerald-500',
      pct: (result.baseMonthlyPayment / Math.max(1, result.totalEstimatedMonthlyHousingCost)) * 100,
    },
    ...(result.monthlyTax > 0
      ? [{
          label: 'Property Taxes',
          amount: result.monthlyTax,
          color: 'bg-blue-500',
          pct: (result.monthlyTax / Math.max(1, result.totalEstimatedMonthlyHousingCost)) * 100,
        }]
      : []),
    ...(result.monthlyInsurance > 0
      ? [{
          label: 'Homeowners Insurance',
          amount: result.monthlyInsurance,
          color: 'bg-amber-500',
          pct: (result.monthlyInsurance / Math.max(1, result.totalEstimatedMonthlyHousingCost)) * 100,
        }]
      : []),
    ...(result.monthlyHoa > 0
      ? [{
          label: 'HOA / Condo Dues',
          amount: result.monthlyHoa,
          color: 'bg-purple-500',
          pct: (result.monthlyHoa / Math.max(1, result.totalEstimatedMonthlyHousingCost)) * 100,
        }]
      : []),
    ...(result.hasPmi
      ? [{
          label: 'PMI Insurance',
          amount: result.monthlyPmi,
          color: 'bg-rose-500',
          pct: (result.monthlyPmi / Math.max(1, result.totalEstimatedMonthlyHousingCost)) * 100,
        }]
      : []),
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" /> Total Housing Cost (PITI)
          </h2>
          <p className="text-xs text-slate-500">Taxes, Insurance, HOA, and PMI breakdown</p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
        >
          <span>{isOpen ? 'Close Settings' : 'Adjust Rates & Fees'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progress Bar of Monthly Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 font-medium">Estimated Total Monthly Cost:</span>
          <span className="text-xl font-black text-slate-900">
            {formatCurrency(result.totalEstimatedMonthlyHousingCost)}/mo
          </span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{ width: `${Math.max(1, it.pct)}%` }}
              className={`${it.color} h-full transition-all duration-300`}
              title={`${it.label}: ${formatCurrency(it.amount)}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${it.color}`} />
              <div className="truncate">
                <div className="text-[11px] text-slate-500 truncate">{it.label}</div>
                <div className="font-bold text-slate-800">{formatCurrency(it.amount)}/mo</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Inputs for Tax, Insurance, HOA, PMI */}
      {isOpen && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Property Tax Rate */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includePropertyTax}
                  onChange={(e) => onChange({ includePropertyTax: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Property Tax</span>
              </label>
              <span className="text-xs font-semibold text-blue-600">
                {formatCurrency(result.monthlyTax)}/mo
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                <Percent className="w-3 h-3" />
              </span>
              <input
                type="number"
                step={0.05}
                min={0}
                value={inputs.annualPropertyTaxRate}
                onChange={(e) => onChange({ annualPropertyTaxRate: Number(e.target.value) })}
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                placeholder="Tax rate %"
              />
            </div>
          </div>

          {/* Home Insurance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includeHomeInsurance}
                  onChange={(e) => onChange({ includeHomeInsurance: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Home Insurance</span>
              </label>
              <span className="text-xs font-semibold text-amber-600">
                {formatCurrency(result.monthlyInsurance)}/mo
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                <DollarSign className="w-3 h-3" />
              </span>
              <input
                type="number"
                step={100}
                min={0}
                value={inputs.annualHomeInsurance}
                onChange={(e) => onChange({ annualHomeInsurance: Number(e.target.value) })}
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                placeholder="$/year"
              />
            </div>
          </div>

          {/* Monthly HOA */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includeHoa}
                  onChange={(e) => onChange({ includeHoa: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>HOA / Condo Dues</span>
              </label>
              <span className="text-xs font-semibold text-purple-600">
                {formatCurrency(result.monthlyHoa)}/mo
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                <DollarSign className="w-3 h-3" />
              </span>
              <input
                type="number"
                step={25}
                min={0}
                value={inputs.monthlyHoa}
                onChange={(e) => onChange({ monthlyHoa: Number(e.target.value) })}
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                placeholder="$/month"
              />
            </div>
          </div>

          {/* Annual PMI Rate */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includePmi}
                  onChange={(e) => onChange({ includePmi: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>PMI Insurance</span>
              </label>
              <span className="text-xs font-semibold text-rose-600">
                {formatCurrency(result.monthlyPmi)}/mo
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                <Percent className="w-3 h-3" />
              </span>
              <input
                type="number"
                step={0.05}
                min={0}
                value={inputs.annualPmiRate}
                onChange={(e) => onChange({ annualPmiRate: Number(e.target.value) })}
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                placeholder="PMI %"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
