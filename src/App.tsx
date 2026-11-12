import { useState, useMemo } from 'react';
import { MortgageInputs } from './types/mortgage';
import { calculateMortgage } from './utils/calculator';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { InputSection } from './components/InputSection';
import { PaycheckSection } from './components/PaycheckSection';
import { ExtraPaymentSection } from './components/ExtraPaymentSection';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { CoupleSplitCalculator } from './components/CoupleSplitCalculator';
import { PitiBreakdown } from './components/PitiBreakdown';

const DEFAULT_INPUTS: MortgageInputs = {
  homePrice: 500000,
  downPaymentPercent: 20,
  loanTermYears: 30,
  interestRate: 6.5,
  startMonth: new Date().getMonth(),
  startYear: new Date().getFullYear(),
  paymentFrequency: 'bi_weekly_accelerated',
  extraMonthlyPayment: 200,
  extraAnnualPayment: 1500,
  extraAnnualMonth: 2, // March (tax refund season)
  oneTimePayments: [],
  includePropertyTax: true,
  annualPropertyTaxRate: 1.2,
  includeHomeInsurance: true,
  annualHomeInsurance: 1500,
  includeHoa: false,
  monthlyHoa: 150,
  includePmi: true,
  annualPmiRate: 0.55,
};

export function App() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS);

  const handleUpdate = (updates: Partial<MortgageInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const handleApplyPreset = (preset: Partial<MortgageInputs>) => {
    setInputs((prev) => ({ ...prev, ...preset }));
  };

  // Memoized Calculation
  const result = useMemo(() => {
    return calculateMortgage(inputs);
  }, [inputs]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onApplyPreset={handleApplyPreset} onReset={handleReset} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Summary & Highlights */}
        <SummaryCards result={result} />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Settings (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <InputSection inputs={inputs} onChange={handleUpdate} />
            <PaycheckSection
              inputs={inputs}
              baseMonthlyPayment={result.baseMonthlyPayment}
              onChange={handleUpdate}
            />
            <ExtraPaymentSection inputs={inputs} onChange={handleUpdate} />
            <PitiBreakdown inputs={inputs} result={result} onChange={handleUpdate} />
          </div>

          {/* Right Column: Visuals & Deep Dives (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AmortizationChart result={result} />
            <CoupleSplitCalculator result={result} />
            <AmortizationTable result={result} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OurHome Mortgage & Paycheck Calculator — Built for Smart Homeowners</span>
          <span>Numbers are estimates for planning purposes. Taxes, insurance, and lender fees may vary.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
