import { 
  MortgageInputs, 
  CalculationResult, 
  PaymentScheduleItem, 
  AnnualAmortizationSummary
} from '../types/mortgage';
import { formatMonthYear } from './formatters';

export function calculateMortgage(inputs: MortgageInputs): CalculationResult {
  const {
    homePrice,
    downPaymentPercent,
    loanTermYears,
    interestRate,
    startMonth,
    startYear,
    paymentFrequency,
    extraMonthlyPayment,
    extraAnnualPayment,
    extraAnnualMonth,
    oneTimePayments,
    includePropertyTax,
    annualPropertyTaxRate,
    includeHomeInsurance,
    annualHomeInsurance,
    includeHoa,
    monthlyHoa,
    includePmi,
    annualPmiRate,
  } = inputs;

  const downPaymentAmount = homePrice * (downPaymentPercent / 100);
  const loanAmount = Math.max(0, homePrice - downPaymentAmount);
  const totalMonths = Math.max(1, loanTermYears * 12);
  const annualRateDecimal = interestRate / 100;
  const monthlyRate = annualRateDecimal / 12;

  // Standard Monthly Principal + Interest payment (Formula: P * [ r(1+r)^n ] / [ (1+r)^n - 1 ])
  let baseMonthlyPayment = 0;
  if (loanAmount > 0) {
    if (annualRateDecimal === 0) {
      baseMonthlyPayment = loanAmount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      baseMonthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
    }
  }

  // Determine period configuration
  let periodsPerYear = 12;
  let frequencyLabel = 'Monthly (12/yr)';
  let basePaymentPerPeriod = baseMonthlyPayment;

  switch (paymentFrequency) {
    case 'monthly':
      periodsPerYear = 12;
      frequencyLabel = 'Monthly (12/yr)';
      basePaymentPerPeriod = baseMonthlyPayment;
      break;
    case 'semi_monthly':
      periodsPerYear = 24;
      frequencyLabel = 'Semi-Monthly (24/yr)';
      basePaymentPerPeriod = baseMonthlyPayment / 2;
      break;
    case 'bi_weekly_regular':
      periodsPerYear = 26;
      frequencyLabel = 'Regular Bi-Weekly (26/yr)';
      basePaymentPerPeriod = (baseMonthlyPayment * 12) / 26;
      break;
    case 'bi_weekly_accelerated':
      periodsPerYear = 26;
      frequencyLabel = 'Accelerated Bi-Weekly (26/yr)';
      // 26 half-payments = 13 full payments per year (1 extra full payment/yr)
      basePaymentPerPeriod = baseMonthlyPayment / 2;
      break;
    case 'weekly_regular':
      periodsPerYear = 52;
      frequencyLabel = 'Regular Weekly (52/yr)';
      basePaymentPerPeriod = (baseMonthlyPayment * 12) / 52;
      break;
    case 'weekly_accelerated':
      periodsPerYear = 52;
      frequencyLabel = 'Accelerated Weekly (52/yr)';
      basePaymentPerPeriod = baseMonthlyPayment / 4;
      break;
  }

  const ratePerPeriod = annualRateDecimal / periodsPerYear;

  // 1. Simulate Baseline Schedule (Standard monthly, NO extra payments)
  const baselineSchedule: PaymentScheduleItem[] = [];
  let baselineBalance = loanAmount;
  let baselineCumInterest = 0;
  let baselineCumPrincipal = 0;

  for (let m = 0; m < totalMonths && baselineBalance > 0.005; m++) {
    const curDate = new Date(startYear, startMonth + m, 1);
    const interest = baselineBalance * monthlyRate;
    let scheduledPrincipal = baseMonthlyPayment - interest;
    
    if (scheduledPrincipal > baselineBalance) {
      scheduledPrincipal = baselineBalance;
    }
    
    const payment = scheduledPrincipal + interest;
    baselineBalance -= scheduledPrincipal;
    baselineCumInterest += interest;
    baselineCumPrincipal += scheduledPrincipal;

    baselineSchedule.push({
      periodIndex: m + 1,
      yearNumber: Math.floor(m / 12) + 1,
      date: curDate,
      dateLabel: formatMonthYear(curDate),
      payment,
      principal: scheduledPrincipal,
      interest,
      extraPrincipal: 0,
      totalPrincipal: scheduledPrincipal,
      remainingBalance: Math.max(0, baselineBalance),
      cumulativeInterest: baselineCumInterest,
      cumulativePrincipal: baselineCumPrincipal,
      equity: homePrice - Math.max(0, baselineBalance),
      equityPercent: ((homePrice - Math.max(0, baselineBalance)) / homePrice) * 100,
    });
  }

  const baselineAnnualSummaries = aggregateAnnualSummaries(baselineSchedule);
  const baselinePayoffDate = baselineSchedule.length > 0 
    ? baselineSchedule[baselineSchedule.length - 1].date 
    : new Date(startYear + loanTermYears, startMonth, 1);

  // 2. Simulate Custom Schedule (with Selected Frequency & Extra Payments)
  const schedule: PaymentScheduleItem[] = [];
  let currentBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalExtraPaid = 0;

  // Recurring extra payment adjusted to frequency
  const extraPerPeriod = paymentFrequency === 'monthly'
    ? extraMonthlyPayment
    : paymentFrequency === 'semi_monthly'
    ? extraMonthlyPayment / 2
    : paymentFrequency.startsWith('bi_weekly')
    ? (extraMonthlyPayment * 12) / 26
    : (extraMonthlyPayment * 12) / 52;

  const maxPeriods = periodsPerYear * 60; // 60 years max limit guard
  let period = 0;

  // Date tracking based on period frequency
  const startDate = new Date(startYear, startMonth, 1);

  while (currentBalance > 0.005 && period < maxPeriods) {
    // Estimate calendar date for this period
    let paymentDate: Date;
    if (periodsPerYear === 12) {
      paymentDate = new Date(startYear, startMonth + period, 1);
    } else if (periodsPerYear === 24) {
      const monthOffset = Math.floor(period / 2);
      const isSecondHalf = period % 2 === 1;
      paymentDate = new Date(startYear, startMonth + monthOffset, isSecondHalf ? 15 : 1);
    } else {
      // Days based (e.g. 14 days for bi-weekly, 7 days for weekly)
      const daysPerPeriod = 365.25 / periodsPerYear;
      paymentDate = new Date(startDate.getTime() + period * daysPerPeriod * 24 * 60 * 60 * 1000);
    }

    const curMonth = paymentDate.getMonth();
    const curYear = paymentDate.getFullYear();
    const yearNumber = Math.floor(period / periodsPerYear) + 1;

    // Calculate Interest for period
    const interest = currentBalance * ratePerPeriod;

    // Base scheduled principal
    let scheduledPrincipal = Math.max(0, basePaymentPerPeriod - interest);

    // Additional extra payments
    let extraPrincipal = extraPerPeriod;

    // Check Annual Extra Payment (apply once per calendar year in the selected extraAnnualMonth)
    // For non-monthly, apply once in the first period occurring in that month
    if (extraAnnualPayment > 0) {
      const isAnnualTargetMonth = curMonth === extraAnnualMonth;
      if (isAnnualTargetMonth) {
        // Only trigger once per year
        const alreadyTriggeredThisYear = schedule.some(
          s => s.date.getFullYear() === curYear && s.extraPrincipal >= extraAnnualPayment
        );
        if (!alreadyTriggeredThisYear) {
          extraPrincipal += extraAnnualPayment;
        }
      }
    }

    // Check One-Time Lump Sums
    if (oneTimePayments && oneTimePayments.length > 0) {
      for (const otp of oneTimePayments) {
        if (otp.year === curYear && otp.month === curMonth) {
          // Verify we haven't applied it this month yet
          const alreadyApplied = schedule.some(
            s => s.date.getFullYear() === curYear && s.date.getMonth() === curMonth && s.extraPrincipal >= otp.amount
          );
          if (!alreadyApplied) {
            extraPrincipal += otp.amount;
          }
        }
      }
    }

    // Cap at current remaining balance
    let totalPrincipal = scheduledPrincipal + extraPrincipal;
    if (totalPrincipal > currentBalance) {
      totalPrincipal = currentBalance;
      // Adjust components proportionally if capped
      if (scheduledPrincipal >= currentBalance) {
        scheduledPrincipal = currentBalance;
        extraPrincipal = 0;
      } else {
        extraPrincipal = currentBalance - scheduledPrincipal;
      }
    }

    const actualPayment = scheduledPrincipal + interest + extraPrincipal;
    currentBalance -= totalPrincipal;
    cumulativeInterest += interest;
    cumulativePrincipal += totalPrincipal;
    totalExtraPaid += extraPrincipal;

    schedule.push({
      periodIndex: period + 1,
      yearNumber,
      date: paymentDate,
      dateLabel: formatMonthYear(paymentDate),
      payment: actualPayment,
      principal: scheduledPrincipal,
      interest,
      extraPrincipal,
      totalPrincipal,
      remainingBalance: Math.max(0, currentBalance),
      cumulativeInterest,
      cumulativePrincipal,
      equity: homePrice - Math.max(0, currentBalance),
      equityPercent: Math.min(100, ((homePrice - Math.max(0, currentBalance)) / homePrice) * 100),
    });

    period++;
  }

  const annualSummaries = aggregateAnnualSummaries(schedule);
  const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].date : baselinePayoffDate;
  const totalYearsToPayoff = schedule.length / periodsPerYear;

  // Monthly breakdown of auxiliary costs (PITI)
  const monthlyTax = includePropertyTax ? (homePrice * (annualPropertyTaxRate / 100)) / 12 : 0;
  const monthlyInsurance = includeHomeInsurance ? annualHomeInsurance / 12 : 0;
  const hasPmi = includePmi && downPaymentPercent < 20;
  const monthlyPmi = hasPmi ? (loanAmount * (annualPmiRate / 100)) / 12 : 0;
  const actualHoa = includeHoa ? monthlyHoa : 0;
  const totalEstimatedMonthlyHousingCost = baseMonthlyPayment + monthlyTax + monthlyInsurance + actualHoa + monthlyPmi;
  const totalHousingCostPerPeriod = (totalEstimatedMonthlyHousingCost * 12) / periodsPerYear;

  // Savings comparison
  const totalBaselineInterest = baselineSchedule.length > 0 ? baselineSchedule[baselineSchedule.length - 1].cumulativeInterest : 0;
  const totalCustomInterest = cumulativeInterest;
  const interestSavings = Math.max(0, totalBaselineInterest - totalCustomInterest);

  const baselineMonths = baselineSchedule.length;
  const customMonths = Math.round(schedule.length * (12 / periodsPerYear));
  const timeSavingsMonths = Math.max(0, baselineMonths - customMonths);
  const timeSavingsYears = +(timeSavingsMonths / 12).toFixed(1);

  return {
    loanAmount,
    downPaymentAmount,
    baseMonthlyPayment,
    effectivePaymentPerPeriod: basePaymentPerPeriod,
    periodsPerYear,
    frequencyLabel,
    schedule,
    annualSummaries,
    totalInterestPaid: cumulativeInterest,
    totalPrincipalPaid: cumulativePrincipal,
    totalCostOfLoan: cumulativePrincipal + cumulativeInterest,
    totalExtraPaid,
    totalPeriods: schedule.length,
    payoffDate,
    payoffDateLabel: formatMonthYear(payoffDate),
    totalYearsToPayoff,
    baseline: {
      totalInterestPaid: totalBaselineInterest,
      totalCostOfLoan: loanAmount + totalBaselineInterest,
      totalMonths: baselineMonths,
      payoffDate: baselinePayoffDate,
      payoffDateLabel: formatMonthYear(baselinePayoffDate),
      totalYearsToPayoff: baselineMonths / 12,
      schedule: baselineSchedule,
      annualSummaries: baselineAnnualSummaries,
    },
    interestSavings,
    timeSavingsMonths,
    timeSavingsYears,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa: actualHoa,
    monthlyPmi,
    hasPmi,
    totalEstimatedMonthlyHousingCost,
    totalHousingCostPerPeriod,
  };
}

function aggregateAnnualSummaries(schedule: PaymentScheduleItem[]): AnnualAmortizationSummary[] {
  const map = new Map<number, AnnualAmortizationSummary>();

  for (const item of schedule) {
    const calYear = item.date.getFullYear();
    if (!map.has(calYear)) {
      map.set(calYear, {
        yearNumber: item.yearNumber,
        calendarYear: calYear,
        totalPayment: 0,
        principalPaid: 0,
        interestPaid: 0,
        extraPrincipalPaid: 0,
        endingBalance: item.remainingBalance,
        endingEquity: item.equity,
        cumulativeInterest: item.cumulativeInterest,
      });
    }

    const curr = map.get(calYear)!;
    curr.totalPayment += item.payment;
    curr.principalPaid += item.principal;
    curr.interestPaid += item.interest;
    curr.extraPrincipalPaid += item.extraPrincipal;
    curr.endingBalance = item.remainingBalance;
    curr.endingEquity = item.equity;
    curr.cumulativeInterest = item.cumulativeInterest;
  }

  return Array.from(map.values()).sort((a, b) => a.calendarYear - b.calendarYear);
}
