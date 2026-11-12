import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { CalculationResult } from '../types/mortgage';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface CoupleSplitCalculatorProps {
  result: CalculationResult;
}

type SplitMethod = 'equal' | 'proportional' | 'custom';

export const CoupleSplitCalculator: React.FC<CoupleSplitCalculatorProps> = ({ result }) => {
  const [person1Name, setPerson1Name] = useState('Partner 1');
  const [person2Name, setPerson2Name] = useState('Partner 2');
  const [income1, setIncome1] = useState(6500);
  const [income2, setIncome2] = useState(5500);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('proportional');
  const [customPct1, setCustomPct1] = useState(50);

  const totalIncome = Math.max(1, income1 + income2);
  const propPct1 = (income1 / totalIncome) * 100;
  const propPct2 = (income2 / totalIncome) * 100;

  let pct1 = 50;
  let pct2 = 50;

  if (splitMethod === 'proportional') {
    pct1 = propPct1;
    pct2 = propPct2;
  } else if (splitMethod === 'custom') {
    pct1 = customPct1;
    pct2 = 100 - customPct1;
  }

  // Payment per paycheck or month
  const targetPayment = result.effectivePaymentPerPeriod;
  const share1 = targetPayment * (pct1 / 100);
  const share2 = targetPayment * (pct2 / 100);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
            <Heart className="w-5 h-5 fill-pink-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Couple Paycheck Split</h2>
            <p className="text-xs text-slate-500">Calculate each partner's share per paycheck</p>
          </div>
        </div>

        {/* Split Method Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSplitMethod('proportional')}
            className={`px-2.5 py-1 rounded-lg transition ${
              splitMethod === 'proportional'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Income
          </button>
          <button
            type="button"
            onClick={() => setSplitMethod('equal')}
            className={`px-2.5 py-1 rounded-lg transition ${
              splitMethod === 'equal'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => setSplitMethod('custom')}
            className={`px-2.5 py-1 rounded-lg transition ${
              splitMethod === 'custom'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Input Partner Incomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Partner 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={person1Name}
              onChange={(e) => setPerson1Name(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none w-32"
            />
            <span className="text-xs font-semibold text-emerald-600">
              {formatPercent(pct1, 1)} share
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Monthly Net Income
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
              <input
                type="number"
                min={0}
                step={250}
                value={income1}
                onChange={(e) => setIncome1(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Payment Share:</span>
            <span className="text-lg font-black text-slate-900">
              {formatCurrency(share1)}
            </span>
          </div>
        </div>

        {/* Partner 2 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={person2Name}
              onChange={(e) => setPerson2Name(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none w-32"
            />
            <span className="text-xs font-semibold text-teal-600">
              {formatPercent(pct2, 1)} share
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Monthly Net Income
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
              <input
                type="number"
                min={0}
                step={250}
                value={income2}
                onChange={(e) => setIncome2(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Payment Share:</span>
            <span className="text-lg font-black text-slate-900">
              {formatCurrency(share2)}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Slider if Custom selected */}
      {splitMethod === 'custom' && (
        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>{person1Name}: {customPct1}%</span>
            <span>{person2Name}: {100 - customPct1}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={99}
            value={customPct1}
            onChange={(e) => setCustomPct1(Number(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Summary Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="text-emerald-800 font-medium">
          Total Combined Payment ({result.frequencyLabel}):
        </span>
        <span className="text-sm font-black text-emerald-700">
          {formatCurrency(targetPayment)}
        </span>
      </div>
    </div>
  );
};
