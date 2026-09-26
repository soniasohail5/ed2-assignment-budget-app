import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Repeat,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { Transaction, Category } from '../types/finance';
import { StorageService } from '../services/storageService';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  userId: string;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onTransactionsImported: (imported: Transaction[]) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  currencySymbol,
  userId,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onTransactionsImported,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [notice, setNotice] = useState<string | null>(null);

  // Filtered & Sorted Transactions
  const filtered = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchPayee = tx.payee.toLowerCase().includes(q);
          const matchCat = tx.categoryName.toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchAmount = tx.amount.toString().includes(q);
          if (!matchPayee && !matchCat && !matchNotes && !matchAmount) return false;
        }

        // Type
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

        // Recurring
        if (recurringOnly && !tx.isRecurring) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, recurringOnly, sortBy]);

  // CSV Export handler
  const handleExportCSV = () => {
    const csvContent = StorageService.exportTransactionsToCSV(userId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ClaritySpend_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice('Transactions exported to CSV!');
    setTimeout(() => setNotice(null), 3000);
  };

  // CSV Import handler
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) return;

        const imported: Transaction[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (row.length >= 6) {
            const date = row[1];
            const type = (row[2] === 'income' ? 'income' : 'expense') as 'income' | 'expense';
            const categoryName = row[3] || 'General';
            const payee = row[4] || 'Merchant';
            const amount = parseFloat(row[5]) || 0;
            const paymentMethod = (row[6] || 'credit_card') as any;
            const notes = row[7] || '';
            const isRecurring = row[8] === 'Yes';

            imported.push({
              id: `tx_imported_${Date.now()}_${i}`,
              userId,
              date,
              type,
              categoryId: 'imported',
              categoryName,
              payee,
              amount,
              paymentMethod,
              notes,
              isRecurring,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (imported.length > 0) {
          const combined = [...imported, ...transactions];
          StorageService.saveTransactions(userId, combined);
          onTransactionsImported(combined);
          setNotice(`Imported ${imported.length} transactions successfully!`);
          setTimeout(() => setNotice(null), 3000);
        }
      } catch (err) {
        console.error('CSV import failed:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search, filter, categorize, and export your cashflow records ({transactions.length} total)
          </p>
        </div>

        {/* Actions CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar Controls */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, notes, amount..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'expense' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <select
              aria-label="Filter transactions by category"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              aria-label="Sort transactions by"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="date_desc">Date (Newest first)</option>
              <option value="date_asc">Date (Oldest first)</option>
              <option value="amount_desc">Amount (Highest first)</option>
              <option value="amount_asc">Amount (Lowest first)</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Pill */}
        <div className="flex items-center gap-3 pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={recurringOnly}
              onChange={e => setRecurringOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Recurring bills & subscriptions only</span>
          </label>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Payee / Merchant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                    
                    {/* Payee & Notes */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                            {tx.payee}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                        {tx.categoryName}
                      </span>
                    </td>

                    {/* Date & Recurring */}
                    <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.date}</span>
                        {tx.isRecurring && (
                          <span title={`Recurring: ${tx.recurringFrequency || 'monthly'}`}>
                            <Repeat className="w-3 h-3 text-cyan-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-slate-400 capitalize">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-bold text-sm ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit transaction"
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.payee}"?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Delete transaction"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
