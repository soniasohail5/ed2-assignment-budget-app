import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, RefreshCw, AlertCircle, Sparkles, Layers, DollarSign } from 'lucide-react';
import { BudgetRatios, DEFAULT_BUDGET_RATIOS } from '../types/finance';

interface BudgetRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRatios?: BudgetRatios;
  monthlyIncome: number;
  currencySymbol: string;
  onSave: (newRatios: BudgetRatios) => void;
}

export interface PresetRatio {
  id: string;
  name: string;
  tag?: string;
  description: string;
  ratios: BudgetRatios;
}

export const RATIO_PRESETS: PresetRatio[] = [
  {
    id: 'classic_50_30_20',
    name: '50 / 30 / 20',
    tag: 'Classic Standard',
    description: 'Balanced framework for general financial health & stability.',
    ratios: { needs: 50, wants: 30, savings: 20 },
  },
  {
    id: 'metro_60_20_20',
    name: '60 / 20 / 20',
    tag: 'Urban / High-Rent',
    description: 'Adjusted for higher essential housing and utility costs.',
    ratios: { needs: 60, wants: 20, savings: 20 },
  },
  {
    id: 'fire_50_20_30',
    name: '50 / 20 / 30',
    tag: 'Aggressive Saver',
    description: 'Prioritizes rapid debt payoff, investments, or early retirement.',
    ratios: { needs: 50, wants: 20, savings: 30 },
  },
  {
    id: 'essentials_70_20_10',
    name: '70 / 20 / 10',
    tag: 'Essential Focus',
    description: 'Designed for tighter budgets to guarantee needs are covered.',
    ratios: { needs: 70, wants: 20, savings: 10 },
  },
  {
    id: 'wealth_40_30_30',
    name: '40 / 30 / 30',
    tag: 'Wealth Builder',
    description: 'Optimal for higher income earners keeping fixed overhead low.',
    ratios: { needs: 40, wants: 30, savings: 30 },
  },
];

export const BudgetRatioModal: React.FC<BudgetRatioModalProps> = ({
  isOpen,
  onClose,
  currentRatios,
  monthlyIncome,
  currencySymbol,
  onSave,
}) => {
  const initial = currentRatios || DEFAULT_BUDGET_RATIOS;
  const [needs, setNeeds] = useState(initial.needs);
  const [wants, setWants] = useState(initial.wants);
  const [savings, setSavings] = useState(initial.savings);

  // Sync state if initial changes when modal opens
  useEffect(() => {
    if (isOpen) {
      const active = currentRatios || DEFAULT_BUDGET_RATIOS;
      setNeeds(active.needs);
      setWants(active.wants);
      setSavings(active.savings);
    }
  }, [isOpen, currentRatios]);

  if (!isOpen) return null;

  const total = needs + wants + savings;
  const isValid = total === 100 && needs >= 0 && wants >= 0 && savings >= 0;

  // Check which preset matches
  const matchedPreset = RATIO_PRESETS.find(
    p => p.ratios.needs === needs && p.ratios.wants === wants && p.ratios.savings === savings
  );

  const applyPreset = (preset: PresetRatio) => {
    setNeeds(preset.ratios.needs);
    setWants(preset.ratios.wants);
    setSavings(preset.ratios.savings);
  };

  const handleAutoBalance = () => {
    // Adjust savings to make sum 100
    const remainder = 100 - (needs + wants);
    if (remainder >= 0) {
      setSavings(remainder);
    } else {
      // If needs + wants > 100, proportionally adjust
      const totalNW = needs + wants;
      const newNeeds = Math.round((needs / totalNW) * 80);
      const newWants = Math.round((wants / totalNW) * 20);
      setNeeds(newNeeds);
      setWants(newWants);
      setSavings(100 - (newNeeds + newWants));
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave({ needs, wants, savings });
    onClose();
  };

  const incomeBase = monthlyIncome > 0 ? monthlyIncome : 3500;
  const needsAmount = (incomeBase * (needs / 100));
  const wantsAmount = (incomeBase * (wants / 100));
  const savingsAmount = (incomeBase * (savings / 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Customize Budget Allocation Ratios
              </h2>
              <p className="text-xs text-slate-400">
                Tailor your target percentage split for Needs, Wants, and Savings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Target Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Allocation Proportion</span>
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
              isValid 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              Total: {total}% {isValid ? '(100% Balanced)' : '(Must equal 100%)'}
            </div>
          </div>

          <div className="h-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex shadow-inner">
            <div 
              style={{ width: `${Math.max(0, Math.min(100, needs))}%` }} 
              className="bg-indigo-500 transition-all duration-200" 
              title={`Needs: ${needs}%`}
            />
            <div 
              style={{ width: `${Math.max(0, Math.min(100, wants))}%` }} 
              className="bg-amber-500 transition-all duration-200" 
              title={`Wants: ${wants}%`}
            />
            <div 
              style={{ width: `${Math.max(0, Math.min(100, savings))}%` }} 
              className="bg-emerald-500 transition-all duration-200" 
              title={`Savings: ${savings}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-medium">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Needs: {needs}%
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Wants: {wants}%
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Savings: {savings}%
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Popular Framework Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RATIO_PRESETS.map(preset => {
              const isSelected = matchedPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {preset.tag || preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders & Numerical Inputs */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          
          {/* Needs Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Essential Needs
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {currencySymbol}{needsAmount.toFixed(0)}/mo
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={needs}
                    onChange={e => setNeeds(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-2 top-0.5 text-xs text-slate-500">%</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={needs}
              onChange={e => setNeeds(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Rent/mortgage, utilities, essential groceries, transport, healthcare
            </p>
          </div>

          {/* Wants Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-900">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Discretionary Wants
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {currencySymbol}{wantsAmount.toFixed(0)}/mo
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wants}
                    onChange={e => setWants(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2 top-0.5 text-xs text-slate-500">%</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wants}
              onChange={e => setWants(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Dining out, entertainment, shopping, leisure, personal hobbies
            </p>
          </div>

          {/* Savings Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-900">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Savings & Wealth
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {currencySymbol}{savingsAmount.toFixed(0)}/mo
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={savings}
                    onChange={e => setSavings(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-0.5 text-xs text-slate-500">%</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={savings}
              onChange={e => setSavings(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Emergency fund contributions, milestone savings targets, investments
            </p>
          </div>

        </div>

        {/* Validation Warning & Auto Balance Helper */}
        {!isValid && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Percentages currently total <strong>{total}%</strong>. They must add up to exactly 100%.
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoBalance}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold shrink-0 transition-all cursor-pointer"
            >
              Auto-Balance to 100%
            </button>
          </div>
        )}

        {/* Monthly Dollar Projection Box */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Target dollar split at {currencySymbol}{incomeBase.toFixed(0)}/mo income base:</span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-200 space-x-2">
            <span className="text-indigo-400">{currencySymbol}{needsAmount.toFixed(0)}</span> /
            <span className="text-amber-400"> {currencySymbol}{wantsAmount.toFixed(0)}</span> /
            <span className="text-emerald-400"> {currencySymbol}{savingsAmount.toFixed(0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => applyPreset(RATIO_PRESETS[0])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to 50/30/20</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isValid
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Framework</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
