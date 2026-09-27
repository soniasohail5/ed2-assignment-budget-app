import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Category, Transaction, MonthlyBudgetSummary, CategoryType } from '../types/finance';

interface BudgetsViewProps {
  categories: Category[];
  transactions: Transaction[];
  summary: MonthlyBudgetSummary;
  currencySymbol: string;
  onUpdateBudget: (categoryId: string, newLimit: number) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  transactions,
  summary,
  currencySymbol,
  onUpdateBudget,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>('want');
  const [newCatLimit, setNewCatLimit] = useState('150');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Month expenses per category
  const catSpendMap = React.useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(tx => tx.date.startsWith(summary.month) && tx.type === 'expense')
      .forEach(tx => {
        map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
      });
    return map;
  }, [transactions, summary.month]);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditAmount(cat.budgetLimit.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(catId, val);
    }
    setEditingId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      type: newCatType,
      budgetLimit: parseFloat(newCatLimit) || 100,
      color: newCatColor,
      icon: 'Tag',
      isCustom: true,
    });

    setNewCatName('');
    setNewCatLimit('150');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Monthly Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set envelopes for essential needs and discretionary wants for {summary.month}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Aggregate Budget Envelope Banner */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Budget Envelope
            </span>
            <div className="text-2xl font-extrabold text-white font-mono">
              {currencySymbol}{summary.totalBudgetLimit.toFixed(0)}
            </div>
            <span className="text-xs text-slate-500">Across {categories.length} categories</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outflows So Far
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {currencySymbol}{summary.totalExpenses.toFixed(0)}
            </div>
            <span className="text-xs text-slate-500">
              {summary.budgetUtilization.toFixed(0)}% utilization
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Remaining Envelope
            </span>
            <div className={`text-2xl font-extrabold font-mono ${
              summary.totalBudgetLimit >= summary.totalExpenses ? 'text-white' : 'text-red-400'
            }`}>
              {currencySymbol}{Math.max(0, summary.totalBudgetLimit - summary.totalExpenses).toFixed(0)}
            </div>
            <span className="text-xs text-slate-500">
              Safe buffer: {currencySymbol}{summary.recommendedDailyRemaining.toFixed(0)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const spent = catSpendMap.get(cat.id) || 0;
          const percent = cat.budgetLimit > 0 ? (spent / cat.budgetLimit) * 100 : 0;
          const remaining = cat.budgetLimit - spent;
          const isOver = percent > 100;
          const isWarning = percent > 80 && !isOver;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                isOver 
                  ? 'border-red-500/40 bg-red-950/5' 
                  : isWarning 
                  ? 'border-amber-500/30' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-sm font-bold text-white truncate">
                      {cat.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    cat.type === 'need'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : cat.type === 'savings'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : cat.type === 'debt'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {cat.type}
                  </span>
                </div>

                {/* Spent vs Budget */}
                <div className="flex items-baseline justify-between mb-1 text-xs">
                  <span className="text-slate-400">Spent:</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {currencySymbol}{spent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400">Monthly Target:</span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        autoFocus
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                        className="w-20 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-300">
                        {currencySymbol}{cat.budgetLimit}
                      </span>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                        title="Edit monthly budget"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className={`font-medium ${
                  isOver 
                    ? 'text-red-400 font-bold flex items-center gap-1' 
                    : isWarning 
                    ? 'text-amber-400' 
                    : 'text-slate-400'
                }`}>
                  {isOver ? (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{currencySymbol}{Math.abs(remaining).toFixed(0)} over budget</span>
                    </>
                  ) : (
                    <span>{currencySymbol}{remaining.toFixed(0)} remaining</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">
                    {percent.toFixed(0)}%
                  </span>

                  {cat.isCustom && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete custom category "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      title="Delete category"
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-base font-bold text-white">Create Custom Category</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Hobbies, Freelance Tools"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Allocation Type
                  </label>
                  <select
                    value={newCatType}
                    onChange={e => setNewCatType(e.target.value as CategoryType)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="need">Need (Essential)</option>
                    <option value="want">Want (Discretionary)</option>
                    <option value="savings">Savings / Investment</option>
                    <option value="debt">Debt Repayment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monthly Limit ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={newCatLimit}
                    onChange={e => setNewCatLimit(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Color Accent
                </label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCatColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        newCatColor === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
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
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
