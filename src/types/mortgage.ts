export type PaymentFrequency = 
  | 'monthly' 
  | 'semi_monthly' 
  | 'bi_weekly_regular' 
  | 'bi_weekly_accelerated' 
  | 'weekly_regular' 
  | 'weekly_accelerated';

export interface MortgageInputs {
  homePrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number; // annual % e.g. 6.5
  startMonth: number; // 0-11
  startYear: number;
  
  // Paycheck / frequency
  paymentFrequency: PaymentFrequency;
  
  // Extra Payments
  extraMonthlyPayment: number;
  extraAnnualPayment: number;
  extraAnnualMonth: number; // 0-11
  oneTimePayments: Array<{
    id: string;
    amount: number;
    year: number;
    month: number;
    description: string;
  }>;
  
  // Additional costs (PITI) - with explicit toggles
  includePropertyTax: boolean;
  annualPropertyTaxRate: number; // % e.g. 1.2
  
  includeHomeInsurance: boolean;
  annualHomeInsurance: number; // $ e.g. 1500
  
  includeHoa: boolean;
  monthlyHoa: number; // $ e.g. 150
  
  includePmi: boolean;
  annualPmiRate: number; // % e.g. 0.55
}

export interface PaymentScheduleItem {
  periodIndex: number;
  yearNumber: number;
  date: Date;
  dateLabel: string;
  payment: number;
  principal: number;
  interest: number;
  extraPrincipal: number;
  totalPrincipal: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  equity: number;
  equityPercent: number;
}

export interface AnnualAmortizationSummary {
  yearNumber: number;
  calendarYear: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  extraPrincipalPaid: number;
  endingBalance: number;
  endingEquity: number;
  cumulativeInterest: number;
}

export interface CalculationResult {
  loanAmount: number;
  downPaymentAmount: number;
  baseMonthlyPayment: number; // monthly P&I
  effectivePaymentPerPeriod: number;
  periodsPerYear: number;
  frequencyLabel: string;
  
  // Schedule with customizations
  schedule: PaymentScheduleItem[];
  annualSummaries: AnnualAmortizationSummary[];
  
  // Totals
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalCostOfLoan: number;
  totalExtraPaid: number;
  totalPeriods: number;
  payoffDate: Date;
  payoffDateLabel: string;
  totalYearsToPayoff: number;
  
  // Baseline (standard monthly with no extra payments)
  baseline: {
    totalInterestPaid: number;
    totalCostOfLoan: number;
    totalMonths: number;
    payoffDate: Date;
    payoffDateLabel: string;
    totalYearsToPayoff: number;
    schedule: PaymentScheduleItem[];
    annualSummaries: AnnualAmortizationSummary[];
  };
  
  // Savings compared to baseline
  interestSavings: number;
  timeSavingsMonths: number;
  timeSavingsYears: number;
  
  // Monthly Out-of-pocket breakdown
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  monthlyPmi: number;
  hasPmi: boolean;
  totalEstimatedMonthlyHousingCost: number;
  totalHousingCostPerPeriod: number;
}
