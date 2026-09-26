import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Receipt, 
  Sparkles, 
  Target, 
  PiggyBank, 
  Plus, 
  LogOut, 
  Calendar,
  DollarSign,
  User as UserIcon
} from 'lucide-react';
import { User, CurrencyCode } from '../types/finance';
import { CURRENCY_CONFIGS } from '../services/storageService';

export type NavTab = 'dashboard' | 'analytics' | 'transactions' | 'budgets' | 'recommendations' | 'goals' | 'account';

interface NavbarProps {
  user: User | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onCurrencyChange: (code: CurrencyCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  onOpenAddModal,
  onOpenAuthModal,
  onLogout,
  onCurrencyChange,
}) => {
  // Generate month choices (current month + past 5 months)
  const monthOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      list.push({ value: val, label });
    }
    return list;
  }, []);

  const currentCurrency = user?.currency || 'USD';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ClaritySpend
                </span>
                <span className="hidden sm:block text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
                  Budget & Expense Analytics
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/70">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Transactions
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'budgets'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Budgets
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              Recommendations
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Target className="w-4 h-4" />
              Goals
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'account'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Account
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Month Selector */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                aria-label="Select budget month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency selector */}
            <select
              aria-label="Select display currency"
              value={currentCurrency}
              onChange={e => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              {(Object.keys(CURRENCY_CONFIGS) as CurrencyCode[]).map(code => (
                <option key={code} value={code}>
                  {code} ({CURRENCY_CONFIGS[code].symbol})
                </option>
              ))}
            </select>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('account')}
                  title="Account & Settings"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium group cursor-pointer ${
                    activeTab === 'account'
                      ? 'bg-slate-800 border-emerald-500/50 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] border border-emerald-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">{user.name}</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'transactions' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Transact</span>
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'budgets' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Budgets</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'recommendations' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Advice</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
              activeTab === 'goals' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Goals</span>
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('account')}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md ${
                activeTab === 'account' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Account</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
