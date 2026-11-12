import React, { useState } from 'react';
import { 
  Table, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CalculationResult } from '../types/mortgage';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { exportScheduleToCsv } from '../utils/exportCsv';

interface AmortizationTableProps {
  result: CalculationResult;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ result }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const annualData = result.annualSummaries.filter(
    (row) =>
      row.yearNumber.toString().includes(filterText) ||
      row.calendarYear.toString().includes(filterText)
  );

  const detailedData = result.schedule.filter(
    (row) =>
      row.dateLabel.toLowerCase().includes(filterText.toLowerCase()) ||
      row.yearNumber.toString().includes(filterText) ||
      row.periodIndex.toString().includes(filterText)
  );

  // Pagination for detailed view
  const totalDetailedPages = Math.ceil(detailedData.length / pageSize);
  const paginatedDetailed = detailedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    exportScheduleToCsv(result, isAnnual);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-600" /> Complete Amortization Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect every single payment, principal reduction, and interest breakdown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Annual vs Detailed */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsAnnual(true);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                isAnnual
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary ({result.annualSummaries.length} yrs)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAnnual(false);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                !isAnnual
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Payments ({result.schedule.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search year or date..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none w-44"
            />
          </div>

          {/* Download CSV button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition shadow-xs"
            title="Download Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            {isAnnual ? (
              <tr>
                <th className="py-3 px-4">Year #</th>
                <th className="py-3 px-4">Calendar</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right text-emerald-700">Principal Paid</th>
                <th className="py-3 px-4 text-right text-teal-700">Extra Principal</th>
                <th className="py-3 px-4 text-right text-amber-700">Interest Paid</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
                <th className="py-3 px-4 text-right text-emerald-700">Home Equity</th>
                <th className="py-3 px-4 text-right text-slate-500">Total Interest to Date</th>
              </tr>
            ) : (
              <tr>
                <th className="py-3 px-4">Period #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Payment</th>
                <th className="py-3 px-4 text-right text-emerald-700">Principal</th>
                <th className="py-3 px-4 text-right text-teal-700">Extra Principal</th>
                <th className="py-3 px-4 text-right text-amber-700">Interest</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-right">Equity %</th>
                <th className="py-3 px-4 text-right text-slate-500">Cumulative Interest</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {isAnnual ? (
              annualData.map((row) => (
                <tr
                  key={row.calendarYear}
                  className="hover:bg-emerald-50/40 transition group font-sans"
                >
                  <td className="py-2.5 px-4 font-bold text-slate-800">
                    Year {row.yearNumber}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-600">
                    {row.calendarYear}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-800 font-mono">
                    {formatCurrency(row.totalPayment)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-600 font-mono">
                    {formatCurrency(row.principalPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-teal-600 font-mono">
                    {row.extraPrincipalPaid > 0 ? `+${formatCurrency(row.extraPrincipalPaid)}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-amber-600 font-mono">
                    {formatCurrency(row.interestPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900 font-mono">
                    {formatCurrency(row.endingBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-700 font-mono">
                    {formatCurrency(row.endingEquity)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono">
                    {formatCurrency(row.cumulativeInterest)}
                  </td>
                </tr>
              ))
            ) : (
              paginatedDetailed.map((row) => {
                const hasExtra = row.extraPrincipal > 0;
                return (
                  <tr
                    key={row.periodIndex}
                    className={`hover:bg-emerald-50/40 transition font-sans ${
                      hasExtra ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    <td className="py-2 px-4 font-bold text-slate-700">
                      #{row.periodIndex}
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-700">
                      {row.dateLabel}
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-slate-800 font-mono">
                      {formatCurrency(row.payment)}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-600 font-mono">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-teal-600 font-mono">
                      {hasExtra ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-500" />
                          +{formatCurrency(row.extraPrincipal)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-amber-600 font-mono">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="py-2 px-4 text-right font-black text-slate-900 font-mono">
                      {formatCurrency(row.remainingBalance)}
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-emerald-700 font-mono">
                      {formatPercent(row.equityPercent, 1)}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500 font-mono">
                      {formatCurrency(row.cumulativeInterest)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination for Detailed View */}
      {!isAnnual && totalDetailedPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, detailedData.length)} of {detailedData.length} payments
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-800">
              Page {currentPage} of {totalDetailedPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalDetailedPages}
              onClick={() => setCurrentPage((p) => Math.min(totalDetailedPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
