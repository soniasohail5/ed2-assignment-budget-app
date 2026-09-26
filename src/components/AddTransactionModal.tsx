import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Tag, 
  Calendar, 
  CreditCard, 
  FileText,
  Repeat
} from 'lucide-react';
import { Category, Transaction, PaymentMethod } from '../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currencySymbol: string;
  onSave: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  initialTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  currencySymbol,
  onSave,
  initialTransaction,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [payee, setPayee] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategoryId(initialTransaction.categoryId);
      setPayee(initialTransaction.payee);
      setDate(initialTransaction.date);
      setPaymentMethod(initialTransaction.paymentMethod);
      setNotes(initialTransaction.notes || '');
      setIsRecurring(!!initialTransaction.isRecurring);
      setRecurringFrequency(initialTransaction.recurringFrequency || 'monthly');
    } else {
      setType('expense');
      setAmount('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPayee('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
      setIsRecurring(false);
      setRecurringFrequency('monthly');
    }
  }, [initialTransaction, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    let selectedCatName = 'General';
    if (type === 'income') {
      selectedCatName = 'Income / Deposit';
    } else {
      const cat = categories.find(c => c.id === categoryId);
      if (cat) selectedCatName = cat.name;
    }

    onSave({
      amount: parsedAmount,
      type,
      categoryId: type === 'income' ? 'inc_general' : categoryId,
      categoryName: selectedCatName,
      date,
      payee: payee.trim() || (type === 'income' ? 'Deposit' : 'Merchant'),
      paymentMethod,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <h2 className="text-base font-bold text-white">
            {initialTransaction ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Expense / Income Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-red-400" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="text-slate-500 font-bold text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category (if expense) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  required
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({currencySymbol}{cat.budgetLimit}/mo)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Payee / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {type === 'expense' ? 'Payee / Merchant' : 'Source / Client'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? 'e.g. Whole Foods, Uber, Netflix' : 'e.g. Employer Payroll, Client'}
              value={payee}
              onChange={e => setPayee(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer / ACH</option>
                  <option value="apple_pay">Apple Pay / Google Pay</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recurring Option */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <span>Recurring Subscription or Bill</span>
              </span>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            {isRecurring && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Frequency:</span>
                <select
                  value={recurringFrequency}
                  onChange={e => setRecurringFrequency(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                placeholder="e.g. Split with roomate, tax deductible receipt"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
            >
              {initialTransaction ? 'Save Changes' : type === 'expense' ? 'Add Expense' : 'Add Income'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
