import { CalculationResult } from '../types/mortgage';

export function exportScheduleToCsv(result: CalculationResult, isAnnual: boolean = false) {
  let csvContent = 'data:text/csv;charset=utf-8,';

  if (isAnnual) {
    csvContent += 'Year #,Calendar Year,Total Payment,Principal Paid,Interest Paid,Extra Principal Paid,Ending Balance,Ending Equity,Cumulative Interest\n';
    result.annualSummaries.forEach(row => {
      csvContent += [
        row.yearNumber,
        row.calendarYear,
        row.totalPayment.toFixed(2),
        row.principalPaid.toFixed(2),
        row.interestPaid.toFixed(2),
        row.extraPrincipalPaid.toFixed(2),
        row.endingBalance.toFixed(2),
        row.endingEquity.toFixed(2),
        row.cumulativeInterest.toFixed(2),
      ].join(',') + '\n';
    });
  } else {
    csvContent += 'Period #,Year #,Date,Payment,Principal,Interest,Extra Principal,Remaining Balance,Cumulative Interest,Home Equity\n';
    result.schedule.forEach(row => {
      csvContent += [
        row.periodIndex,
        row.yearNumber,
        `"${row.dateLabel}"`,
        row.payment.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        row.extraPrincipal.toFixed(2),
        row.remainingBalance.toFixed(2),
        row.cumulativeInterest.toFixed(2),
        row.equity.toFixed(2),
      ].join(',') + '\n';
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `mortgage_amortization_${isAnnual ? 'annual' : 'detailed'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
