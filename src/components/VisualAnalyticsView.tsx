import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Layers, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { MonthlyBudgetSummary, Category, Transaction } from '../types/finance';

interface VisualAnalyticsViewProps {
  summary: MonthlyBudgetSummary;
  categories: Category[];
  transactions: Transaction[];
  currencySymbol: string;
}

export const VisualAnalyticsView: React.FC<VisualAnalyticsViewProps> = ({
  summary,
  categories,
  transactions,
  currencySymbol,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter current month expenses
  const monthExpenses = React.useMemo(() => {
    return transactions.filter(tx => tx.date.startsWith(summary.month) && tx.type === 'expense');
  }, [transactions, summary.month]);

  // Aggregate spending by category
  const categorySpending = React.useMemo(() => {
    const map = new Map<string, number>();
    monthExpenses.forEach(tx => {
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
    });

    return categories
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        type: cat.type,
        budgetLimit: cat.budgetLimit,
        spent: map.get(cat.id) || 0,
        percentage: summary.totalExpenses > 0 ? ((map.get(cat.id) || 0) / summary.totalExpenses) * 100 : 0
      }))
      .filter(item => item.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, monthExpenses, summary.totalExpenses]);

  // Cumulative spend by day for trajectory chart
  const trajectoryData = React.useMemo(() => {
    const daysInMonth = summary.daysInMonth;
    const dailyAccum: { day: number; cumulativeActual: number; idealPace: number }[] = [];
    const dailySpendMap = new Map<number, number>();

    monthExpenses.forEach(tx => {
      const d = parseInt(tx.date.split('-')[2], 10);
      dailySpendMap.set(d, (dailySpendMap.get(d) || 0) + tx.amount);
    });

    let runningActual = 0;
    const totalBudget = summary.totalBudgetLimit || 1;
    const dailyIdealSlope = totalBudget / daysInMonth;

    for (let day = 1; day <= daysInMonth; day++) {
      const daySpend = dailySpendMap.get(day) || 0;
      if (day <= summary.daysElapsed) {
        runningActual += daySpend;
      }
      dailyAccum.push({
        day,
        cumulativeActual: day <= summary.daysElapsed ? runningActual : 0,
        idealPace: dailyIdealSlope * day
      });
    }

    return dailyAccum;
  }, [summary, monthExpenses]);

  // Top Merchants Leaderboard
  const topMerchants = React.useMemo(() => {
    const map = new Map<string, { total: number; count: number; category: string }>();
    monthExpenses.forEach(tx => {
      const key = tx.payee.trim();
      const existing = map.get(key) || { total: 0, count: 0, category: tx.categoryName };
      map.set(key, {
        total: existing.total + tx.amount,
        count: existing.count + 1,
        category: tx.categoryName
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [monthExpenses]);

  // Payment Method Breakdown
  const paymentBreakdown = React.useMemo(() => {
    const map = new Map<string, number>();
    monthExpenses.forEach(tx => {
      const method = tx.paymentMethod;
      map.set(method, (map.get(method) || 0) + tx.amount);
    });

    return Array.from(map.entries())
      .map(([method, total]) => ({
        method,
        total,
        percentage: summary.totalExpenses > 0 ? (total / summary.totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses, summary.totalExpenses]);

  // Donut chart calculations
  const donutRadius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * donutRadius;
  let accumulatedAngle = 0;

  const donutSlices = categorySpending.map(cat => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += (cat.percentage / 100) * circumference;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = hoveredCategory
    ? categorySpending.find(c => c.id === hoveredCategory)
    : null;

  // Max value for trajectory graph scaling
  const maxTrajectoryVal = Math.max(
    summary.totalBudgetLimit,
    summary.totalExpenses,
    ...trajectoryData.map(d => d.cumulativeActual)
  ) * 1.1;

  // 50/30/20 percentages
  const incomeBase = summary.totalIncome > 0 ? summary.totalIncome : summary.totalExpenses;
  const needsPct = Math.round((summary.needsSpend / incomeBase) * 100);
  const wantsPct = Math.round((summary.wantsSpend / incomeBase) * 100);
  const savingsPct = Math.round(((incomeBase - (summary.needsSpend + summary.wantsSpend)) / incomeBase) * 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <PieChart className="w-6 h-6 text-emerald-400" />
          Visual Spending Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Visual breakdowns, pacing trajectory curves, and category allocations for {summary.month}
        </p>
      </div>

      {/* Grid: Donut Breakdown + Trajectory Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Category Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Expense Allocation
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {categorySpending.length} Active Categories
            </span>
          </div>

          {/* SVG Donut Visual */}
          <div className="relative flex items-center justify-center py-4">
            <svg 
              width="240" 
              height="240" 
              viewBox="0 0 200 200" 
              className="transform -rotate-90 filter drop-shadow-md"
            >
              {/* Background circle track */}
              <circle
                cx="100"
                cy="100"
                r={donutRadius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />

              {donutSlices.map(slice => (
                <circle
                  key={slice.id}
                  cx="100"
                  cy="100"
                  r={donutRadius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={hoveredCategory === slice.id ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(slice.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              ))}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
              {activeCategory ? (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[130px]">
                    {activeCategory.name}
                  </span>
                  <span className="text-lg font-extrabold text-white font-mono mt-0.5">
                    {currencySymbol}{activeCategory.spent.toFixed(0)}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {activeCategory.percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Spent
                  </span>
                  <span className="text-xl font-extrabold text-white font-mono mt-0.5">
                    {currencySymbol}{summary.totalExpenses.toFixed(0)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {summary.budgetUtilization.toFixed(0)}% of limit
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Category List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {categorySpending.map(cat => (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                  hoveredCategory === cat.id
                    ? 'bg-slate-800 border-slate-700 shadow'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-slate-200 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-white font-bold">
                    {currencySymbol}{cat.spent.toFixed(0)}
                  </span>
                  <span className="text-slate-400 text-[11px] ml-2">
                    ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cumulative Spending Pace Trajectory (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Cumulative Pace vs Linear Ideal Trajectory
              </h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                  Your Spend Curve
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-3 h-0.5 bg-slate-500 border-dashed border-t inline-block" />
                  Ideal Pace
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Shows how your accumulated spending compares to the ideal linear pacing target throughout the month.
            </p>
          </div>

          {/* SVG Trajectory Chart */}
          <div className="h-64 w-full pt-4">
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#475569" opacity="0.8" />

              {/* Linear Ideal Slope Line (0, 200) to (500, yTop) */}
              {(() => {
                const idealEndY = 200 - (summary.totalBudgetLimit / maxTrajectoryVal) * 190;
                return (
                  <line
                    x1="0"
                    y1="200"
                    x2="500"
                    y2={idealEndY}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                );
              })()}

              {/* Actual Cumulative Area & Line */}
              {(() => {
                const points = trajectoryData
                  .filter(d => d.day <= summary.daysElapsed)
                  .map(d => {
                    const x = ((d.day - 1) / (summary.daysInMonth - 1)) * 500;
                    const y = 200 - (d.cumulativeActual / maxTrajectoryVal) * 190;
                    return `${x},${y}`;
                  });

                if (points.length < 2) return null;

                const firstPoint = points[0];
                const lastPoint = points[points.length - 1];
                const lastX = lastPoint.split(',')[0];
                const areaPath = `M ${points.join(' L ')} L ${lastX},200 L 0,200 Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#actualGradient)" />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points.join(' ')}
                    />
                    {/* Highlight current point */}
                    <circle
                      cx={parseFloat(lastPoint.split(',')[0])}
                      cy={parseFloat(lastPoint.split(',')[1])}
                      r="5"
                      fill="#10b981"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}
            </svg>

            {/* X-axis days markers */}
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day {summary.daysInMonth}</span>
            </div>
          </div>

          {/* Trajectory Insights Bar */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">
              Current burn rate: <strong className="text-white font-mono">{currencySymbol}{summary.dailyAverageSpend.toFixed(0)}/day</strong>
            </span>
            <span className="text-slate-400">
              Remaining daily limit: <strong className="text-emerald-400 font-mono">{currencySymbol}{summary.recommendedDailyRemaining.toFixed(0)}/day</strong>
            </span>
          </div>
        </div>

      </div>

      {/* 50/30/20 Rule Deep Dive */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              The 50 / 30 / 20 Budget Rule Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Standard personal finance principle: 50% Essential Needs, 30% Discretionary Wants, 20% Savings & Debt Acceleration
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            Based on {currencySymbol}{incomeBase.toFixed(0)} monthly base
          </div>
        </div>

        {/* 3 Pillar Visual Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Needs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 uppercase tracking-wider">
                Needs (Target: 50%)
              </span>
              <span className="font-mono text-sm font-extrabold text-white">
                {needsPct}%
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {currencySymbol}{summary.needsSpend.toFixed(0)}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full ${needsPct > 55 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (needsPct / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Rent, utilities, groceries, transportation, health insurance.
              {needsPct <= 50 ? ' Safely within the 50% target envelope.' : ' Over target by ' + (needsPct - 50) + '%.'}
            </p>
          </div>

          {/* Wants */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                Wants (Target: 30%)
              </span>
              <span className="font-mono text-sm font-extrabold text-white">
                {wantsPct}%
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {currencySymbol}{summary.wantsSpend.toFixed(0)}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full ${wantsPct > 35 ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (wantsPct / 30) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dining out, coffee shops, subscriptions, leisure, shopping.
              {wantsPct > 30 ? ` Exceeding target by ${wantsPct - 30}%. High opportunity to optimize.` : ' Well disciplined under 30%.'}
            </p>
          </div>

          {/* Savings */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">
                Savings (Target: 20%)
              </span>
              <span className="font-mono text-sm font-extrabold text-white">
                {summary.savingsRate}%
              </span>
            </div>
            <div className={`text-xl font-mono font-bold ${summary.netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {summary.netSavings >= 0 ? '+' : ''}{currencySymbol}{summary.netSavings.toFixed(0)}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, (summary.savingsRate / 20) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Emergency fund deposits, debt principal payoff, investments.
              {summary.savingsRate >= 20 ? ' Exceeding the golden 20% savings threshold!' : ' Below 20% target. Automating a payday transfer will help.'}
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Top Merchants & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Merchants Leaderboard */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Top Payees & Outflows
            </h2>
            <span className="text-xs text-slate-400">Ranked by total amount</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topMerchants.map((merchant, idx) => (
              <div key={merchant.name} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      {merchant.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {merchant.category} • {merchant.count} transaction{merchant.count > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-white shrink-0">
                  {currencySymbol}{merchant.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              Payment Channels
            </h2>
            <span className="text-xs text-slate-400">Method volume</span>
          </div>

          <div className="space-y-3 pt-1">
            {paymentBreakdown.map(p => (
              <div key={p.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize font-semibold text-slate-300">
                    {p.method.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol}{p.total.toFixed(0)} ({p.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${Math.min(100, p.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
