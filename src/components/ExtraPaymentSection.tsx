import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Calendar } from 'lucide-react';
import { MortgageInputs } from '../types/mortgage';
import { formatCurrency } from '../utils/formatters';

interface ExtraPaymentSectionProps {
  inputs: MortgageInputs;
  onChange: (updates: Partial<MortgageInputs>) => void;
}

export const ExtraPaymentSection: React.FC<ExtraPaymentSectionProps> = ({
  inputs,
  onChange,
}) => {
  const [showAddOneTime, setShowAddOneTime] = useState(false);
  const [oneTimeAmount, setOneTimeAmount] = useState(5000);
  const [oneTimeYear, setOneTimeYear] = useState(inputs.startYear + 2);
  const [oneTimeMonth, setOneTimeMonth] = useState(0);
  const [oneTimeDesc, setOneTimeDesc] = useState('Annual Bonus / Tax Refund');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleAddOneTime = () => {
    if (oneTimeAmount <= 0) return;
    const newPayment = {
      id: Math.random().toString(36).substring(2, 9),
      amount: oneTimeAmount,
      year: oneTimeYear,
      month: oneTimeMonth,
      description: oneTimeDesc || 'Lump Sum Payment',
    };
    onChange({
      oneTimePayments: [...(inputs.oneTimePayments || []), newPayment],
    });
    setShowAddOneTime(false);
  };

  const handleRemoveOneTime = (id: string) => {
    onChange({
      oneTimePayments: inputs.oneTimePayments.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>3.</span> Extra Principal Payments
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Interest Shredder
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500">
        Every extra dollar paid goes 100% directly toward your principal loan balance, instantly shortening your loan term.
      </p>

      <div className="space-y-6">
        {/* Extra Monthly Payment */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Extra Payment Each Month
            </label>
            <span className="text-sm font-black text-emerald-600">
              +{formatCurrency(inputs.extraMonthlyPayment)}/mo
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min={0}
              max={10000}
              step={50}
              value={inputs.extraMonthlyPayment}
              onChange={(e) => onChange({ extraMonthlyPayment: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="e.g. 200"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2 mt-2">
            {[0, 100, 200, 300, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onChange({ extraMonthlyPayment: amt })}
                className={`flex-1 py-1 text-xs rounded-lg font-semibold transition ${
                  inputs.extraMonthlyPayment === amt
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {amt === 0 ? '$0' : `+$${amt}`}
              </button>
            ))}
          </div>
        </div>

        {/* Extra Annual Payment */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Extra Payment Each Year (Lump Sum)
            </label>
            <span className="text-sm font-black text-emerald-600">
              +{formatCurrency(inputs.extraAnnualPayment)}/yr
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min={0}
                max={50000}
                step={500}
                value={inputs.extraAnnualPayment}
                onChange={(e) => onChange({ extraAnnualPayment: Math.max(0, Number(e.target.value)) })}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="e.g. 2500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={inputs.extraAnnualMonth}
                onChange={(e) => onChange({ extraAnnualMonth: Number(e.target.value) })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>
                    Paid in {m} (every year)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {[0, 1000, 2500, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onChange({ extraAnnualPayment: amt })}
                className={`flex-1 py-1 text-xs rounded-lg font-semibold transition ${
                  inputs.extraAnnualPayment === amt
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {amt === 0 ? '$0' : `+$${amt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* One-Time Lump Sum Payments */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              One-Time Future Lump Sums
            </span>
            <button
              type="button"
              onClick={() => setShowAddOneTime(!showAddOneTime)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lump Sum
            </button>
          </div>

          {showAddOneTime && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="font-bold text-xs text-emerald-900">Add Planned One-Time Lump Sum</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount</label>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={oneTimeAmount}
                    onChange={(e) => setOneTimeAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Month</label>
                  <select
                    value={oneTimeMonth}
                    onChange={(e) => setOneTimeMonth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Year</label>
                  <input
                    type="number"
                    min={inputs.startYear}
                    max={inputs.startYear + inputs.loanTermYears}
                    value={oneTimeYear}
                    onChange={(e) => setOneTimeYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input
                  type="text"
                  value={oneTimeDesc}
                  onChange={(e) => setOneTimeDesc(e.target.value)}
                  placeholder="e.g. Work Bonus, Stock Vest, Gift"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddOneTime(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOneTime}
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Lump Sum
                </button>
              </div>
            </div>
          )}

          {/* List of existing one-time payments */}
          {inputs.oneTimePayments && inputs.oneTimePayments.length > 0 ? (
            <div className="space-y-2">
              {inputs.oneTimePayments.map((otp) => (
                <div
                  key={otp.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{otp.description}</div>
                    <div className="text-slate-500 text-[11px]">
                      {months[otp.month]} {otp.year}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 text-sm">
                      +{formatCurrency(otp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOneTime(otp.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No one-time lump sums added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
