import React, { useState } from 'react';
import { 
  User as UserIcon, 
  KeyRound, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  LogOut, 
  Eye, 
  EyeOff, 
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { User, CurrencyCode } from '../types/finance';
import { AuthService } from '../services/authService';
import { StorageService, CURRENCY_CONFIGS } from '../services/storageService';
import { evaluatePasswordStrength } from '../services/cryptoUtils';

interface AccountViewProps {
  user: User;
  currencySymbol: string;
  onUserUpdated: (u: User) => void;
  onLogout: () => void;
  onResetData: () => void;
  onSwitchAccount: () => void;
  onDeleteAccount: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  currencySymbol,
  onUserUpdated,
  onLogout,
  onResetData,
  onSwitchAccount,
  onDeleteAccount,
}) => {
  // Profile edit states
  const [name, setName] = useState(user.name);
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyIncomeTarget.toString());
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Import / Data message
  const [dataMsg, setDataMsg] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(newPassword);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const updated = AuthService.updateUserProfile(user.id, {
        name: name.trim(),
        currency,
        monthlyIncomeTarget: parseFloat(monthlyIncome) || 3500,
      });
      onUserUpdated(updated);
      setProfileMsg('Profile and financial target preferences saved successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    if (strength.score < 2) {
      setPwdMsg({ text: 'Please choose a stronger password with numbers and mixed casing.', isError: true });
      return;
    }

    setIsChangingPwd(true);
    try {
      await AuthService.changePassword(user.id, currentPassword, newPassword);
      setPwdMsg({ text: 'Password successfully updated!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMsg(null), 4000);
    } catch (err: any) {
      setPwdMsg({ text: err.message || 'Current password incorrect.', isError: true });
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportUserDataJSON(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClaritySpend_Account_${user.name.replace(/\s+/g, '_')}_Backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDataMsg('Account backup JSON downloaded successfully!');
    setTimeout(() => setDataMsg(null), 3000);
  };

  const handleExportCSV = () => {
    const csvStr = StorageService.exportTransactionsToCSV(user.id);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClaritySpend_Transactions_${user.email}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDataMsg('All transactions exported to CSV!');
    setTimeout(() => setDataMsg(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const success = StorageService.importUserDataJSON(user.id, text);
      if (success) {
        setDataMsg('Backup restored successfully! Updating views...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setDataMsg('Failed to restore backup. Invalid JSON schema.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllTransactions = () => {
    if (window.confirm('Are you sure you want to clear all transactions? Your categories and budgets will be preserved.')) {
      StorageService.saveTransactions(user.id, []);
      setDataMsg('All transactions cleared.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleDeleteCurrentAccount = () => {
    if (window.confirm(`PERMANENT ACTION: Delete account "${user.email}" and all stored financial data?`)) {
      AuthService.deleteAccount(user.id);
      onDeleteAccount();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      
      {/* Top Banner Profile Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-emerald-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {user.email}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>Display Currency: <strong className="text-slate-300 font-mono">{user.currency} ({currencySymbol})</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onSwitchAccount}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {profileMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{profileMsg}</span>
        </div>
      )}

      {dataMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dataMsg}</span>
        </div>
      )}

      {/* Grid: Profile Details & Preferences (Left) + Password & Data Management (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile & Financial Preferences (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Edit Profile & Financial Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                Profile & Financial Target
              </h2>
              <span className="text-[11px] text-slate-400">Personal Details</span>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Preferred Currency
                  </label>
                  <select
                    aria-label="Select user currency"
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {(Object.keys(CURRENCY_CONFIGS) as CurrencyCode[]).map(code => (
                      <option key={code} value={code}>
                        {code} ({CURRENCY_CONFIGS[code].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly Income Target
                  </label>
                  <div className="relative">
                    <span className="text-slate-500 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={monthlyIncome}
                      onChange={e => setMonthlyIncome(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Data Portability & Backup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              Data & Backup
            </h2>
            <p className="text-xs text-slate-400">
              Download your records anytime or restore an existing backup.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Backup JSON</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Restore Backup</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (window.confirm('Reset this account with sample starter data?')) {
                    onResetData();
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer"
                title="Reset account to realistic demo transactions"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Password Management & Danger Zone (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Change Password Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Update Password
            </h2>

            {pwdMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                pwdMsg.isError 
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}>
                {pwdMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white pr-9 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white pr-9 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Password Helper:</span>
                      <span style={{ color: strength.color }} className="font-semibold">{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1">
                      {[0, 1, 2, 3].map(step => (
                        <div
                          key={step}
                          className="rounded-full h-full"
                          style={{ backgroundColor: step <= strength.score ? strength.color : 'rgba(51, 65, 85, 0.4)' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPwd}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isChangingPwd ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-950/15 border border-red-500/30 rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h2>
            <p className="text-xs text-slate-400">
              Irreversible account operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleClearAllTransactions}
                className="flex-1 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Transactions
              </button>

              <button
                onClick={handleDeleteCurrentAccount}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
