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
  X,
  DollarSign
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { evaluatePasswordStrength } from '../services/cryptoUtils';
import { User, CurrencyCode } from '../types/finance';
import { CURRENCY_CONFIGS } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
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

  // Password strength evaluation
  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    setError(null);
  }, [mode, email, password]);

  if (!isOpen) return null;

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
        onSuccess(user);
        onClose();
      } else {
        const { user } = await AuthService.register({
          name,
          email,
          password,
          currency,
          monthlyIncome: parseFloat(monthlyIncome) || 3500,
        });
        onSuccess(user);
        onClose();
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
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'signin' ? 'Sign In to ClaritySpend' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'signin' ? 'Access your budget & analytics' : 'Set up your personal budget profile'}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mt-4 flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try Demo Account (Alex Morgan)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 shrink-0">
              or continue with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

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
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
                placeholder={mode === 'register' ? 'Min 8 chars with numbers & letters' : 'Enter your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter for Registration */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 mt-2">
                  <div className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${strength.hasUppercase && strength.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Upper & lower case</span>
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
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
