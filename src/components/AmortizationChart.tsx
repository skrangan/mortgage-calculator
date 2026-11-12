import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  LineChart as LineChartIcon,
  Info 
} from 'lucide-react';
import { CalculationResult, AnnualAmortizationSummary } from '../types/mortgage';
import { formatCurrency } from '../utils/formatters';

interface AmortizationChartProps {
  result: CalculationResult;
}

type ChartView = 'stacked_bars' | 'balance_equity' | 'cumulative_interest';

export const AmortizationChart: React.FC<AmortizationChartProps> = ({ result }) => {
  const [view, setView] = useState<ChartView>('stacked_bars');
  const [hoveredYear, setHoveredYear] = useState<AnnualAmortizationSummary | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const data = result.annualSummaries;
  const baselineData = result.baseline.annualSummaries;

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400">No chart data available.</div>;
  }

  // SVG dimensions
  const width = 800;
  const height = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // 1. Stacked Bars calculations
  const maxAnnualPayment = Math.max(
    ...data.map((d) => d.principalPaid + d.extraPrincipalPaid + d.interestPaid),
    1000
  );

  const barSlotWidth = innerWidth / data.length;
  const barWidth = Math.max(4, Math.min(26, barSlotWidth * 0.72));

  // 2. Balance & Equity calculations
  const maxHomePrice = Math.max(result.loanAmount + result.downPaymentAmount, 100000);

  // Generate SVG path points for Balance and Equity
  const getX = (index: number, totalPoints: number) => {
    if (totalPoints <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (totalPoints - 1)) * innerWidth;
  };

  const getYBalance = (balance: number) => {
    return padding.top + innerHeight - (balance / maxHomePrice) * innerHeight;
  };

  // Remaining Balance Path
  const balancePoints = data.map((d, i) => `${getX(i, data.length)},${getYBalance(d.endingBalance)}`).join(' ');
  // Home Equity Path
  const equityPoints = data.map((d, i) => `${getX(i, data.length)},${getYBalance(d.endingEquity)}`).join(' ');
  // Baseline Balance Path
  const baselineBalancePoints = baselineData.map((d, i) => `${getX(i, baselineData.length)},${getYBalance(d.endingBalance)}`).join(' ');

  // 3. Cumulative Interest calculations
  const maxInterest = Math.max(
    result.baseline.totalInterestPaid,
    result.totalInterestPaid,
    10000
  );
  const getYInterest = (val: number) => {
    return padding.top + innerHeight - (val / maxInterest) * innerHeight;
  };
  const cumInterestPoints = data.map((d, i) => `${getX(i, data.length)},${getYInterest(d.cumulativeInterest)}`).join(' ');
  const baselineCumInterestPoints = baselineData.map((d, i) => `${getX(i, baselineData.length)},${getYInterest(d.cumulativeInterest)}`).join(' ');

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      {/* Chart Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>3.</span> Visual Amortization Trajectory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare Principal vs Interest over time and observe the accelerated payoff difference
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setView('stacked_bars')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              view === 'stacked_bars'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Principal vs Interest</span>
          </button>
          <button
            type="button"
            onClick={() => setView('balance_equity')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              view === 'balance_equity'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Balance & Equity</span>
          </button>
          <button
            type="button"
            onClick={() => setView('cumulative_interest')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              view === 'cumulative_interest'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Total Interest Paid</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
        {view === 'stacked_bars' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="font-semibold text-slate-700">Scheduled Principal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-400 inline-block" />
              <span className="font-semibold text-slate-700">Extra Principal (Accelerated)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              <span className="font-semibold text-slate-700">Interest Paid</span>
            </div>
          </div>
        )}

        {view === 'balance_equity' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-rose-500 inline-block" />
              <span className="font-semibold text-slate-700">Remaining Balance (Your Plan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-slate-300 inline-block border-b border-dashed border-slate-500" />
              <span className="font-semibold text-slate-500">Standard Balance (Baseline)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-emerald-500 inline-block" />
              <span className="font-semibold text-slate-700">Home Equity</span>
            </div>
          </div>
        )}

        {view === 'cumulative_interest' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-amber-500 inline-block" />
              <span className="font-semibold text-slate-700">Your Plan Total Interest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-slate-400 inline-block border-b border-dashed border-slate-500" />
              <span className="font-semibold text-slate-500">Baseline Total Interest (No Extra)</span>
            </div>
            <div className="text-emerald-600 font-bold">
              Gap = {formatCurrency(result.interestSavings)} Money Saved!
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Hover on chart to inspect details
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] select-none"
          onMouseLeave={() => {
            setHoveredYear(null);
            setHoverX(null);
          }}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + innerHeight * (1 - pct);
            const valLabel = view === 'stacked_bars'
              ? formatCurrency(maxAnnualPayment * pct)
              : view === 'balance_equity'
              ? formatCurrency(maxHomePrice * pct)
              : formatCurrency(maxInterest * pct);

            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono font-medium"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* VIEW 1: STACKED BARS (Principal vs Interest per year) */}
          {view === 'stacked_bars' && (
            <g>
              {data.map((item, i) => {
                const cx = padding.left + i * barSlotWidth + barSlotWidth / 2;
                const x = cx - barWidth / 2;

                const interestH = (item.interestPaid / maxAnnualPayment) * innerHeight;
                const principalH = (item.principalPaid / maxAnnualPayment) * innerHeight;
                const extraH = (item.extraPrincipalPaid / maxAnnualPayment) * innerHeight;

                const interestY = padding.top + innerHeight - interestH;
                const principalY = interestY - principalH;
                const extraY = principalY - extraH;

                const isHovered = hoveredYear?.calendarYear === item.calendarYear;

                return (
                  <g
                    key={item.calendarYear}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => {
                      setHoveredYear(item);
                      setHoverX(cx);
                    }}
                  >
                    {/* Hover highlight background */}
                    {isHovered && (
                      <rect
                        x={cx - barSlotWidth / 2}
                        y={padding.top}
                        width={barSlotWidth}
                        height={innerHeight}
                        fill="#f0fdf4"
                        opacity={0.7}
                      />
                    )}

                    {/* Interest Bar (bottom) */}
                    <rect
                      x={x}
                      y={interestY}
                      width={barWidth}
                      height={Math.max(0, interestH)}
                      fill="#fbbf24"
                      rx={extraH === 0 && principalH === 0 ? 3 : 0}
                    />

                    {/* Principal Bar (middle) */}
                    <rect
                      x={x}
                      y={principalY}
                      width={barWidth}
                      height={Math.max(0, principalH)}
                      fill="#10b981"
                      rx={extraH === 0 ? 3 : 0}
                    />

                    {/* Extra Principal Bar (top) */}
                    {extraH > 0 && (
                      <rect
                        x={x}
                        y={extraY}
                        width={barWidth}
                        height={Math.max(0, extraH)}
                        fill="#2dd4bf"
                        rx={3}
                      />
                    )}

                    {/* Year Label on X Axis */}
                    {(data.length <= 15 || i % 2 === 0 || i === data.length - 1) && (
                      <text
                        x={cx}
                        y={padding.top + innerHeight + 18}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isHovered ? 'fill-emerald-700 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        '{String(item.calendarYear).slice(-2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* VIEW 2: BALANCE & EQUITY DUAL AREA CHART */}
          {view === 'balance_equity' && (
            <g>
              {/* Baseline Remaining Balance (Dotted Gray) */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="6 4"
                points={baselineBalancePoints}
              />

              {/* Home Equity Area */}
              <polygon
                fill="url(#equityGradient)"
                opacity={0.35}
                points={`${padding.left},${padding.top + innerHeight} ${equityPoints} ${padding.left + innerWidth},${padding.top + innerHeight}`}
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={equityPoints}
              />

              {/* Custom Remaining Balance Area */}
              <polygon
                fill="url(#balanceGradient)"
                opacity={0.25}
                points={`${padding.left},${padding.top + innerHeight} ${balancePoints} ${padding.left + innerWidth},${padding.top + innerHeight}`}
              />
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                points={balancePoints}
              />

              {/* Interactive Dots & Hover zones */}
              {data.map((item, i) => {
                const cx = getX(i, data.length);
                const cyBalance = getYBalance(item.endingBalance);
                const cyEquity = getYBalance(item.endingEquity);
                const isHovered = hoveredYear?.calendarYear === item.calendarYear;

                return (
                  <g
                    key={item.calendarYear}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredYear(item);
                      setHoverX(cx);
                    }}
                  >
                    <rect
                      x={cx - innerWidth / (data.length * 2)}
                      y={padding.top}
                      width={innerWidth / data.length}
                      height={innerHeight}
                      fill="transparent"
                    />

                    {/* Balance point */}
                    <circle
                      cx={cx}
                      cy={cyBalance}
                      r={isHovered ? 5 : 3}
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Equity point */}
                    <circle
                      cx={cx}
                      cy={cyEquity}
                      r={isHovered ? 5 : 3}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Year Label */}
                    {(data.length <= 15 || i % 2 === 0 || i === data.length - 1) && (
                      <text
                        x={cx}
                        y={padding.top + innerHeight + 18}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-500"
                      >
                        '{String(item.calendarYear).slice(-2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* VIEW 3: CUMULATIVE INTEREST PAID */}
          {view === 'cumulative_interest' && (
            <g>
              {/* Baseline interest curve (higher interest) */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                points={baselineCumInterestPoints}
              />

              {/* Your plan interest curve */}
              <polygon
                fill="url(#interestGradient)"
                opacity={0.3}
                points={`${padding.left},${padding.top + innerHeight} ${cumInterestPoints} ${padding.left + innerWidth},${padding.top + innerHeight}`}
              />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                points={cumInterestPoints}
              />

              {/* Data points */}
              {data.map((item, i) => {
                const cx = getX(i, data.length);
                const cy = getYInterest(item.cumulativeInterest);
                const isHovered = hoveredYear?.calendarYear === item.calendarYear;

                return (
                  <g
                    key={item.calendarYear}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredYear(item);
                      setHoverX(cx);
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3}
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {(data.length <= 15 || i % 2 === 0 || i === data.length - 1) && (
                      <text
                        x={cx}
                        y={padding.top + innerHeight + 18}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-500"
                      >
                        '{String(item.calendarYear).slice(-2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#ffe4e6" />
            </linearGradient>
            <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredYear && hoverX !== null && (
          <div
            className="absolute z-20 pointer-events-none top-4 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs w-64 transform -translate-x-1/2"
            style={{
              left: `${Math.max(130, Math.min(width - 130, hoverX))}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
              <span className="font-bold text-emerald-400">
                Year {hoveredYear.yearNumber} ({hoveredYear.calendarYear})
              </span>
              <span className="text-[10px] text-slate-400">Annual Overview</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Principal:
                </span>
                <span className="font-bold text-emerald-300">
                  {formatCurrency(hoveredYear.principalPaid)}
                </span>
              </div>

              {hoveredYear.extraPrincipalPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400" /> Extra Principal:
                  </span>
                  <span className="font-bold text-teal-300">
                    +{formatCurrency(hoveredYear.extraPrincipalPaid)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Interest Paid:
                </span>
                <span className="font-bold text-amber-300">
                  {formatCurrency(hoveredYear.interestPaid)}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-1.5 flex justify-between">
                <span className="text-slate-400">Total Year Paid:</span>
                <span className="font-bold text-white">
                  {formatCurrency(hoveredYear.totalPayment)}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-1.5 flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-rose-300">
                  {formatCurrency(hoveredYear.endingBalance)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Home Equity:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(hoveredYear.endingEquity)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
