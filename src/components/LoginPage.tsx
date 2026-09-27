import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Mail, 
  User as UserIcon, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  DollarSign,
  PieChart,
  ArrowRight,
  Layers,
  PiggyBank,
  Sliders
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { evaluatePasswordStrength } from '../services/cryptoUtils';
import { User, CurrencyCode } from '../types/finance';
import { CURRENCY_CONFIGS } from '../services/storageService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [monthlyIncome, setMonthlyIncome] = useState('3850');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredAccounts, setRegisteredAccounts] = useState<Pick<User, 'id' | 'email' | 'name' | 'currency' | 'lastLoginAt'>[]>([]);

  // Password strength check
  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    // Load registered accounts on this device for convenient switching
    const accounts = AuthService.getRegisteredAccounts();
    setRegisteredAccounts(accounts);
  }, []);

  useEffect(() => {
    setError(null);
  }, [mode, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { user } = await AuthService.login({
          email,
          password,
          rememberMe,
        });
        onLoginSuccess(user);
      } else {
        const { user } = await AuthService.register({
          name,
          email,
          password,
          currency,
          monthlyIncome: parseFloat(monthlyIncome) || 3500,
        });
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await AuthService.loginDemo();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = (accountEmail: string) => {
    setEmail(accountEmail);
    setMode('signin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar Minimal */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
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
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Two Columns on Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Hero & Feature Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
                <span>Smart Personal Finance</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Master your monthly budget with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">visual clarity</span> and intelligent savings.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Track income and expenses, monitor monthly pacing against your calendar days, examine interactive visual analytics, and receive customized money-saving recommendations.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white">Visual Analytics</h2>
                <p className="text-xs text-slate-400">
                  Interactive donut breakdowns, cumulative spending trajectory, and daily expense activity.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white">Savings Recommendations</h2>
                <p className="text-xs text-slate-400">
                  Dining out analysis, recurring subscription audit, and budget pace optimizations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white">Customizable Budget Splits</h2>
                <p className="text-xs text-slate-400">
                  Set personalized percentage ratios for Needs, Wants, and Savings to match your financial goals.
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Card: Login & Register (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Header & Mode Switcher */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {mode === 'signin' ? 'Sign In to Your Account' : 'Create Free Account'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {mode === 'signin' ? 'Enter your credentials to access your financial dashboard' : 'Set up your personal budget profile'}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === 'signin'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan Lee"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={mode === 'register' ? 'Min 8 chars with numbers & mixed casing' : 'Enter your password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password helper requirements for Registration */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 mt-2">
                        <div className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${strength.hasUppercase && strength.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Upper & lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${strength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>At least 1 number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${strength.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Special symbol</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Display Currency
                      </label>
                      <select
                        aria-label="Select currency for registration"
                        value={currency}
                        onChange={e => setCurrency(e.target.value as CurrencyCode)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {(Object.keys(CURRENCY_CONFIGS) as CurrencyCode[]).map(code => (
                          <option key={code} value={code}>
                            {code} ({CURRENCY_CONFIGS[code].symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Monthly Income Target
                      </label>
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="0"
                          step="50"
                          placeholder="3500"
                          value={monthlyIncome}
                          onChange={e => setMonthlyIncome(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Signing in...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Instant Demo Option */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Instant Demo Account (Alex Morgan)</span>
                </button>

                {/* Registered Accounts list on this device */}
                {registeredAccounts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Accounts on this device:
                    </span>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {registeredAccounts.map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleQuickSwitch(acc.email)}
                          className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300 transition-colors"
                        >
                          <div className="truncate min-w-0">
                            <span className="font-semibold text-white">{acc.name}</span>
                            <span className="text-slate-500 ml-1.5 font-mono text-[11px]">({acc.email})</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 shrink-0 font-medium">Select</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        ClaritySpend • Budget & Expense Analytics
      </footer>
    </div>
  );
};
