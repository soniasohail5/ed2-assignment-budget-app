import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  PiggyBank, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  X,
  ShieldCheck,
  Plane,
  Laptop,
  Car,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingGoal } from '../types/finance';

interface SavingsGoalsViewProps {
  goals: SavingGoal[];
  currencySymbol: string;
  onAddGoal: (goal: Omit<SavingGoal, 'id' | 'userId' | 'createdAt'>) => void;
  onContribute: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  currencySymbol,
  onAddGoal,
  onContribute,
  onDeleteGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('100');

  // Form states for new goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('3000');
  const [currentAmount, setCurrentAmount] = useState('500');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [monthlyTarget, setMonthlyTarget] = useState('250');
  const [color, setColor] = useState('#10b981');
  const [category, setCategory] = useState('Safety Net');

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;

    const val = parseFloat(contributeAmount);
    if (!isNaN(val) && val > 0) {
      onContribute(contributeGoalId, val);

      // Check if newly funded goal hits target
      const targetGoal = goals.find(g => g.id === contributeGoalId);
      if (targetGoal && (targetGoal.currentAmount + val) >= targetGoal.targetAmount) {
        triggerCelebration();
      }
    }

    setContributeGoalId(null);
    setContributeAmount('100');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount) || 1000,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      category,
      icon: 'Target',
      color,
      monthlyContributionTarget: parseFloat(monthlyTarget) || 100,
    });

    setTitle('');
    setShowAddModal(false);
  };

  const totalTargetAll = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAll > 0 ? (totalSavedAll / totalTargetAll) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" />
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Allocate your monthly surplus toward milestone targets and track acceleration
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Goals Progress Banner */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Milestone Progress ({goals.length} Goals)
          </span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">
            {currencySymbol}{totalSavedAll.toFixed(0)} of {currencySymbol}{totalTargetAll.toFixed(0)} saved ({overallProgress.toFixed(0)}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = percent >= 100;
          const monthsLeft = Math.ceil(remaining / Math.max(1, goal.monthlyContributionTarget));

          return (
            <div
              key={goal.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                isCompleted 
                  ? 'border-emerald-500/50 bg-emerald-950/10' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ 
                        backgroundColor: `${goal.color}20`,
                        borderColor: `${goal.color}40`,
                        color: goal.color
                      }}
                    >
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {goal.title}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Due {goal.deadline}
                  </span>
                </div>

                {/* Amount progress */}
                <div className="flex items-baseline justify-between mb-1 text-xs">
                  <span className="text-slate-400">Current Balance:</span>
                  <div className="font-mono text-base font-extrabold text-white">
                    {currencySymbol}{goal.currentAmount.toFixed(0)}
                    <span className="text-xs font-normal text-slate-400"> / {currencySymbol}{goal.targetAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 my-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, percent)}%`,
                      backgroundColor: isCompleted ? '#10b981' : goal.color 
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{percent.toFixed(0)}% funded</span>
                  {isCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Goal Reached!
                    </span>
                  ) : (
                    <span>~{monthsLeft} month{monthsLeft > 1 ? 's' : ''} at {currencySymbol}{goal.monthlyContributionTarget}/mo</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setContributeGoalId(goal.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all cursor-pointer"
                >
                  + Add Funds
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete goal "${goal.title}"?`)) {
                      onDeleteGoal(goal.id);
                    }
                  }}
                  title="Delete goal"
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white">Deposit to Savings Goal</h3>
              <button onClick={() => setContributeGoalId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contribution Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  autoFocus
                  value={contributeAmount}
                  onChange={e => setContributeAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-lg font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {[50, 100, 250, 500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributeAmount(amt.toString())}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white">Create New Savings Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Car Downpayment, Rainy Day Reserve"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Total ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="50"
                    required
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Starting Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monthly Contribution ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="25"
                    value={monthlyTarget}
                    onChange={e => setMonthlyTarget(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Color Badge
                </label>
                <div className="flex gap-2">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
