import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Flame, 
  PiggyBank, 
  Calendar,
  Tag
} from 'lucide-react';
import { Recommendation, Category, Transaction, SavingGoal, MonthlyBudgetSummary } from '../types/finance';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  categories: Category[];
  transactions: Transaction[];
  goals: SavingGoal[];
  summary: MonthlyBudgetSummary;
  currencySymbol: string;
  onUpdateCategoryBudget: (categoryId: string, newLimit: number) => void;
  onNavigateTab: (tab: 'dashboard' | 'analytics' | 'transactions' | 'budgets' | 'recommendations' | 'goals') => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  categories,
  transactions,
  goals,
  summary,
  currencySymbol,
  onUpdateCategoryBudget,
  onNavigateTab,
}) => {
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const totalPotentialMonthly = recommendations.reduce((sum, r) => sum + r.potentialSavingsMonthly, 0);
  const totalPotentialAnnual = totalPotentialMonthly * 12;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Savings Recommendations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Actionable Savings Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Data-backed financial advice computed directly from your dining habits, subscription counts, and budget allocation pacing.
            </p>
          </div>

          {/* Aggregate Savings Potential KPI */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Unlockable Savings
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                +{currencySymbol}{totalPotentialMonthly}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                +{currencySymbol}{totalPotentialAnnual}/year potential
              </div>
            </div>
          </div>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-400" />
          Personalized Recommendations ({recommendations.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {rec.category}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      +{currencySymbol}{rec.potentialSavingsMonthly}/mo
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      +{currencySymbol}{rec.potentialSavingsAnnual}/yr
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.description}
                </p>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-200 font-semibold">Why this works: </strong>
                  {rec.reasoning}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                  rec.impact === 'high'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {rec.impact} impact
                </span>

                {rec.actionType === 'adjust_budget' && rec.targetCategoryId && rec.targetAmount ? (
                  <button
                    onClick={() => {
                      onUpdateCategoryBudget(rec.targetCategoryId!, rec.targetAmount!);
                      setAppliedNotice(`Updated category budget to ${currencySymbol}${rec.targetAmount}!`);
                      setTimeout(() => setAppliedNotice(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all cursor-pointer"
                  >
                    Apply {currencySymbol}{rec.targetAmount} Budget
                  </button>
                ) : rec.actionType === 'view_transactions' ? (
                  <button
                    onClick={() => onNavigateTab('transactions')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    View Charges
                  </button>
                ) : rec.actionType === 'view_goals' ? (
                  <button
                    onClick={() => onNavigateTab('goals')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all cursor-pointer"
                  >
                    View Goals
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateTab('analytics')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    View Analytics
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
