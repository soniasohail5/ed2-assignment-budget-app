import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  Flame,
  Plus
} from 'lucide-react';
import { MonthlyBudgetSummary, Category, Transaction, SavingGoal, Recommendation } from '../types/finance';

interface DashboardViewProps {
  summary: MonthlyBudgetSummary;
  categories: Category[];
  transactions: Transaction[];
  goals: SavingGoal[];
  recommendations: Recommendation[];
  currencySymbol: string;
  onOpenAddModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'analytics' | 'transactions' | 'budgets' | 'recommendations' | 'goals') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  categories,
  transactions,
  goals,
  recommendations,
  currencySymbol,
  onOpenAddModal,
  onNavigateTab,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Recent transactions for this month
  const monthTransactions = transactions
    .filter(tx => tx.date.startsWith(summary.month))
    .slice(0, 7);

  // Category spending aggregation
  const catSpendMap = React.useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(tx => tx.date.startsWith(summary.month) && tx.type === 'expense')
      .forEach(tx => {
        map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
      });
    return map;
  }, [transactions, summary.month]);

  // Top spending categories
  const topCategories = React.useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        spent: catSpendMap.get(cat.id) || 0,
        percent: cat.budgetLimit > 0 ? ((catSpendMap.get(cat.id) || 0) / cat.budgetLimit) * 100 : 0
      }))
      .filter(c => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, catSpendMap]);

  // Pace status calculations
  const paceDifference = summary.budgetUtilization - summary.expectedPacePercentage;
  const isPacingOver = paceDifference > 5;
  const isPacingWell = paceDifference <= -2;

  // Daily spending aggregation for mini bar chart
  const dailySpendArray = React.useMemo(() => {
    const daysCount = summary.daysInMonth;
    const days: { day: number; amount: number; isWeekend: boolean }[] = [];
    const [yStr, mStr] = summary.month.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;

    for (let d = 1; d <= daysCount; d++) {
      const dateObj = new Date(year, month, d);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      days.push({ day: d, amount: 0, isWeekend });
    }

    transactions
      .filter(tx => tx.date.startsWith(summary.month) && tx.type === 'expense')
      .forEach(tx => {
        const dayNum = parseInt(tx.date.split('-')[2], 10);
        if (dayNum >= 1 && dayNum <= daysCount) {
          days[dayNum - 1].amount += tx.amount;
        }
      });

    return days;
  }, [transactions, summary.month, summary.daysInMonth]);

  const maxDaySpend = Math.max(...dailySpendArray.map(d => d.amount), 50);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Month Pace Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Calendar className="w-3 h-3" />
                <span>Month Pace Tracking</span>
              </span>
              <span className="text-xs text-slate-400">
                Day {summary.daysElapsed} of {summary.daysInMonth} ({summary.expectedPacePercentage.toFixed(0)}% elapsed)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Monthly Spending Health
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {isPacingOver ? (
                <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  Pacing {Math.abs(paceDifference).toFixed(0)}% ahead of ideal budget pace. Limit discretionary spend to keep buffer intact.
                </span>
              ) : isPacingWell ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  Excellent discipline! You are pacing {Math.abs(paceDifference).toFixed(0)}% under target budget with {summary.daysRemaining} days remaining.
                </span>
              ) : (
                <span>On steady track. Your daily burn rate is aligned with monthly projections.</span>
              )}
            </p>
          </div>

          {/* Burn rate badge & remaining allowance */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Safe Daily Remaining
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                {currencySymbol}{summary.recommendedDailyRemaining.toFixed(0)}
                <span className="text-xs font-normal text-slate-400">/day</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Avg spent so far: {currencySymbol}{summary.dailyAverageSpend.toFixed(0)}/day
              </div>
            </div>

            <div className="w-px h-12 bg-slate-800" />

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Remaining Budget
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {currencySymbol}{Math.max(0, summary.totalBudgetLimit - summary.totalExpenses).toFixed(0)}
              </div>
              <div className="text-[11px] text-slate-500">
                of {currencySymbol}{summary.totalBudgetLimit.toFixed(0)} total
              </div>
            </div>
          </div>
        </div>

        {/* Dual Progress Bars: Time Elapsed vs Budget Used */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Budget Utilized: {summary.budgetUtilization.toFixed(0)}% ({currencySymbol}{summary.totalExpenses.toFixed(0)})</span>
            <span>Month Elapsed: {summary.expectedPacePercentage.toFixed(0)}%</span>
          </div>

          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            {/* Target benchmark indicator line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white z-10 shadow-sm"
              style={{ left: `${Math.min(100, summary.expectedPacePercentage)}%` }}
              title={`Pace target benchmark: ${summary.expectedPacePercentage.toFixed(0)}%`}
            />

            {/* Actual budget progress bar */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.budgetUtilization > 95
                  ? 'bg-red-500'
                  : summary.budgetUtilization > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.budgetUtilization)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>$0</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-white" />
              White marker = Target pace for today ({summary.expectedPacePercentage.toFixed(0)}%)
            </span>
            <span>{currencySymbol}{summary.totalBudgetLimit.toFixed(0)} limit</span>
          </div>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Income Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {currencySymbol}{summary.totalIncome.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Deposited this month</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {currencySymbol}{summary.totalExpenses.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Budget: {currencySymbol}{summary.totalBudgetLimit.toFixed(0)}</span>
            <span className={summary.budgetUtilization > 100 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
              {summary.budgetUtilization.toFixed(0)}% used
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Savings</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold font-mono ${summary.netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summary.netSavings >= 0 ? '+' : ''}{currencySymbol}{summary.netSavings.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Savings Rate:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {summary.savingsRate}%
            </span>
          </div>
        </div>

        {/* Needs vs Wants Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">50/30/20 Split</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-white mt-1">
            <span className="text-indigo-400 font-mono">{summary.totalIncome > 0 ? ((summary.needsSpend / summary.totalIncome) * 100).toFixed(0) : 0}%</span> Needs • {' '}
            <span className="text-amber-400 font-mono">{summary.totalIncome > 0 ? ((summary.wantsSpend / summary.totalIncome) * 100).toFixed(0) : 0}%</span> Wants • {' '}
            <span className="text-emerald-400 font-mono">{summary.savingsRate}%</span> Save
          </div>
          <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
            <div 
              style={{ width: `${Math.min(100, summary.totalIncome > 0 ? (summary.needsSpend / summary.totalIncome) * 100 : 50)}%` }} 
              className="bg-indigo-500" 
              title="Needs"
            />
            <div 
              style={{ width: `${Math.min(100, summary.totalIncome > 0 ? (summary.wantsSpend / summary.totalIncome) * 100 : 30)}%` }} 
              className="bg-amber-500" 
              title="Wants"
            />
            <div 
              style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }} 
              className="bg-emerald-500" 
              title="Savings"
            />
          </div>
        </div>

      </div>

      {/* Daily Spending Trend Mini Chart */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Daily Spending Outflows & Weekend Activity
            </h2>
            <p className="text-xs text-slate-400">
              Spending distribution day-by-day across this month
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Deep Visual Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SVG / Flex Bar Chart */}
        <div className="pt-2">
          <div className="h-32 flex items-end gap-1 sm:gap-1.5 w-full">
            {dailySpendArray.map(item => {
              const heightPercent = maxDaySpend > 0 ? (item.amount / maxDaySpend) * 100 : 0;
              const isPast = item.day <= summary.daysElapsed;
              const isToday = item.day === summary.daysElapsed;

              return (
                <div 
                  key={item.day} 
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip */}
                  {item.amount > 0 && (
                    <div className="absolute -top-9 z-20 hidden group-hover:flex flex-col items-center pointer-events-none">
                      <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                        Day {item.day}: {currencySymbol}{item.amount.toFixed(2)}
                      </div>
                      <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700" />
                    </div>
                  )}

                  {/* Bar */}
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      !isPast
                        ? 'bg-slate-800/40'
                        : isToday
                        ? 'bg-emerald-400 ring-2 ring-emerald-500/50'
                        : item.isWeekend
                        ? 'bg-amber-500/80 hover:bg-amber-400'
                        : item.amount > 100
                        ? 'bg-emerald-500 hover:bg-emerald-400'
                        : 'bg-emerald-600/70 hover:bg-emerald-500'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />

                  {/* Day label */}
                  <span className={`text-[9px] mt-1.5 ${isToday ? 'font-bold text-emerald-400' : 'text-slate-500'}`}>
                    {item.day % 5 === 0 || item.day === 1 || item.day === summary.daysElapsed ? item.day : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Weekday Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
                Weekend Spend
              </span>
            </div>
            <span>Current day highlighted in bright emerald</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Top Recommendations Banner & Category Budget Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Smart Savings Recommendations Highlight */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Personalized Money-Saving Recommendations
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Recommendations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Calculated from your live spending ratios, category pace, and subscription frequencies:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {recommendations.slice(0, 2).map(rec => (
              <div
                key={rec.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {rec.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      Save +{currencySymbol}{rec.potentialSavingsMonthly}/mo
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    +{currencySymbol}{rec.potentialSavingsAnnual}/yr in your pocket
                  </span>
                  <button
                    onClick={() => onNavigateTab('recommendations')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{rec.actionLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Top Categories Budget Health */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Budgets
            </h2>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {topCategories.slice(0, 5).map(cat => {
              const isOver = cat.percent > 100;
              const isWarning = cat.percent > 80 && !isOver;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                      {cat.name}
                    </span>
                    <div className="font-mono text-[11px] text-slate-300">
                      <span className={isOver ? 'text-red-400 font-bold' : ''}>
                        {currencySymbol}{cat.spent.toFixed(0)}
                      </span>
                      <span className="text-slate-500"> / {currencySymbol}{cat.budgetLimit}</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, cat.percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigateTab('budgets')}
            className="w-full py-2 text-center text-xs font-medium text-slate-400 hover:text-white bg-slate-950/40 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
          >
            View all {categories.length} categories
          </button>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-400">
              Latest activity recorded for {summary.month}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>

            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer ml-2"
            >
              <span>View All ({transactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table or Cards */}
        <div className="divide-y divide-slate-800/60">
          {monthTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No transactions recorded for this month yet. Click "+ Record" above to add your first transaction!
            </div>
          ) : (
            monthTransactions.map(tx => (
              <div 
                key={tx.id} 
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    tx.type === 'income' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {tx.payee}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{tx.categoryName}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      {tx.isRecurring && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-sm font-extrabold font-mono ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {tx.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
